'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { addTrip } from '@/app/cars/[id]/actions'
import LocationAutocomplete from '@/components/LocationAutocomplete'

const TripMap = dynamic(() => import('@/components/TripMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-500 text-sm">
      Térkép betöltése…
    </div>
  ),
})

export default function TripForm({ carId }: { carId: string }) {
  const [startCoords, setStartCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [endCoords, setEndCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [calculatedDistance, setCalculatedDistance] = useState('')
  const [routeGeoJson, setRouteGeoJson] = useState<any>(null)

  const fetchDirections = async (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
  ) => {
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&overview=full&access_token=${token}`
      )
      const data = await res.json()

      if (data.routes?.length) {
        const route = data.routes[0]
        setCalculatedDistance(Math.round(route.distance / 1000).toString())
        setRouteGeoJson({
          type: 'Feature',
          geometry: route.geometry,
          properties: {},
        })
      }
    } catch (e) {
      console.error('Directions error:', e)
    }
  }

  const handleLocationSelect = async (
    type: 'start' | 'end',
    lat: number,
    lng: number,
    name: string
  ) => {
    if (type === 'start') setStartCoords({ lat, lng })
    else setEndCoords({ lat, lng })

    const currentStart = type === 'start' ? { lat, lng } : startCoords
    const currentEnd = type === 'end' ? { lat, lng } : endCoords

    if (currentStart && currentEnd) {
      await fetchDirections(currentStart, currentEnd)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-100">
        Új út rögzítése
      </h3>

      <form
        action={async (formData) => {
          await addTrip(formData)
        }}
        className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start"
      >
        <input type="hidden" name="car_id" value={carId} />

        {/* BAL OLDAL */}
        <div className="md:col-span-6 space-y-4">
          <input
            type="date"
            name="trip_date"
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
            required
          />

          <LocationAutocomplete
            label="Honnan"
            namePrefix="start"
            placeholder="Város, utca…"
            onSelect={(lat, lng, name) =>
              handleLocationSelect('start', lat, lng, name)
            }
            required
          />

          <LocationAutocomplete
            label="Hova"
            namePrefix="end"
            placeholder="Város, utca…"
            onSelect={(lat, lng, name) =>
              handleLocationSelect('end', lat, lng, name)
            }
            required
          />

          <input
            type="number"
            name="distance"
            value={calculatedDistance}
            onChange={(e) => setCalculatedDistance(e.target.value)}
            placeholder="Táv (km)"
            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
            required
          />

          <select
            name="purpose"
            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
          >
            <option value="business">Céges 💼</option>
            <option value="personal">Magán 🏠</option>
          </select>

          <button className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-lg">
            Rögzítés
          </button>
        </div>

        {/* JOBB OLDAL – MAP */}
        <div className="md:col-span-6 relative h-[400px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900">
          <TripMap
            startPos={startCoords ? [startCoords.lat, startCoords.lng] : null}
            endPos={endCoords ? [endCoords.lat, endCoords.lng] : null}
            routeGeoJson={routeGeoJson}
          />

          {!startCoords && !endCoords && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-sm text-slate-400 bg-black/40 px-3 py-1 rounded-full">
                Válassz indulási és érkezési pontot
              </span>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
