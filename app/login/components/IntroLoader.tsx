'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Cpu, Activity, Server, Shield, Gauge, Radio } from 'lucide-react';

// --- SEGÉDKOMPONENS A SZÁMOK SIMA PÖRGÉSÉHEZ ---
const NumberTicker = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayValue(prev => {
        const diff = value - prev;
        if (Math.abs(diff) < 5) return value;
        return prev + Math.round(diff * 0.15); // Sima követés
      });
    }, 16);
    return () => clearInterval(interval);
  }, [value]);

  return <>{displayValue.toLocaleString()}</>;
};

export const IntroLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [rpm, setRpm] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRedline, setIsRedline] = useState(false);

  const bootSequence = [
    { time: 100, msg: "RENDSZERMAG INTEGRITÁS ELLENŐRZÉSE...", icon: Shield },
    { time: 600, msg: "APEX AI MAG: ONLINE", icon: Cpu },
    { time: 1100, msg: "KVANTUM-TITKOSÍTÁS AKTIVÁLÁSA...", icon: Server },
    { time: 1700, msg: "SZENZOROK KALIBRÁLÁSA (BIOMETRIA)...", icon: Activity },
    { time: 2200, msg: "DYNAMICSENSE OS: INDÍTÁSRA KÉSZ", icon: Zap },
  ];

  useEffect(() => {
    bootSequence.forEach((item) => {
      setTimeout(() => {
        setLogs(prev => [...prev.slice(-3), item.msg]);
      }, item.time);
    });

    // Fordulatszám és progress fázisok
    const t1 = setTimeout(() => { setProgress(35); setRpm(2400); }, 200);
    const t2 = setTimeout(() => { setProgress(65); setRpm(1800); }, 1400); // Visszaváltás érzete
    const t3 = setTimeout(() => { 
        setProgress(100); 
        setRpm(8800); 
        setIsRedline(true); 
    }, 2400);
    const t4 = setTimeout(() => { onComplete(); }, 3800);

    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onComplete]);

  // Skála osztások generálása
  const ticks = useMemo(() => Array.from({ length: 50 }), []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(30px)" }}
      transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-white font-mono overflow-hidden"
    >
      {/* --- HÁTTÉR EFFEKTEK --- */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950 pointer-events-none"></div>
      
      {/* Dinamikus háttérfény */}
      <div className={`absolute w-[70vw] h-[70vw] rounded-full blur-[180px] transition-all duration-1000 ${isRedline ? 'bg-red-600/15' : 'bg-primary/10'}`}></div>

      {/* --- KÖZPONTI MŰSZEREGYSÉG --- */}
      <motion.div 
        className="relative z-10 flex flex-col items-center"
        animate={isRedline ? { 
            x: [0, -1, 1, -1, 1, 0],
            y: [0, 1, -1, 1, -1, 0] 
        } : {}}
        transition={{ duration: 0.1, repeat: Infinity }}
      >
        <div className="relative w-80 h-80 sm:w-96 sm:h-96 mb-12">
           
           {/* Külső statikus skála */}
           <svg className="absolute inset-0 w-full h-full transform rotate-[130deg]" viewBox="0 0 100 100">
             {ticks.map((_, i) => (
                <line 
                    key={i} 
                    x1="50" y1="5" x2="50" y2={i % 5 === 0 ? "15" : "10"} 
                    stroke={i > 38 ? "#ef4444" : "#334155"} 
                    strokeWidth={i % 5 === 0 ? "1.5" : "0.5"} 
                    transform={`rotate(${i * 5.6} 50 50)`} 
                />
             ))}
           </svg>

           {/* Aktív progress ív (Electric Teal) */}
           <svg className="absolute inset-0 w-full h-full transform rotate-[130deg]" viewBox="0 0 100 100">
             <motion.circle 
                cx="50" cy="50" r="42" fill="none" 
                stroke={isRedline ? "#ef4444" : "#06b6d4"} 
                strokeWidth="3" strokeDasharray="210" strokeDashoffset="210" strokeLinecap="round"
                animate={{ strokeDashoffset: 210 - (210 * progress) / 100 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{ filter: `drop-shadow(0 0 15px ${isRedline ? '#ef4444' : '#06b6d4'})` }}
             />
           </svg>

           {/* Belső digitális kijelző */}
           <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div 
                animate={{ opacity: [0.4, 1, 0.4] }} 
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[10px] font-black text-primary tracking-[0.4em] mb-2 uppercase"
              >
                Fordulatszám
              </motion.div>
              
              <div className={`text-7xl sm:text-8xl font-black italic tracking-tighter tabular-nums transition-colors duration-300 ${isRedline ? 'text-red-500' : 'text-white'}`}>
                <NumberTicker value={rpm} />
              </div>

              <div className="flex flex-col items-center mt-4">
                 <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-2"></div>
                 <span className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">DynamicSense OS v4.2</span>
              </div>
           </div>

           {/* "Redline" figyelmeztetés */}
           <AnimatePresence>
             {isRedline && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter"
                >
                    Maximális Teljesítmény
                </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* --- RENDSZERNAPLÓ (LOGS) --- */}
        <div className="h-20 w-80 flex flex-col items-center justify-start">
            <AnimatePresence mode="popLayout">
                {logs.map((log, i) => (
                  <motion.div 
                    key={log} 
                    initial={{ opacity: 0, y: 10, filter: "blur(5px)" }} 
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
                    exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
                    className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-1"
                  >
                    <span className="text-primary font-black">{`//`}</span> {log}
                  </motion.div>
                ))}
            </AnimatePresence>
        </div>
      </motion.div>

      {/* --- ALSÓ DEKORÁCIÓ --- */}
      <div className="absolute bottom-12 flex items-center gap-8 opacity-20 grayscale">
          <div className="flex items-center gap-2">
              <Radio size={14} className="animate-pulse" />
              <span className="text-[10px] font-black tracking-widest uppercase text-white">Adatátvitel aktív</span>
          </div>
          <div className="flex items-center gap-2">
              <Gauge size={14} />
              <span className="text-[10px] font-black tracking-widest uppercase text-white">Telemetria: OK</span>
          </div>
      </div>
      
      {/* Scanline effekt */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-50 bg-[length:100%_4px,4px_100%]"></div>
    </motion.div>
  );
};