'use client';

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return;
    }

    // ❗ Ha már van aktív SW, nem regisztrálunk újra
    if (navigator.serviceWorker.controller) return;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('✅ Service Worker aktív:', reg.scope);
      })
      .catch(console.error);
  }, []);

  return null;
}
