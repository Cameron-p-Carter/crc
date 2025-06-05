'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/user';
import { getUserNotifications } from '@/services/api';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotifications();
    }
  }, [isAuthenticated, user]);

  const loadNotifications = async () => {
    try {
      const notifications = await getUserNotifications(user!.id);
      const unread = notifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to load notifications');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <button 
                onClick={() => router.push('/')}
                className="text-xl font-bold text-gray-800"
              >
                Event Manager
              </button>
            </div>
            {isAuthenticated && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => router.push('/events')}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  Events
                </button>
                {user?.role === UserRole.ORGANIZER && (
                  <button
                    onClick={() => router.push('/organizer/dashboard')}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
                  >
                    Dashboard
                  </button>
                )}
                <button
                  onClick={() => router.push('/user/registrations')}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  My Tickets
                </button>
                <button
                  onClick={() => router.push(`/wallet/${user?.id}`)}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md flex items-center"
                >
                  <span>Wallet</span>
                  {user?.walletBalance !== undefined && (
                    <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">
                      ${user.walletBalance.toFixed(2)}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => router.push('/notifications')}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md flex items-center"
                >
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/auth/register')}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
