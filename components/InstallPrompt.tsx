'use client'

import { useState, useEffect } from 'react'
import { X, Download, Share, PlusSquare } from 'lucide-react'

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // 1. Ellenőrizzük, hogy már telepítve van-e az app
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

    // 2. iOS detektálás (mert ott másképp kell)
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIosDevice)

    // 3. Android/PC eseményfigyelő
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault() // Megakadályozzuk a böngésző alap ablakát (hogy mi irányítsunk)
      setDeferredPrompt(e)
      // Csak akkor mutatjuk, ha még nincs telepítve
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Ha iOS és nincs telepítve, mutassuk a modalt (kicsit később, hogy ne legyen zavaró)
    if (isIosDevice && !window.matchMedia('(display-mode: standalone)').matches) {
       setTimeout(() => setShowPrompt(true), 1000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Telepítés gomb kezelése (Android/PC)
  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  // Ha már telepítve van, vagy bezárták, ne mutassunk semmit
  if (!showPrompt || isStandalone) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none p-4">
      {/* Háttér sötétítés */}
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={() => setShowPrompt(false)} />

      {/* Modal Doboz */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-300">
        
        <button 
          onClick={() => setShowPrompt(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-inner">
                {/* Ide jöhet a logód */}
                <span className="text-2xl">🚗</span> 
            </div>
            
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Telepítsd az Appot!
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    A gyorsabb működés és a teljes képernyős élmény érdekében add hozzá a főképernyődhöz.
                </p>
            </div>

            {/* iOS INSTRUKCIÓK */}
            {isIOS ? (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-sm w-full text-left space-y-3">
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
                /* ANDROID / PC GOMB */
                <button
                    onClick={handleInstallClick}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
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