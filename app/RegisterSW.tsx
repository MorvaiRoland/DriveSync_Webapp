'use client'
import { useEffect } from 'react'

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      
      // 1. TAKARÍTÁS: Töröljük a beragadt "másik" service workert, ami a konfliktust okozta
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          // Ha találunk olyan SW-t, ami NEM a hivatalos next-pwa sw.js, azt töröljük
          if (registration.active && !registration.active.scriptURL.includes('sw.js')) {
            console.log('🗑️ Régi/Konfliktusos SW törlése:', registration.scope);
            registration.unregister();
          }
        }
      });

      // 2. REGISZTRÁCIÓ: Csak az egyetlen, hivatalos sw.js-t regisztráljuk
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ PWA Service Worker regisztrálva:', registration.scope);

          // Ha frissítés várakozik, kényszerítjük az aktiválást
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          // Figyeljük, ha új verzió érkezik a szerverről
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) return;

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Új verzió települt -> Console log
                  console.log('🔄 Új verzió érhető el - Frissítés folyamatban...');
                  // Itt még nem töltünk újra, megvárjuk a controllerchange eseményt
                }
              }
            };
          };
        })
        .catch((err) => {
          console.error('❌ Service Worker hiba:', err);
        });

      // 3. AUTOMATIKUS FRISSÍTÉS (A Fehér Képernyő Ellenszere)
      // Ez a változó megakadályozza, hogy végtelen ciklusba kerüljön a frissítés
      let refreshing = false;

      // Amint az új Service Worker átveszi az irányítást (controllerchange),
      // újratöltjük az oldalt, hogy a felhasználó azonnal az új verziót lássa,
      // és ne a törött, régi cache-t.
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  return null;
}