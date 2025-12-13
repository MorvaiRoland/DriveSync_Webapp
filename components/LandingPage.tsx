// components/LandingPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight, Sparkles, CheckCircle2, Calendar, 
  BarChart3, ShieldCheck, Zap, Menu, X, Lock, 
  MessageCircle, HelpCircle, Server, Database, Smartphone,
  ChevronDown, Fuel, Wrench, Trophy, Car, Layers, Gauge
} from 'lucide-react';
import PromoModal from '@/components/PromoModal'; 

// --- HÁTTÉR EFFEKTEK ---
const BackgroundGlows = () => (
  <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[-10%] left-[20%] w-[50vw] h-[50vw] bg-amber-500/10 rounded-full blur-[120px] animate-pulse mix-blend-screen" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-600/10 rounded-full blur-[100px] mix-blend-screen" />
    <div className="absolute top-[40%] left-[-10%] w-[30vw] h-[30vw] bg-purple-500/5 rounded-full blur-[80px]" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay" />
  </div>
);

// --- 3D DASHBOARD PREVIEW (Vizuális reprezentáció a leírt Dashboardról) ---
const DashboardPreview = () => (
  <div className="relative mx-auto mt-16 max-w-5xl w-full perspective-1000 group z-20 px-4">
    <div className="relative rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl transition-all duration-700 ease-out sm:group-hover:rotate-x-2 sm:rotate-x-6 sm:translate-y-0 translate-y-4 overflow-hidden">
      {/* Fake Browser Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-slate-900/90">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
        </div>
        <div className="mx-auto w-1/3 h-2 rounded-full bg-white/5" />
      </div>

      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-12 gap-4 p-6 min-h-[400px] bg-slate-950/50">
         {/* Sidebar Placeholder */}
         <div className="hidden md:block col-span-2 space-y-3">
            <div className="h-8 w-full bg-white/5 rounded-lg mb-6"></div>
            {[1,2,3,4].map(i => <div key={i} className="h-6 w-3/4 bg-white/5 rounded-md"></div>)}
         </div>

         {/* Main Content */}
         <div className="col-span-12 md:col-span-10 grid grid-cols-12 gap-4">
            {/* Fleet Health Widget */}
            <div className="col-span-12 md:col-span-4 bg-slate-800/40 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-emerald-500/5"></div>
               <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-white">94%</span>
               </div>
               <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Flotta Egészség</div>
            </div>

            {/* Cost Widget */}
            <div className="col-span-12 md:col-span-4 bg-slate-800/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
               <div className="flex justify-between items-start mb-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500"><BarChart3 size={16} /></div>
                  <span className="text-xs text-slate-400">30 nap</span>
               </div>
               <div className="space-y-1">
                  <div className="text-2xl font-bold text-white">42.500 Ft</div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                     <div className="w-[60%] h-full bg-amber-500"></div>
                  </div>
               </div>
            </div>

            {/* AI Mechanic Teaser */}
            <div className="col-span-12 md:col-span-4 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-4 relative overflow-hidden">
               <div className="absolute top-2 right-2"><Sparkles size={16} className="text-indigo-400" /></div>
               <div className="mt-auto">
                  <div className="text-xs text-indigo-300 font-bold mb-1">AI SZERELŐ</div>
                  <div className="text-sm text-white">"A P0300 hibakód égéskimaradást jelez. Ellenőrizd a gyújtótrafókat."</div>
               </div>
            </div>

            {/* Car List / Garage */}
            <div className="col-span-12 h-32 bg-slate-800/40 border border-white/5 rounded-xl p-4 flex items-center gap-4">
               <div className="h-20 w-32 bg-slate-700/50 rounded-lg flex-shrink-0"></div>
               <div className="space-y-2 w-full">
                  <div className="h-4 w-1/3 bg-white/10 rounded"></div>
                  <div className="h-3 w-1/4 bg-white/5 rounded"></div>
               </div>
               <div className="ml-auto px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20">Aktív</div>
            </div>
         </div>
      </div>
    </div>
    <div className="absolute -inset-4 bg-amber-500/20 blur-3xl -z-10 opacity-40" />
  </div>
);

