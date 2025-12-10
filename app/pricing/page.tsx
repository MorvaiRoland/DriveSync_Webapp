import { createClient } from '@/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// --- SERVER ACTION: Founder Aktiválás (Vásárlás szimuláció) ---
async function activateFounderPlan() {
  'use server'
  const supabase = await createClient()
  
  // 1. Ellenőrizzük a felhasználót
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // Ha nincs bejelentkezve, irány a regisztráció
    return redirect('/login?mode=signup')
  }

  // 2. Aktiváljuk a Founder csomagot az adatbázisban
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: user.id,
      plan_type: 'founder',
      status: 'active',
      // updated_at: new Date().toISOString() // Ha van ilyen oszlopod
    }, { onConflict: 'user_id' })

  if (error) {
    console.error("Founder activation error:", error)
    // Itt lehetne hibaüzenetet dobni, de most egyszerűsítünk
    return
  }

  // 3. Frissítjük az oldalt és visszairányítjuk a dashboardra
  revalidatePath('/', 'layout')
  redirect('/?success=founder_activated')
}

// --- FŐ KOMPONENS ---
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
    
    if (sub && (sub.status === 'active' || sub.status === 'trialing')) {
        currentPlan = sub.plan_type
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30 overflow-x-hidden">
      
      {/* HEADER + NAV */}
      <nav className="border-b border-white/5 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2 md:gap-3 group">
              <div className="relative w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:scale-110">
                 <Image src="/drivesync-logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="font-black text-lg md:text-xl text-white uppercase tracking-tight">Drive<span className="text-amber-500">Sync</span></span>
           </Link>
           
           <div className="flex items-center gap-3 md:gap-4">
               {!user ? (
                 <>
                    <Link href="/login" className="hidden sm:block text-xs md:text-sm font-bold text-slate-400 hover:text-white transition-colors">Bejelentkezés</Link>
                    <Link href="/login?mode=signup" className="text-xs md:text-sm font-bold bg-amber-500 text-slate-900 px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95">
                        Regisztráció
                    </Link>
                 </>
               ) : (
                 <Link href="/" className="text-xs md:text-sm font-bold text-slate-300 hover:text-white flex items-center gap-2 bg-white/5 px-3 py-2 md:px-4 md:py-2 rounded-full border border-white/10 hover:bg-white/10 transition-all">
                    <span>Vezérlőpult</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                 </Link>
               )}
           </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="relative pt-12 pb-20 md:pt-20 md:pb-32">
         {/* Háttér dekoráció */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] md:w-[1000px] h-[500px] md:h-[600px] bg-amber-600/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none -z-10 animate-pulse-slow"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span>🚀</span> Bevezető akció
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 md:mb-6 tracking-tight leading-[1.1]">
               Fektess be az autód <br className="hidden md:block" />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500">jövőjébe.</span>
            </h1>
            <p className="text-base md:text-xl text-slate-400 max-w-xl md:max-w-2xl mx-auto leading-relaxed mb-8 md:mb-12 px-4">
               Válassz a szükségleteidnek megfelelően. Jelenleg minden új regisztráló <span className="text-amber-400 font-bold">Örökös Founder</span> státuszt kap ajándékba!
            </p>

            {/* TOGGLE (Design only) */}
            <div className="inline-flex bg-slate-900 p-1 rounded-xl border border-slate-800 mb-12 md:mb-16 shadow-lg">
                <button className="px-4 md:px-6 py-2 rounded-lg bg-slate-800 text-white text-xs md:text-sm font-bold shadow-sm">Havi</button>
                <button className="px-4 md:px-6 py-2 rounded-lg text-slate-500 text-xs md:text-sm font-medium hover:text-slate-300 transition-colors">Éves <span className="text-amber-500 text-[10px] ml-1">-20%</span></button>
            </div>
         </div>

         {/* PRICING GRID */}
         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
            
            {/* 1. FREE (STARTER) */}
            <div className="order-2 md:order-1 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col h-full hover:border-slate-700 transition-colors duration-300">
               <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">Starter</h3>
                  <p className="text-slate-400 text-sm">Az alapok, amikre minden autósnak szüksége van.</p>
               </div>
               <div className="mb-8">
                  <span className="text-4xl font-black text-white">Ingyenes</span>
               </div>
               
               {/* Gomb Logika */}
               {currentPlan === 'free' ? (
                   <button disabled className="w-full py-3 rounded-xl font-bold text-center mb-8 border border-slate-700 text-slate-500 cursor-default bg-slate-800/50">
                      Jelenlegi Csomag
                   </button>
               ) : (
                   <div className="w-full py-3 rounded-xl font-bold text-center mb-8 border border-slate-700 text-white">
                      Aktív Csomag
                   </div>
               )}

               <ul className="space-y-4 text-sm text-slate-300 flex-1">
                  <FeatureItem text="1 autó kezelése" />
                  <FeatureItem text="Alapvető szerviznapló" />
                  <FeatureItem text="Költségek követése" />
                  <FeatureItem text="Emlékeztetők (Max 3)" />
                  <FeatureItem text="Dokumentum tárolás" disabled />
                  <FeatureItem text="Adatexportálás" disabled />
               </ul>
            </div>

            {/* 2. FOUNDER (KIEMELT - KÖZÉPEN) */}
            <div className="order-1 md:order-2 bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 md:p-8 flex flex-col h-full relative shadow-[0_0_50px_rgba(245,158,11,0.15)] transform md:scale-105 z-10">
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] md:text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg whitespace-nowrap">
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
               
               {/* AKTIVÁLÓ GOMB (SERVER ACTION) */}
               {currentPlan === 'founder' ? (
                   <button disabled className="w-full py-4 rounded-xl font-bold text-center mb-8 bg-amber-900/20 text-amber-500 border border-amber-500/50 cursor-default">
                      Founder Státusz Aktív ✅
                   </button>
               ) : (
                   <form action={activateFounderPlan}>
                       <button type="submit" className="w-full py-4 rounded-xl font-bold text-center mb-8 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-900 shadow-lg shadow-amber-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                          Kérem a Founder Státuszt
                       </button>
                   </form>
               )}

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
            <div className="order-3 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col h-full hover:border-slate-700 transition-colors duration-300 opacity-60 grayscale hover:grayscale-0 hover:opacity-100">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-32">
         <div className="border-t border-slate-800 pt-16">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-12 text-center">Gyakran Ismételt Kérdések</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
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
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-center px-4">
         <p className="text-slate-600 text-xs md:text-sm">© 2025 DriveSync Technologies. Minden jog fenntartva.</p>
         <div className="flex justify-center gap-4 mt-4 text-xs text-slate-700">
            <Link href="/terms" className="hover:text-slate-500">ÁSZF</Link>
            <Link href="/privacy" className="hover:text-slate-500">Adatvédelem</Link>
         </div>
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
            <h4 className="text-white font-bold mb-3 text-base md:text-lg">{q}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
        </div>
    )
}