// components/LocationAutocomplete.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2 } from 'lucide-react' // Vagy a te ikonjaid

interface Props {
  label: string
  namePrefix: string
  placeholder: string
  onSelect: (lat: number, lng: number, placeName: string) => void
  required?: boolean
}

export default function LocationAutocomplete({ label, namePrefix, placeholder, onSelect, required }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Keresés debounce-al
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true)
        try {
          const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&types=place,address&language=hu&country=hu`
          )
          const data = await res.json()
          setResults(data.features || [])
          setIsOpen(true)
        } catch (error) {
          console.error('Geocoding error:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 500) // 500ms várakozás gépelés után

    return () => clearTimeout(timer)
  }, [query])

  // Klikk kívülre bezárja a listát
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (feature: any) => {
    const [lng, lat] = feature.center
    const name = feature.place_name
    setQuery(name)
    setIsOpen(false)
    onSelect(lat, lng, name)
  }

  return (
    <div className="space-y-1 relative" ref={wrapperRef}>
      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">{label}</label>
      
      <input type="hidden" name={`${namePrefix}_location`} value={query} />
      <input type="hidden" id={`${namePrefix}_lat_input`} name={`${namePrefix}_lat`} />
      <input type="hidden" id={`${namePrefix}_lng_input`} name={`${namePrefix}_lng`} />

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm py-2 px-3 pl-9 shadow-sm focus:border-amber-500 focus:ring-amber-500 transition-colors"
          autoComplete="off"
        />
        <div className="absolute left-2.5 top-2.5 text-slate-400">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl max-h-60 overflow-y-auto mt-1">
          {results.map((feature) => (
            <li
              key={feature.id}
              onClick={() => handleSelect(feature)}
              className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 last:border-0"
            >
              {feature.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}