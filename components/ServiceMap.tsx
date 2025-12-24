'use client'

import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { 
  Search, MapPin, Wrench, Car, Zap, Droplets, Plus, 
  ArrowLeft, Home, Phone, X, Locate, ChevronUp, ChevronDown, 
  Siren, Star, Clock 
} from 'lucide-react'
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useRouter } from 'next/navigation'

// --- Utility ---
function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

// --- DATA ---
// A 'towing' (Autómentés) kategóriát hozzáadtuk
const CATEGORIES = [
  { id: 'all', label: 'Összes', icon: Search, color: 'bg-zinc-500', gradient: 'from-zinc-500 to-zinc-700' },
  { id: 'mechanic', label: 'Szerelő', icon: Wrench, color: 'bg-indigo-500', gradient: 'from-indigo-500 to-blue-600' },
  { id: 'towing', label: 'Autómentés', icon: Siren, color: 'bg-red-600', gradient: 'from-red-500 to-red-700', isEmergency: true },
  { id: 'tire', label: 'Gumizás', icon: Car, color: 'bg-orange-500', gradient: 'from-orange-500 to-red-600' },
  { id: 'wash', label: 'Autómosó', icon: Droplets, color: 'bg-sky-500', gradient: 'from-sky-500 to-indigo-600' },
]

