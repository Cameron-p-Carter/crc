'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Registration, getUserRegistrations, getWalletBalance, createPayment } from '@/services/api';

export default function UserRegistrationsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    loadData();
  }, [isAuthenticated, router]);

  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const [registrationsData, balanceData] = await Promise.all([
        getUserRegistrations(user.id),
        getWalletBalance(user.id)
      ]);
      setRegistrations(registrationsData);
      setWalletBalance(balanceData.balance);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (registration: Registration) => {
    if (!user) return;

    if (walletBalance < registration.ticket.price) {
      const amountNeeded = (registration.ticket.price - walletBalance).toFixed(2);
      router.push(`/wallet/${user.id}?returnUrl=${encodeURIComponent('/user/registrations')}`);
      return;
    }

    try {
      setProcessing(registration.id);
      await createPayment({ registrationId: registration.id });
      await loadData(); // Refresh data after payment
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your registrations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Registrations</h1>
        <div className="text-right">
          <p className="text-sm text-gray-600">Wallet Balance</p>
          <p className="text-xl font-bold text-blue-600">${walletBalance.toFixed(2)}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {registrations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No Registrations Found
          </h3>
          <p className="text-gray-600 mb-6">
            You haven't registered for any events yet.
          </p>
          <button
            onClick={() => router.push('/events')}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Browse Events
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {registrations.map((registration) => (
            <div
              key={registration.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {registration.event.title}
                    </h2>
                    <p className="text-gray-600">
                      {formatDate(registration.event.startDate)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      registration.status
                    )}`}
                  >
                    {registration.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Ticket Details
                    </h3>
                    <p className="font-medium text-gray-900">
                      {registration.ticket.type}
                    </p>
                    <p className="text-gray-600">${registration.ticket.price}</p>
                    {registration.ticket.benefits && (
                      <p className="text-sm text-gray-500 mt-1">
                        {registration.ticket.benefits}
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Payment Information
                    </h3>
                    {registration.payment ? (
                      <>
                        <p className="font-medium text-gray-900">
                          Status: {registration.payment.status}
                        </p>
                        <p className="text-gray-600">
                          Date: {formatDate(registration.payment.paymentDate)}
                        </p>
                      </>
                    ) : registration.status === 'PENDING' ? (
                      <div className="space-y-2">
                        <p className="text-gray-600">Payment required</p>
                        {walletBalance < registration.ticket.price && (
                          <p className="text-sm text-red-600">
                            Insufficient funds. Add ${(registration.ticket.price - walletBalance).toFixed(2)} more to your wallet.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-600">No payment information</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => router.push(`/events/${registration.event.id}`)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    View Event
                  </button>
                  {registration.status === 'APPROVED' && (
                    <button
                      onClick={() => router.push(`/tickets/${registration.id}`)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      View Ticket
                    </button>
                  )}
                  {registration.status === 'PENDING' && (
                    <button
                      onClick={() => handlePayment(registration)}
                      disabled={processing === registration.id || walletBalance < registration.ticket.price}
                      className={`px-4 py-2 rounded ${
                        walletBalance < registration.ticket.price
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      } disabled:bg-gray-300`}
                    >
                      {processing === registration.id
                        ? 'Processing...'
                        : walletBalance < registration.ticket.price
                        ? 'Add Funds'
                        : 'Pay Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
