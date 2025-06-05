'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Event, EventCategory, UpdateEventRequest } from '@/types/event';
import { getEvent, updateEvent } from '@/services/api';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);

  const [formData, setFormData] = useState<UpdateEventRequest>({
    title: '',
    description: '',
    category: EventCategory.CONFERENCE,
    startDate: '',
    endDate: '',
    location: '',
    maxCapacity: 0,
    isActive: true
  });

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
      setEvent(data);

      // Only allow editing if user is the organizer
      if (user?.id !== data.organizerId) {
        router.push(`/events/${data.id}`);
        return;
      }

      // Format dates for datetime-local input
      const formatDate = (date: string) => {
        return new Date(date).toISOString().slice(0, 16);
      };

      setFormData({
        title: data.title,
        description: data.description,
        category: data.category,
        startDate: formatDate(data.startDate),
        endDate: formatDate(data.endDate),
        location: data.location,
        maxCapacity: data.maxCapacity,
        isActive: data.isActive
      });
    } catch (err) {
      setError('Failed to load event');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (new Date(formData.startDate!) >= new Date(formData.endDate!)) {
        throw new Error('End date must be after start date');
      }

      await updateEvent(Number(params.id), formData);
      router.push(`/events/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || !user || !event || user.id !== event.organizerId) {
    return null;
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading event...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Event</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                required
                rows={4}
                className="w-full p-2 border rounded"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                required
                className="w-full p-2 border rounded"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
              >
                {Object.values(EventCategory).map((category) => (
                  <option key={category} value={category}>
                    {category.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full p-2 border rounded"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full p-2 border rounded"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Capacity
              </label>
              <input
                type="number"
                required
                min={event.currentCapacity}
                className="w-full p-2 border rounded"
                value={formData.maxCapacity || ''}
                onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
              />
              <p className="mt-1 text-sm text-gray-500">
                Current registrations: {event.currentCapacity}
              </p>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span className="text-sm font-medium text-gray-700">Event is active</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push(`/events/${params.id}`)}
            className="px-6 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
