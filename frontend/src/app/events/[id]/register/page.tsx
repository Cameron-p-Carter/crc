'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Event } from '@/types/event';
import { getEvent, createRegistration, getWalletBalance } from '@/services/api';

export default function RegisterEventPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const ticketId = searchParams.get('ticketId');
    if (ticketId) {
      setSelectedTicketId(Number(ticketId));
    }

    loadData();
  }, [isAuthenticated, params.id, router, searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventData, balanceData] = await Promise.all([
        getEvent(Number(params.id)),
        getWalletBalance(user!.id)
      ]);
      
      // Don't allow organizer to register for their own event
      if (user?.id === eventData.organizerId) {
        router.push(`/events/${eventData.id}`);
        return;
      }

      setEvent(eventData);
      setWalletBalance(balanceData.balance);
    } catch (err) {
      setError('Failed to load event');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!selectedTicketId || !event || !user) return;

    const selectedTicket = event.tickets.find(t => t.id === selectedTicketId);
    if (!selectedTicket) {
      setError('Selected ticket not found');
      return;
    }

    if (selectedTicket.remainingCount === 0) {
      setError('This ticket type is sold out');
      return;
    }

    if (walletBalance < selectedTicket.price) {
      const amountNeeded = (selectedTicket.price - walletBalance).toFixed(2);
      router.push(`/wallet/${user.id}?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      setRegistering(true);
      setError('');

      // Create registration
      const registration = await createRegistration({
        userId: user.id,
        eventId: event.id,
        ticketId: selectedTicketId
      });

      // Redirect to registrations page where user can complete payment
      router.push('/user/registrations');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete registration');
    } finally {
      setRegistering(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded">
        {error || 'Event not found'}
      </div>
    );
  }

  const selectedTicket = event.tickets.find(t => t.id === selectedTicketId);
  const insufficientFunds = selectedTicket && walletBalance < selectedTicket.price;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Register for Event</h1>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h2>
          <p className="text-gray-600 mb-4">{event.description}</p>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Select Ticket</h3>
            <div className="space-y-4">
              {event.tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedTicketId === ticket.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-gray-400'
                  } ${ticket.remainingCount === 0 ? 'opacity-50' : ''}`}
                  onClick={() => ticket.remainingCount > 0 && setSelectedTicketId(ticket.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{ticket.type}</h4>
                      {ticket.benefits && (
                        <p className="text-sm text-gray-600">{ticket.benefits}</p>
                      )}
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      ${ticket.price}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {ticket.remainingCount > 0 ? (
                      `${ticket.remainingCount} tickets remaining`
                    ) : (
                      'Sold Out'
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Your wallet balance</span>
            <span>${walletBalance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Ticket price</span>
            <span>
              {selectedTicketId
                ? `$${event.tickets.find(t => t.id === selectedTicketId)?.price || 0}`
                : '---'
              }
            </span>
          </div>
          {insufficientFunds && (
            <div className="flex justify-between text-red-600 text-sm">
              <span>Additional funds needed</span>
              <span>
                ${(selectedTicket.price - walletBalance).toFixed(2)}
              </span>
            </div>
          )}
        </div>
        {insufficientFunds && (
          <button
            onClick={() => router.push(`/wallet/${user.id}?returnUrl=${encodeURIComponent(window.location.pathname)}`)}
            className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Funds to Wallet
          </button>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push(`/events/${event.id}`)}
          className="px-6 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleRegister}
          disabled={!selectedTicketId || registering || insufficientFunds}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {registering ? 'Processing...' : 'Complete Registration'}
        </button>
      </div>
    </div>
  );
}
