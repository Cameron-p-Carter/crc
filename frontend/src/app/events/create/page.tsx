'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { EventCategory, TicketType, CreateEventRequest } from '@/types/event';
import { createEvent } from '@/services/api';

interface TicketForm {
  type: TicketType;
  price: number;
  quantity: number;
  benefits?: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Omit<CreateEventRequest, 'organizerId'>>({
    title: '',
    description: '',
    category: EventCategory.CONFERENCE,
    startDate: '',
    endDate: '',
    location: '',
    maxCapacity: 0,
    tickets: []
  });

  const [ticketForm, setTicketForm] = useState<TicketForm>({
    type: TicketType.GENERAL,
    price: 0,
    quantity: 0,
    benefits: ''
  });

  if (!isAuthenticated || user?.role !== 'ORGANIZER') {
    router.push('/events');
    return null;
  }

  const addTicket = () => {
    if (ticketForm.price <= 0 || ticketForm.quantity <= 0) {
      setError('Ticket price and quantity must be greater than 0');
      return;
    }

    setFormData({
      ...formData,
      tickets: [...formData.tickets, { ...ticketForm }]
    });

    setTicketForm({
      type: TicketType.GENERAL,
      price: 0,
      quantity: 0,
      benefits: ''
    });
  };

  const removeTicket = (index: number) => {
    setFormData({
      ...formData,
      tickets: formData.tickets.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formData.tickets.length === 0) {
        throw new Error('At least one ticket type is required');
      }

      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        throw new Error('End date must be after start date');
      }

      const totalTickets = formData.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
      if (totalTickets > formData.maxCapacity) {
        throw new Error('Total tickets cannot exceed maximum capacity');
      }

      const eventData: CreateEventRequest = {
        ...formData,
        organizerId: user.id
      };

      await createEvent(eventData);
      router.push('/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Event</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Event Details</h2>
          
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
                min="1"
                className="w-full p-2 border rounded"
                value={formData.maxCapacity || ''}
                onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tickets</h2>
          
          <div className="space-y-4">
            {formData.tickets.map((ticket, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <p className="font-semibold">{ticket.type}</p>
                  <p className="text-sm text-gray-600">
                    ${ticket.price} - {ticket.quantity} tickets
                  </p>
                  {ticket.benefits && (
                    <p className="text-sm text-gray-500">{ticket.benefits}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeTicket(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ticket Type
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={ticketForm.type}
                  onChange={(e) => setTicketForm({ ...ticketForm, type: e.target.value as TicketType })}
                >
                  {Object.values(TicketType).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full p-2 border rounded"
                  value={ticketForm.price || ''}
                  onChange={(e) => setTicketForm({ ...ticketForm, price: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border rounded"
                  value={ticketForm.quantity || ''}
                  onChange={(e) => setTicketForm({ ...ticketForm, quantity: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Benefits (optional)
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={ticketForm.benefits || ''}
                  onChange={(e) => setTicketForm({ ...ticketForm, benefits: e.target.value })}
                  placeholder="e.g., VIP seating, meet & greet"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={addTicket}
              className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Add Ticket Type
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/events')}
            className="px-6 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
