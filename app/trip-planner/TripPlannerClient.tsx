'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { 
  Navigation, Fuel, Wallet, ArrowRightLeft, 
  Leaf, Clock, TrendingUp, Info, ParkingSquare, MapPin, Locate, Coins
} from 'lucide-react'

// Térkép dinamikus importálása (SSR tiltva)
const TripMap = dynamic(() => import('@/components/TripMap'), { 
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full animate-pulse items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800">
      <span className="text-xs font-bold uppercase tracking-wider">Térkép betöltése...</span>
    </div>
  )
});

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function TripPlannerClient({ cars }: { cars: any[] }) {
  const [activeTab, setActiveTab] = useState<'route' | 'costs'>('route')
  
  // --- STATE-EK ---
  const [selectedCarId, setSelectedCarId] = useState<number | null>(cars.length > 0 ? cars[0].id : null)
  
  // Helyszínek és Térkép
  const [startQuery, setStartQuery] = useState('')
  const [endQuery, setEndQuery] = useState('')
  const [startCoords, setStartCoords] = useState<[number, number] | null>(null)
  const [endCoords, setEndCoords] = useState<[number, number] | null>(null)
  const [routeGeoJson, setRouteGeoJson] = useState<any>(null);
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingStart, setIsSearchingStart] = useState(false);
  
  // Kalkulált adatok
  const [distance, setDistance] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
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

  // --- SEGÉDFÜGGVÉNY: Nem enged negatív előjelet beírni ---
  const preventMinus = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', '+', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  };

  // GPS
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setStartCoords([lat, lon]);
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

  // Keresés
  const searchAddress = async (query: string, isStart: boolean) => {
    if (query.length < 3) return;
    setIsSearchingStart(isStart);
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=3`);
      const data = await res.json();
      setSearchResults(data.features || []);
    } catch (e) {
      console.error("Keresési hiba", e);
    }
  };

  const selectAddress = (result: any) => {
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

  // Útvonaltervezés
  useEffect(() => {
    if (startCoords && endCoords && MAPBOX_TOKEN) {
      const fetchRoute = async () => {
        try {
          const startLonLat = `${startCoords[1]},${startCoords[0]}`;
          const endLonLat = `${endCoords[1]},${endCoords[0]}`;
          const res = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${startLonLat};${endLonLat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`);
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            setDistance(route.distance / 1000);
            setDuration(route.duration / 60);
            setRouteGeoJson({ type: 'Feature', properties: {}, geometry: route.geometry });
          }
        } catch (e) {
          console.error("Útvonaltervezési hiba", e);
        }
      };
      fetchRoute();
    }
  }, [startCoords, endCoords]);

  // Kalkulációk
  const totalDistance = isRoundTrip ? distance * 2 : distance
  const totalFuelNeeded = (totalDistance / 100) * consumption
  const totalFuelCost = totalFuelNeeded * fuelPrice
  const totalAmortization = totalDistance * amortization
  const grandTotal = totalFuelCost + totalAmortization + tollCost + parkingCost
  const costPerPerson = grandTotal / passengers
  const totalDuration = isRoundTrip ? duration * 2 : duration;
  const hours = Math.floor(totalDuration / 60);
  const minutes = Math.floor(totalDuration % 60);
  
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
    <div className="flex h-full flex-col lg:flex-row">
      
      {/* 1. SZEKCIÓ: TÉRKÉP */}
      <div className="relative h-[35vh] w-full shrink-0 border-b border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-900 lg:order-2 lg:h-full lg:flex-1 lg:border-b-0">
         <TripMap startPos={startCoords} endPos={endCoords} routeGeoJson={routeGeoJson} />
         
         {!startCoords && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/10 backdrop-blur-sm">
               <div className="flex animate-bounce items-center gap-3 rounded-full bg-white px-4 py-2 shadow-xl dark:bg-slate-800">
                  <MapPin className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Válassz indulási helyet!</span>
               </div>
            </div>
         )}
      </div>

      {/* 2. SZEKCIÓ: VEZÉRLŐPULT */}
      <div className="custom-scrollbar z-20 flex h-full w-full flex-1 flex-col overflow-y-auto bg-slate-50 shadow-xl dark:bg-slate-950 lg:order-1 lg:w-[450px] lg:flex-none lg:border-r lg:border-slate-200 lg:dark:border-slate-800">
        <div className="space-y-6 p-5 pb-32 lg:p-6 lg:pb-6">
          
          {/* CÍM KERESŐK */}
          <div className="relative space-y-3">
             <div className="group relative">
                <div className="absolute left-3 top-3.5 text-indigo-500 transition-transform group-focus-within:scale-110"><MapPin className="h-5 w-5" /></div>
                <input 
                  type="text" placeholder="Honnan indulunk?" value={startQuery}
                  onChange={(e) => { setStartQuery(e.target.value); searchAddress(e.target.value, true); }}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm font-medium shadow-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900"
                />
                <button onClick={handleLocateMe} className="absolute right-2 top-2 rounded-lg p-1.5 text-indigo-600 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/30" title="Pozícióm">
                  <Locate className="h-4 w-4" />
                </button>
             </div>

             <div className="group relative">
                <div className="absolute -top-5 bottom-6 left-[19px] -z-10 w-0.5 bg-gradient-to-b from-indigo-500 to-amber-500 opacity-30"></div>
                <div className="absolute left-3 top-3.5 text-amber-500 transition-transform group-focus-within:scale-110"><MapPin className="h-5 w-5" /></div>
                <input 
                  type="text" placeholder="Hová megyünk?" value={endQuery}
                  onChange={(e) => { setEndQuery(e.target.value); searchAddress(e.target.value, false); }}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 text-sm font-medium shadow-sm outline-none transition-all focus:ring-2 focus:ring-amber-500 dark:border-slate-800 dark:bg-slate-900"
                />
             </div>

             {/* Találati lista */}
             {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-hidden overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                  {searchResults.map((res: any, idx) => (
                    <button key={idx} onClick={() => selectAddress(res)} className="flex w-full items-center gap-2 truncate border-b border-slate-50 px-4 py-3 text-left text-sm hover:bg-slate-50 last:border-0 dark:border-slate-800/50 dark:hover:bg-slate-800">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {res.place_name}
                    </button>
                  ))}
                </div>
             )}
          </div>

          {/* TAB VÁLTÓ */}
          <div className="flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
             <button onClick={() => setActiveTab('route')} className={`flex-1 rounded-xl py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'route' ? 'scale-105 transform bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>Útvonal</button>
             <button onClick={() => setActiveTab('costs')} className={`flex-1 rounded-xl py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'costs' ? 'scale-105 transform bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>Költségek</button>
          </div>

          {/* TARTALOM */}
          <div className="space-y-5">
             {activeTab === 'route' ? (
                <div className="animate-in fade-in slide-in-from-left-4 space-y-4 duration-500">
                   {/* Járműválasztó */}
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jármű</label>
                      <select value={selectedCarId || ''} onChange={(e) => setSelectedCarId(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900">
                         {cars.map(c => <option key={c.id} value={c.id}>{c.make} {c.model} ({c.plate})</option>)}
                      </select>
                   </div>

                   {/* Táv és Idő Kártya */}
                   <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                         <div className="mb-1.5 rounded-full bg-blue-50 p-1.5 dark:bg-blue-900/20"><Navigation className="h-4 w-4 text-blue-500" /></div>
                         <p className="mb-0.5 text-[9px] font-bold uppercase text-slate-400">Távolság</p>
                         <p className="text-lg font-black text-slate-800 dark:text-white">{distance.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">km</span></p>
                      </div>
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                         <div className="mb-1.5 rounded-full bg-purple-50 p-1.5 dark:bg-purple-900/20"><Clock className="h-4 w-4 text-purple-500" /></div>
                         <p className="mb-0.5 text-[9px] font-bold uppercase text-slate-400">Idő</p>
                         <p className="text-lg font-black text-slate-800 dark:text-white">{hours}ó {minutes}p</p>
                      </div>
                   </div>

                   {/* Oda-vissza kapcsoló */}
                   <label className="group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-indigo-500 dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center gap-3">
                         <div className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300 ${isRoundTrip ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 dark:bg-slate-800 dark:group-hover:bg-slate-700'}`}>
                            <ArrowRightLeft className="h-4 w-4" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">Oda-vissza út</p>
                            <p className="text-[9px] text-slate-400">Duplázza a távot</p>
                         </div>
                      </div>
                      <input type="checkbox" checked={isRoundTrip} onChange={(e) => setIsRoundTrip(e.target.checked)} className="h-5 w-5 accent-indigo-600 rounded-md" />
                   </label>
                </div>
             ) : (
                <div className="animate-in fade-in slide-in-from-right-4 space-y-4 duration-500">
                   {/* Ár és Fogyasztás */}
                   <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                         <label className="text-[9px] font-bold uppercase text-slate-400">Üzemanyagár</label>
                         <div className="relative">
                           <input 
                              type="number" 
                              min="0"
                              onKeyDown={preventMinus}
                              value={fuelPrice} 
                              onChange={(e) => setFuelPrice(Number(e.target.value))} 
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pl-8 text-sm font-bold shadow-sm dark:border-slate-800 dark:bg-slate-900" 
                           />
                           <div className="absolute left-3 top-2.5 font-serif text-xs font-bold text-slate-400">Ft</div>
                         </div>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[9px] font-bold uppercase text-slate-400">Fogyasztás ({unit})</label>
                         <div className="relative">
                           <input 
                              type="number" 
                              min="0"
                              onKeyDown={preventMinus}
                              value={consumption} 
                              onChange={(e) => setConsumption(Number(e.target.value))} 
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pl-8 text-sm font-bold shadow-sm dark:border-slate-800 dark:bg-slate-900" 
                           />
                           <Fuel className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                         </div>
                      </div>
                   </div>

                   {/* Amortizáció */}
                   <div className="space-y-1">
                      <label className="flex items-center gap-1 text-[9px] font-bold uppercase text-slate-400">
                         Amortizáció (Ft/km)
                         <div title="Gumikopás, értékvesztés, szerviz költség becslése"><Info className="h-3 w-3 cursor-help text-slate-400" /></div>
                      </label>
                      <div className="relative">
                         <input 
                            type="number" 
                            min="0"
                            onKeyDown={preventMinus}
                            value={amortization} 
                            onChange={(e) => setAmortization(Number(e.target.value))} 
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pl-8 text-sm font-bold shadow-sm dark:border-slate-800 dark:bg-slate-900" 
                         />
                         <TrendingUp className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      </div>
                   </div>

                   {/* Extra költségek */}
                   <div className="space-y-2 rounded-2xl bg-slate-100 p-3 dark:bg-slate-900/50">
                      <p className="text-[9px] font-bold uppercase text-slate-400">Egyéb Költségek</p>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="relative">
                           <input 
                              type="number" 
                              min="0"
                              onKeyDown={preventMinus}
                              value={tollCost} 
                              onChange={(e) => setTollCost(Number(e.target.value))} 
                              className="w-full rounded-xl border-none bg-white px-3 py-2 pl-8 text-sm font-bold shadow-sm placeholder:text-slate-300 dark:bg-slate-800" 
                              placeholder="Matrica" 
                           />
                           <Coins className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                         </div>
                         <div className="relative">
                           <input 
                              type="number" 
                              min="0"
                              onKeyDown={preventMinus}
                              value={parkingCost} 
                              onChange={(e) => setParkingCost(Number(e.target.value))} 
                              className="w-full rounded-xl border-none bg-white px-3 py-2 pl-8 text-sm font-bold shadow-sm placeholder:text-slate-300 dark:bg-slate-800" 
                              placeholder="Parkolás" 
                           />
                           <ParkingSquare className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                         </div>
                      </div>
                   </div>

                   {/* Utasok */}
                   <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300">
                         <span>Utasok</span>
                         <span className="text-indigo-600 dark:text-indigo-400">{passengers} fő</span>
                      </div>
                      <input type="range" min="1" max="7" value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 dark:bg-slate-800" />
                   </div>
                </div>
             )}
          </div>

          {/* ÖSSZESÍTŐ KÁRTYA */}
          <div className="group relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-2xl">
             <div className="absolute -mr-16 -mt-16 right-0 top-0 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl transition-transform duration-700 group-hover:scale-110"></div>
             
             <div className="relative z-10">
                <div className="mb-5 flex justify-between items-end">
                   <div>
                      <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">Várható Költség</p>
                      <p className="text-3xl font-black tracking-tighter">{grandTotal.toLocaleString()} <span className="text-sm font-bold text-slate-500">Ft</span></p>
                   </div>
                   <div className="text-right">
                      <p className="mb-1 text-[9px] font-bold uppercase text-slate-400">Fejenként</p>
                      <p className="text-lg font-bold text-emerald-400">{costPerPerson.toLocaleString()} Ft</p>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                   <div className="rounded-2xl bg-white/10 p-2 backdrop-blur-sm transition-colors hover:bg-white/15">
                      <Fuel className="mx-auto mb-1 h-4 w-4 text-amber-400" />
                      <p className="mb-0.5 text-[9px] text-slate-300">Üzemanyag</p>
                      <p className="text-xs font-bold">{totalFuelNeeded.toFixed(1)} {unit}</p>
                   </div>
                   <div className="rounded-2xl bg-white/10 p-2 backdrop-blur-sm transition-colors hover:bg-white/15">
                      <Wallet className="mx-auto mb-1 h-4 w-4 text-blue-400" />
                      <p className="mb-0.5 text-[9px] text-slate-300">Egyéb</p>
                      <p className="text-xs font-bold">{(totalAmortization + tollCost + parkingCost).toLocaleString()}</p>
                   </div>
                   <div className="rounded-2xl bg-white/10 p-2 backdrop-blur-sm transition-colors hover:bg-white/15">
                      <Leaf className="mx-auto mb-1 h-4 w-4 text-green-400" />
                      <p className="mb-0.5 text-[9px] text-slate-300">CO2</p>
                      <p className="text-xs font-bold">{isElectric ? '0' : (totalFuelNeeded * 2.3).toFixed(0)} kg</p>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>

    </div>
  )
}