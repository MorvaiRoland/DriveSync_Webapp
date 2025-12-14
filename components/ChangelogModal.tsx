'use client'

import { useState, useEffect } from 'react'
import { X, ArrowRight, Zap } from 'lucide-react'

const CURRENT_VERSION = '2.2.0'; // Verzió emelés
const RELEASE_DATE = '2025. December 14.';

// 1. Új funkciók listája (Az elmúlt beszélgetéseink alapján)
const features = [
  {
    emoji: '🏷️', 
    title: 'Piactér & Publikus Megosztás',
    desc: 'Eladnád az autód? Egy kattintással generálj biztonságos, megosztható linket! Te döntöd el, hogy a rendszám vagy a szervizköltségek látszódjanak-e a vevők számára.',
  },
  
  {
    emoji: '⚙️', 
    title: 'Részletesebb Autóprofilok',
    desc: 'Kibővítettük az adatlapokat: mostantól rögzítheted a kivitelt (sedan, kombi...), a váltó típusát, a motor adatait és a felszereltséget is a pontosabb nyilvántartásért.',
  },
];

// 2. Jövőbeli fejlesztések
const upcoming = [
  { 
    emoji: '📅', 
    title: 'Szerviz Időpontfoglalás', 
    desc: 'Hamarosan közvetlenül az appból foglalhatsz időpontot a partnerműhelyekbe.' 
  }
];

export default function ChangelogModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Ellenőrizzük a tárolt verziót
    const lastSeenVersion = localStorage.getItem('DynamicSense_version');
    
    // Ha a verzió nem egyezik, vagy nincs mentve, megjelenítjük
    if (lastSeenVersion !== CURRENT_VERSION) {
      const timer = setTimeout(() => setIsOpen(true), 1000); // Kis késleltetés a drámai hatásért
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Elmentjük, hogy ezt a verziót már látta a user
    localStorage.setItem('DynamicSense_version', CURRENT_VERSION);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-500">
      {/* Sötétített háttér */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-all" onClick={handleClose}></div>
      
      {/* Modal Ablak */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        
        {/* Fejléc - ÚJ DESIGN (Business/Garage téma) */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black p-8 text-white relative overflow-hidden shrink-0">
            {/* Háttér effektek */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 text-emerald-300 shadow-lg">
                        <Zap className="w-3 h-3 fill-current" /> v{CURRENT_VERSION}
                    </div>
                    <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <h2 className="text-3xl font-black tracking-tight mb-2 leading-tight">
                    A Garázsod <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Szintet Lépett.</span>
                </h2>
                <p className="text-slate-400 text-sm font-medium">Publikus adatlapok, Gumiabroncs Hotel és precízebb nyilvántartás.</p>
            </div>
        </div>

        {/* Tartalom */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
            
            {/* Feature Lista */}
            <div className="space-y-6">
                {features.map((item, idx) => (
                    <div key={idx} className="flex gap-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                            {item.emoji}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Coming Soon */}
            {upcoming.length > 0 && (
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="bg-white dark:bg-slate-900/80 backdrop-blur rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30 relative">
                      <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Dolgozunk rajta...
                      </h3>
                      {upcoming.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                            <span className="text-xl grayscale opacity-60">{item.emoji}</span>
                            <div>
                                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">{item.title}</h3>
                                <p className="text-xs text-slate-500">{item.desc}</p>
                            </div>
                        </div>
                      ))}
                    </div>
                </div>
            )}
        </div>

        {/* Lábléc */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
            <button 
                onClick={handleClose}
                className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
                Frissítés alkalmazása
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-3 font-mono">
                Build: {RELEASE_DATE.replace(/\./g, '').replace(/ /g, '.')}
            </p>
        </div>

      </div>
    </div>
  )
}