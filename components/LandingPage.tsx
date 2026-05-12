'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, Search, ShieldCheck, BarChart3, Cpu,
  MessageCircle, HelpCircle, Facebook, Instagram,
  Menu, X, CheckCircle2, ChevronRight, Sun, Moon,
  Zap, Smartphone, Cloud, Users, Star, TrendingUp
} from 'lucide-react';

// --- OPTIMIZED COMPONENTS ---

const TikTokIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

// --- FAST THEME TOGGLE ---
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
      className={`relative flex items-center justify-between w-14 h-8 rounded-full p-1 transition-colors duration-300 cursor-pointer ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-200 border border-slate-300'}`}
      aria-label="Téma váltás"
    >
      <Sun size={14} className={`z-10 ml-1 transition-colors duration-300 ${isDark ? 'text-slate-500' : 'text-amber-500'}`} />
      <Moon size={14} className={`z-10 mr-1 transition-colors duration-300 ${isDark ? 'text-indigo-400' : 'text-slate-400'}`} />

      <div className={`absolute w-6 h-6 rounded-full shadow-md z-0 transition-transform duration-300 ${isDark ? 'translate-x-6 bg-slate-900' : 'translate-x-0 bg-white'}`} />
    </button>
  );
};

// --- OPTIMIZED BACKGROUND ---
const BackgroundGlows = () => (
  <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none -z-10">
    <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white to-transparent dark:from-slate-900 dark:to-transparent opacity-60" />
    <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-indigo-500/5 rounded-full blur-[100px]" />
    <div className="absolute bottom-[20%] left-[-10%] w-[50vw] h-[50vw] bg-amber-500/5 rounded-full blur-[120px]" />
  </div>
);

// --- MODERN HERO SECTION ---
const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12 px-4">
    <div className="max-w-6xl mx-auto text-center space-y-8">

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-semibold">
        <Zap className="w-4 h-4" />
        <span>2026-os AI Technológia</span>
      </div>

      {/* Main Headline */}
      <div className="space-y-6">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1]">
          <span className="bg-gradient-to-r from-slate-900 via-indigo-600 to-purple-600 dark:from-white dark:via-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Intelligens Garázs
          </span>
          <br />
          <span className="text-slate-600 dark:text-slate-300 font-light text-3xl sm:text-4xl lg:text-5xl">
            Minden autódat egy helyen
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          AI-powered szerelő, valós idejű monitoring és közösségi platform. Az autókezelés jövője már itt van.
          <span className="block mt-2 font-semibold text-slate-900 dark:text-white">
            Vedd át az irányítást az autód felett.
          </span>
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
        <Link href="/login?mode=signup" className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <span className="relative flex items-center justify-center gap-2">
            Kezdj el most ingyen <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
        <Link href="/check" className="px-8 py-4 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-300 flex items-center justify-center gap-2">
          <Search className="w-5 h-5" />
          Alvázszám kereső
        </Link>
      </div>

      {/* Trust Indicators */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span>Nincs bankkártya szükséges</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span>Azonnali hozzáférés</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span>99.9% uptime</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-8 pt-16 border-t border-slate-200 dark:border-slate-800 max-w-2xl mx-auto">
        <div className="space-y-2">
          <p className="text-3xl sm:text-4xl font-black text-indigo-600">10K+</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Aktív felhasználó</p>
        </div>
        <div className="space-y-2">
          <p className="text-3xl sm:text-4xl font-black text-purple-600">500M+</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">km nyomon követve</p>
        </div>
        <div className="space-y-2">
          <p className="text-3xl sm:text-4xl font-black text-cyan-600">4.9★</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Felhasználói értékelés</p>
        </div>
      </div>
    </div>
  </section>
);

