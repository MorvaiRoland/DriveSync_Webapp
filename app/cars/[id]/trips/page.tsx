import { createClient } from 'supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { addTrip, deleteTrip } from '../actions'

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

  // Statisztika
  const totalBusinessKm = safeTrips.filter(t => t.purpose === 'business').reduce((sum, t) => sum + t.distance, 0)
  const totalPersonalKm = safeTrips.filter(t => t.purpose === 'personal').reduce((sum, t) => sum + t.distance, 0)
  const totalKm = totalBusinessKm + totalPersonalKm
  const businessRatio = totalKm > 0 ? Math.round((totalBusinessKm / totalKm) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* Fejléc */}
      <div className="bg-slate-900 pt-10 pb-20 px-4 shadow-lg">
         <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href={`/cars/${car.id}`} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Útnyilvántartás</h1>
                    <p className="text-slate-400 text-sm">{car.make} {car.model} ({car.plate})</p>
                </div>
            </div>

            {/* Statisztika Kártyák */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-slate-300 uppercase font-bold">Üzleti utak</p>
                    <p className="text-xl font-black text-amber-400">{totalBusinessKm.toLocaleString()} km</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-slate-300 uppercase font-bold">Magán utak</p>
                    <p className="text-xl font-black text-white">{totalPersonalKm.toLocaleString()} km</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-amber-500/20" style={{ width: `${businessRatio}%` }}></div>
                    <div className="relative z-10">
                        <p className="text-xs text-slate-300 uppercase font-bold">Céges Arány</p>
                        <p className="text-xl font-black text-white">{businessRatio}%</p>
                    </div>
                </div>
            </div>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10 space-y-8">
         
         {/* Új Út Rögzítése */}
         <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Új út rögzítése
            </h3>
            <form action={addTrip} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <input type="hidden" name="car_id" value={car.id} />
                
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Dátum</label>
                    <input type="date" name="trip_date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full rounded-lg border-slate-300 text-sm py-2" required />
                </div>
                <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Honnan</label>
                    <input type="text" name="start_location" placeholder="Indulás" className="w-full rounded-lg border-slate-300 text-sm py-2" required />
                </div>
                <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Hova</label>
                    <input type="text" name="end_location" placeholder="Érkezés" className="w-full rounded-lg border-slate-300 text-sm py-2" required />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Táv (km)</label>
                    <input type="number" name="distance" placeholder="0" className="w-full rounded-lg border-slate-300 text-sm py-2" required />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Típus</label>
                    <select name="purpose" className="w-full rounded-lg border-slate-300 text-sm py-2">
                        <option value="business">Céges 💼</option>
                        <option value="personal">Magán 🏠</option>
                    </select>
                </div>
                <div className="md:col-span-12">
                    <button type="submit" className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-lg hover:bg-slate-800 transition-colors">Rögzítés</button>
                </div>
            </form>
         </div>

         {/* Napló Lista */}
         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800">Rögzített utak</h3>
            </div>
            <div className="divide-y divide-slate-100">
                {safeTrips.length > 0 ? (
                    safeTrips.map((trip: any) => (
                        <div key={trip.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-amber-50/30 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${trip.purpose === 'business' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                    {trip.purpose === 'business' ? '💼' : '🏠'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                        <span>{trip.start_location}</span>
                                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        <span>{trip.end_location}</span>
                                    </div>
                                    <p className="text-xs text-slate-500">{new Date(trip.trip_date).toLocaleDateString('hu-HU')} • {trip.distance} km</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${trip.purpose === 'business' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                                    {trip.purpose === 'business' ? 'Üzleti' : 'Magán'}
                                </span>
                                <form action={deleteTrip}>
                                    <input type="hidden" name="trip_id" value={trip.id} />
                                    <input type="hidden" name="car_id" value={car.id} />
                                    <button className="text-slate-300 hover:text-red-500 p-2 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center py-8 text-slate-400 text-sm italic">Nincs rögzített út.</p>
                )}
            </div>
         </div>

      </div>
    </div>
  )
}