import { createClient } from 'supabase/server'
import { Car, ArrowRight, Store, Tag, PlusCircle, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default async function MarketplaceSection() {
  const supabase = await createClient()

  // Most nem kérjük le az autókat, CSAK a darabszámot (count)
  // Ez sokkal gyorsabb és kevesebb adatforgalom
  const { count } = await supabase
    .from('cars')
    .select('*', { count: 'exact', head: true }) // head: true = nem hozza az adatokat, csak a számot
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-800 p-8 shadow-xl my-6 group">
      {/* Háttér effektek - Absztraktabb, tisztább */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-700"></div>
      <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
      
      {/* Nagy háttér ikon dekoráció */}
      <Store className="absolute right-4 bottom-4 w-32 h-32 text-slate-800/50 -rotate-12 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Bal oldal: Információ */}
        <div className="space-y-4 max-w-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 shadow-lg shadow-amber-900/20">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-100 tracking-tight">DynamicSense Piactér</h3>
              <p className="text-slate-400 text-sm">A közösség által ellenőrzött prémium autók.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700 backdrop-blur-sm">
                <span className="block text-2xl font-bold text-white">{count || 0}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Aktív hirdetés</span>
            </div>
            <div className="h-10 w-px bg-slate-700 hidden sm:block"></div>
            <div className="text-sm text-slate-400 hidden sm:block">
                Találd meg álmaid autóját,<br/> vagy add el a sajátodat biztonságosan.
            </div>
          </div>
        </div>

        {/* Jobb oldal: Akciók */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Hirdetés feladása gyorsgomb (opcionális, ha van ilyen oldalad) */}
            <Link 
                href="/cars" 
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all hover:text-white"
            >
                <PlusCircle className="w-5 h-5" />
                <span>Hirdetés</span>
            </Link>

            {/* Belépés a piactérre */}
            <Link 
                href="/marketplace" 
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-500 hover:scale-105 active:scale-95 shadow-lg shadow-amber-900/20 transition-all duration-300"
            >
                <Store className="w-5 h-5" />
                <span>Piactér megnyitása</span>
                <ArrowRight className="w-5 h-5 ml-1" />
            </Link>
        </div>

      </div>
    </div>
  )
}