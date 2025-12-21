'use client';

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !('MSStream' in window);
    setIsIOS(isIOSDevice);

    // Check if app is already installed
    const isAppInstalled =
      (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) ||
      (window.navigator as any).standalone === true;

    if (isAppInstalled) {
      return;
    }

    // --- SEGÉDFÜGGVÉNY: Ellenőrizzük, hogy elrejtette-e a felhasználó ---
    const shouldShowPrompt = () => {
      const hideUntil = localStorage.getItem('pwa-install-hide-until');
      if (hideUntil && new Date(hideUntil) > new Date()) {
        return false;
      }
      return true;
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // JAVÍTÁS: Csak akkor mutatjuk, ha a felhasználó nem tiltotta le
      if (shouldShowPrompt()) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS esetében (ahol nincs beforeinstallprompt), külön kell ellenőrizni
    if (isIOSDevice && shouldShowPrompt()) {
         // Itt lehet egy kis késleltetést tenni, vagy csak akkor mutatni, ha interakció van
         // De a jelenlegi logikád szerint iOS-en ez a rész most nem állítja true-ra a visibility-t automatikusan
         // Ha azt akarod, hogy iOS-en is megjelenjen, itt kell setIsVisible(true)-t hívni.
         // A biztonság kedvéért:
         // setTimeout(() => setIsVisible(true), 2000); 
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsVisible(false);
        localStorage.removeItem('pwa-install-hide-until');
      }
    } catch (error) {
      console.error('Error installing app:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Elrejtés 7 napra (vagy amennyire szeretnéd)
    const hideUntil = new Date();
    hideUntil.setDate(hideUntil.getDate() + 7);
    localStorage.setItem('pwa-install-hide-until', hideUntil.toISOString());
  };

  if (!isVisible || (!deferredPrompt && !isIOS)) {
    return null;
  }

  // ... A renderelési rész (JSX) változatlan maradhat, de bemásolom a teljesség kedvéért ...

  if (isIOS) {
    return (
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 z-40 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <Download className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              Add DynamicSense to Home Screen
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Tap the Share button, then "Add to Home Screen" for quick access.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 z-40 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="flex-1">
          <p className="font-bold text-slate-900 dark:text-white text-sm">
            Install DynamicSense
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Get instant access to your vehicle data on any device.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white text-xs font-bold rounded-lg transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}