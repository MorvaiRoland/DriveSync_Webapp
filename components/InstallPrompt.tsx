'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { X, Download, Share, PlusSquare } from 'lucide-react'

export default function InstallPrompt() {
  const pathname = usePathname()
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // 1. Csak a főoldalon mutassuk
    if (pathname !== '/') return

    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(isInStandaloneMode)

    // DEBUG: Nézzük meg a konzolban, mi történik
    console.log("PWA Státusz:", { isInStandaloneMode })

    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIosDevice)

    // ANDROID / CHROME LOGIKA
    const handleBeforeInstallPrompt = (e: any) => {
      console.log("✅ beforeinstallprompt elkapva!")
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Ellenőrizzük, hogy nem tiltotta-e le végleg (tesztelés alatt töröld a localStorage-t!)
      const dismissed = localStorage.getItem('installPromptDismissed')
      if (!dismissed) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // iOS LOGIKA
    if (isIosDevice && !isInStandaloneMode) {
      const dismissed = localStorage.getItem('installPromptDismissed')
      if (!dismissed) {
        const timer = setTimeout(() => setShowPrompt(true), 3000)
        return () => clearTimeout(timer)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [pathname])

  const handleClose = () => {
    setShowPrompt(false)
    // TESZTELÉSHEZ: Ne állítsd true-ra, vagy töröld gyakran a localStorage-t
    localStorage.setItem('installPromptDismissed', 'true')
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
        console.log("❌ Nincs deferredPrompt!");
        return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`Telepítés eredménye: ${outcome}`)
    
    if (outcome === 'accepted') {
      setShowPrompt(false)
      localStorage.setItem('installPromptDismissed', 'true')
    }
    setDeferredPrompt(null)
  }

  if (pathname !== '/' || !showPrompt || isStandalone) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={handleClose} />
      
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-sm pointer-events-auto border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-10">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
            <div className="text-4xl">🚀</div>
            <h3 className="text-xl font-bold dark:text-white">DynamicSense App</h3>
            <p className="text-sm text-slate-500">Telepítsd a kezdőképernyőre a teljes élményhez!</p>

            {isIOS ? (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-left space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                        <Share className="w-5 h-5 text-blue-500" />
                        <span>Koppints a <b>Megosztás</b> gombra</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <PlusSquare className="w-5 h-5 text-slate-500" />
                        <span>Válaszd a <b>Főképernyőhöz adás</b>-t</span>
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleInstallClick}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all"
                >
                    Telepítés most
                </button>
            )}
        </div>
      </div>
    </div>
  )
}