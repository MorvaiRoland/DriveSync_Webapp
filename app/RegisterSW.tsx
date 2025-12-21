'use client'

import { useEffect } from 'react'

export default function RegisterSW() {
  useEffect(() => {
    // Only run on client side and if browser supports service workers
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {

      // Register the next-pwa generated service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ PWA Service Worker registered:', registration.scope)

          // Check for updates periodically
          setInterval(() => {
            registration.update()
          }, 60000) // Check every minute
        })
        .catch((err) => {
          console.error('❌ PWA Service Worker error:', err)
        })

      // Also register our custom service worker for enhanced offline support
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Enhanced Service Worker registered:', registration.scope)
        })
        .catch((err) => {
          console.error('❌ Enhanced Service Worker error:', err)
        })

      // Listen for controller change (when new SW is activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('✅ Service Worker updated and activated')
      })
    }
  }, [])

  return null // Invisible component, renders nothing
}
