'use client';

import { Event } from '@/types/event';
import { useRouter } from 'next/navigation';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLowestPrice = () => {
    if (!event.tickets.length) return 'No tickets';
    const lowestPrice = Math.min(...event.tickets.map(ticket => ticket.price));
    return `From $${lowestPrice}`;
  };

  const getRemainingTickets = () => {
    const total = event.tickets.reduce((sum, ticket) => sum + ticket.remainingCount, 0);
    return total > 0 ? `${total} tickets left` : 'Sold out';
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => router.push(`/events/${event.id}`)}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {event.title}
          </h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
            {event.category.replace(/_/g, ' ')}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(event.startDate)}</span>
          </div>

          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{event.location}</span>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center pt-4 border-t">
          <span className="text-lg font-semibold text-blue-600">
            {getLowestPrice()}
          </span>
          <span className={`text-sm ${event.tickets.some(t => t.remainingCount > 0) ? 'text-green-600' : 'text-red-600'}`}>
            {getRemainingTickets()}
          </span>
        </div>

        <div className="mt-2 text-sm text-gray-500">
          Organized by: {event.organizer.name}
        </div>
      </div>
    </div>
  );
}
