'use client'

import { useState } from 'react'
import { Check, ArrowLeft, Loader2, Zap, LayoutDashboard, Crown, ShieldCheck, Sparkles, CreditCard, Clock, BellRing, Rocket } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner' 

// Az árakat most nem használjuk közvetlenül, de a struktúra marad a jövőre
const STRIPE_PRICES = {
  monthly: 'price_1SjPQzRbHGQdHUF40biCuF2v', 
  yearly: 'price_1SjPRYRbHGQdHUF4E86ttykq',  
  lifetime: 'price_1SjPSMRbHGQdHUF42Ngnfo41' 
}

interface PricingClientProps {
  initialPlan: string
  userEmail?: string
  currentPlan?: string
}

export default function PricingClient({ initialPlan, userEmail, currentPlan }: PricingClientProps) {
  const [loadingDashboard, setLoadingDashboard] = useState(false)
  const router = useRouter()

  const isLifetime = currentPlan === 'lifetime';

  // Most mindenki "Pro" módban érezheti magát, vagy simán beléphet
  const handleEnterDashboard = async () => {
    setLoadingDashboard(true)
    // Szimulált töltés az UX miatt
    setTimeout(() => {
        router.push('/')
    }, 800)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-600 relative overflow-x-hidden flex flex-col transition-colors duration-300 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      
      {/* HÁTTÉR */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[120px]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* NAVBAR */}
      <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 py-4 md:py-8 flex justify-between items-center">
        <Link href="/" className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-bold">
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
             <span>Vissza a főoldalra</span>
        </Link>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-20 pt-2 md:pt-10">
        
        {/* LAUNCH BANNER */}
        <div className="w-full max-w-3xl mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-1 shadow-2xl shadow-indigo-500/30">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                <div className="relative bg-slate-900/90 backdrop-blur-md rounded-xl p-4 md:p-6 text-center">
                    <div className="inline-flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-widest mb-2">
                        <Rocket className="w-4 h-4 text-indigo-400" />
                        Indulási Ajánlat
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-white mb-2">
                        Az alkalmazás holnap indul!
                    </h2>
                    <p className="text-slate-300 text-sm md:text-base">
                        Az első hónapban minden funkció <span className="text-white font-bold underline decoration-indigo-500 decoration-2">teljesen ingyenes</span> mindenki számára. Nincs apróbetűs rész.
                    </p>
                </div>
            </div>
        </div>

        {/* HEADER */}
        <div className="text-center mb-12 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
              A garázsod jövője <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                  most kezdődik.
              </span>
            </h1>
            
            <p className="text-slate-600 dark:text-slate-400 text-base md:text-xl leading-relaxed px-4 max-w-2xl mx-auto">
              Használd a teljes rendszert korlátok nélkül 30 napig. A fizetési kapuk később nyílnak meg.
            </p>
        </div>

        {/* PRICING GRID (Prices Hidden) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl items-start">
            
            {/* 1. FREE PLAN */}
            <div className={`p-6 md:p-8 rounded-3xl border bg-white dark:bg-slate-900/50 backdrop-blur-sm transition-all border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100`}>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Starter</h3>
                <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">Ingyenes</span>
                </div>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed min-h-[40px]">
                    Alapvető funkciók, amik mindig ingyenesek maradnak az indulás után is.
                </p>
                
                <ul className="space-y-4 mb-8">
                    <FeatureItem text="1 autó kezelése" />
                    <FeatureItem text="Szervizkönyv & Tankolások" />
                    <FeatureItem text="Nincs AI Szerelő" dull />
                    <FeatureItem text="Nincs Export / VIN Kereső" dull />
                </ul>

                <button 
                    onClick={handleEnterDashboard}
                    disabled={loadingDashboard}
                    className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                    {loadingDashboard ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Belépés
                </button>
            </div>

            {/* 2. PRO PLAN (Active Trial) */}
            <div className={`relative p-1 rounded-[26px] bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 shadow-2xl shadow-indigo-500/20 md:-translate-y-4`}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-2 whitespace-nowrap animate-pulse">
                    <Zap className="w-3 h-3 fill-white" /> Most Aktív
                </div>

                <div className="bg-white dark:bg-[#0A0A0A] rounded-[22px] p-6 md:p-8 h-full relative overflow-hidden flex flex-col">
                    <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Pro</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
                            0 Ft
                        </span>
                        <span className="text-slate-500 font-bold">/ 1. hó</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-6">
                        Az árak 30 nap múlva kerülnek felfedésre.
                    </p>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-8 leading-relaxed min-h-[40px]">
                        Most minden Pro funkciót korlátlanul használhatsz.
                    </p>
                    
                    <ul className="space-y-4 mb-8 flex-1">
                        <FeatureItem text="Korlátlan autó kezelése" active />
                        <FeatureItem text="AI Szerelő & Diagnosztika" active />
                        <FeatureItem text="Útnyilvántartás & Úttervező" active />
                        <FeatureItem text="VIN Alvázszám Kereső" active />
                        <FeatureItem text="Szerviz Térkép" active />
                    </ul>

                    <button 
                        onClick={handleEnterDashboard}
                        disabled={loadingDashboard}
                        className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/30"
                    >
                        {loadingDashboard ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <><LayoutDashboard className="w-4 h-4" /> Irány a Dashboard</>
                        )}
                    </button>
                </div>
            </div>

            {/* 3. LIFETIME PLAN (Hidden Price + Warning) */}
            <div className={`p-6 md:p-8 rounded-3xl border bg-amber-50/50 dark:bg-amber-950/10 backdrop-blur-sm transition-all relative overflow-hidden border-amber-200 dark:border-amber-900/50`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-[60px] -mr-10 -mt-10"></div>
                
                <h3 className="text-xl font-bold text-amber-700 dark:text-amber-500 mb-2 flex items-center gap-2">
                    <Crown className="w-5 h-5" /> Lifetime
                </h3>
                <div className="flex items-baseline gap-1 mb-6 blur-sm select-none">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">??.??? Ft</span>
                </div>
                
                {/* 72 ÓRÁS FIGYELMEZTETÉS */}
                <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 mb-8 relative overflow-hidden">
                    <div className="flex items-start gap-3">
                        <BellRing className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5 animate-bounce" />
                        <div>
                            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-1">
                                Ne maradj le!
                            </h4>
                            <p className="text-xs text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
                                Amikor a fizetős időszak elindul, <strong>72 óráig</strong> brutálisan kedvező áron szerezheted meg az örökös tagságot. Figyeld az emailjeidet!
                            </p>
                        </div>
                    </div>
                </div>
                
                <ul className="space-y-4 mb-8 opacity-70">
                    <FeatureItem text="Minden Pro funkció örökre" active={true} />
                    <FeatureItem text="Egyszeri díj, nincs havidíj" active={true} />
                    <FeatureItem text="Founder jelvény a profilodon" active={true} />
                </ul>

                <button 
                    disabled={true}
                    className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-none bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                >
                    <Clock className="w-4 h-4" /> Hamarosan
                </button>
            </div>

        </div>

        {/* TRUST BADGES */}
        <div className="mt-16 flex flex-col items-center gap-4 opacity-70">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" /> Biztonságos rendszer
             </div>
             <p className="text-[10px] text-slate-400 max-w-md text-center">
                 Jelenleg demó/béta módban futunk. A kártyaadatokat nem kérünk be a regisztrációhoz.
             </p>
        </div>

      </main>
    </div>
  )
}

function FeatureItem({ text, active, dull }: { text: string, active?: boolean, dull?: boolean }) {
    return (
        <li className={`flex items-start gap-3 ${dull ? 'opacity-50' : ''}`}>
            <div className={`mt-0.5 rounded-full p-1 flex-shrink-0 ${active ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
            </div>
            <span className={`text-sm font-medium ${active ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{text}</span>
        </li>
    )
}