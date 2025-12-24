'use client'

import { useState, useEffect } from 'react'
import { X, Rocket, ArrowRight, Star, Crown } from 'lucide-react'
import Link from 'next/link'

// Ha nem kapunk promo objektumot kívülről, használjuk ezt az alapértelmezettet
const defaultPromo = {
  id: 'early-access-launch',
  title: 'Indulási Bónusz',
  description: 'Legyél az elsők között! Regisztrálj most Early Access tagként, és használd a teljes PRO csomagot teljesen ingyen az induló időszakban.',
  cta_text: 'Kérem az ingyenes PRO-t!',
  cta_link: '/login' // Közvetlenül a regisztrációra visz
}

export default function PromoModal({ promo = defaultPromo }: { promo?: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Használjuk a bejövő promo-t vagy az alapértelmezettet
  const activePromo = promo || defaultPromo;

  useEffect(() => {
    setIsMounted(true)
    
    // Ellenőrizzük, hogy látta-e már ezt a konkrét promóciót
    const hasSeenPromo = localStorage.getItem(`promo_seen_${activePromo.id}`)
    
    if (!hasSeenPromo) {
      // 3 másodperc késleltetés, hogy a felhasználó először lássa az oldalt
      const timer = setTimeout(() => setIsOpen(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [activePromo.id])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem(`promo_seen_${activePromo.id}`, 'true')
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
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px] -ml-10 -mb-10 pointer-events-none"></div>

        {/* Bezárás gomb (X) */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors z-20 backdrop-blur-md border border-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 flex flex-col items-center text-center relative z-10">
          
          {/* Ikon Animációval - Crown & Rocket */}
          <div className="relative mb-6 group">
             <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
             
             <div className="relative">
                {/* Középső ikon */}
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 rotate-3 border border-white/20 z-10 relative">
                   <Crown className="w-10 h-10 text-white drop-shadow-md" />
                </div>
                
                {/* Lebegő kis ikonok */}
                <div className="absolute -top-3 -right-3 bg-slate-900 text-emerald-400 rounded-full p-2 border border-slate-700 shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
                   <Rocket className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-2 -left-2 bg-slate-900 text-amber-400 rounded-full p-1.5 border border-slate-700 shadow-xl">
                   <Star className="w-4 h-4 fill-amber-400" />
                </div>
             </div>
          </div>

          {/* Cím */}
          <div className="space-y-1 mb-4">
             <span className="text-amber-500 font-bold tracking-widest text-xs uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">Early Access</span>
             <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
               Minden PRO funkció <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">INGYENES!</span>
             </h2>
          </div>

          {/* Leírás */}
          <p className="text-slate-300 leading-relaxed mb-8 text-sm md:text-base px-2">
            Most indultunk! Csatlakozz az elsők között, és használd a DynamicSense teljes tudását (AI szerelő, korlátlan garázs) teljesen ingyen a béta időszak alatt.
          </p>

          {/* CTA Gomb - Link a login oldalra */}
          <Link 
            href={activePromo.cta_link || '/login'}
            onClick={handleClose} 
            className="w-full py-4 bg-gradient-to-r from-white to-slate-200 hover:from-slate-100 hover:to-white text-slate-900 font-black rounded-xl transition-all flex items-center justify-center gap-2 group active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] relative overflow-hidden"
          >
            {/* Fénycsík animáció */}
            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-12 animate-[shimmer_2s_infinite]" />
            
            <span className="relative z-10">{activePromo.cta_text}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-amber-600 relative z-10" />
          </Link>
          
          <p className="mt-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Nincs bankkártya. Nincs apróbetű.
          </p>
        </div>
      </div>
    </div>
  )
}