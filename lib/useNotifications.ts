import { useEffect, useState, useCallback } from 'react';
import {
  sendLocalNotification,
  requestNotificationPermission,
  isPushNotificationSubscribed,
  NotificationPayload,
} from './notifications';

/**
 * Custom hook for managing notifications in the app
 */
export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      const supported =
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'Notification' in window;
      setIsSupported(supported);

      if (supported) {
        setHasPermission(Notification.permission === 'granted');
        const subscribed = await isPushNotificationSubscribed();
        setIsSubscribed(subscribed);
      }
    };

    checkSupport();
  }, []);

  const requestPermission = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setHasPermission(granted);
    return granted;
  }, []);

  const sendNotification = useCallback(
    async (payload: NotificationPayload) => {
      if (!isSupported) {
        console.warn('Notifications not supported');
        return;
      }

      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          return;
        }
      }

      await sendLocalNotification(payload);
    },
    [isSupported, hasPermission, requestPermission]
  );

  return {
    isSupported,
    isSubscribed,
    hasPermission,
    requestPermission,
    sendNotification,
  };
}

/**
 * Send a reminder notification
 */
export async function sendReminderNotification(
  title: string,
  body: string,
  data?: Record<string, any>
) {
  return sendLocalNotification({
    title,
    body,
    tag: 'reminder',
    requireInteraction: true,
    data,
  });
}

/**
 * Send a success notification
 */
export async function sendSuccessNotification(
  title: string,
  body: string
) {
  return sendLocalNotification({
    title,
    body,
    tag: 'success',
  });
}

/**
 * Send an error notification
 */
export async function sendErrorNotification(
  title: string,
  body: string
) {
  return sendLocalNotification({
    title,
    body,
    tag: 'error',
    requireInteraction: true,
  });
}
