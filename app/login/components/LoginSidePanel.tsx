'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Cpu, Zap, Shield, Globe, Activity } from 'lucide-react';

export const LoginSidePanel = () => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950 font-sans">
        
        {/* VIDEO BACKGROUND WITH BETTER GRadients */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-slate-950/80 z-10" /> 
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-primary/5 to-slate-900 z-10" />
            <video autoPlay loop muted playsInline className="w-full h-full object-cover scale-110 blur-[2px] opacity-40 grayscale">
                <source src="/login.mp4" type="video/mp4" />
            </video>
        </div>
        
        {/* OVERLAYS */}
        <div className="absolute inset-0 z-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />

        {/* LOGO AREA */}
        <div className="relative z-30 p-16 pt-20">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}
              className="flex items-center gap-6 mb-12"
            >
                 <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-3xl border-2 border-primary/30 border-t-primary animate-spin-slow shadow-[0_0_20px_rgba(6,182,212,0.3)]" />
                    <Image src="/DynamicSense-logo.png" alt="Logo" fill className="object-contain p-3" priority />
                 </div>
                 <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Dynamic<span className="text-gradient-ocean">Sense</span>
                    </h1>
                    <div className="text-[11px] text-primary/80 font-black uppercase tracking-[0.5em] mt-2 ml-1">
                        Absolute Performance
                    </div>
                 </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }} className="max-w-xl">
                <h2 className="text-7xl font-black text-white mb-8 leading-[0.9] tracking-tighter uppercase italic">
                   AZ IRÁNYÍTÁS <br/>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">ÚJ DIMENZIÓJA.</span>
                </h2>
                <div className="border-l-4 border-primary pl-8 py-2 bg-primary/5 rounded-r-3xl">
                    <p className="text-xl text-slate-300 font-bold leading-relaxed italic uppercase tracking-tight">
                        Lépj be a járműved digitális idegközpontjába. <br/>
                        <span className="text-white">Prediktív analitika és AI vezérelt diagnosztika.</span>
                    </p>
                </div>
            </motion.div>
        </div>

        {/* BOTTOM STATS - Bento Style */}
        <div className="relative z-30 p-16 pb-20">
            <motion.div 
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
                className="grid grid-cols-3 gap-6 pt-12 border-t border-white/10"
            >
                <SpecItem icon={<Activity size={18} />} label="AI Core" value="Apex v2" color="bg-primary" />
                <SpecItem icon={<Shield size={18} />} label="Security" value="Quantum" color="bg-blue-600" />
                <SpecItem icon={<Globe size={18} />} label="Network" value="Edge" color="bg-emerald-500" />
            </motion.div>
        </div>
    </div>
  );
};

const SpecItem = ({ icon, label, value, color }: any) => (
    <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 group hover:border-primary/50 transition-all duration-500 cursor-default">
        <div className="flex items-center gap-3 text-slate-400 group-hover:text-primary transition-colors mb-3">
            {icon}
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-2xl font-black text-white tracking-tighter uppercase italic">{value}</span>
        <div className="h-1 w-full bg-slate-800 rounded-full mt-4 overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }} animate={{ width: "70%" }} 
              className={`h-full ${color} shadow-[0_0_15px_currentColor] group-hover:w-full transition-all duration-1000`} 
            />
        </div>
    </div>
);