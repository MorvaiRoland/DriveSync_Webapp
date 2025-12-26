'use client'
import { useEffect } from 'react'

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Csak production módban futtatjuk
      if (process.env.NODE_ENV !== 'production') return;

      const loadSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('✅ SW Registered');

          // Ha frissítés várakozik
          if (registration.waiting) {
             registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) return;
            
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Új tartalom elérhető - de NEM reloadolunk agresszívan azonnal,
                  // hogy ne szakítsuk meg a felhasználó munkáját.
                  // A következő megnyitásnál már az új verzió lesz.
                  console.log('🔄 New content available');
                }
              }
            };
          };
        } catch (error) {
          console.error('❌ SW Registration failed:', error);
        }
      };

      loadSW();
    }
  }, []);

  return null;
}