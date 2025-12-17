'use client';

import React, { useState } from 'react';
import { IntroLoader } from './IntroLoader';
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
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Custom bezier a "snappy" érzethez
          className="w-full min-h-screen"
        >
          {children}
        </motion.div>
      )}
    </>
  );
};