'use client'

import { useState, useEffect } from 'react'

const CURRENT_VERSION = '2.1.0'; // Új verzió
const RELEASE_DATE = '2025. December 13.';

// 1. Jelenlegi funkciók listája (Újdonságok)
const features = [
  {
    emoji: '📸', // Kiemelt új feature
    title: 'AI Látás & Képfelismerés',
    desc: 'Mostantól a szemed is lehetünk! Fotózd le a műszerfal hibajelzését vagy egy sérülést, és az AI Szerelő azonnal elemzi a képet, megmondja a hiba okát és a teendőket.',
  },
  {
    emoji: '🔮', // Prediktív karbantartás
    title: 'Prediktív Hiba-előrejelzés',
    desc: 'Ne érjen meglepetés! Az autód típusa, motorja és futásteljesítménye alapján megmondjuk, milyen típushibákra számíthatsz hamarosan, és mennyibe kerülhet a javítás.',
  },
  {
    emoji: '⚡', // Elektromos autók
    title: 'E-Drive Támogatás',
    desc: 'Teljeskörű támogatás elektromos autókhoz: Olajcsere helyett akkumulátor állapot (SOH) becslés, töltési napló és specifikus karbantartási emlékeztetők.',
  },
];

// 2. Jövőbeli fejlesztések
const upcoming = [
  { 
    emoji: '🎤', 
    title: 'Hangvezérlés', 
    desc: 'Hamarosan elég lesz bemondanod: "Tankoltam 40 litert", és mi rögzítjük helyetted.' 
  }
];

export default function ChangelogModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem('drivesync_version');
    
    // Ha a verzió nem egyezik, megjelenítjük a modalt
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
        
        {/* Fejléc - Új Téma (Lila/Indigo az AI miatt) */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 p-6 text-white relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/30 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-white/10 text-indigo-100">
                        v{CURRENT_VERSION} • Vision Update 👁️
                    </div>
                    <button onClick={handleClose} className="text-indigo-200 hover:text-white transition-colors p-1 bg-white/10 rounded-full hover:bg-white/20">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <h2 className="text-2xl font-black tracking-tight">Az autód mostantól lát.</h2>
                <p className="text-indigo-100 text-sm mt-1 opacity-90">AI képfelismerés, elektromos autók és jövőbelátó karbantartás.</p>
            </div>
        </div>

        {/* Tartalom (Görgethető) */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
            
            {/* Újdonságok Lista */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    Újdonságok
                </h3>
                {features.map((item, idx) => (
                    <div key={idx} className="flex gap-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-2xl flex-shrink-0 border border-indigo-100 dark:border-indigo-800/50 shadow-sm group-hover:scale-110 transition-transform duration-300">
                            {item.emoji}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.title}</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Következő Fejlesztés Doboz */}
            {upcoming.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50 relative overflow-hidden">
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-200/50 dark:bg-slate-700/30 rounded-full blur-xl"></div>
                      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
                        </span>
                        Dolgozunk rajta...
                      </h3>
                      {upcoming.map((item, idx) => (
                        <div key={idx} className="flex gap-3 relative z-10 items-center">
                            <span className="text-xl grayscale opacity-70">{item.emoji}</span>
                            <div>
                                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-xs">{item.title}</h3>
                                <p className="text-[10px] text-slate-500 dark:text-slate-500 leading-tight mt-0.5">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>

        {/* Lábléc Gomb */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
            <button 
                onClick={handleClose}
                className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-bold shadow-lg hover:bg-slate-800 dark:hover:bg-indigo-500 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
                Frissítés alkalmazása 🚀
            </button>
        </div>

      </div>
    </div>
  )
}