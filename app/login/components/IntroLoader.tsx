'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, animate, AnimatePresence, useTransform } from 'framer-motion';
import { Zap, Cpu, Activity, Server, Shield } from 'lucide-react';
import Image from 'next/image';

export const IntroLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [lang, setLang] = useState<'hu'|'en'>('hu');
  const progress = useMotionValue(0);
  
  const lineWidth = useTransform(progress, [0, 100], ["0%", "100%"]);

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang');
    const isEn = savedLang === 'en';
    if (isEn) {
      setLang('en');
    }

    const bootLogs = isEn ? [
      { t: 100, msg: "Securing Connection..." },
      { t: 800, msg: "Initializing Modules..." },
      { t: 1600, msg: "Loading Interface..." },
      { t: 2400, msg: "Authenticating Session..." },
      { t: 3000, msg: "System Ready" },
    ] : [
      { t: 100, msg: "Kapcsolat Biztosítása..." },
      { t: 800, msg: "Modulok Inicializálása..." },
      { t: 1600, msg: "Kezelőfelület Betöltése..." },
      { t: 2400, msg: "Munkamenet Hitelesítése..." },
      { t: 3000, msg: "Rendszer Készen áll" },
    ];

    bootLogs.forEach(log => {
      setTimeout(() => setLogs(prev => [...prev.slice(-2), log.msg]), log.t);
    });

    const sequence = async () => {
      animate(progress, 30, { duration: 0.8, ease: "circOut" });
      await new Promise(r => setTimeout(r, 800));

      animate(progress, 25, { duration: 0.2, ease: "easeOut" });
      await new Promise(r => setTimeout(r, 200));
      animate(progress, 65, { duration: 1.2, ease: "easeInOut" });
      await new Promise(r => setTimeout(r, 1400));

      animate(progress, 100, { duration: 0.8, ease: "backOut" });
      await new Promise(r => setTimeout(r, 1200));

      onComplete();
    };

    sequence();
  }, [progress, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F5F5F7] dark:bg-[#000000] overflow-hidden selection:bg-none cursor-wait font-sans"
    >
      {/* Aurora Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[min(400px,80vw)] md:w-[800px] h-[min(400px,80vw)] md:h-[800px] bg-indigo-400/20 dark:bg-indigo-600/20 blur-[80px] md:blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[min(400px,80vw)] md:w-[800px] h-[min(400px,80vw)] md:h-[800px] bg-purple-400/20 dark:bg-purple-600/20 blur-[80px] md:blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-[30%] left-[10%] w-[min(300px,70vw)] md:w-[600px] h-[min(300px,70vw)] md:h-[600px] bg-cyan-300/20 dark:bg-cyan-600/20 blur-[80px] md:blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] dark:opacity-[0.06] mix-blend-overlay"></div>
      </div>

      {/* Main Glass Card */}
      <motion.div 
        className="relative z-10 flex flex-col items-center max-w-sm w-full px-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="w-full bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-3xl shadow-2xl rounded-[2rem] p-8 md:p-10 flex flex-col items-center text-center">
          
          <div className="w-16 h-16 md:w-20 md:h-20 mb-6 relative animate-pulse">
            <Image src="/DynamicSense-logo.png" alt="DynamicSense" fill className="object-contain" priority />
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight mb-2">
            DynamicSense
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">
            {lang === 'en' ? 'Loading Workspace...' : 'Munkaterület betöltése...'}
          </p>

          {/* Progress Bar */}
          <div className="w-full h-1.5 md:h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden relative mb-6">
            <motion.div 
              style={{ width: lineWidth }}
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
            />
          </div>

          {/* Logs */}
          <div className="h-6 w-full relative overflow-hidden flex flex-col justify-end items-center">
            <AnimatePresence mode='wait'>
              {logs.length > 0 && (
                <motion.div
                  key={logs[logs.length - 1]}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs md:text-sm font-medium text-slate-400 dark:text-slate-500 tracking-wide"
                >
                  {logs[logs.length - 1]}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};