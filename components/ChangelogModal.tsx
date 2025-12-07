'use client'

import { useState, useEffect } from 'react'

const CURRENT_VERSION = '1.3.5'; 
const RELEASE_DATE = '2025. December 07.';

// 1. Jelenlegi funkciók listája (Bővített leírásokkal)
const features = [
  {
    emoji: '🌗', 
    title: 'Sötét & Világos Téma',
    desc: 'ÚJ! Kíméld a szemed éjszakai vezetésnél! Válts egy kattintással sötét módra, vagy állítsd be, hogy kövesse a telefonod rendszerbeállításait.',
  },
];

// 2. Jövőbeli fejlesztések
const upcoming = [
  {
    emoji: '-',
    title: '',
    desc: '',
  }
];

export default function ChangelogModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem('drivesync_version');
    
    if (lastSeenVersion !== CURRENT_VERSION) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('drivesync_version', CURRENT_VERSION);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 px-4 animate-in fade-in duration-300">
      {/* Sötét háttér */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={handleClose}></div>
      
      {/* Modal Ablak */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Fejléc */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-white/10 text-amber-400">
                        v{CURRENT_VERSION} • Újdonságok
                    </div>
                    <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <h2 className="text-2xl font-black">Üdvözöl a © 2025 DriveSync Technologies! 🚀</h2>
                <p className="text-slate-400 text-sm mt-1">Íme minden, amire az új rendszered képes:</p>
            </div>
        </div>

        {/* Tartalom (Görgethető) */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
            
            {/* Jelenlegi Funkciók Lista */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Elérhető Funkciók</h3>
                {features.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl flex-shrink-0 border border-slate-100 shadow-sm">
                            {item.emoji}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Következő Fejlesztés Doboz */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 relative overflow-hidden">
                 <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-200/30 rounded-full blur-xl"></div>
                 <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    Következő Fejlesztés
                 </h3>
                 {upcoming.map((item, idx) => (
                    <div key={idx} className="flex gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                            {item.emoji}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

        </div>

        {/* Lábléc Gomb */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
            <button 
                onClick={handleClose}
                className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 hover:scale-[1.02] transition-all active:scale-[0.98]"
            >
                Király, használom!
            </button>
        </div>

      </div>
    </div>
  )
}