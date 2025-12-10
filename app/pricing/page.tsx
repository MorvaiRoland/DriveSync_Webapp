import { createClient } from '@/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentPlan = 'free'

  if (user) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status, plan_type')
      .eq('user_id', user.id)
      .single()
    
    // Ha van aktív előfizetés vagy "founder" státusz
    if (sub && (sub.status === 'active' || sub.status === 'trialing')) {
        currentPlan = sub.plan_type
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30">
      
      {/* HEADER + NAV */}
      <nav className="border-b border-white/5 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
                 <Image src="/drivesync-logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="font-black text-xl text-white uppercase tracking-tight">Drive<span className="text-amber-500">Sync</span></span>
           </Link>
           
           <div className="flex items-center gap-4">
               {!user ? (
                 <>
                    <Link href="/login" className="hidden sm:block text-sm font-bold text-slate-400 hover:text-white transition-colors">Bejelentkezés</Link>
                    <Link href="/login?mode=signup" className="text-sm font-bold bg-amber-500 text-slate-900 px-4 py-2 rounded-lg hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20">
                        Regisztráció
                    </Link>
                 </>
               ) : (
                 <Link href="/" className="text-sm font-bold text-slate-300 hover:text-white flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-all">
                    <span>Vezérlőpult</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                 </Link>
               )}
           </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="relative pt-20 pb-32 overflow-hidden">
         {/* Háttér dekoráció */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6">
                <span>🚀</span> Bevezető akció
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
               Fektess be az autód <br className="hidden md:block" />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500">jövőjébe.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
               Válassz a szükségleteidnek megfelelően. Jelenleg minden új regisztráló <span className="text-amber-400 font-bold">Örökös Founder</span> státuszt kap ajándékba!
            </p>

            {/* TOGGLE (Vizuális elem, funkció nélkül, csak a design kedvéért) */}
            <div className="inline-flex bg-slate-900 p-1 rounded-xl border border-slate-800 mb-16">
                <button className="px-6 py-2 rounded-lg bg-slate-800 text-white text-sm font-bold shadow-sm">Havi</button>
                <button className="px-6 py-2 rounded-lg text-slate-500 text-sm font-medium hover:text-slate-300 transition-colors">Éves <span className="text-amber-500 text-[10px] ml-1">-20%</span></button>
            </div>
         </div>

         {/* PRICING GRID */}
         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* 1. FREE (STARTER) */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 flex flex-col h-full hover:border-slate-700 transition-colors duration-300">
               <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">Starter</h3>
                  <p className="text-slate-400 text-sm">Az alapok, amikre minden autósnak szüksége van.</p>
               </div>
               <div className="mb-8">
                  <span className="text-4xl font-black text-white">Ingyenes</span>
               </div>
               <Link href={user ? "/" : "/login"} className={`w-full py-3 rounded-xl font-bold text-center mb-8 border border-slate-700 hover:bg-slate-800 transition-all ${currentPlan === 'free' ? 'opacity-50 cursor-not-allowed' : 'text-white'}`}>
                  {currentPlan === 'free' ? 'Jelenlegi csomagod' : 'Kezdés ezzel'}
               </Link>
               <ul className="space-y-4 text-sm text-slate-300 flex-1">
                  <FeatureItem text="1 autó kezelése" />
                  <FeatureItem text="Alapvető szerviznapló" />
                  <FeatureItem text="Költségek követése" />
                  <FeatureItem text="Emlékeztetők (Max 3)" />
                  <FeatureItem text="Dokumentum tárolás" disabled />
                  <FeatureItem text="Adatexportálás" disabled />
               </ul>
            </div>

            {/* 2. FOUNDER (KIEMELT) */}
            <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-8 flex flex-col h-full relative shadow-[0_0_50px_rgba(245,158,11,0.15)] scale-105 z-10">
               <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg whitespace-nowrap">
                  Limitált Ajánlat 🔥
               </div>
               <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                     <h3 className="text-xl font-bold text-white">Founder</h3>
                     <span className="text-2xl">🚀</span>
                  </div>
                  <p className="text-amber-100/70 text-sm">Minden Pro funkció örökre, havi díj nélkül.</p>
               </div>
               <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                     <span className="text-5xl font-black text-white">0 Ft</span>
                     <span className="text-slate-500 line-through font-medium">1.990 Ft/hó</span>
                  </div>
                  <p className="text-xs text-amber-500 font-bold mt-2 uppercase tracking-wide">Örökös hozzáférés</p>
               </div>
               <Link 
                  href={user ? "/" : "/login?mode=signup"} 
                  className={`w-full py-4 rounded-xl font-bold text-center mb-8 shadow-lg shadow-amber-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                      currentPlan === 'founder' 
                      ? 'bg-amber-900/20 text-amber-500 border border-amber-500/50 cursor-default' 
                      : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-900'
                  }`}
               >
                  {currentPlan === 'founder' ? 'Founder Státusz Aktív' : 'Kérem a Founder Státuszt'}
               </Link>
               <ul className="space-y-4 text-sm text-white flex-1">
                  <FeatureItem text="Korlátlan autó" active />
                  <FeatureItem text="AI Szerelő (GPT-4o)" active />
                  <FeatureItem text="Digitális Kesztyűtartó" active />
                  <FeatureItem text="Kereskedői QR adatlap" active />
                  <FeatureItem text="Részletes statisztikák" active />
                  <FeatureItem text="PDF & Excel Export" active />
                  <FeatureItem text="Prioritásos támogatás" active />
               </ul>
            </div>

            {/* 3. PRO (Standard) */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 flex flex-col h-full hover:border-slate-700 transition-colors duration-300 opacity-60 grayscale hover:grayscale-0 hover:opacity-100">
               <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">Pro</h3>
                  <p className="text-slate-400 text-sm">A jövőbeli standard csomag árazása.</p>
               </div>
               <div className="mb-8">
                  <span className="text-4xl font-black text-white">1.990 Ft</span>
                  <span className="text-slate-500 text-sm"> / hó</span>
               </div>
               <button disabled className="w-full py-3 rounded-xl font-bold text-center mb-8 border border-slate-700 text-slate-500 cursor-not-allowed bg-slate-800/50">
                  Hamarosan
               </button>
               <ul className="space-y-4 text-sm text-slate-300 flex-1">
                  <FeatureItem text="Akár 10 autó" />
                  <FeatureItem text="AI Szerelő" />
                  <FeatureItem text="Digitális Kesztyűtartó" />
                  <FeatureItem text="Statisztikák" />
                  <FeatureItem text="Exportálás" />
               </ul>
            </div>

         </div>
      </div>

      {/* FAQ SECTION */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
         <div className="border-t border-slate-800 pt-16">
            <h2 className="text-3xl font-black text-white mb-12 text-center">Gyakran Ismételt Kérdések</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <FaqItem 
   q="Tényleg ingyenes marad örökre?" 
   a="Igen! A 'Founder' státusz egy 'early adopter' jutalom. Aki most csatlakozik, annak a fiókja megkapja ezt a jelölést, és soha nem fogjuk korlátozni a jelenlegi Pro funkciókat." 
/>
               <FaqItem 
                  q="Mi történik, ha lemaradok az akcióról?" 
                  a="Az akciós időszak után regisztráló felhasználók a Free csomagba kerülnek, és ha szeretnék a bővített funkciókat (pl. több autó, dokumentumok), akkor elő kell fizetniük a havi díjas Pro csomagra." 
               />
               <FaqItem 
                  q="Hány autót vihetek fel?" 
                  a="A Founder csomagban nincs korlát. A Free csomagban 1 autót, a későbbi Pro csomagban 10 autót lehet majd kezelni." 
               />
               <FaqItem 
                  q="Biztonságban vannak az adataim?" 
                  a="Abszolút. Az adatokat titkosítva tároljuk a Supabase szerverein (EU régió), és soha nem adjuk ki harmadik félnek reklám céljából." 
               />
            </div>
         </div>
      </div>

      {/* FOOTER SIMPLE */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-center">
         <p className="text-slate-600 text-sm">© 2025 DriveSync Technologies. Minden jog fenntartva.</p>
      </footer>

    </div>
  )
}

// --- KISEBB KOMPONENSEK ---

function FeatureItem({ text, disabled, active }: { text: string, disabled?: boolean, active?: boolean }) {
  return (
    <li className={`flex items-start gap-3 ${disabled ? 'opacity-40' : ''}`}>
      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${active ? 'bg-amber-500 text-slate-900 shadow-sm shadow-amber-500/50' : disabled ? 'bg-slate-800 text-slate-500' : 'bg-slate-800 text-slate-300'}`}>
        {disabled ? (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        )}
      </div>
      <span className={`${active ? 'text-white font-medium' : disabled ? 'text-slate-500 decoration-slate-600 line-through' : 'text-slate-300'}`}>{text}</span>
    </li>
  )
}

function FaqItem({ q, a }: { q: string, a: string }) {
    return (
        <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800 hover:bg-slate-900/50 transition-colors">
            <h4 className="text-white font-bold mb-3 text-lg">{q}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
        </div>
    )
}