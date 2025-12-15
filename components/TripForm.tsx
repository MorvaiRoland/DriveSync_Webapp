// components/TripForm.tsx
'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { addTrip } from '@/app/cars/[id]/actions' // Ellenőrizd az útvonalat!
import LocationAutocomplete from '@/components/LocationAutocomplete'

// Dinamikus import, hogy ne legyen SSR hiba a mapbox-gl miatt
const TripMap = dynamic(() => import('@/components/TripMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500">Térkép betöltése...</div>
})

export default function TripForm({ carId }: { carId: string }) {
  const [startCoords, setStartCoords] = useState<{lat: number, lng: number} | null>(null)
  const [endCoords, setEndCoords] = useState<{lat: number, lng: number} | null>(null)
  const [calculatedDistance, setCalculatedDistance] = useState<string>('')
  const [routeGeoJson, setRouteGeoJson] = useState<any>(null) // Új state a vonalnak

  const fetchDirections = async (start: {lat: number, lng: number}, end: {lat: number, lng: number}) => {
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      // Mapbox Directions API: driving profile, geojson geometry
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&overview=full&access_token=${token}`
      
      const res = await fetch(url)
      const data = await res.json()

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        // Távolság (méterben jön -> km)
        const distanceKm = Math.round(route.distance / 1000)
        setCalculatedDistance(distanceKm.toString())
        
        // Útvonal geometria a térképnek
        setRouteGeoJson({
          type: 'Feature',
          properties: {},
          geometry: route.geometry
        })
      }
    } catch (error) {
      console.error("Hiba az útvonal számításnál:", error)
    }
  }

  const handleLocationSelect = async (type: 'start' | 'end', lat: number, lng: number, name: string) => {
    // 1. State frissítés
    if (type === 'start') setStartCoords({ lat, lng })
    else setEndCoords({ lat, lng })

    // 2. Inputok frissítése (HTML Formhoz)
    const latInput = document.getElementById(`${type}_lat_input`) as HTMLInputElement
    const lngInput = document.getElementById(`${type}_lng_input`) as HTMLInputElement
    if (latInput) latInput.value = lat.toString()
    if (lngInput) lngInput.value = lng.toString()

    // 3. API Hívás, ha mindkét pont megvan
    const currentStart = type === 'start' ? { lat, lng } : startCoords
    const currentEnd = type === 'end' ? { lat, lng } : endCoords

    if (currentStart && currentEnd) {
      await fetchDirections(currentStart, currentEnd)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700 transition-colors">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Új út rögzítése
        </h3>

        <form action={async (formData) => { await addTrip(formData) }} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <input type="hidden" name="car_id" value={carId} />
            
            {/* BAL OSZLOP */}
            <div className="md:col-span-6 space-y-4">
                <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">Dátum</label>
                    <input type="date" name="trip_date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm py-2 px-3 shadow-sm focus:border-amber-500 focus:ring-amber-500 transition-colors" required />
                </div>

                <LocationAutocomplete 
                    label="Honnan" 
                    namePrefix="start" 
                    placeholder="Város, utca..." 
                    onSelect={(lat, lng, name) => handleLocationSelect('start', lat, lng, name)}
                    required
                />
                
                <LocationAutocomplete 
                    label="Hova" 
                    namePrefix="end" 
                    placeholder="Város, utca..." 
                    onSelect={(lat, lng, name) => handleLocationSelect('end', lat, lng, name)}
                    required
                />

                <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">Táv (km)</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            name="distance" 
                            value={calculatedDistance}
                            onChange={(e) => setCalculatedDistance(e.target.value)}
                            placeholder="0" 
                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm py-2 px-3 shadow-sm focus:border-amber-500 focus:ring-amber-500 transition-colors" 
                            required 
                        />
                        {calculatedDistance && startCoords && endCoords && (
                            <span className="absolute right-3 top-2.5 text-xs text-emerald-500 font-bold flex items-center gap-1">
                                ✨ Mapbox
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">Típus</label>
                    <select name="purpose" className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm py-2 px-3 shadow-sm focus:border-amber-500 focus:ring-amber-500 transition-colors">
                        <option value="business">Céges 💼</option>
                        <option value="personal">Magán 🏠</option>
                    </select>
                </div>
                
                <button type="submit" className="w-full bg-slate-900 dark:bg-slate-700 text-white font-bold py-2.5 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-md active:scale-[0.99]">Rögzítés</button>
            </div>

            {/* JOBB OSZLOP: Mapbox Térkép */}
            <div className="md:col-span-6 w-full h-[400px] bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden shadow-inner z-0">
                <TripMap 
                    startPos={startCoords ? [startCoords.lat, startCoords.lng] : null} 
                    endPos={endCoords ? [endCoords.lat, endCoords.lng] : null} 
                    routeGeoJson={routeGeoJson}
                />
                
                {!startCoords && !endCoords && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
                        <p className="text-slate-400 text-sm bg-white/80 dark:bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                            Válassz indulási és érkezési pontot
                        </p>
                    </div>
                )}
            </div>
        </form>
    </div>
  )
}