// --- Ikon generátor ---
const createModernIcon = (categoryId: string, isActive = false) => {
  if (typeof window === 'undefined') return L.divIcon({});
  const cat = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0]; // fallback
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
export default function ServiceMap({ user }: { user?: any }) {
  const [partners, setPartners] = useState<any[]>([]) // Üres kezdetben, API tölti be
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<'view' | 'add'>('view')
  const [loading, setLoading] = useState(false)
  
  // SOS Mód állapot
  const [isSosActive, setIsSosActive] = useState(false)

  // Állapotok
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [newServiceCoords, setNewServiceCoords] = useState<{ lat: number, lng: number } | null>(null)
  const [formData, setFormData] = useState({ name: '', category: 'mechanic', phone: '', address: '', description: '' })

  const [isMobile, setIsMobile] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  
  const router = useRouter()
  const dragControls = useDragControls()

  // --- API Fetch Logic ---
  const fetchPlaces = async (lat: number, lng: number, category: string) => {
    setLoading(true);
    try {
        // Hívjuk a saját API route-unkat
        const res = await fetch(`/api/places?lat=${lat}&lng=${lng}&category=${category}`);
        const data = await res.json();
        
        if (data.partners) {
            // Mapping a kategóriákhoz
            const mappedPartners = data.partners.map((p: any) => ({
                ...p,
                // Ha towing-ot kerestünk, minden találat legyen towing kategória, egyébként mechanic
                category: category === 'towing' ? 'towing' : 'mechanic' 
            }));
            setPartners(mappedPartners);
        }
    } catch (error) {
        console.error("Hiba a betöltéskor:", error);
    } finally {
        setLoading(false);
    }
  };

  // --- GPS és Automatikus betöltés ---
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation([lat, lng]);
        
        // Térkép odaugrik
        const map = document.querySelector('.leaflet-container');
        // @ts-ignore
        if(map && map._leaflet_map) map._leaflet_map.flyTo([lat, lng], 15);

        // API hívás indítása a felhasználó helyzete alapján
        // Ha SOS aktív, akkor autómentőket, ha nem, akkor szerelőket keresünk
        const categoryToFetch = isSosActive ? 'towing' : 'mechanic';
        fetchPlaces(lat, lng, categoryToFetch);

      }, () => alert("Helyzetmeghatározás sikertelen. Engedélyezd a GPS-t!"));
    }
  }

  // SOS Aktiválása
  const toggleSosMode = () => {
    const newState = !isSosActive;
    setIsSosActive(newState);
    
    if (newState) {
        // SOS BEKAPCSOLVA
        setFilter('towing');
        if (userLocation) {
            fetchPlaces(userLocation[0], userLocation[1], 'towing');
        } else {
            handleLocateMe(); // Ha nincs helyzet, kérjük le és utána keressünk
        }
        setSheetOpen(true); // Mutassuk a találatokat
    } else {
        // SOS KIKAPCSOLVA - Vissza normál nézetbe
        setFilter('all');
        if (userLocation) {
            fetchPlaces(userLocation[0], userLocation[1], 'mechanic');
        }
    }
  }

  // Setup
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    document.body.style.overscrollBehavior = 'none';
    
    // Kezdeti betöltés (Opcionális: alapértelmezett helyszín, pl. Budapest)
    // handleLocateMe(); // Automatikus helymeghatározás induláskor (óvatosan, mert popupot dob)

    return () => {
        window.removeEventListener('resize', checkMobile);
        document.body.style.overscrollBehavior = '';
    }
  }, []);

  // Filter Logic (Client side filter a már betöltött adatokon)
  const filteredPartners = useMemo(() => {
    let list = partners
    if (filter !== 'all') list = list.filter(p => p.category === filter)
    if (search.trim()) {
      const s = search.trim().toLowerCase()
      list = list.filter(p => p.name?.toLowerCase().includes(s) || p.address?.toLowerCase().includes(s))
    }
    return list
  }, [partners, filter, search])

  // --- Map Click ---
  const handleMapClick = async (lat: number, lng: number) => {
    setNewServiceCoords({ lat, lng });
    if(isMobile) setSheetOpen(true); 
    // ...geocoding logic (unchanged)...
  }

  // --- Drag ---
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

          {/* User Marker */}
          {userLocation && (
             <Marker position={userLocation} icon={L.divIcon({ html: `<div class="relative w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>`, className: 'bg-transparent' })} />
          )}

          {/* Partners Markers */}
          {mode === 'view' && filteredPartners.map(p => (
            <Marker key={p.id} position={[p.latitude, p.longitude]} icon={createModernIcon(p.category)}>
              <Popup closeButton={false} className="custom-popup" offset={[0, -40]}>
                <div className="p-1 min-w-[220px]">
                    <div className="flex justify-between items-start mb-1">
                         <h4 className="font-bold text-zinc-900 text-sm">{p.name}</h4>
                         {p.rating && <span className="flex items-center text-xs font-bold text-amber-500"><Star size={10} fill="currentColor" className="mr-1"/>{p.rating}</span>}
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

      {/* SOS VÉSZJELZŐ OVERLAY (Ha aktív) */}
      <AnimatePresence>
        {isSosActive && (
             <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 pointer-events-none border-[6px] border-red-600/50 shadow-[inset_0_0_100px_rgba(220,38,38,0.3)]"
             />
        )}
      </AnimatePresence>

      {/* 2. VEZÉRLŐK (LENT) */}
      <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-end pb-[160px] lg:pb-6 px-4 lg:px-6">
         <div className="flex justify-between items-end w-full max-w-[420px] lg:max-w-none lg:ml-[440px]">
             
             {/* Bal oldal: Home / Back */}
             <div className="flex flex-col gap-3 pointer-events-auto">
                <button onClick={() => router.push('/')} className="w-12 h-12 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-900/10 rounded-2xl flex items-center justify-center text-zinc-700 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-700 active:scale-95 transition-transform">
                    <Home size={22} />
                </button>
             </div>

             {/* Jobb oldal: SOS + GPS */}
             <div className="flex flex-col gap-3 pointer-events-auto items-end">
                
                {/* SOS BUTTON */}
                <button 
                    onClick={toggleSosMode}
                    className={cn(
                        "h-14 px-5 shadow-xl rounded-2xl flex items-center justify-center gap-2 font-black text-white active:scale-95 transition-all border-2 border-white/20",
                        isSosActive 
                            ? "bg-red-600 shadow-red-600/40 animate-pulse w-auto" 
                            : "w-14 bg-red-500 shadow-red-500/20"
                    )}
                >
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
            className={cn(
                "w-full pt-3 pb-4 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none shrink-0 rounded-t-[32px] transition-colors",
                isSosActive ? "bg-red-50 dark:bg-red-900/20" : "bg-white dark:bg-zinc-950"
            )}
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
            
            {/* VIEW MODE */}
            {mode === 'view' ? (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                
                {/* Kereső (Csak ha nem SOS) */}
                {!isSosActive && (
                    <div className="relative group">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400" />
                    <input 
                        type="text" 
                        placeholder="Keresés..."
                        className="w-full pl-12 pr-4 py-3.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onFocus={() => isMobile && setSheetOpen(true)}
                    />
                    </div>
                )}

                {/* Kategóriák */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 lg:flex-wrap lg:mx-0 lg:px-0">
                    {CATEGORIES.map(cat => (
                        <button 
                        key={cat.id}
                        // @ts-ignore
                        hidden={isSosActive && cat.id !== 'towing'} // SOS módban csak a mentés látszik
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            // @ts-ignore
                            if(cat.id === 'towing') toggleSosMode(); 
                            else { setFilter(cat.id); if(isSosActive) toggleSosMode(); } // Kikapcsolja az SOS-t ha másra kattint
                            if(isMobile) setSheetOpen(true); 
                        }}
                        className={cn(
                            "flex flex-col items-center gap-2 p-3 min-w-[72px] rounded-2xl border transition-all shrink-0",
                            filter === cat.id || (isSosActive && cat.id === 'towing')
                            ? (cat.id === 'towing' ? "bg-red-600 text-white border-red-600 scale-105" : "bg-zinc-900 text-white border-zinc-900 scale-105")
                            : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
                        )}
                        >
                            <cat.icon size={20} />
                            <span className="text-[10px] font-bold">{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* Lista */}
                <div className="flex-1 space-y-3 pb-20">
                  {loading ? (
                      <div className="text-center py-10 text-zinc-400 text-sm">Szolgáltatók keresése...</div>
                  ) : filteredPartners.length === 0 ? (
                    <div className="text-center py-10 text-zinc-400 text-sm">
                        {userLocation ? "Nincs találat a közelben." : "Engedélyezd a helyzetmeghatározást!"}
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
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white", CATEGORIES.find(c=>c.id===p.category)?.color)}>
                           {isSosActive ? <Siren size={18} /> : <MapPin size={18} />}
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
            ) : null}
          </AnimatePresence>
        </div>
      </motion.aside>

      <style jsx global>{`
        .leaflet-container { z-index: 1; background: #f4f4f5; }
        .custom-popup .leaflet-popup-content-wrapper { border-radius: 12px; padding: 0; }
        .custom-popup a.leaflet-popup-close-button { display: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}