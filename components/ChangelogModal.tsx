'use client'

import { useState, useEffect } from 'react'

const CURRENT_VERSION = '1.8.0'; // Verzió emelése az AI funkció miatt
const RELEASE_DATE = '2025. December 09.';

// 1. Jelenlegi funkciók listája
const features = [
  {
    emoji: '🤖', // KIEMELT ÚJDONSÁG
    title: 'AI Szerelő Asszisztens',
    desc: 'Beszélgess az adataiddal! A jobb alsó sarokban elérhető mesterséges intelligencia ismeri az autód szervizmúltját és költségeit. Kérdezd meg: "Mikor volt olajcsere?" vagy "Mennyit tankoltam idén?", és azonnal választ kapsz.',
  },
  {
    emoji: '📱', 
    title: 'Mobilbarát Chat',
    desc: 'Az új asszisztens mobilon egy kényelmes, alulról felcsúszó felületen érhető el, így vezetés közben vagy a garázsban állva is könnyen használhatod.',
  },
];

// 2. Jövőbeli fejlesztések
const upcoming = [
  { 
    emoji: '🏷️', 
    title: 'Kereskedői Adatlap 2.0', 
    desc: 'Hamarosan még több sablon közül választhatsz, ha eladásra kínálnád az autódat.' 
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
        
        {/* Fejléc - AI Téma */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-900 p-6 text-white relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-white/10 text-blue-200">
                        v{CURRENT_VERSION} • AI Update 🤖
                    </div>
                    <button onClick={handleClose} className="text-blue-200 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <h2 className="text-2xl font-black">Megérkezett az AI! ✨</h2>
                <p className="text-blue-100 text-sm mt-1">Mostantól saját digitális szerelőd van.</p>
            </div>
        </div>

        {/* Tartalom (Görgethető) */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
            
            {/* Jelenlegi Funkciók Lista */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Újdonságok</h3>
                {features.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl flex-shrink-0 border border-slate-100 dark:border-slate-700 shadow-sm">
                            {item.emoji}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Következő Fejlesztés Doboz */}
            {upcoming.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-800/50 relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-200/30 rounded-full blur-xl"></div>
                      <h3 className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        Hamarosan
                      </h3>
                      {upcoming.map((item, idx) => (
                        <div key={idx} className="flex gap-4 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-800 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                                {item.emoji}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">{item.desc}</p>
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
                className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white font-bold shadow-lg hover:bg-slate-800 dark:hover:bg-blue-500 hover:scale-[1.02] transition-all active:scale-[0.98]"
            >
                Kipróbálom!
            </button>
        </div>

      </div>
    </div>
  )
}