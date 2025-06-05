'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DepositSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Only allow access to own success page
    if (user?.id !== Number(params.id)) {
      router.push(`/wallet/${user?.id}`);
      return;
    }

    // Auto-redirect after 3 seconds
    const timeout = setTimeout(() => {
      router.push(`/wallet/${params.id}?fromSuccess=true`);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, params.id, router, user]);

  if (!isAuthenticated || !user) {
    return null;
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
          Deposit Successful!
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Your funds have been added to your wallet.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => router.push(`/wallet/${params.id}?fromSuccess=true`)}
            className="block w-full px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to Wallet
          </button>

          <button
            onClick={() => router.push('/events')}
            className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Browse Events
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Redirecting back to wallet in a few seconds...
        </p>
      </div>
    </div>
  );
}
