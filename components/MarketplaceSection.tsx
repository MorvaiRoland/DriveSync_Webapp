import { createClient } from 'supabase/server'
import { ArrowRight, Store, PlusCircle, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 0; 

export default async function MarketplaceWidget() {
  const supabase = await createClient()

  const { count } = await supabase
    .from('marketplace_view')
    .select('*', { count: 'exact', head: true })
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)

  return (
    <div className="group relative h-full flex flex-col overflow-hidden rounded-[2rem] bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-500 hover:shadow-amber-500/10">
      
      {/* --- HÁTTÉR EFFEKTEK --- */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/80 dark:to-slate-900/50 pointer-events-none"></div>

      {/* --- FELSŐ RÉSZ (Header + Adatok egyben) --- */}
      {/* Kivettem a h-full-t és flex-1-et innen, hogy a tartalom egyben maradjon felül */}
      <div className="relative z-10 p-7 pb-0">
        
        {/* FEJLÉC */}
        <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-500" />
                    Piactér
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Közösségi autókereskedés
                </p>
            </div>
            
            <div className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <ArrowRight className="w-3 h-3 text-slate-400" />
            </div>
        </div>

        {/* FŐ STATISZTIKA */}
        <div>
            <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-sm">
                    {count || 0}
                </span>
                <span className="text-sm font-bold text-emerald-500 uppercase tracking-wider mb-2">
                    Aktív
                </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-[90%]">
                Jelenleg ennyi ellenőrzött autó érhető el a közösségben.
            </p>
        </div>
      </div>

      {/* --- ALSÓ RÉSZ (Gombok) --- */}
      {/* mt-auto: Ez tolja le a gombokat a kártya aljára, de a felső tartalom nem csúszik szét */}
      <div className="relative z-10 mt-auto p-7">
        <div className="grid grid-cols-2 gap-3">
            <Link 
                href="/marketplace" 
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all active:scale-[0.98]"
            >
                <Store className="w-4 h-4" />
                Böngészés
            </Link>

            <Link 
                href="/cars" 
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-sm text-slate-900 bg-amber-500 hover:bg-amber-400 border border-amber-400/50 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all active:scale-[0.98]"
            >
                <PlusCircle className="w-4 h-4" />
                Hirdetés
            </Link>
        </div>
      </div>

    </div>
  )
}