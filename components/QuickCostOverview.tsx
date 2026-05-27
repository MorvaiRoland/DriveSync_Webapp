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
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 hover:shadow-xl transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Költségek (utolsó 30 nap)</p>
            <p className="text-3xl font-light text-zinc-100 mt-2 tracking-tight"><span className="font-bold text-white">{spentLast30Days.toLocaleString()}</span> Ft</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform border border-zinc-800">
            <DollarSign className="text-amber-500" size={24} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {spendingTrend > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-red-500" />
                <span className="text-sm font-bold text-red-500">{spendingTrend}% nőtt az előző 30 naphoz képest</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-emerald-500">{Math.abs(spendingTrend)}% csökkent az előző 30 naphoz képest</span>
              </>
            )}
          </div>
          <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
        </div>

        <p className="text-xs text-zinc-500 mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <span>Teljes költség: <span className="font-bold text-zinc-300">{totalSpent.toLocaleString()} Ft</span></span>
          <span className="uppercase tracking-widest font-bold">Részletek →</span>
        </p>
      </div>
    </Link>
  )
}
