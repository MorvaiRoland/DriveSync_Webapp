'use client'

import { useState } from 'react'
import { Check, ArrowLeft, Loader2, Sparkles, Zap, ShieldCheck, Rocket, Fingerprint, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface PricingClientProps {
  initialPlan: string
}

export default function PricingClient({ initialPlan }: PricingClientProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleClaimAccess = async () => {
    setLoading(true)
    // Szimulált aktiválás
    setTimeout(() => {
        router.push('/')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-500 relative overflow-x-hidden flex flex-col">
      
      {/* --- HÁTTÉR EFFEKTEK (Deep Space Vibe) --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
         {/* Központi fényrobbanás */}
         <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px]"></div>
         <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
         {/* Rács textúra */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#050505,transparent)]"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <Link href="/" className="group flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-medium">
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
             <span>Vissza</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Early Access Live</span>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full pb-20">
        
        {/* --- HERO SZÖVEG --- */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
           <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter mb-6">
              Egy ár. <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-orange-600">Nulla Forint.</span>
           </h1>
           <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Jelenleg a DynamicSense nyilvános béta fázisban van. <br className="hidden md:block"/>
              Ez azt jelenti, hogy minden <span className="text-white font-bold">Pro funkciót ingyen</span> használhatsz.
           </p>
        </div>

        {/* --- A "BELÉPŐKÁRTYA" (Egyetlen központi elem) --- */}
        <div className="relative w-full max-w-4xl bg-[#0A0A0A] border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50 animate-in zoom-in duration-700 delay-100 group">
            
            {/* Glowing Top Line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>

            <div className="grid grid-cols-1 md:grid-cols-2">
                
                {/* BAL OLDAL: Value Prop */}
                <div className="p-8 md:p-12 flex flex-col justify-between relative">
                    <div>
                        <div className="inline-flex items-center gap-2 text-amber-500 mb-6">
                           <Star className="w-5 h-5 fill-current" />
                           <span className="font-bold tracking-widest text-sm uppercase">All-Inclusive Hozzáférés</span>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-6">Mit kapsz a csatlakozással?</h3>
                        
                        <ul className="space-y-4">
                            <FeatureItem text="Korlátlan számú autó kezelése" />
                            <FeatureItem text="Gemini AI™ Szerelő asszisztens" />
                            <FeatureItem text="Prediktív hiba-előrejelzés" />
                            <FeatureItem text="Digitális szervizkönyv export" />
                            <FeatureItem text="Smart Parking integráció" />
                        </ul>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                                <Fingerprint className="w-6 h-6 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-300 font-bold">Nincs apróbetűs rész.</p>
                                <p className="text-xs text-slate-500">Nem kérünk bankkártyát a regisztrációhoz.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* JOBB OLDAL: The "Action" Side */}
                <div className="relative bg-slate-900/50 p-8 md:p-12 flex flex-col items-center justify-center text-center border-t md:border-t-0 md:border-l border-slate-800 overflow-hidden">
                    
                    {/* Background Animation */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[80px] animate-pulse-slow"></div>

                    <div className="relative z-10">
                        <div className="mb-2 text-sm font-bold text-amber-500 uppercase tracking-widest">Early Access Pass</div>
                        <div className="text-6xl md:text-7xl font-black text-white mb-2 tracking-tighter">0 Ft</div>
                        <div className="text-slate-500 text-sm mb-8 font-medium">Korlátlan ideig érvényes a béta alatt</div>

                        <button 
                            onClick={handleClaimAccess}
                            disabled={loading}
                            className="group/btn relative w-full max-w-xs py-4 rounded-xl bg-white text-black font-bold text-sm uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.5)] transition-all active:scale-95 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Aktiválás...
                                    </>
                                ) : (
                                    <>
                                        Fiók Aktiválása <Rocket className="w-4 h-4" />
                                    </>
                                )}
                            </span>
                            
                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200 to-transparent translate-x-[-100%] group-hover/btn:animate-[shimmer_1s_infinite]"></div>
                        </button>

                        <p className="mt-6 text-xs text-slate-500 flex items-center justify-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            Garantáltan rejtett költségek nélkül
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* --- SOCIAL PROOF / STATS --- */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 opacity-60">
             <StatItem label="Aktív felhasználó" value="1,240+" />
             <StatItem label="Rögzített esemény" value="15k+" />
             <StatItem label="Megspórolt idő" value="∞" />
             <StatItem label="Elégedettség" value="4.9/5" />
        </div>

      </main>
    </div>
  )
}

// --- KISEBB KOMPONENSEK ---

function FeatureItem({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-amber-500/10 p-1 flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <span className="text-slate-300 text-sm font-medium">{text}</span>
        </li>
    )
}

function StatItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="text-center">
            <div className="text-2xl md:text-3xl font-black text-white mb-1">{value}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">{label}</div>
        </div>
    )
}