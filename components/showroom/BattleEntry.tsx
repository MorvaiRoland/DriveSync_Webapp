'use client'

import { useState } from 'react'
import { joinBattle, leaveBattle } from '@/app/actions/showroom'
import { Trophy, Car, Zap, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function BattleEntry({ battleId, myCars }: { battleId: string, myCars: any[] }) {
  const [selectedCar, setSelectedCar] = useState(myCars.length > 0 ? myCars[0].id : '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (myCars.length === 0) return null;

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-ocean-electric p-[2px] rounded-[2.5rem]">
        <div className="bg-background rounded-[2.4rem] p-8 space-y-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                    <Trophy size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tighter">Nevezés</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Válaszd ki a versenyautód!</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <select 
                        value={selectedCar} onChange={(e) => setSelectedCar(e.target.value)}
                        className="w-full bg-accent/50 border border-border rounded-2xl px-6 py-4 text-xs font-black uppercase focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                    >
                        {myCars.map(car => <option key={car.id} value={car.id} className="text-slate-900">{car.plate} - {car.model}</option>)}
                    </select>
                    <Car className="absolute right-4 top-4 text-muted-foreground" size={16} />
                </div>

                <button 
                    onClick={async () => { setIsSubmitting(true); const fd = new FormData(); fd.append('battleId', battleId); fd.append('carId', selectedCar); await joinBattle(fd); setIsSubmitting(false); }}
                    disabled={isSubmitting}
                    className="w-full bg-ocean-electric text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Csatlakozom a futamhoz 🔥'}
                </button>
            </div>
        </div>
    </motion.div>
  )
}