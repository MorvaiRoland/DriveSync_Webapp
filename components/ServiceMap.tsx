'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { 
  Search, MapPin, Wrench, Car, Zap, Droplets, Plus, 
  ArrowLeft, Send, Navigation, Layers, Home, Phone, X, Locate, ChevronUp
} from 'lucide-react'
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useRouter } from 'next/navigation'

// --- Utility ---
function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

// --- DATA ---
const CATEGORIES = [
  { id: 'all', label: 'Összes', icon: Search, color: 'bg-zinc-500', gradient: 'from-zinc-500 to-zinc-700' },
  { id: 'mechanic', label: 'Szerelő', icon: Wrench, color: 'bg-indigo-500', gradient: 'from-indigo-500 to-blue-600' },
  { id: 'tire', label: 'Gumizás', icon: Car, color: 'bg-orange-500', gradient: 'from-orange-500 to-red-600' },
  { id: 'wash', label: 'Autómosó', icon: Droplets, color: 'bg-sky-500', gradient: 'from-sky-500 to-indigo-600' },
  { id: 'electric', label: 'Villamosság', icon: Zap, color: 'bg-amber-500', gradient: 'from-amber-500 to-orange-600' },
]

// --- Ikon generátor ---
const createModernIcon = (categoryId: string, isActive = false) => {
  if (typeof window === 'undefined') return L.divIcon({});
  const cat = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  const Icon = cat.icon;

  const html = renderToStaticMarkup(
    <div className={cn("relative flex items-center justify-center transition-all duration-300", isActive ? "scale-125 z-[1000]" : "scale-100")}>
      {isActive && <div className={cn("absolute inset-0 rounded-2xl animate-ping opacity-30", cat.color)}></div>}
      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg border-[3px] border-white dark:border-zinc-900 bg-gradient-to-br", cat.gradient)}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className={cn("absolute -bottom-1.5 w-3 h-3 rotate-45 border-r-[3px] border-b-[3px] border-white dark:border-zinc-900", cat.color)} />
    </div>
  );
  return L.divIcon({ html, className: '!bg-transparent', iconSize: [40, 48], iconAnchor: [20, 48], popupAnchor: [0, -48] });
}

