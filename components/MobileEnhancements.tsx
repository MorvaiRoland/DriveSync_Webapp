'use client';

import React, { useState } from 'react';
import { Bell, Camera, Download, WifiOff } from 'lucide-react';
import CameraCapture from './CameraCapture';
import NotificationSettings from './NotificationSettings';
import { useNotifications, sendSuccessNotification } from '@/lib/useNotifications';

/**
 * Mobile Enhancements Dashboard
 * Showcases and manages all PWA features
 */
export default function MobileEnhancements() {
  const { sendNotification } = useNotifications();
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  React.useEffect(() => {
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !('MSStream' in window);
    setIsIOS(isIOSDevice);
  }, []);

  const handleTestNotification = async () => {
    setIsTestingNotification(true);
    try {
      await sendSuccessNotification(
        '✅ Notifications Working!',
        'Your PWA is fully functional and can send notifications.'
      );
    } finally {
      setIsTestingNotification(false);
    }
  };

  const handleCameraCapture = async (blob: Blob, fileName: string) => {
    try {
      // In production, this would upload to your backend
      console.log('Photo captured:', fileName, blob.size, 'bytes');
      await sendSuccessNotification(
        '📸 Photo Captured',
        'Your vehicle photo has been saved locally'
      );
    } catch (error) {
      console.error('Error handling capture:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* PWA Features Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          📱 Mobile App Features
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          DynamicSense is now a Progressive Web App with offline support, camera
          integration, and push notifications.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Offline Support */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-start gap-3">
              <WifiOff className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-blue-900 dark:text-blue-200">
                  Offline Support
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                  Access your garage and basic features without internet. Data
                  syncs automatically when online.
                </p>
              </div>
            </div>
          </div>

          {/* Camera Integration */}
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="flex items-start gap-3">
              <Camera className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-purple-900 dark:text-purple-200">
                  Camera Access
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-300 mt-1">
                  Take photos directly from your device camera. Perfect for
                  documenting vehicle conditions.
                </p>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex items-start gap-3">
              <Bell className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-green-900 dark:text-green-200">
                  Push Notifications
                </h3>
                <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                  Get instant alerts for service reminders, fuel prices, and
                  important updates.
                </p>
              </div>
            </div>
          </div>

          {/* Install App */}
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-700">
            <div className="flex items-start gap-3">
              <Download className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-orange-900 dark:text-orange-200">
                  Install as App
                </h3>
                <p className="text-sm text-orange-800 dark:text-orange-300 mt-1">
                  Install DynamicSense on your home screen for quick access.{' '}
                  {isIOS && 'Use Share → Add to Home Screen.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Test */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          📸 Camera Test
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Test the camera functionality by capturing a photo of your vehicle or
          uploading from your device.
        </p>
        <CameraCapture
          onCapture={handleCameraCapture}
          label="📸 Test Camera"
          className="w-full sm:w-auto"
        />
      </div>

      {/* Notifications Test */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          🔔 Notification Test
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Test push notifications by sending yourself a test notification.
        </p>
        <button
          onClick={handleTestNotification}
          disabled={isTestingNotification}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
        >
          {isTestingNotification ? 'Sending...' : '📤 Send Test Notification'}
        </button>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          ⚙️ Notification Settings
        </h3>
        <NotificationSettings />
      </div>

      {/* Browser Compatibility */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-3">
          ℹ️ Browser Compatibility
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="font-bold text-blue-900 dark:text-blue-200">Chrome</p>
            <p className="text-blue-700 dark:text-blue-300">✅ Full Support</p>
          </div>
          <div>
            <p className="font-bold text-blue-900 dark:text-blue-200">Firefox</p>
            <p className="text-blue-700 dark:text-blue-300">✅ Full Support</p>
          </div>
          <div>
            <p className="font-bold text-blue-900 dark:text-blue-200">Safari</p>
            <p className="text-blue-700 dark:text-blue-300">⚠️ Limited</p>
          </div>
          <div>
            <p className="font-bold text-blue-900 dark:text-blue-200">Edge</p>
            <p className="text-blue-700 dark:text-blue-300">✅ Full Support</p>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          🚀 Getting Started
        </h3>
        <ol className="space-y-3 text-slate-700 dark:text-slate-300">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              1
            </span>
            <span>Open the app on your mobile device or desktop browser</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              2
            </span>
            <span>Allow notifications when prompted</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              3
            </span>
            <span>
              Install the app to your home screen for quicker access
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              4
            </span>
            <span>
              Use the camera feature to add photos to your vehicle profile
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}
