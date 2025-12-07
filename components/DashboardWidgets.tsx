'use client'

import { useState, useEffect } from 'react'

// --- IDŐJÁRÁS WIDGET (VALÓS ADATOKKAL) ---
export function WeatherWidget() {
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [city, setCity] = useState("Helyzet...")

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            
            // 1. Időjárás lekérése (Open-Meteo API - Ingyenes)
            const weatherRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&timezone=auto`
            )
            const weatherData = await weatherRes.json()

            // 2. Városnév becslése (BigDataCloud Free API)
            try {
                const cityRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=hu`)
                const cityData = await cityRes.json()
                setCity(cityData.city || cityData.locality || "Helyi időjárás")
            } catch {
                setCity("Helyi időjárás")
            }

            setWeather(weatherData.current)
            setLoading(false)
          } catch (e) {
            console.error(e)
            setError(true)
            setLoading(false)
          }
        },
        () => {
          setError(true) // Ha a felhasználó nem engedélyezi a GPS-t
          setLoading(false)
        }
      )
    } else {
      setError(true)
      setLoading(false)
    }
  }, [])

  // WMO Időjárás kódok ikonhoz
  const getWeatherIcon = (code: number, isDay: number) => {
    const color = isDay ? 'text-yellow-300' : 'text-slate-200'
    
    // Tiszta égbolt
    if (code === 0) return isDay 
        ? <svg className={`w-8 h-8 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        : <svg className={`w-8 h-8 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
    
    // Felhős
    if ([1, 2, 3].includes(code)) return <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
    
    // Eső
    if ([51, 53, 55, 61, 63, 65].includes(code)) return <svg className="w-8 h-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 16.2A4.5 4.5 0 003.8 14.4C3 14.8 2.2 15.3 1.9 16.3M16 20l-4-4m4 4l-4-4M8 12c-2.2 0-4-1.8-4-4a4 4 0 015.6-3.6 4.3 4.3 0 012.8-1.4 4 4 0 013.6 2.6 4 4 0 014 2.4" /></svg>

    // Default
    return <svg className={`w-8 h-8 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
  }

  // Háttér szín napszak alapján
  const bgClass = !weather || weather.is_day 
    ? 'bg-gradient-to-br from-sky-400 to-blue-600' 
    : 'bg-gradient-to-br from-slate-800 to-indigo-950';

  if (loading) return (
    <div className="rounded-2xl p-4 bg-slate-200 animate-pulse h-32 flex items-center justify-center text-slate-400 text-xs">
        Helyzet meghatározása...
    </div>
  )

  if (error) return (
    <div className="rounded-2xl p-4 bg-slate-800 h-32 flex flex-col items-center justify-center text-white">
        <svg className="w-6 h-6 mb-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <span className="text-xs text-center text-slate-400">GPS engedély szükséges</span>
    </div>
  )

  return (
    <div className={`rounded-2xl p-4 text-white flex flex-col justify-between h-32 relative overflow-hidden shadow-lg border border-white/10 ${bgClass}`}>
        <div className="relative z-10">
            <p className="text-xs font-bold opacity-90 uppercase tracking-wider flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {city}
            </p>
            <div className="flex items-center gap-3 mt-1">
                <span className="text-4xl font-black tracking-tighter">{Math.round(weather.temperature_2m)}°</span>
                {getWeatherIcon(weather.weather_code, weather.is_day)}
            </div>
        </div>
        <div className="relative z-10 flex justify-between items-end">
             <p className="text-[10px] font-medium opacity-70">
                 {weather.is_day ? 'Nappal' : 'Éjszaka'} • Frissítve
             </p>
        </div>
        {/* Dekoratív elemek */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
        <div className="absolute top-0 right-0 p-2 opacity-20 text-[8px]">Open-Meteo</div>
    </div>
  )
}

// --- ÜZEMANYAG WIDGET ---
export function FuelWidget() {
    return (
        <div className="bg-slate-900 rounded-2xl p-4 text-white flex flex-col justify-between h-32 relative overflow-hidden border border-slate-800 shadow-lg">
            <div className="flex justify-between items-start relative z-10">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Piaci Átlag
                </p>
                <div className="p-1.5 bg-slate-800 rounded-lg border border-slate-700">
                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
            </div>
            
            <div className="space-y-3 relative z-10 mt-1">
                <div className="flex justify-between items-center group">
                    <div className="flex items-center gap-2">
                        <span className="w-6 text-center text-xs font-bold bg-green-900/50 text-green-400 rounded px-1">95</span>
                        <span className="text-xs font-bold text-slate-300">Benzin</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-white group-hover:text-amber-400 transition-colors">618 Ft</span>
                </div>
                <div className="w-full h-[1px] bg-slate-800"></div>
                <div className="flex justify-between items-center group">
                    <div className="flex items-center gap-2">
                         <span className="w-6 text-center text-xs font-bold bg-slate-800 text-slate-400 rounded px-1">D</span>
                         <span className="text-xs font-bold text-slate-300">Diesel</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-white group-hover:text-amber-400 transition-colors">625 Ft</span>
                </div>
            </div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>
    )
}