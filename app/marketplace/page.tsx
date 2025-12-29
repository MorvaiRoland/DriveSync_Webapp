import { createClient } from '@/supabase/server'
import FilterSidebar from './components/FilterSidebar'
import CarCard from './components/CarCard'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const POPULAR_BRANDS = [
  "Alfa Romeo", "Audi", "BMW", "Chevrolet", "Citroen", "Dacia", "Dodge", "Fiat", 
  "Ford", "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", "Lada", 
  "Land Rover", "Lexus", "Mazda", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", 
  "Opel", "Peugeot", "Porsche", "Renault", "Saab", "Seat", "Skoda", "Smart", 
  "Subaru", "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo"
];

export default async function MarketplacePage(props: Props) {
  const supabase = await createClient()
  const params = await props.searchParams

  const brandParam = typeof params.brand === 'string' ? params.brand : null
  const minPrice = typeof params.minPrice === 'string' ? params.minPrice : null
  const maxPrice = typeof params.maxPrice === 'string' ? params.maxPrice : null

  let carQuery = supabase
    .from('marketplace_view')
    .select('*')
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)
    .order('created_at', { ascending: false })

  if (brandParam) carQuery = carQuery.ilike('make', brandParam)
  if (minPrice) carQuery = carQuery.gte('price', minPrice)
  if (maxPrice) carQuery = carQuery.lte('price', maxPrice)

  const brandQuery = supabase
    .from('marketplace_view')
    .select('make')
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)

  const [carsRes, brandsRes] = await Promise.all([carQuery, brandQuery])

  const cars = carsRes.data || []
  const dbBrandsRaw = brandsRes.data || []

  // @ts-ignore
  const dbBrands = dbBrandsRaw.map(item => item.make).filter(Boolean) as string[]
  const allBrandsSet = new Set([...POPULAR_BRANDS, ...dbBrands]);
  const sortedBrands = Array.from(allBrandsSet).sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-x-hidden relative">
      
      {/* SAFE AREA PADDING - Notch és Home Bar kezelése */}
      <div className="pt-[calc(env(safe-area-inset-top)+2rem)] pb-[calc(1.5rem+env(safe-area-inset-bottom))]">

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* --- VISSZA GOMB ÉS NAVIGÁCIÓ --- */}
          <div className="mb-6 md:mb-8 flex items-center gap-4">
              <Link 
                  href="/" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 transition-all shadow-sm"
              >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Vissza a főoldalra</span>
                  <span className="sm:hidden">Főoldal</span>
              </Link>
          </div>

          {/* Címsor */}
          <div className="mb-8 md:mb-12">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2 md:mb-4">
                  Piactér
              </h1>
              <p className="text-slate-500 text-sm md:text-lg">
                  Találd meg álmaid autóját a <span className="font-bold text-indigo-500">{cars.length}</span> elérhető hirdetés között.
              </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
              {/* Bal oldali sáv (Szűrő) */}
              {/* Mobilon a tartalom felett jelenik meg teljes szélességben, desktopon (lg) bal oldalt fix szélességgel */}
              <aside className="w-full lg:w-72 flex-shrink-0">
                  <FilterSidebar availableBrands={sortedBrands} />
              </aside>

              {/* Jobb oldali sáv (Találatok) */}
              <main className="flex-1">
                  {(!cars || cars.length === 0) ? (
                      <div className="flex flex-col items-center justify-center py-16 md:py-24 bg-white dark:bg-slate-900 rounded-3xl md:rounded-[2rem] border border-dashed border-slate-300 dark:border-slate-800 text-center px-4">
                          <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-2xl md:text-3xl">
                              🔍
                          </div>
                          <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Nincs találat</p>
                          <p className="text-sm md:text-base text-slate-500 mt-2 max-w-xs mx-auto">
                              {brandParam 
                                  ? `Jelenleg nincs elérhető ${brandParam} hirdetésünk.` 
                                  : "Próbálj meg lazítani a szűrési feltételeken."}
                          </p>
                          <Link href="/marketplace" className="mt-6 inline-block text-indigo-500 font-bold hover:underline text-sm md:text-base">
                              Szűrők törlése
                          </Link>
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                          {cars.map((car: any) => (
                              <CarCard key={car.id} car={car} />
                          ))}
                      </div>
                  )}
              </main>
          </div>
        </div>

      </div>
    </div>
  )
}