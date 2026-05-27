'use client'

import React, { useState, useEffect } from 'react'
import { MapPin, Droplets, Wind } from 'lucide-react'

// =============================================
// WEATHER WIDGET – Glass, light/dark ready
// =============================================
export function WeatherWidget() {
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [city, setCity] = useState('Helyzet...')

  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout

    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const [weatherRes, cityRes] = await Promise.allSettled([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day,relative_humidity_2m,wind_speed_10m&timezone=auto`),
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=hu`)
        ])

        if (weatherRes.status === 'fulfilled' && weatherRes.value.ok) {
          const d = await weatherRes.value.json()
          if (isMounted) setWeather(d.current)
        }
        if (cityRes.status === 'fulfilled' && cityRes.value.ok) {
          const d = await cityRes.value.json()
          if (isMounted) setCity(d.city || d.locality || 'Helyi időjárás')
        }
      } catch {
        if (isMounted) setError(true)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    const fallback = () => {
      if (isMounted) { fetchWeather(47.4979, 19.0402); setCity('Budapest') }
    }

    if ('geolocation' in navigator) {
      timeoutId = setTimeout(fallback, 5000)
      navigator.geolocation.getCurrentPosition(
        (pos) => { clearTimeout(timeoutId); fetchWeather(pos.coords.latitude, pos.coords.longitude) },
        () => { clearTimeout(timeoutId); fallback() },
        { timeout: 5000 }
      )
    } else {
      fallback()
    }

    return () => { isMounted = false; clearTimeout(timeoutId) }
  }, [])

  // Weather emoji + description
  const getWeatherInfo = (code: number, isDay: number) => {
    if (code === 0) return { emoji: isDay ? '☀️' : '🌙', desc: isDay ? 'Derült' : 'Tiszta éj' }
    if ([1, 2].includes(code)) return { emoji: '⛅', desc: 'Részben felhős' }
    if (code === 3) return { emoji: '☁️', desc: 'Borult' }
    if ([45, 48].includes(code)) return { emoji: '🌫️', desc: 'Köd' }
    if ([51, 53, 55, 56, 57].includes(code)) return { emoji: '🌦️', desc: 'Szitálás' }
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { emoji: '🌧️', desc: 'Eső' }
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { emoji: '❄️', desc: 'Hó' }
    if ([95, 96, 99].includes(code)) return { emoji: '⛈️', desc: 'Zivatar' }
    return { emoji: '🌤️', desc: 'Változékony' }
  }

  // BG gradient based on weather & time
  const getBg = (isDay: number, code: number) => {
    if (!isDay) return 'from-slate-800 to-slate-900'
    if (code === 0) return 'from-sky-400 to-blue-500'
    if ([1, 2, 3].includes(code)) return 'from-slate-400 to-slate-500'
    if ([61, 63, 65, 80, 81, 82].includes(code)) return 'from-slate-600 to-slate-700'
    return 'from-sky-500 to-blue-600'
  }

  if (loading) {
    return (
      <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-sky-400 to-blue-500 p-6 animate-pulse">
        <div className="h-4 w-24 bg-white/30 rounded mb-3" />
        <div className="h-12 w-20 bg-white/30 rounded mb-2" />
        <div className="h-3 w-16 bg-white/20 rounded" />
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-slate-500 to-slate-600 p-6 text-white/70 text-sm text-center">
        Időjárás nem elérhető
      </div>
    )
  }

  const { emoji, desc } = getWeatherInfo(weather.weather_code, weather.is_day)
  const bg = getBg(weather.is_day, weather.weather_code)

  return (
    <div className={`rounded-3xl bg-gradient-to-br ${bg} p-6 text-white relative overflow-hidden shadow-lg`}>
      {/* Decorative circle */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/5 rounded-full" />

      <div className="relative z-10">
        {/* City */}
        <div className="flex items-center gap-1.5 text-white/70 text-xs font-semibold mb-3 uppercase tracking-widest">
          <MapPin className="w-3.5 h-3.5" />
          {city}
        </div>

        {/* Main temp */}
        <div className="flex items-end gap-4 mb-4">
          <span className="text-6xl font-thin tracking-tighter leading-none">
            {Math.round(weather.temperature_2m)}°
          </span>
          <div className="pb-1">
            <div className="text-4xl mb-1">{emoji}</div>
            <div className="text-white/80 text-sm font-medium">{desc}</div>
          </div>
        </div>

        {/* Details row */}
        <div className="flex gap-4 text-white/60 text-xs font-medium">
          {weather.relative_humidity_2m !== undefined && (
            <span className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5" />
              {weather.relative_humidity_2m}%
            </span>
          )}
          {weather.wind_speed_10m !== undefined && (
            <span className="flex items-center gap-1">
              <Wind className="w-3.5 h-3.5" />
              {Math.round(weather.wind_speed_10m)} km/h
            </span>
          )}
          <span className="ml-auto">{weather.is_day ? 'Nappal' : 'Éjszaka'}</span>
        </div>
      </div>
    </div>
  )
}

// =============================================
// FUEL WIDGET – Glass, light/dark ready
// =============================================
interface FuelPrices {
  petrol95: number | null
  diesel: number | null
  petrol100: number | null
}

export function FuelWidget() {
  const [prices, setPrices] = useState<FuelPrices>({ petrol95: null, diesel: null, petrol100: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFuelPrices = async () => {
      try {
        const res = await fetch('/api/fuel')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length >= 2) {
            setPrices({
              petrol95: data[0]?.price || 568,
              diesel: data[1]?.price || 579,
              petrol100: data[2]?.price || 623,
            })
            return
          }
        }
        throw new Error('no data')
      } catch {
        setPrices({ petrol95: 568, diesel: 579, petrol100: 623 })
      } finally {
        setLoading(false)
      }
    }
    fetchFuelPrices()
  }, [])

  const fuels = [
    { key: '95', label: 'Benzin 95', price: prices.petrol95, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30' },
    { key: 'D', label: 'Gázolaj', price: prices.diesel, color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-white/10 border-slate-200 dark:border-white/10' },
    { key: '100', label: 'Prémium', price: prices.petrol100, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/30' },
  ]

  return (
    <div className="rounded-2xl overflow-hidden
      bg-white/60 dark:bg-white/5
      border border-white/60 dark:border-white/10
      backdrop-blur-xl shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100/60 dark:border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-lg">⛽</span>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Üzemanyagárak</h3>
        </div>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-full">Ma</span>
      </div>
      <div className="p-4 space-y-2">
        {fuels.map((f) => (
          <div key={f.key} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border ${f.bg} ${f.color}`}>
                {f.key}
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{f.label}</span>
            </div>
            {loading ? (
              <div className="h-4 w-14 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
            ) : (
              <span className={`font-bold font-mono text-sm ${f.color}`}>
                {f.price?.toFixed(0)} <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">Ft</span>
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="px-5 py-2 border-t border-slate-100/60 dark:border-white/10">
        <a href="https://holtankoljak.hu" target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-amber-500 transition-colors">
          Forrás: holtankoljak.hu
        </a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <WeatherWidget />
      <FuelWidget />
    </div>
  )
}