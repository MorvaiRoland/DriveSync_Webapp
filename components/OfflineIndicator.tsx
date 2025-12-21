'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      // Auto-hide notification after 3 seconds
      setTimeout(() => setWasOffline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    if (wasOffline) {
      return (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 rounded-lg px-4 py-3 flex items-center gap-3 z-50 animate-in slide-in-from-top-2 duration-300">
          <Wifi className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Back Online</p>
            <p className="text-xs opacity-90">Syncing your data...</p>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 rounded-lg px-4 py-3 flex items-center gap-3 z-50 animate-in slide-in-from-top-2 duration-300">
      <WifiOff className="w-5 h-5 flex-shrink-0 animate-pulse" />
      <div>
        <p className="font-bold text-sm">You're Offline</p>
        <p className="text-xs opacity-90">Changes will sync when you reconnect</p>
      </div>
    </div>
  );
}
