import { createClient } from '@/supabase/server'
import { ArrowRight, ShoppingBag, Car } from 'lucide-react'
import Link from 'next/link'

export default async function MarketplaceWidget() {
  const supabase = await createClient()

  // Lekérjük az aktív hirdetések számát
  const { count } = await supabase
    .from('marketplace_view')
    .select('*', { count: 'exact', head: true })
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)

  return (
    <div className="w-full h-full p-1">
      <div className="relative h-full flex flex-col justify-between overflow-hidden rounded-[2rem] bg-slate-900 border border-slate-800 shadow-2xl group">
        
        {/* Háttér dekoráció */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-blue-500/20 transition-all duration-500"></div>

        <div className="p-6 relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700">
                <ShoppingBag className="w-6 h-6 text-blue-400" />
            </div>
            <div className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20">
                LIVE
            </div>
          </div>

          <h3 className="text-3xl font-bold text-white mb-1">{count || 0}</h3>
          <p className="text-slate-400 text-sm font-medium">Elérhető autó a piactéren</p>
        </div>

        <div className="p-4 mt-auto relative z-10">
          <Link 
            href="/marketplace" 
            className="flex items-center justify-between w-full p-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all group-hover:shadow-lg group-hover:shadow-blue-500/25"
          >
            <span>Böngészés</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}