'use client'

import { useState, useEffect } from 'react'
import { X, Gift, ArrowRight, Sparkles } from 'lucide-react'

export default function PromoModal({ promo }: { promo: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Ellenőrizzük, hogy látta-e már ezt a konkrét promóciót az ID alapján
    const hasSeenPromo = localStorage.getItem(`promo_seen_${promo.id}`)
    
    if (!hasSeenPromo) {
      // Kis késleltetés az oldal betöltése után, hogy elegánsabb legyen
      const timer = setTimeout(() => setIsOpen(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [promo.id])

  const handleClose = () => {
    setIsOpen(false)
    // Elmentjük, hogy látta, így többet nem ugrik fel neki ez a kampány
    localStorage.setItem(`promo_seen_${promo.id}`, 'true')
  }

  const handleCtaClick = () => {
    handleClose()
    
    // Megkeressük a feliratkozó formot és odagörgetünk
    const subscribeSection = document.getElementById('subscribe-form') || document.querySelector('form')
    if (subscribeSection) {
        subscribeSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
        
        // Opcionális: fókuszba helyezzük az email mezőt
        const emailInput = subscribeSection.querySelector('input[type="email"]') as HTMLInputElement
        if (emailInput) emailInput.focus()
    }
  }

  // Ha nincs nyitva, vagy még nem mountolódott a kliens, nem renderelünk semmit
  if (!isMounted || !isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Sötét háttér overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-500"
        onClick={handleClose}
      />

      {/* Modal Kártya */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 transform">
        
        {/* Dekorációs háttér effektek */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-[60px] -mr-10 -mt-10 pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/10 rounded-full blur-[60px] -ml-10 -mb-10 pointer-events-none"></div>

        {/* Bezárás gomb (X) */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors z-20 backdrop-blur-md border border-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 flex flex-col items-center text-center relative z-10">
          
          {/* Ikon Animációval */}
          <div className="relative mb-6">
             <div className="absolute inset-0 bg-purple-500 blur-xl opacity-40 animate-pulse"></div>
             <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 rotate-3 border border-white/10">
                <Gift className="w-10 h-10 text-white" />
             </div>
             <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-900 rounded-full p-1.5 border-2 border-slate-900">
                <Sparkles className="w-4 h-4" />
             </div>
          </div>

          {/* Cím */}
          <h2 className="text-3xl font-black text-white mb-3 tracking-tight leading-tight">
            {promo.title}
          </h2>

          {/* Leírás */}
          <p className="text-slate-300 leading-relaxed mb-8 text-sm md:text-base px-2">
            {promo.description}
          </p>

          {/* CTA Gomb */}
          <button 
            onClick={handleCtaClick} 
            className="w-full py-4 bg-gradient-to-r from-white to-slate-200 hover:from-slate-100 hover:to-white text-slate-900 font-black rounded-xl transition-all flex items-center justify-center gap-2 group active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]"
          >
            {promo.cta_text || 'Kérem az ajándékot!'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-purple-600" />
          </button>
          
          <p className="mt-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Csak korlátozott ideig!
          </p>
        </div>
      </div>
    </div>
  )
}