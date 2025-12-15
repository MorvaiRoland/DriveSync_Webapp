'use client'

import { useState } from 'react'
import { Check, ArrowLeft, Loader2, Sparkles, ShieldCheck, Zap, XCircle, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// --- STRIPE PRICING ID-K ---
const PRICES = {
  monthly: 'price_1Sd8zXRbHGQdHUF4vMQbDKjt', 
  yearly: 'price_1Sd8zyRbHGQdHUF4mutCgwbV',  
  lifetime: 'price_1Sd90LRbHGQdHUF4SWmp0rJM' 
}

interface PricingClientProps {
  initialPlan: string // 'free' | 'pro' | 'lifetime' | 'founder'
}

export default function PricingClient({ initialPlan }: PricingClientProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const router = useRouter()

  const isLifetimeUser = initialPlan === 'lifetime' || initialPlan === 'founder';

  const handleCheckout = async (priceId: string, mode: 'subscription' | 'payment') => {
    setLoadingId(priceId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, mode })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Hiba történt a fizetés indításakor.')
      if (data.url) router.push(data.url)
    } catch (error: any) {
      console.error(error)
      alert("Hiba: " + error.message)
      if (error.message === 'Nincs bejelentkezve') router.push('/login')
    } finally {
      setLoadingId(null)
    }
  }

  const manageSubscription = async () => {
    setLoadingPortal(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Hiba történt a portál betöltésekor.')
      if (data.url) window.location.href = data.url
    } catch (error: any) {
      console.error(error)
      alert('Hiba: ' + error.message)
    } finally {
      setLoadingPortal(false)
    }
  }

  const isActive = (planKey: string) => {
      if (planKey === 'free' && initialPlan === 'free') return true;
      if (planKey === 'pro' && initialPlan === 'pro') return true;
      if (planKey === 'lifetime' && isLifetimeUser) return true;
      return false;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-600 transition-colors duration-500 relative overflow-x-hidden">
      
      {/* HÁTTÉR EFFEKTEK */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="sticky top-4 z-50 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-lg shadow-black/5 px-4 h-16 flex items-center justify-between transition-all duration-300">
           <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors font-bold text-sm group px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                <span>Vissza a garázshoz</span>
           </Link>
           
           <div className="flex items-center gap-3"> 
             <div className="relative w-8 h-8">
               <Image src="/DynamicSense-logo.png" alt="DynamicSense" fill className="object-contain drop-shadow-md" priority />
             </div>
             <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase hidden sm:block">
               Dynamic<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Sense</span>
             </span>
           </div>
        </div>
      </nav>

      <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* --- HERO HEADER --- */}
        <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/80 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm backdrop-blur-sm">
             <Sparkles className="w-3 h-3" /> Prémium Tagság
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-[1.1] text-slate-900 dark:text-white">
            Válassz csomagot, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">növeld az autód értékét.</span>
          </h1>
          
          <p className="text-slate-600 dark:text-slate-400 mb-12 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            A DynamicSense Pro nem csak kényelem, hanem befektetés. Egy pontosan vezetett digitális szervizkönyv milliókkal növelheti az eladási árat.
          </p>
          
          {/* --- BILLING TOGGLE --- */}
          <div className="flex justify-center">
            <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl relative inline-flex">
                {/* Csúszka háttér */}
                <div 
                    className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-slate-100 dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out z-0`}
                    style={{ 
                        left: billingCycle === 'monthly' ? '6px' : 'calc(50%)',
                        width: 'calc(50% - 6px)'
                    }}
                ></div>
                
                <button 
                    onClick={() => setBillingCycle('monthly')} 
                    className={`relative z-10 px-8 py-3 rounded-xl text-sm font-bold transition-colors duration-300 min-w-[140px] ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Havi
                </button>
                <button 
                    onClick={() => setBillingCycle('yearly')} 
                    className={`relative z-10 px-8 py-3 rounded-xl text-sm font-bold transition-colors duration-300 min-w-[140px] flex items-center justify-center gap-2 ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Éves 
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50 px-1.5 py-0.5 rounded uppercase tracking-wide leading-none font-black">
                        -20%
                    </span>
                </button>
            </div>
          </div>
        </div>

        {/* --- PRICING CARDS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* 1. STARTER CSOMAG */}
          <PricingCard 
            title="Starter" 
            price="0 Ft" 
            desc="Kezdő autósoknak, az alapokhoz."
            features={['1 Autó kezelése', 'Alap szerviznapló', 'Tankolás követés', 'Emlékeztetők (max 3)']}
            buttonText={isActive('free') ? "Jelenlegi csomag" : "Visszaváltás"}
            disabled={true} 
            isCurrent={isActive('free')}
            delay={100}
          />

          {/* 2. PRO CSOMAG (Kiemelt) */}
          <PricingCard 
            title="Pro" 
            price={billingCycle === 'monthly' ? '1.490 Ft' : '8.999 Ft'} 
            period={billingCycle === 'monthly' ? '/ hó' : '/ év'}
            desc="Komoly tulajdonosoknak, akik mindent látni akarnak."
            highlight={true}
            features={[
              'Korlátlan autó', 
              'AI Szerelő (GPT-4o) 🤖', 
              'Digitális Kesztyűtartó 📂', 
              'Részletes statisztikák 📊', 
              'Excel & PDF Exportálás'
            ]}
            buttonText={
                isActive('pro') ? "Jelenlegi csomag" : 
                isLifetimeUser ? "Örökös csomagod van 🚀" : 
                "Kipróbálom"
            }
            disabled={isActive('pro') || isLifetimeUser} 
            isCurrent={isActive('pro')}
            isLoading={loadingId === (billingCycle === 'monthly' ? PRICES.monthly : PRICES.yearly)}
            onClick={() => handleCheckout(billingCycle === 'monthly' ? PRICES.monthly : PRICES.yearly, 'subscription')}
            onManage={manageSubscription} 
            loadingManage={loadingPortal}
            delay={200}
          />

          {/* 3. LIFETIME CSOMAG */}
          <PricingCard 
            title="Lifetime" 
            price="14.999 Ft" 
            desc="Egyszeri befektetés. Nincs több havidíj soha."
            period=""
            features={[
              'Minden Pro funkció örökre', 
              'Örökös frissítések', 
              'Nincs havidíj soha', 
              'VIP Támogatás', 
              'Egyedi "Lifetime" jelvény 🚀'
            ]}
            buttonText={isActive('lifetime') ? "Megvásárolva ✅" : "Megveszem örökre"}
            disabled={isActive('lifetime')}
            isCurrent={isActive('lifetime')}
            isLoading={loadingId === PRICES.lifetime}
            onClick={() => handleCheckout(PRICES.lifetime, 'payment')}
            onManage={manageSubscription}
            loadingManage={loadingPortal}
            delay={300}
            specialBorder={true}
          />
        </div>
        
        {/* --- TRUST BADGE FOOTER --- */}
        <div className="mt-24 text-center border-t border-slate-200 dark:border-slate-800 pt-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <div className="flex justify-center gap-6 mb-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <div className="h-8 w-12 bg-white dark:bg-white/10 rounded border border-slate-200 dark:border-white/10 flex items-center justify-center text-[8px] font-bold shadow-sm text-slate-600 dark:text-white">VISA</div>
                <div className="h-8 w-12 bg-white dark:bg-white/10 rounded border border-slate-200 dark:border-white/10 flex items-center justify-center text-[8px] font-bold shadow-sm text-slate-600 dark:text-white">MC</div>
                <div className="h-8 w-12 bg-white dark:bg-white/10 rounded border border-slate-200 dark:border-white/10 flex items-center justify-center text-[8px] font-bold shadow-sm text-slate-600 dark:text-white">AMEX</div>
            </div>
            <p className="text-slate-500 dark:text-slate-500 text-xs leading-relaxed flex flex-col items-center gap-2">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-400 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Biztonságos fizetés a Stripe rendszerén keresztül.
                </span>
                A DynamicSense szerverei semmilyen bankkártyaadatot nem tárolnak. <br/>
                Az előfizetés bármikor, egy kattintással lemondható a beállításokban.
                A feltüntetett árak tartalmazzák az ÁFÁ-t.
            </p>
        </div>
      </div>
    </div>
  )
}

// --- SEGÉD KOMPONENS: PRICING CARD (DESIGN FRISSÍTVE) ---
function PricingCard({ 
  title, 
  price, 
  period, 
  desc, 
  features, 
  highlight, 
  buttonText, 
  disabled, 
  onClick, 
  isLoading, 
  isCurrent, 
  delay, 
  specialBorder, 
  onManage, 
  loadingManage 
}: any) {
  return (
    <div 
        className={`
          relative p-8 rounded-[2.5rem] flex flex-col h-full transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 fill-mode-forwards group
          ${highlight 
              ? 'bg-white dark:bg-slate-900 border-2 border-amber-500 shadow-2xl shadow-amber-500/10 md:-mt-8 md:mb-8 z-10 scale-100 hover:scale-[1.02]' 
              : specialBorder
                  ? 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 border border-indigo-200 dark:border-indigo-500/30 hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-xl'
                  : 'bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 backdrop-blur-md shadow-lg'
          }
          ${isCurrent ? 'ring-2 ring-emerald-500 shadow-emerald-500/10' : ''}
        `}
        style={{ animationDelay: `${delay}ms` }}
    >
      {/* Jelvények */}
      {highlight && !isCurrent && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-black px-6 py-2 rounded-full uppercase tracking-wider shadow-lg shadow-amber-500/30 whitespace-nowrap flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-white" /> Legnépszerűbb
        </div>
      )}

      {specialBorder && !isCurrent && (
        <div className="absolute -top-3 right-8 bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            Best Value
        </div>
      )}
      
      {isCurrent && (
         <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-emerald-500/20 whitespace-nowrap flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 stroke-[3px]" /> Aktív Csomag
         </div>
      )}
      
      {/* Kártya tartalma */}
      <div className="mb-8">
          <h3 className={`text-xl font-bold mb-3 tracking-tight ${highlight ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>{title}</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{price}</span>
            <span className="text-sm font-bold text-slate-500">{period}</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 font-medium leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">{desc}</p>
      </div>
      
      {/* Fő gomb (Vásárlás/Váltás) */}
      <button 
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`
            w-full py-4 rounded-2xl font-bold mb-4 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wide
            ${disabled 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default border border-slate-200 dark:border-slate-700' 
                : highlight 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-500/30 active:scale-95' 
                    : specialBorder 
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 active:scale-95'
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 active:scale-95 shadow-md'
            }
        `}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {buttonText}
      </button>

      {/* Lemondás/Kezelés gomb */}
      {isCurrent && onManage && (
          <button 
            onClick={onManage}
            disabled={loadingManage}
            className="w-full py-2 mb-6 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5"
          >
             {loadingManage ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
             Előfizetés kezelése / Lemondás
          </button>
      )}
      
      {/* Feature lista */}
      <div className="space-y-4 flex-1">
        {features.map((f: string, i: number) => (
          <div key={i} className="flex items-start gap-3 text-sm group/item">
            <div className={`
                mt-0.5 rounded-full p-0.5 flex-shrink-0 transition-colors
                ${highlight ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover/item:text-slate-700 dark:group-hover/item:text-slate-300'}
                ${specialBorder ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : ''}
            `}>
                <Check className="w-3 h-3" strokeWidth={4} /> 
            </div>
            <span className={`transition-colors ${highlight ? 'text-slate-700 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400 group-hover/item:text-slate-900 dark:group-hover/item:text-slate-300'}`}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}