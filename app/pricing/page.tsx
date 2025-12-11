'use client'
import { useState } from 'react'
import { Check, ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// --- STRIPE PRICING ID-K (Beillesztve) ---
const PRICES = {
  monthly: 'price_1Sd8zXRbHGQdHUF4vMQbDKjt', // Pro Havi
  yearly: 'price_1Sd8zyRbHGQdHUF4mutCgwbV',  // Pro Éves
  lifetime: 'price_1Sd90LRbHGQdHUF4SWmp0rJM' // Lifetime
}

export default function PricingComponent() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null) // Melyik gomb tölt épp

  const handleCheckout = async (priceId: string, mode: 'subscription' | 'payment') => {
    setLoadingId(priceId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, mode })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Hiba történt a fizetés indításakor.')
      }

      if (data.url) {
        router.push(data.url) // Átirányítás a Stripe biztonságos oldalára
      }
    } catch (error: any) {
      console.error(error)
      alert("Hiba: " + error.message)
      // Ha 401-es hiba (nincs bejelentkezve), irány a login
      if (error.message === 'Nincs bejelentkezve') {
          router.push('/login')
      }
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-500/30 pb-20">
      
      {/* Egyszerű Navigáció */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm group">
            <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-4 h-4" /> 
            </div>
            <span>Vissza a garázshoz</span>
        </Link>
        <div className="flex items-center gap-2 opacity-80">
            <div className="relative w-6 h-6">
                 <Image src="/drivesync-logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="font-black text-lg hidden sm:block tracking-tight">Drive<span className="text-amber-500">Sync</span></span>
        </div>
      </nav>

      <div className="py-12 px-4 md:py-20">
        {/* Fejléc */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6">
             💎 Prémium Tagság
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            Válassz csomagot, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">növeld az autód értékét.</span>
          </h1>
          <p className="text-slate-400 mb-10 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            A DriveSync Pro nem csak kényelem, hanem befektetés. Egy pontosan vezetett digitális szervizkönyv milliókkal növelheti az eladási árat.
          </p>
          
          {/* Havi / Éves váltó */}
          <div className="inline-flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-xl relative">
            <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all relative z-10 ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>Havi</button>
            <button onClick={() => setBillingCycle('yearly')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all relative z-10 ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>Éves <span className="text-amber-500 text-[10px] ml-1 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/30">-20%</span></button>
            
            {/* Animált háttér a gombhoz */}
            <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-slate-800 rounded-xl transition-all duration-300 shadow-sm border border-slate-700 ${billingCycle === 'monthly' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}></div>
          </div>
        </div>

        {/* Csomagok Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* 1. STARTER (Ingyenes) */}
          <PricingCard 
            title="Starter" 
            price="0 Ft" 
            desc="Kezdő autósoknak, az alapokhoz."
            features={[
                '1 Autó kezelése', 
                'Alap szerviznapló', 
                'Tankolás követés', 
                'Emlékeztetők (max 3)'
            ]}
            buttonText="Jelenlegi csomag"
            disabled
          />

          {/* 2. PRO (Kiemelt) - Itt használjuk a Havi/Éves ID-t */}
          <PricingCard 
            title="Pro" 
            price={billingCycle === 'monthly' ? '1.490 Ft' : '14.900 Ft'} 
            period={billingCycle === 'monthly' ? '/ hó' : '/ év'}
            desc="Komoly tulajdonosoknak, akik mindent látni akarnak."
            highlight
            features={[
                'Korlátlan autó', 
                'AI Szerelő (GPT-4o) 🤖', 
                'Digitális Kesztyűtartó (Dokumentumok)', 
                'Részletes statisztikák & Grafikonok', 
                'Excel & PDF Exportálás',
                'Kereskedői "Eladó" adatlap generálás'
            ]}
            buttonText="Kipróbálom"
            isLoading={loadingId === (billingCycle === 'monthly' ? PRICES.monthly : PRICES.yearly)}
            onClick={() => handleCheckout(
                billingCycle === 'monthly' ? PRICES.monthly : PRICES.yearly, 
                'subscription'
            )}
          />

          {/* 3. LIFETIME (Egyszeri) - Itt használjuk a Lifetime ID-t */}
          <PricingCard 
            title="Lifetime" 
            price="39.990 Ft" 
            desc="Egyszeri befektetés. Nincs több havidíj soha."
            period=""
            features={[
                'Minden Pro funkció örökre', 
                'Örökös frissítések', 
                'Nincs havidíj soha', 
                'VIP Támogatás', 
                'Egyedi "Founder" jelvény a profilodon 🚀'
            ]}
            buttonText="Megveszem örökre"
            isLoading={loadingId === PRICES.lifetime}
            onClick={() => handleCheckout(PRICES.lifetime, 'payment')}
          />
        </div>
        
        <div className="mt-16 text-center border-t border-slate-900 pt-8 max-w-2xl mx-auto">
            <div className="flex justify-center gap-4 mb-4 text-slate-600 grayscale opacity-70">
                {/* Bankkártya ikonok helye (opcionális dekoráció) */}
                <div className="h-8 w-12 bg-slate-900 rounded border border-slate-800"></div>
                <div className="h-8 w-12 bg-slate-900 rounded border border-slate-800"></div>
                <div className="h-8 w-12 bg-slate-900 rounded border border-slate-800"></div>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
                A fizetés a <strong>Stripe</strong> titkosított, banki szintű biztonságos rendszerén keresztül történik. 
                A DriveSync szerverei semmilyen bankkártyaadatot nem tárolnak. 
                Az előfizetés bármikor, egy kattintással lemondható a beállításokban.
                A feltüntetett árak tartalmazzák az ÁFÁ-t.
            </p>
        </div>
      </div>
    </div>
  )
}

// --- SEGÉD KOMPONENS: KÁRTYA ---
function PricingCard({ title, price, period, desc, features, highlight, buttonText, disabled, onClick, isLoading }: any) {
  return (
    <div className={`
        relative p-8 rounded-[2rem] flex flex-col h-full transition-all duration-500
        ${highlight 
            ? 'bg-slate-900 border-2 border-amber-500 shadow-[0_0_60px_rgba(245,158,11,0.15)] md:-mt-8 md:mb-8 z-10 scale-100 hover:scale-[1.02]' 
            : 'bg-slate-900/40 border border-slate-800 hover:border-slate-700 backdrop-blur-sm'
        }
    `}>
      {highlight && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 text-xs font-black px-6 py-2 rounded-full uppercase tracking-wider shadow-lg whitespace-nowrap">
            Legnépszerűbb választás
        </div>
      )}
      
      <div className="mb-8">
          <h3 className={`text-xl font-bold mb-3 ${highlight ? 'text-white' : 'text-slate-200'}`}>{title}</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl md:text-5xl font-black text-white tracking-tight">{price}</span>
            <span className="text-sm font-bold text-slate-500">{period}</span>
          </div>
          <p className="text-slate-400 text-sm mt-4 font-medium leading-relaxed">{desc}</p>
      </div>
      
      <button 
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`
            w-full py-4 rounded-xl font-bold mb-8 transition-all flex items-center justify-center gap-2
            ${disabled 
                ? 'bg-slate-800/50 text-slate-500 cursor-default border border-slate-800' 
                : highlight 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 shadow-lg shadow-amber-500/20 active:scale-95' 
                    : 'bg-white text-slate-900 hover:bg-slate-100 active:scale-95'
            }
        `}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {buttonText}
      </button>

      <div className="space-y-4 flex-1">
        {features.map((f: string, i: number) => (
          <div key={i} className="flex items-start gap-3 text-sm group">
            <div className={`
                mt-0.5 rounded-full p-0.5 flex-shrink-0
                ${highlight ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300 transition-colors'}
            `}>
                <Check className="w-3 h-3" strokeWidth={4} /> 
            </div>
            <span className={highlight ? 'text-slate-200' : 'text-slate-400 group-hover:text-slate-300 transition-colors'}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}