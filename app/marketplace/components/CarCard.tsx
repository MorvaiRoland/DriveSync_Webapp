import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Calendar, Gauge, Fuel } from 'lucide-react'

export default function CarCard({ car }: { car: any }) {
  return (
    <Link href={`/cars/${car.car_id}`} className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 h-full">
        
        {/* Kép + Badge */}
        <div className="relative h-56 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            {car.main_image ? (
                <Image 
                    src={car.main_image} 
                    alt={`${car.brand} ${car.model}`} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-700" 
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-sm font-medium">Nincs kép</span>
                </div>
            )}
            
            {/* Ár címke lebegve */}
            <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-lg">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                    {car.price ? `${Number(car.price).toLocaleString()} Ft` : 'Ár megegyezés szerint'}
                </span>
            </div>
        </div>

        {/* Adatok */}
        <div className="p-5 flex flex-col flex-1">
            <div className="mb-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                    {car.brand} <span className="font-normal text-slate-600 dark:text-slate-400">{car.model}</span>
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-slate-500 font-medium mb-4">
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1.5 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-amber-500"/> {car.year}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1.5 rounded-lg">
                    <Gauge className="w-3.5 h-3.5 text-blue-500"/> {car.mileage ? `${(car.mileage / 1000).toFixed(0)}e km` : '?'}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1.5 rounded-lg">
                    <Fuel className="w-3.5 h-3.5 text-red-500"/> {car.fuel_type || '-'}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1.5 rounded-lg truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500"/> {car.location || 'Budapest'}
                </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                 <span className="text-slate-400">Hirdetve: {new Date(car.created_at).toLocaleDateString()}</span>
                 <span className="text-amber-600 font-bold group-hover:underline">Részletek &rarr;</span>
            </div>
        </div>
    </Link>
  )
}