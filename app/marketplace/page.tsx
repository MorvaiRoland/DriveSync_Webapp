import { createClient } from '@/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Calendar, Gauge, Fuel } from 'lucide-react'

// Ez biztosítja, hogy mindig friss adatot kérjen le, ne cache-eljen
export const revalidate = 0;

export default async function MarketplacePage() {
  const supabase = await createClient()

  // UGYANAZ a lekérdezés, mint a widgetben, de itt elkérjük az adatokat is (select *)
  const { data: cars, error } = await supabase
    .from('marketplace_view') // Fontos: ugyanazt a nézetet használd!
    .select('*')
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Hiba a piactér betöltésekor:", error)
    return <div>Hiba történt az adatok betöltésekor.</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-end mb-8">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Piactér</h1>
           <p className="text-slate-500 mt-2">Közösségi autókereskedés - Jelenleg {cars?.length || 0} aktív hirdetés</p>
        </div>
      </div>

      {(!cars || cars.length === 0) ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-slate-500">Jelenleg nincs eladó autó a listában.</p>
          <p className="text-xs text-slate-400 mt-1">(De a widget szerint kéne lennie... ellenőrizd az RLS-t!)</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <Link key={car.id} href={`/cars/${car.car_id}`} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
              
              {/* Kép helye */}
              <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800">
                {car.main_image ? (
                   <Image src={car.main_image} alt={car.brand} fill className="object-cover" />
                ) : (
                   <div className="absolute inset-0 flex items-center justify-center text-slate-300">Nincs kép</div>
                )}
                <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    {car.price ? `${car.price.toLocaleString()} Ft` : 'Ár megegyezés szerint'}
                </div>
              </div>

              {/* Adatok */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                    {car.brand} {car.model}
                </h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{car.description || 'Nincs leírás'}</p>
                
                <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> {car.year}</div>
                    <div className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5"/> {car.mileage ? `${car.mileage} km` : '? km'}</div>
                    <div className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5"/> {car.fuel_type || 'Egyéb'}</div>
                    <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {car.location || 'Budapest'}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}