'use client'

import { useState } from 'react'
import { Check, ArrowLeft, Loader2, Zap, LayoutDashboard, Crown, ShieldCheck, Clock, BellRing, Rocket, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AuroraBackground, DashboardNav, BottomNav } from '@/components/SharedNavigation'

interface PricingClientProps {
  initialPlan: string
  userEmail?: string
  currentPlan?: string
  userName?: string
  isTrial?: boolean
  isPro?: boolean
  signOutAction?: () => Promise<void>
}

function Glass({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`
      bg-white/60 dark:bg-white/[0.04]
      border border-white/70 dark:border-white/[0.08]
      backdrop-blur-xl shadow-sm transition-all duration-300
      ${className}
    `}>
      {children}
    </div>
  )
}

export default function PricingClient({ 
  initialPlan, 
  userEmail, 
  currentPlan, 
  userName, 
  isTrial = false, 
  isPro = false, 
  signOutAction 
}: PricingClientProps) {
  const [loadingDashboard, setLoadingDashboard] = useState(false)
  const router = useRouter()

  const handleEnterDashboard = async () => {
    setLoadingDashboard(true)
    setTimeout(() => {
      router.push('/')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-amber-600 relative overflow-x-hidden flex flex-col transition-colors duration-700">
      <AuroraBackground />

      {/* NAVBAR */}
      {userEmail && userName && signOutAction ? (
        <>
          <DashboardNav userName={userName} plan={initialPlan} isTrial={isTrial} isPro={isPro} signOutAction={signOutAction} />
          <BottomNav isPro={isPro} />
        </>
      ) : (
        <nav className="fixed top-0 inset-x-0 z-50 px-3 sm:px-4" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
          <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-4 bg-white/70 dark:bg-black/70 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-7 h-7 group-hover:rotate-12 transition-transform duration-500">
                <Image src="/DynamicSense-logo.png" alt="DS" fill className="object-contain" priority />
              </div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                Dynamic<span className="text-slate-400 dark:text-slate-500">Sense</span>
              </span>
            </Link>
            <Link href="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all">
              Bejelentkezés
            </Link>
          </div>
        </nav>
      )}

      {/* MAIN CONTAINER */}
      <main 
        className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full pb-28 md:pb-16"
        style={{ paddingTop: 'calc(max(0.75rem, env(safe-area-inset-top)) + 5.5rem)' }}
      >
        
        {/* LAUNCH BANNER */}
        <div className="w-full max-w-4xl mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 p-[1px] shadow-xl shadow-indigo-500/10">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
            <div className="relative bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-md rounded-[23px] p-5 md:p-6 text-center">
              <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-[9px] uppercase tracking-widest mb-1.5 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/50">
                <Rocket className="w-3.5 h-3.5" />
                Indulási Ajánlat
              </div>
              <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white mb-1.5">
                Új év, új korszak a járműkezelésben!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
                Az első hónapban minden prémium funkció <span className="text-indigo-600 dark:text-indigo-400 font-bold underline decoration-indigo-500/50 decoration-2">teljesen ingyenes</span> mindenki számára. Nincs elköteleződés, sem rejtett bankkártyás adatkérés.
              </p>
            </div>
          </div>
        </div>

        {/* HEADER */}
        <div className="text-center mb-12 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
            A garázsod jövője <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
              most kezdődik.
            </span>
          </h1>
          
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed px-4 max-w-2xl mx-auto font-medium">
            Használd a teljes rendszert korlátok nélkül 30 napig. A fizetési kapuk később, a béta időszak után nyílnak meg.
          </p>
        </div>

        {/* PRICING GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl items-start">
            
          {/* 1. FREE PLAN */}
          <Glass className="p-6 rounded-3xl opacity-80 hover:opacity-100 hover:scale-[1.01] flex flex-col h-full border-slate-200/50 dark:border-white/5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Starter</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-black text-slate-900 dark:text-white">Ingyenes</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 leading-relaxed min-h-[36px]">
              Alapvető garázskezelő funkciók, amik a próbaidőszak után is teljesen ingyenesek maradnak.
            </p>
            
            <ul className="space-y-3.5 mb-8 flex-1">
              <FeatureItem text="1 autó kezelése" />
              <FeatureItem text="Szervizkönyv & Tankolások" />
              <FeatureItem text="Nincs AI Szerelő tanácsadás" dull />
              <FeatureItem text="Nincs Export / VIN Kereső" dull />
            </ul>

            <button 
              onClick={handleEnterDashboard}
              disabled={loadingDashboard}
              className="w-full py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {loadingDashboard ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Belépés
            </button>
          </Glass>

          {/* 2. PRO PLAN (ACTIVE TRIAL) */}
          <div className="relative p-[1px] rounded-[25px] bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/10 md:-translate-y-4 hover:scale-[1.01] transition-transform duration-300">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-md flex items-center gap-1.5 whitespace-nowrap border border-white/20 animate-pulse">
              <Zap className="w-3.5 h-3.5 fill-white" /> Jelenleg Aktív
            </div>

            <div className="bg-white/95 dark:bg-[#0c0c0e]/95 rounded-[24px] p-6 h-full relative overflow-hidden flex flex-col">
              <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-1">Pro</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  0 Ft
                </span>
                <span className="text-slate-500 text-xs font-bold">/ 1. hónap</span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-6 leading-none">
                A csomagok végleges árai 30 nap múlva lépnek életbe.
              </p>
              
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed min-h-[36px]">
                Most minden Pro szolgáltatást korlátok és fizetési kötelezettség nélkül használhatsz.
              </p>
              
              <ul className="space-y-3.5 mb-8 flex-1">
                <FeatureItem text="Korlátlan autó kezelése" active />
                <FeatureItem text="AI Szerelő & Diagnosztika" active />
                <FeatureItem text="Útnyilvántartás & Úttervező" active />
                <FeatureItem text="VIN Alvázszám Kereső" active />
                <FeatureItem text="Szerviz Térkép & Partnerek" active />
              </ul>

              <button 
                onClick={handleEnterDashboard}
                disabled={loadingDashboard}
                className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/20"
              >
                {loadingDashboard ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><LayoutDashboard className="w-4 h-4" /> Irány a Dashboard</>
                )}
              </button>
            </div>
          </div>

          {/* 3. LIFETIME PLAN */}
          <Glass className="p-6 rounded-3xl hover:scale-[1.01] flex flex-col h-full border-amber-200/50 dark:border-amber-900/30 bg-gradient-to-b from-amber-500/[0.03] to-transparent relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <h3 className="text-lg font-bold text-amber-700 dark:text-amber-500 mb-1 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500" /> Lifetime
            </h3>
            <div className="flex items-baseline gap-1.5 mb-4 relative">
              <span className="text-3xl font-black text-slate-900 dark:text-white filter blur-sm select-none">??.??? Ft</span>
              <span className="absolute left-0 top-1/2 -translate-y-1/2 bg-amber-500/10 text-amber-600 dark:text-amber-500 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                <Lock className="w-3 h-3" /> Zárt Árazás
              </span>
            </div>
            
            {/* 72-HOUR LAUNCH NOTICE */}
            <div className="bg-amber-100/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl p-3.5 mb-6 relative overflow-hidden backdrop-blur-md">
              <div className="flex items-start gap-2.5">
                <BellRing className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 mb-0.5">
                    Alapító Kedvezmény
                  </h4>
                  <p className="text-[10px] text-amber-700/90 dark:text-amber-400/80 leading-relaxed">
                    Amikor a fizetős időszak elindul, **72 óráig** rendkívül alacsony áron szerezheted meg az örökös tagságot.
                  </p>
                </div>
              </div>
            </div>
            
            <ul className="space-y-3.5 mb-8 flex-1 opacity-80">
              <FeatureItem text="Minden Pro funkció örökre" active={true} />
              <FeatureItem text="Egyszeri díj, nincs havidíj" active={true} />
              <FeatureItem text="Founder jelvény a profilodon" active={true} />
            </ul>

            <button 
              disabled={true}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed"
            >
              <Clock className="w-4 h-4" /> Hamarosan
            </button>
          </Glass>

        </div>

        {/* TRUST BADGES */}
        <div className="mt-16 flex flex-col items-center gap-3 opacity-60">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Biztonságos Környezet
          </div>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 max-w-sm text-center leading-relaxed font-medium">
            Jelenleg béta fázisban vagyunk. Semmilyen fizetési vagy bankkártya adatot nem kérünk el a teszteléshez.
          </p>
        </div>

      </main>
    </div>
  )
}

function FeatureItem({ text, active, dull }: { text: string, active?: boolean, dull?: boolean }) {
  return (
    <li className={`flex items-start gap-2.5 ${dull ? 'opacity-40' : ''}`}>
      <div className={`mt-0.5 rounded-full p-0.5 flex-shrink-0 ${
        active 
          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30' 
          : 'bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200/50 dark:border-white/5'
      }`}>
        <Check className="w-3 h-3" strokeWidth={3} />
      </div>
      <span className={`text-xs font-semibold ${active ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{text}</span>
    </li>
  )
}