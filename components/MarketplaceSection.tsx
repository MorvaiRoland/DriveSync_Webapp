// components/MarketplaceSection.tsx
import { createClient } from 'supabase/server'
import { Car, ArrowRight, Store, Calendar, Gauge, Fuel, Tag } from 'lucide-react'
import Link from 'next/link'

// Ár formázó segédfüggvény
const formatPrice = (price: number | null) => {
    if (!price) return 'Ár nélkül'
    return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price)
}

export default async function MarketplaceSection() {
  const supabase = await createClient()

  // Lekérjük a legfrissebb 3 autót, ami eladó és listázva van
  const { data: recentCars } = await supabase
    .from('cars')
    .select('*')
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)
    .order('updated_at', { ascending: false })
    .limit(3)

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl my-6">
      {/* Háttér effektek */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        {/* Fejléc */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">Piactér</h3>
              <p className="text-xs text-slate-400">Kiemelt ajánlatok a közösségtől</p>
            </div>
          </div>

          <Link 
            href="/marketplace" 
            className="group flex items-center gap-2 text-sm font-bold text-amber-500 hover:text-amber-400 transition-colors bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20 hover:border-amber-500/40 w-full sm:w-auto justify-center"
          >
            Összes megtekintése 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Lista */}
        {recentCars && recentCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentCars.map((car) => (
                    <Link href={`/share/${car.share_token}`} key={car.id} className="block group h-full">
                        <div className="bg-slate-800/50 border border-slate-700 hover:border-amber-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/10 hover:-translate-y-1 h-full flex flex-col">
                            {/* Kép */}
                            <div className="relative h-48 overflow-hidden bg-slate-800">
                                {car.image_url ? (
                                    <img src={car.image_url} alt={car.make + ' ' + car.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                        <Car className="w-12 h-12 opacity-50" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                     <span className="bg-slate-900/80 backdrop-blur-sm text-xs font-semibold text-white px-2 py-1 rounded-md border border-slate-700 flex items-center gap-1">
                                        <Tag className="w-3 h-3 text-amber-500" /> Eladó
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 flex flex-col flex-grow">
                                <h4 className="text-lg font-bold text-slate-200 mb-1">{car.make} {car.model}</h4>
                                <div className="text-xl font-bold text-amber-500 mb-4">
                                    {car.hide_prices ? 'Hívjon az árért' : formatPrice(car.price)}
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-xs text-slate-400 mt-auto">
                                   <div className="flex flex-col items-center gap-1 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                                        <Calendar className="w-3 h-3 text-slate-500" />
                                        <span>{car.year || '-'}</span>
                                   </div>
                                   <div className="flex flex-col items-center gap-1 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                                        <Gauge className="w-3 h-3 text-slate-500" />
                                        <span>{car.mileage ? `${car.mileage} km` : '-'}</span>
                                   </div>
                                   <div className="flex flex-col items-center gap-1 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                                        <Fuel className="w-3 h-3 text-slate-500" />
                                        <span>{car.fuel_type || '-'}</span>
                                   </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        ) : (
            <div className="text-center py-10 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                <Store className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">Jelenleg nincsenek kiemelt autók.</p>
                <Link href="/marketplace" className="text-amber-500 hover:underline text-sm font-medium">
                    Lépj be a piactérre
                </Link>
            </div>
        )}
      </div>
    </div>
  )
}