'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import confetti from 'canvas-confetti'
import { Check, X, Rocket, Sparkles } from 'lucide-react'

// Külön komponens a logikához (hogy a Suspense működjön)
function SuccessContent() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Ha a success paraméter true, VAGY ha a /payment-success oldalon vagyunk
    if (searchParams.get('success') === 'true' || pathname === '/payment-success') {
      setIsOpen(true)
      triggerConfetti()
      
      // Ha query paraméter volt, tisztítsuk meg az URL-t, hogy ne maradjon ott
      if (searchParams.get('success')) {
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [searchParams, pathname])

  const handleClose = () => {
    setIsOpen(false)
    // Ha a payment-success oldalon vagyunk, vigyük vissza a főoldalra
    if (pathname === '/payment-success') {
        router.push('/')
    }
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
      
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Sötét háttér elmosással */}
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md transition-opacity" 
        onClick={handleClose}
      />

      {/* Modal Ablak */}
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/30 rounded-[2rem] shadow-[0_0_80px_rgba(245,158,11,0.3)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* Dekorációs háttér fény */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-48 bg-gradient-to-b from-amber-500/20 to-transparent blur-3xl pointer-events-none"></div>

        <div className="relative p-8 text-center flex flex-col items-center">
            
            {/* Ikon */}
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-amber-500/30 border-4 border-slate-900 z-10 relative">
                <Rocket className="w-12 h-12 text-white animate-bounce-slow" strokeWidth={2.5} />
                <div className="absolute -top-2 -right-2 bg-white text-slate-900 p-1.5 rounded-full shadow-lg animate-pulse">
                    <Sparkles className="w-4 h-4 fill-current" />
                </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">Gratulálunk! <span className="text-amber-500">🚀</span></h2>
            <p className="text-slate-400 mb-8 font-medium leading-relaxed">
              Sikeresen aktiváltad a prémium tagságodat.<br/> A garázsod mostantól szuperképességekkel rendelkezik.
            </p>

            {/* Funkciók lista */}
            <div className="w-full bg-slate-950/60 rounded-2xl p-6 mb-8 border border-white/5 text-left space-y-3.5 backdrop-blur-sm">
                <FeatureItem text="Korlátlan számú autó kezelése" />
                <FeatureItem text="AI Szerelő asszisztens (GPT-4o)" />
                <FeatureItem text="Digitális okmánytár" />
                <FeatureItem text="Részletes pénzügyi statisztikák" />
            </div>

            <button 
                onClick={handleClose}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-900 font-black text-lg shadow-lg shadow-amber-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wide"
            >
                Király, indulás!
            </button>
        </div>

        {/* Bezáró X gomb */}
        <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-md"
        >
            <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

function FeatureItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 group">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/30 transition-colors">
                <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={4} />
            </div>
            <span className="text-slate-300 text-sm font-semibold group-hover:text-white transition-colors">{text}</span>
        </div>
    )
}

// Fő export (Suspense-be csomagolva a biztonság kedvéért)
export default function SuccessModal() {
    return (
        <Suspense fallback={null}>
            <SuccessContent />
        </Suspense>
    )
}