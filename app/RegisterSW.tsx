'use client'
import { useEffect } from 'react'

export default function RegisterSW() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' && 
      'serviceWorker' in navigator && 
      process.env.NODE_ENV === 'production'
    ) {
      // Megvárjuk, amíg az oldal teljesen betölt, mielőtt a SW-t elindítjuk
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('✅ SW Regisztrálva:', registration.scope);
          })
          .catch((err) => {
            console.error('❌ SW Hiba:', err);
          });
      });
    }
  }, []);

  return null;
}