'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight, Sparkles, CheckCircle2, Calendar, 
  BarChart3, ShieldCheck, Zap, Menu, X, Lock, 
  MessageCircle, HelpCircle, Server, Smartphone,
  ChevronDown, Layers, AlertTriangle, Cpu, Gift, Search,
  Sun, Moon, Gauge, PenTool, History
} from 'lucide-react';
import PromoModal from '@/components/PromoModal'; 
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionTemplate, useMotionValue } from 'framer-motion';

// --- 1. UI COMPONENTS & EFFECTS ---

// AURORA BACKGROUND (Dinamikus háttér)
const AuroraBackground = () => (
  <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden pointer-events-none bg-slate-50 dark:bg-[#020617]">
    <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse mix-blend-multiply dark:mix-blend-screen opacity-40" />
    <div className="absolute top-[20%] right-[-20%] w-[60vw] h-[60vw] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-40" />
    <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-amber-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-30" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
  </div>
);

// THEME TOGGLE
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('theme') === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newStatus = !isDark;
    setIsDark(newStatus);
    if (newStatus) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
            <Moon size={18} />
          </motion.div>
        ) : (
          <motion.div key="sun" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
            <Sun size={18} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

// SPOTLIGHT CARD (Mouse follow effect)
const SpotlightCard = ({ children, className = "", spotlightColor = "rgba(16, 185, 129, 0.15)" }: any) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden rounded-[2rem] ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              ${spotlightColor},
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

// 3D DASHBOARD MOCKUP
const DashboardMockup = () => {
  const { scrollY } = useScroll();
  const rotateX = useTransform(scrollY, [0, 600], [15, 0]);
  const scale = useTransform(scrollY, [0, 600], [0.95, 1]);
  const y = useTransform(scrollY, [0, 600], [50, 0]);
  const opacity = useTransform(scrollY, [0, 400], [0.8, 1]);

  return (
    <motion.div 
      style={{ rotateX, scale, y, opacity, transformPerspective: 1200 }}
      className="relative mx-auto mt-16 max-w-6xl w-full px-4 sm:px-6 lg:px-8 z-20"
    >
      {/* Glow Effect behind dashboard */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-emerald-500/20 blur-[100px] -z-10 rounded-full" />

      {/* Main Dashboard Container */}
      <div className="relative rounded-2xl border border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-[#0B1121]/70 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/20">
        
        {/* Fake Browser Bar */}
        <div className="h-10 border-b border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 flex items-center px-4 space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-400/80" />
          <div className="w-3 h-3 rounded-full bg-amber-400/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
          <div className="ml-4 px-3 py-1 rounded-md bg-slate-100/50 dark:bg-white/5 text-[10px] text-slate-500 font-mono flex items-center gap-2">
             <Lock size={10} /> dynamicsense.app
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            
            {/* Sidebar (Fake) */}
            <div className="hidden md:flex col-span-2 flex-col gap-4 border-r border-slate-200/50 dark:border-white/5 pr-4">
                <div className="h-8 w-24 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
                <div className="space-y-2 mt-4">
                    {[1,2,3,4].map(i => <div key={i} className="h-6 w-full bg-slate-100 dark:bg-white/5 rounded-md" />)}
                </div>
            </div>

            {/* Main Content */}
            <div className="col-span-12 md:col-span-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Widget 1: Health */}
                <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 p-4 rounded-xl shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                    <Gauge className="w-12 h-12 text-emerald-500 mb-2" />
                    <span className="text-3xl font-black text-slate-800 dark:text-white">96%</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Flotta Egészség</span>
                </div>

                {/* Widget 2: AI Mechanic */}
                <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-slate-900/80 border border-indigo-100 dark:border-indigo-500/20 p-4 rounded-xl shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                             <Sparkles className="w-4 h-4 text-indigo-500" />
                             <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">AI Diagnosztika</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-full font-bold">LIVE</span>
                    </div>
                    <div className="space-y-2">
                        <div className="bg-white/60 dark:bg-black/20 p-2 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                             "P0300 hibakód - Mit jelent?"
                        </div>
                        <div className="bg-indigo-500/10 p-2 rounded-lg text-xs text-indigo-900 dark:text-indigo-100 border-l-2 border-indigo-500">
                             Égéskimaradás több hengernél. Javaslom a gyertyák és trafók ellenőrzését.
                        </div>
                    </div>
                </div>

                {/* Widget 3: Chart */}
                <div className="col-span-1 md:col-span-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 p-4 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Költségek (Elmúlt 6 hónap)</span>
                        <BarChart3 className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="h-24 flex items-end justify-between gap-2">
                        {[40, 65, 30, 85, 50, 75].map((h, i) => (
                            <motion.div 
                                key={i}
                                initial={{ height: 0 }}
                                whileInView={{ height: `${h}%` }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="w-full bg-slate-100 dark:bg-white/10 rounded-t-sm relative group"
                            >
                                <div className="absolute bottom-0 w-full bg-amber-500 opacity-80 group-hover:opacity-100 transition-opacity" style={{ height: '100%' }} />
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN PAGE ---

export default function LandingPage({ promo, updates }: { promo?: any, updates: any[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans text-slate-900 dark:text-slate-100 selection:bg-emerald-500/30 overflow-x-hidden">
      
      {promo && <PromoModal promo={promo} />}
      <AuroraBackground />

      {/* --- NAVBAR --- */}
      <nav 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-slate-200 dark:border-white/5 py-3' 
            : 'bg-transparent border-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
             <div className="relative w-9 h-9 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg group-hover:shadow-emerald-500/30 transition-all">
                <Gauge className="text-white w-5 h-5" />
             </div>
             <div className="hidden sm:flex flex-col">
                <span className="text-lg font-bold leading-none tracking-tight text-slate-900 dark:text-white">
                  Dynamic<span className="text-emerald-500">Sense</span>
                </span>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Garage OS</span>
             </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
             <Link href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Funkciók</Link>
             <Link href="#pricing" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Árak</Link>
             <Link href="/check" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                <Search size={14} /> VIN Kereső
             </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
             <div className="hidden md:block"><ThemeToggle /></div>
             <Link href="/login" className="hidden md:flex bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-lg hover:shadow-xl">
                Belépés
             </Link>
             
             {/* Mobile Menu Button */}
             <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-700 dark:text-slate-200"
             >
                {mobileMenuOpen ? <X /> : <Menu />}
             </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
             <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="absolute top-full left-0 w-full bg-white dark:bg-[#020617] border-b border-slate-200 dark:border-white/5 shadow-2xl md:hidden flex flex-col p-6 gap-4"
             >
                <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium p-2">Funkciók</Link>
                <Link href="/check" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium p-2 flex items-center gap-2"><Search size={18}/> Alvázszám Kereső</Link>
                <div className="h-px bg-slate-100 dark:bg-white/5 my-2" />
                <div className="flex justify-between items-center">
                   <span className="text-slate-500">Téma</span>
                   <ThemeToggle />
                </div>
                <Link href="/login" className="bg-emerald-600 text-white text-center py-3 rounded-xl font-bold mt-2">
                   Fiók létrehozása
                </Link>
             </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-8 backdrop-blur-md"
            >
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               Early Access: Ingyenes Pro Funkciók
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-6 leading-[1.1]"
            >
               Az autód <br className="hidden sm:block" />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 animate-gradient-x">
                  Digitális Agya.
               </span>
            </motion.h1>

            <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
               Felejtsd el a kockás füzetet. AI diagnosztika, költségkövetés és hiteles digitális szervizkönyv egyetlen modern applikációban.
            </motion.p>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
               <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg hover:scale-105 hover:shadow-2xl transition-all flex items-center justify-center gap-2">
                  Ingyenes Start <ArrowRight size={20} />
               </Link>
               <Link href="/check" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                  <Search size={20} /> VIN Kereső
               </Link>
            </motion.div>

            {/* 3D Dashboard Preview */}
            <DashboardMockup />
         </div>
      </header>

      {/* --- TECH TRUST BAR --- */}
      <div className="border-y border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] backdrop-blur-sm overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
               {[
                  { icon: Lock, label: "Banki Szintű", sub: "AES-256 Titkosítás" },
                  { icon: Cpu, label: "AI Motor", sub: "Gemini 2.5 Flash" },
                  { icon: Server, label: "Adatvédelem", sub: "GDPR Megfelelő" },
                  { icon: Smartphone, label: "Platform", sub: "iOS / Android / Web" },
               ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 justify-center md:justify-start group cursor-default">
                     <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm text-slate-400 group-hover:text-emerald-500 transition-colors">
                        <item.icon size={20} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-200">{item.sub}</span>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* --- FEATURES (BENTO GRID) --- */}
      <section id="features" className="py-32 relative">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
               <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
                  Több mint egy garázs. <br />
                  <span className="text-emerald-500">Egy komplett ökoszisztéma.</span>
               </h2>
               <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                  Minden eszköz, amire az autófenntartáshoz szükséged lehet, egyetlen, gyönyörű felületen.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
               
               {/* Feature 1: AI Mechanic (Large) */}
               <SpotlightCard className="md:col-span-2 row-span-2 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-900" spotlightColor="rgba(99, 102, 241, 0.2)">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                     <Sparkles size={200} />
                  </div>
                  <div className="p-8 h-full flex flex-col justify-between relative z-10">
                     <div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
                           <Sparkles size={24} />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">AI Szerelő</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-md">
                           Nem érted a hibakódot? Csak fotózd le vagy írd be. A mesterséges intelligencia azonnal elmagyarázza a probléma okát és a megoldást – magyarul.
                        </p>
                     </div>
                     <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-xl p-4 border border-indigo-200 dark:border-indigo-500/30 mt-8">
                        <div className="flex gap-3 mb-2">
                           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mt-1.5" />
                           <span className="font-mono text-sm font-bold text-slate-800 dark:text-indigo-200">Kérdés: Mit jelent a P0300?</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 pl-5">
                           "Ez égéskimaradást jelez. Gyakori okok: gyújtógyertya, trafó vagy injektor hiba. Javaslom a gyertyák ellenőrzését."
                        </p>
                     </div>
                  </div>
               </SpotlightCard>

               {/* Feature 2: Fleet Health */}
               <SpotlightCard className="bg-slate-50 dark:bg-slate-800/20 flex flex-col items-center justify-center text-center p-8">
                  <div className="relative w-32 h-32 mb-6">
                     <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-200 dark:text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        <motion.path 
                           initial={{ pathLength: 0 }}
                           whileInView={{ pathLength: 0.94 }}
                           transition={{ duration: 2, ease: "easeOut" }}
                           className="text-emerald-500" 
                           d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                           fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" 
                        />
                     </svg>
                     <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-slate-900 dark:text-white">94%</div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Flotta Egészség</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Automatikus elemzés a szervizek alapján.</p>
               </SpotlightCard>

               {/* Feature 3: Costs */}
               <SpotlightCard className="p-8" spotlightColor="rgba(245, 158, 11, 0.2)">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30">
                     <BarChart3 size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Költség Analitika</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                     Lásd pontosan, mennyibe kerül az autód fenntartása. Tankolások, szervizek, biztosítás grafikonon.
                  </p>
               </SpotlightCard>

               {/* Feature 4: Service Book (Wide) */}
               <SpotlightCard className="md:col-span-3 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/50 p-8 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 text-left">
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-4 uppercase tracking-wider">
                        <ShieldCheck size={14} /> Eladáskor Aranyat ér
                     </div>
                     <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">Digitális Szervizkönyv</h3>
                     <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
                        Minden számla, minden beavatkozás egyetlen hiteles, megosztható PDF dokumentumban. Növeld az autód értékét átlátható előélettel.
                     </p>
                     <div className="flex flex-wrap gap-4">
                        {[
                            { icon: PenTool, txt: "Szerkesztés" },
                            { icon: History, txt: "Előzmények" },
                            { icon: Lock, txt: "Blockchain Ready" }
                        ].map((badge, i) => (
                            <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-black/20 rounded-lg border border-slate-200 dark:border-white/5 text-sm font-bold text-slate-700 dark:text-slate-300">
                                <badge.icon size={16} className="text-blue-500" /> {badge.txt}
                            </div>
                        ))}
                     </div>
                  </div>
                  <div className="w-full md:w-1/3 aspect-video bg-slate-200 dark:bg-slate-700 rounded-xl relative overflow-hidden shadow-inner group">
                      {/* Abstract Document Preview */}
                      <div className="absolute top-4 left-4 right-4 bottom-4 bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 space-y-3 transform group-hover:scale-105 transition-transform duration-500">
                          <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-700/50 rounded" />
                          <div className="h-2 w-2/3 bg-slate-100 dark:bg-slate-700/50 rounded" />
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
                              <div className="flex justify-between"><div className="h-2 w-10 bg-slate-200 dark:bg-slate-600 rounded"/><div className="h-2 w-4 bg-emerald-500 rounded"/></div>
                              <div className="flex justify-between"><div className="h-2 w-12 bg-slate-200 dark:bg-slate-600 rounded"/><div className="h-2 w-4 bg-emerald-500 rounded"/></div>
                          </div>
                      </div>
                  </div>
               </SpotlightCard>

            </div>
         </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 px-4">
         <div className="max-w-5xl mx-auto relative rounded-[3rem] overflow-hidden bg-slate-900 dark:bg-[#0B1121] border border-slate-800 shadow-2xl">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
               <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[150px]" />
               <div className="absolute bottom-[-50%] right-[-20%] w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[150px]" />
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
            </div>

            <div className="relative z-10 p-12 md:p-24 text-center">
               <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
                  Készen állsz a váltásra?
               </h2>
               <p className="text-lg text-slate-300 mb-12 max-w-2xl mx-auto">
                  Csatlakozz az Early Access programhoz, és használd a DynamicSense minden prémium funkcióját teljesen ingyen. Nincs apróbetűs rész.
               </p>
               <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/login" className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-bold text-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-white/10 flex items-center justify-center gap-2">
                     Fiók létrehozása <ArrowRight />
                  </Link>
               </div>
               <p className="mt-8 text-xs text-slate-500 uppercase tracking-widest font-bold">
                  Nem szükséges bankkártya • 1 perc regisztráció
               </p>
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 pt-20 pb-10">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
               <div className="col-span-1 md:col-span-1">
                  <Link href="/" className="flex items-center gap-2 mb-6">
                     <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white">
                        <Gauge size={18} />
                     </div>
                     <span className="text-xl font-bold text-slate-900 dark:text-white">DynamicSense</span>
                  </Link>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                     A jövő garázsa. Adatvezérelt autófenntartás mindenkinek.
                  </p>
                  <div className="flex gap-4">
                      {/* Social Icons Placeholder */}
                      {[1,2,3].map(i => <div key={i} className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-full hover:bg-emerald-500 transition-colors" />)}
                  </div>
               </div>
               
               {/* Footer Links Columns */}
               {[
                   { title: "Termék", links: ["Funkciók", "Árak", "Újdonságok", "Roadmap"] },
                   { title: "Támogatás", links: ["Súgó", "Kapcsolat", "Hibajelentés", "Státusz"] },
                   { title: "Jogi", links: ["Adatvédelem", "ÁSZF", "Impresszum", "Cookie-k"] }
               ].map((col, i) => (
                   <div key={i}>
                       <h4 className="font-bold text-slate-900 dark:text-white mb-6">{col.title}</h4>
                       <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                           {col.links.map((link, j) => (
                               <li key={j}><a href="#" className="hover:text-emerald-500 transition-colors">{link}</a></li>
                           ))}
                       </ul>
                   </div>
               ))}
            </div>

            <div className="border-t border-slate-200 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
               <p className="text-xs text-slate-500 font-mono">
                  © {new Date().getFullYear()} DynamicSense Technologies.
               </p>
               <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  System Online
               </div>
            </div>
         </div>
      </footer>

    </div>
  );
}