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
    <div className="relative w-full h-[100dvh] bg-[#F5F5F7] dark:bg-[#000000] overflow-hidden select-none transition-colors duration-700">
      
      {/* Aurora Background (Shared across loader and login page) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[min(400px,80vw)] md:w-[800px] h-[min(400px,80vw)] md:h-[800px] bg-indigo-400/20 dark:bg-indigo-600/20 blur-[80px] md:blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[min(400px,80vw)] md:w-[800px] h-[min(400px,80vw)] md:h-[800px] bg-purple-400/20 dark:bg-purple-600/20 blur-[80px] md:blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-[30%] left-[10%] w-[min(300px,70vw)] md:w-[600px] h-[min(300px,70vw)] md:h-[600px] bg-cyan-300/20 dark:bg-cyan-600/20 blur-[80px] md:blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] dark:opacity-[0.06] mix-blend-overlay"></div>
      </div>

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
            <main className="w-full h-full overscroll-none touch-auto">
              {children}
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};