'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gauge, Zap, CheckCircle2 } from 'lucide-react';

export const IntroLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("ECU CONNECTION...");

  useEffect(() => {
    // 1. Fázis: Gyors felfutás
    const timer1 = setTimeout(() => {
      setProgress(30);
      setStatus("SYSTEM DIAGNOSTIC...");
    }, 500);

    // 2. Fázis: "Váltás" / Megtorpanás
    const timer2 = setTimeout(() => {
      setProgress(45);
      setStatus("LOADING USER PROFILE...");
    }, 1200);

    // 3. Fázis: Teljes gáz (Redline)
    const timer3 = setTimeout(() => {
      setProgress(100);
      setStatus("IGNITION READY");
    }, 2000);

    // 4. Fázis: Kész, animáció vége
    const timer4 = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden"
    >
      {/* Background Noise */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none"></div>
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-amber-500/5 rounded-full blur-[100px] animate-pulse"></div>

      <div className="relative z-10 flex flex-col items-center">
        
        {/* --- TACHOMETER GAUGE --- */}
        <div className="relative w-64 h-64 mb-10">
           {/* Outer Ring (Inactive) */}
           <svg className="w-full h-full transform rotate-[135deg]" viewBox="0 0 100 100">
             <circle 
               cx="50" cy="50" r="45" 
               fill="none" 
               stroke="#1e293b" 
               strokeWidth="6"
               strokeDasharray="212" // 3/4 circle
               strokeLinecap="round"
             />
           </svg>

           {/* Active Ring (Animated) */}
           <svg className="absolute top-0 left-0 w-full h-full transform rotate-[135deg]" viewBox="0 0 100 100">
             <motion.circle 
               cx="50" cy="50" r="45" 
               fill="none" 
               stroke="#f59e0b" // Amber-500
               strokeWidth="6"
               strokeDasharray="212"
               strokeDashoffset="212"
               strokeLinecap="round"
               animate={{ strokeDashoffset: 212 - (212 * progress) / 100 }}
               transition={{ duration: 0.8, ease: "circOut" }}
               style={{ filter: "drop-shadow(0 0 8px rgba(245,158,11,0.6))" }}
             />
           </svg>

           {/* Center Content */}
           <div className="absolute inset-0 flex flex-col items-center justify-center transform rotate-0">
              <motion.div 
                 className="text-5xl font-black font-mono tracking-tighter text-white"
                 animate={{ scale: [1, 1.05, 1] }}
                 transition={{ repeat: Infinity, duration: 2 }}
              >
                {Math.round(progress * 80)} <span className="text-xs text-slate-500 font-sans">RPM</span>
              </motion.div>
              <div className="text-amber-500 text-xs font-bold mt-1">x100</div>
           </div>
        </div>

        {/* --- STATUS TEXT --- */}
        <div className="flex flex-col items-center gap-2 h-16">
           <motion.div 
             key={status}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             className="text-sm font-mono text-slate-400 tracking-[0.2em] uppercase flex items-center gap-2"
           >
              {progress < 100 ? <Zap size={14} className="animate-pulse text-amber-500" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
              {status}
           </motion.div>
           
           {/* Progress Bar Line */}
           <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                animate={{ width: `${progress}%` }}
              ></motion.div>
           </div>
        </div>

      </div>

      {/* Bottom Legal/Tech Text */}
      <div className="absolute bottom-8 text-[10px] text-slate-600 font-mono uppercase tracking-widest">
        DynamicSense Tech • V2.1 Boot Sequence
      </div>
    </motion.div>
  );
};