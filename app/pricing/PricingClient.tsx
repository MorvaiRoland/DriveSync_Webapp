'use client'

import { useState } from 'react'
import { Check, ArrowLeft, Loader2, Zap, LayoutDashboard, Crown, ShieldCheck, Sparkles, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner' 

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
  const [loadingStripe, setLoadingStripe] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const router = useRouter()

  const isLifetime = currentPlan === 'lifetime';
  const isPro = currentPlan === 'pro';

  const handleEnterDashboard = async () => {
    setLoadingDashboard(true)
    setTimeout(() => {
        router.push('/')
    }, 800)
  }

  // JAVÍTÁS: 'mode' paraméter hozzáadva (subscription vagy payment)
  const handleCheckout = async (priceId: string, mode: 'subscription' | 'payment') => {
    if (isLifetime) return; // Biztonsági csekk

    // Melyik gomb töltsön (a mode alapján döntjük el a UI miatt)
    const loadingKey = mode === 'payment' ? 'lifetime' : 'pro';
    setLoadingStripe(loadingKey);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          mode, // <--- ELKÜLDJÜK A MÓDOT A SZERVERNEK
          successUrl: `${window.location.origin}/?success=true`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Nem kaptunk fizetési linket.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Hiba történt a fizetés indításakor. Próbáld újra!');
      setLoadingStripe(null);
    }
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
             <span>Vissza a Garázsba</span>
        </Link>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-20 pt-2 md:pt-10">
        
        {/* HEADER */}
        <div className="text-center mb-12 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            {isLifetime ? (
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 text-amber-700 dark:text-amber-400 text-sm font-black uppercase tracking-widest mb-6">
                   <Crown className="w-4 h-4" /> Founder Tag Vagy
                </div>
            ) : (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 text-amber-700 dark:text-amber-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6">
                   <Sparkles className="w-3 h-3" /> Bevezető Árak
                </div>
            )}
            
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
              {isLifetime ? 'Köszönjük a bizalmat!' : 'Válassz a céljaidhoz illő'} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                  {isLifetime ? 'Tiéd a jövő.' : 'garázs méretet.'}
              </span>
            </h1>
            
            {!isLifetime && (
                <p className="text-slate-600 dark:text-slate-400 text-base md:text-xl leading-relaxed px-4 max-w-2xl mx-auto">
                  Kezdj kicsiben az ingyenes csomaggal, vagy oldd fel a korlátlan lehetőségeket kevesebbért, mint egy ebéd ára.
                </p>
            )}
        </div>

        {/* BILLING TOGGLE */}
        {!isLifetime && (
            <div className="flex items-center justify-center gap-4 mb-12">
                <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Havi</span>
                <button 
                    onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                    className="relative w-14 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                    <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-6 bg-gradient-to-br from-amber-400 to-orange-500' : ''}`} />
                </button>
                <span className={`text-sm font-bold flex items-center gap-2 ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                    Éves <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wide">-17%</span>
                </span>
            </div>
        )}

        {/* PRICING GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl items-start">
            
            {/* 1. FREE PLAN */}
            <div className={`p-6 md:p-8 rounded-3xl border bg-white dark:bg-slate-900/50 backdrop-blur-sm transition-all ${isLifetime ? 'opacity-50 grayscale border-slate-200 dark:border-slate-800' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Starter</h3>
                <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">0 Ft</span>
                    <span className="text-slate-500 font-medium">/ hó</span>
                </div>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed min-h-[40px]">
                    Tökéletes egyetlen autó karbantartásához és alapvető költségkövetéshez.
                </p>
                
                <ul className="space-y-4 mb-8">
                    <FeatureItem text="1 autó kezelése" />
                    <FeatureItem text="Szervizkönyv & Tankolások" />
                    <FeatureItem text="Alapvető statisztikák" />
                    <FeatureItem text="Nincs AI Szerelő" dull />
                    <FeatureItem text="Nincs Cloud Sync (csak lokális)" dull />
                </ul>

                <button 
                    onClick={handleEnterDashboard}
                    disabled={loadingDashboard}
                    className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                    {loadingDashboard ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Kezdés Ingyen
                </button>
            </div>

            {/* 2. PRO PLAN */}
            <div className={`relative p-1 rounded-[26px] transition-all transform ${isLifetime ? 'opacity-50 grayscale scale-95' : 'bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 shadow-2xl shadow-indigo-500/20 md:-translate-y-4'}`}>
                {!isLifetime && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-2 whitespace-nowrap">
                        <Zap className="w-3 h-3 fill-white" /> Népszerű
                    </div>
                )}

                <div className="bg-white dark:bg-[#0A0A0A] rounded-[22px] p-6 md:p-8 h-full relative overflow-hidden">
                    <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Pro</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
                            {billingCycle === 'monthly' ? '890' : '740'} Ft
                        </span>
                        <span className="text-slate-500 font-bold">/ hó</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-6">
                        {billingCycle === 'monthly' ? 'Havonta számlázva' : 'Évente 8.900 Ft számlázva'}
                    </p>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-8 leading-relaxed min-h-[40px]">
                        Minden, amire egy autórajongónak szüksége van. Korlátlan garázs és mesterséges intelligencia.
                    </p>
                    
                    <ul className="space-y-4 mb-8">
                        <FeatureItem text="Akár 10 autó kezelése" active />
                        <FeatureItem text="AI Szerelő & Diagnosztika" active />
                        <FeatureItem text="Prediktív karbantartás" active />
                        <FeatureItem text="Felhő szinkronizáció" active />
                        <FeatureItem text="PDF Export & Megosztás" active />
                    </ul>

                    <button 
                        // JAVÍTÁS: Átadjuk a 'subscription' módot
                        onClick={() => handleCheckout(
                            billingCycle === 'monthly' ? STRIPE_PRICES.monthly : STRIPE_PRICES.yearly, 
                            'subscription'
                        )}
                        disabled={!!loadingStripe || isLifetime || isPro}
                        className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                            isLifetime || isPro 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800'
                            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/30'
                        }`}
                    >
                        {isLifetime ? (
                            <>Már Megvan (Lifetime)</>
                        ) : isPro ? (
                            <>Jelenlegi Csomag</>
                        ) : loadingStripe === 'pro' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <><CreditCard className="w-4 h-4" /> Pro Előfizetés</>
                        )}
                    </button>
                </div>
            </div>

            {/* 3. LIFETIME PLAN */}
            <div className={`p-6 md:p-8 rounded-3xl border bg-amber-50/50 dark:bg-amber-950/10 backdrop-blur-sm transition-all relative overflow-hidden ${
                isLifetime ? 'border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)] scale-105' : 'border-amber-200 dark:border-amber-900/50 hover:border-amber-300 dark:hover:border-amber-700'
            }`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-[60px] -mr-10 -mt-10"></div>
                
                <h3 className="text-xl font-bold text-amber-700 dark:text-amber-500 mb-2 flex items-center gap-2">
                    <Crown className="w-5 h-5" /> Lifetime
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">19.900 Ft</span>
                    <span className="text-slate-500 font-medium">/ egyszer</span>
                </div>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed min-h-[40px]">
                    Egyszeri befektetés, örökös Pro tagság. Soha többé nem kell havidíjat fizetned. Limitált ajánlat!
                </p>
                
                <ul className="space-y-4 mb-8">
                    <FeatureItem text="Minden Pro funkció örökre" active={isLifetime} />
                    <FeatureItem text="Korlátlan (999) autó" active={isLifetime} />
                    <FeatureItem text="Kiemelt ügyfélszolgálat" active={isLifetime} />
                    <FeatureItem text="Founder jelvény a profilodon" active={isLifetime} />
                    <FeatureItem text="Korai hozzáférés új funkciókhoz" active={isLifetime} />
                </ul>

                <button 
                    // JAVÍTÁS: Átadjuk a 'payment' módot (egyszeri fizetés)
                    onClick={() => handleCheckout(STRIPE_PRICES.lifetime, 'payment')}
                    disabled={!!loadingStripe || isLifetime}
                    className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                        isLifetime 
                        ? 'bg-emerald-500 text-white cursor-default shadow-emerald-500/20'
                        : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:opacity-90 shadow-amber-500/20'
                    }`}
                >
                    {isLifetime ? (
                        <><Check className="w-4 h-4" /> Már A Tiéd</>
                    ) : loadingStripe === 'lifetime' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <><Sparkles className="w-4 h-4" /> Megveszem Örökre</>
                    )}
                </button>
            </div>

        </div>

        {/* TRUST BADGES */}
        <div className="mt-16 flex flex-col items-center gap-4 opacity-70">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" /> Biztonságos fizetés Stripe-on keresztül
             </div>
             <p className="text-[10px] text-slate-400 max-w-md text-center">
                 A fizetési adataidat nem tároljuk. A tranzakciót a Stripe, a világ egyik legbiztonságosabb fizetési szolgáltatója dolgozza fel. Bármikor lemondható.
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