// --- Map Logic ---
function MapController({ onMapClick, onMapDrag, isAdding }: { onMapClick: (lat: number, lng: number) => void, onMapDrag: () => void, isAdding: boolean }) {
  useMapEvents({ 
    click(e) { if (isAdding) onMapClick(e.latlng.lat, e.latlng.lng); },
    dragstart() { onMapDrag(); }, // Ha a térképet mozgatod, csukja be a menüt
  });
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
export default function ServiceMap({ initialPartners = [], user }: { initialPartners?: any[], user?: any }) {
  const [partners] = useState(initialPartners)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<'view' | 'add'>('view')
  
  // Állapotok
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [newServiceCoords, setNewServiceCoords] = useState<{ lat: number, lng: number } | null>(null)
  const [formData, setFormData] = useState({ name: '', category: 'mechanic', phone: '', address: '', description: '' })

  // UI States
  const [isMobile, setIsMobile] = useState(false)
  // 3 állapot: 'hidden' (térkép fókusz), 'half' (keresés), 'full' (lista)
  const [sheetState, setSheetState] = useState<'hidden' | 'half' | 'full'>('half') 
  
  const router = useRouter()
  const dragControls = useDragControls()

  // Görgetés tiltása és mobil detektálás
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSheetState('full'); // Desktopon mindig nyitva
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    
    return () => {
        window.removeEventListener('resize', checkMobile);
        document.body.style.overflow = '';
        document.body.style.overscrollBehavior = '';
    }
  }, []);

  // Filter
  const filteredPartners = useMemo(() => {
    let list = partners
    if (filter !== 'all') list = list.filter(p => p.category === filter)
    if (search.trim()) {
      const s = search.trim().toLowerCase()
      list = list.filter(p => p.name?.toLowerCase().includes(s) || p.address?.toLowerCase().includes(s))
    }
    return list
  }, [partners, filter, search])

  // GPS
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude])
        const map = document.querySelector('.leaflet-container');
        // @ts-ignore
        if(map && map._leaflet_map) map._leaflet_map.flyTo([pos.coords.latitude, pos.coords.longitude], 15);
      })
    }
  }

  // Térkép interakciók
  const handleMapClick = async (lat: number, lng: number) => {
    setNewServiceCoords({ lat, lng });
    if(isMobile) setSheetState('half'); 
    // ... geocoding ...
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        if(data && data.display_name) {
            setFormData(prev => ({ ...prev, address: data.display_name.split(',').slice(0, 3).join(',') }));
        }
    } catch(e) {}
  }

  // Térkép mozgatásakor (mobilon)
  const handleMapDrag = () => {
    if (isMobile && sheetState === 'full') {
        setSheetState('hidden'); // Ha mozgatja a térképet, tüntessük el a listát
    }
  }

  // Fiók mozgatása (Drag logic)
  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.y < -threshold) {
        // Felfelé húzás
        if (sheetState === 'hidden') setSheetState('half');
        else setSheetState('full');
    } else if (info.offset.y > threshold) {
        // Lefelé húzás
        if (sheetState === 'full') setSheetState('half');
        else setSheetState('hidden');
    }
  }

  // Variánsok a magassághoz
  const sheetVariants = {
    hidden: { y: "calc(100% - 80px)" }, // Csak a kis fül látszik
    half: { y: "55%" }, // Kereső + kategóriák látszanak
    full: { y: "0%" }   // Teljes képernyő
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans selection:bg-indigo-500/30 touch-none">
      
      {/* 1. TÉRKÉP RÉTEG */}
      <div className="absolute inset-0 z-0">
        <MapContainer center={[47.4979, 19.0402]} zoom={13} zoomControl={false} className="w-full h-full outline-none">
          <TileLayer attribution='&copy; CAR-MAP' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          <MapController onMapClick={handleMapClick} onMapDrag={handleMapDrag} isAdding={mode === 'add'} />
          <MapFlyTo position={newServiceCoords || userLocation} />

          {userLocation && (
             <Marker position={userLocation} icon={L.divIcon({ html: `<div class="relative w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>`, className: 'bg-transparent' })} />
          )}

          {mode === 'view' && filteredPartners.map(p => (
            <Marker key={p.id} position={[p.latitude, p.longitude]} icon={createModernIcon(p.category)} eventHandlers={{
                click: () => {
                    if(isMobile) setSheetState('hidden'); // Ha markerre kattint, húzza le a menüt, hogy lássa
                }
            }}>
              <Popup closeButton={false} className="custom-popup" offset={[0, -40]}>
                <div className="p-1 min-w-[200px]">
                    <h4 className="font-bold text-zinc-900 text-sm mb-1">{p.name}</h4>
                    <p className="text-xs text-zinc-500 mb-2">{p.address}</p>
                    <button className="w-full py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold">Útvonal</button>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {mode === 'add' && newServiceCoords && (
            <Marker position={[newServiceCoords.lat, newServiceCoords.lng]} icon={createModernIcon(formData.category || 'all', true)} />
          )}
        </MapContainer>
      </div>

      {/* 2. LEBEGŐ GOMBOK (Header) */}
      <div className="absolute top-0 left-0 right-0 p-4 lg:p-6 z-20 pointer-events-none flex justify-between items-start">
        <div className="flex flex-col gap-3 pointer-events-auto">
            <button onClick={() => router.push('/')} className="w-12 h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-lg rounded-2xl flex items-center justify-center text-zinc-700 dark:text-zinc-200 border border-white/50 hover:scale-105 transition-transform">
                <Home size={22} />
            </button>
            {mode === 'add' && (
                <button onClick={() => setMode('view')} className="w-12 h-12 bg-zinc-900 shadow-lg rounded-2xl flex items-center justify-center text-white hover:scale-105 transition-transform">
                    <ArrowLeft size={22} />
                </button>
            )}
        </div>
        <div className="flex flex-col gap-3 pointer-events-auto">
          <button onClick={handleLocateMe} className="w-12 h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-lg rounded-2xl flex items-center justify-center text-indigo-600 border border-white/50 hover:scale-105 transition-transform">
            <Locate size={22} />
          </button>
        </div>
      </div>

      {/* 3. RESPONSIVE DRAWER (Bottom Sheet / Sidebar) */}
      <motion.aside
        initial={false}
        animate={isMobile ? sheetState : { x: 0 }}
        variants={isMobile ? sheetVariants : undefined}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        drag={isMobile ? "y" : false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.05} // Kicsi rugalmasság, hogy ne lehessen túlhúzni
        onDragEnd={handleDragEnd}
        className={cn(
          "z-30 flex flex-col absolute bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]",
          // Mobile:
          "w-full h-[95dvh] bottom-0 left-0 rounded-t-[32px] border-t border-white/20",
          // Desktop:
          "lg:top-6 lg:left-6 lg:bottom-6 lg:w-[420px] lg:h-auto lg:rounded-[32px] lg:border border-white/40 lg:shadow-2xl"
        )}
      >
        {/* DRAG HANDLE (Csak ennél fogva húzható kényelmesen mobilon) */}
        <div 
            className="w-full h-8 flex justify-center items-center cursor-grab active:cursor-grabbing touch-none shrink-0 lg:hidden"
            onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full" />
        </div>

        {/* TARTALOM */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar touch-pan-y">
          <AnimatePresence mode="wait">
            
            {/* --- NÉZET MÓD --- */}
            {mode === 'view' ? (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
                
                <header className="mb-4 shrink-0">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Szerviz<span className="text-indigo-600">Kereső</span></h2>
                </header>

                {/* Kereső (Ha erre fókuszál, nyíljon ki a lista) */}
                <div className="mb-6 shrink-0">
                  <div className="relative group">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Mit keresel?"
                      className="w-full pl-12 pr-4 py-3.5 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      onFocus={() => isMobile && setSheetState('full')}
                    />
                  </div>
                </div>

                {/* Kategóriák */}
                <div className="mb-6 shrink-0">
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 lg:flex-wrap lg:mx-0 lg:px-0">
                        {CATEGORIES.map(cat => (
                            <button 
                            key={cat.id}
                            onClick={() => { setFilter(cat.id); if(isMobile) setSheetState('half'); }}
                            className={cn(
                                "flex flex-col items-center gap-2 p-3 min-w-[70px] rounded-2xl border transition-all",
                                filter === cat.id ? "bg-zinc-900 text-white border-zinc-900 scale-105" : "bg-white text-zinc-600 border-zinc-200"
                            )}
                            >
                                <cat.icon size={20} />
                                <span className="text-[10px] font-bold">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lista (Csak akkor görgethető, ha a drawer 'full') */}
                <div className={cn("flex-1 space-y-3 pb-20", isMobile && sheetState !== 'full' ? "overflow-hidden" : "")}>
                  {filteredPartners.length === 0 ? (
                    <div className="text-center py-10 text-zinc-400 text-sm">Nincs találat.</div>
                  ) : (
                    filteredPartners.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => {
                          const map = document.querySelector('.leaflet-container');
                          // @ts-ignore
                          if(map) map._leaflet_map.flyTo([p.latitude, p.longitude], 16);
                          if(isMobile) setSheetState('hidden'); // Ha kiválasztod, tűnjön el a lista, hogy lásd a térképet
                        }}
                        className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl shadow-sm active:scale-95 transition-transform"
                      >
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white", CATEGORIES.find(c=>c.id===p.category)?.color)}>
                           <MapPin size={18} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{p.name}</h4>
                          <p className="text-xs text-zinc-500 truncate">{p.address}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* FAB (Új hozzáadása) */}
                <div className="absolute bottom-6 left-6 right-6 lg:sticky lg:bottom-0 lg:pt-4 lg:bg-white/0">
                  <button 
                    onClick={() => { setMode('add'); if(isMobile) setSheetState('full'); }}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <Plus size={20} /> Új hely
                  </button>
                </div>

              </motion.div>
            ) : (
              
              /* --- HOZZÁADÁS MÓD --- */
              <motion.div key="add" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black">Új hely</h2>
                    <button onClick={() => setMode('view')} className="p-2 bg-zinc-100 rounded-full"><X size={20} /></button>
                 </div>
                 
                 <div className="flex-1 space-y-4 overflow-y-auto pb-10">
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-orange-700 text-xs font-bold flex gap-2">
                        <MapPin size={16} /> 1. Bökj a térképre a helyszínhez!
                    </div>

                    <div>
                        <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Név</label>
                        <input value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-zinc-50 border rounded-xl font-bold text-sm outline-none focus:border-indigo-500" placeholder="Szerviz neve" />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Kategória</label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            {CATEGORIES.filter(c=>c.id!=='all').map(c => (
                                <button key={c.id} onClick={()=>setFormData({...formData, category: c.id})} className={cn("p-2 rounded-xl border text-xs font-bold flex items-center gap-2", formData.category === c.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-zinc-600")}>
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-zinc-400 uppercase ml-1">Cím</label>
                        <textarea rows={2} readOnly value={formData.address} className="w-full p-3 bg-zinc-50 border rounded-xl font-bold text-sm outline-none resize-none" placeholder="Térkép jelölőre vár..." />
                    </div>
                    
                    <button disabled={!newServiceCoords || !formData.name} className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold disabled:opacity-50 mt-4">Beküldés</button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      <style jsx global>{`
        /* Térkép mindig alul */
        .leaflet-container { z-index: 1; background: #f4f4f5; }
        
        /* Popup stílus */
        .custom-popup .leaflet-popup-content-wrapper { border-radius: 16px; padding: 0; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
        .custom-popup .leaflet-popup-content { margin: 0; width: auto !important; }
        .custom-popup .leaflet-popup-tip { background: white; }
        .custom-popup a.leaflet-popup-close-button { display: none; }

        /* Scrollbar eltüntetése */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 0px; } /* Mobilon ne látszódjon */
      `}</style>
    </div>
  )
}