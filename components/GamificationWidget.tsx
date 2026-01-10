'use client';

import React from 'react';
import { Trophy } from 'lucide-react';

// 1. DEFINIÁLJUK, HOGY NÉZ KI EGY JELVÉNY
export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  achieved: boolean;
  progress: string;
}

// 2. DEFINIÁLJUK, MIT FOGAD A KOMPONENS (A PROPS-OT)
interface GamificationWidgetProps {
  badges: Badge[]; // Ez a sor szünteti meg a piros aláhúzást a page.tsx-ben!
}

export default function GamificationWidget({ badges }: GamificationWidgetProps) {
  // Megszámoljuk, hányat szereztél meg
  const achievedCount = badges.filter(b => b.achieved).length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/50 overflow-hidden relative">
      {/* Fejléc */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md flex justify-between items-center">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Eredmények
        </h3>
        <span className="text-xs font-bold px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">
          {achievedCount} / {badges.length}
        </span>
      </div>

      {/* Progress Bar (Csík) */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000"
          style={{ width: `${(achievedCount / Math.max(badges.length, 1)) * 100}%` }}
        ></div>
      </div>

      {/* Jelvények listája */}
      <div className="p-5">
        {badges.length === 0 ? (
          <div className="text-center py-4 text-slate-400 text-sm italic">
            Nincs elérhető eredmény.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {badges.map((badge) => (
              <div 
                key={badge.id} 
                className={`flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300 ${
                  badge.achieved 
                    ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' 
                    : 'bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                }`}
              >
                {/* Ikon */}
                <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl text-2xl shadow-sm border ${
                    badge.achieved
                    ? 'bg-white dark:bg-slate-800 border-amber-100 dark:border-amber-700'
                    : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                }`}>
                  {badge.icon}
                </div>

                {/* Szöveg */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className={`text-sm font-bold truncate ${badge.achieved ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      {badge.name}
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {badge.progress}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}