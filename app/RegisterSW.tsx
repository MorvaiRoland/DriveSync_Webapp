'use client'

import { useEffect } from 'react'

export default function RegisterSW() {
  useEffect(() => {
    // Csak kliens oldalon futtatjuk, és ha a böngésző támogatja
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      
      // Regisztráljuk a public mappában lévő sw.js fájlt
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ PWA Service Worker sikeresen regisztrálva:', registration.scope)
        })
        .catch((err) => {
          console.error('❌ PWA Service Worker hiba:', err)
        })
    }
  }, [])

  return null // Ez egy láthatatlan komponens, nem renderel semmit
}