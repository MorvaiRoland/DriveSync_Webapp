'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import confetti from 'canvas-confetti'
import { Check, X, Rocket, Sparkles } from 'lucide-react'

export default function SuccessModal() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Ellenőrizzük, hogy sikeres fizetés után vagyunk-e
    if (searchParams.get('success') === 'true') {
      setIsOpen(true)
      triggerConfetti()
    }
  }, [searchParams])

  const handleClose = () => {
    setIsOpen(false)
    // Eltávolítjuk a query paramétert az URL-ből újratöltés nélkül
    const newUrl = window.location.pathname
    window.history.replaceState({}, '', newUrl)
  }

  const triggerConfetti = () => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      // Konfetti két oldalról
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Sötét háttér elmosással */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />

      {/* Modal Ablak */}
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Dekorációs háttér fény */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-amber-500/20 to-transparent blur-2xl pointer-events-none"></div>

        <div className="relative p-8 text-center">
            
            {/* Ikon */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
                <Rocket className="w-10 h-10 text-white animate-pulse" />
            </div>

            <h2 className="text-3xl font-black text-white mb-2">Gratulálunk! 🚀</h2>
            <p className="text-slate-400 mb-8">
              Sikeresen aktiváltad a prémium tagságodat. A garázsod mostantól szuperképességekkel rendelkezik.
            </p>

            {/* Funkciók lista */}
            <div className="bg-slate-950/50 rounded-2xl p-5 mb-8 border border-white/5 text-left space-y-3">
                <FeatureItem text="Korlátlan számú autó kezelése" />
                <FeatureItem text="AI Szerelő asszisztens (GPT-4o)" />
                <FeatureItem text="Digitális okmánytár" />
                <FeatureItem text="Részletes pénzügyi statisztikák" />
            </div>

            <button 
                onClick={handleClose}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-900 font-bold text-lg shadow-lg shadow-amber-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
                Király, indulás!
            </button>
        </div>

        {/* Bezáró X gomb */}
        <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
        >
            <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

function FeatureItem({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
            </div>
            <span className="text-slate-300 text-sm font-medium">{text}</span>
        </div>
    )
}