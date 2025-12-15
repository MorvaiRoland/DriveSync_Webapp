import { createClient } from '@/supabase/server'
import { ArrowRight, Store, PlusCircle, ShoppingBag, Car, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const revalidate = 0; 

export default async function MarketplaceWidget() {
  const supabase = await createClient()

  // 1. Lekérjük az összes darabszámot
  const { count } = await supabase
    .from('marketplace_view')
    .select('*', { count: 'exact', head: true })
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)

  // 2. "TURBÓ": Lekérjük az utolsó 3 autót is a képekhez (Preview Stack)
  const { data: recentCars } = await supabase
    .from('marketplace_view')
    .select('id, make, model, image_url')
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="group relative h-full flex flex-col justify-between overflow-hidden rounded-[2rem] bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-500 hover:shadow-amber-500/10 hover:-translate-y-1">
      
      {/* --- HÁTTÉR EFFEKTEK --- */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 rounded-full blur-[60px] -ml-10 -mb-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/80 dark:to-slate-900/50 pointer-events-none"></div>

      {/* --- TARTALOM --- */}
      <div className="relative z-10 p-7 flex flex-col h-full">
        
        {/* FELSŐ SZEKCIÓ */}
        <div>
            {/* Fejléc */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Community</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        Piactér
                    </h3>
                </div>
                
                <Link href="/marketplace" className="p-2 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-400 group-hover:text-amber-500 group-hover:border-amber-500/30 transition-all">
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Számok és Státusz */}
            <div className="flex items-end gap-3 mb-6">
                <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                    {count || 0}
                </span>
                <div className="mb-2 flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-100/50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                        Aktív hirdetés
                    </span>
                </div>
            </div>

            {/* Recent Stack (Utolsó 3 autó) - CSAK HA VAN */}
            {recentCars && recentCars.length > 0 && (
                <div className="mb-6">
                    <p className="text-xs font-semibold text-slate-500 mb-2 pl-1">Legújabb autók:</p>
                    <div className="flex items-center">
                        {recentCars.map((car, i) => (
                            <div key={car.id} className={`relative w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden -ml-3 first:ml-0 shadow-sm z-${10-i}`}>
                                {car.image_url ? (
                                    <Image src={car.image_url} alt={car.model} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                        <Car className="w-5 h-5 text-slate-400" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {/* + Többi indikátor */}
                        {(count || 0) > 3 && (
                            <div className="relative w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 -ml-3 z-0">
                                +{(count || 0) - 3}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* ALSÓ GOMBOK (Sticky-szerűen az alján) */}
        <div className="mt-auto grid grid-cols-2 gap-3 pt-6 border-t border-slate-100 dark:border-slate-800/50">
            {/* GOMB 1: BÖNGÉSZÉS */}
            <Link 
                href="/marketplace" 
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all active:scale-[0.98]"
            >
                <Store className="w-4 h-4" />
                Vétel
            </Link>

            {/* GOMB 2: ELADÁS */}
            <Link 
                href="/marketplace/sell" 
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm text-slate-900 bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 border border-amber-400/20 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all active:scale-[0.98]"
            >
                <PlusCircle className="w-4 h-4" />
                Eladás
            </Link>
        </div>
      </div>
    </div>
  )
}