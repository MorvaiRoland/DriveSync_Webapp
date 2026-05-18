'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Search, ShieldCheck, BarChart3, Cpu,
  Menu, X, Sun, Moon, Zap, Star, Globe, CheckCircle2, ChevronRight, Activity
} from 'lucide-react';

// ==========================================
// TRANSLATIONS DICTIONARY
// ==========================================
const translations = {
  hu: {
    nav: { features: "Funkciók", testimonials: "Vélemények", pricing: "Árazás", login: "Bejelentkezés", startFree: "Kezdés ingyen" },
    hero: { badge: "A jövő garázsmenedzsmentje", title1: "Intelligens", title2: "Flotta Irányítás", desc: "Minden adat, szervizmúlt és AI szerelő asszisztens egyetlen platformon. Kereskedőknek és magánszemélyeknek.", ctaPrimary: "Kezdj el most ingyen", ctaSecondary: "Alvázszám kereső", users: "Boldog felhasználó csatlakozott" },
    features: { title: "Minden, amire az autódnak szüksége van", f1_title: "AI Szerelő Asszisztens", f1_desc: "Készíts egy fotót a műszerfal hibakódjáról, és a mesterséges intelligencia azonnal elemzi a problémát, valamint megoldási javaslatokat ad valós időben.", f2_title: "Hiteles Szervizkönyv", f2_desc: "Rögzíts minden beavatkozást, csatolj számlákat és fotókat. Egy megbízható, felhő alapú digitális szervizkönyv, ami növeli az autód értékét eladáskor.", f3_title: "Precíziós Költségkövetés", f3_desc: "Tankolások, biztosítások, súlyadók egy helyen. Lásd másodpercre pontosan, mennyibe kerül a flottád vagy autód fenntartása havonta, vizuális grafikonokkal." },
    testimonials: { title: "Mit mondanak a felhasználóink?" },
    footer: { desc: "A legfejlettebb digitális garázs platform autótulajdonosok és flottakezelők számára.", links: "Linkek", legal: "Jogi", privacy: "Adatvédelem", terms: "ÁSZF", rights: "Minden jog fenntartva." }
  },
  en: {
    nav: { features: "Features", testimonials: "Reviews", pricing: "Pricing", login: "Log in", startFree: "Start for free" },
    hero: { badge: "The future of garage management", title1: "Intelligent", title2: "Fleet Control", desc: "All data, service history, and an AI mechanic assistant on a single platform. For dealers and individuals.", ctaPrimary: "Start for free now", ctaSecondary: "VIN Search", users: "Happy users joined" },
    features: { title: "Everything your car needs", f1_title: "AI Mechanic Assistant", f1_desc: "Take a photo of the dashboard error code, and our AI instantly analyzes the problem and provides real-time solution suggestions.", f2_title: "Verified Service History", f2_desc: "Log every maintenance, attach invoices and photos. A reliable cloud-based digital service book that increases your car's resale value.", f3_title: "Precision Cost Tracking", f3_desc: "Refueling, insurance, taxes in one place. See exactly how much it costs to maintain your fleet or car monthly with visual charts." },
    testimonials: { title: "What our users say" },
    footer: { desc: "The most advanced digital garage platform for car owners and fleet managers.", links: "Links", legal: "Legal", privacy: "Privacy Policy", terms: "Terms of Service", rights: "All rights reserved." }
  }
};

type Lang = 'hu' | 'en';

// ==========================================
// ANIMATION VARIANTS
// ==========================================
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

// ==========================================
// SUB-COMPONENTS
// ==========================================

const ThemeToggle = () => {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) return <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>;

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
      aria-label="Toggle Theme"
    >
      <Sun className={`absolute w-5 h-5 transition-all duration-500 ${isDark ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0 text-amber-500'}`} />
      <Moon className={`absolute w-5 h-5 transition-all duration-500 ${isDark ? 'opacity-100 scale-100 rotate-0 text-indigo-400' : 'opacity-0 scale-50 -rotate-90'}`} />
    </button>
  );
};

