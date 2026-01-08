'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight, Search, ShieldCheck, BarChart3, Cpu, 
  MessageCircle, HelpCircle, Facebook, Instagram,
  Menu, X, CheckCircle2, ChevronRight, Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- HELPER KOMPONENSEK ---

const TikTokIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light') {
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
      className={`relative flex items-center justify-between w-14 h-8 rounded-full p-1 transition-colors duration-500 cursor-pointer flex-shrink-0 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-200 border border-slate-300'}`}
      aria-label="Téma váltás"
    >
      <Sun size={14} className={`z-10 ml-1 transition-colors duration-300 ${isDark ? 'text-slate-500' : 'text-amber-500'}`} />
      <motion.div className="absolute w-6 h-6 rounded-full shadow-md z-0" initial={false} animate={{ x: isDark ? 24 : 0, backgroundColor: isDark ? '#0f172a' : '#ffffff' }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
      <Moon size={14} className={`z-10 mr-1 transition-colors duration-300 ${isDark ? 'text-indigo-400' : 'text-slate-400'}`} />
    </button>
  );
};

const BackgroundGlows = () => (
  <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
    <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white to-transparent dark:from-slate-900 dark:to-transparent opacity-60" />
    <div className="absolute top-[-5%] right-[-5%] w-[45vw] h-[45vw] bg-amber-500/10 rounded-full blur-[100px] animate-pulse" />
    <div className="absolute bottom-[20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px]" />
  </div>
);

