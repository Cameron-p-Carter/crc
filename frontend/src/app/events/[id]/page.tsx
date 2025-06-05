'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Event } from '@/types/event';
import { getEvent } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    loadEvent();
  }, [isAuthenticated, params.id, router]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getEvent(Number(params.id));
      setEvent(data);
    } catch (err) {
      setError('Failed to load event details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return null; // Page will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded">
        {error || 'Event not found'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {event.category.replace(/_/g, ' ')}
              </span>
            </div>
            {user?.role === 'ORGANIZER' && user.id === event.organizerId && (
              <div className="space-x-2">
                <button
                  onClick={() => router.push(`/events/${event.id}/edit`)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit Event
                </button>
                <button
                  onClick={() => router.push(`/events/${event.id}/manage`)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Manage Event
                </button>
              </div>
            )}
          </div>

          <div className="prose max-w-none mb-6">
            <p>{event.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Date & Time</h3>
                <div className="text-gray-600">
                  <p>Start: {formatDate(event.startDate)}</p>
                  <p>End: {formatDate(event.endDate)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Location</h3>
                <p className="text-gray-600">{event.location}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Organizer</h3>
                <p className="text-gray-600">{event.organizer.name}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Available Tickets</h3>
              <div className="space-y-4">
                {event.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold">{ticket.type}</span>
                      <span className="text-lg font-bold text-blue-600">
                        ${ticket.price}
                      </span>
                    </div>
                    {ticket.benefits && (
                      <p className="text-sm text-gray-600 mb-2">{ticket.benefits}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {ticket.remainingCount} remaining
                      </span>
                      <button
                        onClick={() => router.push(`/events/${event.id}/register?ticketId=${ticket.id}`)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                        disabled={ticket.remainingCount === 0}
                      >
                        {ticket.remainingCount === 0 ? 'Sold Out' : 'Register'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div>
                Capacity: {event.currentCapacity}/{event.maxCapacity}
              </div>
              <div>
                Status: {event.isActive ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-red-600">Inactive</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
