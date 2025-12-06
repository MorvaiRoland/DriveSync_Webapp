'use client'

import { useState, useEffect } from 'react'

// 1. ITT ÁLLÍTSD BE AZ ÚJ VERZIÓT ÉS A DÁTUMOT
const CURRENT_VERSION = '1.0.0 (Béta)'; 
const RELEASE_DATE = '2025. December 06.';

// 2. ITT ÍRD BE A VÁLTOZÁSOKAT
const changes = [
  {
    emoji: '🛞',
    title: 'Gumiabroncs Hotel',
    desc: 'Mostantól külön kezelheted a téli és nyári szetteket. A rendszer csak a felszerelt gumikba teszi a kilométert.',
  },
  {
    emoji: '🧠',
    title: 'Smart Szerviz Kalkulátor',
    desc: 'Intelligens visszaszámláló: ha nincs előzmény, a kilométeróra állásából számolja ki a következő karbantartást.',
  },
  {
    emoji: '📊',
    title: 'Pénzügyi Elemzés',
    desc: 'Új grafikonok a dashboardon: kövesd nyomon az üzemanyag és szerviz költségeket havi bontásban.',
  },
  {
    emoji: '📂',
    title: 'Digitális Kesztyűtartó -- Hamarosan!!',
    desc: 'Mentsd el a forgalmi, biztosítás és zöldkártya adatait, hogy mindig kéznél legyenek.',
  }
];

export default function ChangelogModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Ellenőrizzük, hogy a felhasználó látta-e már ezt a verziót
    const lastSeenVersion = localStorage.getItem('drivesync_version');
    
    if (lastSeenVersion !== CURRENT_VERSION) {
      // Ha nem egyezik (új verzió van), nyissuk meg kis késleltetéssel
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Elmentjük, hogy ezt a verziót már látta
    localStorage.setItem('drivesync_version', CURRENT_VERSION);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 px-4 animate-in fade-in duration-300">
      {/* Sötét háttér */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={handleClose}></div>
      
      {/* Modal Ablak */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Fejléc Képpel/Gradienssel */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-white/10 text-amber-400">
                    v{CURRENT_VERSION} • Újdonságok
                </div>
                <h2 className="text-2xl font-black">Frissült a DriveSync! 🚀</h2>
                <p className="text-slate-400 text-sm mt-1">{RELEASE_DATE}</p>
            </div>
        </div>

        {/* Lista (Görgethető) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {changes.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl flex-shrink-0 border border-slate-100">
                        {item.emoji}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">{item.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                </div>
            ))}
        </div>

        {/* Lábléc Gombbal */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
            <button 
                onClick={handleClose}
                className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 hover:scale-[1.02] transition-all active:scale-[0.98]"
            >
                Rendben, szuper!
            </button>
        </div>

      </div>
    </div>
  )
}