'use client'

import { Activity, BatteryCharging, Zap, RefreshCw, AlertTriangle, CheckCircle2, Droplets } from 'lucide-react'
import { resetServiceCounter } from '@/app/cars/[id]/actions' // Ellenőrizd az útvonalat!

interface CarHealthProps {
  car: any
  kmRemaining: number
  serviceIntervalKm: number
  oilLife: number // Ez a %-os érték a szervizig
}

export default function CarHealthWidget({ car, kmRemaining, serviceIntervalKm, oilLife }: CarHealthProps) {
  const isElectric = car.fuel_type === 'electric';

  // --- ELEKTROMOS AUTÓ NÉZET ---
  if (isElectric) {
    // Becsült akku degradáció (egyszerű logika: évi 1-2% vagy km alapú)
    // Ez csak vizuális becslés, valós adathoz OBD kéne
    const estimatedBatteryHealth = Math.max(85, 100 - (car.mileage / 15000)); 
    
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden">
        {/* Háttér dekoráció */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="flex justify-between items-center mb-6 relative z-10">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-500 fill-cyan-500/20" />
            E-Drive Rendszer
          </h3>
          <form action={resetServiceCounter}>
             <input type="hidden" name="car_id" value={car.id.toString()} />
             <button className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors">
               Szerviz Reset
             </button>
          </form>
        </div>

        <div className="flex items-center gap-6 mb-6">
           <div className="flex-1 space-y-4">
              {/* Akkumulátor SOH (State of Health) */}
              <div>
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Akku Egészség (Becsült)</span>
                    <span className="text-xl font-black text-cyan-600 dark:text-cyan-400">{estimatedBatteryHealth.toFixed(1)}%</span>
                 </div>
                 <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${estimatedBatteryHealth}%` }}></div>
                 </div>
              </div>

              {/* Következő átvizsgálás */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-cyan-50 dark:bg-cyan-900/10 p-3 rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                    <p className="text-[10px] text-cyan-600/70 dark:text-cyan-400/70 uppercase font-bold mb-1">Következő Szerviz</p>
                    <p className={`font-bold ${kmRemaining > 0 ? 'text-slate-800 dark:text-slate-200' : 'text-red-500'}`}>
                       {kmRemaining > 0 ? `${Math.round(kmRemaining).toLocaleString()} km` : 'Esedékes!'}
                    </p>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Ciklus</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{serviceIntervalKm.toLocaleString()} km</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
           <BatteryCharging className="w-5 h-5 text-slate-400 mt-0.5" />
           <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Átvizsgálási Emlékeztető</p>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                 Az elektromos autóknál nincs olajcsere, de a fékfolyadék, hűtőközeg és a futómű ellenőrzése kritikus a megadott intervallumban.
              </p>
           </div>
        </div>
      </div>
    );
  }

  // --- HAGYOMÁNYOS / HIBRID AUTÓ NÉZET (Eredeti design) ---
  const safeOilLife = Math.min(100, Math.max(0, oilLife));
  let colorClass = 'text-emerald-500';
  let trackColor = 'bg-emerald-500';
  if (safeOilLife < 20) { colorClass = 'text-red-500'; trackColor = 'bg-red-500'; } 
  else if (safeOilLife < 50) { colorClass = 'text-amber-500'; trackColor = 'bg-amber-500'; }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
               <Droplets className="w-5 h-5 text-slate-400" />
               Motor & Olaj
            </h3>
            <form action={resetServiceCounter}>
                <input type="hidden" name="car_id" value={car.id.toString()} />
                <button className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors">
                   Nullázás
                </button>
            </form>
        </div>
        <div className="flex items-center gap-6 mb-8">
            <div className="flex-1 space-y-4">
                <div>
                    <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase">Olaj Élettartam</span>
                            <span className={`text-xl font-black ${colorClass}`}>{Math.round(safeOilLife)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${trackColor}`} style={{ width: `${safeOilLife}%` }}></div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Még megtehető</p>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{kmRemaining > 0 ? `${Math.round(kmRemaining).toLocaleString()} km` : 'Túlfutás!'}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Ciklus</p>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{serviceIntervalKm.toLocaleString()} km</p>
                        </div>
                </div>
            </div>
        </div>
        
        {/* Alsó infó sáv */}
        <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
           <Activity className="w-5 h-5 text-slate-400 mt-0.5" />
           <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Szervizintervallum</p>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                 A rendszer a futott kilométer alapján számolja az olajcserét. Ha elérte a 0-t, azonnal szerviz szükséges.
              </p>
           </div>
        </div>
    </div>
  )
}