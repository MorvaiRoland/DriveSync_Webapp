// components/DealerDashboard.tsx
'use client'

import { CarFront, BarChart3, Users, Plus, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function DealerDashboard({ user, cars, stats }: any) {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-32 pt-[calc(env(safe-area-inset-top)+6rem)]">
      
      {/* Üdvözlés */}
      <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-slate-500 dark:text-slate-400 font-medium text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> Kereskedői Portál
        </h2>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
           {user.user_metadata?.full_name || 'Kereskedés'}
        </h1>
      </div>

      {/* Statisztika Kártyák */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                  <CarFront size={24} />
               </div>
               <span className="text-xs font-bold bg-green-100 text-green-600 px-2 py-1 rounded">Aktív</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{cars.length}</h3>
            <p className="text-sm text-slate-500">Jármű a készleten</p>
         </div>

         <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                  <DollarSign size={24} />
               </div>
               <span className="text-xs font-bold bg-emerald-100 text-emerald-600 px-2 py-1 rounded">+12%</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">12.5M Ft</h3>
            <p className="text-sm text-slate-500">Becsült készletérték</p>
         </div>

         <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                  <Users size={24} />
               </div>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">48</h3>
            <p className="text-sm text-slate-500">Megtekintés ezen a héten</p>
         </div>
      </div>

      {/* Gyorsműveletek */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
         <Link href="/cars/new" className="flex items-center gap-3 p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors font-bold shadow-lg shadow-indigo-500/20">
            <Plus size={20} /> Új autó felvétele
         </Link>
         <button className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 font-bold">
            <BarChart3 size={20} /> Statisztikák
         </button>
      </div>

      {/* Készlet Lista (Egyszerűsített) */}
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Készlet</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {cars.map((car: any) => (
            <Link key={car.id} href={`/cars/${car.id}`} className="block bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-colors group">
               <div className="h-48 bg-slate-100 dark:bg-slate-900 relative">
                  {/* Ide jönne a kép, ha van */}
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                     <CarFront size={48} />
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-950/90 backdrop-blur px-2 py-1 rounded text-xs font-bold">
                     {car.plate}
                  </div>
               </div>
               <div className="p-4">
                  <h4 className="font-bold text-lg mb-1 group-hover:text-indigo-500 transition-colors">{car.make} {car.model}</h4>
                  <div className="flex justify-between text-sm text-slate-500">
                     <span>{car.year}</span>
                     <span className="font-mono">{car.mileage.toLocaleString()} km</span>
                  </div>
               </div>
            </Link>
         ))}
         {cars.length === 0 && (
            <div className="col-span-full text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
               <p className="text-slate-500 mb-4">Még nincs autód a rendszerben.</p>
               <Link href="/cars/new" className="text-indigo-500 font-bold hover:underline">Kezdd el most!</Link>
            </div>
         )}
      </div>

    </div>
  )
}