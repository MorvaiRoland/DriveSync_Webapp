'use client';

import React, { useState } from 'react';
import { IntroLoader } from './IntroLoader'; // Feltételezem, hogy az előzőleg megírt "fullos" loadered használod
import { motion, AnimatePresence } from 'framer-motion';

export const LoginClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
           <IntroLoader onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {!isLoading && (
        <motion.div
          // Kezdeti állapot: kicsit nagyítva és homályosan
          initial={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          // Végállapot: élesen, normál méretben
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          // Nagyon finom, "cinematic" lassú átmenet
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }} 
          className="w-full min-h-screen"
        >
          {children}
        </motion.div>
      )}
    </>
  );
};