'use client'

import { useState } from 'react'
import { Activity, BatteryCharging, Zap, Droplets, Wrench, AlertTriangle, X, ArrowRight, Disc } from 'lucide-react'
import { resetServiceCounter } from '@/app/cars/[id]/actions'
import { motion, AnimatePresence } from 'framer-motion' // Opcionális: ha nincs framer-motion, sima div is jó, de ezzel szebb

interface CarHealthProps {
  car: any
  kmRemaining: number
  serviceIntervalKm: number
  oilLife: number
}

type PartStatus = 'ok' | 'warning' | 'critical'
type CarPart = 'engine' | 'battery' | 'tires' | 'brakes' | 'suspension'

export default function CarHealthWidget({ car, kmRemaining, serviceIntervalKm, oilLife }: CarHealthProps) {
  const isElectric = car.fuel_type === 'Elektromos'
  const [selectedPart, setSelectedPart] = useState<CarPart | null>(null)

  // --- LOGIKA: Státuszok számítása ---
  
  // 1. Motor / Hajtáslánc logika
  const safeOilLife = Math.min(100, Math.max(0, oilLife))
  let engineStatus: PartStatus = 'ok'
  if (isElectric) {
     // EV logika: ha sok a km, figyelmeztet
     if (car.mileage > 150000) engineStatus = 'warning' 
  } else {
     // ICE logika: olajszint alapján
     if (safeOilLife < 10) engineStatus = 'critical'
     else if (safeOilLife < 30) engineStatus = 'warning'
  }

  // 2. Akkumulátor logika
  let batteryStatus: PartStatus = 'ok'
  const estimatedBatteryHealth = Math.max(85, 100 - (car.mileage / 15000))
  if (isElectric && estimatedBatteryHealth < 80) batteryStatus = 'warning'
  
  // 3. Fék és Gumi (Szimulált logika a példához, de bekötheted valós adatra)
  // Pl: Ha nincs rögzítve téli gumi és november van -> warning
  const currentMonth = new Date().getMonth()
  const isWinter = currentMonth > 9 || currentMonth < 2
  // Itt ellenőrizhetnéd a "tires" táblát, most egy egyszerűsített példa:
  const tireStatus: PartStatus = (isWinter && !car.tires?.some((t:any) => t.type === 'winter' && t.is_mounted)) ? 'warning' : 'ok'
  
  // Fékek: minden 40e km után warning
  const brakeStatus: PartStatus = (car.mileage % 40000 < 2000) ? 'warning' : 'ok'

  // --- HELPER: Színek lekérése státusz alapján ---
  const getStatusColor = (status: PartStatus) => {
    switch (status) {
      case 'critical': return 'fill-red-500 stroke-red-600 animate-pulse'
      case 'warning': return 'fill-amber-400 stroke-amber-500'
      default: return 'fill-slate-200 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700 hover:fill-slate-300 dark:hover:fill-slate-700'
    }
  }

  // --- TARTALOM A MODALHOZ ---
  const getPartDetails = (part: CarPart) => {
    switch (part) {
      case 'engine':
        return {
          title: isElectric ? 'Villanymotor & Hajtás' : 'Motor & Olaj',
          icon: isElectric ? <Zap className="w-6 h-6 text-cyan-500" /> : <Droplets className="w-6 h-6 text-amber-500" />,
          status: engineStatus,
          text: isElectric 
            ? 'Az elektromos hajtáslánc karbantartásmentesebb, de a hűtőrendszer ellenőrzése fontos.' 
            : `Az olaj élettartama ${Math.round(safeOilLife)}%. ${engineStatus === 'critical' ? 'Azonnali csere szükséges!' : 'Hamarosan csere esedékes.'}`,
          action: !isElectric && <ResetButton carId={car.id} />
        }
      case 'battery':
        return {
          title: 'Nagyfeszültségű Akku',
          icon: <BatteryCharging className="w-6 h-6 text-emerald-500" />,
          status: batteryStatus,
          text: `Becsült SOH (State of Health): ${estimatedBatteryHealth.toFixed(1)}%. Az akkumulátor állapota megfelelő.`,
          action: null
        }
      case 'tires':
        return {
          title: 'Gumiabroncsok',
          icon: <Disc className="w-6 h-6 text-slate-500" />,
          status: tireStatus,
          text: tireStatus === 'warning' ? 'Ideje ellenőrizni a guminyomást vagy váltani szezonális abroncsra.' : 'A gumik állapota megfelelőnek tűnik.',
          action: <button className="text-xs font-bold text-indigo-500 hover:underline">Gumihotel megnyitása</button>
        }
      case 'brakes':
        return {
          title: 'Fékrendszer',
          icon: <Activity className="w-6 h-6 text-red-500" />,
          status: brakeStatus,
          text: 'A fékbetétek és tárcsák kopóalkatrészek. Ha csikorgó hangot hallasz, azonnal vidd szervizbe.',
          action: null
        }
      default: return null
    }
  }

  const details = selectedPart ? getPartDetails(selectedPart) : null

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden group">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-slate-400" />
                    Jármű Diagnosztika
                </h3>
                <p className="text-xs text-slate-500 mt-1">Érintsd meg az alkatrészeket a részletekért.</p>
            </div>
            
            {/* Status Indicator */}
            <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                [engineStatus, batteryStatus, tireStatus, brakeStatus].includes('critical') 
                ? 'bg-red-100 text-red-600 border-red-200' 
                : 'bg-emerald-100 text-emerald-600 border-emerald-200'
            }`}>
                {[engineStatus, batteryStatus, tireStatus, brakeStatus].includes('critical') ? 'Beavatkozás szükséges' : 'Rendszer OK'}
            </div>
        </div>

        {/* --- INTERAKTÍV SVG AUTÓ --- */}
        <div className="relative h-64 w-full flex items-center justify-center my-4">
            
            {/* Háttér effekt (Glow) */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent blur-3xl pointer-events-none"></div>

            <svg viewBox="0 0 200 300" className="h-full w-auto drop-shadow-xl overflow-visible">
                {/* 1. GUMIK (Bal Első, Jobb Első, Bal Hátsó, Jobb Hátsó) */}
                <g className="cursor-pointer transition-opacity hover:opacity-80" onClick={() => setSelectedPart('tires')}>
                    <rect x="20" y="45" width="25" height="45" rx="5" className={`${getStatusColor(tireStatus)} transition-colors duration-300`} />
                    <rect x="155" y="45" width="25" height="45" rx="5" className={`${getStatusColor(tireStatus)} transition-colors duration-300`} />
                    <rect x="20" y="210" width="25" height="45" rx="5" className={`${getStatusColor(tireStatus)} transition-colors duration-300`} />
                    <rect x="155" y="210" width="25" height="45" rx="5" className={`${getStatusColor(tireStatus)} transition-colors duration-300`} />
                </g>

                {/* 2. KAROSSZÉRIA ALAP (Chassis) */}
                <path d="M45,40 Q45,20 100,20 Q155,20 155,40 L165,240 Q165,280 100,280 Q35,280 35,240 Z" 
                      className="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700 stroke-2" />
                
                {/* 3. MOTORHÁZTETŐ / ENGINE */}
                <path d="M50,45 Q50,30 100,30 Q150,30 150,45 L150,90 Q150,95 100,95 Q50,95 50,90 Z" 
                      className={`${getStatusColor(engineStatus)} cursor-pointer transition-all duration-300 stroke-2`}
                      onClick={() => setSelectedPart('engine')}
                />
                {/* Ikon a motorháztetőn */}
                <g pointerEvents="none">
                   {isElectric ? (
                       <path d="M95,50 L105,50 L100,75 Z" className="fill-white/50" />
                   ) : (
                       <circle cx="100" cy="60" r="8" className="fill-white/30" />
                   )}
                </g>

                {/* 4. UTASTÉR / BATTERY PACK (Padlólemez) */}
                <rect x="55" y="105" width="90" height="90" rx="10" 
                      className={`${getStatusColor(batteryStatus)} cursor-pointer transition-all duration-300 stroke-2`}
                      onClick={() => setSelectedPart('battery')}
                />
                
                {/* 5. FÉKEK (Szimbolikus tárcsák a kerekek mellett) */}
                <circle cx="45" cy="67" r="5" className={`${getStatusColor(brakeStatus)} cursor-pointer`} onClick={() => setSelectedPart('brakes')} />
                <circle cx="155" cy="67" r="5" className={`${getStatusColor(brakeStatus)} cursor-pointer`} onClick={() => setSelectedPart('brakes')} />

                {/* Szélvédő (Dekoráció) */}
                <path d="M55,95 Q100,85 145,95 L150,120 Q100,115 50,120 Z" className="fill-sky-200/50 dark:fill-sky-900/50 pointer-events-none" />
            </svg>

            {/* Pulzáló effektek kritikus hibákhoz (pozicionálva a motorra) */}
            {engineStatus === 'critical' && (
                <span className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex h-8 w-8">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-8 w-8 bg-red-500/20"></span>
                </span>
            )}
        </div>

        {/* --- POPUP MODAL (Részletek) --- */}
        <AnimatePresence>
            {selectedPart && details && (
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="absolute inset-x-4 bottom-4 bg-white/90 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-2xl z-20"
                >
                    <button onClick={() => setSelectedPart(null)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${
                            details.status === 'critical' ? 'bg-red-100 text-red-600' : 
                            details.status === 'warning' ? 'bg-amber-100 text-amber-600' : 
                            'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                            {details.icon}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{details.title}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">{details.text}</p>
                            
                            <div className="flex items-center gap-3">
                                {details.action}
                                {details.status !== 'ok' && (
                                    <button className="flex items-center gap-2 text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-2 rounded-lg hover:opacity-90 transition-opacity ml-auto">
                                        Szerviz Keresése <ArrowRight className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  )
}

// Külön komponens a reset gombnak, hogy clean legyen a kód
function ResetButton({ carId }: { carId: number }) {
    return (
        <form action={resetServiceCounter}>
             <input type="hidden" name="car_id" value={carId.toString()} />
             <button className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline">
                Számláló nullázása
             </button>
        </form>
    )
}