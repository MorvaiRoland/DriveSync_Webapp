'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Flame, Layers, Sparkles, Trophy, Target } from 'lucide-react'
import SwipeGame from './SwipeGame'
import MyEntryStats from './MyEntryStats'
import BattleEntry from './BattleEntry'

export default function ShowroomView({ user, activeBattle, entries, myCars, myEntryData }: any) {
  
  const playableEntries = entries.filter((e: any) => {
    // Ne lássuk a saját autónkat a szavazásnál
    if (user && myEntryData && e.carName === myEntryData.carName) return false;
    // Ne lássuk azt, amire már szavaztunk
    if (e.userHasVoted) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] overflow-x-hidden selection:bg-primary/30 relative">
      
      {/* --- DINAMIKUS HÁTTÉR EFFEKTEK --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse" />
        <div className="absolute bottom-[5%] left-[-5%] w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[60px] md:blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-10">
        
        {/* --- PRÉMIUM FEJLÉC --- */}
        <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
          <div className="space-y-3 md:space-y-4">
            <Link href="/" className="group inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-all text-[10px] font-black uppercase tracking-[0.2em]">
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Vissza a főoldalra
            </Link>
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center gap-2 text-primary font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em]">
                <Flame size={12} className="fill-current animate-pulse" /> Élő Showroom Battle
              </div>
              {/* Reszponzív szövegméret: mobilon kisebb (3xl), tableten nagyobb */}
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter text-gradient-ocean uppercase italic leading-none break-words">
                {activeBattle.title}
              </h1>
            </div>
          </div>

          {/* Státusz Indikátor */}
          <div className="flex items-center gap-3 md:gap-4 bg-accent/30 border border-border/50 p-2 pl-4 md:pl-5 rounded-2xl backdrop-blur-md shadow-xl self-start md:self-end">
             <div className="flex flex-col items-end">
                <span className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Versenyben lévő autók</span>
                <span className="text-[10px] md:text-xs font-bold text-foreground">{playableEntries.length} setup vár rád</span>
             </div>
             <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                <Target size={16} className="md:w-5 md:h-5" />
             </div>
          </div>
        </header>

        {/* --- FŐ TARTALMI RÁCS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* JOBB OLDALI SÁV (Voksolási Aréna - JÁTÉK) 
              MOBILON EZ LEGYEN FELÜL (order-1)
              ASZTALI GÉPEN JOBB OLDALT (order-2)
          */}
          <div className="lg:col-span-7 order-1 lg:order-2 w-full">
            <div className="w-full relative flex flex-col items-center">
              
              {/* Aréna Címke */}
              <div className="mb-6 md:mb-10 text-center relative z-20">
                <div className="inline-flex items-center gap-2 md:gap-3 bg-ocean-electric/10 p-1.5 px-4 md:p-2 md:px-6 rounded-full border border-primary/30 shadow-[0_0_30px_rgba(6,182,212,0.1)] backdrop-blur-md">
                  <Layers className="text-primary w-3 h-3 md:w-4 md:h-4 animate-bounce" />
                  <h2 className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-primary">Voksolási Aréna</h2>
                </div>
              </div>
              
              {/* SWIPE GAME KONTÉNER 
                  - h-[540px]: Mobilon fix magasságot adunk, ami elég a kártyának ÉS a gomboknak.
                  - sm:h-[600px]: Tablettől felfelé növeljük.
                  - relative: Hogy a tartalom ne lógjon ki.
              */}
              <div className="w-full max-w-[360px] md:max-w-[420px] relative z-10 mx-auto h-[540px] sm:h-[600px] lg:h-[650px]">
                {playableEntries.length > 0 ? (
                  <SwipeGame entries={playableEntries} />
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass rounded-[3rem] md:rounded-[4rem] p-10 md:p-16 border-neon-glow text-center shadow-[0_0_50px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center h-full max-h-[500px]"
                  >
                    <div className="h-20 w-20 md:h-24 md:w-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-6 md:mb-8 text-primary shadow-inner">
                      <Trophy size={40} className="drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] md:w-12 md:h-12" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-foreground mb-3 leading-none">Vége a körnek!</h3>
                    <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">
                      Minden nevezőre szavaztál ebben a futamban. 
                    </p>
                    <div className="mt-6 md:mt-8 h-1 w-12 bg-primary/30 rounded-full" />
                  </motion.div>
                )}
              </div>

              {/* Dekoratív fény a háttérben */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[500px] bg-primary/5 blur-[80px] md:blur-[120px] rounded-full -z-10 pointer-events-none" />
            </div>
          </div>

          {/* BAL OLDALI SÁV (Profil & Szabályok) 
              MOBILON EZ LEGYEN ALUL (order-2)
              ASZTALI GÉPEN BAL OLDALT (order-1)
          */}
          <div className="lg:col-span-5 space-y-6 md:space-y-8 order-2 lg:order-1 pt-4 lg:pt-0">
            <AnimatePresence mode="wait">
              {myEntryData ? (
                <motion.div
                  key="my-stats"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <MyEntryStats myEntry={myEntryData} battleId={activeBattle.id} />
                </motion.div>
              ) : user ? (
                <motion.div
                  key="entry-form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <BattleEntry 
                    battleId={activeBattle.id} 
                    myCars={myCars} 
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Szabályzat Bento Card */}
            <div className="glass p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border-neon-glow shadow-2xl relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 text-primary opacity-[0.03] group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                  <Sparkles size={100} className="md:w-[120px] md:h-[120px]" />
               </div>
               <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-primary mb-4 md:mb-5 flex items-center gap-2 relative z-10">
                 <Sparkles size={14} /> Futam Információ
               </h3>
               <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium italic relative z-10">
                 {activeBattle.description || "Szavazz a közösség legstílusosabb építéseire! A legtöbb voksot kapott autók egyedi digitális trófeát és XP bónuszt kapnak a szezon végén."}
               </p>
               <div className="mt-5 md:mt-6 pt-5 md:pt-6 border-t border-border/50 flex justify-between items-center relative z-10">
                  <span className="text-[8px] md:text-[9px] font-black uppercase text-muted-foreground tracking-widest">Szezon lezárása</span>
                  <span className="text-[9px] md:text-[10px] font-bold text-foreground bg-accent px-3 py-1 rounded-full uppercase">Hamarosan</span>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}