import { createClient } from 'supabase/server'
import { ArrowRight, Store, PlusCircle, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default async function MarketplaceWidget() {
  const supabase = await createClient()

  const { count } = await supabase
    .from('marketplace_view')
    .select('*', { count: 'exact', head: true })
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)

  return (
    // Kivettem a h-full-t, helyette 'h-auto'-t vagy fix magasságot használunk, ha kell
    <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl group">
      
      {/* Háttér dekoráció - Halványabb, diszkrétebb */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
      
      {/* CÍM SZEKCIÓ */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-amber-500">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 leading-none mb-1">Piactér</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Közösségi ajánlatok</p>
          </div>
        </div>
      </div>

      {/* TARTALOM: Statisztika + Szöveg egymás mellett */}
      <div className="flex items-center gap-4 mb-5 relative z-10">
        {/* Szám doboz */}
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center min-w-[80px]">
            <div className="text-2xl font-black text-white">{count || 0}</div>
            <div className="text-[9px] font-bold text-slate-500 uppercase">Aktív</div>
        </div>

        {/* Leírás */}
        <div className="text-xs text-slate-400 leading-relaxed">
           Találd meg álmaid autóját, vagy add el a sajátodat biztonságosan a közösségnek.
        </div>
      </div>

      {/* GOMBOK (Egymás mellett) */}
      <div className="grid grid-cols-2 gap-2 relative z-10">
        {/* Piactér gomb */}
         <Link 
            href="/marketplace" 
            className="flex items-center justify-center gap-1 py-2.5 rounded-lg font-bold text-xs text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all"
        >
            <Store className="w-3.5 h-3.5" />
            Böngészés
        </Link>

        {/* Hirdetés gomb (Ez visz a Garázsba) */}
        <Link 
            href="/sell"  // <-- ITT A VÁLTOZÁS
            className="flex items-center justify-center gap-1 py-2.5 rounded-lg font-bold text-xs text-slate-900 bg-amber-500 hover:bg-amber-400 transition-all shadow-lg shadow-amber-900/10"
        >
            <PlusCircle className="w-3.5 h-3.5" />
            Hirdetés
        </Link>
      </div>

    </div>
  )
}