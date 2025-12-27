'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, Cpu, Activity, Server, Shield } from 'lucide-react';

export const IntroLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [rpm, setRpm] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRedline, setIsRedline] = useState(false);

  const bootSequence = [
    { time: 100, msg: "KERNEL INTEGRITY CHECK...", icon: Shield },
    { time: 500, msg: "APEX AI CORE: CONNECTED", icon: Cpu },
    { time: 1000, msg: "QUANTUM ENCRYPTION: ACTIVE", icon: Server },
    { time: 1500, msg: "SENSORS CALIBRATING...", icon: Activity },
    { time: 2000, msg: "READY TO LAUNCH", icon: Zap },
  ];

  useEffect(() => {
    bootSequence.forEach((item) => {
      setTimeout(() => {
        setLogs(prev => [...prev.slice(-3), item.msg]);
      }, item.time);
    });

    const timer1 = setTimeout(() => { setProgress(40); setRpm(3200); }, 100);
    const timer2 = setTimeout(() => { setProgress(60); setRpm(2800); }, 1200);
    const timer3 = setTimeout(() => { setProgress(100); setRpm(8500); setIsRedline(true); }, 2200);
    const timer4 = setTimeout(() => { onComplete(); }, 3500);

    return () => [timer1, timer2, timer3, timer4].forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }} exit={{ opacity: 0, filter: "blur(20px)" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-white font-mono"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      <div className={`absolute w-[60vw] h-[60vw] rounded-full blur-[150px] transition-all duration-1000 ${isRedline ? 'bg-primary/20' : 'bg-blue-600/10'}`}></div>

      <motion.div 
        className="relative z-10 flex flex-col items-center"
        animate={isRedline ? { x: [-2, 2, -2], y: [1, -1] } : {}}
        transition={{ duration: 0.05, repeat: Infinity }}
      >
        {/* TACHOMETER */}
        <div className="relative w-80 h-80 mb-12">
           <svg className="absolute inset-0 w-full h-full transform rotate-[135deg]" viewBox="0 0 100 100">
             {Array.from({ length: 40 }).map((_, i) => (
                <line key={i} x1="50" y1="5" x2="50" y2={i % 5 === 0 ? "15" : "10"} stroke={i > 32 ? "#ef4444" : "#1e293b"} strokeWidth="1" transform={`rotate(${i * 6.75} 50 50)`} />
             ))}
           </svg>

           <svg className="absolute inset-0 w-full h-full transform rotate-[135deg]" viewBox="0 0 100 100">
             <motion.circle 
                cx="50" cy="50" r="42" fill="none" 
                stroke={isRedline ? "#ef4444" : "#06b6d4"} 
                strokeWidth="4" strokeDasharray="212" strokeDashoffset="212" strokeLinecap="round"
                animate={{ strokeDashoffset: 212 - (212 * progress) / 100 }}
                style={{ filter: `drop-shadow(0 0 12px ${isRedline ? '#ef4444' : '#06b6d4'})` }}
             />
           </svg>

           <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] font-black text-slate-500 tracking-[0.3em] mb-2 uppercase">Apex RPM</span>
              <motion.span className={`text-7xl font-black italic tracking-tighter tabular-nums ${isRedline ? 'text-red-500' : 'text-white'}`}>
                {Math.round(rpm)}
              </motion.span>
              <span className="text-primary text-xs font-bold mt-2">DYNAMICSENSE OS</span>
           </div>
        </div>

        {/* LOGS */}
        <div className="w-64 space-y-2">
            {logs.map((log, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span className="text-primary">{`//`}</span> {log}
              </motion.div>
            ))}
        </div>
      </motion.div>
    </motion.div>
  );
};