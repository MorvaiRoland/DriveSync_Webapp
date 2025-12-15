import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Gauge, Calendar, Fuel, CarFront } from 'lucide-react'

export default function CarCard({ car }: { car: any }) {
  return (
    <Link 
      href={`/marketplace/${car.id}`} // JAVÍTVA: car.id-t használunk, ami az objektumban van
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      {/* KÉP SZEKCIÓ */}
      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800">
        {car.image_url ? (
            <Image 
                src={car.image_url} 
                alt={`${car.make} ${car.model}`} // JAVÍTVA: make és model használata
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500" 
            />
        ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                <CarFront className="w-8 h-8 opacity-50" />
                <span className="text-xs font-medium">Nincs kép</span>
            </div>
        )}
        
        {/* Árcédula */}
        <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg border border-white/10">
            {car.price ? `${car.price.toLocaleString()} Ft` : 'Megegyezés szerint'}
        </div>
      </div>

      {/* ADATOK SZEKCIÓ */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-1">
            {car.make} <span className="font-normal text-slate-500">{car.model}</span>
        </h3>
        
        {/* Specifikációk Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-slate-500 dark:text-slate-400 mt-3 mb-5">
            <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400"/> 
                <span>{car.year}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-slate-400"/> 
                <span>{car.mileage.toLocaleString()} km</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-slate-400"/> 
                <span className="capitalize">{car.fuel_type || '-'}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400"/> 
                <span className="truncate">{car.location || 'Budapest'}</span>
            </div>
        </div>

        {/* Lábléc */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wide group-hover:underline decoration-2 underline-offset-4">
                Adatlap &rarr;
            </span>
            {/* Opcionális: Szervizkönyv jelvény ha verified */}
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/20">
                VERIFIED
            </div>
        </div>
      </div>
    </Link>
  )
}