'use client';
import { useEffect } from 'react';

export default function ServiceWorkerKiller() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for (let registration of registrations) {
          console.log('💀 Service Worker Kényszerített Törlése:', registration.scope);
          registration.unregister();
        }
      });
      
      // Töröljük a Cache-eket is, hogy tiszta lappal induljunk
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }
    }
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white p-4 text-center z-[9999] font-bold">
      ⚠️ VÉSZHELYZETI MÓD: Minden PWA gyorsítótár törölve. Kérlek frissítsd az oldalt!
    </div>
  );
}