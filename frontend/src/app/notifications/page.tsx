'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Notification } from '@/types/notification';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/api';

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    loadNotifications();
  }, [isAuthenticated, router]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await getUserNotifications(user.id);
      setNotifications(data);
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRead = async (notification: Notification) => {
    try {
      const updatedNotification = await markNotificationAsRead(notification.id);
      setNotifications(notifications.map(n => 
        n.id === updatedNotification.id ? updatedNotification : n
      ));
    } catch (err) {
      setError('Failed to update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      setError('Failed to mark all notifications as read');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No Notifications
          </h3>
          <p className="text-gray-600">
            You don't have any notifications at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow p-4 transition-colors ${
                notification.isRead ? 'opacity-75' : 'border-l-4 border-blue-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {notification.title}
                  </h3>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleRead(notification)}
                  className={`px-3 py-1 rounded text-sm ${
                    notification.isRead
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  {notification.isRead ? 'Mark as unread' : 'Mark as read'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
