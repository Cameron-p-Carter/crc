'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Event } from '@/types/event';
import { getEvent } from '@/services/api';

export default function RegistrationSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Registration Successful!
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          {event ? (
            <>
              You have successfully registered for <span className="font-semibold">{event.title}</span>.
              A confirmation has been sent to your email.
            </>
          ) : (
            'Your registration has been confirmed.'
          )}
        </p>

        <div className="space-y-4">
          <button
            onClick={() => router.push('/events')}
            className="block w-full px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Browse More Events
          </button>

          <button
            onClick={() => router.push('/user/registrations')}
            className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            View My Registrations
          </button>
        </div>
      </div>
    </div>
  );
}
