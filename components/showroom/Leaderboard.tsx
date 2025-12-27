'use client'

import { Trophy, Medal, Crown } from 'lucide-react';

export default function Leaderboard({ entries }: { entries: any[] }) {
  return (
    <div className="glass rounded-[3rem] p-8 border-neon-glow shadow-2xl">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-ocean-electric rounded-2xl text-white shadow-lg">
          <Crown size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black uppercase italic tracking-tighter">Szezon Ranglista</h3>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest">Decemberi Forduló • Top 10</p>
        </div>
      </div>

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div 
            key={entry.id}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
              index === 0 ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'bg-accent/20 border-border/50 hover:border-primary/30'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 text-center">
                {index === 0 ? <Medal className="text-amber-400 mx-auto" /> : <span className="font-black italic opacity-30">{index + 1}.</span>}
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-800 border border-white/10 relative overflow-hidden">
                {/* User Avatar Placeholder */}
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold uppercase">{entry.userName.slice(0,2)}</div>
              </div>
              <div>
                <p className="text-sm font-black uppercase italic">{entry.carName}</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase">{entry.userName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-foreground tabular-nums">{entry.voteCount}</p>
              <p className="text-[9px] font-black text-primary uppercase tracking-widest">Voks</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}