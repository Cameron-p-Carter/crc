'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomeContent() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'ORGANIZER') {
        router.push('/organizer/dashboard');
      } else {
        router.push('/events');
      }
    } else {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Event Manager
        </h1>
        <p className="text-gray-600 mb-8">
          Redirecting you to the appropriate page...
        </p>
      </div>
    </div>
  );
}
