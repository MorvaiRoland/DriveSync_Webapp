import { createClient } from '@/supabase/server'
import { ArrowRight, Store, PlusCircle, ShoppingBag, Car } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const revalidate = 0; 

export default async function MarketplaceWidget() {
  const supabase = await createClient()

  // 1. Adatok lekérése
  const { count } = await supabase
    .from('marketplace_view')
    .select('*', { count: 'exact', head: true })
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)

  const { data: recentCars } = await supabase
    .from('marketplace_view')
    .select('id, make, model, image_url')
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    // JAVÍTÁS: h-full helyett h-auto, és min-h beállítás, flex-grow kivétele
    <div className="group relative w-full h-auto min-h-[200px] flex flex-col overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl transition-all duration-500 hover:border-zinc-700">
      
      {/* --- HÁTTÉR --- */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-700"></div>

      {/* --- TARTALOM --- */}
      <div className="relative z-10 p-5 flex flex-col gap-4">
        
        {/* FEJLÉC (Cím és Nyíl) */}
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-950 text-indigo-400 border border-zinc-800 shadow-sm">
                    <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-white leading-tight uppercase tracking-wide">
                        Piactér
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Community</span>
                </div>
            </div>
            
            <Link href="/marketplace" className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-indigo-400 hover:border-indigo-900/50 transition-all">
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>

        {/* SZÁMOK ÉS AVATAROK (Egymás mellett, kompakt) */}
        <div className="flex items-end justify-between gap-2 mt-1">
            <div className="flex flex-col">
                <span className="text-3xl font-light text-white tracking-tight leading-none">
                    <span className="font-bold">{count || 0}</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide flex items-center gap-1 mt-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    Aktív
                </span>
            </div>

            {/* Avatar Stack (Jobb oldalon) */}
            {recentCars && recentCars.length > 0 && (
                <div className="flex items-center pl-2 pb-1">
                    {recentCars.map((car, i) => (
                        <div key={car.id} className={`relative w-8 h-8 rounded-full border border-zinc-700 overflow-hidden -ml-3 first:ml-0 shadow-sm z-${10-i}`}>
                            {car.image_url ? (
                                <Image src={car.image_url} alt={car.model} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                    <Car className="w-3 h-3 text-zinc-500" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* GOMBOK (Kompakt Grid) */}
        <div className="grid grid-cols-2 gap-2 mt-2">
            <Link 
                href="/marketplace" 
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-bold text-xs text-zinc-300 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all active:scale-[0.98]"
            >
                <Store className="w-3.5 h-3.5" />
                Vétel
            </Link>

            <Link 
                href="/marketplace/sell" 
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-bold text-xs text-zinc-900 bg-zinc-100 hover:bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
                <PlusCircle className="w-3.5 h-3.5" />
                Eladás
            </Link>
        </div>
      </div>
    </div>
  )
}