// --- MAIN COMPONENT ---
export default function LandingPage({ promo, updates }: { promo?: any, updates: any[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const faqs = [
    {
      question: "Hogyan működik a Flotta Egészség mutató?",
      answer: "A rendszer egy intelligens algoritmus segítségével elemzi a szervizintervallumokat, a megtett kilométereket és a legutóbbi karbantartásokat. Ha minden zöld, az autód műszakilag rendben van."
    },
    {
      question: "Tényleg felismeri az AI a hibakódokat?",
      answer: "Igen! A gemini-2.5-flash alapú AI Szerelőnk képes értelmezni a fotózott vagy beírt hibakódokat (pl. P0300), és magyar nyelven, érthetően elmagyarázza a probléma okát és a teendőket."
    },
    {
      question: "Mi az a Gumihotel és Matrica menedzser?",
      answer: "Ezek a Utility Widgetek segítenek a kiegészítő adatok kezelésében. A Gumihotelben követheted, melyik abroncs van felszerelve és mennyit futott, a Matrica menedzser pedig figyelmeztet a pályamatrica lejártára."
    },
    {
      question: "Ingyenes a használata?",
      answer: "A Starter csomag magánszemélyeknek 1 autóig teljesen ingyenes, ami tartalmazza a szervizkönyvet és költségkövetést. Több autóhoz és az AI funkciókhoz Pro előfizetés szükséges."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200 selection:bg-amber-500/30 overflow-x-hidden">
      
      {promo && <PromoModal promo={promo} />}
      <BackgroundGlows />

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-slate-800/50 py-4' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
             <div className="w-8 h-8 relative group-hover:scale-110 transition-transform duration-300">
                <Image src="/drivesync-logo.png" alt="Logo" fill className="object-contain" />
             </div>
             <span className="text-xl font-bold tracking-tight text-white uppercase hidden sm:block">
               Drive<span className="text-amber-500">Sync</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Funkciók</a>
            <a href="#gamification" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Közösség</a>
            <a href="#faq" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">GY.I.K.</a>
            <Link href="/pricing" className="text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors">Árazás</Link>
            <div className="h-4 w-px bg-slate-800"></div>
            <Link href="/login" className="text-sm font-bold text-white hover:text-amber-400 transition-colors">Belépés</Link>
            <Link href="/login" className="group bg-white text-slate-950 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center gap-2">
                Kezdés <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-slate-300 p-2 hover:bg-white/10 rounded-lg transition-colors">
             {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
             <div className="absolute top-full left-0 w-full bg-slate-950 border-b border-slate-800 p-6 flex flex-col gap-4 md:hidden animate-in slide-in-from-top-5 shadow-2xl">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-slate-400 py-3 border-b border-slate-800 hover:text-white">Funkciók</a>
                <a href="#gamification" onClick={() => setMobileMenuOpen(false)} className="text-slate-400 py-3 border-b border-slate-800 hover:text-white">Közösség</a>
                <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-amber-500 py-3 border-b border-slate-800 font-bold">Árazás</Link>
                <Link href="/login" className="bg-amber-500 text-slate-950 text-center py-3 rounded-xl font-bold mt-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    Fiók létrehozása
                </Link>
             </div>
        )}
      </nav>

      <main className="relative z-10 flex-1 flex flex-col pt-32 px-4">
        
        {/* HERO SECTION */}
        <section className="flex flex-col items-center text-center max-w-5xl mx-auto mb-32">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800 text-xs font-medium text-slate-300 mb-8 hover:border-amber-500/30 transition-colors cursor-default backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Rendszer Élesítve v2.0 • AI Integrációval
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight leading-[1.1] mb-6 drop-shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                Az autód <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600">digitális agya.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 leading-relaxed font-light max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                A DriveSync egy mesterséges intelligenciával támogatott, felhőalapú garázs. Költségkövetés, digitális szervizkönyv és flotta menedzsment egy helyen.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center z-20 relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                <Link href="/login" className="group relative bg-amber-500 hover:bg-amber-400 text-slate-950 text-lg font-bold px-8 py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 overflow-hidden hover:-translate-y-1">
                    <span className="relative">Ingyenes Regisztráció</span>
                    <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#features" className="bg-slate-900/50 hover:bg-slate-800/80 backdrop-blur-md text-white text-lg font-bold px-8 py-4 rounded-2xl transition-all border border-slate-700 hover:border-slate-500 flex items-center justify-center gap-2 hover:-translate-y-1">
                   Funkciók
                </a>
            </div>

            <DashboardPreview />
        </section>

        {/* BENTO GRID FEATURES */}
        <section id="features" className="max-w-7xl mx-auto mb-32 w-full px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Minden, ami a garázsodhoz kell.</h2>
                <p className="text-slate-400 max-w-xl mx-auto">Váltsd le a kockás füzetet egy proaktív, intelligens rendszerre.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
                
                {/* 1. Feature: AI Mechanic (Large) */}
                <div className="col-span-1 md:col-span-2 row-span-2 group relative p-8 rounded-[2rem] bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-indigo-500/20 hover:border-indigo-500/40 transition-all overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Sparkles size={120} />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/30">
                                <Sparkles size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">AI Szerelő</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Fotózd le a hibakódot, vagy írd be a tüneteket. A GPT-4o alapú asszisztensünk azonnal elemzi a problémát és magyar nyelven, érthetően elmagyarázza a teendőket.
                            </p>
                        </div>
                        <div className="mt-8 bg-black/30 rounded-xl p-4 border border-white/5 backdrop-blur-sm">
                            <div className="flex gap-3 mb-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="text-xs text-slate-400 font-mono">SYSTEM_ALERT: P0300</span>
                            </div>
                            <p className="text-sm text-indigo-200">"Égéskimaradást észleltem. Ez gyakran gyújtótrafó vagy gyertya hiba. Érdemes ellenőrizni..."</p>
                        </div>
                    </div>
                </div>

                {/* 2. Feature: Fleet Health */}
                <div className="col-span-1 md:col-span-1 row-span-2 group relative p-6 rounded-[2rem] bg-slate-900/40 border border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col items-center text-center justify-center">
                    <div className="relative w-32 h-32 mb-6">
                         <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" strokeDasharray="94, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-3xl font-black text-white">94%</span>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Flotta Egészség</h3>
                    <p className="text-slate-400 text-sm">Szervizintervallumok és karbantartások alapján számított élő mutató.</p>
                </div>

                {/* 3. Feature: Costs */}
                <div className="col-span-1 md:col-span-1 group relative p-6 rounded-[2rem] bg-slate-900/40 border border-slate-800 hover:border-amber-500/30 transition-all">
                     <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center mb-4">
                        <BarChart3 size={20} />
                     </div>
                     <h3 className="text-lg font-bold text-white mb-1">Költség Analitika</h3>
                     <p className="text-slate-400 text-sm">Lásd, hova folyik a pénz. Üzemanyag vs Szerviz.</p>
                </div>

                {/* 4. Feature: Service Log */}
                <div className="col-span-1 md:col-span-1 group relative p-6 rounded-[2rem] bg-slate-900/40 border border-slate-800 hover:border-blue-500/30 transition-all">
                     <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center mb-4">
                        <ShieldCheck size={20} />
                     </div>
                     <h3 className="text-lg font-bold text-white mb-1">Digitális Szervizkönyv</h3>
                     <p className="text-slate-400 text-sm">Hiteles PDF exportálás eladáshoz.</p>
                </div>

                {/* 5. Feature: Utility Widgets (Wide) */}
                <div className="col-span-1 md:col-span-2 lg:col-span-4 p-8 rounded-[2rem] bg-slate-900/30 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-left max-w-md">
                        <h3 className="text-2xl font-bold text-white mb-2">Hasznos Eszközök</h3>
                        <p className="text-slate-400">Apró, de nélkülözhetetlen funkciók a mindennapokra.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="flex items-center gap-3 bg-slate-800/50 px-5 py-3 rounded-xl border border-white/5">
                            <Layers className="text-slate-400" size={20} />
                            <span className="text-sm font-bold text-slate-200">Gumihotel</span>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-800/50 px-5 py-3 rounded-xl border border-white/5">
                            <CheckCircle2 className="text-slate-400" size={20} />
                            <span className="text-sm font-bold text-slate-200">Matrica Figyelő</span>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-800/50 px-5 py-3 rounded-xl border border-white/5">
                            <Calendar className="text-slate-400" size={20} />
                            <span className="text-sm font-bold text-slate-200">Műszaki Értesítő</span>
                        </div>
                    </div>
                </div>

            </div>
        </section>

        {/* GAMIFICATION SECTION */}
        <section id="gamification" className="max-w-5xl mx-auto mb-32 px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-12">Nem csak adminisztráció. Játék.</h2>
            <div className="flex flex-wrap justify-center gap-8">
                {[
                    { label: 'High Miler', desc: '200.000+ km futás', color: 'from-purple-500 to-indigo-600', icon: '🛣️' },
                    { label: 'Eco Driver', desc: 'Flotta egészség >90%', color: 'from-emerald-400 to-green-600', icon: '🍃' },
                    { label: 'Pontos Admin', desc: 'Rendszeres naplózás', color: 'from-blue-400 to-cyan-500', icon: '📅' },
                ].map((badge, i) => (
                    <div key={i} className="flex flex-col items-center gap-4 group">
                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${badge.color} p-1 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-3xl border-4 border-transparent">
                                {badge.icon}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-white">{badge.label}</h4>
                            <p className="text-xs text-slate-500">{badge.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-12 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl inline-block">
                <p className="text-slate-400 text-sm">
                    <span className="text-amber-500 font-bold">Hamarosan:</span> DriveSync Klub közösségi funkciók és piactér.
                </p>
            </div>
        </section>

        {/* PROMO BANNER */}
        {promo && (
           <div className="max-w-4xl mx-auto mb-32 w-full px-4">
              <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 p-8 md:p-12">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                      <div>
                          <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-4 uppercase tracking-wider border border-purple-500/30">
                            Indulási Ajánlat
                          </div>
                          <h3 className="text-3xl font-bold text-white mb-2">{promo.title}</h3>
                          <p className="text-purple-200/80 max-w-md">{promo.description}</p>
                      </div>
                      <Link href="/login" className="whitespace-nowrap bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-500/40 transform hover:scale-105">
                          Kérem az ajánlatot
                      </Link>
                  </div>
              </div>
           </div>
        )}

        {/* FAQ SECTION */}
        <section id="faq" className="max-w-3xl mx-auto w-full mb-32 px-4">
            <div className="text-center mb-16">
                 <h2 className="text-3xl font-bold text-white mb-4">Gyakori Kérdések</h2>
                 <p className="text-slate-400">Minden, amit tudni érdemes a rendszerről.</p>
             </div>

             <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div 
                        key={index} 
                        className={`bg-slate-900/30 rounded-2xl border transition-all duration-300 overflow-hidden ${openFaq === index ? 'border-amber-500/50 bg-slate-900/50' : 'border-slate-800 hover:border-slate-700'}`}
                    >
                        <button 
                            onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            className="w-full text-left p-6 flex justify-between items-center focus:outline-none"
                        >
                            <span className="font-bold text-white text-lg pr-4">{faq.question}</span>
                            {openFaq === index ? (
                                <ChevronDown className="text-amber-500 rotate-180 transition-transform duration-300 flex-shrink-0" />
                            ) : (
                                <ChevronDown className="text-slate-500 transition-transform duration-300 flex-shrink-0" />
                            )}
                        </button>
                        <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${openFaq === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden">
                                <div className="p-6 pt-0 text-slate-400 leading-relaxed border-t border-white/5 mt-2">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
        </section>

        {/* CHANGELOG & BOTTOM CTA */}
        <div id="changelog" className="max-w-4xl mx-auto w-full mb-20 px-4">
             {updates.length > 0 && (
                 <div className="mb-20">
                     <div className="flex items-end gap-4 mb-8 border-b border-slate-800 pb-4">
                        <h2 className="text-2xl font-bold text-white">Legutóbbi Frissítések</h2>
                     </div>
                     <div className="space-y-6">
                        {updates.slice(0, 3).map((update, index) => (
                            <div key={index} className="flex gap-4 items-start">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">{update.title} <span className="text-slate-500 font-normal ml-2">v{update.version}</span></h4>
                                    <p className="text-slate-400 text-xs mt-1">{update.description}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                 </div>
             )}

             <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-12 rounded-[2.5rem] text-center relative overflow-hidden">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
                 <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10">Készen állsz?</h2>
                 <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto relative z-10">
                    Indítsd el a fiókodat ingyen, bankkártya nélkül.
                 </p>
                 <Link href="/login" className="relative z-10 inline-flex items-center gap-2 bg-white text-slate-950 font-bold text-lg px-8 py-4 rounded-full hover:bg-amber-400 transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    Fiók létrehozása <ArrowRight size={20} />
                 </Link>
             </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 pt-20 pb-10 px-6 relative z-10">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
             <div className="md:col-span-1">
                <Link href="/" className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 relative"><Image src="/drivesync-logo.png" alt="Logo" fill className="object-contain" /></div>
                    <span className="text-xl font-bold tracking-tight text-white uppercase">Drive<span className="text-amber-500">Sync</span></span>
                </Link>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Magyarország legújabb autófenntartási rendszere. AI diagnosztika, költségkövetés és digitális szervizkönyv egy helyen.
                </p>
                <div className="flex gap-4">
                    <a href="mailto:info.drivesync.mail@gmail.com" className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer border border-slate-800 hover:border-amber-500/50">
                        <MessageCircle size={16} />
                    </a>
                    <a href="#faq" className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer border border-slate-800 hover:border-amber-500/50">
                        <HelpCircle size={16} />
                    </a>
                </div>
             </div>
             
             <div>
                 <h4 className="text-white font-bold mb-6">Termék</h4>
                 <ul className="space-y-4 text-sm text-slate-400">
                     <li><a href="#features" className="hover:text-amber-500 transition-colors">Funkciók</a></li>
                     <li><Link href="/pricing" className="hover:text-amber-500 transition-colors">Árazás</Link></li>
                     <li><a href="#gamification" className="hover:text-amber-500 transition-colors">Közösség</a></li>
                     <li><a href="#changelog" className="hover:text-amber-500 transition-colors">Frissítések</a></li>
                 </ul>
             </div>

             <div>
                 <h4 className="text-white font-bold mb-6">Jogi</h4>
                 <ul className="space-y-4 text-sm text-slate-400">
                     <li><Link href="/privacy" className="hover:text-amber-500 transition-colors">Adatvédelmi tájékoztató</Link></li>
                     <li><Link href="/terms" className="hover:text-amber-500 transition-colors">ÁSZF</Link></li>
                     <li><Link href="/impressum" className="hover:text-amber-500 transition-colors">Impresszum</Link></li>
                 </ul>
             </div>
             
             <div>
                <h4 className="text-white font-bold mb-6">Platform</h4>
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                    <Server size={14} /> Felhőalapú
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                    <Smartphone size={14} /> Mobil-First
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                    <Lock size={14} /> SSL Titkosítás
                </div>
             </div>
         </div>
         
         <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
             <p className="text-slate-600 text-xs font-mono uppercase tracking-widest">
                © 2025 DriveSync Hungary. Minden jog fenntartva.
             </p>
             <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 Rendszer Online
             </div>
         </div>
      </footer>
    </div>
  )
}