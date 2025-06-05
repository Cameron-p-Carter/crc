'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Event } from '@/types/event';
import { getEvent } from '@/services/api';

interface TicketStats {
  type: string;
  sold: number;
  remaining: number;
  revenue: number;
}

export default function ManageEventPage() {
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
      const data = await getEvent(Number(params.id));
      
      // Only allow access if user is the organizer
      if (user?.id !== data.organizerId) {
        router.push(`/events/${data.id}`);
        return;
      }

      setEvent(data);
    } catch (err) {
      setError('Failed to load event');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTicketStats = (): TicketStats[] => {
    if (!event) return [];

    return event.tickets.map(ticket => ({
      type: ticket.type,
      sold: ticket.quantity - ticket.remainingCount,
      remaining: ticket.remainingCount,
      revenue: (ticket.quantity - ticket.remainingCount) * ticket.price
    }));
  };

  const getTotalRevenue = (): number => {
    return calculateTicketStats().reduce((sum, stat) => sum + stat.revenue, 0);
  };

  if (!isAuthenticated || !user || !event || user.id !== event.organizerId) {
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

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded">
        {error}
      </div>
    );
  }

  const ticketStats = calculateTicketStats();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
          <p className="text-gray-600">Event Management Dashboard</p>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => router.push(`/events/${event.id}/edit`)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit Event
          </button>
          <button
            onClick={() => router.push(`/events/${event.id}`)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            View Event Page
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">${getTotalRevenue()}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Registrations</h3>
          <p className="text-3xl font-bold text-blue-600">
            {event.currentCapacity}/{event.maxCapacity}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Status</h3>
          <p className={`text-xl font-semibold ${event.isActive ? 'text-green-600' : 'text-red-600'}`}>
            {event.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Capacity</h3>
          <p className="text-xl font-semibold text-gray-900">
            {((event.currentCapacity / event.maxCapacity) * 100).toFixed(1)}% Full
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Ticket Sales</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ticketStats.map((stat, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.sold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.remaining}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${stat.revenue}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.currentCapacity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.maxCapacity - event.currentCapacity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${getTotalRevenue()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push(`/events/${event.id}/registrations`)}
            className="p-4 border rounded hover:bg-gray-50 text-left"
          >
            <h3 className="font-semibold mb-1">View Registrations</h3>
            <p className="text-sm text-gray-600">
              Manage attendee registrations and check-ins
            </p>
          </button>

          <button
            onClick={() => router.push(`/events/${event.id}/reports`)}
            className="p-4 border rounded hover:bg-gray-50 text-left"
          >
            <h3 className="font-semibold mb-1">Generate Reports</h3>
            <p className="text-sm text-gray-600">
              View detailed reports and analytics
            </p>
          </button>

          <button
            onClick={() => router.push(`/events/${event.id}/notifications`)}
            className="p-4 border rounded hover:bg-gray-50 text-left"
          >
            <h3 className="font-semibold mb-1">Send Notifications</h3>
            <p className="text-sm text-gray-600">
              Communicate with registered attendees
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
