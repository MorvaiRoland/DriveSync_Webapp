'use client'

import { useState } from 'react'

type Badge = {
  id: string
  name: string
  icon: string
  description: string
  earned: boolean
  color: string // Tailwind class, pl. 'from-green-400 to-green-600'
}

export default function GamificationWidget({ badges }: { badges: Badge[] }) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)

  // Számoljuk ki, hányat szerzett meg
  const earnedCount = badges.filter(b => b.earned).length
  const progress = Math.round((earnedCount / badges.length) * 100)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
      {/* Fejléc */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span className="text-xl">🏆</span>
          Eredmények
        </h3>
        <span className="text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">
          {earnedCount} / {badges.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-slate-100 dark:bg-slate-700">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-1000" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Badge Grid */}
      <div className="p-5">
        <div className="flex justify-between gap-2">
          {badges.map((badge) => (
            <div 
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`relative group cursor-pointer flex-1 aspect-square rounded-xl flex items-center justify-center text-3xl transition-all duration-300 border-2 
                ${badge.earned 
                  ? 'bg-gradient-to-br border-transparent shadow-lg scale-100 ' + badge.color 
                  : 'bg-slate-50 dark:bg-slate-900 border-dashed border-slate-300 dark:border-slate-700 grayscale opacity-50 hover:opacity-75 hover:scale-105'
                }`}
            >
              <span className="drop-shadow-md filter">{badge.icon}</span>
              
              {/* Ha megszerezte, kis pipa a sarokban */}
              {badge.earned && (
                <div className="absolute -top-2 -right-2 bg-white text-green-500 rounded-full p-0.5 shadow-sm border border-slate-100">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info Box (ha rákattint egyre) */}
        <div className="mt-4 min-h-[60px] text-center animate-in fade-in duration-300">
          {selectedBadge ? (
            <div>
              <p className={`text-sm font-bold ${selectedBadge.earned ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                {selectedBadge.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {selectedBadge.description}
              </p>
              {!selectedBadge.earned && (
                <p className="text-[10px] text-amber-500 font-bold uppercase mt-2 tracking-wider">Még nem szerezted meg</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic pt-2">Kattints egy ikonra a részletekért!</p>
          )}
        </div>
      </div>
    </div>
  )
}