import { createClient } from 'supabase/server'
import { ArrowRight, Store, PlusCircle, ShoppingBag, Car } from 'lucide-react'
import Link from 'next/link'

export default async function MarketplaceWidget() {
  const supabase = await createClient()

  // Lekérjük a darabszámot (gyors, kevés adat)
  const { count } = await supabase
    .from('cars')
    .select('*', { count: 'exact', head: true })
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)

  return (
    <div className="h-full flex flex-col justify-between relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl group">
      
      {/* Háttér dekorációk */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-700"></div>
      <Store className="absolute right-4 bottom-4 w-24 h-24 text-slate-800/40 -rotate-12 pointer-events-none" />

      {/* 1. FEJLÉC: Cím és "Összes" gomb */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 leading-tight">Piactér</h3>
            <p className="text-xs text-slate-400">Közösségi ajánlatok</p>
          </div>
        </div>
        
        <Link 
            href="/marketplace" 
            className="text-xs font-bold text-amber-500 flex items-center gap-1 hover:text-amber-400 transition-colors bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-500/20"
        >
            Összes <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 2. STATISZTIKA (Középen) */}
      <div className="flex-grow flex flex-col justify-center py-4 relative z-10">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 backdrop-blur-sm">
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">{count || 0}</span>
                <span className="text-sm font-medium text-slate-400">aktív hirdetés</span>
            </div>
            <div className="w-full h-1 bg-slate-700 rounded-full mt-3 overflow-hidden">
                {/* Progress bar animáció csak dísznek, vagy arányosítható ha van max limit */}
                <div className="h-full bg-amber-500 w-1/4 opacity-50"></div>
            </div>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
               {count && count > 0 
                ? "Böngéssz a friss kínálatban!" 
                : "A piactér jelenleg üres. Légy te az első hirdető!"}
            </p>
        </div>
      </div>

      {/* 3. LÁBLÉC: Hirdetés feladás (CTA) */}
      <div className="mt-4 relative z-10">
        <Link 
            href="/cars" 
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-slate-900 bg-amber-500 hover:bg-amber-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-amber-900/20"
        >
            <PlusCircle className="w-4 h-4" />
            Hirdetés feladása
        </Link>
      </div>

    </div>
  )
}