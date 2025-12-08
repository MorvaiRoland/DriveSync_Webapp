'use client'

import { useState, useEffect, useRef } from 'react'

type LocationResult = {
  lat: string
  lon: string
  display_name: string
}

type Props = {
  label: string
  namePrefix: string
  onSelect: (lat: number, lng: number, name: string) => void
  placeholder: string
  required?: boolean
}

export default function LocationAutocomplete({ label, namePrefix, onSelect, placeholder, required }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LocationResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true)
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=hu&limit=5`)
          const data = await res.json()
          setResults(data)
          setShowDropdown(true)
        } catch (e) {
          console.error(e)
        } finally {
          setLoading(false)
        }
      } else {
        setResults([])
        setShowDropdown(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (item: LocationResult) => {
    const cityName = item.display_name.split(',')[0]
    setQuery(cityName)
    setShowDropdown(false)
    onSelect(parseFloat(item.lat), parseFloat(item.lon), cityName)
  }

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="space-y-1 relative" ref={wrapperRef}>
      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</label>
      
      <input 
        type="text" 
        name={`${namePrefix}_location`} 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm py-2 px-3 shadow-sm focus:border-amber-500 focus:ring-amber-500 transition-colors"
      />
      
      {/* Rejtett inputok a koordinátáknak */}
      <input type="hidden" name={`${namePrefix}_lat`} id={`${namePrefix}_lat_input`} />
      <input type="hidden" name={`${namePrefix}_lng`} id={`${namePrefix}_lng_input`} />

      {loading && <div className="absolute right-3 top-8 text-slate-400 text-xs">...</div>}

      {showDropdown && results.length > 0 && (
        <ul className="absolute z-50 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl mt-1 max-h-48 overflow-auto">
          {results.map((item, index) => (
            <li 
              key={index}
              onClick={() => handleSelect(item)}
              className="px-3 py-2 hover:bg-amber-50 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700/50 last:border-0"
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}