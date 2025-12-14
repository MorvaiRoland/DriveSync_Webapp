import { Car, Calendar, Gauge, Fuel, Tag } from 'lucide-react'
import Link from 'next/link'

const formatPrice = (price: number | null) => {
    if (!price) return 'Ár nélkül'
    return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price)
}

export function MarketplaceCard({ car }: { car: any }) {
    return (
        <Link href={`/share/${car.share_token}`} className="block group h-full">
            <div className="bg-slate-800/50 border border-slate-700 hover:border-amber-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/10 hover:-translate-y-1 h-full flex flex-col">
                {/* Kép */}
                <div className="relative h-48 overflow-hidden bg-slate-800">
                    {car.image_url ? (
                        <img 
                            src={car.image_url} 
                            alt={`${car.make} ${car.model}`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Car className="w-12 h-12 opacity-50" />
                        </div>
                    )}
                    
                    {/* Címke */}
                    <div className="absolute top-2 right-2">
                            <span className="bg-slate-900/80 backdrop-blur-sm text-xs font-semibold text-white px-2 py-1 rounded-md border border-slate-700 flex items-center gap-1">
                            <Tag className="w-3 h-3 text-amber-500" /> Eladó
                        </span>
                    </div>
                </div>

                {/* Tartalom */}
                <div className="p-4 flex flex-col flex-grow">
                    <h4 className="text-lg font-bold text-slate-200 mb-1">{car.make} {car.model}</h4>
                    <div className="text-xl font-bold text-amber-500 mb-4">
                        {car.hide_prices ? 'Érdeklődjön' : formatPrice(car.price)}
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
    )
}