'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Cpu, Shield, Globe, Activity, Terminal, Zap } from 'lucide-react';

export const LoginSidePanel = () => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950 font-sans">
        
        {/* DINAMIKUS VIDEÓ HÁTTÉR ÉS GRADiensek */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-slate-950/80 z-10" /> 
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-primary/10 to-slate-900 z-10" />
            <video autoPlay loop muted playsInline className="w-full h-full object-cover scale-110 blur-[1px] opacity-40 grayscale">
                <source src="/login.mp4" type="video/mp4" />
            </video>
        </div>
        
        {/* RENDSZER-SZINTŰ OVERLAY-EK */}
        <div className="absolute inset-0 z-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent z-20 animate-pulse" />

        {/* LOGO ÉS BRANDING AREA */}
        <div className="relative z-30 p-16 pt-24">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex items-center gap-6 mb-16"
            >
                 <div className="relative w-20 h-20">
                    {/* Forgó neon gyűrűk */}
                    <div className="absolute inset-0 rounded-[2rem] border-2 border-primary/20 border-t-primary animate-spin-slow shadow-[0_0_30px_rgba(6,182,212,0.3)]" />
                    <div className="absolute inset-2 rounded-[1.5rem] border border-blue-500/20 border-b-blue-500 animate-reverse-spin" />
                    <Image src="/DynamicSense-logo.png" alt="Logo" fill className="object-contain p-4 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]" priority />
                 </div>
                 <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Dynamic<span className="text-primary drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">Sense</span>
                    </h1>
                    <div className="text-[10px] text-primary/70 font-black uppercase tracking-[0.6em] mt-2 ml-1">
                        Abszolút Teljesítmény
                    </div>
                 </div>
            </motion.div>

            {/* FŐ CÍMSOR ÉS LEÍRÁS */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 1, delay: 0.3 }} 
                className="max-w-xl"
            >
                <h2 className="text-7xl font-black text-white mb-8 leading-[0.85] tracking-tighter uppercase italic">
                   AZ IRÁNYÍTÁS <br/>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-emerald-400">ÚJ DIMENZIÓJA.</span>
                </h2>
                
                <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-transparent rounded-full" />
                    <div className="pl-8 py-2 bg-white/5 backdrop-blur-sm rounded-r-3xl border border-white/5 shadow-2xl">
                        <p className="text-xl text-slate-300 font-bold leading-relaxed italic uppercase tracking-tight">
                            Lépj be a járműved digitális idegközpontjába. <br/>
                            <span className="text-white">Prediktív analitika és mesterséges intelligencia.</span>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>

        {/* ALSÓ TECHNIKAI SPECIFIKÁCIÓK - Bento Boxok */}
        <div className="relative z-30 p-16 pb-20">
            <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, delay: 0.6 }}
                className="grid grid-cols-3 gap-6 pt-12 border-t border-white/10"
            >
                <SpecItem 
                    icon={<Activity size={18} />} 
                    label="AI Mag" 
                    value="Gemini 2.5 Flash" 
                    color="bg-primary" 
                    progress={92}
                />
                <SpecItem 
                    icon={<Shield size={18} />} 
                    label="Biztonság" 
                    value="AES-256 Titkosítás" 
                    color="bg-blue-600" 
                    progress={100}
                />
                <SpecItem 
    icon={<Activity size={18} />} 
    label="Telemetria" 
    value="Valós idejű" 
    color="bg-emerald-500" 
    progress={100}
/>
            </motion.div>
            
            {/* Rendszer állapot indikátor */}
            <div className="mt-10 flex items-center gap-3 opacity-30 group cursor-default">
                <Terminal size={14} className="text-primary" />
                <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-slate-400 group-hover:text-primary transition-colors">
                    Rendszer állapot: Üzemkész // Titkosítás aktív
                </span>
            </div>
        </div>
    </div>
  );
};

const SpecItem = ({ icon, label, value, color, progress }: any) => (
    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 group hover:border-primary/40 transition-all duration-700 cursor-default shadow-2xl">
        <div className="flex items-center gap-3 text-slate-400 group-hover:text-primary transition-colors mb-4">
            <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-primary/10 transition-colors">
                {icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{label}</span>
        </div>
        
        <span className="text-2xl font-black text-white tracking-tighter uppercase italic block mb-4">
            {value}
        </span>
        
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }} 
              animate={{ width: `${progress}%` }} 
              transition={{ duration: 1.5, delay: 1, ease: "circOut" }}
              className={`h-full ${color} shadow-[0_0_15px_currentColor] group-hover:brightness-125 transition-all duration-700`} 
            />
        </div>
    </div>
);