const LanguageToggle = ({ lang, setLang }: { lang: Lang, setLang: (l: Lang) => void }) => {
  return (
    <button
      onClick={() => setLang(lang === 'hu' ? 'en' : 'hu')}
      className="flex items-center gap-2 px-3 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-bold text-slate-700 dark:text-slate-300"
    >
      <Globe className="w-4 h-4 text-slate-500" />
      <span>{lang.toUpperCase()}</span>
    </button>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export default function LandingPage({ promo, updates }: { promo?: any, updates: any[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLangState] = useState<Lang>('hu');

  useEffect(() => {
    // Load language preference from local storage
    const savedLang = localStorage.getItem('app_lang') as Lang;
    if (savedLang && (savedLang === 'hu' || savedLang === 'en')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0B] selection:bg-indigo-500/30 font-sans overflow-hidden transition-colors duration-500">
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-center">
        <div className="absolute top-[-20%] w-[1000px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 dark:bg-cyan-500/15 blur-[150px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-500/10 dark:bg-purple-500/15 blur-[150px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.04] mix-blend-overlay"></div>
      </div>

      {/* --- NAVBAR --- */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/70 dark:bg-[#0A0A0B]/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/50 shadow-sm' : 'bg-transparent pt-4'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">Dynamic<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Sense</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6 text-sm font-bold text-slate-600 dark:text-slate-400">
              <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t.nav.features}</a>
              <a href="#testimonials" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t.nav.testimonials}</a>
              <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t.nav.pricing}</a>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex items-center gap-3">
              <LanguageToggle lang={lang} setLang={setLang} />
              <ThemeToggle />
              <Link href="/login" className="hidden lg:flex items-center text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {t.nav.login}
              </Link>
              <Link href="/login?mode=signup" className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:bg-indigo-600 dark:hover:bg-indigo-50 dark:hover:text-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 transition-all">
                {t.nav.startFree}
              </Link>
            </div>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600 dark:text-slate-400">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-white/95 dark:bg-[#0A0A0B]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800"
            >
              <div className="p-4 space-y-4 flex flex-col">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 font-bold text-slate-700 dark:text-slate-300">{t.nav.features}</a>
                <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 font-bold text-slate-700 dark:text-slate-300">{t.nav.testimonials}</a>
                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full my-2"></div>
                <div className="flex gap-4 p-3">
                  <LanguageToggle lang={lang} setLang={setLang} />
                  <ThemeToggle />
                </div>
                <Link href="/login" className="w-full p-4 text-center rounded-xl font-bold bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white">
                  {t.nav.login}
                </Link>
                <Link href="/login?mode=signup" className="w-full p-4 text-center rounded-xl font-bold bg-indigo-600 text-white">
                  {t.nav.startFree}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <main className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32 px-4">
        {/* --- ULTRA MODERN HERO --- */}
        <section className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-8 max-w-4xl flex flex-col items-center">
            
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 text-sm font-bold tracking-wide backdrop-blur-sm">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              {t.hero.badge}
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-6xl sm:text-7xl lg:text-[5.5rem] font-black tracking-tighter leading-[1.05]">
              <span className="text-slate-900 dark:text-white block">{t.hero.title1}</span>
              <span className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent block pb-2 drop-shadow-sm">
                {t.hero.title2}
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">
              {t.hero.desc}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
              <Link href="/login?mode=signup" className="group relative px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl overflow-hidden shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto flex justify-center items-center">
                <span className="relative z-10 flex items-center gap-2">
                  {t.hero.ctaPrimary} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 text-white transition-opacity duration-300">
                  {t.hero.ctaPrimary} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link href="/check" className="px-8 py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex justify-center items-center gap-2 w-full sm:w-auto group">
                <Search className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                {t.hero.ctaSecondary}
              </Link>
            </motion.div>
            
            <motion.div variants={fadeUp} className="flex items-center gap-4 pt-8">
              <div className="flex -space-x-3">
                 <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0A0A0B] bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">S</div>
                 <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0A0A0B] bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center text-xs font-bold text-cyan-600 dark:text-cyan-400">T</div>
                 <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0A0A0B] bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-xs font-bold text-purple-600 dark:text-purple-400">R</div>
                 <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0A0A0B] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white shadow-sm">+10k</div>
              </div>
              <div className="text-sm font-medium text-slate-500">
                <span className="font-bold text-slate-900 dark:text-white">{t.hero.users}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Abstract Dashboard Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl mt-20 relative"
          >
            {/* Soft Glow Behind Mockup */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-[#0A0A0B] z-20 h-full w-full pointer-events-none"></div>
            
            <div className="relative rounded-[2rem] bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-2 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 backdrop-blur-xl">
              <div className="rounded-[1.5rem] bg-white dark:bg-[#0A0A0B] border border-slate-100 dark:border-slate-800/50 overflow-hidden w-full aspect-[16/9] md:aspect-[21/9] flex flex-col relative">
                
                {/* Mockup Header */}
                <div className="h-12 border-b border-slate-100 dark:border-slate-800 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                  </div>
                </div>

                {/* Mockup Body Grid */}
                <div className="flex-1 p-6 grid grid-cols-12 gap-6 relative">
                  
                  {/* Floating AI Card */}
                  <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="absolute -right-4 top-8 w-64 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-4 z-30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-500">AI Asszisztens</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">Diagnózis kész</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full"></div>
                      <div className="h-2 w-4/5 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
                    </div>
                  </motion.div>

                  <div className="col-span-3 space-y-4">
                    <div className="h-8 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-slate-50 dark:bg-slate-800/50 rounded-md"></div>
                      <div className="h-4 w-5/6 bg-slate-50 dark:bg-slate-800/50 rounded-md"></div>
                      <div className="h-4 w-full bg-slate-50 dark:bg-slate-800/50 rounded-md"></div>
                    </div>
                  </div>
                  <div className="col-span-9 grid grid-cols-2 gap-4">
                     <div className="h-32 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center"><Activity className="w-4 h-4 text-emerald-600" /></div>
                        <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                     </div>
                     <div className="h-32 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center"><BarChart3 className="w-4 h-4 text-amber-600" /></div>
                        <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                     </div>
                     <div className="col-span-2 h-40 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl"></div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </section>

        {/* --- ZIG-ZAG FEATURES SECTION --- */}
        <section id="features" className="max-w-7xl mx-auto py-32 space-y-32">
          
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{t.features.title}</h2>
          </div>

          {/* Feature 1 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} className="order-2 lg:order-1 relative h-[400px] rounded-[2rem] bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 border border-indigo-500/10 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 mix-blend-overlay"></div>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute w-64 h-64 bg-indigo-500/20 rounded-full blur-[60px]"></motion.div>
              <div className="relative z-10 w-24 h-24 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl flex items-center justify-center border border-slate-200 dark:border-slate-800">
                <Cpu className="w-12 h-12 text-indigo-500" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} className="order-1 lg:order-2 space-y-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{t.features.f1_title}</h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{t.features.f1_desc}</p>
              <ul className="space-y-3 pt-4">
                {['Okos hibakód elemzés', 'Gyors megoldási javaslatok', 'Többnyelvű támogatás'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-medium text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Feature 2 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} className="order-1 space-y-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{t.features.f2_title}</h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{t.features.f2_desc}</p>
              <Link href="/login?mode=signup" className="inline-flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors">
                Tudj meg többet <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} className="order-2 relative h-[400px] rounded-[2rem] bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 mix-blend-overlay"></div>
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute w-64 h-64 bg-emerald-500/20 rounded-full blur-[60px]"></motion.div>
              <div className="relative z-10 w-24 h-24 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl flex items-center justify-center border border-slate-200 dark:border-slate-800">
                <ShieldCheck className="w-12 h-12 text-emerald-500" />
              </div>
            </motion.div>
          </div>

          {/* Feature 3 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} className="order-2 lg:order-1 relative h-[400px] rounded-[2rem] bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/10 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 mix-blend-overlay"></div>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute w-64 h-64 bg-amber-500/20 rounded-full blur-[60px]"></motion.div>
              <div className="relative z-10 w-24 h-24 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl flex items-center justify-center border border-slate-200 dark:border-slate-800">
                <BarChart3 className="w-12 h-12 text-amber-500" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} className="order-1 lg:order-2 space-y-6">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{t.features.f3_title}</h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{t.features.f3_desc}</p>
            </motion.div>
          </div>

        </section>

        {/* --- SCROLLING MARQUEE TESTIMONIALS --- */}
        <section id="testimonials" className="py-32 overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-16 px-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{t.testimonials.title}</h2>
          </div>
          
          <div className="relative flex overflow-x-hidden group">
            {/* Gradient masks for smooth edges */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-[#0A0A0B] to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-[#0A0A0B] to-transparent z-10"></div>

            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
              className="flex gap-6 px-3"
            >
              {[...Array(2)].map((_, arrayIdx) => (
                <div key={arrayIdx} className="flex gap-6">
                  {/* Reviews Data */}
                  {[
                    { name: 'Kovács Péter', text: 'Végre egy átlátható felület, ahol minden kiadást egy helyen vezethetek. Az AI szerelő nagyon profi!' },
                    { name: 'Tóth Anita', text: 'Használtautó vásárlás után egyből ide töltöttem fel mindent. A szervizkönyv funkció hiánypótló a piacon.' },
                    { name: 'Nagy Gábor', text: 'A flottakezelés sosem volt még ilyen egyszerű. Pontosan látom melyik autónak mikor jár le a vizsgája.' },
                    { name: 'Szabó László', text: 'Nagyon szép és gyors az oldal. Örülök, hogy megtaláltam ezt a rendszert, mindenkinek ajánlom.' }
                  ].map((review, idx) => (
                    <div key={`${arrayIdx}-${idx}`} className="w-[350px] shrink-0 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col justify-between">
                      <div className="flex gap-1 mb-6">
                         {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium mb-8 leading-relaxed">&quot;{review.text}&quot;</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                          {review.name.charAt(0)}
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white">{review.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-16 px-4 bg-white dark:bg-[#0A0A0B] relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2 lg:col-span-2 space-y-6">
              <Link href="/" className="inline-block font-black text-2xl tracking-tight text-slate-900 dark:text-white">
                Dynamic<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">Sense</span>
              </Link>
              <p className="text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
                {t.footer.desc}
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white">{t.footer.links}</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#features" className="hover:text-indigo-500 transition-colors">{t.nav.features}</a></li>
                <li><a href="#testimonials" className="hover:text-indigo-500 transition-colors">{t.nav.testimonials}</a></li>
                <li><a href="#pricing" className="hover:text-indigo-500 transition-colors">{t.nav.pricing}</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="/privacy" className="hover:text-indigo-500 transition-colors">{t.footer.privacy}</Link></li>
                <li><Link href="/terms" className="hover:text-indigo-500 transition-colors">{t.footer.terms}</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} DynamicSense. {t.footer.rights}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}