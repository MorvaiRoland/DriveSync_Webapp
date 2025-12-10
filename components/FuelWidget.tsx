// components/FuelWidget.tsx
'use client'; // EZ A KULCS! Ez teszi kliens oldalivá.

import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

export default function FuelWidget() {
  const [fuelPrices, setFuelPrices] = useState<any[]>([]); // TypeScript típus javítva
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch('/api/fuel');
        if (!res.ok) throw new Error('Hiba');
        const data = await res.json();
        setFuelPrices(data);
      } catch (error) {
        // Hiba esetén alapértelmezett (fallback) adatok
        setFuelPrices([
            { type: '95', name: 'Benzin', price: 612, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
            { type: 'D', name: 'Gázolaj', price: 618, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-200 dark:bg-slate-700' },
            { type: '100', name: 'Prémium', price: 655, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/20' },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
      {/* Fejléc */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-amber-500 fill-current" />
          Piaci Átlagárak
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">
           {loading ? 'Betöltés...' : 'Ma'}
        </span>
      </div>
      
      {/* Tartalom */}
      <div className="p-4 flex-1 flex flex-col justify-center gap-3">
        {loading ? (
          // Skeleton Loader (Töltés animáció)
          [1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          ))
        ) : (
          // Valódi Adatok
          fuelPrices.map((fuel, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-xs ${fuel.bg} ${fuel.color}`}>
                  {fuel.type}
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">{fuel.name}</span>
              </div>
              <div className="text-right whitespace-nowrap">
                <span className="font-bold text-slate-900 dark:text-white">
                    {fuel.price > 0 ? fuel.price : '-'}
                </span>
                <span className="text-xs font-medium text-slate-400 ml-1">Ft</span>
              </div>
            </div>
          ))
        )}

        {/* Lábléc link */}
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-center">
          <a href="https://holtankoljak.hu" target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-400 hover:text-amber-500 transition-colors">
            Adatok forrása: holtankoljak.hu
          </a>
        </div>
      </div>
    </div>
  );
}