'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation' // <--- FONTOS IMPORT
import { X, Download, Share, PlusSquare } from 'lucide-react'

export default function InstallPrompt() {
  const pathname = usePathname() // <--- Lekérjük az aktuális útvonalat
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // 1. ELŐSZÖR IS: Ha nem a főoldalon vagyunk, ne csináljunk semmit!
    if (pathname !== '/') {
        return
    }

    // 2. Ellenőrizzük, hogy már telepítve van-e (standalone)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(isInStandaloneMode)

    // 3. Ellenőrizzük, hogy a felhasználó bezárta-e már korábban
    const hasUserDismissed = localStorage.getItem('installPromptDismissed')

    // Ha telepítve van VAGY a felhasználó már bezárta, akkor kilépünk
    if (isInStandaloneMode || hasUserDismissed) {
      return
    }

    // 4. iOS detektálás
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIosDevice)

    // 5. Android/PC eseményfigyelő
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // 6. iOS logika (késleltetett megjelenés)
    if (isIosDevice) {
      const timer = setTimeout(() => setShowPrompt(true), 2000)
      return () => clearTimeout(timer)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [pathname]) // <--- A pathname változására is lefut (bár a return miatt biztonságos)

  // Bezárás kezelése (elmentjük, hogy ne jöjjön elő többet)
  const handleClose = () => {
    setShowPrompt(false)
    localStorage.setItem('installPromptDismissed', 'true')
  }

  // Telepítés gomb (Android/PC)
  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowPrompt(false)
      localStorage.setItem('installPromptDismissed', 'true')
    }
    setDeferredPrompt(null)
  }

  // VÉGSŐ RENDER FELTÉTEL:
  // Ha nem a főoldalon vagyunk, VAGY nem kell mutatni, VAGY telepítve van -> NULL
  if (pathname !== '/' || !showPrompt || isStandalone) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center pointer-events-none p-4">
      {/* Háttér sötétítés */}
      <div className="absolute inset-0 bg-black/50 pointer-events-auto backdrop-blur-sm" onClick={handleClose} />

      {/* Modal Doboz */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-300 border border-slate-100 dark:border-slate-800">
        
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-inner">
                <span className="text-3xl">🚗</span> 
            </div>
            
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Telepítsd az Appot!
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    Add hozzá a főképernyőhöz a gyorsabb működésért.
                </p>
            </div>

            {isIOS ? (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-sm w-full text-left space-y-3 border border-slate-100 dark:border-slate-700">
                    <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        Így telepítheted iOS-en:
                    </p>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <Share className="w-5 h-5 text-blue-500" />
                        <span>1. Koppints a <b>Megosztás</b> gombra</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <PlusSquare className="w-5 h-5 text-slate-500" />
                        <span>2. Válaszd a <b>Főképernyőhöz adás</b> opciót</span>
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleInstallClick}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-black/10"
                >
                    <Download className="w-4 h-4" />
                    Telepítés
                </button>
            )}
        </div>
      </div>
    </div>
  )
}