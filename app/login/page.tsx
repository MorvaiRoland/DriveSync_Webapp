import { login, signup, signInWithGoogle } from './action'
import Link from 'next/link'
import Image from 'next/image'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginPage(props: Props) {
  const searchParams = await props.searchParams
  const message = typeof searchParams.message === 'string' ? searchParams.message : null
  
  const mode = searchParams.mode === 'signup' ? 'signup' : 'signin'
  const isLogin = mode === 'signin'

  return (
    // JAVÍTÁS: h-screen, overflow-y-auto és overscroll-none a gumiszalag effekt ellen
    <div className="h-screen w-full overflow-y-auto overscroll-none bg-slate-950 font-sans text-slate-200 flex flex-col lg:flex-row selection:bg-amber-500/30">
      
      {/* --- BAL OLDAL: BEMUTATKOZÁS & TARTALOM (SCROLLABLE) --- */}
      <div className="lg:w-[60%] xl:w-[65%] w-full relative bg-slate-950 overflow-hidden shrink-0">
        
        {/* Háttér dekorációk */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
           <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-amber-600/10 rounded-full blur-[100px] animate-pulse"></div>
           <div className="absolute bottom-[10%] left-[-10%] w-[30vw] h-[30vw] bg-blue-900/10 rounded-full blur-[80px]"></div>
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
        </div>

        {/* Tartalom Konténer */}
        <div className="relative z-10 p-6 sm:p-12 lg:p-16 xl:p-24 flex flex-col gap-16 lg:gap-24">
           
           {/* 1. HERO SZEKCIÓ */}
           <div className="space-y-8">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                   <Logo className="w-6 h-6 text-slate-900" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white uppercase">DriveSync</span>
             </div>
             
             <div>
               <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 drop-shadow-xl">
                 Az autód <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">
                   digitális garázsa.
                 </span>
               </h1>
               <p className="text-lg sm:text-xl text-slate-400 max-w-xl leading-relaxed font-light">
                 Felejtsd el a kesztyűtartóban gyűrődő papírokat. Kezeld a szervizkönyvet, a tankolásokat és a költségeket egyetlen prémium felületen.
               </p>
             </div>

             <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500">
                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Ingyenes kezdés
                </span>
                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Biztonságos felhő
                </span>
             </div>
           </div>

           {/* 2. STATISZTIKA SÁV */}
           <div className="grid grid-cols-3 gap-4 border-y border-slate-800/50 py-8 bg-slate-900/20 backdrop-blur-sm rounded-2xl">
              <StatCard number="100%" label="Papírmentes" />
              <StatCard number="0 Ft" label="Rejtett költség" />
              <StatCard number="24/7" label="Elérhetőség" />
           </div>

           {/* 3. FUNKCIÓK (GRID) */}
           <div>
             <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-10 flex items-center gap-2">
               <span className="w-8 h-[2px] bg-amber-500"></span>
               Miért a DriveSync?
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FeatureBox 
                  title="Okos Költségkövetés" 
                  desc="Lásd át pontosan, mennyibe kerül az autód fenntartása. Tankolás, szerviz, biztosítás - mind egy helyen, látványos grafikonokon."
                  icon="chart"
                />
                <FeatureBox 
                  title="Szerviz Emlékeztető" 
                  desc="Soha többé nem felejted el a műszaki vizsgát vagy az olajcserét. A rendszer időben szól, mielőtt baj lenne."
                  icon="bell"
                />
                <FeatureBox 
                  title="Digitális Szervizkönyv" 
                  desc="Értéknövelő előny eladáskor. Minden javítás visszakövethető, hiteles és rendezett. Nincs több elveszett munkalap."
                  icon="book"
                />
                <FeatureBox 
                  title="Több Autó Kezelése" 
                  desc="Legyen szó a családi flottáról vagy egy céges parkról, korlátlan számú járművet rögzíthetsz és kezelhetsz egyszerre."
                  icon="car"
                />
             </div>
           </div>

           {/* 4. FOOTER (BAL) */}
           <div className="pt-10 border-t border-slate-800/50 text-slate-500 text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="italic">"Az egyetlen app, amire az autósoknak szükségük van."</p>
              <div className="text-slate-600 text-xs">
                 © 2025 DriveSync Technologies
              </div>
           </div>

        </div>
      </div>

      {/* --- JOBB OLDAL: BEJELENTKEZÉS (STICKY) --- */}
      <div className="lg:w-[40%] xl:w-[35%] w-full bg-slate-950 lg:border-l lg:border-white/5 relative flex flex-col justify-center p-6 lg:p-12 shadow-2xl lg:min-h-screen z-20 shrink-0">
        
        {/* Sticky Container */}
        <div className="lg:sticky lg:top-12 w-full max-w-sm mx-auto">
          
          <div className="text-center mb-10">
            <div className="lg:hidden w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-800 relative overflow-hidden">
               <Image 
                 src="/drivesync-logo.png" 
                 alt="DriveSync Logo" 
                 fill 
                 className="object-contain p-2" 
                 priority
               />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
              Indítsd be a motorokat!
            </h2>
            <p className="text-slate-400 text-sm">
              Lépj be a fiókodba, vagy regisztrálj egyet ingyenesen a folytatáshoz.
            </p>
          </div>

          <div className="space-y-4">
            <Link 
              href="/login" 
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-4 text-sm font-bold text-slate-950 shadow-xl shadow-white/5 hover:bg-slate-200 transition-all transform active:scale-[0.98]"
            >
               <span>Bejelentkezés</span>
               <svg className="w-4 h-4 text-slate-900 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>

            <Link 
              href="/login?mode=signup" 
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 border border-slate-800 px-4 py-4 text-sm font-bold text-white shadow-lg hover:bg-slate-800 hover:border-slate-700 transition-all transform active:scale-[0.98]"
            >
               <span>Fiók létrehozása</span>
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-800/50">
             <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                   <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                   <h4 className="text-white font-bold text-sm">Azonnali hozzáférés</h4>
                   <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                     Regisztráció után azonnal hozzáadhatod autóidat és rögzítheted a tankolásokat. Nincs várakozási idő.
                   </p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// --- KOMPONENSEK ---

function FeatureBox({ title, desc, icon }: { title: string, desc: string, icon: 'chart' | 'bell' | 'book' | 'car' }) {
  return (
    <div className="flex gap-5 group">
      <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-500 shadow-sm group-hover:border-amber-500/30 group-hover:bg-amber-500/10 transition-all duration-300">
         {icon === 'chart' && <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
         {icon === 'bell' && <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
         {icon === 'book' && <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
         {icon === 'car' && <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>}
      </div>
      <div>
        <h4 className="font-bold text-white text-lg mb-2">{title}</h4>
        <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function StatCard({ number, label }: { number: string, label: string }) {
  return (
    <div className={`text-center p-4 rounded-xl hover:bg-white/5 transition-colors cursor-default`}>
       <div className="text-3xl font-black text-white mb-1">{number}</div>
       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
    </div>
  )
}

function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <path d="M12 17v-6" />
      <path d="M8.5 14.5 12 11l3.5 3.5" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M14.7 9a3 3 0 0 0-4.2 0L5 14.5a2.12 2.12 0 0 0 3 3l5.5-5.5" opacity="0.5" />
    </svg>
  )
}