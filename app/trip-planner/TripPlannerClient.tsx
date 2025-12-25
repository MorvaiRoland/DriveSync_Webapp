'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { 
  Map as MapIcon, Navigation, Users, Fuel, Wallet, ArrowRightLeft, 
  Leaf, Clock, TrendingUp, Info, ParkingSquare, MapPin, Locate, Coins
} from 'lucide-react'

// Térkép dinamikus importálása (SSR tiltva)
// Fontos: Itt a saját Mapbox térképedet importáljuk!
const TripMap = dynamic(() => import('@/components/TripMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center text-slate-400">Térkép betöltése...</div>
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
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
      
      {/* BAL SÁV (Görgethető) */}
      <div className="w-full lg:w-[450px] bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-y-auto custom-scrollbar shadow-xl z-20">
        <div className="p-6 space-y-8">
          
          {/* CÍM KERESŐK */}
          <div className="space-y-4 relative">
             <div className="relative group">
                <div className="absolute left-3 top-3.5 text-indigo-500 group-focus-within:scale-110 transition-transform"><MapPin className="w-5 h-5" /></div>
                <input 
                  type="text" placeholder="Honnan indulunk?" value={startQuery}
                  onChange={(e) => { setStartQuery(e.target.value); searchAddress(e.target.value, true); }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-10 text-sm font-medium shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <button onClick={handleLocateMe} className="absolute right-2 top-2 p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg text-indigo-600 transition-colors" title="Pozícióm">
                  <Locate className="w-4 h-4" />
                </button>
             </div>

             <div className="relative group">
                {/* Vonal összekötő */}
                <div className="absolute left-[19px] -top-6 bottom-6 w-0.5 bg-gradient-to-b from-indigo-500 to-amber-500 -z-10 opacity-30"></div>
                
                <div className="absolute left-3 top-3.5 text-amber-500 group-focus-within:scale-110 transition-transform"><MapPin className="w-5 h-5" /></div>
                <input 
                  type="text" placeholder="Hová megyünk?" value={endQuery}
                  onChange={(e) => { setEndQuery(e.target.value); searchAddress(e.target.value, false); }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-10 text-sm font-medium shadow-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                />
             </div>

             {/* Találati lista */}
             {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 mt-2 overflow-hidden max-h-60 overflow-y-auto">
                  {searchResults.map((res: any, idx) => (
                    <button key={idx} onClick={() => selectAddress(res)} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-50 dark:border-slate-800/50 last:border-0 truncate flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {res.place_name}
                    </button>
                  ))}
                </div>
             )}
          </div>

          {/* TAB VÁLTÓ */}
          <div className="flex p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <button onClick={() => setActiveTab('route')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 ${activeTab === 'route' ? 'bg-indigo-600 text-white shadow-md transform scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>Útvonal</button>
             <button onClick={() => setActiveTab('costs')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 ${activeTab === 'costs' ? 'bg-indigo-600 text-white shadow-md transform scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>Költségek</button>
          </div>

          {/* TARTALOM */}
          <div className="space-y-6">
             {activeTab === 'route' ? (
                <div className="space-y-5 animate-in slide-in-from-left-4 fade-in duration-500">
                   {/* Járműválasztó */}
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jármű</label>
                      <select value={selectedCarId || ''} onChange={(e) => setSelectedCarId(Number(e.target.value))} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                         {cars.map(c => <option key={c.id} value={c.id}>{c.make} {c.model} ({c.plate})</option>)}
                      </select>
                   </div>

                   {/* Táv és Idő Kártya */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                         <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-2"><Navigation className="w-5 h-5 text-blue-500" /></div>
                         <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Távolság</p>
                         <p className="text-xl font-black text-slate-800 dark:text-white">{distance.toFixed(1)} <span className="text-xs font-normal text-slate-400">km</span></p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                         <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-full mb-2"><Clock className="w-5 h-5 text-purple-500" /></div>
                         <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Idő</p>
                         <p className="text-xl font-black text-slate-800 dark:text-white">{hours}ó {minutes}p</p>
                      </div>
                   </div>

                   {/* Oda-vissza kapcsoló */}
                   <label className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-500 transition-all shadow-sm group">
                      <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isRoundTrip ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-slate-700'}`}>
                            <ArrowRightLeft className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="font-bold text-sm text-slate-800 dark:text-white">Oda-vissza út</p>
                            <p className="text-[10px] text-slate-400">Automatikusan duplázza a távot</p>
                         </div>
                      </div>
                      <input type="checkbox" checked={isRoundTrip} onChange={(e) => setIsRoundTrip(e.target.checked)} className="w-6 h-6 accent-indigo-600 rounded-md" />
                   </label>
                </div>
             ) : (
                <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-500">
                   {/* Ár és Fogyasztás */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-400 uppercase">Üzemanyagár</label>
                         <div className="relative">
                            <input type="number" value={fuelPrice} onChange={(e) => setFuelPrice(Number(e.target.value))} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 pl-9 text-sm font-bold shadow-sm" />
                            <div className="absolute left-3 top-2.5 text-slate-400 font-serif font-bold text-xs">Ft</div>
                         </div>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-400 uppercase">Fogyasztás ({unit})</label>
                         <div className="relative">
                            <input type="number" value={consumption} onChange={(e) => setConsumption(Number(e.target.value))} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 pl-9 text-sm font-bold shadow-sm" />
                            <Fuel className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                         </div>
                      </div>
                   </div>

                   {/* Amortizáció */}
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                         Amortizáció (Ft/km)
                         <div title="Gumikopás, értékvesztés, szerviz költség becslése"><Info className="w-3 h-3 text-slate-400 cursor-help" /></div>
                      </label>
                      <div className="relative">
                         <input type="number" value={amortization} onChange={(e) => setAmortization(Number(e.target.value))} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 pl-9 text-sm font-bold shadow-sm" />
                         <TrendingUp className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      </div>
                   </div>

                   {/* Extra költségek */}
                   <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-2xl space-y-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Egyéb Költségek</p>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="relative">
                            <input type="number" value={tollCost} onChange={(e) => setTollCost(Number(e.target.value))} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3 py-2 pl-9 text-sm font-bold shadow-sm placeholder:text-slate-300" placeholder="Matrica" />
                            <Coins className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
                         </div>
                         <div className="relative">
                            <input type="number" value={parkingCost} onChange={(e) => setParkingCost(Number(e.target.value))} className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-3 py-2 pl-9 text-sm font-bold shadow-sm placeholder:text-slate-300" placeholder="Parkolás" />
                            <ParkingSquare className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
                         </div>
                      </div>
                   </div>

                   {/* Utasok */}
                   <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                         <span>Utasok</span>
                         <span className="text-indigo-600 dark:text-indigo-400">{passengers} fő</span>
                      </div>
                      <input type="range" min="1" max="7" value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-800" />
                   </div>
                </div>
             )}
          </div>

          {/* ÖSSZESÍTŐ KÁRTYA */}
          <div className="mt-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
             
             <div className="relative z-10">
                <div className="flex justify-between items-end mb-6">
                   <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Várható Költség</p>
                      <p className="text-4xl font-black tracking-tighter">{grandTotal.toLocaleString()} <span className="text-lg font-bold text-slate-500">Ft</span></p>
                   </div>
                   <div className="text-right">
                      <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Fejenként</p>
                      <p className="text-xl font-bold text-emerald-400">{costPerPerson.toLocaleString()} Ft</p>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                   <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm hover:bg-white/15 transition-colors">
                      <Fuel className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                      <p className="text-[10px] text-slate-300 mb-0.5">Üzemanyag</p>
                      <p className="font-bold text-sm">{totalFuelNeeded.toFixed(1)} {unit}</p>
                   </div>
                   <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm hover:bg-white/15 transition-colors">
                      <Wallet className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                      <p className="text-[10px] text-slate-300 mb-0.5">Egyéb</p>
                      <p className="font-bold text-sm">{(totalAmortization + tollCost + parkingCost).toLocaleString()}</p>
                   </div>
                   <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm hover:bg-white/15 transition-colors">
                      <Leaf className="w-5 h-5 mx-auto mb-1 text-green-400" />
                      <p className="text-[10px] text-slate-300 mb-0.5">CO2</p>
                      <p className="font-bold text-sm">{isElectric ? '0' : (totalFuelNeeded * 2.3).toFixed(0)} kg</p>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* JOBB SÁV (Térkép) - Mobilon ez lehet, hogy alulra kerül vagy elrejtjük */}
      <div className="flex-1 bg-slate-200 dark:bg-slate-900 relative hidden lg:block">
         <TripMap startPos={startCoords} endPos={endCoords} routeGeoJson={routeGeoJson} />
         
         {!startCoords && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-sm z-10">
               <div className="bg-white dark:bg-slate-800 px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-bounce">
                  <MapIcon className="w-5 h-5 text-indigo-500" />
                  <span className="font-bold text-slate-700 dark:text-slate-200">Válassz indulási helyet bal oldalt!</span>
               </div>
            </div>
         )}
      </div>

      {/* MOBIL TÉRKÉP GOMB (Opcionális: ha mobilon külön nézetet akarsz a térképnek) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
         {/* Itt lehetne egy gomb, ami megnyitja a térképet teljes képernyőn mobilon */}
      </div>

    </div>
  )
}