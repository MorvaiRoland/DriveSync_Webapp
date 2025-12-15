import { createClient } from '@/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { deleteTrip } from '../actions'
import TripForm from '@/components/TripForm'
import { Map, Briefcase, Home, ArrowLeft, Trash2, Route } from 'lucide-react'

export default async function TripLoggerPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  const { data: car } = await supabase.from('cars').select('*').eq('id', params.id).single()
  
  if (!car) return notFound()

  const { data: trips } = await supabase
    .from('trips')
    .select('*')
    .eq('car_id', params.id)
    .order('trip_date', { ascending: false })

  const safeTrips = trips || []

  // Statisztika számolás
  const totalBusinessKm = safeTrips.filter(t => t.purpose === 'business').reduce((sum, t) => sum + t.distance, 0)
  const totalPersonalKm = safeTrips.filter(t => t.purpose === 'personal').reduce((sum, t) => sum + t.distance, 0)
  const totalKm = totalBusinessKm + totalPersonalKm
  const businessRatio = totalKm > 0 ? Math.round((totalBusinessKm / totalKm) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-500 selection:bg-amber-500/30 selection:text-amber-600 relative overflow-x-hidden">
      
      {/* HÁTTÉR EFFEKTEK */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* --- HERO HEADER --- */}
      <div className="relative pt-8 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center relative z-10">
            <Link href={`/cars/${car.id}`} className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 text-sm font-bold bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-800/80 shadow-sm">
                <ArrowLeft className="w-4 h-4" /> Vissza az autóhoz
            </Link>
            
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">
                Út<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">nyilvántartás</span>
            </h1>
            
            <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm mb-8">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                {car.make} {car.model} ({car.plate})
            </div>

            {/* STATISZTIKA KÁRTYÁK (LIQUID STYLE) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-white/40 dark:border-slate-700/50 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-blue-500/20 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                            <Briefcase className="w-4 h-4" />
                            <p className="text-xs uppercase font-bold tracking-wider">Üzleti utak</p>
                        </div>
                        <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{totalBusinessKm.toLocaleString()} <span className="text-sm font-bold text-slate-400">km</span></p>
                    </div>
                </div>

                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-white/40 dark:border-slate-700/50 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-purple-500/20 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                            <Home className="w-4 h-4" />
                            <p className="text-xs uppercase font-bold tracking-wider">Magán utak</p>
                        </div>
                        <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{totalPersonalKm.toLocaleString()} <span className="text-sm font-bold text-slate-400">km</span></p>
                    </div>
                </div>

                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-white/40 dark:border-slate-700/50 shadow-lg relative overflow-hidden group flex flex-col justify-center">
                    <div className="flex justify-between items-end mb-2 relative z-10">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Céges Arány</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">{businessRatio}%</p>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative z-10">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${businessRatio}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-4 relative z-20 space-y-8">
         
         {/* ÚJ ÚT RÖGZÍTÉSE (FORM KOMPONENS BEÁGYAZÁSA) */}
         <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-1 border border-white/20 dark:border-slate-700 overflow-hidden">
             <TripForm carId={car.id} />
         </div>

         {/* NAPLÓ LISTA */}
         <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-[2.5rem] border border-white/40 dark:border-slate-700/50 shadow-xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                    <Map className="w-5 h-5 text-slate-400" /> Rögzített utak
                </h3>
                <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 dark:text-slate-400">{safeTrips.length} db</span>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {safeTrips.length > 0 ? (
                    safeTrips.map((trip: any) => (
                        <div key={trip.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-sm border border-white/20 dark:border-white/5 ${trip.purpose === 'business' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'}`}>
                                    {trip.purpose === 'business' ? <Briefcase className="w-6 h-6" /> : <Home className="w-6 h-6" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white mb-1 flex-wrap">
                                        <span>{trip.start_location}</span>
                                        <ArrowLeft className="w-4 h-4 text-slate-400 rotate-180" />
                                        <span>{trip.end_location}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                            {new Date(trip.trip_date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Route className="w-3 h-3" /> {trip.distance} km
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700 sm:border-none mt-2 sm:mt-0">
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${trip.purpose === 'business' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800'}`}>
                                    {trip.purpose === 'business' ? 'Üzleti' : 'Magán'}
                                </span>
                                <form action={deleteTrip}>
                                    <input type="hidden" name="trip_id" value={trip.id} />
                                    <input type="hidden" name="car_id" value={car.id} />
                                    <button className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 transition-all" title="Törlés">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-16 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Map className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Még nincs rögzített út.</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Indulás előtt vagy után rögzítsd itt!</p>
                    </div>
                )}
            </div>
         </div>

      </div>
    </div>
  )
}