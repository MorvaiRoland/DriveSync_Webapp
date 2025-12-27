'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Trophy, Activity, Trash2, Loader2, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { leaveBattle } from '@/app/actions/showroom'

export default function MyEntryStats({ myEntry, battleId }: { myEntry: any, battleId: string }) {
  const [isLeaving, setIsLeaving] = useState(false)

  const handleWithdraw = async () => {
    if (!confirm("Biztosan vissza akarod vonni a nevezést? Minden eddigi szavazatod elveszik!")) return
    
    setIsLeaving(true)
    const result = await leaveBattle(battleId)
    
    if (result?.error) {
      alert(result.error)
      setIsLeaving(false)
    }
    // Siker esetén a revalidatePath frissíti az oldalt és eltűnik a komponens
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-[2.5rem] p-6 border-neon-glow relative overflow-hidden group shadow-2xl">
        <div className="flex flex-col gap-6 relative z-10">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                    <Trophy size={14} /> Saját Nevezés Állapota
                </h3>
                <button 
                    onClick={handleWithdraw}
                    disabled={isLeaving}
                    className="text-[9px] font-black uppercase tracking-widest text-destructive/60 hover:text-destructive flex items-center gap-1.5 transition-all bg-destructive/5 hover:bg-destructive/10 px-3 py-1.5 rounded-full border border-destructive/10"
                >
                    {isLeaving ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />} 
                    Nevezés visszavonása
                </button>
            </div>

            <div className="flex gap-6 items-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 relative rounded-3xl overflow-hidden border border-white/10 shadow-xl shrink-0">
                    <Image src={myEntry.imageUrl || '/placeholder.jpg'} alt="Saját autó" fill className="object-cover" />
                </div>

                <div className="flex-1 space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-black text-foreground uppercase italic tracking-tighter leading-tight">{myEntry.carName}</h2>
                    <div className="flex gap-2">
                        <div className="bg-accent/50 px-4 py-2 rounded-xl border border-border/50">
                            <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Voksok</p>
                            <p className="text-lg font-black text-foreground tabular-nums">{myEntry.voteCount}</p>
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
        <Star className="absolute -bottom-6 -right-6 w-24 h-24 opacity-[0.03] text-primary rotate-12 group-hover:scale-125 transition-transform duration-1000" />
    </motion.div>
  )
}