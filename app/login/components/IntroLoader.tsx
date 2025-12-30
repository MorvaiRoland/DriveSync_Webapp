'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, useSpring, useTransform, useMotionValue, animate, AnimatePresence } from 'framer-motion';
import { Zap, Cpu, Activity, Server, Shield, Gauge, Radio, AlertTriangle } from 'lucide-react';

// --- SEGÉDKOMPONENS: FIZIKA ALAPÚ SZÁMLÁLÓ ---
// Ez biztosítja, hogy a szám mindig szinkronban legyen a csíkkal
const PhysicsCounter = ({ value }: { value: any }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Feliratkozunk a motionValue változására
    return value.on("change", (latest: number) => {
      if (ref.current) {
        // Formázás: ezres elválasztó, fix szélesség a remegés ellen
        ref.current.textContent = Math.round(latest).toLocaleString('en-US').replace(/,/g, ' ');
      }
    });
  }, [value]);

  return <span ref={ref} />;
};

export const IntroLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [logs, setLogs] = useState<string[]>([]);
  
  // --- KÖZPONTI VEZÉRLÉS (Motion Values) ---
  // A 'progress' 0-tól 100-ig megy. Minden más ebből származik.
  const progress = useMotionValue(0);
  
  // Fizikai rugózás (stiffness/damping), hogy "analóg" műszer érzete legyen
  const smoothProgress = useSpring(progress, { damping: 20, stiffness: 100, mass: 0.5 });

  // Értékek levezetése a rugózott progressből
  const rpmValue = useTransform(smoothProgress, [0, 100], [0, 9200]); // 0 -> 9200 RPM
  const rotation = useTransform(smoothProgress, [0, 100], [-120, 120]); // Mutató forgása
  
  // Szín interpoláció (Kék -> Cián -> Lila -> Piros)
  const dynamicColor = useTransform(
    smoothProgress,
    [0, 60, 85, 100],
    ["#3b82f6", "#06b6d4", "#a855f7", "#ef4444"]
  );

  // Redline állapot figyelése (vibráláshoz)
  const [isRedline, setIsRedline] = useState(false);

  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (v) => {
      setIsRedline(v > 90);
    });
    return () => unsubscribe();
  }, [smoothProgress]);

  // --- BOOT SZEKVENCIÁK ---
  useEffect(() => {
    // Log üzenetek
    const bootLogs = [
      { t: 100, msg: "KERNEL_INTEGRITY: OK", icon: Shield },
      { t: 800, msg: "NEURAL_ENGINE: LINKED", icon: Cpu },
      { t: 1600, msg: "QUANTUM_ENCRYPTION: ACTIVE", icon: Server },
      { t: 2400, msg: "BIOMETRIC_SYNC: COMPLETE", icon: Activity },
      { t: 3000, msg: "SYSTEM_READY", icon: Zap },
    ];

    bootLogs.forEach(log => {
      setTimeout(() => setLogs(prev => [...prev.slice(-4), log.msg]), log.t);
    });

    // --- ANIMÁCIÓS IDŐVONAL ---
    const sequence = async () => {
      // 1. Indítás (Gyors felpörgés 30%-ra)
      animate(progress, 30, { duration: 0.8, ease: "circOut" });
      await new Promise(r => setTimeout(r, 800));

      // 2. "Váltás" (Kicsit visszaejtjük a fordulatot, majd fel 65%-ra)
      animate(progress, 25, { duration: 0.2, ease: "easeOut" }); // Visszaejt
      await new Promise(r => setTimeout(r, 200));
      animate(progress, 65, { duration: 1.2, ease: "easeInOut" });
      await new Promise(r => setTimeout(r, 1400));

      // 3. Padlógáz (Redline 100%)
      animate(progress, 100, { duration: 0.8, ease: "backOut" });
      await new Promise(r => setTimeout(r, 1200));

      // 4. Befejezés
      onComplete();
    };

    sequence();
  }, [progress, onComplete]);

  // SVG Skála generálás (240 fokos ív)
  const radius = 120;
  const circumference = 2 * Math.PI * radius; // kb 754
  const visibleArc = circumference * 0.66; // Csak a kör 2/3-a látszik (240 fok)
  
  // Ticks generálása
  const ticks = useMemo(() => Array.from({ length: 61 }), []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.2, filter: "blur(20px)" }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] text-white font-mono overflow-hidden selection:bg-none cursor-wait"
    >
      {/* --- HÁTTÉR RÁCS (GRID) --- */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
      
      {/* Dinamikus Háttérfény (Glow) */}
      <motion.div 
        style={{ backgroundColor: dynamicColor }}
        className="absolute w-[600px] h-[600px] rounded-full opacity-10 blur-[120px]" 
      />

      {/* --- FŐ MŰSZEREGYSÉG --- */}
      <motion.div 
        className="relative z-10"
        animate={isRedline ? { x: [-1, 1, -1, 0], y: [1, -1, 0] } : {}}
        transition={{ duration: 0.05, repeat: Infinity }}
      >
        <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
          
          {/* SVG Canvas */}
          <svg className="absolute inset-0 w-full h-full rotate-90" viewBox="0 0 300 300">
            {/* Defs a gradiensekhez */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>

            {/* Skála vonalak (Ticks) */}
            <g transform="translate(150, 150)">
              {ticks.map((_, i) => {
                const angle = -120 + (i * (240 / 60)); // -120-tól +120 fokig
                const isMajor = i % 10 === 0;
                const isRedZone = i > 50;
                return (
                  <line
                    key={i}
                    x1="0" y1={isMajor ? -135 : -140}
                    x2="0" y2="-125"
                    stroke={isRedZone ? "#ef4444" : (isMajor ? "#ffffff" : "#334155")}
                    strokeWidth={isMajor ? 3 : 1}
                    transform={`rotate(${angle})`}
                    className="transition-colors duration-300"
                  />
                );
              })}
            </g>

            {/* Háttér ív (halvány) */}
            <circle
              cx="150" cy="150" r={radius}
              fill="none"
              stroke="#1e293b"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${visibleArc} ${circumference}`}
              strokeDashoffset={0}
              transform="rotate(120, 150, 150)" // Kezdőpont beállítása
            />

            {/* AKTÍV PROGRESS ÍV (A lényeg) */}
            <motion.circle
              cx="150" cy="150" r={radius}
              fill="none"
              stroke="url(#gaugeGradient)" // Gradiens stroke
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${visibleArc} ${circumference}`}
              // A strokeDashoffset animálása a physics value alapján
              style={{ 
                strokeDashoffset: useTransform(smoothProgress, [0, 100], [visibleArc, 0]),
                filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))"
              }}
              transform="rotate(120, 150, 150)"
            />
          </svg>

          {/* --- KÖZÉPSŐ DIGITÁLIS KIJELZŐ --- */}
          <div className="absolute flex flex-col items-center justify-center z-20">
            <motion.div 
              className="text-xs font-bold tracking-[0.3em] text-slate-500 uppercase mb-2"
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
            >
              Engine RPM
            </motion.div>

            {/* A nagy szám */}
            <div className="flex items-baseline relative">
                <motion.div 
                    style={{ color: dynamicColor }}
                    className={`text-7xl sm:text-8xl font-black italic tracking-tighter tabular-nums ${isRedline ? 'animate-pulse' : ''}`}
                >
                    <PhysicsCounter value={rpmValue} />
                </motion.div>
                
                {/* Glitch effekt klón (csak redline-nál látszik) */}
                {isRedline && (
                     <motion.div 
                     className="absolute inset-0 text-7xl sm:text-8xl font-black italic tracking-tighter tabular-nums text-red-500/50 mix-blend-screen"
                     style={{ x: 2, y: -2 }}
                 >
                     <PhysicsCounter value={rpmValue} />
                 </motion.div>
                )}
            </div>

            {/* RPM Label */}
            <div className="text-sm font-semibold text-slate-400 mt-2">x 1000 min⁻¹</div>
            
            {/* Warning Box */}
            <div className="h-6 mt-4">
                <AnimatePresence>
                    {isRedline && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded border border-red-500/50"
                        >
                            <AlertTriangle size={12} />
                            <span className="text-[10px] font-black uppercase tracking-wider">Warning: Redline</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- LOGOK KIÍRÁSA (Terminál stílus) --- */}
      <div className="absolute bottom-20 w-80 font-mono text-xs">
         <div className="flex flex-col-reverse gap-1 h-24 mask-image-b-to-t">
            <AnimatePresence mode='popLayout'>
                {logs.map((log, i) => (
                    <motion.div
                        key={log + i} // Unique key
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 text-slate-400"
                    >
                        <span className="text-blue-500">➜</span>
                        <span className="tracking-widest uppercase font-bold text-[10px]">{log}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
         </div>
      </div>

      {/* --- SCANLINES & TEXTURE --- */}
      <div className="absolute inset-0 pointer-events-none z-50 bg-[length:100%_3px] bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.2)_50%)] opacity-30"></div>
    </motion.div>
  );
};