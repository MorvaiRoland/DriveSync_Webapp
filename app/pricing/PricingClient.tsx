'use client'

import { useState } from 'react'
import { Check, ArrowLeft, Loader2, Sparkles, Zap, ShieldCheck, Crown, Infinity, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function PricingClient() {
  const [loading, setLoading] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly') // Vizuális elem
  const router = useRouter()

  const handleClaimAccess = async () => {
    setLoading('pro')
    // Itt hívhatnál szerver action-t, hogy beállítsd a usernek a 'pro' flag-et
    // Most szimuláljuk:
    setTimeout(() => {
        router.push('/')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-500 relative overflow-x-hidden">
      
      {/* --- HÁTTÉR EFFEKTEK (Ambient Glows) --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-amber-600/10 rounded-full blur-[140px] opacity-40"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[140px] opacity-30"></div>
         {/* Noise Texture */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <Link href="/" className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium px-4 py-2 rounded-full border border-transparent hover:border-slate-800 hover:bg-slate-900/50">
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
             <span>Vissza a vezérlőpultra</span>
        </Link>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Rendszer Aktív</span>
        </div>
      </nav>

      <main className="relative z-10 pt-10 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
        
        {/* --- HERO SECTION --- */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-6 shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]">
              <Sparkles className="w-3 h-3" /> Early Access Program
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
            A jövő garázsa.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500">
              Most a Tiéd.
            </span>
          </h1>
          
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Csatlakozz a DynamicSense alapítói közé. Használd a legfejlettebb AI alapú járműkezelőt korlátok nélkül az Early Access időszak alatt.
          </p>
        </div>

        {/* --- TOGGLE (Vizuális trükk az értékérzethez) --- */}
        <div className="flex items-center justify-center gap-4 mb-16 animate-in fade-in zoom-in duration-700 delay-100">
            <span className={`text-sm font-bold transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>Havi számlázás</span>
            <button 
                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                className="w-14 h-8 bg-slate-800 rounded-full p-1 relative transition-colors hover:bg-slate-700 border border-slate-700"
            >
                <div className={`w-6 h-6 bg-amber-500 rounded-full shadow-lg transform transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-bold transition-colors flex items-center gap-2 ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-500'}`}>
                Éves számlázás 
                <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">-20%</span>
            </span>
        </div>

        {/* --- PRICING GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-center">
          
          {/* 1. KÁRTYA: START (Disabled Anchor) */}
          <div className="order-2 lg:order-1 relative bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 flex flex-col h-[500px] opacity-60 hover:opacity-100 transition-opacity duration-300">
             <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-300 mb-2">Starter</h3>
                <div className="text-3xl font-black text-slate-500 line-through decoration-slate-600 decoration-2">0 Ft</div>
                <p className="text-sm text-slate-500 mt-4">Az alapcsomag jelenleg nem választható, mivel mindenkit automatikusan a Pro szintre emelünk.</p>
             </div>
             <ul className="space-y-4 mb-8 flex-1">
                 <ListItem text="1 db Autó rögzítése" faded />
                 <ListItem text="Alap szerviznapló" faded />
                 <ListItem text="Manuális adatrögzítés" faded />
             </ul>
             <button disabled className="w-full py-3 rounded-xl border border-slate-800 text-slate-600 font-bold text-sm cursor-not-allowed">
                 Nem elérhető
             </button>
          </div>

          {/* 2. KÁRTYA: PRO (The Hero) */}
          <div className="order-1 lg:order-2 relative bg-slate-900/80 backdrop-blur-xl border border-amber-500/50 rounded-[2rem] p-8 md:p-10 flex flex-col h-auto md:h-[600px] shadow-2xl shadow-amber-500/10 transform hover:scale-[1.02] transition-all duration-500 group z-20">
             {/* Glowing border effect */}
             <div className="absolute -inset-[1px] bg-gradient-to-b from-amber-400 to-transparent rounded-[2rem] opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"></div>
             
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-amber-500/40 flex items-center gap-1">
                 <Crown className="w-3 h-3 fill-current" /> Ajánlott Csomag
             </div>

             <div className="mb-8 border-b border-slate-800 pb-8">
                <h3 className="text-xl font-bold text-amber-500 mb-2 flex items-center gap-2">
                    Pro tagság <span className="bg-amber-500/10 text-amber-400 text-[10px] px-2 py-0.5 rounded border border-amber-500/20">MINDENT BELE</span>
                </h3>
                <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-5xl md:text-6xl font-black text-white">0 Ft</span>
                    <span className="text-slate-500 font-medium line-through text-lg">/ hó</span>
                </div>
                <p className="text-slate-400 text-sm mt-4 leading-relaxed">
                    A teljes DynamicSense élmény. AI alapú elemzések, prediktív karbantartás és korlátlan garázs kapacitás az Early Access ideje alatt.
                </p>
             </div>

             <ul className="space-y-4 mb-8 flex-1">
                 <ListItem text="Korlátlan gépjármű kezelése" active />
                 <ListItem text="Gemini AI Autószerelő Asszisztens" active />
                 <ListItem text="Prediktív hiba-előrejelzés" active />
                 <ListItem text="Digitális szervizkönyv export" active />
                 <ListItem text="Smart Parking & Matrica figyelő" active />
             </ul>

             <button 
                onClick={handleClaimAccess}
                disabled={loading === 'pro'}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden"
             >
                 {loading === 'pro' ? (
                     <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Fiók frissítése...
                     </>
                 ) : (
                     <>
                        <Zap className="w-4 h-4 fill-white" />
                        Ingyenes Aktiválás
                     </>
                 )}
                 {/* Shine effect */}
                 <div className="absolute inset-0 bg-white/20 translate-x-[-100%] animate-[shimmer_2s_infinite] pointer-events-none"></div>
             </button>
             <p className="text-center text-xs text-slate-500 mt-4">
                 Nincs szükség bankkártyára. Bármikor lemondható.
             </p>
          </div>

          {/* 3. KÁRTYA: FOUNDER (Future) */}
          <div className="order-3 relative bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 flex flex-col h-[500px] group hover:border-indigo-500/30 transition-colors duration-300">
             <div className="mb-6">
                <h3 className="text-lg font-bold text-indigo-400 mb-2 flex items-center gap-2">
                    Founder <Infinity className="w-4 h-4" />
                </h3>
                <div className="text-3xl font-black text-white">---</div>
                <p className="text-sm text-slate-500 mt-4">Egy exkluzív klub a legelkötelezettebb támogatóink számára. Hamarosan elérhető.</p>
             </div>
             <ul className="space-y-4 mb-8 flex-1">
                 <ListItem text="Örökös hozzáférés mindenhova" />
                 <ListItem text="Kiemelt VIP Support" />
                 <ListItem text="Fejlesztői Roadmap szavazás" />
                 <ListItem text="Egyedi 'Founder' profil jelvény" />
             </ul>
             <button disabled className="w-full py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed group-hover:border-indigo-500/50 group-hover:text-indigo-400 transition-colors">
                 Hamarosan érkezik
             </button>
          </div>

        </div>

        {/* --- TRUST FOOTER --- */}
        <div className="mt-20 pt-10 border-t border-slate-800 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <FeatureBlock 
                icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />}
                title="Biztonságos Adatok"
                desc="Adataidat titkosítva tároljuk és soha nem adjuk ki harmadik félnek."
            />
            <FeatureBlock 
                icon={<Zap className="w-5 h-5 text-amber-500" />}
                title="Azonnali Hozzáférés"
                desc="A regisztráció után azonnal használhatod az összes Pro funkciót."
            />
            <FeatureBlock 
                icon={<X className="w-5 h-5 text-slate-400" />}
                title="Kockázatmentes"
                desc="Mivel teljesen ingyenes, semmilyen anyagi kockázatot nem vállalsz."
            />
        </div>

      </main>
    </div>
  )
}

// --- HELPER COMPONENTS ---

function ListItem({ text, active, faded }: { text: string, active?: boolean, faded?: boolean }) {
    return (
        <li className={`flex items-start gap-3 text-sm ${faded ? 'opacity-50' : 'opacity-100'}`}>
            <div className={`mt-0.5 rounded-full p-0.5 flex-shrink-0 ${active ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Check className="w-3 h-3" strokeWidth={3} />
            </div>
            <span className={`${active ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>{text}</span>
        </li>
    )
}

function FeatureBlock({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex flex-col items-center md:items-start gap-2">
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 mb-1">
                {icon}
            </div>
            <h4 className="font-bold text-slate-200">{title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
        </div>
    )
}