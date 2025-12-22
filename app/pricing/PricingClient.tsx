'use client'

import { useState } from 'react'
import { Check, ArrowLeft, Loader2, Fingerprint, Star, Zap, LayoutDashboard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface PricingClientProps {
  initialPlan: string
}

export default function PricingClient({ initialPlan }: PricingClientProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleEnterDashboard = async () => {
    setLoading(true)
    setTimeout(() => {
        router.push('/')
    }, 1000)
  }

  return (
    // FŐ KONTÉNER: bg-white világosban, bg-[#050505] sötétben
    <div className="min-h-screen bg-white dark:bg-[#050505] text-slate-900 dark:text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-600 dark:selection:text-amber-500 relative overflow-x-hidden flex flex-col transition-colors duration-300">
      
      {/* --- HÁTTÉR EFFEKTEK --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         {/* Színes gömbök - világos módban halványabbak */}
         <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[120px]"></div>
         <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px]"></div>
         
         {/* Rács háttér - sötét/világos verzió */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         
         {/* Vignette effekt - világosban fehér, sötétben fekete */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,transparent,white)] dark:bg-[radial-gradient(circle_800px_at_50%_200px,#050505,transparent)]"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <Link href="/" className="group flex items-center gap-2 text-slate-600 hover:text-black dark:text-slate-500 dark:hover:text-white transition-colors text-sm font-medium">
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
             <span>Vissza</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Early Access Live</span>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full pb-20">
        
        {/* --- HERO SZÖVEG --- */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
           <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">
              A fiókod készen áll. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 dark:from-amber-300 dark:via-amber-500 dark:to-orange-600">Pro szint: Engedélyezve.</span>
           </h1>
           <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Mivel a DynamicSense nyilvános béta fázisban van, a regisztrációddal automatikusan megkaptad a 
              <span className="text-black dark:text-white font-bold ml-1">teljes hozzáférést</span> minden prémium funkcióhoz.
           </p>
        </div>

        {/* --- A "STATUS CARD" --- */}
        {/* CARD CONTÁINER: Fehér alap sötét borderrel világosban, Fekete alap sötétben */}
        <div className="relative w-full max-w-4xl bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/50 animate-in zoom-in duration-700 delay-100 group transition-colors">
            
            {/* Glowing Top Line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>

            <div className="grid grid-cols-1 md:grid-cols-2">
                
                {/* BAL OLDAL: Mit tartalmaz a csomag */}
                <div className="p-8 md:p-12 flex flex-col justify-between relative">
                    <div>
                        <div className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-500 mb-6">
                           <Star className="w-5 h-5 fill-current" />
                           <span className="font-bold tracking-widest text-sm uppercase">Aktív Csomagod</span>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">A fiókod tartalmazza:</h3>
                        
                        <ul className="space-y-4">
                            <FeatureItem text="Korlátlan számú autó kezelése" />
                            <FeatureItem text="Gemini AI™ Szerelő asszisztens" />
                            <FeatureItem text="Prediktív hiba-előrejelzés" />
                            <FeatureItem text="Digitális szervizkönyv export" />
                            <FeatureItem text="Smart Parking integráció" />
                        </ul>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                <Fingerprint className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-900 dark:text-slate-300 font-bold">Örökös hozzáférés a béta alatt.</p>
                                <p className="text-xs text-slate-500">Nem szükséges semmilyen további lépés.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* JOBB OLDAL: STATUS CONFIRMATION & ENTER */}
                {/* Jobb oldali panel háttere: világos szürke világosban, sötét szürke sötétben */}
                <div className="relative bg-slate-50/80 dark:bg-slate-900/50 p-8 md:p-12 flex flex-col items-center justify-center text-center border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                    
                    {/* Background Animation */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] animate-pulse-slow"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        
                        {/* Status Badge */}
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 mb-6 shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]">
                            <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-500" strokeWidth={3} />
                        </div>

                        <div className="mb-2 text-sm font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Jogosultság Megadva</div>
                        <div className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">AKTÍV</div>
                        <div className="text-slate-500 text-sm mb-10 font-medium">Early Access Pro Licenc</div>

                        <button 
                            onClick={handleEnterDashboard}
                            disabled={loading}
                            // GOMB: Világosban fekete, sötétben fehér (kontraszt miatt)
                            className="group/btn relative w-full max-w-xs py-4 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black font-bold text-sm uppercase tracking-wider shadow-xl hover:shadow-2xl transition-all active:scale-95 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Betöltés...
                                    </>
                                ) : (
                                    <>
                                        <>
                                            Vezérlőpult Megnyitása <LayoutDashboard className="w-4 h-4" />
                                        </>
                                    </>
                                )}
                            </span>
                            
                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent translate-x-[-100%] group-hover/btn:animate-[shimmer_1s_infinite]"></div>
                        </button>

                        <p className="mt-6 text-xs text-slate-500 flex items-center justify-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            Készen állsz az indulásra
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* --- STATS (Verzió és Status) --- */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 opacity-60">
             <StatItem label="Jelenlegi Verzió" value="v2.3 Beta" />
             <StatItem label="Havi Költség" value="0 Ft" />
             <StatItem label="Státusz" value="Stabil" />
             <StatItem label="Támogatás" value="24/7 AI" />
        </div>

      </main>
    </div>
  )
}

// --- KISEBB KOMPONENSEK ---

function FeatureItem({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 p-1 flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
            </div>
            <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{text}</span>
        </li>
    )
}

function StatItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="text-center">
            <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-1">{value}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">{label}</div>
        </div>
    )
}