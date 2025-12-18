'use client'

import { useState } from 'react'
import { Check, ArrowLeft, Loader2, Sparkles, ShieldCheck, Zap, XCircle, Rocket } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface PricingClientProps {
  initialPlan: string // 'free' | 'pro' | 'lifetime' | 'founder'
}

export default function PricingClient({ initialPlan }: PricingClientProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  // --- AKTIVÁLÁSI LOGIKA (FIZETÉS HELYETT) ---
  const handleSelectPlan = async (planName: string) => {
    setLoading(planName)
    
    // Szimulált töltés az élményért
    setTimeout(() => {
        router.push('/') // Visszairányít a Dashboardra, mivel mindenki Pro
    }, 800)
  }

  const isActive = (planKey: string) => {
      // Mivel most mindenki "Pro", ezért a Pro-t jelöljük aktívnak, ha már bent van
      if (planKey === 'pro') return true; 
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm backdrop-blur-sm">
             <Rocket className="w-3 h-3" /> Early Access Időszak
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-[1.1] text-slate-900 dark:text-white">
            Most minden csomag <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">teljesen ingyenes.</span>
          </h1>
          
          <p className="text-slate-600 dark:text-slate-400 mb-12 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            A DynamicSense bevezetési időszakában vagyunk. Használd a Pro funkciókat korlátok és bankkártya nélkül. Építsük együtt a jövő garázsát!
          </p>
        </div>

        {/* --- PRICING CARDS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* 1. STARTER CSOMAG (Összehasonlításnak) */}
          <PricingCard 
            title="Starter" 
            price="0 Ft" 
            desc="Az alapok, amikre minden autósnak szüksége van."
            features={[
                '1 db Autó kezelése', 
                'Korlátlan szerviznapló', 
                'Tankolás követés', 
                'Alap emlékeztetők',
                'Gumi hotel'
            ]}
            buttonText="Alapértelmezett"
            disabled={true} 
            isCurrent={false}
            delay={100}
          />

          {/* 2. PRO CSOMAG (A lényeg) */}
          <PricingCard 
            title="Pro" 
            price="0 Ft" 
            period="/ örökre"
            desc="Minden okos funkció feloldva az Early Access alatt."
            highlight={true}
            features={[
              'Korlátlan Garázs', 
              'AI Szerelő (Gemini 2.5) 🤖', 
              'Prediktív Karbantartás 🔮', 
              'Digitális Kesztyűtartó 📂', 
              'Eladási Adatlap generálás 💰',
              'Teljes Analitika & Export 📊'
            ]}
            buttonText={loading === 'pro' ? "Aktiválás..." : "Kiválasztom Ingyen"}
            // Ha már "bent" van a rendszerben, akkor is engedjük, hogy rányomjon az élmény miatt
            onClick={() => handleSelectPlan('pro')}
            isLoading={loading === 'pro'}
            delay={200}
            badge="EARLY ACCESS AJÁNDÉK"
            limited={true}
          />

          {/* 3. LIFETIME CSOMAG (Jövőkép) */}
          <PricingCard 
            title="Lifetime" 
            price="---" 
            desc="Hamarosan érkezik a támogatói csomagok számára."
            period=""
            features={[
              'Minden Pro funkció örökre', 
              'Kiemelt VIP státusz', 
              'Fejlesztői roadmap szavazás', 
              'Dedikált support', 
              'Egyedi jelvények 🚀'
            ]}
            buttonText="Hamarosan"
            disabled={true}
            delay={300}
            specialBorder={true}
          />
        </div>
        
        {/* --- TRUST BADGE FOOTER --- */}
        <div className="mt-24 text-center border-t border-slate-200 dark:border-slate-800 pt-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <p className="text-slate-500 dark:text-slate-500 text-xs leading-relaxed flex flex-col items-center gap-2">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-400 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Nem szükséges bankkártya.
                </span>
                A jelenlegi regisztrációval automatikusan megkapod a Pro jogosultságot.<br/>
                Az Early Access időszak alatt a szolgáltatás teljes körűen ingyenes.
            </p>
        </div>
      </div>
    </div>
  )
}

// --- SEGÉD KOMPONENS: PRICING CARD ---
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
  limited,   
  badge      
}: any) {
  return (
    <div 
        className={`
          relative p-8 rounded-[2.5rem] flex flex-col h-full transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 fill-mode-forwards group
          ${highlight 
            ? 'bg-white dark:bg-slate-900 border-2 border-amber-500 shadow-2xl shadow-amber-500/10 md:-mt-8 md:mb-8 z-10 scale-100 hover:scale-[1.02]' 
            : specialBorder
                ? 'bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 opacity-75'
                : 'bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 backdrop-blur-md shadow-lg'
          }
          ${isCurrent ? 'ring-2 ring-emerald-500 shadow-emerald-500/10' : ''}
        `}
        style={{ animationDelay: `${delay}ms` }}
    >
      {/* Jelvények */}
      {highlight && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-black px-6 py-2 rounded-full uppercase tracking-wider shadow-lg shadow-amber-500/30 whitespace-nowrap flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-white" /> Ajánlott
        </div>
      )}

      {limited && badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-bold animate-pulse shadow-lg whitespace-nowrap z-20">
          {badge}
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
      
      {/* Fő gomb */}
      <button 
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`
            w-full py-4 rounded-2xl font-bold mb-4 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wide
            ${disabled 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default border border-slate-200 dark:border-slate-700' 
                : highlight 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-500/30 active:scale-95' 
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 active:scale-95 shadow-md'
            }
        `}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {buttonText}
      </button>
      
      {/* Feature lista */}
      <div className="space-y-4 flex-1">
        {features.map((f: string, i: number) => (
          <div key={i} className="flex items-start gap-3 text-sm group/item">
            <div className={`
                mt-0.5 rounded-full p-0.5 flex-shrink-0 transition-colors
                ${highlight ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}
            `}>
                <Check className="w-3 h-3" strokeWidth={4} /> 
            </div>
            <span className={`transition-colors ${highlight ? 'text-slate-700 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}