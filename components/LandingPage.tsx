// components/LandingPage.tsx
'use client'; // Fontos, mert vannak benne interakciók (scroll, menü)

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight, Sparkles, CheckCircle2, Calendar, 
  BarChart3, ShieldCheck, Zap, Menu, X, ChevronRight, Lock 
} from 'lucide-react';
import PromoModal from '@/components/PromoModal'; // Feltételezem, ez is ki van szervezve

// --- HÁTTÉR EFFEKTEK ---
const BackgroundGlows = () => (
  <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[-10%] left-[20%] w-[50vw] h-[50vw] bg-amber-500/10 rounded-full blur-[120px] animate-pulse mix-blend-screen" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen" />
    <div className="absolute top-[40%] left-[-10%] w-[30vw] h-[30vw] bg-purple-500/5 rounded-full blur-[80px]" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay" />
  </div>
);

// --- 3D DASHBOARD ELŐNÉZET (CSS TRÜKK) ---
const DashboardPreview = () => (
  <div className="relative mx-auto mt-16 max-w-5xl w-full perspective-1000 group">
    <div className="relative rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-2 shadow-2xl transition-all duration-700 ease-out sm:group-hover:rotate-x-2 sm:rotate-x-6 sm:translate-y-0 translate-y-4 overflow-hidden">
      {/* Fake UI Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-slate-900/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
        </div>
      </div>
      {/* Fake UI Body */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 min-h-[300px] bg-gradient-to-b from-slate-900/50 to-slate-950/80">
         <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="h-32 rounded-lg bg-white/5 border border-white/5 animate-pulse"></div>
            <div className="flex gap-4">
                <div className="h-24 w-1/2 rounded-lg bg-amber-500/10 border border-amber-500/20"></div>
                <div className="h-24 w-1/2 rounded-lg bg-blue-500/10 border border-blue-500/20"></div>
            </div>
         </div>
         <div className="hidden md:block h-full rounded-lg bg-white/5 border border-white/5"></div>
      </div>
      {/* Reflection */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none rounded-xl" />
    </div>
    <div className="absolute -inset-4 bg-amber-500/20 blur-3xl -z-10 opacity-40" />
  </div>
);

// --- MAIN COMPONENT ---
export default function LandingPage({ promo, updates }: { promo?: any, updates: any[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200 selection:bg-amber-500/30 overflow-x-hidden">
      
      {/* Popups */}
      {promo && <PromoModal promo={promo} />}
      <BackgroundGlows />

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-slate-800/50 py-4' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 relative">
                <Image src="/drivesync-logo.png" alt="Logo" fill className="object-contain" />
             </div>
             <span className="text-xl font-bold tracking-tight text-white uppercase">
                Drive<span className="text-amber-500">Sync</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Funkciók</a>
            <a href="#changelog" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Újdonságok</a>
            <div className="h-4 w-px bg-slate-800"></div>
            <Link href="/login" className="text-sm font-bold text-white hover:text-amber-400 transition-colors">Bejelentkezés</Link>
            <Link href="/login" className="group bg-white text-slate-950 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center gap-2">
                Kezdés <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-slate-300 p-2">
             {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
             <div className="absolute top-full left-0 w-full bg-slate-950 border-b border-slate-800 p-6 flex flex-col gap-4 md:hidden animate-in slide-in-from-top-5 shadow-2xl">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-slate-400 py-3 border-b border-slate-800">Funkciók</a>
                <a href="#changelog" onClick={() => setMobileMenuOpen(false)} className="text-slate-400 py-3 border-b border-slate-800">Újdonságok</a>
                <Link href="/login" className="bg-amber-500 text-slate-950 text-center py-3 rounded-xl font-bold mt-2">Belépés / Regisztráció</Link>
             </div>
        )}
      </nav>

      <main className="relative z-10 flex-1 flex flex-col pt-32 pb-20 px-4">
        
        {/* HERO SECTION */}
        <section className="flex flex-col items-center text-center max-w-5xl mx-auto mb-24">
            
            {/* Verzió Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800 text-xs font-medium text-slate-300 mb-8 hover:border-amber-500/30 transition-colors cursor-default backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Stabil Rendszer v2.0
            </div>

            {/* Főcím */}
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight leading-[1.1] mb-6 drop-shadow-2xl">
                Az autód <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600">digitális agya.</span>
            </h1>

            {/* Alcím */}
            <p className="text-lg sm:text-xl text-slate-400 leading-relaxed font-light max-w-2xl mx-auto mb-10">
                Felejtsd el a kockás füzetet. A DriveSync egy mesterséges intelligenciával támogatott, felhőalapú rendszer a teljes flottád kezelésére.
            </p>

            {/* CTA Gombok */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center z-20 relative">
                <Link href="/login" className="group relative bg-amber-500 hover:bg-amber-400 text-slate-950 text-lg font-bold px-8 py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 overflow-hidden">
                    <span className="relative">Ingyenes Regisztráció</span>
                    <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#features" className="bg-slate-900/50 hover:bg-slate-800/80 backdrop-blur-md text-white text-lg font-bold px-8 py-4 rounded-2xl transition-all border border-slate-700 hover:border-slate-500 flex items-center justify-center gap-2">
                   Funkciók
                </a>
            </div>

            {/* 3D Dashboard Kép */}
            <DashboardPreview />
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="max-w-7xl mx-auto mb-32 w-full px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Több mint egy Excel tábla.</h2>
                <p className="text-slate-400 max-w-xl mx-auto">Minden eszközünk azt a célt szolgálja, hogy pénzt és időt spóroljunk neked.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { 
                        icon: <Sparkles className="w-6 h-6 text-purple-400" />, 
                        title: 'AI Hibakód Elemző', 
                        desc: 'Fotózd le a műszerfalat vagy írd be a kódot. Az AI azonnal megmondja a hiba okát és a várható javítási költséget.',
                        gradient: 'from-purple-500/10 to-blue-500/10'
                    },
                    { 
                        icon: <BarChart3 className="w-6 h-6 text-amber-400" />, 
                        title: 'Költség Analitika', 
                        desc: 'Lásd pontosan, mennyibe kerül egy kilométer. Üzemanyag, szerviz, biztosítás vizuális diagramokon.',
                        gradient: 'from-amber-500/10 to-orange-500/10'
                    },
                    { 
                        icon: <ShieldCheck className="w-6 h-6 text-green-400" />, 
                        title: 'Digitális Szervizkönyv', 
                        desc: 'Értéknövelő tényező eladáskor. Minden számla, minden beavatkozás hitelesen, időrendben.',
                        gradient: 'from-green-500/10 to-emerald-500/10'
                    },
                    { 
                        icon: <Zap className="w-6 h-6 text-blue-400" />, 
                        title: 'Gyors Rögzítés', 
                        desc: 'Tankolás vagy kilométeróra állás rögzítése két kattintással, akár mobilról is.',
                        gradient: 'from-blue-500/10 to-cyan-500/10'
                    },
                    { 
                        icon: <Calendar className="w-6 h-6 text-red-400" />, 
                        title: 'Okos Emlékeztetők', 
                        desc: 'Műszaki vizsga, olajcsere, biztosítás. Nem hagyjuk, hogy elfelejtsd a határidőket.',
                        gradient: 'from-red-500/10 to-pink-500/10'
                    },
                    { 
                        icon: <Lock className="w-6 h-6 text-slate-400" />, 
                        title: 'Felhő Biztonság', 
                        desc: 'Az adataid biztonságos szervereken tároljuk. Ha telefont cserélsz, minden megmarad.',
                        gradient: 'from-slate-500/10 to-gray-500/10'
                    }
                ].map((item, i) => (
                    <div key={i} className={`group relative p-8 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 overflow-hidden`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                        
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* PROMO BANNER (Inline) */}
        {promo && (
           <div className="max-w-4xl mx-auto mb-32 w-full px-4">
              <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 p-8 md:p-12">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                      <div>
                          <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-4 uppercase tracking-wider border border-purple-500/30">
                            Aktív Ajánlat
                          </div>
                          <h3 className="text-3xl font-bold text-white mb-2">{promo.title}</h3>
                          <p className="text-purple-200/80 max-w-md">{promo.description}</p>
                      </div>
                      <Link href="/login" className="whitespace-nowrap bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-500/40 transform hover:scale-105">
                          Megnézem az ajánlatot
                      </Link>
                  </div>
              </div>
           </div>
        )}

        {/* CHANGELOG - Refined */}
        <div id="changelog" className="max-w-4xl mx-auto w-full mb-20 px-4">
            <div className="flex items-end gap-4 mb-10 border-b border-slate-800 pb-6">
                <h2 className="text-3xl font-bold text-white">Fejlesztési Napló</h2>
                <span className="text-slate-500 pb-1 text-sm font-mono hidden sm:inline-block">build history</span>
            </div>

            <div className="relative border-l border-slate-800 ml-3 sm:ml-6 space-y-12 pb-10">
                {updates.length > 0 ? updates.map((update, index) => (
                    <div key={index} className="relative pl-8 sm:pl-12 group">
                        {/* Timeline Marker */}
                        <div className={`absolute -left-[5px] top-2 w-3 h-3 rounded-full border-2 
                            ${index === 0 
                                ? 'bg-amber-500 border-amber-500 shadow-[0_0_15px_#f59e0b] scale-110' 
                                : 'bg-slate-950 border-slate-700 group-hover:border-slate-500 group-hover:bg-slate-800'} 
                            transition-all z-10`}></div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                {update.title}
                                {index === 0 && <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Új</span>}
                            </h3>
                            <span className="text-xs font-mono text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 w-fit">
                                v{update.version} • {new Date(update.release_date).toLocaleDateString('hu-HU')}
                            </span>
                        </div>
                        
                        <div className="text-slate-400 text-sm leading-relaxed space-y-2 bg-slate-900/20 p-5 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                           <p>{update.description}</p>
                        </div>
                    </div>
                )) : (
                     /* Placeholder ha nincs adat */
                     <div className="pl-12 py-10 text-slate-500 italic">
                        <div className="absolute -left-[5px] top-2 w-3 h-3 rounded-full bg-slate-800 border-2 border-slate-700"></div>
                        A rendszer elindult. Nincsenek még frissítési bejegyzések.
                     </div>
                )}
                
                {/* Jövőbeli tervek */}
                <div className="relative pl-12 opacity-50 hover:opacity-100 transition-opacity cursor-help">
                    <div className="absolute -left-[5px] top-2 w-3 h-3 rounded-full bg-slate-900 border-2 border-slate-800 border-dashed"></div>
                    <h3 className="text-sm font-bold text-slate-300 mb-1 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Következő fejlesztések...
                    </h3>
                </div>
            </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 pt-16 pb-8 px-6 relative z-10">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
             <div className="text-center md:text-left">
                <span className="text-2xl font-bold tracking-tight text-white uppercase block mb-2">
                    Drive<span className="text-amber-500">Sync</span>
                </span>
                <p className="text-slate-500 text-sm max-w-xs">
                    Az autósok digitális svájcibicskája. <br/> Magyar fejlesztés, magyar utakhoz.
                </p>
             </div>
             <div className="flex gap-8 text-sm font-medium text-slate-400">
                 <a href="#" className="hover:text-white transition-colors">Kapcsolat</a>
                 <a href="#" className="hover:text-white transition-colors">ÁSZF</a>
                 <Link href="/login" className="hover:text-white transition-colors">Belépés</Link>
             </div>
         </div>
         <div className="text-center border-t border-slate-900 pt-8">
             <p className="text-slate-600 text-xs font-mono uppercase tracking-widest">
                © 2025 DriveSync Hungary. Minden jog fenntartva.
             </p>
         </div>
      </footer>
    </div>
  )
}