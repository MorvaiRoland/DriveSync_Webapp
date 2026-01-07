'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight, Search, ShieldCheck, BarChart3, Cpu, 
  MessageCircle, HelpCircle, Facebook, Instagram,
  Menu, X, CheckCircle2, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- HELPER KOMPONENSEK ---

const TikTokIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const BackgroundGlows = () => (
  <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
    {/* Felső gradiens */}
    <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white to-transparent dark:from-slate-900 dark:to-transparent opacity-60" />
    
    {/* Színes foltok */}
    <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-amber-500/10 rounded-full blur-[100px] animate-pulse" />
    <div className="absolute bottom-[20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px]" />
    <div className="absolute top-[40%] right-[20%] w-[30vw] h-[30vw] bg-emerald-500/5 rounded-full blur-[80px]" />
    
    {/* Zaj textúra a "gritty" hatáshoz */}
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
  </div>
);

export default function LandingPage({ promo, updates }: { promo?: any, updates: any[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-200 selection:bg-amber-500/30 font-sans">
      <BackgroundGlows />

      {/* --- NAVBAR --- */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b 
        ${scrolled || mobileMenuOpen
          ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-slate-200 dark:border-white/5 py-3 shadow-lg' 
          : 'bg-transparent border-transparent py-5'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group z-50 relative">
              <div className="w-9 h-9 relative group-hover:scale-110 transition-transform duration-300">
                <Image src="/DynamicSense-logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight uppercase text-slate-900 dark:text-white">
                Dynamic<span className="text-amber-500">Sense</span>
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/check" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors">
                Alvázszám kereső
              </Link>
              <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-2"></div>
              <Link href="/login" className="text-sm font-bold text-slate-900 dark:text-white hover:text-amber-500 transition-colors">
                Belépés
              </Link>
              <Link 
                href="/login?mode=signup" 
                className="group relative overflow-hidden bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 flex items-center gap-2"
              >
                <span className="relative z-10">Ingyenes Start</span>
                <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 h-full w-full bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out -z-0 mix-blend-multiply dark:mix-blend-screen" />
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-50 relative"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-2xl md:hidden overflow-hidden"
            >
              <div className="px-4 py-6 flex flex-col gap-4">
                <Link href="/check" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600"><Search size={20}/></div>
                  <span className="font-semibold">Alvázszám Kereső</span>
                </Link>
                <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-1"></div>
                <Link href="/login" className="p-3 font-semibold text-center">Belépés</Link>
                <Link href="/login?mode=signup" className="w-full bg-amber-500 text-slate-950 font-bold py-4 rounded-xl text-center shadow-lg shadow-amber-500/20">
                  Fiók létrehozása ingyen
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="relative pt-32 lg:pt-40 pb-20 overflow-hidden">
        
        {/* --- HERO SECTION --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 lg:mb-32">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Ingyenes regisztráció
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] mb-6 tracking-tight"
              >
                Az autód <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">
                  digitális agya.
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light"
              >
                Felejtsd el a kockás füzetet. AI diagnosztika, költségkövetés és hiteles digitális szervizkönyv egyetlen modern alkalmazásban. 
                <span className="block mt-2 font-medium text-slate-900 dark:text-white">Most teljesen ingyenes.</span>
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link 
                  href="/login?mode=signup" 
                  className="px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/10 flex items-center justify-center gap-2"
                >
                  Regisztrálok
                  <ChevronRight size={18} />
                </Link>
                <Link 
                  href="/check" 
                  className="px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Search size={18} />
                  Alvázszám kereső
                </Link>
              </motion.div>

              <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500"/> Nincs bankkártya</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500"/> Azonnali hozzáférés</div>
              </div>
            </div>

            {/* Right Visual (Abstract Dashboard) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex-1 w-full max-w-lg lg:max-w-none relative z-0"
            >
               <div className="relative rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-white/10 p-2 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 ease-out">
                 <div className="absolute inset-0 bg-white/50 dark:bg-black/20 backdrop-blur-3xl rounded-3xl -z-10" />
                 <div className="bg-white dark:bg-slate-950 rounded-[1.25rem] overflow-hidden border border-slate-100 dark:border-white/5 h-[300px] sm:h-[400px] flex flex-col relative">
                    {/* Fake UI Header */}
                    <div className="h-14 border-b border-slate-100 dark:border-white/5 flex items-center px-6 justify-between">
                       <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-400/80"/>
                          <div className="w-3 h-3 rounded-full bg-amber-400/80"/>
                          <div className="w-3 h-3 rounded-full bg-emerald-400/80"/>
                       </div>
                       <div className="h-2 w-20 bg-slate-100 dark:bg-slate-800 rounded-full"/>
                    </div>
                    {/* Fake UI Body */}
                    <div className="p-6 grid grid-cols-2 gap-4 h-full">
                       <div className="col-span-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-4 flex flex-col justify-center items-start border border-indigo-500/20">
                          <div className="h-2 w-16 bg-indigo-500/20 rounded mb-2"/>
                          <div className="h-6 w-32 bg-indigo-500/40 rounded"/>
                       </div>
                       <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/5 p-4">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 mb-3"/>
                          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded mb-2"/>
                          <div className="h-2 w-2/3 bg-slate-200 dark:bg-slate-800 rounded"/>
                       </div>
                       <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/5 p-4 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full border-4 border-amber-500/30 border-t-amber-500"/>
                       </div>
                    </div>
                    {/* Notification Pop */}
                    <motion.div 
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1, type: "spring" }}
                      className="absolute bottom-6 right-6 left-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-3"
                    >
                       <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                         <ShieldCheck size={20} />
                       </div>
                       <div>
                         <div className="text-xs font-bold text-slate-900 dark:text-white">Diagnosztika kész</div>
                         <div className="text-[10px] text-slate-500">Minden rendszer normális.</div>
                       </div>
                    </motion.div>
                 </div>
               </div>
            </motion.div>
          </div>
        </div>

        {/* --- FEATURES GRID --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { 
                icon: <Cpu size={32} className="text-indigo-500" />, 
                title: "AI Szerelő", 
                desc: "Fotózd le a hibakódot vagy írd le a hangot. A Gemini AI azonnal elemzi és megoldást javasol.",
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
                viewport={{ once: true }}
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

        {/* --- BOTTOM CTA --- */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 dark:bg-indigo-950 text-white p-10 md:p-16 text-center shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 blur-[100px] rounded-full" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 blur-[100px] rounded-full" />
              
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Kezdd el ma, ingyen.</h2>
                <p className="text-slate-300 text-lg mb-10">
                  Nincs próbaidőszak, nincsenek rejtett költségek. Csak te, az autód, és a nyugalom.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/login?mode=signup" 
                    className="inline-flex items-center justify-center gap-2 bg-amber-500 text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-400 transition-colors shadow-lg shadow-amber-900/20"
                  >
                    Fiók létrehozása
                  </Link>
                  <Link 
                    href="/login" 
                    className="inline-flex items-center justify-center gap-2 bg-transparent border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors"
                  >
                    Belépés
                  </Link>
                </div>
              </div>
           </div>
        </div>

      </main>

      {/* --- FOOTER (EREDETI) --- */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 pt-20 pb-10 px-6 transition-colors">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
                <Link href="/" className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 relative"><Image src="/DynamicSense-logo.png" alt="DynamicSense Logo" fill className="object-contain" /></div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">Dynamic<span className="text-amber-500">Sense</span></span>
                </Link>
                <p className="text-slate-600 dark:text-slate-500 text-sm leading-relaxed mb-6">
                    Innovatív autós platform Magyarországon. AI alapú diagnosztika, digitális szervizkönyv és költségmenedzsment – minden egy helyen.
                </p>
                <div className="flex gap-4">
                    <a href="mailto:info.dynamicsense@gmail.com" className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition-all">
                        <MessageCircle size={18} />
                    </a>
                    <Link href="/support" className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition-all">
                        <HelpCircle size={18} />
                    </Link>
                </div>
            </div>
            
            <div>
                <h4 className="text-slate-900 dark:text-white font-bold mb-6 tracking-wide">Termék</h4>
                <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                    <li><a href="#features" className="hover:text-amber-500 transition-colors">Funkciók</a></li>
                    <li><Link href="/changelog" className="hover:text-amber-500 transition-colors">Újdonságok</Link></li>
                    <li><Link href="/support" className="hover:text-amber-500 transition-colors">Support</Link></li>
                </ul>
            </div>

            <div>
                <h4 className="text-slate-900 dark:text-white font-bold mb-6 tracking-wide">Jogi Információk</h4>
                <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                    <li><Link href="/privacy" className="hover:text-amber-500 transition-colors">Adatkezelés</Link></li>
                    <li><Link href="/terms" className="hover:text-amber-500 transition-colors">ÁSZF</Link></li>
                    <li><Link href="/impressum" className="hover:text-amber-500 transition-colors">Impresszum</Link></li>
                </ul>
            </div>
            
            <div>
               <h4 className="text-slate-900 dark:text-white font-bold mb-6 tracking-wide">Közösség</h4>
               <div className="flex flex-col gap-4">
                   <a href="https://www.facebook.com/profile.php?id=61585653752179" target="_blank" className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-[#1877F2] transition-colors">
                       <Facebook size={18} /> Facebook
                   </a>
                   <a href="https://www.instagram.com/dynamicsense2026/" target="_blank" className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-[#E4405F] transition-colors">
                       <Instagram size={18} /> Instagram
                   </a>
                   <a href="https://www.tiktok.com/@dynamicsense2026" target="_blank" className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors">
                       <TikTokIcon size={18} /> TikTok
                   </a>
               </div>
            </div>
         </div>
         
         <div className="border-t border-slate-200 dark:border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
             <p className="text-slate-500 dark:text-slate-600 text-xs font-mono">
               © {new Date().getFullYear()} DynamicSense Technologies. Minden jog fenntartva.
             </p>
             <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-600 font-mono bg-slate-100 dark:bg-slate-900/50 px-3 py-1 rounded-full">
                 <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative rounded-full h-2 w-2 bg-emerald-500"></span></span>
                 Rendszer állapota: <span className="text-emerald-600 dark:text-emerald-500 font-bold">Online</span>
             </div>
         </div>
      </footer>
    </div>
  );
}