// --- MAIN PAGE ---

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const questions = [
    "Túllépnél végre a kockás füzet korszakán?",
    "Digitális jövőt adnál a garázsodnak?",
    "Készen állsz egy átláthatóbb autózásra?"
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % questions.length), 4000);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, [questions.length]);

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('features');
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-200 selection:bg-amber-500/30 font-sans transition-colors duration-500 flex flex-col overflow-x-hidden">
      <BackgroundGlows />

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 w-full z-[100] transition-all duration-300 border-b pt-[env(safe-area-inset-top)] ${scrolled || mobileMenuOpen ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-slate-200 dark:border-white/5 shadow-lg' : 'bg-transparent border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex justify-between items-center">
          <Link href="/" onClick={scrollToTop} className="flex items-center gap-2 group z-50 cursor-pointer">
            <div className="w-8 h-8 sm:w-9 sm:h-9 relative group-hover:scale-110 transition-transform duration-300"><Image src="/DynamicSense-logo.png" alt="Logo" fill className="object-contain" /></div>
            <span className="text-lg sm:text-xl font-bold uppercase dark:text-white tracking-tight">Dynamic<span className="text-amber-500">Sense</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle />
            <a href="#features" onClick={scrollToFeatures} className="text-sm font-semibold hover:text-amber-500 transition-colors cursor-pointer">Funkciók</a>
            <Link href="/check" className="text-sm font-semibold hover:text-amber-500 transition-colors">Alvázszám kereső</Link>
            <Link href="/login" className="text-sm font-bold dark:text-white">Belépés</Link>
            <Link href="/login?mode=signup" className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:shadow-lg transition-all active:scale-95">
              Ingyenes Start <ArrowRight size={16} />
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600 dark:text-slate-300 z-50 cursor-pointer">{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
              <div className="px-6 pt-2 pb-6 flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                   <span className="font-semibold text-slate-700 dark:text-slate-300">Megjelenés</span>
                   <ThemeToggle />
                </div>
                <a href="#features" onClick={scrollToFeatures} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600"><Cpu size={20}/></div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Funkciók</span>
                </a>
                <Link href="/check" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600"><Search size={20}/></div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Alvázszám Kereső</span>
                </Link>
                <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-1"></div>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="p-3 font-semibold text-center hover:text-amber-500 transition-colors">Belépés</Link>
                <Link href="/login?mode=signup" onClick={() => setMobileMenuOpen(false)} className="w-full bg-amber-500 text-slate-950 font-bold py-4 rounded-xl text-center shadow-lg shadow-amber-500/20 active:scale-95 transition-transform">
                  Fiók létrehozása ingyen
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Content */}
      <main className="flex-grow w-full relative pt-32 sm:pt-40 lg:pt-48 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            <div className="flex-1 text-center lg:text-left z-10 w-full">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider mb-8">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative rounded-full h-2 w-2 bg-amber-500"></span></span>
                Ingyenes regisztráció
              </motion.div>

              {/* --- JAVÍTOTT, RESZPONZÍV CÍM SZEKCIÓ --- */}
              <div className="min-h-[180px] sm:min-h-[200px] lg:min-h-[240px] flex flex-col justify-start relative z-20">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight">
                  Az autód <br className="hidden lg:block"/>
                  <div className="relative mt-2 w-full">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                        className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 pb-2 break-words"
                      >
                        {questions[index]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </h1>
              </div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light mt-4">
                Felejtsd el a kockás füzetet. AI diagnosztika, költségkövetés és hiteles digitális szervizkönyv egyetlen modern alkalmazásban. 
                <span className="block mt-2 font-medium text-slate-900 dark:text-white">Vedd át az irányítást az autód felett.</span>
              </motion.p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/login?mode=signup" className="px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2">
                  Regisztrálok <ChevronRight size={18} />
                </Link>
                <Link href="/check" className="px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  <Search size={18} /> Alvázszám kereső
                </Link>
              </div>

              <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500"/> Nincs bankkártya</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500"/> Azonnali hozzáférés</div>
              </div>
            </div>

            {/* Right side Illustration */}
            <div className="flex-1 w-full max-w-sm lg:max-w-none relative">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-2 shadow-2xl">
                 <div className="bg-white dark:bg-slate-950 rounded-[1.25rem] overflow-hidden h-[300px] sm:h-[400px] flex flex-col relative">
                    <div className="h-12 border-b border-slate-100 dark:border-white/5 flex items-center px-4 gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="h-8 w-32 bg-indigo-500/10 rounded-lg animate-pulse" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-slate-50 dark:bg-slate-900 rounded-xl" />
                        <div className="h-24 bg-slate-50 dark:bg-slate-900 rounded-xl" />
                      </div>
                    </div>
                    {/* Floating Status Card */}
                    <motion.div 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1, type: "spring" }}
                        className="absolute bottom-6 right-6 left-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-3"
                      >
                         <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg flex-shrink-0">
                           <ShieldCheck size={20} />
                         </div>
                         <div>
                           <div className="text-xs font-bold text-slate-900 dark:text-white">Diagnosztika kész</div>
                           <div className="text-[10px] text-slate-500">Minden rendszer normális.</div>
                         </div>
                      </motion.div>
                 </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="mt-32 scroll-mt-32">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[
                { 
                  icon: <Cpu size={32} className="text-indigo-500" />, 
                  title: "AI Szerelő", 
                  desc: "Fotózd le a hibakódot vagy írd le a problémát. A Gemini AI azonnal elemzi és megoldást javasol.",
                  bg: "hover:bg-indigo-500/5 hover:border-indigo-500/30"
                },
                { 
                  icon: <ShieldCheck size={32} className="text-emerald-500" />, 
                  title: "Digitális Könyv", 
                  desc: "Hiteles szervizmúlt, ami pénzt ér eladáskor. Minden beavatkozás egy helyen, kereshetően.",
                  bg: "hover:bg-emerald-500/5 hover:border-emerald-500/30"
                },
                { 
                  icon: <BarChart3 size={32} className="text-amber-500" />, 
                  title: "Költségkövető", 
                  desc: "Tankolások, szervizek, biztosítás. Lásd vizuálisan, mennyibe kerül valójában az autód.",
                  bg: "hover:bg-amber-500/5 hover:border-amber-500/30"
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1 }}
                  className={`group p-8 rounded-[2rem] bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 backdrop-blur-sm transition-all duration-300 ${feature.bg}`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 mb-20">
             <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 dark:bg-indigo-950 text-white p-8 md:p-16 text-center shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 blur-[100px] rounded-full" />
                
                <div className="relative z-10 max-w-2xl mx-auto">
                  <h2 className="text-3xl md:text-5xl font-bold mb-6">Kezdd el ma, ingyen.</h2>
                  <p className="text-slate-300 text-lg mb-10">
                    Nincs próbaidőszak, nincsenek rejtett költségek. Csak te, az autód, és a nyugalom.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                    <Link 
                      href="/login?mode=signup" 
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-400 transition-colors shadow-lg shadow-amber-900/20"
                    >
                      Fiók létrehozása
                    </Link>
                    <Link 
                      href="/login" 
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors"
                    >
                      Belépés
                    </Link>
                  </div>
                </div>
             </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-slate-500 text-xs font-mono">© {new Date().getFullYear()} DynamicSense Technologies. Minden jog fenntartva.</p>
          <div className="flex gap-6 text-xs text-slate-500">
             <Link href="/privacy" className="hover:text-amber-500">Adatkezelés</Link>
             <Link href="/terms" className="hover:text-amber-500">ÁSZF</Link>
             <Link href="/impressum" className="hover:text-amber-500">Impresszum</Link>
          </div>
          <div className="flex gap-4 items-center justify-center md:justify-end">
              <a href="#" className="text-slate-400 hover:text-amber-500"><Facebook size={18}/></a>
              <a href="#" className="text-slate-400 hover:text-amber-500"><Instagram size={18}/></a>
              <a href="#" className="text-slate-400 hover:text-amber-500"><TikTokIcon size={18}/></a>
          </div>
        </div>
      </footer>
    </div>
  );
}