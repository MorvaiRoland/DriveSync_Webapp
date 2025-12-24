'use client';

import React, { useState } from 'react';
import { IntroLoader } from './IntroLoader'; // Feltételezem ez megvan
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

      {/* Nem rendereljük a children-t amíg tölt, 
         hogy ne villanjon be a tartalom a loader alatt.
      */}
      {!isLoading && (
        <motion.main
          initial={{ opacity: 0, scale: 1.02, filter: "blur(12px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }} 
          className="w-full h-[100dvh] overflow-hidden touch-none"
        >
          {children}
        </motion.main>
      )}
    </>
  );
};