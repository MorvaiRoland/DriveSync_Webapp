'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Cpu, Zap, Shield } from 'lucide-react';

export const LoginSidePanel = () => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950 font-sans">
        
        {/* --- CINEMATIC VIDEO BACKGROUND --- */}
        <div className="absolute inset-0 z-0">
            {/* Sötétítő rétegek a jobb olvashatóságért */}
            <div className="absolute inset-0 bg-slate-950/60 z-10 mix-blend-multiply"></div> 
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80 z-10"></div>
            
            {/* HELYI VIDEÓ */}
            <video 
                autoPlay 
                loop 
                muted       // Ez némítja le a videót (kötelező az autoplay-hez)
                playsInline // Mobilon ne nyissa meg teljes képernyőn
                className="w-full h-full object-cover scale-105 blur-[2px]" // Enyhe blur a mélységért
            >
                {/* FONTOS: 
                   1. A fájlnak a 'public' mappában kell lennie.
                   2. Ha a neve 'video.mp4', akkor az útvonal '/video.mp4'.
                   3. Nem kell kiírni, hogy 'public'.
                */}
                <source src="/login.mp4" type="video/mp4" />
                
                {/* Fallback, ha valamiért nem töltene be */}
                Your browser does not support the video tag.
            </video>
        </div>
        
        {/* --- TECH OVERLAYS (HUD Elements) --- */}
        <div className="absolute inset-0 z-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04]"></div>
        
        {/* Pásztázó fénycsík animáció */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent z-20 animate-scanline opacity-40"></div>


        {/* --- TOP CONTENT: BRANDING --- */}
        <div className="relative z-30 p-12 pt-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex items-center gap-4 mb-6"
            >
                 <div className="relative w-14 h-14">
                    {/* Forgó "reaktor" effekt a logó körül */}
                    <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin-slow"></div>
                    <div className="absolute inset-2 rounded-full border border-indigo-500/30 border-b-indigo-500 animate-reverse-spin"></div>
                    <Image src="/DynamicSense-logo.png" alt="DynamicSense Logo" fill className="object-contain p-2 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" priority />
                 </div>
                 <div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase">
                        Dynamic<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Sense</span>
                    </h1>
                    <div className="text-[10px] text-amber-500/80 font-mono uppercase tracking-[0.3em]">
                        Automotive Intelligence Core
                    </div>
                 </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="max-w-md"
            >
                <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                    Az irányítás <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-slate-500">új dimenziója.</span>
                </h2>
                <p className="text-lg text-slate-300 font-light leading-relaxed border-l-2 border-amber-500/50 pl-4">
                    Lépj be a járműved digitális idegközpontjába. 
                    <span className="block mt-2 text-sm text-slate-400 font-mono">
                        {`> AI Diagnosztika | > Valós idejű analitika | > Prediktív karbantartás`}
                    </span>
                </p>
            </motion.div>
        </div>

        {/* --- BOTTOM CONTENT: TECH SPECS --- */}
        <div className="relative z-30 p-12 pb-16">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8"
            >
                {/* Spec 1 */}
                <div className="flex flex-col gap-2 group cursor-default">
                    <div className="flex items-center gap-2 text-amber-500/80 group-hover:text-amber-400 transition-colors">
                        <Cpu size={18} />
                        <span className="text-[10px] font-mono uppercase tracking-wider">Motor</span>
                    </div>
                    <span className="text-sm font-bold text-white">Gemini 2.5 AI</span>
                    <div className="h-0.5 w-full bg-slate-800 rounded overflow-hidden">
                        <div className="h-full w-3/4 bg-amber-500/50"></div>
                    </div>
                </div>
                {/* Spec 2 */}
                <div className="flex flex-col gap-2 group cursor-default">
                     <div className="flex items-center gap-2 text-indigo-500/80 group-hover:text-indigo-400 transition-colors">
                        <Shield size={18} />
                        <span className="text-[10px] font-mono uppercase tracking-wider">Védelem</span>
                    </div>
                    <span className="text-sm font-bold text-white">AES-256 Titkosítás</span>
                    <div className="h-0.5 w-full bg-slate-800 rounded overflow-hidden">
                        <div className="h-full w-full bg-indigo-500/50"></div>
                    </div>
                </div>
                {/* Spec 3 */}
                 <div className="flex flex-col gap-2 group cursor-default">
                     <div className="flex items-center gap-2 text-emerald-500/80 group-hover:text-emerald-400 transition-colors">
                        <Zap size={18} />
                        <span className="text-[10px] font-mono uppercase tracking-wider">Sebesség</span>
                    </div>
                    <span className="text-sm font-bold text-white">&lt;50ms Válaszidő</span>
                    <div className="h-0.5 w-full bg-slate-800 rounded overflow-hidden">
                        <div className="h-full w-[90%] bg-emerald-500/50"></div>
                    </div>
                </div>
            </motion.div>
        </div>
    </div>
  );
};