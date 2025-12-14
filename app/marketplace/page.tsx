import { createClient } from '@/supabase/server'
import MarketplaceFilters from './components/MarketplaceFilters'
import CarCard from './components/CarCard'
import { ShoppingBag, Search } from 'lucide-react'

// Dinamikus renderelés
export const dynamic = 'force-dynamic';

// JAVÍTÁS 1: A searchParams mostantól Promise
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function MarketplacePage(props: Props) {
  const supabase = await createClient()

  // JAVÍTÁS 2: Megvárjuk a Promise feloldását (await)
  const params = await props.searchParams;

  // Innentől használjuk a 'params' változót, ami már a sima objektum
  const brand = typeof params.brand === 'string' ? params.brand : null;
  const minPrice = typeof params.minPrice === 'string' ? params.minPrice : null;
  const maxPrice = typeof params.maxPrice === 'string' ? params.maxPrice : null;
  const fuel = typeof params.fuel === 'string' ? params.fuel : null;
  const queryText = typeof params.q === 'string' ? params.q : null;

  // 2. Lekérdezés építése
  let query = supabase
    .from('marketplace_view')
    .select('*')
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)
    .order('created_at', { ascending: false })

  // 3. Dinamikus szűrők alkalmazása
  if (brand) {
    query = query.ilike('brand', brand)
  }
  if (fuel) {
    query = query.ilike('fuel_type', fuel)
  }
  if (minPrice) {
    query = query.gte('price', minPrice)
  }
  if (maxPrice) {
    query = query.lte('price', maxPrice)
  }
  if (queryText) {
    query = query.or(`brand.ilike.%${queryText}%,model.ilike.%${queryText}%,description.ilike.%${queryText}%`)
  }

  // Adatok lekérése
  const { data: cars, error } = await query

  if (error) {
    console.error("Marketplace Error:", error)
    return <div className="p-10 text-center text-red-500">Hiba történt az adatok betöltésekor. Próbáld később.</div>
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1120]">
        {/* Fejléc Háttérrel */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pb-12 pt-24 px-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-500/20">
                    <ShoppingBag size={14} /> Piactér
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                    Találd meg a <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">tökéletes</span> autót.
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
                    Közösségi, ellenőrzött hirdetések. Böngéssz a jelenleg elérhető {cars?.length || 0} minőségi autó között.
                </p>
            </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row gap-8">
                
                {/* Bal oldali sáv: Szűrők (25% szélesség) */}
                <aside className="w-full md:w-1/4 min-w-[280px]">
                    <MarketplaceFilters />
                </aside>

                {/* Jobb oldali sáv: Eredmények (75% szélesség) */}
                <main className="flex-1">
                    {/* Találati info */}
                    <div className="mb-6 flex items-center justify-between">
                         <h2 className="font-bold text-slate-700 dark:text-slate-300">
                            {cars?.length === 0 ? 'Nincs találat' : `${cars?.length} autó elérhető`}
                         </h2>
                    </div>

                    {(!cars || cars.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Search className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nincs a keresésnek megfelelő autó.</h3>
                            <p className="text-slate-500 max-w-md mx-auto">
                                Próbáld meg módosítani a szűrőket, vagy töröld a keresési feltételeket a bővebb találatokért.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {cars.map((car) => (
                                <CarCard key={car.id} car={car} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    </div>
  )
}