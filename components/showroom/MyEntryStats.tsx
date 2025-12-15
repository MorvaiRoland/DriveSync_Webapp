'use client'

import Image from 'next/image'
import { Trophy, TrendingUp, Users } from 'lucide-react'

export default function MyEntryStats({ myEntry }: { myEntry: any }) {
  if (!myEntry) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 mb-12 relative overflow-hidden">
        {/* Háttér dekoráció */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Trophy className="text-orange-500 w-5 h-5" />
            Saját Nevezésed
        </h2>

        <div className="flex flex-col sm:flex-row gap-6">
            {/* Kép */}
            <div className="w-full sm:w-1/3 relative aspect-video sm:aspect-square rounded-2xl overflow-hidden shadow-md">
                <Image 
                    src={myEntry.imageUrl || '/placeholder-car.jpg'} 
                    alt="Saját autó" 
                    fill 
                    className="object-cover" 
                />
            </div>

            {/* Statisztikák */}
            <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Összes szavazat</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        {myEntry.voteCount} 
                        <span className="text-sm font-normal text-slate-400">db</span>
                    </p>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Népszerűség</p>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="text-emerald-500 w-5 h-5" />
                        <span className="text-lg font-bold text-emerald-500">Top 10%</span>
                    </div>
                </div>

                <div className="col-span-2 bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase mb-1">Autó típusa</p>
                        <p className="font-bold text-slate-900 dark:text-white">{myEntry.carName}</p>
                    </div>
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-orange-500 shadow-sm">
                        <Users className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}