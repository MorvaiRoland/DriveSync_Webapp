'use client'

import { motion } from 'framer-motion';
import { calculateLevel } from '@/lib/gamification';
import { Zap, Trophy } from 'lucide-react';

export default function LevelProgress({ xp }: { xp: number }) {
  const { level, progress, rank } = calculateLevel(xp);

  return (
    <div className="glass rounded-[2.5rem] p-8 border-neon-glow shadow-2xl relative overflow-hidden group">
      <div className="flex justify-between items-end mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="text-primary w-4 h-4 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Experience Level</span>
          </div>
          <h2 className="text-4xl font-black italic tracking-tighter uppercase">
            LVL <span className="text-gradient-ocean">{level}</span>
          </h2>
        </div>
        <div className="text-right">
          <p className={`text-sm font-black uppercase italic ${rank.color}`}>{rank.title}</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase">{xp.toLocaleString()} Összes XP</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-4 w-full bg-accent/30 rounded-full border border-white/5 p-1 relative shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className="h-full bg-ocean-electric rounded-full relative"
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          {/* Neon Glow End */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full blur-md" />
        </motion.div>
      </div>

      <div className="flex justify-between mt-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
        <span>Kezdő</span>
        <span>{1000 - (xp % 1000)} XP a következő szintig</span>
        <span>Pro</span>
      </div>
    </div>
  );
}