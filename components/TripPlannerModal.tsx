'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { 
  Map as MapIcon, Navigation, X, Fuel, Wallet, ArrowRightLeft, 
  Leaf, Clock, TrendingUp, Info, ParkingSquare, MapPin, Locate
} from 'lucide-react'

// Dinamikus import a SAJÁT Mapbox térképedhez
const TripMap = dynamic(() => import('./TripMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center text-slate-400">Térkép betöltése...</div>
});

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function TripPlannerModal({ cars }: { cars: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'route' | 'costs'>('route')
  
  // --- STATE-EK ---
  const [selectedCarId, setSelectedCarId] = useState<number | null>(cars.length > 0 ? cars[0].id : null)
  
  // Helyszínek és Térkép
  const [startQuery, setStartQuery] = useState('')
  const [endQuery, setEndQuery] = useState('')
  const [startCoords, setStartCoords] = useState<[number, number] | null>(null) // [lat, lon]
  const [endCoords, setEndCoords] = useState<[number, number] | null>(null)     // [lat, lon]
  const [routeGeoJson, setRouteGeoJson] = useState<any>(null); // Mapbox GeoJSON
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingStart, setIsSearchingStart] = useState(false);
  
  // Kalkulált adatok
  const [distance, setDistance] = useState<number>(0) // km
  const [duration, setDuration] = useState<number>(0) // perc
  const [isRoundTrip, setIsRoundTrip] = useState(false)
  
  // Költségek
  const [passengers, setPassengers] = useState(1)
  const [fuelPrice, setFuelPrice] = useState(610)
  const [consumption, setConsumption] = useState<number>(7)
  const [tollCost, setTollCost] = useState<number>(0)
  const [parkingCost, setParkingCost] = useState<number>(0)
  const [amortization, setAmortization] = useState<number>(35)

  const selectedCar = cars.find(c => c.id === Number(selectedCarId))
  const isElectric = selectedCar?.fuel_type === 'Elektromos'
  const unit = isElectric ? 'kWh' : 'L'

  // --- AUTOMATIKUS GPS ÉSZLELÉS ---
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setStartCoords([lat, lon]);
        
        // Cím visszakeresése (Mapbox Geocoding API)
        try {
          const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${MAPBOX_TOKEN}`);
          const data = await res.json();
          if (data.features && data.features.length > 0) {
             setStartQuery(data.features[0].place_name);
          } else {
             setStartQuery("Jelenlegi pozíció");
          }
        } catch (e) {
          setStartQuery("Jelenlegi pozíció");
        }
      });
    }
  };

  // --- CÍM KERESÉS (Mapbox Geocoding API) ---
  const searchAddress = async (query: string, isStart: boolean) => {
    if (query.length < 3) return;
    setIsSearchingStart(isStart);
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=3`);
      const data = await res.json();
      setSearchResults(data.features || []);
    } catch (e) {
      console.error("Hiba a keresésben", e);
    }
  };

  const selectAddress = (result: any) => {
    // Mapbox [lon, lat] sorrendet ad vissza, de a komponensünk [lat, lon]-t vár (vagy fordítva, ellenőrizni kell a TripMap-et)
    // A TripMaped kódja: .setLngLat([startPos[1], startPos[0]]) -> tehát [lat, lon] bemenetet vár (mert a Mapbox setLngLat([lon, lat])-ot kér)
    const lon = result.center[0];
    const lat = result.center[1];
    
    if (isSearchingStart) {
      setStartCoords([lat, lon]);
      setStartQuery(result.place_name);
    } else {
      setEndCoords([lat, lon]);
      setEndQuery(result.place_name);
    }
    setSearchResults([]); 
  };

  // --- ÚTVONAL TERVEZÉS (Mapbox Directions API) ---
  useEffect(() => {
    if (startCoords && endCoords && MAPBOX_TOKEN) {
      const fetchRoute = async () => {
        try {
          // Mapbox Directions API: lon,lat;lon,lat
          const startLonLat = `${startCoords[1]},${startCoords[0]}`;
          const endLonLat = `${endCoords[1]},${endCoords[0]}`;
          
          const res = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${startLonLat};${endLonLat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`);
          const data = await res.json();
          
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            setDistance(route.distance / 1000); // méter -> km
            setDuration(route.duration / 60); // mp -> perc
            
            // GeoJSON objektum átadása a térképnek
            setRouteGeoJson({
              type: 'Feature',
              properties: {},
              geometry: route.geometry
            });
          }
        } catch (e) {
          console.error("Útvonaltervezési hiba", e);
        }
      };
      fetchRoute();
    }
  }, [startCoords, endCoords]);

  // --- KÖLTSÉG SZÁMÍTÁS ---
  const totalDistance = isRoundTrip ? distance * 2 : distance
  const totalFuelNeeded = (totalDistance / 100) * consumption
  const totalFuelCost = totalFuelNeeded * fuelPrice
  const totalAmortization = totalDistance * amortization
  const grandTotal = totalFuelCost + totalAmortization + tollCost + parkingCost
  const costPerPerson = grandTotal / passengers

  // Menetidő formázás
  const totalDuration = isRoundTrip ? duration * 2 : duration;
  const hours = Math.floor(totalDuration / 60);
  const minutes = Math.floor(totalDuration % 60);
  
  // Alapértelmezett értékek autó váltáskor
  useEffect(() => {
    if (selectedCar) {
      if (selectedCar.fuel_type === 'Elektromos') {
        setFuelPrice(70); setConsumption(18); setAmortization(25);
      } else if (selectedCar.fuel_type === 'Dízel') {
        setFuelPrice(620); setConsumption(6); setAmortization(40);
      } else {
        setFuelPrice(610); setConsumption(7.5); setAmortization(35);
      }
    }
  }, [selectedCarId]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
      >
        <MapIcon className="w-4 h-4" />
        Úttervező
      </button>

      <button onClick={() => setIsOpen(true)} className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <MapIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          
          <div className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-5xl bg-white dark:bg-slate-900 md:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Header */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 md:px-6 py-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 shrink-0 z-10 absolute top-0 left-0 right-0 md:relative">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Úttervező</h3>
                  <p className="text-xs text-slate-500 hidden md:block">GPS alapú tervezés & kalkulátor</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden pt-16 md:pt-0">
              
              {/* --- BAL OLDAL: BEÁLLÍTÁSOK --- */}
              <div className="w-full md:w-[450px] bg-slate-50 dark:bg-slate-950/50 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-y-auto custom-scrollbar">
                
                <div className="p-5 space-y-6">
                  {/* Címkeresők */}
                  <div className="space-y-3 relative">
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-3.5 text-indigo-500" />
                      <input 
                        type="text" 
                        placeholder="Honnan indulunk?" 
                        value={startQuery}
                        onChange={(e) => { setStartQuery(e.target.value); searchAddress(e.target.value, true); }}
                        className="input-field pl-9 pr-10"
                      />
                      <button onClick={handleLocateMe} className="absolute right-2 top-2 p-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg text-indigo-600 transition-colors" title="Jelenlegi helyzet">
                        <Locate className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="relative">
                      <div className="absolute left-[19px] -top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-700 -z-10"></div>
                      <MapPin className="w-4 h-4 absolute left-3 top-3.5 text-amber-500" />
                      <input 
                        type="text" 
                        placeholder="Hová megyünk?" 
                        value={endQuery}
                        onChange={(e) => { setEndQuery(e.target.value); searchAddress(e.target.value, false); }}
                        className="input-field pl-9"
                      />
                    </div>

                    {/* Keresési találatok dropdown */}
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 mt-1 max-h-48 overflow-y-auto">
                        {searchResults.map((res: any, idx) => (
                          <button key={idx} onClick={() => selectAddress(res)} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-50 dark:border-slate-800/50 last:border-0 truncate">
                            {res.place_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tabs */}
                  <div className="flex p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <button onClick={() => setActiveTab('route')} className={`tab-btn ${activeTab === 'route' ? 'active' : ''}`}>Beállítások</button>
                    <button onClick={() => setActiveTab('costs')} className={`tab-btn ${activeTab === 'costs' ? 'active' : ''}`}>Költségek</button>
                  </div>

                  {activeTab === 'route' ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                      <div className="space-y-2">
                        <label className="input-label">Jármű</label>
                        <select value={selectedCarId || ''} onChange={(e) => setSelectedCarId(Number(e.target.value))} className="input-field">
                          {cars.map(c => <option key={c.id} value={c.id}>{c.make} {c.model}</option>)}
                        </select>
                      </div>

                      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Távolság</p>
                          <p className="text-xl font-black text-slate-800 dark:text-white">{distance.toFixed(1)} km</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Idő</p>
                          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{hours}ó {minutes}p</p>
                        </div>
                      </div>

                      <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                        <span className="flex items-center gap-3 font-bold text-sm text-slate-700 dark:text-slate-200">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isRoundTrip ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}><ArrowRightLeft className="w-4 h-4" /></div>
                          Oda-vissza út
                        </span>
                        <input type="checkbox" checked={isRoundTrip} onChange={(e) => setIsRoundTrip(e.target.checked)} className="w-5 h-5 accent-indigo-600" />
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="input-label">Ár ({isElectric ? 'Ft/kWh' : 'Ft/L'})</label><input type="number" value={fuelPrice} onChange={(e) => setFuelPrice(Number(e.target.value))} className="input-field" /></div>
                        <div><label className="input-label">Fogy. ({unit}/100)</label><input type="number" value={consumption} onChange={(e) => setConsumption(Number(e.target.value))} className="input-field" /></div>
                      </div>
                      <div>
                         <label className="input-label flex items-center gap-1">
                           Amortizáció (Ft/km) 
                           <div title="Kopás, értékvesztés, szerviz">
                             <Info className="w-3 h-3 text-slate-400 cursor-help" />
                           </div>
                         </label>
                         <div className="relative"><input type="number" value={amortization} onChange={(e) => setAmortization(Number(e.target.value))} className="input-field pl-9" /><TrendingUp className="w-4 h-4 absolute left-3 top-3 text-slate-400" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="input-label">Útdíj (Ft)</label><input type="number" value={tollCost} onChange={(e) => setTollCost(Number(e.target.value))} className="input-field" /></div>
                        <div><label className="input-label">Parkolás (Ft)</label><input type="number" value={parkingCost} onChange={(e) => setParkingCost(Number(e.target.value))} className="input-field" /></div>
                      </div>
                      <div>
                        <label className="input-label">Utasok: <span className="text-indigo-500">{passengers} fő</span></label>
                        <input type="range" min="1" max="7" value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" />
                      </div>
                    </div>
                  )}

                  {/* EREDMÉNY KÁRTYA */}
                  <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden mt-4">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="relative z-10 flex justify-between items-end mb-4">
                      <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Költség</p>
                        <p className="text-3xl font-black tracking-tight">{grandTotal.toLocaleString()} Ft</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">/ Fő</p>
                        <p className="text-lg font-bold text-emerald-400">{costPerPerson.toLocaleString()} Ft</p>
                      </div>
                    </div>
                    <div className="relative z-10 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-white/10 rounded-lg p-2"><Fuel className="w-3 h-3 mx-auto mb-1 text-amber-400" />{totalFuelNeeded.toFixed(1)} {unit}</div>
                        <div className="bg-white/10 rounded-lg p-2"><Clock className="w-3 h-3 mx-auto mb-1 text-blue-400" />{hours}:{minutes}</div>
                        <div className="bg-white/10 rounded-lg p-2"><Leaf className="w-3 h-3 mx-auto mb-1 text-green-400" />{isElectric ? '0' : (totalFuelNeeded * 2.3).toFixed(0)} kg</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- JOBB OLDAL: TÉRKÉP --- */}
              <div className="flex-1 h-[300px] md:h-full bg-slate-100 dark:bg-slate-800 relative">
                 <TripMap startPos={startCoords} endPos={endCoords} routeGeoJson={routeGeoJson} />
                 
                 {!startCoords && (
                   <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 z-[400] pointer-events-none">
                      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <MapIcon className="w-4 h-4" /> Válassz indulási helyet
                      </div>
                   </div>
                 )}
              </div>

            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .input-label { @apply text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block; }
        .input-field { @apply w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all; }
        .tab-btn { @apply flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all; }
        .tab-btn.active { @apply bg-slate-100 dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400; }
        .tab-btn:not(.active) { @apply text-slate-400 hover:text-slate-600; }
      `}</style>
    </>
  )
}