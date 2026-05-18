'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { motion, Variants } from 'framer-motion';
import {
  ArrowRight, Search, ShieldCheck, BarChart3, Cpu,
  MessageCircle, HelpCircle, Facebook, Instagram,
  Menu, X, CheckCircle2, Sun, Moon,
  Zap, Cloud, Star,
  CarFront
} from 'lucide-react';

// --- OPTIMIZED COMPONENTS ---

const TikTokIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

// --- FAST THEME TOGGLE (next-themes) ---
const ThemeToggle = () => {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-14 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"></div>;
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative flex items-center justify-between w-14 h-8 rounded-full p-1 transition-all duration-500 cursor-pointer shadow-inner ${isDark ? 'bg-slate-800 border border-slate-700/50 hover:border-slate-600' : 'bg-slate-200 border border-slate-300/50 hover:border-slate-400'}`}
      aria-label="Téma váltás"
    >
      <Sun size={14} className={`z-10 ml-1 transition-colors duration-500 ${isDark ? 'text-slate-500' : 'text-amber-500 drop-shadow-sm'}`} />
      <Moon size={14} className={`z-10 mr-1 transition-colors duration-500 ${isDark ? 'text-indigo-400 drop-shadow-sm' : 'text-slate-400'}`} />

      <div className={`absolute w-6 h-6 rounded-full shadow-md z-0 transition-transform duration-500 ease-spring ${isDark ? 'translate-x-6 bg-slate-900 border border-slate-800' : 'translate-x-0 bg-white border border-slate-100'}`} />
    </button>
  );
};

// --- ANIMATION VARIANTS ---
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// --- OPTIMIZED BACKGROUND ---
const BackgroundGlows = () => (
  <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
    <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-slate-100 to-transparent dark:from-slate-900/80 dark:to-transparent opacity-80" />
    <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
    <div className="absolute bottom-[20%] left-[-10%] w-[50vw] h-[50vw] bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay"></div>
  </div>
);

// --- MODERN HERO SECTION ---
const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center pt-28 pb-12 px-4 overflow-hidden">
    <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">

      {/* Left Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-8 text-center lg:text-left z-10"
      >
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-bold tracking-wide backdrop-blur-md">
          <Zap className="w-4 h-4 fill-indigo-600 dark:fill-indigo-400" />
          <span>A jövő garázsmenedzsmentje</span>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-6">
          <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-tighter leading-[1.1]">
            <span className="text-slate-900 dark:text-white">
              Vedd át az <br className="hidden lg:block" /> irányítást a
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
              Flottád felett
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Minden adat, szervizmúlt és AI szerelő asszisztens egyetlen intelligens platformon. Tökéletes magánszemélyeknek és kereskedőknek.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
          <Link href="/login?mode=signup" className="group relative px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1">
            <span className="relative z-10 flex items-center justify-center gap-2">
              Kezdj el most ingyen <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 text-white transition-opacity duration-300">
              Kezdj el most ingyen <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link href="/check" className="group px-8 py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold rounded-2xl hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
            <Search className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            Alvázszám kereső
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} className="flex items-center justify-center lg:justify-start gap-4 pt-6">
          <div className="flex -space-x-3">
            <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-950 bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">P</div>
            <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-950 bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">A</div>
            <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-950 bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">M</div>
            <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-950 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-white shadow-sm">+10k</div>
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Boldog <span className="font-bold text-slate-900 dark:text-white">felhasználó</span> csatlakozott
          </div>
        </motion.div>
      </motion.div>

      {/* Right Content - Abstract App Mockup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="relative z-10 hidden lg:block perspective-1000"
      >
        <div className="relative w-full aspect-square md:aspect-auto md:h-[600px] rounded-[2.5rem] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-white/40 dark:border-slate-700/50 shadow-2xl overflow-hidden transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 shadow-indigo-500/10">
          {/* Mockup Header */}
          <div className="absolute top-0 inset-x-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 flex items-center px-6 gap-4 z-20">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg h-8 flex items-center px-3 opacity-50">
              <Search size={14} className="text-slate-400" />
            </div>
          </div>

          {/* Mockup Body */}
          <div className="absolute inset-0 pt-20 px-6 pb-6 overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-90 mix-blend-overlay pointer-events-none"></div>

          <div className="h-full pt-20 px-6 pb-6 flex flex-col gap-4 relative z-10">
            <div className="flex justify-between items-end mb-2">
              <div>
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-md mb-2"></div>
                <div className="h-8 w-48 bg-slate-300 dark:bg-slate-700 rounded-lg"></div>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-500"><CarFront /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 mb-3"></div>
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded"></div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 mb-3"></div>
                <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded"></div>
              </div>
            </div>

            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col gap-3">
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900"></div>
                  <div className="flex-1">
                    <div className="h-4 w-full bg-slate-100 dark:bg-slate-700 rounded mb-1"></div>
                    <div className="h-3 w-1/2 bg-slate-50 dark:bg-slate-800 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating Element */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -right-6 top-1/3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 dark:border-slate-700 z-30 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg"><Cpu size={20} /></div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">AI Diagnosztika</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">Hiba elemzése...</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);

// --- BENTO GRID FEATURES SECTION ---
const FeaturesSection = () => (
  <section id="features" className="relative py-32 px-4 bg-white dark:bg-slate-950">
    <div className="max-w-7xl mx-auto space-y-16">

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/30">
          <Zap className="w-4 h-4 fill-current" />
          <span className="text-sm font-bold uppercase tracking-wider">Innováció</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          Minden amire <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text">szükséged van</span>
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
          Professzionális eszközök, melyekkel maximalizálhatod autód élettartamát és minimalizálhatod a költségeket.
        </p>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[280px]">

        {/* Big Feature 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="md:col-span-2 lg:col-span-2 row-span-1 md:row-span-2 group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-indigo-500/30 transition-all p-8 flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/20 transition-colors"></div>
          <div className="relative z-10 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Cpu size={28} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">AI Szerelő Asszisztens</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-sm">Készíts egy fotót a műszerfal hibakódjáról, és a mesterséges intelligencia azonnal elemzi a problémát és javaslatokat tesz a megoldásra.</p>
          </div>
          <div className="relative z-10 mt-8 h-40 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm transform group-hover:scale-[1.02] group-hover:-translate-y-2 transition-transform duration-500">
            <div className="flex gap-3 items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center"><Zap size={16} className="text-indigo-600" /></div>
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-2 w-5/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-2 w-4/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </motion.div>

        {/* Small Feature 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
          className="md:col-span-1 lg:col-span-2 group relative overflow-hidden rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 hover:border-emerald-500/30 transition-all p-8 flex flex-col justify-center"
        >
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px]"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hiteles Szervizkönyv</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Rögzíts minden beavatkozást, csatolj számlákat. Növeli az autód értékét eladáskor.</p>
          </div>
        </motion.div>

        {/* Small Feature 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="md:col-span-1 lg:col-span-1 group relative overflow-hidden rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 hover:border-amber-500/30 transition-all p-8"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
            <BarChart3 size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Költségkövetés</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Tankolás, biztosítás, adók. Lásd pontosan mennyibe kerül a fenntartás havonta.</p>
        </motion.div>

        {/* Small Feature 3 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
          className="md:col-span-1 lg:col-span-1 group relative overflow-hidden rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 hover:border-cyan-500/30 transition-all p-8"
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-6 group-hover:-rotate-12 transition-transform">
            <Cloud size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Felhő Szinkron</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Biztonságos háttértár, valós idejű szinkronizáció az összes eszközöd között.</p>
        </motion.div>

      </div>
    </div>
  </section>
);

// --- TESTIMONIALS SECTION ---
const TestimonialsSection = () => {
  const testimonials = [
    { name: "Péter H.", role: "Autókereskedő", text: "A DynamicSense teljesen megváltoztatta, hogyan kezelem az autóim. Az AI szerelő hihetetlenül pontos!", rating: 5 },
    { name: "Anna K.", role: "Autórajongó", text: "Végre egy app, amely letisztult és igazi értéket ad. A költségkövető funkció a kedvencem.", rating: 5 },
    { name: "Márton B.", role: "Flottavezető", text: "Az analitika és a valós idejű nyomon követés nélkülözhetetlen lett a napi munkám során.", rating: 5 }
  ];

  return (
    <section className="relative py-32 px-4 bg-slate-50 dark:bg-slate-950/50 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">

        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/30">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-bold uppercase tracking-wider">Vélemények</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Több ezer <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">elégedett sofőr</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.2 }}
              className="p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md shadow-lg shadow-slate-200/50 dark:shadow-none space-y-6 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="flex gap-1.5">
                {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-sm" />)}
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">&quot;{testimonial.text}&quot;</p>
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/50 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- CTA SECTION ---
const CTASection = () => (
  <section className="relative py-24 px-4">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800"></div>
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px]"></div>

    <div className="relative max-w-4xl mx-auto text-center space-y-10 text-white z-10 py-12">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="space-y-6">
        <h2 className="text-5xl sm:text-6xl font-black tracking-tight drop-shadow-md">
          Kész vagy szintet lépni?
        </h2>
        <p className="text-xl text-indigo-100 max-w-2xl mx-auto font-medium">
          Csatlakozz több ezer felhasználóhoz, akik már élvezik a modern garázsmenedzsment előnyeit. Kezdd el ingyen ma.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/login?mode=signup" className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg flex items-center justify-center gap-2">
          Ingyenes regisztráció <ArrowRight size={20} />
        </Link>
        <Link href="/pricing" className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300 text-lg flex items-center justify-center">
          Csomagok megtekintése
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-indigo-100/80 font-medium">
        <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /><span>Nincs bankkártya szükséges</span></div>
        <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /><span>30 napos pénz-visszafizetés</span></div>
      </motion.div>
    </div>
  </section>
);

// --- FOOTER ---
const FooterSection = () => (
  <footer className="border-t border-slate-200 dark:border-slate-800 py-16 px-4 bg-white dark:bg-slate-950">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">

        <div className="col-span-2 lg:col-span-2 space-y-6">
          <Link href="/" className="inline-block font-black text-2xl tracking-tight text-slate-900 dark:text-white">
            Dynamic<span className="text-amber-500">Sense</span>
          </Link>
          <p className="text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
            Az autókezelés jövője, ma már elérhető. Kövesd nyomon költségeidet, szervizeidet és használd az AI diagnosztikát.
          </p>
          <div className="flex gap-4">
            <a href="mailto:info.dynamicsense@gmail.com" className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all">
              <MessageCircle className="w-5 h-5" />
            </a>
            <Link href="/support" className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all">
              <HelpCircle className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <p className="font-bold text-slate-900 dark:text-white tracking-wide">Termék</p>
          <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
            <li><a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Funkciók</a></li>
            <li><Link href="/pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Csomagok</Link></li>
            <li><Link href="/changelog" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Újdonságok</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <p className="font-bold text-slate-900 dark:text-white tracking-wide">Cég</p>
          <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
            <li><Link href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Rólunk</Link></li>
            <li><Link href="/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Blog</Link></li>
            <li><Link href="/careers" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Karrier</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <p className="font-bold text-slate-900 dark:text-white tracking-wide">Jogi</p>
          <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
            <li><Link href="/privacy-policy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Adatvédelem</Link></li>
            <li><Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Feltételek</Link></li>
            <li><Link href="/support" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Támogatás</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-slate-500 font-medium">© 2026 DynamicSense. Minden jog fenntartva.</p>
        <div className="flex items-center gap-6">
          <a href="https://facebook.com" className="text-slate-400 hover:text-blue-600 transition-colors">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="https://instagram.com" className="text-slate-400 hover:text-pink-600 transition-colors">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="https://tiktok.com" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <TikTokIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  </footer>
);

// --- MAIN COMPONENT ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export default function LandingPage({ promo, updates }: { promo?: any, updates: any[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('features');
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 font-sans">
      <BackgroundGlows />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 pt-[env(safe-area-inset-top)] ${scrolled || mobileMenuOpen ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm' : 'bg-transparent border-transparent'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" onClick={scrollToTop} className="flex items-center gap-2 font-black text-xl tracking-tight">
            <span>Dynamic<span className="text-amber-500">Sense</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" onClick={scrollToFeatures} className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Funkciók</a>
            <Link href="/check" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Alvázszám kereső</Link>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>
            <ThemeToggle />
            <Link href="/login" className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Belépés</Link>
            <Link href="/login?mode=signup" className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:shadow-lg hover:shadow-indigo-500/20 transition-all hover:-translate-y-0.5">
              Regisztráció
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Megjelenés</span>
                <ThemeToggle />
              </div>
              <a href="#features" onClick={scrollToFeatures} className="flex items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors font-semibold">
                <Zap className="w-5 h-5 text-indigo-600" />
                <span>Funkciók</span>
              </a>
              <Link href="/check" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors font-semibold">
                <Search className="w-5 h-5 text-emerald-600" />
                <span>Alvázszám kereső</span>
              </Link>
              <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-4"></div>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block p-4 font-bold text-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors">Belépés</Link>
              <Link href="/login?mode=signup" onClick={() => setMobileMenuOpen(false)} className="block w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl text-center shadow-lg">
                Fiók létrehozása
              </Link>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Main Content */}
      <main>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
        <FooterSection />
      </main>
    </div>
  );
}