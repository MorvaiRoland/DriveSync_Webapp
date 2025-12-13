'use client';

import React, { useState, useEffect } from 'react';
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full min-h-screen"
        >
          {children}
        </motion.div>
      )}
    </>
  );
};