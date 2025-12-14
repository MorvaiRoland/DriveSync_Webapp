import { createClient } from 'supabase/server'
import { ArrowRight, Store, PlusCircle, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 0; 

export default async function MarketplaceWidget() {
  const supabase = await createClient()

  // Lekérjük az aktív hirdetéseket
  // FONTOS: Ehhez kell az SQL Policy (lásd lentebb)
  const { count } = await supabase
    .from('marketplace_view')
    .select('*', { count: 'exact', head: true })
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)

  return (
    <div className="flex flex-col h-full relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl transition-all duration-300 group">
      
      {/* Háttér dekoráció */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/20 dark:group-hover:bg-amber-500/10 transition-all"></div>
      
      {/* FELSŐ RÉSZ (Header + Tartalom egyben, hogy ne csússzon szét) */}
      <div className="relative z-10 flex-1">
          {/* Cím */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-amber-600 dark:text-amber-500">
                <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-bold text-slate-900 dark:text-white leading-tight text-lg">Piactér</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Közösségi ajánlatok</p>
            </div>
          </div>

          {/* Statisztika Kártya */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
            <div className="text-center min-w-[60px] border-r border-slate-200 dark:border-slate-700 pr-4">
                <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{count || 0}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Aktív</div>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
               Böngéssz az ellenőrzött autók között, vagy hirdesd meg a sajátod.
            </div>
          </div>
      </div>

      {/* ALSÓ RÉSZ (Gombok) - mt-auto tolja le az aljára */}
      <div className="mt-6 relative z-10 grid grid-cols-2 gap-3">
         <Link 
            href="/marketplace" 
            className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all"
        >
            <Store className="w-4 h-4" />
            Böngészés
        </Link>

        <Link 
            href="/cars" 
            className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-slate-900 bg-amber-500 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:-translate-y-0.5"
        >
            <PlusCircle className="w-4 h-4" />
            Hirdetés
        </Link>
      </div>

    </div>
  )
}