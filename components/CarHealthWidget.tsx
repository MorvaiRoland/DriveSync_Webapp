'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Activity, BatteryCharging, Zap, AlertTriangle, Droplets, ShieldCheck, RefreshCcw } from 'lucide-react'
import { resetServiceCounter } from '@/app/cars/[id]/actions'

interface CarHealthProps {
  car: any
  kmRemaining: number
  serviceIntervalKm: number
  oilLife: number
}

export default function CarHealthWidget({ car, kmRemaining, serviceIntervalKm, oilLife }: CarHealthProps) {
  const isElectric = car.fuel_type === 'Elektromos';
  
  // Elektromos autó esetén becsült akku állapot
  const estimatedBatteryHealth = Math.max(85, 100 - (car.mileage / 20000));
  
  // Színkódolás a státusz alapján
  const getStatusColor = (val: number) => {
    if (val < 15) return 'text-rose-500 shadow-[0_0_15px_#f43f5e]'
    if (val < 40) return 'text-amber-500 shadow-[0_0_15px_#f59e0b]'
    return 'text-primary shadow-[0_0_15px_#06b6d4]'
  }

  const barColor = isElectric 
    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_15px_#06b6d4]' 
    : (oilLife < 15 ? 'bg-rose-500 shadow-[0_0_15px_#f43f5e]' : oilLife < 40 ? 'bg-amber-500 shadow-[0_0_15px_#f59e0b]' : 'bg-primary shadow-[0_0_15px_#06b6d4]');

  return (
    <div className="glass rounded-[2.5rem] p-8 border-neon-glow shadow-2xl h-full flex flex-col relative overflow-hidden group">
      {/* Háttér dekoratív elem */}
      <div className="absolute -top-10 -right-10 opacity-[0.03] text-primary group-hover:scale-110 transition-transform duration-1000 rotate-12">
        {isElectric ? <Zap size={250} /> : <Activity size={250} />}
      </div>

      <div className="flex justify-between items-center mb-10 relative z-10">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
          {isElectric ? <Zap size={16} className="text-primary animate-pulse" /> : <Droplets size={16} className="text-primary" />}
          {isElectric ? 'E-Drive Telemetria' : 'Motor & Kenőanyag'}
        </h3>
        
        <form action={resetServiceCounter}>
          <input type="hidden" name="car_id" value={car.id.toString()} />
          <button className="flex items-center gap-2 bg-white/5 hover:bg-primary/20 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary px-4 py-2 rounded-xl border border-white/5 hover:border-primary/30 transition-all active:scale-95 group/btn">
            <RefreshCcw size={10} className="group-hover/btn:rotate-180 transition-transform duration-500" />
            Szerviz Reset
          </button>
        </form>
      </div>

      <div className="space-y-10 relative z-10 flex-1">
        {/* FŐ ÉLETTARTAM MUTATÓ */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">
                {isElectric ? 'Akkumulátor SOH' : 'Olaj élettartam'}
              </p>
              <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                {isElectric ? 'Rendszer Egészség' : 'Karbantartási Ciklus'}
              </h4>
            </div>
            <div className={`text-4xl font-black italic tracking-tighter tabular-nums ${isElectric ? 'text-primary' : (oilLife < 15 ? 'text-rose-500' : 'text-white')}`}>
              {Math.round(isElectric ? estimatedBatteryHealth : oilLife)}%
            </div>
          </div>
          
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${isElectric ? estimatedBatteryHealth : oilLife}%` }}
              transition={{ duration: 2, ease: "circOut" }}
              className={`h-full rounded-full ${barColor}`}
            />
          </div>
        </div>

        {/* BENTO STATS GRID */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 space-y-2 hover:bg-white/[0.08] transition-all group/item">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover/item:text-primary">Még megtehető</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-black tracking-tighter italic ${kmRemaining <= 1000 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                {kmRemaining > 0 ? Math.round(kmRemaining).toLocaleString() : '0'}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">KM</span>
            </div>
          </div>

          <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 space-y-2">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center md:text-left">Intervallum</p>
            <div className="flex items-baseline gap-1 justify-center md:justify-start">
              <span className="text-2xl font-black tracking-tighter italic text-white/40">{serviceIntervalKm.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">KM</span>
            </div>
          </div>
        </div>

        {/* DynamicSense DIAGNOSZTIKA ÜZENET */}
        <div className={`mt-auto p-5 rounded-3xl border flex items-start gap-4 backdrop-blur-xl ${
          kmRemaining < 1500 ? 'bg-rose-500/5 border-rose-500/20 text-rose-500' : 'bg-primary/5 border-primary/20 text-slate-400'
        }`}>
          <div className={`p-2 rounded-xl ${kmRemaining < 1500 ? 'bg-rose-500/20' : 'bg-primary/20 text-primary'}`}>
            {kmRemaining < 1500 ? <AlertTriangle size={18} /> : <ShieldCheck size={18} />}
          </div>
          <div>
            <p className="text-xs font-black uppercase italic tracking-tight text-white mb-1">Diagnosztikai jelentés</p>
            <p className="text-[10px] font-medium leading-relaxed opacity-70 uppercase tracking-wide">
              {isElectric 
                ? "Az elektromos hajtáslánc nem igényel olajcserét, de a fékrendszer és hűtőközeg ellenőrzése javasolt." 
                : "A kenőanyag viszkozitása a futásteljesítmény alapján csökken. A 0% elérése előtt végezze el a cserét."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}