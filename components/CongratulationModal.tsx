'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Zap } from 'lucide-react';
import Confetti from 'react-confetti';
import { useSearchParams } from 'next/navigation';

interface CongratulationModalProps {
  currentPlan?: string; // Pl: 'free', 'pro', 'lifetime'
}

export default function CongratulationModal({ currentPlan }: CongratulationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const searchParams = useSearchParams();

  useEffect(() => {
    // Képernyőméret beállítása a konfettihez
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    // 1. ESET: URL paraméter alapú ellenőrzés (Stripe után)
    const isCheckoutSuccess = searchParams.get('checkout_success') === 'true';

    // 2. ESET: Admin oldali váltás figyelése (LocalStorage alapú)
    // Megnézzük, mi volt a legutóbb ismert csomagja a böngésző szerint
    const lastKnownPlan = localStorage.getItem('dynamicsense_user_plan');
    
    // Logika: Ha volt mentett "free" csomagja, DE most már "pro" vagy "lifetime" van,
    // ÉS ez nem ugyanaz, mint amit eddig tudtunk -> Gratulálunk!
    const isUpgradeDetected = 
        lastKnownPlan && 
        (lastKnownPlan === 'free' || lastKnownPlan === 'starter') && 
        (currentPlan === 'pro' || currentPlan === 'lifetime' || currentPlan === 'founder');

    if (isCheckoutSuccess || isUpgradeDetected) {
      setIsOpen(true);
      
      // URL takarítása (ha van paraméter)
      if (isCheckoutSuccess) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }

    // Mindig elmentjük a JELENLEGI állapotot a jövőbeli összehasonlításhoz.
    // Ha most 'free', akkor legközelebb ha 'pro' lesz, tudni fogjuk, hogy váltás történt.
    if (currentPlan) {
      localStorage.setItem('dynamicsense_user_plan', currentPlan);
    }

  }, [searchParams, currentPlan]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Confetti Effect */}
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={800} // Több konfetti a drámai hatáshoz
          gravity={0.15}
        />

        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-8 shadow-2xl overflow-hidden"
        >
          {/* Background Glows */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>

          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-20"
          >
            <X size={20} />
          </button>

          <div className="relative z-10 flex flex-col items-center text-center">
            
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.6)] mb-6 ring-4 ring-slate-900"
            >
              <Star className="w-12 h-12 text-white fill-white" />
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-black text-white mb-2"
            >
              Gratulálunk!
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl px-4 py-2 mb-6"
            >
              <span className="text-amber-400 font-bold tracking-wide uppercase text-sm flex items-center gap-2">
                <Zap size={16} className="fill-amber-400" /> Prémium Státusz Aktiválva
              </span>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-slate-400 mb-8 leading-relaxed"
            >
              A fiókod sikeresen frissült! Mostantól korlátlan hozzáférésed van a garázsodhoz, az AI szerelőhöz és minden Pro funkcióhoz.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={() => setIsOpen(false)}
              className="w-full bg-white text-slate-950 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors shadow-lg shadow-white/10 active:scale-95"
            >
              Kezdjük el! 🚀
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}