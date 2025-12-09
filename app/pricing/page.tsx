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
    
    if (sub && sub.status === 'active') {
        currentPlan = sub.plan_type // 'founder' vagy 'pro'
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30">
      
      {/* HEADER + NAV (Egyszerűsített) */}
      <nav className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                 <Image src="/drivesync-logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="font-bold text-white uppercase tracking-tight">Drive<span className="text-amber-500">Sync</span></span>
           </Link>
           {!user && (
             <Link href="/login" className="text-sm font-bold text-white hover:text-amber-400 transition-colors">Bejelentkezés</Link>
           )}
           {user && (
             <Link href="/" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Vissza a vezérlőpultra</Link>
           )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        
        {/* CÍMSOR */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-amber-500 font-bold tracking-widest uppercase text-sm mb-2">Csomagajánlatok</h2>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Fektess be az autód jövőjébe.</h1>
          <p className="text-lg text-slate-400">
            Válassz a szükségleteidnek megfelelően. Jelenleg minden új regisztráló <span className="text-amber-400 font-bold">Founder</span> státuszt kap ajándékba!
          </p>
        </div>

        {/* KÁRTYÁK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

          {/* 1. FREE CSOMAG */}
          <div className="relative p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col hover:border-slate-700 transition-colors">
            <div className="mb-4">
               <h3 className="text-xl font-bold text-white">Starter</h3>
               <p className="text-slate-500 text-sm mt-1">Hobbi sofőröknek.</p>
            </div>
            <div className="mb-6">
               <span className="text-4xl font-black text-white">0 Ft</span>
               <span className="text-slate-500"> / hó</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
               <FeatureItem text="1 autó kezelése" />
               <FeatureItem text="Alap szerviznapló" />
               <FeatureItem text="Költségek rögzítése" />
               <FeatureItem text="Emlékeztetők (Email)" />
               <FeatureItem disabled text="AI Szerelő Asszisztens" />
               <FeatureItem disabled text="Kereskedői adatlap (QR)" />
               <FeatureItem disabled text="Dokumentum tároló" />
            </ul>

            <Link 
              href={user ? "/" : "/login"} 
              className={`w-full py-3 rounded-xl font-bold text-center border transition-all ${
                  currentPlan === 'free' 
                  ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-default' 
                  : 'bg-white text-slate-900 hover:bg-slate-200 border-transparent'
              }`}
            >
              {currentPlan === 'free' ? 'Jelenlegi csomagod' : 'Váltás Starterre'}
            </Link>
          </div>

          {/* 2. FOUNDER / PRO CSOMAG (KIEMELT) */}
          <div className="relative p-8 bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/50 rounded-3xl flex flex-col shadow-[0_0_40px_rgba(245,158,11,0.15)] transform md:-translate-y-4">
            
            {/* Címke */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
               Legnépszerűbb
            </div>

            <div className="mb-4">
               <div className="flex items-center gap-2">
                 <h3 className="text-xl font-bold text-white">Founder Pro</h3>
                 <span className="text-xl">🚀</span>
               </div>
               <p className="text-amber-200/60 text-sm mt-1">Az összes jelenlegi és jövőbeli funkció.</p>
            </div>
            <div className="mb-6">
               <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-black text-white">0 Ft</span>
                 <span className="text-slate-500 line-through text-lg">1.990 Ft</span>
               </div>
               <span className="text-amber-500 text-xs font-bold uppercase tracking-wide">Örökös hozzáférés (Dec 16-ig)</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
               <FeatureItem text="Korlátlan autó" active />
               <FeatureItem text="AI Szerelő (GPT-4o)" active />
               <FeatureItem text="Kereskedői adatlap + QR kód" active />
               <FeatureItem text="Digitális Kesztyűtartó (5GB)" active />
               <FeatureItem text="Részletes statisztikák" active />
               <FeatureItem text="Prioritásos ügyfélszolgálat" active />
               <FeatureItem text="Adatok exportálása (PDF, CSV)" active />
            </ul>

            <Link 
              href={user ? "/" : "/login?mode=signup"} 
              className={`w-full py-3 rounded-xl font-bold text-center transition-all shadow-lg ${
                  currentPlan === 'founder' || currentPlan === 'active'
                  ? 'bg-amber-900/20 border border-amber-500/50 text-amber-500 cursor-default'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white'
              }`}
            >
              {currentPlan === 'founder' || currentPlan === 'active' ? 'Aktív Csomag' : 'Kérem a Founder Státuszt'}
            </Link>
            
            <p className="text-center text-[10px] text-slate-500 mt-3">
               Nincs bankkártya szükséglet. 100% ingyenes regisztráció.
            </p>
          </div>

        </div>

        {/* GY.I.K */}
        <div className="max-w-3xl mx-auto mt-20 border-t border-slate-800 pt-16">
           <h3 className="text-2xl font-bold text-white mb-8 text-center">Gyakori kérdések</h3>
           <div className="space-y-6">
              <FaqItem q="Tényleg ingyenes marad örökre a Founder csomag?" a="Igen! Ha a promóciós időszak alatt regisztrálsz, a fiókod 'Founder' jelölést kap az adatbázisban, ami garantálja, hogy soha nem fogunk pénzt kérni a Pro funkciókért." />
              <FaqItem q="Mi történik december 16. után?" a="A promóció lezárul. Az új regisztrálók a Free csomagba kerülnek, és ha Pro funkciókat szeretnének, elő kell fizetniük a havi díjra." />
           </div>
        </div>

      </div>
    </div>
  )
}

// Kisebb segéd komponensek a listához
function FeatureItem({ text, disabled, active }: { text: string, disabled?: boolean, active?: boolean }) {
  return (
    <li className={`flex items-center gap-3 ${disabled ? 'opacity-40 grayscale' : ''}`}>
      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${active ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      </div>
      <span className={`text-sm ${active ? 'text-white font-medium' : 'text-slate-300'}`}>{text}</span>
    </li>
  )
}

function FaqItem({ q, a }: { q: string, a: string }) {
    return (
        <div>
            <h4 className="text-white font-bold mb-2">{q}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
        </div>
    )
}