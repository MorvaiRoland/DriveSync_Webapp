'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { motion, Variants, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  ArrowRight, Search, ShieldCheck, BarChart3, Cpu,
  Menu, X, Sun, Moon, Zap, Star, Globe, CheckCircle2, ChevronRight, Activity, CarFront
} from 'lucide-react';

// ==========================================
// TRANSLATIONS DICTIONARY
// ==========================================
const translations = {
  hu: {
    nav: { features: "Funkciók", testimonials: "Vélemények", pricing: "Árazás", login: "Bejelentkezés", startFree: "Kezdés ingyen" },
    hero: { badge: "INTELLIGENS DIGITÁLIS GARÁZS", title1: "A jövő garázsa", title2: "a te kezedben", desc: "Minden adat, szervizmúlt és AI szerelő asszisztens egyetlen lélegzetelállító platformon. Kereskedőknek és magánszemélyeknek.", ctaPrimary: "Kezdj el most ingyen", ctaSecondary: "Alvázszám kereső", users: "Boldog felhasználó csatlakozott" },
    features: { title: "Minden, amire az autódnak szüksége van.", f1_title: "AI Szerelő Asszisztens", f1_desc: "Készíts egy fotót a műszerfal hibakódjáról, és a mesterséges intelligencia azonnal elemzi a problémát, valamint megoldási javaslatokat ad valós időben.", f2_title: "Hiteles Szervizkönyv", f2_desc: "Rögzíts minden beavatkozást, csatolj számlákat és fotókat. Egy megbízható, felhő alapú digitális szervizkönyv, ami növeli az autód értékét eladáskor.", f3_title: "Precíziós Költségkövetés", f3_desc: "Tankolások, biztosítások, súlyadók egy helyen. Lásd másodpercre pontosan, mennyibe kerül a flottád vagy autód fenntartása havonta, vizuális grafikonokkal." },
    testimonials: { title: "Mit mondanak a felhasználóink?" },
    footer: { desc: "A legfejlettebb digitális garázs platform autótulajdonosok és flottakezelők számára.", links: "Linkek", legal: "Jogi", privacy: "Adatvédelem", terms: "ÁSZF", rights: "Minden jog fenntartva." },
    reviews: [
      { name: 'Kovács Péter', text: 'Végre egy átlátható felület, ahol minden kiadást egy helyen vezethetek. Az AI szerelő nagyon profi!' },
      { name: 'Tóth Anita', text: 'Használtautó vásárlás után egyből ide töltöttem fel mindent. A szervizkönyv funkció hiánypótló a piacon.' },
      { name: 'Nagy Gábor', text: 'A flottakezelés sosem volt még ilyen egyszerű. Pontosan látom melyik autónak mikor jár le a vizsgája.' },
      { name: 'Szabó László', text: 'Nagyon szép és gyors az oldal. Örülök, hogy megtaláltam ezt a rendszert, mindenkinek ajánlom.' },
      { name: 'Horváth Eszter', text: 'Már nem felejtem el az olajcserét, mert a rendszer automatikusan szól. Imádom!' },
      { name: 'Varga Bálint', text: 'Autószerelőként is lenyűgözőnek találom az AI diagnosztikát. Sok időt spórol meg nekem.' },
      { name: 'Farkas Dóra', text: 'A férjem autóját és az enyémet is egy helyen tudjuk kezelni. A grafikonok nagyon látványosak.' },
      { name: 'Kiss Zoltán', text: 'Tökéletes eszköz a kiadások kontrollálásához. Látom, hogy mennyit eszik az autó valójában.' }
    ]
  },
  en: {
    nav: { features: "Features", testimonials: "Reviews", pricing: "Pricing", login: "Log in", startFree: "Start for free" },
    hero: { badge: "INTELLIGENT DIGITAL GARAGE", title1: "The future garage", title2: "in your hands", desc: "All data, service history, and an AI mechanic assistant on a single breathtaking platform. For dealers and individuals.", ctaPrimary: "Start for free now", ctaSecondary: "VIN Search", users: "Happy users joined" },
    features: { title: "Everything your car needs.", f1_title: "AI Mechanic Assistant", f1_desc: "Take a photo of the dashboard error code, and our AI instantly analyzes the problem and provides real-time solution suggestions.", f2_title: "Verified Service History", f2_desc: "Log every maintenance, attach invoices and photos. A reliable cloud-based digital service book that increases your car's resale value.", f3_title: "Precision Cost Tracking", f3_desc: "Refueling, insurance, taxes in one place. See exactly how much it costs to maintain your fleet or car monthly with visual charts." },
    testimonials: { title: "What our users say." },
    footer: { desc: "The most advanced digital garage platform for car owners and fleet managers.", links: "Links", legal: "Legal", privacy: "Privacy Policy", terms: "Terms of Service", rights: "All rights reserved." },
    reviews: [
      { name: 'Peter Kovacs', text: 'Finally a transparent interface where I can track all expenses in one place. The AI mechanic is very professional!' },
      { name: 'Anita Toth', text: 'After buying a used car, I uploaded everything here immediately. The service book feature is a gap-filler in the market.' },
      { name: 'Gabor Nagy', text: 'Fleet management has never been this easy. I see exactly when each car\'s inspection expires.' },
      { name: 'Laszlo Szabo', text: 'Very beautiful and fast site. I am glad I found this system, I recommend it to everyone.' },
      { name: 'Esther Horvath', text: 'I no longer forget oil changes because the system notifies me automatically. I love it!' },
      { name: 'Balint Varga', text: 'Even as a car mechanic, I find the AI diagnostics impressive. It saves me a lot of time.' },
      { name: 'Dora Farkas', text: 'We can manage both my husband\'s and my car in one place. The charts are very spectacular.' },
      { name: 'Zoltan Kiss', text: 'Perfect tool for controlling expenses. I can see how much the car actually consumes.' }
    ]
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
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
  if (!mounted) return <div className="w-10 h-10 rounded-full bg-slate-200/50 dark:bg-slate-800/50 animate-pulse"></div>;

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/50 dark:bg-black/50 border border-white/40 dark:border-white/10 backdrop-blur-md shadow-sm hover:scale-105 transition-all cursor-pointer"
      aria-label="Toggle Theme"
    >
      <Sun className={`absolute w-5 h-5 transition-all duration-500 ${isDark ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0 text-slate-700'}`} />
      <Moon className={`absolute w-5 h-5 transition-all duration-500 ${isDark ? 'opacity-100 scale-100 rotate-0 text-white' : 'opacity-0 scale-50 -rotate-90'}`} />
    </button>
  );
};

