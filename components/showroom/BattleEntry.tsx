'use client'

import { useState } from 'react'
import { joinBattle, leaveBattle } from '@/app/actions/showroom'
import { Trophy, Car, CheckCircle2, AlertCircle, Trash2, Zap, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function BattleEntry({ battleId, myCars, hasEntered }: { battleId: string, myCars: any[], hasEntered: boolean }) {
  const [selectedCar, setSelectedCar] = useState(myCars.length > 0 ? myCars[0].id : '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (hasEntered) {
    return (
      <div className="glass border-emerald-500/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-emerald-500/5">
        <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle2 size={32} />
            </div>
            <div>
                <h3 className="text-emerald-500 font-black text-xl uppercase italic tracking-tighter">Nevezés Aktív</h3>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Az autód ringben van, gyűjtsd a lájkokat!</p>
            </div>
        </div>
        <button 
            onClick={async () => { if(confirm("Visszavonod a nevezést?")) { setIsSubmitting(true); await leaveBattle(battleId); setIsSubmitting(false); }}}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-destructive hover:bg-destructive/10 border border-destructive/20 transition-all"
        >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Trash2 size={14} />} Visszavonás
        </button>
      </div>
    )
  }

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-ocean-electric p-[2px] rounded-[3rem] shadow-2xl">
        <div className="glass rounded-[2.9rem] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6 flex-1 text-center md:text-left flex-col md:flex-row">
                <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-white backdrop-blur-md shadow-inner rotate-3">
                    <Trophy size={40} />
                </div>
                <div>
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Itt az időd!</h3>
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1 max-w-xs">Van egy autód a garázsban? Nevezd be a futamra és szerezz elismerést!</p>
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
                <div className="relative">
                    <select 
                        value={selectedCar} onChange={(e) => setSelectedCar(e.target.value)}
                        className="w-full md:w-56 bg-black/20 border-white/20 text-white rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-white/50 outline-none appearance-none cursor-pointer"
                    >
                        {myCars.map(car => <option key={car.id} value={car.id} className="text-black">{car.plate} - {car.model}</option>)}
                    </select>
                    <Car className="absolute right-4 top-4 text-white/50 pointer-events-none" size={16} />
                </div>

                <button 
                    onClick={async () => { setIsSubmitting(true); const fd = new FormData(); fd.append('battleId', battleId); fd.append('carId', selectedCar); await joinBattle(fd); setIsSubmitting(false); }}
                    disabled={isSubmitting}
                    className="w-full bg-white text-primary px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {isSubmitting ? 'Feldolgozás...' : 'Nevezés Indítása 🔥'}
                </button>
            </div>
        </div>
    </motion.div>
  )
}