// --- FEATURES SECTION ---
const FeaturesSection = () => (
  <section id="features" className="relative py-24 px-4 bg-slate-50 dark:bg-slate-950/50">
    <div className="max-w-6xl mx-auto space-y-16">

      {/* Section Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-bold">Funkciók</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
          Amit valóban <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">szükségel</span>
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Minden egy helyen: nyomon követés, AI segítség és közösségi megoldások
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            icon: Cpu,
            title: "AI Szerelő",
            desc: "Diagnosztika és tanácsadás mesterséges intelligenciával. Fotózd le a hibakódot vagy írd le a problémát.",
            color: "indigo"
          },
          {
            icon: ShieldCheck,
            title: "Digitális Szervizkönyv",
            desc: "Hiteles szervizmúlt, ami pénzt ér eladáskor. Minden beavatkozás egy helyen, kereshetően.",
            color: "emerald"
          },
          {
            icon: BarChart3,
            title: "Költségkövetés",
            desc: "Tankolások, szervizek, biztosítás. Lásd vizuálisan, mennyibe kerül valójában az autód.",
            color: "amber"
          },
          {
            icon: Smartphone,
            title: "Mobil App",
            desc: "iOS és Android - valós idejű szinkronizáció. Minden adat mindig kéznél.",
            color: "purple"
          },
          {
            icon: Cloud,
            title: "Felhő Szinkronizálás",
            desc: "Automatikus biztonsági másolat és eszközök közötti szinkro. Soha ne veszítsd el az adataidat.",
            color: "cyan"
          },
          {
            icon: Users,
            title: "Közösség",
            desc: "Ossz meg tippeket, tapasztalatokat és segíts másoknak. Csatlakozz Magyarország legnagyobb autós közösségéhez.",
            color: "rose"
          }
        ].map((feature, idx) => (
          <div key={idx} className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all duration-300 hover:shadow-lg">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${feature.color}-500/20 to-${feature.color}-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <feature.icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{feature.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// --- TESTIMONIALS SECTION ---
const TestimonialsSection = () => (
  <section className="relative py-24 px-4">
    <div className="max-w-6xl mx-auto space-y-12">

      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
          <Star className="w-4 h-4" />
          <span className="text-sm font-bold">Vélemények</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
          Amit mondanak az <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">felhasználók</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            name: "Péter H.",
            role: "Autókereskedő",
            text: "A DynamicSense teljesen megváltoztatta, hogyan kezelem az autóim. Az AI szerelő hihetetlen!",
            rating: 5
          },
          {
            name: "Anna K.",
            role: "Autórajongó",
            text: "Végre egy app, amely igazi értéket ad. A közösségi funkciók a kedvencem!",
            rating: 5
          },
          {
            name: "Márton B.",
            role: "Flottavezető",
            text: "Az analitika és a valós idejű nyomon követés nélkülözhetetlen lett nálunk.",
            rating: 5
          }
        ].map((testimonial, idx) => (
          <div key={idx} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4">
            <div className="flex gap-1">
              {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />)}
            </div>
            <p className="text-slate-700 dark:text-slate-300 italic">"{testimonial.text}"</p>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-900 dark:text-white">{testimonial.name}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{testimonial.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// --- CTA SECTION ---
const CTASection = () => (
  <section className="relative py-24 px-4 bg-gradient-to-r from-indigo-600 to-purple-600">
    <div className="max-w-4xl mx-auto text-center space-y-8 text-white">
      <div className="space-y-4">
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
          Kész vagy a változásra?
        </h2>
        <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
          Csatlakozz több ezer felhasználóhoz, akik már átvették az irányítást az autójuk felett.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/login?mode=signup" className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors duration-300 shadow-xl">
          Ingyenes regisztráció
        </Link>
        <Link href="/pricing" className="px-8 py-4 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-colors duration-300">
          Csomagok megtekintése
        </Link>
      </div>

      <div className="flex items-center justify-center gap-8 pt-8 text-sm text-indigo-200">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>30 napos pénz-visszafizetés</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>24/7 támogatás</span>
        </div>
      </div>
    </div>
  </section>
);

// --- FOOTER ---
const FooterSection = () => (
  <footer className="border-t border-slate-200 dark:border-slate-800 py-12 px-4 bg-white dark:bg-slate-950">
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-4 gap-8 mb-12">

        <div>
          <p className="font-black text-lg mb-4">Dynamic<span className="text-amber-500">Sense</span></p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Az autókezelés jövője, ma már elérhető.
          </p>
          <div className="flex gap-4">
            <a href="mailto:info.dynamicsense@gmail.com" className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
            <Link href="/support" className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div>
          <p className="font-bold mb-4">Termék</p>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><a href="#features" className="hover:text-indigo-600 transition-colors">Funkciók</a></li>
            <li><Link href="/pricing" className="hover:text-indigo-600 transition-colors">Csomagok</Link></li>
            <li><Link href="/changelog" className="hover:text-indigo-600 transition-colors">Újdonságok</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-bold mb-4">Cég</p>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><Link href="/about" className="hover:text-indigo-600 transition-colors">Rólunk</Link></li>
            <li><Link href="/blog" className="hover:text-indigo-600 transition-colors">Blog</Link></li>
            <li><Link href="/careers" className="hover:text-indigo-600 transition-colors">Karrier</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-bold mb-4">Jogi</p>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><Link href="/privacy-policy" className="hover:text-indigo-600 transition-colors">Adatvédelem</Link></li>
            <li><Link href="/terms" className="hover:text-indigo-600 transition-colors">Feltételek</Link></li>
            <li><Link href="/support" className="hover:text-indigo-600 transition-colors">Támogatás</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex justify-between items-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">© 2026 DynamicSense. Minden jog fenntartva.</p>
        <div className="flex items-center gap-4">
          <a href="https://facebook.com" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="https://instagram.com" className="text-slate-600 dark:text-slate-400 hover:text-pink-600 transition-colors">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="https://tiktok.com" className="text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors">
            <TikTokIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  </footer>
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

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('features');
    if (element) {
      const yOffset = -120;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <BackgroundGlows />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b pt-[env(safe-area-inset-top)] ${scrolled || mobileMenuOpen ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-slate-200 dark:border-white/5 shadow-lg' : 'bg-transparent border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" onClick={scrollToTop} className="flex items-center gap-2 font-black text-lg">
            <span>Dynamic<span className="text-amber-500">Sense</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle />
            <a href="#features" onClick={scrollToFeatures} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Funkciók</a>
            <Link href="/check" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Alvázszám kereső</Link>
            <Link href="/login" className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">Belépés</Link>
            <Link href="/login?mode=signup" className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:shadow-lg transition-all">
              Regisztráció
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-slate-950/95 border-t border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="px-4 py-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Megjelenés</span>
                <ThemeToggle />
              </div>
              <a href="#features" onClick={scrollToFeatures} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <Zap className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">Funkciók</span>
              </a>
              <Link href="/check" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <Search className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">Alvázszám kereső</span>
              </Link>
              <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-2"></div>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block p-3 font-semibold text-center hover:text-indigo-600 transition-colors">Belépés</Link>
              <Link href="/login?mode=signup" onClick={() => setMobileMenuOpen(false)} className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-xl text-center shadow-lg">
                Fiók létrehozása
              </Link>
            </div>
          </div>
        )}
      </nav>

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