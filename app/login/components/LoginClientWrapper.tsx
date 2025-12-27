'use client';

import React, { useState, useEffect } from 'react';
import { IntroLoader } from './IntroLoader';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LoginClientWrapper - A DynamicSense Absolute rendszerindító konténere.
 * Kezeli az IntroLoader állapotát és a bejelentkezési felület beúszását.
 */
export const LoginClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Biztosítjuk, hogy a DOM készen álljon a kliens oldalon
  useEffect(() => {
    // Itt esetleg lehetne egy gyors ellenőrzés, ha már be van lépve a user
  }, []);

  return (
    <div className="relative w-full h-[100dvh] bg-slate-950 overflow-hidden select-none">
      
      {/* GLOBÁLIS RENDSZER-EFFEKTEK (Scanlines & Noise) */}
      <div className="fixed inset-0 pointer-events-none z-[60] opacity-[0.03] mix-blend-overlay">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>
      <div className="fixed inset-0 pointer-events-none z-[60] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,4px_100%]" />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader-layer"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }
            }}
            className="fixed inset-0 z-[100]"
          >
            <IntroLoader onComplete={() => setIsLoading(false)} />
          </motion.div>
        ) : (
          <motion.div
            key="content-layer"
            initial={{ 
              opacity: 0, 
              scale: 1.05, 
              filter: "blur(20px)",
              y: 10
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              filter: "blur(0px)",
              y: 0 
            }}
            transition={{ 
              duration: 1.2, 
              ease: [0.22, 1, 0.36, 1], // Custom Bezier a prémium mozgáshoz
              delay: 0.1 
            }}
            className="w-full h-full relative z-50 touch-none"
          >
            <main className="w-full h-full overscroll-none touch-none">
              {children}
            </main>

            {/* FINOM VIGNETTE EFFEKT A TARTALOM FÖLÖTT */}
            <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.4)_100%)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDSZER-SZINTŰ HÁTTÉR (Mindig ott van a háttérben) */}
      <div className="fixed inset-0 z-0 bg-slate-950">
        <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
};