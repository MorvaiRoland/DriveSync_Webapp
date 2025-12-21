'use client';

import React, { useEffect, useState } from 'react';
import { Bell, AlertCircle } from 'lucide-react';
import {
  requestNotificationPermission,
  isPushNotificationSubscribed,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from '@/lib/notifications';

export default function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSupport = async () => {
      const supported =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;
      setIsSupported(supported);

      if (supported) {
        const subscribed = await isPushNotificationSubscribed();
        setIsSubscribed(subscribed);
      }
    };

    checkSupport();
  }, []);

  const handleToggleNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isSubscribed) {
        const success = await unsubscribeFromPushNotifications();
        if (success) {
          setIsSubscribed(false);
        } else {
          setError('Failed to unsubscribe');
        }
      } else {
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
          setError('Notification permission denied');
          setIsLoading(false);
          return;
        }

        // For now, we'll just enable local notifications
        // Server-side VAPID key would be needed for push notifications
        setIsSubscribed(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Notifications not supported
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Your browser doesn't support push notifications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              Push Notifications
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isSubscribed
                ? 'Notifications enabled'
                : 'Get alerts for important updates'}
            </p>
          </div>
        </div>
        <button
          onClick={handleToggleNotifications}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            isSubscribed
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? 'Loading...' : isSubscribed ? 'Disable' : 'Enable'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          💡 You'll receive notifications for service reminders, fuel prices, and
          important updates.
        </p>
      </div>
    </div>
  );
}
