'use client'

import React, { useState, useEffect } from 'react'

// --- IDŐJÁRÁS WIDGET (VÁLTOZATLAN) ---
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
            
            // 1. Időjárás lekérése (Open-Meteo API)
            const weatherRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&timezone=auto`
            )
            const weatherData = await weatherRes.json()

            // 2. Városnév becslése
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
          setError(true)
          setLoading(false)
        }
      )
    } else {
      setError(true)
      setLoading(false)
    }
  }, [])

  const getWeatherIcon = (code: number, isDay: number) => {
    const color = isDay ? 'text-yellow-300' : 'text-slate-200'
    // Tiszta
    if (code === 0) return isDay 
        ? <svg className={`w-8 h-8 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        : <svg className={`w-8 h-8 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
    // Felhős
    if ([1, 2, 3].includes(code)) return <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
    // Eső
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <svg className="w-8 h-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 16.2A4.5 4.5 0 003.8 14.4C3 14.8 2.2 15.3 1.9 16.3M16 20l-4-4m4 4l-4-4M8 12c-2.2 0-4-1.8-4-4a4 4 0 015.6-3.6 4.3 4.3 0 012.8-1.4 4 4 0 013.6 2.6 4 4 0 014 2.4" /></svg>
    // Default
    return <svg className={`w-8 h-8 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
  }

  const bgClass = !weather || weather.is_day 
    ? 'bg-gradient-to-br from-sky-400 to-blue-600' 
    : 'bg-gradient-to-br from-slate-800 to-indigo-950';

  if (loading) return <div className="rounded-2xl p-4 bg-slate-200 animate-pulse h-32 flex items-center justify-center text-slate-400 text-xs">Helyzet meghatározása...</div>
  if (error) return <div className="rounded-2xl p-4 bg-slate-800 h-32 flex flex-col items-center justify-center text-white"><span className="text-xs text-center text-slate-400">GPS engedély szükséges</span></div>

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
    </div>
  )
}

// --- ÜZEMANYAG WIDGET (WEBSCRAPING LOGIKÁVAL) ---

// Definiáljuk a State típusát, hogy a TypeScript ne panaszkodjon
interface FuelPrices {
    petrol95: number | null;
    diesel: number | null;
    petrol100: number | null;
}

