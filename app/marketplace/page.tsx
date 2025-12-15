import { createClient } from '@/supabase/server'
import FilterSidebar from './components/FilterSidebar'
import CarCard from './components/CarCard'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Egy átfogó lista a népszerű márkákról
// Ezt később kiszervezheted egy külön konstans fájlba is (pl. constants/brands.ts)
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

  // Szűrők kinyerése az URL-ből
  const brandParam = typeof params.brand === 'string' ? params.brand : null
  const minPrice = typeof params.minPrice === 'string' ? params.minPrice : null
  const maxPrice = typeof params.maxPrice === 'string' ? params.maxPrice : null

  // --- 1. LEKÉRDEZÉS: Autók szűrése ---
  let carQuery = supabase
    .from('marketplace_view')
    .select('*')
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)
    .order('created_at', { ascending: false })

  // Szűrés alkalmazása
  if (brandParam) carQuery = carQuery.ilike('make', brandParam)
  if (minPrice) carQuery = carQuery.gte('price', minPrice)
  if (maxPrice) carQuery = carQuery.lte('price', maxPrice)

  // --- 2. LEKÉRDEZÉS: Csak a márkák lekérése az adatbázisból ---
  // Azért kell, hogy ha van olyan ritka autó (pl. "Trabant"), ami nincs a fenti
  // statikus listában, az is megjelenjen a szűrőben.
  const brandQuery = supabase
    .from('marketplace_view')
    .select('make')
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)

  // Párhuzamos futtatás
  const [carsRes, brandsRes] = await Promise.all([carQuery, brandQuery])

  const cars = carsRes.data || []
  const dbBrandsRaw = brandsRes.data || []

  // --- MÁRKALISTA ÖSSZEÁLLÍTÁSA ---
  // 1. Kinyerjük az adatbázisban lévő márkákat
  // @ts-ignore
  const dbBrands = dbBrandsRaw.map(item => item.make).filter(Boolean) as string[]

  // 2. Összefésüljük a statikus listát a DB listával (Set a duplikációk ellen)
  // Így meglesz az összes népszerű márka + ami ténylegesen van az adatbázisban
  const allBrandsSet = new Set([...POPULAR_BRANDS, ...dbBrands]);
  
  // 3. Tömbé alakítjuk és ABC sorrendbe rendezzük
  const sortedBrands = Array.from(allBrandsSet).sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] pb-20 pt-6 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* --- VISSZA GOMB ÉS NAVIGÁCIÓ --- */}
        <div className="mb-8 flex items-center gap-4">
            <Link 
                href="/" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 transition-all shadow-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Vissza a főoldalra</span>
                <span className="sm:hidden">Főoldal</span>
            </Link>
        </div>

        {/* Címsor */}
        <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                Piactér
            </h1>
            <p className="text-slate-500 text-lg">
                Találd meg álmaid autóját a <span className="font-bold text-indigo-500">{cars.length}</span> elérhető hirdetés között.
            </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
            {/* Bal oldali sáv (Szűrő) - Most már a bővített listát adjuk át */}
            <aside className="w-full md:w-72 flex-shrink-0">
                <FilterSidebar availableBrands={sortedBrands} />
            </aside>

            {/* Jobb oldali sáv (Találatok) */}
            <main className="flex-1">
                {(!cars || cars.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-300 dark:border-slate-800">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-3xl">
                            🔍
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">Nincs találat</p>
                        <p className="text-slate-500 mt-2">
                            {brandParam 
                                ? `Jelenleg nincs elérhető ${brandParam} hirdetésünk.` 
                                : "Próbálj meg lazítani a szűrési feltételeken."}
                        </p>
                        <Link href="/marketplace" className="mt-6 text-indigo-500 font-bold hover:underline">
                            Szűrők törlése
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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