const LanguageToggle = ({ lang, setLang }: { lang: Lang, setLang: (l: Lang) => void }) => {
  return (
    <button
      onClick={() => setLang(lang === 'hu' ? 'en' : 'hu')}
      className="flex items-center gap-2 px-3 h-10 rounded-full bg-white/50 dark:bg-black/50 border border-white/40 dark:border-white/10 backdrop-blur-md shadow-sm hover:scale-105 transition-all text-sm font-semibold text-slate-700 dark:text-white"
    >
      <Globe className="w-4 h-4 opacity-70" />
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

  // Progress Bar hooks
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
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
    <div className="min-h-screen w-full max-w-[100vw] bg-[#F5F5F7] dark:bg-[#000000] selection:bg-indigo-500/30 font-sans overflow-x-hidden transition-colors duration-700">
      
      {/* --- SCROLL PROGRESS BAR --- */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* --- APPLE GLASS BACKGROUND AURORA --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[min(400px,80vw)] md:w-[800px] h-[min(400px,80vw)] md:h-[800px] bg-indigo-400/20 dark:bg-indigo-600/20 blur-[80px] md:blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[min(400px,80vw)] md:w-[800px] h-[min(400px,80vw)] md:h-[800px] bg-purple-400/20 dark:bg-purple-600/20 blur-[80px] md:blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-[30%] left-[10%] w-[min(300px,70vw)] md:w-[600px] h-[min(300px,70vw)] md:h-[600px] bg-cyan-300/20 dark:bg-cyan-600/20 blur-[80px] md:blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] dark:opacity-[0.06] mix-blend-overlay"></div>
      </div>

      {/* --- VISIONOS NAVBAR --- */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50 px-4"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <div className={`max-w-5xl mx-auto h-16 flex items-center justify-between px-6 rounded-full transition-all duration-500 ${scrolled ? 'bg-white/60 dark:bg-black/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(255,255,255,0.02)]' : 'bg-transparent'}`}>
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/DynamicSense-logo.png" alt="DynamicSense Logo" width={200} height={50} className="h-8 w-auto object-contain group-hover:scale-105 transition-transform" priority />
            <span className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white">Dynamic<span className="text-slate-500 dark:text-slate-400">Sense</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
              <a href="#features" className="hover:text-black dark:hover:text-white transition-colors">{t.nav.features}</a>
              <a href="#testimonials" className="hover:text-black dark:hover:text-white transition-colors">{t.nav.testimonials}</a>
            </div>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
            <div className="flex items-center gap-3">
              <LanguageToggle lang={lang} setLang={setLang} />
              <ThemeToggle />
              <Link href="/login" className="hidden lg:flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors ml-2">
                {t.nav.login}
              </Link>
              <Link href="/login?mode=signup" className="px-5 py-2 rounded-full bg-black/90 dark:bg-white/90 text-white dark:text-black text-sm font-medium hover:scale-105 transition-transform shadow-lg backdrop-blur-md">
                {t.nav.startFree}
              </Link>
            </div>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-800 dark:text-white">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -20 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -20 }}
              className="md:hidden mt-4 mx-auto max-w-5xl overflow-hidden bg-white/70 dark:bg-black/70 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-3xl shadow-2xl"
            >
              <div className="p-6 flex flex-col gap-4">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-2xl hover:bg-white/50 dark:hover:bg-white/10 font-medium text-slate-800 dark:text-slate-200">{t.nav.features}</a>
                <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-2xl hover:bg-white/50 dark:hover:bg-white/10 font-medium text-slate-800 dark:text-slate-200">{t.nav.testimonials}</a>
                <div className="h-px bg-slate-200 dark:bg-slate-800 w-full my-2"></div>
                <div className="flex justify-between items-center px-3">
                  <LanguageToggle lang={lang} setLang={setLang} />
                  <ThemeToggle />
                </div>
                <Link href="/login" className="w-full p-4 mt-2 text-center rounded-2xl font-medium bg-white/50 dark:bg-white/10 text-slate-900 dark:text-white border border-white/40 dark:border-white/5">
                  {t.nav.login}
                </Link>
                <Link href="/login?mode=signup" className="w-full p-4 text-center rounded-2xl font-medium bg-black dark:bg-white text-white dark:text-black">
                  {t.nav.startFree}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <main className="relative z-10 w-full overflow-x-hidden" style={{ paddingTop: 'calc(max(1rem, env(safe-area-inset-top)) + 5rem)' }}>
        {/* --- APPLE GLASS HERO --- */}
        <section className="max-w-6xl mx-auto px-4 flex flex-col items-center text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6 md:space-y-8 flex flex-col items-center w-full">
            
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 text-slate-800 dark:text-slate-300 text-xs font-semibold tracking-widest backdrop-blur-md shadow-sm uppercase">
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              {t.hero.badge}
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-7xl lg:text-[6.5rem] font-semibold tracking-tighter leading-[1.05] max-w-5xl px-2">
              <span className="text-slate-900 dark:text-white block">{t.hero.title1}</span>
              <span className="text-slate-500 dark:text-slate-400 block pb-2">
                {t.hero.title2}
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed font-medium tracking-tight px-2">
              {t.hero.desc}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-6 px-4">
              <div className="relative group w-full sm:w-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-70 transition duration-500"></div>
                <Link href="/login?mode=signup" className="relative px-8 py-4 w-full sm:w-auto bg-black/90 dark:bg-white/90 text-white dark:text-black font-medium rounded-full overflow-hidden shadow-2xl hover:scale-[1.02] transition-all duration-300 flex justify-center items-center gap-2 backdrop-blur-xl">
                  {t.hero.ctaPrimary} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <Link href="/check" className="px-8 py-4 bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-white/60 dark:border-white/10 text-slate-900 dark:text-white font-medium rounded-full hover:bg-white/60 dark:hover:bg-white/10 hover:scale-[1.02] transition-all flex justify-center items-center gap-2 w-full sm:w-auto shadow-sm group">
                <Search className="w-5 h-5 opacity-50 group-hover:text-indigo-500 group-hover:opacity-100 transition-colors" />
                {t.hero.ctaSecondary}
              </Link>
            </motion.div>
          </motion.div>

          {/* VisionOS Glass Mockup - Responsive */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full mt-12 md:mt-20 px-0"
          >
            <div className="relative rounded-[2rem] md:rounded-[2.5rem] bg-white/30 dark:bg-white/5 border border-white/50 dark:border-white/10 p-2 md:p-4 shadow-2xl backdrop-blur-3xl overflow-hidden">
              {/* Mac-style header */}
              <div className="flex items-center gap-2 px-4 py-3 md:py-4 border-b border-white/20 dark:border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-400/70"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400/70"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400/70"></div>
              </div>
              {/* App content grid */}
              <div className="p-4 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {/* Stat cards */}
                {[
                  { color: 'bg-indigo-500/10', icon: <Cpu className="w-5 h-5 text-indigo-500" />, label: 'AI Diagnózis' },
                  { color: 'bg-emerald-500/10', icon: <Activity className="w-5 h-5 text-emerald-500" />, label: 'Szerviz' },
                  { color: 'bg-amber-500/10', icon: <BarChart3 className="w-5 h-5 text-amber-500" />, label: 'Költségek' },
                  { color: 'bg-cyan-500/10', icon: <CarFront className="w-5 h-5 text-cyan-500" />, label: 'Flotta' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className={`rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col gap-3 md:gap-4 ${item.color} border border-white/40 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-md shadow-sm`}
                  >
                    <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-white/70 dark:bg-black/30 flex items-center justify-center shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">{item.label}</div>
                      <div className="h-2.5 w-2/3 bg-black/5 dark:bg-white/10 rounded-full"></div>
                    </div>
                  </motion.div>
                ))}
                {/* Wide chart card */}
                <div className="col-span-2 md:col-span-4 rounded-2xl md:rounded-3xl p-4 md:p-6 bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/5 backdrop-blur-md shadow-sm">
                  <div className="h-3 w-1/4 bg-black/5 dark:bg-white/10 rounded-full mb-4"></div>
                  <div className="flex items-end gap-2 h-16 md:h-24">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.8 + i * 0.05, duration: 0.4 }}
                        style={{ height: `${h}%` }}
                        className="flex-1 rounded-t-lg bg-gradient-to-t from-indigo-500/30 to-indigo-500/60 dark:from-indigo-400/20 dark:to-indigo-400/50 origin-bottom"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* --- GLASS FEATURES SECTION --- */}
        <section id="features" className="max-w-6xl mx-auto py-16 md:py-32 space-y-16 md:space-y-32 px-4">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-20">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-slate-900 dark:text-white tracking-tighter">{t.features.title}</h2>
          </div>

          {/* Feature 1 */}
          <div className="grid lg:grid-cols-2 gap-8 md:gap-20 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8 }} className="order-1 lg:order-1 relative w-full aspect-video lg:aspect-square rounded-[2rem] lg:rounded-[3rem] bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-3xl shadow-2xl flex items-center justify-center overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent group-hover:opacity-70 transition-opacity"></div>
              <div className="relative z-10 w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-[1.5rem] lg:rounded-3xl bg-white/80 dark:bg-black/50 shadow-xl flex items-center justify-center border border-white/50 dark:border-white/10 backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
                <Cpu className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-indigo-500" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, delay: 0.1 }} className="order-2 lg:order-2 space-y-4 md:space-y-6">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">{t.features.f1_title}</h3>
              <p className="text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed tracking-tight">{t.features.f1_desc}</p>
            </motion.div>
          </div>

          {/* Feature 2 */}
          <div className="grid lg:grid-cols-2 gap-8 md:gap-20 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, delay: 0.1 }} className="order-2 lg:order-1 space-y-4 md:space-y-6">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">{t.features.f2_title}</h3>
              <p className="text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed tracking-tight">{t.features.f2_desc}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8 }} className="order-1 lg:order-2 relative w-full aspect-video lg:aspect-square rounded-[2rem] lg:rounded-[3rem] bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-3xl shadow-2xl flex items-center justify-center overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent group-hover:opacity-70 transition-opacity"></div>
              <div className="relative z-10 w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-[1.5rem] lg:rounded-3xl bg-white/80 dark:bg-black/50 shadow-xl flex items-center justify-center border border-white/50 dark:border-white/10 backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-emerald-500" />
              </div>
            </motion.div>
          </div>

          {/* Feature 3 */}
          <div className="grid lg:grid-cols-2 gap-8 md:gap-20 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8 }} className="order-1 lg:order-1 relative w-full aspect-video lg:aspect-square rounded-[2rem] lg:rounded-[3rem] bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-3xl shadow-2xl flex items-center justify-center overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent group-hover:opacity-70 transition-opacity"></div>
              <div className="relative z-10 w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-[1.5rem] lg:rounded-3xl bg-white/80 dark:bg-black/50 shadow-xl flex items-center justify-center border border-white/50 dark:border-white/10 backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
                <BarChart3 className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-amber-500" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, delay: 0.1 }} className="order-2 lg:order-2 space-y-4 md:space-y-6">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">{t.features.f3_title}</h3>
              <p className="text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed tracking-tight">{t.features.f3_desc}</p>
            </motion.div>
          </div>
        </section>

        {/* --- GLASS MARQUEE TESTIMONIALS --- */}
        <section id="testimonials" className="py-16 md:py-32 overflow-hidden w-full">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20 px-4">
            <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 dark:text-white tracking-tighter">{t.testimonials.title}</h2>
          </div>
          
          <div className="relative overflow-hidden group w-full">
            <div className="absolute inset-y-0 left-0 w-20 md:w-40 bg-gradient-to-r from-[#F5F5F7] dark:from-[#000000] to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-20 md:w-40 bg-gradient-to-l from-[#F5F5F7] dark:from-[#000000] to-transparent z-10"></div>

            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
              className="flex gap-4 md:gap-8 px-2 md:px-4"
            >
              {[...Array(2)].map((_, arrayIdx) => (
                <div key={arrayIdx} className="flex gap-4 md:gap-8">
                  {t.reviews.map((review, idx) => (
                    <div key={`${arrayIdx}-${idx}`} className="w-[300px] sm:w-[350px] md:w-[400px] shrink-0 bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-2xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300">
                      <div className="flex gap-1.5 mb-6 md:mb-8">
                         {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-slate-800 text-slate-800 dark:fill-white dark:text-white opacity-80" />)}
                      </div>
                      <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-300 font-medium mb-8 md:mb-10 leading-relaxed tracking-tight">&quot;{review.text}&quot;</p>
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center font-semibold text-slate-900 dark:text-white text-sm md:text-base">
                          {review.name.charAt(0)}
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-white tracking-tight text-sm md:text-base">{review.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      {/* --- GLASS FOOTER --- */}
      <footer className="border-t border-slate-200/50 dark:border-white/10 py-16 md:py-20 px-4 bg-transparent relative z-10 backdrop-blur-3xl">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16 md:mb-20">
            <div className="col-span-1 sm:col-span-2 lg:col-span-2 space-y-6">
              <Link href="/" className="inline-block">
                <Image src="/DynamicSense-logo.png" alt="DynamicSense Logo" width={200} height={50} className="h-8 w-auto object-contain" />
              </Link>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed tracking-tight font-medium text-sm md:text-base">
                {t.footer.desc}
              </p>
            </div>
            
            <div className="space-y-4 md:space-y-6">
              <h4 className="font-semibold text-slate-900 dark:text-white tracking-tight">{t.footer.links}</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                <li><a href="#features" className="hover:text-black dark:hover:text-white transition-colors">{t.nav.features}</a></li>
                <li><a href="#testimonials" className="hover:text-black dark:hover:text-white transition-colors">{t.nav.testimonials}</a></li>
                <li><a href="#pricing" className="hover:text-black dark:hover:text-white transition-colors">{t.nav.pricing}</a></li>
              </ul>
            </div>

            <div className="space-y-4 md:space-y-6">
              <h4 className="font-semibold text-slate-900 dark:text-white tracking-tight">{t.footer.legal}</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                <li><Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">{t.footer.privacy}</Link></li>
                <li><Link href="/terms" className="hover:text-black dark:hover:text-white transition-colors">{t.footer.terms}</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-200/50 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm font-medium text-slate-400">
            <p>&copy; {new Date().getFullYear()} DynamicSense. {t.footer.rights}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}