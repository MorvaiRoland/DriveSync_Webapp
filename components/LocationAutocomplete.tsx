'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

interface LocationAutocompleteProps {
  label: string
  namePrefix: string
  placeholder: string
  required?: boolean
  onSelect: (lat: number, lng: number, placeName: string) => void
}

export default function LocationAutocomplete({
  label,
  namePrefix,
  placeholder,
  required,
  onSelect,
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false) // Ez a kulcs a hibádhoz!
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Keresés debounce-al (hogy ne minden leütésre keressen azonnal)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2 && isOpen) { // Csak akkor keresünk, ha NYITVA van (tehát gépelünk)
        setLoading(true)
        try {
          const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
          if (!token) return

          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
              query
            )}.json?access_token=${token}&autocomplete=true&types=place,address,poi&country=hu`
          )
          const data = await res.json()
          setSuggestions(data.features || [])
        } catch (error) {
          console.error('Keresési hiba:', error)
          setSuggestions([])
        } finally {
          setLoading(false)
        }
      } else if (query.length <= 2) {
        setSuggestions([])
      }
    }, 300) // 300ms késleltetés

    return () => clearTimeout(timer)
  }, [query, isOpen])

  // Kattintás kezelése a listán kívül (hogy bezáródjon, ha mellé kattintasz)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (place: any) => {
    // 1. Beírjuk a teljes nevet
    setQuery(place.place_name)
    
    // 2. FONTOS: Azonnal bezárjuk a listát és töröljük a javaslatokat
    setIsOpen(false)
    setSuggestions([])

    // 3. Visszaadjuk az adatokat a szülőnek
    const [lng, lat] = place.center
    onSelect(lat, lng, place.place_name)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setIsOpen(true) // Ha gépel, nyissa ki újra
  }

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Rejtett inputok, hogy a form data működjön (Next.js Server Actions-höz) */}
      <input type="hidden" name={`${namePrefix}_location`} value={query} />
      
      {/* Látható input */}
      {label && <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">{label}</label>}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
             if (query.length > 2) setIsOpen(true)
          }}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 pl-9 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          autoComplete="off"
        />
        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        
        {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
        )}
      </div>

      {/* Javaslatok Lista */}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((place) => (
            <li
              key={place.id}
              onClick={() => handleSelect(place)}
              className="px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700/50 last:border-0 flex items-start gap-2 group transition-colors"
            >
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 group-hover:text-blue-500 transition-colors shrink-0" />
              <span className="text-slate-700 dark:text-slate-200">{place.place_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}