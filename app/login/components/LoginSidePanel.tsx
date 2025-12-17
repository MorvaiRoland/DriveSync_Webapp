'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Star, ShieldCheck, Zap, Server, Activity } from 'lucide-react';

// --- 3D TILT CARD COMPONENT ---
// Ez a kártya követi az egeret
const TiltCard = ({ children }: { children: React.ReactNode }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative w-full max-w-lg cursor-default"
    >
      {children}
    </motion.div>
  );
};

// --- ANIMATED GRID BACKGROUND ---
const AnimatedGrid = () => (
  <div className="absolute inset-0 z-0 opacity-20 transform perspective-1000 rotate-x-60 scale-150 pointer-events-none">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] animate-pan-grid"></div>
  </div>
);

export const LoginSidePanel = () => {
  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center overflow-hidden bg-slate-950 perspective-[2000px]">
        {/* --- Background Layers --- */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 z-0"></div>
        
        {/* Grid Animation */}
        <AnimatedGrid />

        {/* Ambient Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none z-0"></div>

        {/* --- MAIN CONTENT (3D TILT) --- */}
        <TiltCard>
            <div className="relative bg-slate-900/40 backdrop-blur-md border border-white/5 p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] transform-gpu group">
                
                {/* Glass Reflection Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-3xl pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Content Wrapper */}
                <div className="relative z-20 flex flex-col items-center text-center">
                    
                    {/* Floating Logo Container */}
                    <motion.div 
                      initial={{ y: 0 }}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="relative w-48 h-48 mb-6"
                    >
                      <div className="absolute inset-0 bg-amber-500/10 blur-[50px] rounded-full animate-pulse"></div>
                      <Image src="/DynamicSense-logo.png" alt="DynamicSense Logo" fill className="object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]" priority />
                    </motion.div>

                    {/* Typography */}
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black text-white tracking-tighter">
                            Dynamic<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Sense</span>
                        </h1>
                        <p className="text-lg text-slate-400 font-light max-w-sm mx-auto leading-relaxed">
                            <span className="text-white font-medium">A jövő garázsa.</span><br/>
                            Teljes körű diagnosztika és flotta menedzsment mesterséges intelligenciával.
                        </p>
                    </div>

                    {/* Stats / Tech Badges */}
                    <div className="grid grid-cols-3 gap-4 mt-10 w-full">
                        <div className="bg-slate-800/50 border border-white/5 p-3 rounded-xl flex flex-col items-center gap-1 backdrop-blur-sm hover:bg-slate-800 transition-colors">
                            <Server size={18} className="text-indigo-400" />
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cloud</span>
                        </div>
                        <div className="bg-slate-800/50 border border-white/5 p-3 rounded-xl flex flex-col items-center gap-1 backdrop-blur-sm hover:bg-slate-800 transition-colors">
                            <Zap size={18} className="text-amber-400" />
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">AI Core</span>
                        </div>
                        <div className="bg-slate-800/50 border border-white/5 p-3 rounded-xl flex flex-col items-center gap-1 backdrop-blur-sm hover:bg-slate-800 transition-colors">
                            <ShieldCheck size={18} className="text-emerald-400" />
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Secure</span>
                        </div>
                    </div>
                </div>
            </div>
        </TiltCard>

        {/* --- TESTIMONIAL (Floating below) --- */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute bottom-12 max-w-md w-full px-8 hidden xl:block z-20"
        >
            <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-md border border-white/5 p-4 rounded-full shadow-lg">
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">
                             U{i}
                         </div>
                    ))}
                </div>
                <div className="text-xs text-slate-400">
                    <span className="text-white font-bold">1.200+</span> autótulajdonos már csatlakozott.
                </div>
                <div className="ml-auto flex gap-0.5 text-amber-500">
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                </div>
            </div>
        </motion.div>

        {/* Footer Tech Text */}
        <div className="absolute bottom-6 text-[10px] text-slate-600 font-mono z-20 uppercase tracking-widest opacity-60">
            System Status: Online • Encrypted Connection
        </div>
    </div>
  );
};