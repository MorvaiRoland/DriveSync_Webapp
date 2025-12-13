'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight, Sparkles, CheckCircle2, Calendar, 
  BarChart3, ShieldCheck, Zap, Menu, X, Lock, 
  MessageCircle, HelpCircle, Server, Smartphone,
  ChevronDown, Layers
} from 'lucide-react';
import PromoModal from '@/components/PromoModal'; 
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// --- UTILITY COMPONENTS ---

// 1. Spotlight Card (Az egeret követő fényeffekt)
const SpotlightCard = ({ children, className = "", spotlightColor = "rgba(245,158,11,0.15)" }: any) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/40 backdrop-blur-sm ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-10"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      <div className="relative z-20 h-full">{children}</div>
    </motion.div>
  );
};

// 2. Typewriter Effect (Az AI szöveg gépelése)
const TypewriterText = ({ text, speed = 30 }: { text: string, speed?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    setDisplayedText(''); 
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index === text.length) clearInterval(intervalId);
    }, speed);
    return () => clearInterval(intervalId);
  }, [text, speed]);

  return <span>{displayedText}<span className="animate-pulse text-amber-500 font-bold">|</span></span>;
};

// 3. Live Activity Ticker (Futó csík)
const LiveTicker = () => {
  const activities = [
    "B. Péter feltöltött egy számlát (Audi A4)",
    "AI Diagnosztika futtatva (P0420 hiba)",
    "Flotta Zrt. csatlakozott (12 autó)",
    "K. Anna elérte a 200.000 km-t",
    "Matrica figyelmeztetés kiküldve",
    "Új szervizbejegyzés rögzítve"
  ];

  return (
    <div className="w-full bg-slate-950/80 border-y border-white/5 py-3 overflow-hidden flex relative z-10 backdrop-blur-md mb-24">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10" />
      
      <motion.div 
        className="flex whitespace-nowrap gap-16 items-center"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
      >
        {[...activities, ...activities, ...activities].map((act, i) => (
          <div key={i} className="flex items-center gap-3 text-xs text-slate-400 font-mono uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            {act}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// --- HÁTTÉR ---
const BackgroundGlows = () => (
  <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[-10%] left-[20%] w-[60vw] h-[60vw] bg-amber-600/5 rounded-full blur-[130px] animate-pulse mix-blend-screen" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/5 rounded-full blur-[120px] mix-blend-screen" />
    <div className="absolute top-[40%] left-[-20%] w-[40vw] h-[40vw] bg-purple-600/5 rounded-full blur-[100px]" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
  </div>
);

// --- 3D DASHBOARD PREVIEW ---
const DashboardPreview = () => {
  const { scrollY } = useScroll();
  const rotateX = useTransform(scrollY, [0, 600], [5, 0]);
  const translateY = useTransform(scrollY, [0, 600], [0, -50]);

  return (
    <motion.div 
      style={{ rotateX, translateY, transformPerspective: 1000 }}
      className="relative mx-auto mt-20 max-w-5xl w-full z-20 px-4 group"
    >
      <div className="relative rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-700">
        
        {/* Fake Browser Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-slate-950/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
          </div>
          <div className="mx-auto px-4 py-1 rounded-full bg-white/5 text-[10px] text-slate-500 font-mono flex items-center gap-2">
            <Lock size={10} /> dynamicsense.app/dashboard
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 gap-4 p-6 min-h-[450px] bg-slate-950/80">
           {/* Sidebar */}
           <div className="hidden md:block col-span-2 space-y-3 border-r border-white/5 pr-4">
              <div className="h-8 w-full bg-gradient-to-r from-amber-500/20 to-transparent rounded-lg mb-6 border-l-2 border-amber-500"></div>
              {[1,2,3,4].map(i => <div key={i} className="h-8 w-full hover:bg-white/5 rounded-lg transition-colors cursor-pointer"></div>)}
           </div>

           {/* Main Content */}
           <div className="col-span-12 md:col-span-10 grid grid-cols-12 gap-4">
              {/* Fleet Health */}
              <div className="col-span-12 md:col-span-4 bg-slate-900 border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden group/card">
                 <div className="absolute inset-0 bg-emerald-500/5 group-hover/card:bg-emerald-500/10 transition-colors"></div>
                 <div className="relative w-24 h-24 mb-3">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                      <motion.path 
                        initial={{ pathLength: 0 }} 
                        whileInView={{ pathLength: 0.94 }} 
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">94%</div>
                 </div>
                 <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Flotta Egészség</div>
              </div>

              {/* Cost Widget */}
              <div className="col-span-12 md:col-span-4 bg-slate-900 border border-white/5 rounded-xl p-6 flex flex-col justify-between">
                 <div className="flex justify-between items-center mb-4">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500"><BarChart3 size={16} /></div>
                    <span className="text-xs text-slate-400 font-mono">30 NAP</span>
                 </div>
                 <div>
                    <div className="text-3xl font-bold text-white mb-2">42.500 Ft</div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} whileInView={{ width: "60%" }} transition={{ duration: 1.5 }} className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></motion.div>
                    </div>
                 </div>
              </div>

              {/* AI Mechanic (The Star Show) */}
              <div className="col-span-12 md:col-span-4 bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-xl p-5 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-50"><Sparkles className="text-indigo-400 animate-pulse" /></div>
                 
                 <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                    <span className="text-xs font-bold text-indigo-300">AI SZERELŐ ÉLŐ</span>
                 </div>

                 <div className="bg-slate-950/50 rounded-lg p-3 border border-indigo-500/20 min-h-[100px]">
                    <div className="text-xs text-slate-400 mb-1">Kérdés: Mit jelent a P0300?</div>
                    <div className="text-sm text-indigo-100 leading-snug">
                       <TypewriterText text="A P0300 égéskimaradást jelez több hengernél. Ez gyakran gyújtótrafó, gyertya vagy üzemanyag-ellátási hiba. Javaslom a gyertyák ellenőrzését első lépésként." speed={40} />
                    </div>
                 </div>
              </div>

              {/* Car List */}
              <div className="col-span-12 bg-slate-900 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                 <div className="h-16 w-24 bg-slate-800 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-700 to-slate-600"></div>
                 </div>
                 <div className="space-y-1">
                    <div className="h-4 w-32 bg-slate-700/50 rounded animate-pulse"></div>
                    <div className="h-3 w-20 bg-slate-800 rounded"></div>
                 </div>
                 <div className="ml-auto flex gap-2">
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">Aktív</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      {/* Glow behind dashboard */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-amber-500/10 blur-[100px] -z-10 opacity-60 pointer-events-none" />
    </motion.div>
  );
};

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
    { question: "Hogyan működik a Flotta Egészség mutató?", answer: "A rendszer egy intelligens algoritmus segítségével elemzi a szervizintervallumokat, a megtett kilométereket és a legutóbbi karbantartásokat. Ha minden zöld, az autód műszakilag rendben van." },
    { question: "Tényleg felismeri az AI a hibakódokat?", answer: "Igen! A gemini-2.5-flash alapú AI Szerelőnk képes értelmezni a fotózott vagy beírt hibakódokat (pl. P0300), és magyar nyelven, érthetően elmagyarázza a probléma okát és a teendőket." },
    { question: "Mi az a Gumihotel és Matrica menedzser?", answer: "Ezek a Utility Widgetek segítenek a kiegészítő adatok kezelésében. A Gumihotelben követheted, melyik abroncs van felszerelve és mennyit futott, a Matrica menedzser pedig figyelmeztet a pályamatrica lejártára." },
    { question: "Ingyenes a használata?", answer: "A Starter csomag magánszemélyeknek 1 autóig teljesen ingyenes, ami tartalmazza a szervizkönyvet és költségkövetést. Több autóhoz és az AI funkciókhoz Pro előfizetés szükséges." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200 selection:bg-amber-500/30 overflow-x-hidden">
      
      {promo && <PromoModal promo={promo} />}
      <BackgroundGlows />

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/5 py-4 shadow-2xl' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
             <div className="w-8 h-8 relative group-hover:scale-110 transition-transform duration-300">
                <Image src="/DynamicSense-logo.png" alt="Logo" fill className="object-contain" />
             </div>
             <span className="text-xl font-bold tracking-tight text-white uppercase hidden sm:block group-hover:text-amber-500 transition-colors duration-300">
               Dynamic<span className="text-amber-500 group-hover:text-white transition-colors duration-300">Sense</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group">
                Funkciók <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 transition-all group-hover:w-full"></span>
            </a>
            <a href="#gamification" className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group">
                Közösség <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 transition-all group-hover:w-full"></span>
            </a>
            <Link href="/pricing" className="text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors">Árazás</Link>
            <div className="h-4 w-px bg-slate-800"></div>
            
            <Link href="/login" className="text-sm font-bold text-white hover:text-amber-400 transition-colors">Belépés</Link>
            
            {/* Shimmer Button */}
            <Link href="/login" className="group relative overflow-hidden bg-white text-slate-950 px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2">
                <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-slate-200/50 to-transparent transform -skew-x-12 transition-all duration-1000 group-hover:left-[100%]" />
                <span className="relative z-10">Kezdés</span> 
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-slate-300 p-2 hover:bg-white/10 rounded-lg transition-colors">
             {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
            {mobileMenuOpen && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="absolute top-full left-0 w-full bg-slate-950 border-b border-slate-800 overflow-hidden md:hidden shadow-2xl"
                >
                    <div className="p-6 flex flex-col gap-4">
                        <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-slate-400 py-3 border-b border-slate-800 hover:text-white">Funkciók</a>
                        <a href="#gamification" onClick={() => setMobileMenuOpen(false)} className="text-slate-400 py-3 border-b border-slate-800 hover:text-white">Közösség</a>
                        <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-amber-500 py-3 border-b border-slate-800 font-bold">Árazás</Link>
                        <Link href="/login" className="bg-amber-500 text-slate-950 text-center py-3 rounded-xl font-bold mt-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                            Fiók létrehozása
                        </Link>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col pt-32 px-4">
        
        {/* HERO SECTION */}
        <section className="flex flex-col items-center text-center max-w-6xl mx-auto mb-16">
            
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 mb-8 hover:border-amber-500/30 transition-colors cursor-default backdrop-blur-md shadow-lg"
            >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Rendszer Élesítve v2.1 • AI Integrációval
            </motion.div>

            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight leading-[1.1] mb-6 drop-shadow-2xl"
            >
                Az autód <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600">digitális agya.</span>
            </motion.h1>

            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="text-lg sm:text-xl text-slate-400 leading-relaxed font-light max-w-2xl mx-auto mb-10"
            >
                A DynamicSense egy mesterséges intelligenciával támogatott, felhőalapú garázs. Költségkövetés, digitális szervizkönyv és flotta menedzsment egy helyen.
            </motion.p>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center z-30 relative"
            >
                <Link href="/login" className="group relative bg-amber-500 text-slate-950 text-lg font-bold px-8 py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 overflow-hidden hover:-translate-y-1">
                    <span className="relative">Ingyenes Regisztráció</span>
                    <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#features" className="bg-slate-900/50 hover:bg-slate-800/80 backdrop-blur-md text-white text-lg font-bold px-8 py-4 rounded-2xl transition-all border border-slate-700 hover:border-slate-500 flex items-center justify-center gap-2 hover:-translate-y-1">
                   Funkciók
                </a>
            </motion.div>

            <DashboardPreview />
        </section>

        {/* LIVE TICKER */}
        <LiveTicker />

        {/* BENTO GRID FEATURES */}
        <section id="features" className="max-w-7xl mx-auto mb-32 w-full px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Minden, ami a garázsodhoz kell.</h2>
                <p className="text-slate-400 max-w-xl mx-auto">Váltsd le a kockás füzetet egy proaktív, intelligens rendszerre.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
                
                {/* 1. Feature: AI Mechanic (Large) */}
                <SpotlightCard className="col-span-1 md:col-span-2 row-span-2 group border-indigo-500/20" spotlightColor="rgba(99,102,241,0.15)">
                    <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                        <Sparkles size={120} />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-between p-8">
                        <div>
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                                <Sparkles size={28} />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-3">AI Szerelő</h3>
                            <p className="text-slate-400 leading-relaxed text-lg">
                                Fotózd le a hibakódot, vagy írd be a tüneteket. A GPT-4o alapú asszisztensünk azonnal elemzi a problémát.
                            </p>
                        </div>
                        <div className="mt-8 bg-slate-950/80 rounded-xl p-5 border border-white/10 backdrop-blur-md">
                            <div className="flex gap-3 mb-3 items-center">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="text-xs text-red-400 font-mono font-bold tracking-wider">ALERT: P0300</span>
                            </div>
                            <p className="text-sm text-indigo-200 font-mono">
                                <span className="text-slate-500">{`> `}</span>
                                "Égéskimaradást észleltem. Ez gyakran gyújtótrafó vagy gyertya hiba."
                            </p>
                        </div>
                    </div>
                </SpotlightCard>

                {/* 2. Feature: Fleet Health */}
                <SpotlightCard className="col-span-1 md:col-span-1 row-span-2 flex flex-col items-center text-center justify-center p-6 border-slate-800" spotlightColor="rgba(16,185,129,0.15)">
                    <div className="relative w-40 h-40 mb-8 group-hover:scale-110 transition-transform duration-500">
                         <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                            <path className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" strokeDasharray="94, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-4xl font-black text-white">94%</span>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Flotta Egészség</h3>
                    <p className="text-slate-400 text-sm">Élő mutató a karbantartások alapján.</p>
                </SpotlightCard>

                {/* 3. Feature: Costs */}
                <SpotlightCard className="col-span-1 md:col-span-1 p-6" spotlightColor="rgba(245,158,11,0.15)">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center mb-4 border border-amber-500/20">
                         <BarChart3 size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">Költség Analitika</h3>
                      <p className="text-slate-400 text-sm">Lásd, hova folyik a pénz.</p>
                </SpotlightCard>

                {/* 4. Feature: Service Log */}
                <SpotlightCard className="col-span-1 md:col-span-1 p-6" spotlightColor="rgba(59,130,246,0.15)">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center mb-4 border border-blue-500/20">
                         <ShieldCheck size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">Digitális Szervizkönyv</h3>
                      <p className="text-slate-400 text-sm">Hiteles PDF export eladáshoz.</p>
                </SpotlightCard>

                {/* 5. Feature: Utility Widgets (Wide) */}
                <SpotlightCard className="col-span-1 md:col-span-2 lg:col-span-4 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-left max-w-md">
                        <h3 className="text-2xl font-bold text-white mb-2">Hasznos Eszközök</h3>
                        <p className="text-slate-400">Apró, de nélkülözhetetlen funkciók a mindennapokra.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                        {[
                            { icon: Layers, text: "Gumihotel" },
                            { icon: CheckCircle2, text: "Matrica Figyelő" },
                            { icon: Calendar, text: "Műszaki Értesítő" }
                        ].map((item, i) => (
                            <div key={i} className="group flex items-center gap-3 bg-slate-800/50 px-5 py-3 rounded-xl border border-white/5 hover:border-amber-500/30 hover:bg-slate-800 transition-all cursor-default">
                                <item.icon className="text-slate-400 group-hover:text-amber-500 transition-colors" size={20} />
                                <span className="text-sm font-bold text-slate-200">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </SpotlightCard>
            </div>
        </section>

        {/* GAMIFICATION */}
        <section id="gamification" className="max-w-5xl mx-auto mb-32 px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-12">Nem csak adminisztráció. Játék.</h2>
            <div className="flex flex-wrap justify-center gap-8">
                {[
                    { label: 'High Miler', desc: '200.000+ km futás', color: 'from-purple-500 to-indigo-600', icon: '🛣️' },
                    { label: 'Eco Driver', desc: 'Flotta egészség >90%', color: 'from-emerald-400 to-green-600', icon: '🍃' },
                    { label: 'Pontos Admin', desc: 'Rendszeres naplózás', color: 'from-blue-400 to-cyan-500', icon: '📅' },
                ].map((badge, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="flex flex-col items-center gap-4 group cursor-pointer"
                    >
                        <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${badge.color} p-0.5 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                            <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-3xl border-4 border-slate-900 z-10 relative">
                                {badge.icon}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-white">{badge.label}</h4>
                            <p className="text-xs text-slate-500">{badge.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>

        {/* PROMO BANNER */}
        {promo && (
           <div className="max-w-4xl mx-auto mb-32 w-full px-4">
              <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 p-8 md:p-12 group hover:border-purple-500/50 transition-colors">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                      <div>
                          <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-4 uppercase tracking-wider border border-purple-500/30">
                            Indulási Ajánlat
                          </div>
                          <h3 className="text-3xl font-bold text-white mb-2">{promo.title}</h3>
                          <p className="text-purple-200/80 max-w-md">{promo.description}</p>
                      </div>
                      <Link href="/login" className="whitespace-nowrap bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_40px_rgba(147,51,234,0.5)] transform hover:scale-105">
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
                        className={`bg-slate-900/30 rounded-2xl border transition-all duration-300 overflow-hidden ${openFaq === index ? 'border-amber-500/50 bg-slate-900/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-slate-800 hover:border-slate-700'}`}
                    >
                        <button 
                            onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            className="w-full text-left p-6 flex justify-between items-center focus:outline-none"
                        >
                            <span className="font-bold text-white text-lg pr-4">{faq.question}</span>
                            <ChevronDown className={`text-amber-500 transition-transform duration-300 flex-shrink-0 ${openFaq === index ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {openFaq === index && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-6 pt-0 text-slate-400 leading-relaxed border-t border-white/5 mt-2">
                                        {faq.answer}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
             </div>
        </section>

        {/* BOTTOM CTA */}
        <div className="max-w-4xl mx-auto w-full mb-20 px-4">
             <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-12 rounded-[2.5rem] text-center relative overflow-hidden group">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-700" />
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
                    <div className="w-8 h-8 relative"><Image src="/DynamicSense-logo.png" alt="Logo" fill className="object-contain" /></div>
                    <span className="text-xl font-bold tracking-tight text-white uppercase">Dynamic<span className="text-amber-500">Sense</span></span>
                </Link>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Magyarország legújabb autófenntartási rendszere. AI diagnosztika, költségkövetés és digitális szervizkönyv egy helyen.
                </p>
                <div className="flex gap-4">
                    <a href="mailto:info.dynamicsense@gmail.com" className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer border border-slate-800 hover:border-amber-500/50">
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
                © 2025 DynamicSense Technologies. Minden jog fenntartva.
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