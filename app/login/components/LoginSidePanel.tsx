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
            <div className="absolute inset-0 bg-slate-950/60 z-10 mix-blend-multiply" /> 
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80 z-10" />
            
            <video 
                autoPlay loop muted playsInline 
                className="w-full h-full object-cover scale-105 blur-[2px]"
            >
                <source src="/login.mp4" type="video/mp4" />
            </video>
        </div>
        
        {/* --- TECH OVERLAYS --- */}
        <div className="absolute inset-0 z-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04]" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent z-20 animate-scanline opacity-40" />

        {/* --- TOP CONTENT --- */}
        <div className="relative z-30 p-12 pt-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex items-center gap-4 mb-6"
            >
                 <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin-slow" />
                    <div className="absolute inset-2 rounded-full border border-indigo-500/30 border-b-indigo-500 animate-reverse-spin" />
                    <Image src="/DynamicSense-logo.png" alt="Logo" fill className="object-contain p-2 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" priority />
                 </div>
                 <div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase">
                        Dynamic<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Sense</span>
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
                        {`> AI Diagnosztika | > Valós idejű analitika`}
                    </span>
                </p>
            </motion.div>
        </div>

        {/* --- BOTTOM SPECS --- */}
        <div className="relative z-30 p-12 pb-16">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8"
            >
                <SpecItem icon={<Cpu size={18} />} label="Motor" value="Gemini 2.5 AI" color="bg-amber-500" />
                <SpecItem icon={<Shield size={18} />} label="Védelem" value="AES-256" color="bg-indigo-500" />
                <SpecItem icon={<Zap size={18} />} label="Sebesség" value="<50ms Ping" color="bg-emerald-500" />
            </motion.div>
        </div>
    </div>
  );
};

// Segédkomponens a tisztább kódért
const SpecItem = ({ icon, label, value, color }: any) => (
    <div className="flex flex-col gap-2 group cursor-default">
        <div className="flex items-center gap-2 text-slate-400 group-hover:text-white transition-colors">
            {icon}
            <span className="text-[10px] font-mono uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-sm font-bold text-white">{value}</span>
        <div className="h-0.5 w-full bg-slate-800 rounded overflow-hidden">
            <div className={`h-full w-3/4 ${color}/50 group-hover:${color} transition-all duration-500`} />
        </div>
    </div>
);