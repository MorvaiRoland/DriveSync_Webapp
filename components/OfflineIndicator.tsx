'use client'

import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Kezdeti állapot ellenőrzése
    setIsOffline(!navigator.onLine)

    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => {
      setIsOffline(true)
      // Haptic feedback, ha elmegy a net (csak mobilon)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 50, 50])
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-300 md:bottom-6 md:left-auto md:right-6 md:w-auto">
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 shadow-lg backdrop-blur-md dark:border-red-900/50 dark:bg-red-900/80 dark:text-red-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-800">
          <WifiOff className="h-4 w-4 animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-bold">Nincs internetkapcsolat</p>
          <p className="text-xs opacity-80">Offline módban vagy. Az adatok mentése a kapcsolat helyreállásakor történik.</p>
        </div>
      </div>
    </div>
  )
}