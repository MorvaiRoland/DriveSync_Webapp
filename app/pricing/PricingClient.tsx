'use client'

import { useState } from 'react'
import { Check, ArrowLeft, Loader2, Zap, LayoutDashboard, Crown, ShieldCheck, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

// --- KONFIGURÁCIÓ ---
const LIFETIME_PRICE_ID = 'price_1SijxIRbHGQdHUF48ulonZdP'

interface PricingClientProps {
  initialPlan: string
}

export default function PricingClient({ initialPlan }: PricingClientProps) {
  const [loadingDashboard, setLoadingDashboard] = useState(false)
  const [loadingStripe, setLoadingStripe] = useState(false)
  const router = useRouter()

  const handleEnterDashboard = async () => {
    setLoadingDashboard(true)
    setTimeout(() => {
        router.push('/')
    }, 800)
  }

  return (
    // FONTOS: pt-[env(safe-area-inset-top)] hozzáadva a notch kezeléséhez
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-600 relative overflow-x-hidden flex flex-col transition-colors duration-300 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      
      {/* HÁTTÉR */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[120px]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* NAVBAR - Biztonságos távolságra a kijelző tetejétől */}
      <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 py-4 md:py-8 flex justify-between items-center">
        <Link href="/" className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-bold">
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
             <span>Később döntök, irány a Garázs</span>
        </Link>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-20 pt-2 md:pt-10">
        
        {/* HEADER */}
        <div className="text-center mb-12 md:mb-16 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 text-amber-700 dark:text-amber-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6">
               <Sparkles className="w-3 h-3" /> Indulási Ajánlat
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
              Fektess be a jövődbe. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Soha többé havidíj.</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-base md:text-xl leading-relaxed px-4">
              A DynamicSense most indul. Légy az elsők között, és szerezz <strong className="text-slate-900 dark:text-white">örökös hozzáférést</strong> az összes jövőbeli Pro funkcióhoz.
            </p>
        </div>

        {/* PRICING CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-5xl items-center px-2">
            
            {/* 1. KÁRTYA: INGYENES */}
            <div className="relative p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm order-2 md:order-1 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Early Access</h3>
                <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">0 Ft</span>
                    <span className="text-slate-500 font-medium">/ jelenleg</span>
                </div>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                    Használd az alkalmazást ingyen a béta időszak alatt. Később havidíjas rendszerre válthatunk, de az adataid megmaradnak.
                </p>
                
                <ul className="space-y-4 mb-8">
                    <FeatureItem text="Alapvető garázs funkciók" />
                    <FeatureItem text="Korlátozott AI diagnosztika" />
                    <FeatureItem text="Közösségi funkciók" />
                    <FeatureItem text="Nincs garantált árvédelem" dull />
                </ul>

                <button 
                    onClick={handleEnterDashboard}
                    disabled={loadingDashboard}
                    className="w-full py-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                    {loadingDashboard ? <Loader2 className="w-4 h-4 animate-spin" /> : <LayoutDashboard className="w-4 h-4" />}
                    Tovább a Garázsba
                </button>
            </div>

            {/* 2. KÁRTYA: LIFETIME */}
            <div className="relative p-1 rounded-3xl bg-gradient-to-b from-amber-300 via-orange-500 to-red-500 shadow-2xl shadow-orange-500/20 order-1 md:order-2 transform md:scale-105">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2 whitespace-nowrap">
                    <Crown className="w-3 h-3 fill-white" /> Legnépszerűbb
                </div>

                <div className="bg-white dark:bg-[#0A0A0A] rounded-[22px] p-6 md:p-8 h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -mr-16 -mt-16"></div>

                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 mb-2">Founder Edition</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white whitespace-nowrap">12.990 Ft</span>
                        <span className="text-slate-500 font-bold">/ örökre</span>
                    </div>
                    <p className="text-[10px] md:text-xs font-bold text-emerald-500 uppercase tracking-wide mb-6">Egyszeri fizetés. Nincs havidíj.</p>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-8 leading-relaxed border-b border-slate-100 dark:border-slate-800 pb-6">
                        Légy alapító tag! Támogasd a fejlesztést, és cserébe megkapod a Pro csomagot örökre.
                    </p>
                    
                    <ul className="space-y-4 mb-8">
                        <FeatureItem text="Minden jelenlegi Pro funkció" active />
                        <FeatureItem text="Korlátlan AI Szerelő használat" active />
                        <FeatureItem text="Garantáltan 0 Ft havidíj örökre" active />
                        <FeatureItem text="Exkluzív 'Founder' jelvény" active />
                        <FeatureItem text="Prioritásos ügyfélszolgálat" active />
                    </ul>

                    <button 
                        disabled={true}
                        className="group relative w-full py-4 rounded-xl bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400 font-bold text-sm uppercase tracking-wider cursor-not-allowed transition-all overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            Hamarosan elérhető
                        </span>
                    </button>
                    
                    <p className="text-center text-[10px] text-slate-400 mt-4">
                        A fizetés technikai okok miatt szünetel.
                    </p>
                </div>
            </div>

        </div>

        {/* TRUST BADGES */}
        <div className="mt-12 md:mt-16 flex items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 pb-10">
             <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-500">
                <ShieldCheck className="w-4 h-4" /> Biztonságos fizetés Stripe-on keresztül
             </div>
        </div>

      </main>
    </div>
  )
}

function FeatureItem({ text, active, dull }: { text: string, active?: boolean, dull?: boolean }) {
    return (
        <li className={`flex items-start gap-3 ${dull ? 'opacity-50' : ''}`}>
            <div className={`mt-0.5 rounded-full p-1 flex-shrink-0 ${active ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
            </div>
            <span className={`text-sm font-medium ${active ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{text}</span>
        </li>
    )
}