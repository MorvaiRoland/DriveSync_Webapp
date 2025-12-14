import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Gauge, Calendar, Fuel } from 'lucide-react'

export default function CarCard({ car }: { car: any }) {
  return (
    <Link 
      href={`/marketplace/${car.car_id}`} // Fontos: car_id-t használunk az URL-ben
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800">
        {car.main_image ? (
            <Image src={car.main_image} alt={car.brand} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">Nincs kép</div>
        )}
        <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-lg">
            {car.price ? `${car.price.toLocaleString()} Ft` : 'Megegyezés szerint'}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
            {car.brand} <span className="font-normal text-slate-500">{car.model}</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mt-2 mb-4">
            <div className="flex items-center gap-1"><Calendar size={12}/> {car.year}</div>
            <div className="flex items-center gap-1"><Gauge size={12}/> {car.mileage} km</div>
            <div className="flex items-center gap-1"><Fuel size={12}/> {car.fuel_type}</div>
            <div className="flex items-center gap-1"><MapPin size={12}/> {car.location || 'BP'}</div>
        </div>

        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wide group-hover:underline">Adatlap megtekintése &rarr;</span>
        </div>
      </div>
    </Link>
  )
}