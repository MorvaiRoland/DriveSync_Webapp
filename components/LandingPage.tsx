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
import { motion, AnimatePresence, useScroll, useTransform, useMotionTemplate, useMotionValue } from 'framer-motion';

// --- TÍPUSOK JAVÍTÁSA (Ez oldja meg az aláhúzást) ---

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  style?: React.CSSProperties; // EZT ADTUK HOZZÁ
}

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  style?: React.CSSProperties; // EZT ADTUK HOZZÁ
}

// --- UI KOMPONENSEK ---

// 1. AURORA HÁTTÉR (Élő, lélegző háttér)
const AuroraBackground = () => (
  <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden pointer-events-none bg-slate-50 dark:bg-[#020617]">
    <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse mix-blend-multiply dark:mix-blend-screen opacity-30" />
    <div className="absolute top-[20%] right-[-20%] w-[60vw] h-[60vw] bg-blue-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-30" />
    <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] bg-indigo-500/10 rounded-full blur-[130px] mix-blend-multiply dark:mix-blend-screen opacity-20" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
  </div>
);

// 2. SPOTLIGHT KÁRTYA (Javítva a style prop miatt)
const SpotlightCard = ({ children, className = "", spotlightColor = "rgba(16, 185, 129, 0.15)", style }: SpotlightCardProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40 overflow-hidden rounded-[2rem] ${className}`}
      onMouseMove={handleMouseMove}
      style={style} // Itt adjuk át a stílust
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

// 3. MAGNETIC BUTTON (Javítva a style prop miatt)
const MagneticButton = ({ children, className = "", href = "#", style }: MagneticButtonProps) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });
  const { x, y } = position;

  return (
    <motion.div style={{ x, y }} transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}>
      <Link 
        ref={ref} 
        onMouseMove={handleMouse} 
        onMouseLeave={reset} 
        href={href} 
        className={className}
        style={style} // Itt adjuk át a stílust a Link-nek
      >
        {children}
      </Link>
    </motion.div>
  );
};

// 4. TÉMA VÁLTÓ
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
      className="relative p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 backdrop-blur-sm shadow-sm"
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

// 5. 3D INTERAKTÍV DASHBOARD
const DashboardMockup = () => {
  const { scrollY } = useScroll();
  const rotateX = useTransform(scrollY, [0, 600], [20, 0]);
  const scale = useTransform(scrollY, [0, 600], [0.9, 1]);
  const y = useTransform(scrollY, [0, 600], [60, 0]);
  const opacity = useTransform(scrollY, [0, 400], [0.6, 1]);

  return (
    <motion.div 
      style={{ rotateX, scale, y, opacity, transformPerspective: 1000 }}
      className="relative mx-auto mt-20 max-w-6xl w-full px-4 sm:px-6 lg:px-8 z-20 group"
    >
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-emerald-500/20 blur-[120px] -z-10 rounded-full transition-all duration-1000 group-hover:bg-emerald-500/30" />

      {/* Container */}
      <div className="relative rounded-2xl border border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-[#0B1121]/80 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.2)] dark:shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/20 transition-all duration-500 group-hover:scale-[1.01]">
        
        {/* Browser Header */}
        <div className="h-10 border-b border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 flex items-center px-4 space-x-2">
          <div className="flex gap-1.5">
             <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
             <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="ml-4 px-3 py-1 rounded-md bg-white/50 dark:bg-white/5 text-[10px] text-slate-500 font-mono flex items-center gap-2 border border-slate-200/50 dark:border-white/5">
             <Lock size={10} className="text-emerald-500" /> app.dynamicsense.com
          </div>
        </div>

        {/* Dashboard UI */}
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 bg-slate-50/30 dark:bg-transparent">
            {/* Sidebar */}
            <div className="hidden md:flex col-span-2 flex-col gap-4 border-r border-slate-200/50 dark:border-white/5 pr-4">
                <div className="h-8 w-8 bg-emerald-500 rounded-lg mb-4" />
                {[1,2,3,4].map(i => <div key={i} className="h-2 w-16 bg-slate-200 dark:bg-white/10 rounded-full" />)}
            </div>

            {/* Content */}
            <div className="col-span-12 md:col-span-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stat 1 */}
                <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="text-4xl font-black text-slate-800 dark:text-white mb-1">94%</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Flotta Állapot</div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                </div>
                {/* Stat 2 AI */}
                <div className="md:col-span-2 bg-gradient-to-br from-indigo-500 to-blue-600 p-5 rounded-xl text-white relative overflow-hidden flex flex-col justify-between">
                     <Sparkles className="absolute top-4 right-4 text-white/20 w-12 h-12" />
                     <div className="flex items-center gap-2 mb-2">
                        <div className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold border border-white/20">AI MECHANIC</div>
                     </div>
                     <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-sm font-medium border border-white/10">
                        "A P0300 hibakód égéskimaradást jelez. Ellenőrizd a gyertyákat!"
                     </div>
                </div>
                {/* Graph */}
                <div className="md:col-span-3 h-32 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/5 p-4 flex items-end gap-2">
                    {[30, 50, 45, 70, 60, 85, 95].map((h, i) => (
                        <motion.div 
                           key={i} 
                           initial={{ height: 0 }} 
                           whileInView={{ height: `${h}%` }} 
                           transition={{ duration: 1, delay: i*0.1 }}
                           className="flex-1 bg-slate-100 dark:bg-white/10 rounded-sm hover:bg-emerald-500 transition-colors" 
                        />
                    ))}
                </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

// 6. TYPERWRITER TEXT
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

// --- FŐ KOMPONENS ---

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
    { question: "Tényleg teljesen ingyenes?", answer: "Igen! Jelenleg 'Early Access' fázisban vagyunk. Szeretnénk, ha minél többen kipróbálnák a teljes prémium élményt korlátok nélkül." },
    { question: "Hogyan működik a Flotta Egészség mutató?", answer: "A rendszer egy intelligens algoritmus segítségével elemzi a szervizintervallumokat, a megtett kilométereket és a legutóbbi karbantartásokat. Ha minden zöld, az autód műszakilag rendben van." },
    { question: "Tényleg felismeri az AI a hibakódokat?", answer: "Igen! A Gemini 2.5 alapú AI Szerelőnk képes értelmezni a fotózott vagy beírt hibakódokat (pl. P0300), és magyar nyelven, érthetően elmagyarázza a probléma okát és a teendőket." },
    { question: "Mi történik, ha vége az ingyenes időszaknak?", answer: "Aki most regisztrál, az 'Early Bird' státuszt kap, és a jövőben is kiemelt kedvezményeket vagy örökös hozzáférést biztosítunk az alapadatokhoz." }
  ];

  return (
    <div className="min-h-screen font-sans text-slate-900 dark:text-slate-100 selection:bg-emerald-500/30 overflow-x-hidden">
      
      {promo && <PromoModal promo={promo} />}
      <AuroraBackground />

      {/* --- NAVBAR --- */}
      <nav 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/80 dark:bg-[#030712]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 py-3 shadow-lg dark:shadow-none' 
            : 'bg-transparent border-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group relative z-50">
             <div className="relative w-10 h-10 group-hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg opacity-0 group-hover:opacity-20 transition-opacity" />
                <Image 
                  src="/DynamicSense-logo.png" 
                  alt="DynamicSense" 
                  width={40} 
                  height={40} 
                  className="object-contain w-full h-full drop-shadow-md"
                  onError={(e) => {
                    // Fallback logika: ha a kép nem tölt be, rejtjük és megjelenítjük az ikont
                    e.currentTarget.style.display = 'none';
                    const icon = document.getElementById('fallback-logo-icon');
                    if(icon) icon.style.display = 'flex';
                  }}
                />
                {/* Fallback Icon (hidden by default) */}
                <div id="fallback-logo-icon" style={{display: 'none'}} className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-slate-200 rounded-xl items-center justify-center text-white dark:text-slate-900 shadow-xl absolute inset-0 -z-10">
                   <Gauge size={20} strokeWidth={2.5} />
                </div>
             </div>
             
             <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  Dynamic<span className="text-emerald-500">Sense</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">Garage OS</span>
             </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md px-2 py-1.5 rounded-full border border-slate-200/50 dark:border-white/5 shadow-sm">
             {['Funkciók', 'Árak', 'Blog'].map((item) => (
               <Link key={item} href={`#${item.toLowerCase()}`} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all">
                 {item}
               </Link>
             ))}
             <Link href="/check" className="ml-2 pl-4 border-l border-slate-200 dark:border-white/10 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500">
               VIN Kereső
             </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
             <div className="hidden md:block"><ThemeToggle /></div>
             <Link href="/login" className="hidden md:flex bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-emerald-500/20">
                Belépés
             </Link>
             
             {/* Mobile Menu Toggle */}
             <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white active:scale-90 transition-transform"
             >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
             </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
             <motion.div 
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               exit={{ opacity: 0, height: 0 }}
               className="absolute top-full left-0 w-full bg-white/95 dark:bg-[#030712]/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-2xl md:hidden overflow-hidden"
             >
                <div className="p-6 flex flex-col gap-2">
                   {['Funkciók', 'Árak', 'Blog'].map(item => (
                      <Link key={item} href="#" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold p-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-900 dark:text-white transition-colors">
                        {item}
                      </Link>
                   ))}
                   <div className="h-px bg-slate-200 dark:bg-white/10 my-2" />
                   <div className="flex items-center justify-between p-4">
                      <span className="font-bold text-slate-500">Sötét mód</span>
                      <ThemeToggle />
                   </div>
                   <Link href="/login" className="mt-4 w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg text-center shadow-lg shadow-emerald-500/20">
                      Ingyenes Fiók
                   </Link>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-36 pb-20 lg:pt-52 lg:pb-32 overflow-hidden px-4">
         <div className="max-w-7xl mx-auto text-center relative z-10">
            
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-8 backdrop-blur-md shadow-sm hover:scale-105 transition-transform cursor-default"
            >
               <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
               </span>
               Early Access: Minden Pro funkció ingyenes
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-8 leading-[1.05]"
            >
               Az autód <br className="hidden sm:block" />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 animate-gradient-x">
                  Digitális Agya.
               </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
            >
               Felejtsd el a kockás füzetet. <span className="text-slate-900 dark:text-white font-bold">AI diagnosztika</span>, költségkövetés és hiteles digitális szervizkönyv egyetlen modern applikációban.
            </motion.p>

            {/* Buttons */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
               <MagneticButton 
                 href="/login" 
                 className="w-full sm:w-auto px-10 py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 group text-white dark:text-slate-900"
                 style={{ 
                   background: 'var(--button-bg, #10b981)', // Fallback
                   boxShadow: '0 10px 30px -10px rgba(16,185,129,0.5)'
                 }}
               >
                  <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 absolute inset-0 rounded-2xl"></span>
                  <span className="relative z-10 flex items-center gap-2">Ingyenes Start <ArrowRight className="group-hover:translate-x-1 transition-transform" /></span>
               </MagneticButton>

               <MagneticButton 
                 href="/check" 
                 className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-3"
               >
                  <Search size={20} /> VIN Kereső
               </MagneticButton>
            </motion.div>

            {/* 3D Dashboard */}
            <DashboardMockup />
         </div>
      </header>

      {/* --- TECH SPECS --- */}
      <div className="border-y border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] backdrop-blur-sm overflow-hidden py-10">
         <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
               {[
                  { icon: Lock, label: "Banki Szintű", sub: "AES-256 Titkosítás" },
                  { icon: Cpu, label: "AI Motor", sub: "Gemini 2.5 Flash" },
                  { icon: Server, label: "Adatvédelem", sub: "GDPR Megfelelő" },
                  { icon: Smartphone, label: "Platform", sub: "iOS / Android / Web" },
               ].map((item, i) => (
                  <div key={i} className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left group cursor-default p-4 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                     <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                        <item.icon size={24} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{item.label}</span>
                        <span className="text-base font-bold text-slate-900 dark:text-slate-200">{item.sub}</span>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* --- FEATURES (BENTO GRID) --- */}
      <section id="features" className="py-32 relative px-4">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
               <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                  Több mint egy garázs. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Egy komplett ökoszisztéma.</span>
               </h2>
               <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-xl">
                  Minden eszköz, amire az autófenntartáshoz szükséged lehet, egyetlen, gyönyörű felületen.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
               
               {/* 1. AI MECHANIC */}
               <SpotlightCard className="md:col-span-2 row-span-2 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-900 p-8 md:p-12 relative overflow-hidden" spotlightColor="rgba(99, 102, 241, 0.2)">
                  <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                     <Sparkles size={300} strokeWidth={0.5} />
                  </div>
                  <div className="h-full flex flex-col justify-between relative z-10">
                     <div>
                        <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-8 shadow-xl shadow-indigo-600/20">
                           <Sparkles size={32} />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">AI Szerelő</h3>
                        <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl leading-relaxed max-w-lg">
                           Nem érted a hibakódot? Csak fotózd le vagy írd be. A mesterséges intelligencia azonnal elmagyarázza a probléma okát és a megoldást – magyarul, érthetően.
                        </p>
                     </div>
                     
                     <div className="mt-10 bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-indigo-200/50 dark:border-indigo-500/30 shadow-lg max-w-xl">
                        <div className="flex gap-3 mb-3 items-center">
                           <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                           <span className="font-mono text-sm font-bold text-indigo-900 dark:text-indigo-200">Kérdés: Mit jelent a P0300?</span>
                        </div>
                        <p className="text-base text-slate-700 dark:text-slate-300 border-l-2 border-indigo-500 pl-4">
                           "Ez égéskimaradást jelez több hengernél. Gyakori okok: gyújtógyertya, trafó vagy injektor hiba. Javaslom a gyertyák ellenőrzését első lépésként."
                        </p>
                     </div>
                  </div>
               </SpotlightCard>

               {/* 2. FLEET HEALTH */}
               <SpotlightCard className="bg-slate-50 dark:bg-slate-800/20 flex flex-col items-center justify-center text-center p-8">
                  <div className="relative w-40 h-40 mb-8">
                     <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-200 dark:text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                        <motion.path 
                           initial={{ pathLength: 0 }}
                           whileInView={{ pathLength: 0.94 }}
                           transition={{ duration: 2, ease: "easeOut" }}
                           className="text-emerald-500 drop-shadow-lg" 
                           d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                           fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" 
                        />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-5xl font-black text-slate-900 dark:text-white">94%</span>
                         <span className="text-xs font-bold text-emerald-500 uppercase">Kiváló</span>
                     </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Flotta Egészség</h3>
                  <p className="text-slate-500 dark:text-slate-400">Automatikus elemzés a szervizek és futásteljesítmény alapján.</p>
               </SpotlightCard>

               {/* 3. COSTS */}
               <SpotlightCard className="p-8 flex flex-col justify-between" spotlightColor="rgba(245, 158, 11, 0.2)">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-6 shadow-xl shadow-amber-500/30">
                        <BarChart3 size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Költség Analitika</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        Lásd pontosan, hova folyik a pénz. Tankolások, szervizek, biztosítás grafikonon.
                    </p>
                  </div>
                  <div className="h-32 flex items-end gap-2 mt-8 opacity-80">
                      {[40, 70, 45, 90, 60, 80].map((h, i) => (
                          <div key={i} className="flex-1 bg-amber-500 rounded-t-sm" style={{ height: `${h}%` }} />
                      ))}
                  </div>
               </SpotlightCard>

               {/* 4. SERVICE BOOK */}
               <SpotlightCard className="md:col-span-3 bg-gradient-to-r from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-1 text-left">
                     <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-6 uppercase tracking-wider border border-blue-500/20">
                        <ShieldCheck size={14} /> Eladáskor Aranyat ér
                     </div>
                     <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">Digitális Szervizkönyv</h3>
                     <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl mb-8 leading-relaxed">
                        Minden számla, minden beavatkozás egyetlen hiteles, megosztható PDF dokumentumban. Növeld az autód értékét átlátható, lekövethető előélettel.
                     </p>
                     <div className="flex flex-wrap gap-4">
                        {[
                            { icon: PenTool, txt: "Szerkesztés" },
                            { icon: History, txt: "Előzmények" },
                            { icon: Lock, txt: "Blockchain Ready" }
                        ].map((badge, i) => (
                            <div key={i} className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5 text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                                <badge.icon size={18} className="text-blue-500" /> {badge.txt}
                            </div>
                        ))}
                     </div>
                  </div>
                  <div className="w-full md:w-1/3 aspect-square md:aspect-auto md:h-80 bg-slate-200 dark:bg-slate-700 rounded-2xl relative overflow-hidden shadow-2xl group">
                      <div className="absolute inset-2 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-inner flex flex-col gap-4 transform group-hover:scale-[1.02] transition-transform duration-500">
                          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 mb-2" />
                          <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-700 rounded" />
                          <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-700 rounded" />
                          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-700 space-y-3">
                              {[1,2,3].map(j => (
                                  <div key={j} className="flex justify-between items-center">
                                      <div className="h-3 w-24 bg-slate-100 dark:bg-slate-700 rounded" />
                                      <div className="h-5 w-16 bg-emerald-500/20 rounded-full" />
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
               </SpotlightCard>

            </div>
         </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="max-w-4xl mx-auto w-full mb-32 px-6">
         <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">Gyakori Kérdések</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Minden, amit tudni érdemes a rendszerről.</p>
         </div>

         <div className="space-y-4">
            {faqs.map((faq, index) => (
               <div 
                  key={index} 
                  className={`rounded-2xl transition-all duration-300 overflow-hidden ${
                     openFaq === index 
                        ? 'bg-white dark:bg-slate-900 border border-emerald-500/50 shadow-lg' 
                        : 'bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30'
                  }`}
               >
                  <button 
                     onClick={() => setOpenFaq(openFaq === index ? null : index)}
                     className="w-full text-left p-6 flex justify-between items-center focus:outline-none"
                  >
                     <span className="font-bold text-slate-900 dark:text-white text-lg pr-4">{faq.question}</span>
                     <ChevronDown className={`text-emerald-500 transition-transform duration-300 flex-shrink-0 ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                     {openFaq === index && (
                        <motion.div 
                           initial={{ height: 0, opacity: 0 }}
                           animate={{ height: "auto", opacity: 1 }}
                           exit={{ height: 0, opacity: 0 }}
                           className="overflow-hidden"
                        >
                           <div className="p-6 pt-0 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/50">
                              {faq.answer}
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            ))}
         </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 px-4">
         <div className="max-w-5xl mx-auto relative rounded-[3rem] overflow-hidden bg-[#0B1121] border border-slate-800 shadow-2xl group">
            {/* Animated Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
               <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[150px] animate-pulse" />
               <div className="absolute bottom-[-50%] right-[-20%] w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[150px] animate-pulse delay-700" />
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
            </div>

            <div className="relative z-10 p-12 md:p-24 text-center">
               <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
                  Készen állsz a váltásra?
               </h2>
               <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                  Csatlakozz az <strong className="text-emerald-400">Early Access</strong> programhoz, és használd a DynamicSense minden prémium funkcióját teljesen ingyen. Nincs apróbetűs rész.
               </p>
               <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/login" className="px-12 py-6 bg-white text-slate-900 rounded-2xl font-black text-xl hover:bg-emerald-400 hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3">
                     Fiók létrehozása <ArrowRight />
                  </Link>
               </div>
               <p className="mt-10 text-xs text-slate-500 uppercase tracking-widest font-bold">
                  Nem szükséges bankkártya • 1 perc regisztráció
               </p>
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4">
         <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
               <div className="col-span-1 md:col-span-1">
                  <Link href="/" className="flex items-center gap-2 mb-6">
                     <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Gauge size={20} />
                     </div>
                     <span className="text-2xl font-black text-slate-900 dark:text-white">DynamicSense</span>
                  </Link>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">
                     A jövő garázsa. Adatvezérelt autófenntartás mindenkinek, aki szereti az autóját és a pénztárcáját.
                  </p>
                  <div className="flex gap-4">
                      {[1,2,3].map(i => <div key={i} className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full hover:bg-emerald-500 hover:text-white transition-all cursor-pointer" />)}
                  </div>
               </div>
               
               {[
                   { title: "Termék", links: ["Funkciók", "Árak", "Újdonságok", "Roadmap"] },
                   { title: "Támogatás", links: ["Súgó", "Kapcsolat", "Hibajelentés", "Státusz"] },
                   { title: "Jogi", links: ["Adatvédelem", "ÁSZF", "Impresszum", "Cookie-k"] }
               ].map((col, i) => (
                   <div key={i}>
                       <h4 className="font-bold text-slate-900 dark:text-white mb-6 text-lg">{col.title}</h4>
                       <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                           {col.links.map((link, j) => (
                               <li key={j}><a href="#" className="hover:text-emerald-500 transition-colors block py-1">{link}</a></li>
                           ))}
                       </ul>
                   </div>
               ))}
            </div>

            <div className="border-t border-slate-200 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
               <p className="text-xs text-slate-500 font-mono">
                  © {new Date().getFullYear()} DynamicSense Technologies.
               </p>
               <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
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