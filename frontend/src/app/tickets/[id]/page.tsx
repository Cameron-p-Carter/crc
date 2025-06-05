'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Registration, getRegistration } from '@/services/api';

export default function TicketPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    loadTicket();
  }, [isAuthenticated, params.id, router]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await getRegistration(Number(params.id));

      // Verify the ticket belongs to the logged-in user
      if (data.userId !== user?.id) {
        router.push('/user/registrations');
        return;
      }

      setRegistration(data);
    } catch (err) {
      setError('Failed to load ticket');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading ticket...</p>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error || 'Ticket not found'}
        </div>
        <button
          onClick={() => router.push('/user/registrations')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Registrations
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {registration.event.title}
            </h1>
            <p className="text-gray-600">
              {formatDate(registration.event.startDate)}
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg text-center">
              <p className="text-sm text-blue-600 mb-1">Registration ID</p>
              <p className="text-2xl font-bold text-blue-800">{registration.id}</p>
              <p className="text-sm text-blue-600 mt-2">Show this ID at the event entrance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Ticket Information
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
                Venue
              </h3>
              <p className="text-gray-900">{registration.event.location}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="text-center text-sm text-gray-500">
              <p>Ticket holder: {user?.name}</p>
              <p>Registration Date: {formatDate(registration.registrationDate)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Print Ticket
        </button>
        <button
          onClick={() => router.push('/user/registrations')}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Registrations
        </button>
      </div>
    </div>
  );
}
