import { createClient } from '@/supabase/server'
import FilterSidebar from './components/FilterSidebar'
import CarCard from './components/CarCard'

export const dynamic = 'force-dynamic';

// Next.js 15+ kompatibilis Props típus
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function MarketplacePage(props: Props) {
  const supabase = await createClient()
  const params = await props.searchParams // Megvárjuk a paramétereket

  // Szűrők kinyerése
  const brand = typeof params.brand === 'string' ? params.brand : null
  const minPrice = typeof params.minPrice === 'string' ? params.minPrice : null
  const maxPrice = typeof params.maxPrice === 'string' ? params.maxPrice : null

  // Lekérdezés építése
  let query = supabase
    .from('marketplace_view')
    .select('*')
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)
    .order('created_at', { ascending: false })

  if (brand) query = query.ilike('brand', brand)
  if (minPrice) query = query.gte('price', minPrice)
  if (maxPrice) query = query.lte('price', maxPrice)

  const { data: cars } = await query

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Címsor */}
        <div className="mb-8">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white">Piactér</h1>
            <p className="text-slate-500">Találd meg álmaid autóját a közösségben.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
            {/* Bal oldali sáv (Szűrő) */}
            <aside className="w-full md:w-64 flex-shrink-0">
                <FilterSidebar />
            </aside>

            {/* Jobb oldali sáv (Találatok) */}
            <main className="flex-1">
                {(!cars || cars.length === 0) ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                        <p className="text-lg font-bold text-slate-700 dark:text-slate-300">Nincs találat</p>
                        <p className="text-slate-500">Próbálj meg más szűrési feltételeket.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cars.map((car: any) => (
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