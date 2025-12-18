'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Cpu, Zap, Shield } from 'lucide-react';

export const LoginSidePanel = () => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950 font-sans">
        
        {/* VIDEO BACKGROUND */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-slate-950/70 z-10 mix-blend-multiply" /> 
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 z-10" />
            <video autoPlay loop muted playsInline className="w-full h-full object-cover scale-100 ">
                <source src="/login.mp4" type="video/mp4" />
            </video>
        </div>
        
        {/* OVERLAYS */}
        <div className="absolute inset-0 z-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04]" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent z-20 animate-scanline opacity-40" />

        {/* LOGO AREA */}
        <div className="relative z-30 p-12 pt-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}
              className="flex items-center gap-5 mb-8"
            >
                 <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin-slow" />
                    <div className="absolute inset-2 rounded-full border border-indigo-500/30 border-b-indigo-500 animate-reverse-spin" />
                    <Image src="/DynamicSense-logo.png" alt="Logo" fill className="object-contain p-2.5 drop-shadow-[0_0_25px_rgba(245,158,11,0.4)]" priority />
                 </div>
                 <div>
                    <h1 className="text-4xl font-black text-white tracking-widest uppercase leading-none">
                        Dynamic<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Sense</span>
                    </h1>
                    <div className="text-[10px] text-amber-500/80 font-mono uppercase tracking-[0.35em] mt-1 ml-1">
                        Automotive Intelligence
                    </div>
                 </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} className="max-w-lg">
                <h2 className="text-5xl font-bold text-white mb-6 leading-[1.1]">
                    Az irányítás <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-500">új dimenziója.</span>
                </h2>
                <div className="border-l-2 border-amber-500/50 pl-6 py-1">
                    <p className="text-lg text-slate-300 font-light leading-relaxed">
                        Lépj be a járműved digitális idegközpontjába. Valós idejű adatok, prediktív karbantartás és mesterséges intelligencia egy helyen.
                    </p>
                </div>
            </motion.div>
        </div>

        {/* BOTTOM SPECS */}
        <div className="relative z-30 p-12 pb-16">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.2 }}
                className="grid grid-cols-3 gap-8 border-t border-white/10 pt-8"
            >
                <SpecItem icon={<Cpu size={20} />} label="AI Core" value="Gemini 2.5" color="bg-amber-500" />
                <SpecItem icon={<Shield size={20} />} label="Security" value="AES-256" color="bg-indigo-500" />
                <SpecItem icon={<Zap size={20} />} label="Latency" value="<20ms" color="bg-emerald-500" />
            </motion.div>
        </div>
    </div>
  );
};

const SpecItem = ({ icon, label, value, color }: any) => (
    <div className="flex flex-col gap-2 group cursor-default">
        <div className="flex items-center gap-2 text-slate-400 group-hover:text-white transition-colors">
            {icon}
            <span className="text-[10px] font-mono uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-xl font-bold text-white tracking-tight">{value}</span>
        <div className="h-0.5 w-full bg-slate-800 rounded overflow-hidden">
            <div className={`h-full w-2/3 ${color} shadow-[0_0_10px_currentColor] opacity-70 group-hover:w-full group-hover:opacity-100 transition-all duration-700`} />
        </div>
    </div>
);