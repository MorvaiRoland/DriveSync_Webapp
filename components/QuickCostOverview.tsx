'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, ArrowRight, DollarSign } from 'lucide-react'

interface QuickCostOverviewProps {
  spentLast30Days: number
  spendingTrend: number
  totalSpent: number
}

export default function QuickCostOverview({ spentLast30Days, spendingTrend, totalSpent }: QuickCostOverviewProps) {
  return (
    <Link href="/analytics" className="group">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-amber-200 dark:border-amber-900/40 hover:shadow-lg transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Költségek (utolsó 30 nap)</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{spentLast30Days.toLocaleString()} Ft</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <DollarSign className="text-white" size={24} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {spendingTrend > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-red-500" />
                <span className="text-sm font-bold text-red-600 dark:text-red-400">{spendingTrend}% nőtt az előző 30 naphoz képest</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{Math.abs(spendingTrend)}% csökkent az előző 30 naphoz képest</span>
              </>
            )}
          </div>
          <ArrowRight className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform" />
        </div>

        <p className="text-xs text-amber-700 dark:text-amber-400 mt-4 pt-4 border-t border-amber-200 dark:border-amber-900/40">
          Teljes költség: {totalSpent.toLocaleString()} Ft • Kattints a részletes analitikáért →
        </p>
      </div>
    </Link>
  )
}
