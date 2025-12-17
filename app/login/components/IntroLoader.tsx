'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2, Cpu, Activity, Server, Shield } from 'lucide-react';

// Segédfüggvény véletlenszerű hex kódokhoz (díszítés)
const randomHex = () => Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0');

export const IntroLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [rpm, setRpm] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRedline, setIsRedline] = useState(false);

  // Boot üzenetek sorrendje
  const bootSequence = [
    { time: 100, msg: "BIOS INTEGRITÁS ELLENŐRZÉSE...", icon: Shield },
    { time: 400, msg: "ECU KAPCSOLÓDÁS: SIKERES", icon: Cpu },
    { time: 800, msg: "MEMÓRIA CÍMZÉS: 0x4F2A...", icon: Server },
    { time: 1200, msg: "SZENZOROK KALIBRÁLÁSA...", icon: Activity },
    { time: 1600, msg: "TURBÓNYOMÁS SZABÁLYZÓ: AKTÍV", icon: Zap },
    { time: 2000, msg: "FELHASZNÁLÓI PROFIL BETÖLTÉSE...", icon: CheckCircle2 },
  ];

  useEffect(() => {
    // Logok hozzáadása időzítve
    bootSequence.forEach((item) => {
      setTimeout(() => {
        setLogs(prev => [...prev.slice(-4), item.msg]); // Csak az utolsó 5-öt mutatjuk
      }, item.time);
    });

    // 1. Fázis: Gyújtás (0-3000 RPM)
    const timer1 = setTimeout(() => {
      setProgress(30);
      setRpm(2400);
    }, 100);

    // 2. Fázis: "Torpanás" / Rendszerellenőrzés (kicsit visszaesik)
    const timer2 = setTimeout(() => {
      setProgress(45);
      setRpm(2100); // Kicsit visszaesik, mint indításnál
    }, 1000);

    // 3. Fázis: Padlógáz (Redline)
    const timer3 = setTimeout(() => {
      setProgress(100);
      setRpm(7800); // Leszabályozás határ
      setIsRedline(true);
    }, 1800);

    // 4. Fázis: Kész, animáció vége
    const timer4 = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  // Tick marks generálása (osztások a műszerfalon)
  const ticks = Array.from({ length: 40 }, (_, i) => i);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden font-mono"
    >
      {/* --- HÁTTÉR ELEMEK --- */}
      
      {/* 1. Zaj és Scanlines */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.07] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] background-size-[100%_2px,3px_100%] pointer-events-none"></div>
      
      {/* 2. Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      {/* 3. Központi Fény (Glow) */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full blur-[120px] transition-all duration-1000 ${isRedline ? 'bg-red-600/20' : 'bg-amber-500/10'}`}></div>

      {/* --- KÖZPONTI TARTALOM (Rázkódás effekt) --- */}
      <motion.div 
        className="relative z-10 flex flex-col items-center"
        animate={isRedline ? { x: [-1, 1, -1, 1, 0], y: [1, -1, 0] } : {}}
        transition={{ duration: 0.1, repeat: isRedline ? 10 : 0 }}
      >
        
        {/* --- TACHOMETER (MŰSZERFAL) --- */}
        <div className="relative w-72 h-72 mb-12">
           
           {/* Tick Marks (Skála) */}
           <svg className="absolute inset-0 w-full h-full transform rotate-[135deg]" viewBox="0 0 100 100">
             {ticks.map((i) => {
               const isRedZone = i > 30; // Utolsó 10 osztás piros
               return (
                 <line
                   key={i}
                   x1="50" y1="10" x2="50" y2={i % 5 === 0 ? "18" : "14"} // Minden 5. hosszabb
                   stroke={isRedZone ? "#ef4444" : "#334155"} // Piros vagy Szürke
                   strokeWidth={i % 5 === 0 ? "2" : "1"}
                   transform={`rotate(${i * 6.75} 50 50)`} // Elforgatás
                   className="transition-colors duration-300"
                 />
               );
             })}
           </svg>

           {/* Active Arc (Progress) */}
           <svg className="absolute inset-0 w-full h-full transform rotate-[135deg]" viewBox="0 0 100 100">
             {/* Háttér ív */}
             <circle cx="50" cy="50" r="40" fill="none" stroke="#0f172a" strokeWidth="2" strokeDasharray="212" strokeLinecap="round" />
             
             {/* Aktív ív */}
             <motion.circle 
               cx="50" cy="50" r="40" 
               fill="none" 
               stroke={isRedline ? "#ef4444" : "#f59e0b"} 
               strokeWidth="4"
               strokeDasharray="212"
               strokeDashoffset="212"
               strokeLinecap="round"
               animate={{ strokeDashoffset: 212 - (212 * progress) / 100 }}
               transition={{ duration: 0.5, ease: "circOut" }}
               style={{ filter: isRedline ? "drop-shadow(0 0 10px rgba(239,68,68,0.8))" : "drop-shadow(0 0 8px rgba(245,158,11,0.6))" }}
             />
           </svg>

           {/* RPM Számláló */}
           <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-[10px] text-slate-500 mb-1 tracking-widest font-bold">FORDULAT</div>
              <motion.div 
                 className={`text-6xl font-black tracking-tighter tabular-nums ${isRedline ? 'text-red-500 animate-pulse' : 'text-white'}`}
              >
                <NumberTicker value={rpm} />
              </motion.div>
              <div className="text-slate-400 text-xs font-bold mt-2 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
                 x100 RPM
              </div>
           </div>
        </div>

        {/* --- LOADING STATUS & BAR --- */}
        <div className="w-80 flex flex-col gap-2">
            
            {/* Loading Bar */}
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
               <motion.div 
                 className={`h-full ${isRedline ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,1)]'}`}
                 animate={{ width: `${progress}%` }}
                 transition={{ ease: "linear" }}
               />
            </div>

            {/* Fő Státuszszöveg */}
            <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                <span>Rendszer Állapot</span>
                <span className={isRedline ? "text-emerald-400" : "text-amber-500"}>
                    {progress === 100 ? "ÉLESÍTVE" : `${Math.round(progress)}%`}
                </span>
            </div>
        </div>

      </motion.div>

      {/* --- BOOT LOG (BAL OLDAL) --- */}
      <div className="absolute bottom-10 left-6 hidden md:flex flex-col gap-1.5 font-mono text-[10px] text-slate-500/80 w-64">
         {logs.map((log, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, x: -10 }} 
               animate={{ opacity: 1, x: 0 }} 
               className="flex items-center gap-2"
             >
                <span className="text-emerald-500">{`>`}</span> {log}
             </motion.div>
         ))}
      </div>

      {/* --- TECH DEKORÁCIÓ (JOBB ALSÓ) --- */}
      <div className="absolute bottom-10 right-6 text-right hidden md:block">
         <div className="text-[10px] text-slate-600 font-mono mb-1">MEM_ALLOC: {randomHex()}</div>
         <div className="text-[10px] text-slate-600 font-mono mb-1">CORE_TEMP: 84°C</div>
         <div className="text-xs text-amber-500/50 font-black tracking-[0.3em] uppercase mt-2">
             DynamicSense
         </div>
      </div>
      
    </motion.div>
  );
};

// --- KÜLÖN KOMPONENS A SZÁMOK PÖRGETÉSÉHEZ ---
// Ez biztosítja, hogy a számok "pörögjenek" és ne csak ugráljanak
const NumberTicker = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(value);
    
    useEffect(() => {
        // Egyszerű interpoláció a sima váltáshoz
        const interval = setInterval(() => {
            setDisplayValue(prev => {
                const diff = value - prev;
                if (Math.abs(diff) < 10) return value;
                return prev + Math.round(diff * 0.2); // 0.2 a "simaság" faktora
            });
        }, 16); // kb 60fps
        
        return () => clearInterval(interval);
    }, [value]);

    return <>{displayValue}</>;
};