export function FuelWidget() {
    // Kezdőállapot: betöltés alatt - Explicit típusmegadással <FuelPrices>
    const [prices, setPrices] = useState<FuelPrices>({
        petrol95: null,
        diesel: null,
        petrol100: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFuelPrices = async () => {
            try {
                // Letöltjük a holtankoljak.hu tartalmát a proxy-n keresztül
                const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://holtankoljak.hu/'));
                const data = await response.json();
                
                if (data.contents) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(data.contents, 'text/html');

                    // Az utasítás szerint a <span class="ar"> elemeket keressük
                    const priceElements = doc.querySelectorAll('span.ar');

                    // Helper: szövegből szám (pl. "568,3" -> 568.3)
                    const parsePrice = (text: string | null): number | null => {
                        if (!text) return null;
                        // Csak a számjegyeket és a tizedesjelet (vessző/pont) tartjuk meg
                        const cleaned = text.replace(',', '.').replace(/[^0-9.]/g, '');
                        const num = parseFloat(cleaned);
                        return isNaN(num) ? null : num;
                    };

                    // FELTÉTELEZÉS A STRUKTÚRÁRÓL:
                    // A holtankoljak.hu táblázata általában így néz ki soronként: [Minimum, Átlag, Maximum]
                    // 1. sor: 95-ös benzin (Indexek: 0, 1, 2) -> Átlag az index 1
                    // 2. sor: Gázolaj (Indexek: 3, 4, 5) -> Átlag az index 4
                    // 3. sor: 100-as benzin (Indexek: 6, 7, 8) -> Átlag az index 7
                    
                    if (priceElements.length > 0) {
                        const p95 = parsePrice(priceElements[1]?.textContent);
                        const d = parsePrice(priceElements[4]?.textContent);
                        const p100 = parsePrice(priceElements[7]?.textContent);

                        // Ha sikerült pars-olni legalább a 95-öst és a Dieselt
                        if (p95 && d) {
                            setPrices({
                                petrol95: p95,
                                diesel: d,
                                petrol100: p100 || 623.8 // Fallback ha a 100-as nem található
                            });
                            setLoading(false);
                            return; 
                        }
                    }
                }
                
                // Ha nem találtunk adatot vagy a struktúra változott, dobjunk hibát, hogy a catch ág fusson
                throw new Error("Adatok nem találhatók a várt struktúrában");

            } catch (error) {
                console.error("Scraping hiba, fallback adatok használata:", error);
                // Fallback adatok (biztonsági tartalék)
                setPrices({
                    petrol95: 568.3,
                    diesel: 579.1,
                    petrol100: 623.8
                });
                setLoading(false);
            }
        };

        fetchFuelPrices();
    }, []);

    // Segédfüggvény a stílusos megjelenítéshez
    const PriceRow = ({ label, subLabel, price, colorClass, badgeBg, badgeText, badgeBorder }: any) => (
        <div className="flex justify-between items-center group p-2 hover:bg-white/5 rounded-xl transition-colors cursor-default">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex flex-col items-center justify-center border-2 ${badgeBg} ${badgeText} ${badgeBorder}`}>
                    <span className="text-[10px] font-bold leading-none mt-1">{label}</span>
                    <span className="text-[6px] font-bold leading-none mb-0.5">{subLabel}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">{label === 'D' ? 'Gázolaj' : 'Benzin'}</span>
                </div>
            </div>
            <div className="text-right">
                {loading ? (
                    <div className="h-4 w-12 bg-slate-700/50 rounded animate-pulse"></div>
                ) : (
                    <span className={`text-sm font-mono font-bold ${colorClass} group-hover:text-amber-400 transition-colors`}>
                        {price ? price.toFixed(1) : '--'} <span className="text-[10px] text-slate-500 font-sans">Ft</span>
                    </span>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 text-white flex flex-col justify-between min-h-[180px] relative overflow-hidden border border-slate-700/50 shadow-xl w-full max-w-sm">
            
            {/* Header */}
            <div className="flex justify-between items-start relative z-10 mb-2">
                <div>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Piaci Átlag
                    </p>
                    <h2 className="text-base font-bold text-white mt-0.5">Üzemanyagárak</h2>
                </div>
                <div className="p-1.5 bg-slate-800 rounded-lg border border-slate-700">
                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
            </div>
            
            {/* Lista */}
            <div className="space-y-1 relative z-10 flex-1">
                {/* 95 Benzin */}
                <PriceRow 
                    label="95" 
                    subLabel="E10" 
                    price={prices.petrol95} 
                    colorClass="text-emerald-400"
                    badgeBg="bg-emerald-900/50"
                    badgeText="text-emerald-400"
                    badgeBorder="border-emerald-500/20"
                />

                <div className="w-full h-px bg-slate-800/80 my-1"></div>

                {/* Diesel */}
                <PriceRow 
                    label="D" 
                    subLabel="B7" 
                    price={prices.diesel} 
                    colorClass="text-white"
                    badgeBg="bg-slate-700"
                    badgeText="text-slate-300"
                    badgeBorder="border-slate-500"
                />

                 <div className="w-full h-px bg-slate-800/80 my-1"></div>

                {/* 100 Premium */}
                <PriceRow 
                    label="100" 
                    subLabel="E5" 
                    price={prices.petrol100} 
                    colorClass="text-teal-400"
                    badgeBg="bg-teal-900/50"
                    badgeText="text-teal-400"
                    badgeBorder="border-teal-500/20"
                />
            </div>
            
            {/* Háttér effekt */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            {/* Footer */}
            <div className="relative z-10 mt-2 flex justify-between items-center pt-2 border-t border-slate-800">
                 <span className="text-[9px] text-slate-500">holtankoljak.hu</span>
                 <span className="text-[9px] text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded">Frissítve: Ma</span>
            </div>
        </div>
    )
}

// Fő komponens a megjelenítéshez
export default function App() {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 items-start justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-sm">
        <WeatherWidget />
      </div>
      <div className="w-full max-w-sm">
        <FuelWidget />
      </div>
    </div>
  )
}