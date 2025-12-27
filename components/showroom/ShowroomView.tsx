'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Flame, Layers, Sparkles, Trophy } from 'lucide-react'
import SwipeGame from './SwipeGame'
import MyEntryStats from './MyEntryStats'
import BattleEntry from './BattleEntry'

export default function ShowroomView({ user, activeBattle, entries, myCars, myEntryData }: any) {
  
  const playableEntries = entries.filter((e: any) => {
    if (user && myEntryData && e.carName === myEntryData.carName) return false;
    if (e.userHasVoted) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] overflow-x-hidden selection:bg-primary/30">
      
      {/* DINAMIKUS HÁTTÉR */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        
        {/* HEADER */}
        <header className="mb-12 space-y-4">
          <Link href="/" className="group inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-all text-[10px] font-black uppercase tracking-[0.2em]">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
                <Flame size={12} className="fill-current" /> Live Showroom Battle
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gradient-ocean uppercase italic leading-none">
                {activeBattle.title}
              </h1>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl">
               <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
               <span className="text-[10px] font-black uppercase text-primary tracking-widest">{playableEntries.length} Új setup vár</span>
            </div>
          </div>
        </header>

        {/* RÁCS ELRENDEZÉS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* BAL OLDAL: SAJÁT STÁTUSZ */}
          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              {myEntryData ? (
                <MyEntryStats key="stats" myEntry={myEntryData} />
              ) : user ? (
                <BattleEntry 
                  key="entry"
                  battleId={activeBattle.id} 
                  myCars={myCars} 
                  hasEntered={false} 
                />
              ) : null}
            </AnimatePresence>

            <div className="glass p-8 rounded-[2.5rem] border-neon-glow shadow-xl">
               <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                 <Sparkles size={14} /> Szabályzat
               </h3>
               <p className="text-sm text-muted-foreground leading-relaxed font-medium italic">
                 {activeBattle.description || "Szavazz a közösség kedvenc építéseire! A legtöbb voksot kapott autók egyedi digitális trófeát kapnak."}
               </p>
            </div>
          </div>

          {/* JOBB OLDAL: SZAVAZÁS (STAGE) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full relative min-h-[500px] flex flex-col items-center">
              <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 bg-accent/50 p-1.5 px-4 rounded-full border border-border/50 shadow-inner">
                  <Layers className="text-primary w-4 h-4" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Voksolási Aréna</h2>
                </div>
              </div>
              
              <div className="w-full max-w-[380px]">
                {playableEntries.length > 0 ? (
                  <SwipeGame entries={playableEntries} />
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass rounded-[3rem] p-12 border-neon-glow text-center shadow-2xl"
                  >
                    <Trophy size={48} className="mx-auto mb-4 text-primary opacity-50" />
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground mb-2">Vége a körnek!</h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Mindenkire szavaztál ebben a futamban.</p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}