'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight, Search, ShieldCheck, BarChart3, Cpu, 
  MessageCircle, HelpCircle, Facebook, Instagram 
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- HELPER KOMPONENSEK ---

const TikTokIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const BackgroundGlows = () => (
  <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none -z-10">
    <div className="absolute top-[-10%] left-[20%] w-[60vw] h-[60vw] bg-amber-600/5 rounded-full blur-[130px]" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/5 rounded-full blur-[120px]" />
  </div>
);

// ITT A JAVÍTÁS: Hozzáadtuk a promo és updates propokat
export default function LandingPage({ promo, updates }: { promo?: any, updates: any[] }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-amber-500/30">
      <BackgroundGlows />

      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all ${scrolled ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 py-4 shadow-sm' : 'py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 relative"><Image src="/DynamicSense-logo.png" alt="Logo" fill className="object-contain" /></div>
            <span className="text-xl font-bold tracking-tight uppercase">Dynamic<span className="text-amber-500">Sense</span></span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hidden sm:block text-sm font-bold">Belépés</Link>
            <Link href="/login?mode=signup" className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-5 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform flex items-center gap-2">
              Regisztráció <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4">
        {/* HERO */}
        <section className="max-w-4xl mx-auto text-center mb-20">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-6">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative rounded-full h-2 w-2 bg-emerald-500"></span></span>
            Early Access: Most minden funkció ingyenes!
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Az autód digitális <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">élettörténete.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Felejtsd el a papír alapú káoszt. Digitális szervizkönyv, AI alapú diagnosztika és költségkövetés egyetlen modern platformon.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login?mode=signup" className="bg-amber-500 text-slate-950 text-lg font-bold px-10 py-5 rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
              Ingyenes Regisztráció <ArrowRight size={20} />
            </Link>
            <Link href="/check" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-lg font-bold px-10 py-5 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <Search size={20} /> Alvázszám lekérdezés
            </Link>
          </motion.div>
        </section>

        {/* FEATURES - MINI GRID */}
        <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {[
            { icon: <Cpu className="text-indigo-500" />, title: "AI Szerelő", desc: "Fotózd le a hibakódot, és az AI azonnal megmondja a hiba okát." },
            { icon: <ShieldCheck className="text-emerald-500" />, title: "Digitális Könyv", desc: "Vezess hiteles szervizmúltat, ami növeli az autód eladási értékét." },
            { icon: <BarChart3 className="text-amber-500" />, title: "Költségkövető", desc: "Lásd pontosan, mennyit költöttél üzemanyagra és szervizre." }
          ].map((f, i) => (
            <div key={i} className="p-8 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mb-6">{f.icon}</div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      {/* FOOTER - EREDETI VERZIÓ MEGTARTVA */}
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