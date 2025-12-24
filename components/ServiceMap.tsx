'use client'

import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { 
  Search, MapPin, Wrench, Car, Zap, Droplets, Plus, 
  ArrowLeft, Home, Phone, Locate, ChevronUp, ChevronDown, 
  Siren, Star, Clock, Fuel, SquareParking, Hammer, ShoppingBag
} from 'lucide-react'
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useRouter } from 'next/navigation'

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

// --- BŐVÍTETT KATEGÓRIÁK ---
const CATEGORIES = [
  { id: 'mechanic', label: 'Szerelő', icon: Wrench, color: 'bg-indigo-500', gradient: 'from-indigo-500 to-blue-600' },
  { id: 'towing', label: 'Autómentés', icon: Siren, color: 'bg-red-600', gradient: 'from-red-500 to-red-700', isEmergency: true },
  { id: 'gas', label: 'Benzinkút', icon: Fuel, color: 'bg-emerald-500', gradient: 'from-emerald-500 to-green-600' },
  { id: 'tire', label: 'Gumizás', icon: Car, color: 'bg-orange-500', gradient: 'from-orange-500 to-red-600' },
  { id: 'wash', label: 'Autómosó', icon: Droplets, color: 'bg-sky-500', gradient: 'from-sky-500 to-indigo-600' },
  { id: 'body', label: 'Karosszéria', icon: Hammer, color: 'bg-slate-500', gradient: 'from-slate-500 to-slate-700' },
  { id: 'parts', label: 'Alkatrész', icon: ShoppingBag, color: 'bg-violet-500', gradient: 'from-violet-500 to-purple-600' },
  { id: 'electric', label: 'Töltő', icon: Zap, color: 'bg-yellow-500', gradient: 'from-yellow-400 to-amber-600' },
  { id: 'parking', label: 'Parkoló', icon: SquareParking, color: 'bg-blue-500', gradient: 'from-blue-500 to-cyan-600' },
]

// --- Ikon generátor ---
const createModernIcon = (categoryId: string, isActive = false) => {
  if (typeof window === 'undefined') return L.divIcon({});
  const cat = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  const Icon = cat.icon;
  // @ts-ignore
  const isSos = cat.id === 'towing';

  const html = renderToStaticMarkup(
    <div className={cn("relative flex items-center justify-center transition-all duration-300", isActive ? "scale-125 z-[1000]" : "scale-100")}>
      {(isActive || isSos) && <div className={cn("absolute inset-0 rounded-2xl animate-ping opacity-30", cat.color)}></div>}
      <div className={cn(
        "w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg border-[3px] border-white dark:border-zinc-900 bg-gradient-to-br", 
        cat.gradient
      )}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className={cn("absolute -bottom-1.5 w-3 h-3 rotate-45 border-r-[3px] border-b-[3px] border-white dark:border-zinc-900", cat.color)} />
    </div>
  );
  return L.divIcon({ html, className: '!bg-transparent', iconSize: [40, 48], iconAnchor: [20, 48], popupAnchor: [0, -48] });
}

