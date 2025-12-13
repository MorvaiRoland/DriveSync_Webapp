'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Wrench, Info, Loader2, RefreshCw } from 'lucide-react'
import { generateCarPrediction } from '@/app/actions/predict' // Importáld a fenti actiont

export default function PredictiveMaintenance({ carId, carName }: { carId: number, carName: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadPrediction = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await generateCarPrediction(carId)
      setData(result)
    } catch (e) {
      setError('Nem sikerült betölteni az előrejelzést.')
    } finally {
      setLoading(false)
    }
  }

  // Opcionális: automatikus betöltés, vagy gombra kattintva
  // useEffect(() => { loadPrediction() }, []) 

  if (!data && !loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 rounded-2xl p-6 border border-indigo-500/30 text-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <span className="text-2xl">🔮</span> Jövőbelátó
            </h3>
            <p className="text-slate-400 text-sm mb-6">
                Az AI elemzi a(z) {carName} típushibáit a jelenlegi kilométer alapján. Megnézzük, mire számíthatsz?
            </p>
            <button 
                onClick={loadPrediction}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-95 flex items-center gap-2 mx-auto"
            >
                <Wrench className="w-4 h-4" /> Elemzés Futtatása
            </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Fejléc */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Várható Karbantartások
        </h3>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
        {!loading && data && (
            <button onClick={loadPrediction} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Frissítés">
                <RefreshCw className="w-4 h-4 text-slate-400" />
            </button>
        )}
      </div>

      {/* Tartalom */}
      <div className="p-5">
        {loading ? (
            <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
            </div>
        ) : error ? (
            <p className="text-red-500 text-sm text-center">{error}</p>
        ) : (
            <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 italic border-l-2 border-indigo-500 pl-3">
                    "{data.summary}"
                </p>

                <div className="space-y-3">
                    {data.issues.map((issue: any, i: number) => (
                        <div key={i} className={`p-4 rounded-xl border flex gap-4 transition-all hover:scale-[1.01] ${
                            issue.urgency === 'critical' 
                                ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' 
                                : issue.urgency === 'warning'
                                ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30'
                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                        }`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                issue.urgency === 'critical' ? 'bg-red-100 text-red-600' : 
                                issue.urgency === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                                {issue.urgency === 'critical' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{issue.part}</h4>
                                    <span className="text-xs font-mono font-bold text-slate-500">{issue.estimated_cost}</span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
                                    {issue.description}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Valószínűség:</span>
                                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden max-w-[100px]">
                                        <div 
                                            className={`h-full rounded-full ${
                                                issue.probability === 'high' ? 'bg-red-500 w-[90%]' : 
                                                issue.probability === 'medium' ? 'bg-amber-500 w-[60%]' : 'bg-emerald-500 w-[30%]'
                                            }`}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  )
}