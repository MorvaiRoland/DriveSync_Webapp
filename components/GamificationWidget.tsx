'use client'

import React from 'react'
import { Trophy } from 'lucide-react'

export interface Badge {
  id: string
  name: string
  icon: string
  description: string
  achieved: boolean
  progress: string
}

interface GamificationWidgetProps {
  badges: Badge[]
}

export default function GamificationWidget({ badges }: GamificationWidgetProps) {
  const achievedCount = badges.filter(b => b.achieved).length
  const percent = Math.round((achievedCount / Math.max(badges.length, 1)) * 100)

  return (
    <div className="rounded-2xl overflow-hidden
      bg-white/60 dark:bg-white/5
      border border-white/60 dark:border-white/10
      backdrop-blur-xl shadow-sm">

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100/60 dark:border-white/10 flex justify-between items-center">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" /> Eredmények
        </h3>
        <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-500/30">
          {achievedCount}/{badges.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-100 dark:bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-1000"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Badges */}
      <div className="p-4 space-y-2">
        {badges.length === 0 ? (
          <p className="text-center py-4 text-slate-400 dark:text-slate-500 text-sm italic">Nincs elérhető eredmény.</p>
        ) : badges.map((badge) => (
          <div
            key={badge.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
              badge.achieved
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50'
                : 'bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100'
            }`}
          >
            <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl text-xl border ${
              badge.achieved
                ? 'bg-white dark:bg-amber-950/50 border-amber-200 dark:border-amber-900/50'
                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10'
            }`}>
              {badge.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <h4 className={`text-xs font-bold truncate ${badge.achieved ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  {badge.name}
                </h4>
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 ml-2 flex-shrink-0">{badge.progress}</span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight truncate">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}