// --- Map Logic ---
function MapController({ onMapClick, isAdding }: { onMapClick: (lat: number, lng: number) => void, isAdding: boolean }) {
  useMapEvents({ click(e) { if (isAdding) onMapClick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

function MapFlyTo({ position }: { position: any }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      const coords = (Array.isArray(position) ? position : [position.lat, position.lng]) as [number, number];
      map.flyTo(coords, 16, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [position, map]);
  return null;
}

// === FŐ KOMPONENS ===
export default function ServiceMap() {
  const [partners, setPartners] = useState<any[]>([]) 
  const [activeCategory, setActiveCategory] = useState('mechanic') // Default kategória
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<'view' | 'add'>('view')
  const [loading, setLoading] = useState(false)
  
  const [isSosActive, setIsSosActive] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [newServiceCoords, setNewServiceCoords] = useState<{ lat: number, lng: number } | null>(null)
  const [formData, setFormData] = useState({ name: '', category: 'mechanic', phone: '', address: '', description: '' })

  const [isMobile, setIsMobile] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  
  const router = useRouter()
  const dragControls = useDragControls()

  // --- API Fetch Logic ---
  // Most már átadjuk a 'activeCategory'-t a backendnek
  const fetchPlaces = async (lat: number, lng: number, category: string) => {
    setLoading(true);
    setPartners([]); // Lista ürítése betöltés előtt
    try {
        const res = await fetch(`/api/places?lat=${lat}&lng=${lng}&category=${category}`);
        const data = await res.json();
        if (data.partners) {
            setPartners(data.partners);
        }
    } catch (error) {
        console.error("Hiba:", error);
    } finally {
        setLoading(false);
    }
  };

  // Kategória váltás kezelése
  const handleCategoryChange = (catId: string) => {
      setActiveCategory(catId);
      // Ha van pozíciónk, azonnal töltsük újra az adatokat az új kategóriával
      if (userLocation) {
          fetchPlaces(userLocation[0], userLocation[1], catId);
      }
      if (isMobile) setSheetOpen(true);
  }

  // GPS
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation([lat, lng]);
        
        const map = document.querySelector('.leaflet-container');
        // @ts-ignore
        if(map && map._leaflet_map) map._leaflet_map.flyTo([lat, lng], 15);

        // API hívás az aktuális kategóriával
        const categoryToFetch = isSosActive ? 'towing' : activeCategory;
        fetchPlaces(lat, lng, categoryToFetch);

      }, () => alert("Engedélyezd a GPS-t!"));
    }
  }

  // SOS Mód
  const toggleSosMode = () => {
    const newState = !isSosActive;
    setIsSosActive(newState);
    
    if (newState) {
        setActiveCategory('towing'); // UI frissítése
        if (userLocation) {
            fetchPlaces(userLocation[0], userLocation[1], 'towing');
        } else {
            handleLocateMe(); 
        }
        setSheetOpen(true);
    } else {
        // Vissza szerelőre alapból
        setActiveCategory('mechanic');
        if (userLocation) {
            fetchPlaces(userLocation[0], userLocation[1], 'mechanic');
        }
    }
  }

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    document.body.style.overscrollBehavior = 'none';
    return () => {
        window.removeEventListener('resize', checkMobile);
        document.body.style.overscrollBehavior = '';
    }
  }, []);

  // Kereső szűrés (kliens oldalon a már betöltött listából)
  const filteredPartners = useMemo(() => {
    if (!search.trim()) return partners;
    const s = search.trim().toLowerCase();
    return partners.filter(p => p.name?.toLowerCase().includes(s) || p.address?.toLowerCase().includes(s));
  }, [partners, search])

  const handleMapClick = async (lat: number, lng: number) => {
    setNewServiceCoords({ lat, lng });
    if(isMobile) setSheetOpen(true); 
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        if(data && data.display_name) {
            setFormData(prev => ({ ...prev, address: data.display_name.split(',').slice(0, 3).join(',') }));
        }
    } catch(e) {}
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y < -50) setSheetOpen(true);
    else if (info.offset.y > 50) setSheetOpen(false);
  }

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans selection:bg-indigo-500/30 touch-none">
      
      {/* 1. TÉRKÉP */}
      <div className="absolute inset-0 z-0 pb-[140px] lg:pb-0">
        <MapContainer center={[47.4979, 19.0402]} zoom={13} zoomControl={false} className="w-full h-full outline-none">
          <TileLayer attribution='&copy; Google' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          <MapController onMapClick={handleMapClick} isAdding={mode === 'add'} />
          <MapFlyTo position={newServiceCoords || userLocation} />

          {userLocation && (
             <Marker position={userLocation} icon={L.divIcon({ html: `<div class="relative w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>`, className: 'bg-transparent' })} />
          )}

          {mode === 'view' && filteredPartners.map(p => (
            <Marker key={p.id} position={[p.latitude, p.longitude]} icon={createModernIcon(p.category)}>
              <Popup closeButton={false} className="custom-popup" offset={[0, -40]}>
                <div className="p-1 min-w-[220px]">
                    <div className="flex justify-between items-start mb-1">
                         <h4 className="font-bold text-zinc-900 text-sm max-w-[160px] leading-tight">{p.name}</h4>
                         {p.rating && <span className="flex items-center text-xs font-bold text-amber-500 shrink-0"><Star size={10} fill="currentColor" className="mr-1"/>{p.rating}</span>}
                    </div>
                    <p className="text-xs text-zinc-500 mb-2">{p.address}</p>
                    {p.open_now !== undefined && (
                        <p className={cn("text-[10px] font-bold mb-2", p.open_now ? "text-green-600" : "text-red-500")}>
                            {p.open_now ? "NYITVA" : "ZÁRVA"}
                        </p>
                    )}
                    <button className="w-full py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold">Útvonal</button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* SOS OVERLAY */}
      <AnimatePresence>
        {isSosActive && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 pointer-events-none border-[6px] border-red-600/50 shadow-[inset_0_0_100px_rgba(220,38,38,0.3)]" />
        )}
      </AnimatePresence>

      {/* 2. VEZÉRLŐK (LENT) */}
      <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-end pb-[160px] lg:pb-6 px-4 lg:px-6">
         <div className="flex justify-between items-end w-full max-w-[420px] lg:max-w-none lg:ml-[440px]">
             <div className="flex flex-col gap-3 pointer-events-auto">
                <button onClick={() => router.push('/')} className="w-12 h-12 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-900/10 rounded-2xl flex items-center justify-center text-zinc-700 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-700 active:scale-95 transition-transform">
                    <Home size={22} />
                </button>
             </div>
             <div className="flex flex-col gap-3 pointer-events-auto items-end">
                <button onClick={toggleSosMode} className={cn("h-14 px-5 shadow-xl rounded-2xl flex items-center justify-center gap-2 font-black text-white active:scale-95 transition-all border-2 border-white/20", isSosActive ? "bg-red-600 shadow-red-600/40 animate-pulse w-auto" : "w-14 bg-red-500 shadow-red-500/20")}>
                    <Siren size={24} className={cn(isSosActive && "animate-bounce")} />
                    {isSosActive && <span>SOS AKTÍV</span>}
                </button>
                <button onClick={handleLocateMe} className="w-12 h-12 bg-indigo-600 shadow-xl shadow-indigo-500/20 rounded-2xl flex items-center justify-center text-white active:scale-95 transition-transform">
                    <Locate size={22} />
                </button>
             </div>
         </div>
      </div>

      {/* 3. MENU / DRAWER */}
      <motion.aside
        initial={false}
        animate={isMobile ? (sheetOpen ? { y: "0%" } : { y: "calc(100% - 140px)" }) : { x: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        drag={isMobile ? "y" : false}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        className={cn(
          "z-30 flex flex-col absolute bg-white dark:bg-zinc-950 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]",
          "w-full h-[85dvh] bottom-0 left-0 rounded-t-[32px]",
          "lg:top-6 lg:left-6 lg:bottom-6 lg:w-[420px] lg:h-auto lg:rounded-[32px] lg:border border-zinc-200 dark:border-zinc-800 lg:shadow-2xl"
        )}
      >
        {/* HEADER */}
        <div 
            className={cn("w-full pt-3 pb-4 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none shrink-0 rounded-t-[32px] transition-colors", isSosActive ? "bg-red-50 dark:bg-red-900/20" : "bg-white dark:bg-zinc-950")}
            onPointerDown={(e) => dragControls.start(e)}
            onClick={() => isMobile && setSheetOpen(!sheetOpen)}
        >
          <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-2 lg:hidden" />
          <div className="flex items-center justify-between w-full px-6">
              <div>
                  <h2 className={cn("text-xl font-black tracking-tight", isSosActive ? "text-red-600" : "text-zinc-900 dark:text-white")}>
                      {isSosActive ? 'SOS Autómentés' : (mode === 'add' ? 'Új hely felvétele' : 'Közeli Szervizek')}
                  </h2>
                  {loading && <p className="text-xs text-zinc-500 animate-pulse">Adatok betöltése...</p>}
              </div>
              <div className="lg:hidden text-zinc-400">
                  {sheetOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </div>
          </div>
        </div>

        {/* TARTALOM */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar touch-pan-y bg-white dark:bg-zinc-950">
          <AnimatePresence mode="wait">
            
            {mode === 'view' ? (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                
                {/* Kereső */}
                {!isSosActive && (
                    <div className="relative group">
                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400" />
                        <input 
                            type="text" 
                            placeholder="Keresés név szerint..."
                            className="w-full pl-12 pr-4 py-3.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onFocus={() => isMobile && setSheetOpen(true)}
                        />
                    </div>
                )}

                {/* KATEGÓRIÁK GÖRGETHETŐ SÁV */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 lg:flex-wrap lg:mx-0 lg:px-0">
                    {CATEGORIES.map(cat => (
                        <button 
                        key={cat.id}
                        // @ts-ignore
                        hidden={isSosActive && cat.id !== 'towing'}
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            if (cat.id === 'towing') toggleSosMode(); // Towing klikk -> SOS be
                            else if (isSosActive) toggleSosMode(); // Más klikk SOS alatt -> SOS ki
                            
                            if (cat.id !== 'towing') handleCategoryChange(cat.id);
                        }}
                        className={cn(
                            "flex flex-col items-center gap-2 p-3 min-w-[72px] rounded-2xl border transition-all shrink-0",
                            activeCategory === cat.id || (isSosActive && cat.id === 'towing')
                            ? (cat.id === 'towing' ? "bg-red-600 text-white border-red-600 scale-105" : "bg-zinc-900 text-white border-zinc-900 scale-105")
                            : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
                        )}
                        >
                            <cat.icon size={20} />
                            <span className="text-[10px] font-bold whitespace-nowrap">{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* Lista */}
                <div className="flex-1 space-y-3 pb-20">
                  {loading ? (
                      <div className="flex flex-col items-center justify-center py-10 opacity-50">
                          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                          <p className="text-zinc-400 text-sm">Keresés...</p>
                      </div>
                  ) : filteredPartners.length === 0 ? (
                    <div className="text-center py-10 text-zinc-400 text-sm">
                        {userLocation ? "Nincs találat a közelben." : "Engedélyezd a helyzetmeghatározást a térkép betöltéséhez!"}
                    </div>
                  ) : (
                    filteredPartners.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => {
                          const map = document.querySelector('.leaflet-container');
                          // @ts-ignore
                          if(map) map._leaflet_map.flyTo([p.latitude, p.longitude], 16);
                          if(isMobile) setSheetOpen(false);
                        }}
                        className={cn(
                            "flex items-center gap-4 p-4 border rounded-2xl active:bg-zinc-100 transition-colors cursor-pointer",
                            isSosActive ? "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30" : "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800"
                        )}
                      >
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0", CATEGORIES.find(c=>c.id===p.category)?.color)}>
                           {/* Ikon kiválasztása dinamikusan */}
                           {(() => {
                               const Icon = CATEGORIES.find(c=>c.id===p.category)?.icon || MapPin;
                               return <Icon size={18} />;
                           })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">{p.name}</h4>
                          <p className="text-xs text-zinc-500 truncate">{p.address}</p>
                          <div className="flex gap-2 mt-1">
                             {p.rating && <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5"><Star size={10} /> {p.rating}</span>}
                             {p.open_now && <span className="text-[10px] font-bold text-green-600 flex items-center gap-0.5"><Clock size={10} /> Nyitva</span>}
                          </div>
                        </div>
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white", isSosActive ? "bg-red-600" : "bg-zinc-900")}>
                             <Phone size={14} />
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </motion.div>
            ) : (
              // Add Mode (Ez maradt a régi, egyszerűsítettem a kódot a válaszban)
              <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 pb-20">
                 <p className="text-sm font-bold text-center text-zinc-500">Új hely felvétele fejlesztés alatt...</p>
                 <button onClick={() => setMode('view')} className="w-full py-3 bg-zinc-100 rounded-xl font-bold">Vissza</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      <style jsx global>{`
        .leaflet-container { z-index: 1; background: #f4f4f5; }
        .custom-popup .leaflet-popup-content-wrapper { border-radius: 12px; padding: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .custom-popup a.leaflet-popup-close-button { display: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}