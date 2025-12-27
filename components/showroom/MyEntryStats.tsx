'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Trophy, Activity, Trash2, Loader2, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { leaveBattle } from '@/app/actions/showroom'

export default function MyEntryStats({ myEntry, battleId }: { myEntry: any, battleId: string }) {
  const [isLeaving, setIsLeaving] = useState(false)

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass bg-white/80 dark:bg-slate-900/50 rounded-[2.5rem] p-6 border-neon-glow relative overflow-hidden group shadow-2xl">
        <div className="flex flex-col gap-6 relative z-10">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                    <Trophy size={14} /> Saját Nevezés
                </h3>
                <button 
                    onClick={async () => { if(confirm("Visszavonod?")) { setIsLeaving(true); await leaveBattle(battleId); setIsLeaving(false); }}}
                    disabled={isLeaving}
                    className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 flex items-center gap-1.5 transition-all"
                >
                    {isLeaving ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />} 
                    Visszavonás
                </button>
            </div>

            <div className="flex gap-6 items-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 relative rounded-3xl overflow-hidden border border-slate-100 dark:border-white/10 shadow-xl shrink-0">
                    <Image src={myEntry.imageUrl || '/placeholder.jpg'} alt="Autó" fill className="object-cover" />
                </div>

                <div className="flex-1 space-y-4">
                    {/* JAVÍTÁS: Explicit text-slate-900 */}
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight">
                      {myEntry.carName}
                    </h2>
                    <div className="flex gap-2">
                        <div className="bg-slate-100 dark:bg-accent/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-border/50">
                            <p className="text-[8px] font-black text-slate-500 dark:text-muted-foreground uppercase mb-1">Voksok</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{myEntry.voteCount}</p>
                        </div>
                        <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 flex-1">
                            <p className="text-[8px] font-black text-primary uppercase mb-1">Státusz</p>
                            <div className="flex items-center gap-1 text-primary">
                                <Activity size={12} />
                                <span className="text-[10px] font-black italic uppercase">Rising</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
  )
}