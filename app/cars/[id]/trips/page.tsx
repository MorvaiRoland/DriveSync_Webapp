import { createClient } from 'supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { deleteTrip } from '../actions'
import TripForm from '@/components/TripForm'
import { Map, Briefcase, Home, ArrowLeft, Trash2, Route } from 'lucide-react'

export default async function TripLoggerPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  // Fetch car details
  const { data: car } = await supabase
    .from('cars')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (!car) return notFound()

  // Fetch trips for the car
  const { data: trips } = await supabase
    .from('trips')
    .select('*')
    .eq('car_id', params.id)
    .order('trip_date', { ascending: false })

  const safeTrips = trips || []

  // Calculate statistics
  const totalBusinessKm = safeTrips.filter(t => t.purpose === 'business').reduce((sum, t) => sum + t.distance, 0)
  const totalPersonalKm = safeTrips.filter(t => t.purpose === 'personal').reduce((sum, t) => sum + t.distance, 0)
  const totalKm = totalBusinessKm + totalPersonalKm
  const businessRatio = totalKm > 0 ? Math.round((totalBusinessKm / totalKm) * 100) : 0

  // Generate today's date
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-x-hidden relative">
      
      {/* SAFE AREA BOTTOM PADDING - Home Bar kezelése */}
      <div className="pb-[calc(1.5rem+env(safe-area-inset-bottom))]">

        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[80px] md:blur-[120px]"></div>
        </div>

        {/* Header Section */}
        {/* SAFE AREA TOP PADDING - Notch kezelése */}
        <div className="relative pt-[calc(env(safe-area-inset-top)+2rem)] pb-8 md:pb-12 px-4">
          <div className="max-w-4xl mx-auto text-center relative z-10">
              <Link href={`/cars/${car.id}`} className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 text-xs md:text-sm font-bold bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm">
                  <ArrowLeft className="w-4 h-4" /> Vissza az autóhoz
              </Link>
              
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 md:mb-6">
                  Út<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">nyilvántartás</span>
              </h1>
              
              <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm mb-6 md:mb-8">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  {car.make} {car.model} ({car.plate})
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-8">
                  {/* Business Trips */}
                  <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-white/40 dark:border-slate-700/50 shadow-lg flex flex-col items-center sm:items-start">
                      <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                          <Briefcase className="w-4 h-4" />
                          <p className="text-[10px] md:text-xs uppercase font-bold tracking-wider">Üzleti</p>
                      </div>
                      <p className="text-xl md:text-2xl font-black text-blue-600 dark:text-blue-400">{totalBusinessKm} km</p>
                  </div>
                  {/* Personal Trips */}
                  <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-white/40 dark:border-slate-700/50 shadow-lg flex flex-col items-center sm:items-start">
                      <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                          <Home className="w-4 h-4" />
                          <p className="text-[10px] md:text-xs uppercase font-bold tracking-wider">Magán</p>
                      </div>
                      <p className="text-xl md:text-2xl font-black text-purple-600 dark:text-purple-400">{totalPersonalKm} km</p>
                  </div>
                  {/* Business Ratio */}
                  <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-white/40 dark:border-slate-700/50 shadow-lg flex flex-col justify-center">
                      <div className="flex justify-between items-end mb-2 w-full">
                          <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Céges Arány</p>
                          <p className="text-lg md:text-xl font-black text-slate-900 dark:text-white">{businessRatio}%</p>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${businessRatio}%` }}></div>
                      </div>
                  </div>
              </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-4 relative z-20 space-y-6 md:space-y-8">
            
            {/* Trip Form */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl md:rounded-[2.5rem] shadow-2xl p-1 md:p-2 border border-white/20 dark:border-slate-700 overflow-hidden">
                <TripForm carId={car.id} defaultDate={today} />
            </div>

            {/* Trip List */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl md:rounded-[2.5rem] border border-white/40 dark:border-slate-700/50 shadow-xl overflow-hidden">
              <div className="px-6 md:px-8 py-5 md:py-6 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base md:text-lg flex items-center gap-2">
                      <Map className="w-5 h-5 text-slate-400" /> Rögzített utak
                  </h3>
                  <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 dark:text-slate-400">{safeTrips.length} db</span>
              </div>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {safeTrips.length > 0 ? (
                      safeTrips.map((trip: any) => (
                          <div key={trip.id} className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors">
                              <div className="flex items-start gap-3 md:gap-4">
                                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${trip.purpose === 'business' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                      {trip.purpose === 'business' ? <Briefcase className="w-5 h-5 md:w-6 md:h-6" /> : <Home className="w-5 h-5 md:w-6 md:h-6" />}
                                  </div>
                                  <div>
                                      <div className="flex items-center gap-2 text-sm md:text-base font-bold text-slate-900 dark:text-white mb-1 flex-wrap leading-tight">
                                          <span>{trip.start_location}</span>
                                          <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 text-slate-400 rotate-180 shrink-0" />
                                          <span>{trip.end_location}</span>
                                      </div>
                                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1.5 md:mt-0">
                                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                              {new Date(trip.trip_date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}
                                          </span>
                                          <span className="flex items-center gap-1">
                                              <Route className="w-3 h-3" /> {trip.distance} km
                                          </span>
                                      </div>
                                  </div>
                              </div>
                              
                              <form action={deleteTrip} className="self-end sm:self-center">
                                  <input type="hidden" name="trip_id" value={trip.id} />
                                  <input type="hidden" name="car_id" value={car.id} />
                                  <button className="p-2 -mr-2 sm:mr-0 text-slate-400 hover:text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl" title="Törlés">
                                      <Trash2 className="w-5 h-5" />
                                  </button>
                              </form>
                          </div>
                      ))
                  ) : (
                      <div className="py-16 text-center text-slate-500 text-sm">Még nincs rögzített út.</div>
                  )}
              </div>
            </div>
        </div>

      </div>
    </div>
  )
}