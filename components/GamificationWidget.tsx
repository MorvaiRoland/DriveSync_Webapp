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
      bg-white/60 dark:bg-[#111114]
      border border-white/40 dark:border-white/[0.06]
      shadow-sm dark:shadow-[0_2px_12px_rgba(0,0,0,0.4)]">

      {/* Header */}
      <div className="px-5 py-4 border-b border-white/30 dark:border-white/[0.05] flex justify-between items-center">
        <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest flex items-center gap-2">
          <Trophy className="w-4 h-4 text-orange-400" /> Eredmények
        </h3>
        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/20">
          {achievedCount}/{badges.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-black/5 dark:bg-white/5 relative">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-1000"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Badges */}
      <div className="p-4 space-y-2">
        {badges.length === 0 ? (
          <p className="text-center py-4 text-slate-400 dark:text-white/20 text-sm italic">Nincs elérhető eredmény.</p>
        ) : badges.map((badge) => (
          <div
            key={badge.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
              badge.achieved
                ? 'bg-orange-500/5 border-orange-500/15'
                : 'bg-white/5 dark:bg-white/[0.02] border-white/20 dark:border-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100'
            }`}
          >
            <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl text-xl border ${
              badge.achieved
                ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                : 'bg-black/5 dark:bg-white/5 border-white/20 dark:border-white/10'
            }`}>
              {badge.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <h4 className={`text-xs font-black truncate ${badge.achieved ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-white/40'}`}>
                  {badge.name}
                </h4>
                <span className="text-[10px] font-mono font-black text-slate-400 dark:text-white/30 ml-2 flex-shrink-0">{badge.progress}</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400/80 dark:text-white/30 leading-tight truncate">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}