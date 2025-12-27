'use client'

import Image from 'next/image'
import { Trophy, Activity, Users, Star } from 'lucide-react'
import { motion } from 'framer-motion'

export default function MyEntryStats({ myEntry }: { myEntry: any }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-[2.5rem] p-8 border-neon-glow relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
           <Star size={200} />
        </div>
        
        <div className="flex flex-col md:flex-row gap-10 relative z-10">
            {/* Kép Grayscale hatással */}
            <div className="w-full md:w-2/5 relative aspect-video md:aspect-square rounded-[2rem] overflow-hidden border border-white/10 group">
                <Image src={myEntry.imageUrl || '/placeholder.jpg'} alt="Saját autó" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Jelölt</div>
            </div>

            <div className="flex-1 flex flex-col justify-between py-2">
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                        <Trophy size={14} /> Saját Nevezés Állapota
                    </h3>
                    <h2 className="text-4xl font-black text-foreground uppercase italic tracking-tighter">{myEntry.carName}</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-accent/30 p-6 rounded-3xl border border-border/50 group/item">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Szavazatok</p>
                        <p className="text-3xl font-black text-foreground tabular-nums flex items-end gap-2">
                            {myEntry.voteCount} <span className="text-xs text-primary mb-1">XP+</span>
                        </p>
                    </div>
                    <div className="bg-primary/10 p-6 rounded-3xl border border-primary/20 text-primary">
                        <p className="text-[9px] font-black uppercase tracking-widest mb-1">Népszerűség</p>
                        <div className="flex items-center gap-2">
                            <Activity size={24} />
                            <span className="text-xl font-black italic tracking-tighter">Rising</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
  )
}