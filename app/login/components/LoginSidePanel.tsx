// app/login/components/LoginSidePanel.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Zap } from 'lucide-react';

const AnimatedGrid = () => (
  <div className="absolute inset-0 z-0 opacity-20 transform perspective-1000 rotate-x-60 scale-150">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
  </div>
);

export const LoginSidePanel = () => {
  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center overflow-hidden">
        {/* --- Background Effects --- */}
        <div className="absolute inset-0 bg-slate-900 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay z-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 z-10"></div>
        
        {/* Grid Animation */}
        <AnimatedGrid />

        {/* Glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none z-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none z-10"></div>

        {/* --- Content --- */}
        <div className="relative z-20 flex flex-col items-center text-center px-12 max-w-2xl">
           
           {/* Floating Logo */}
           <motion.div 
             initial={{ y: 0 }}
             animate={{ y: [0, -15, 0] }}
             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
             className="relative w-64 h-64 mb-8"
           >
             <div className="absolute inset-0 bg-amber-500/20 blur-[60px] rounded-full animate-pulse"></div>
             <Image src="/DynamicSense-logo.png" alt="DynamicSense Logo" fill className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" priority />
           </motion.div>

           {/* Brand Text */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.2 }}
           >
             <h1 className="text-6xl font-black text-white tracking-tight mb-6 drop-shadow-2xl">
               Dynamic<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">Sense</span>
             </h1>
             <p className="text-xl text-slate-400 leading-relaxed font-light mb-8">
               <span className="text-slate-200 font-medium">Az autód digitális agya.</span> <br/>
               Szervizkönyv, költségkövetés és AI diagnosztika egy helyen.
             </p>
           </motion.div>

           {/* Trust Badges / Mini Features */}
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1, delay: 0.6 }}
             className="flex gap-6 mt-4"
           >
              <div className="flex flex-col items-center gap-2 group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-center text-amber-500 group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-all">
                      <Zap size={20} />
                  </div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">AI Powered</span>
              </div>
              <div className="flex flex-col items-center gap-2 group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all">
                      <ShieldCheck size={20} />
                  </div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Biztonságos</span>
              </div>
           </motion.div>
        </div>

        {/* Testimonial Card (Bottom Left) */}
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="absolute bottom-12 left-12 max-w-sm z-20 hidden xl:block"
        >
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-2xl relative">
                <div className="flex gap-1 text-amber-500 mb-2">
                    {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-sm text-slate-300 italic mb-4">"Végre nem a kesztyűtartóban kell keresgélnem a szervizszámlákat. Az AI szerelő funkció pedig zseniális!"</p>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                        GP
                    </div>
                    <div>
                        <div className="text-xs font-bold text-white">G. Péter</div>
                        <div className="text-[10px] text-slate-500">BMW 320d tulajdonos</div>
                    </div>
                </div>
            </div>
        </motion.div>

        <div className="absolute bottom-6 text-[10px] text-slate-600 font-mono z-20">
            © 2025 DynamicSense Technologies • V2.1.0
        </div>
    </div>
  );
};