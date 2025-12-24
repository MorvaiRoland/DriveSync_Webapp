'use client'

import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { 
  Search, MapPin, Wrench, Car, Zap, Droplets, Plus, 
  ArrowLeft, Send, Navigation, Layers, Home, Phone, FileText, Map as MapIcon
} from 'lucide-react'
// import { createClient } from '@/supabase/client' // Ha használod a DB-t
import { motion, AnimatePresence } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useRouter } from 'next/navigation' // Router importálása

// --- Segéd: Class merger ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- KATEGÓRIÁK ---
const CATEGORIES = [
  { id: 'all', label: 'Összes', icon: Search, color: 'bg-zinc-500', gradient: 'from-zinc-500 to-zinc-700' },
  { id: 'mechanic', label: 'Szerelő', icon: Wrench, color: 'bg-indigo-500', gradient: 'from-indigo-500 to-blue-600' },
  { id: 'tire', label: 'Gumizás', icon: Car, color: 'bg-orange-500', gradient: 'from-orange-500 to-red-600' },
  { id: 'wash', label: 'Autómosó', icon: Droplets, color: 'bg-sky-500', gradient: 'from-sky-500 to-indigo-600' },
  { id: 'electric', label: 'Villamosság', icon: Zap, color: 'bg-amber-500', gradient: 'from-amber-500 to-orange-600' },
]

// --- Marker ikon generátor ---
const createModernIcon = (categoryId: string, isActive = false) => {
  if (typeof window === 'undefined') return L.divIcon({});
  const cat = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  const Icon = cat.icon;

  const html = renderToStaticMarkup(
    <div className={cn(
      "relative flex items-center justify-center transition-transform duration-300",
      isActive ? "scale-125 z-[1000]" : "scale-100 hover:scale-110"
    )}>
      <div className={cn(
        "w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/20 border-2 border-white dark:border-zinc-800 bg-gradient-to-br",
        cat.gradient
      )}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className={cn(
        "absolute -bottom-1 w-3 h-3 rotate-45 border-r-2 border-b-2 border-white dark:border-zinc-800 bg-inherit",
        cat.color
      )} />
    </div>
  );
  return L.divIcon({ html, className: '', iconSize: [40, 44], iconAnchor: [20, 44] });
}

// --- Map komponensek ---
function MapController({ onMapClick, isAdding }: { onMapClick: (lat: number, lng: number) => void, isAdding: boolean }) {
  useMapEvents({ click(e) { if (isAdding) onMapClick(e.latlng.lat, e.latlng.lng); }, });
  return null;
}

function MapFlyTo({ position }: { position: any }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      const coords = (Array.isArray(position) ? position : [position.lat, position.lng]) as [number, number];
      map.flyTo(coords, 15, { duration: 1.5, easeLinearity: 0.25 });
    }
  }, [position, map]);
  return null;
}

// === FŐ KOMPONENS ===
export default function ServiceMap({ initialPartners, user }: { initialPartners: any[], user: any }) {
  const [partners, setPartners] = useState(initialPartners)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<'view' | 'add' | 'success'>('view')
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  
  // Űrlap állapot
  const [newServiceCoords, setNewServiceCoords] = useState<{ lat: number, lng: number } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'mechanic',
    phone: '',
    address: '',
    description: ''
  })

  // Responsive States
  const [isMobile, setIsMobile] = useState(false)
  const [sheetState, setSheetState] = useState<'collapsed' | 'half' | 'full'>('half')

  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredPartners = useMemo(() => {
    let list = partners
    if (filter !== 'all') list = list.filter(p => p.category === filter)
    if (search.trim()) {
      const s = search.trim().toLowerCase()
      list = list.filter(p => p.name?.toLowerCase().includes(s) || p.address?.toLowerCase().includes(s))
    }
    return list
  }, [partners, filter, search])

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude])
      })
    }
  }

  // Térkép kattintás kezelése hozzáadáskor
  const handleMapClick = async (lat: number, lng: number) => {
    setNewServiceCoords({ lat, lng });
    setSheetState('half'); // Felnyitjuk a panelt, hogy lássa az űrlapot
    
    // Opcionális: Cím visszakeresése (Reverse Geocoding)
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        if(data && data.display_name) {
            setFormData(prev => ({ ...prev, address: data.display_name }));
        }
    } catch(e) {
        console.error("Címkeresés hiba", e);
    }
  }

  return (
    <div className="relative w-full h-[100dvh] bg-zinc-100 dark:bg-zinc-950 overflow-hidden font-sans">
      
      {/* 1. TÉRKÉP (Háttér) */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[47.4979, 19.0402]}
          zoom={13}
          zoomControl={false}
          className="w-full h-full outline-none"
        >
          <TileLayer
            attribution='&copy; CAR-MAP'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapController onMapClick={handleMapClick} isAdding={mode === 'add'} />
          <MapFlyTo position={newServiceCoords || userLocation} />

          {userLocation && (
             <Marker position={userLocation} icon={L.divIcon({ html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg pulse-ring"></div>`, className: 'bg-transparent' })} />
          )}

          {mode === 'view' && filteredPartners.map(p => (
            <Marker key={p.id} position={[p.latitude, p.longitude]} icon={createModernIcon(p.category)}>
              <Popup closeButton={false} className="custom-popup">
                <div className="p-2 min-w-[200px]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1">
                    {CATEGORIES.find(c => c.id === p.category)?.label}
                  </p>
                  <h4 className="font-bold text-zinc-900 text-base">{p.name}</h4>
                  <p className="text-xs text-zinc-500 mb-3">{p.address}</p>
                  <button className="w-full py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors">
                    <Navigation size={14} /> Útvonal
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {mode === 'add' && newServiceCoords && (
            <Marker position={[newServiceCoords.lat, newServiceCoords.lng]} icon={createModernIcon(formData.category || 'all', true)} />
          )}
        </MapContainer>
      </div>

      {/* 2. LEBEGŐ NAVIGÁCIÓ (Felső sáv) */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 z-20 pointer-events-none flex justify-between items-start">
        {/* Bal felső gombok */}
        <div className="flex flex-col gap-3 pointer-events-auto">
            {/* Vissza gomb */}
            <button 
            onClick={() => window.history.back()}
            className="w-10 h-10 md:w-12 md:h-12 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg rounded-full flex items-center justify-center text-zinc-700 dark:text-zinc-200 border border-white/50 hover:scale-105 transition-transform"
            >
            <ArrowLeft size={20} />
            </button>
            
            {/* ÚJ: Főoldal gomb */}
            <button 
            onClick={() => router.push('/')}
            className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600/90 backdrop-blur-md shadow-lg rounded-full flex items-center justify-center text-white border border-white/20 hover:scale-105 transition-transform hover:bg-indigo-700"
            title="Vissza a főoldalra"
            >
            <Home size={20} />
            </button>
        </div>

        {/* Jobb felső vezérlők */}
        <div className="flex flex-col gap-3 pointer-events-auto">
          <button onClick={handleLocateMe} className="w-10 h-10 md:w-12 md:h-12 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg rounded-2xl flex items-center justify-center text-indigo-600 border border-white/50 hover:bg-white transition-colors">
            <Navigation size={20} />
          </button>
          <button className="w-10 h-10 md:w-12 md:h-12 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg rounded-2xl flex items-center justify-center text-zinc-500 border border-white/50 hover:bg-white transition-colors">
            <Layers size={20} />
          </button>
        </div>
      </div>

      {/* 3. SIDEBAR / BOTTOM SHEET */}
      <motion.aside
        initial={isMobile ? { y: '100%' } : { x: -400, opacity: 0 }}
        animate={isMobile ? { y: sheetState === 'collapsed' ? 'calc(100% - 80px)' : sheetState === 'half' ? '45%' : '0%' } : { x: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        drag={isMobile ? "y" : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={(_, info) => {
            if (info.offset.y < -50) setSheetState('full');
            else if (info.offset.y > 50) setSheetState('collapsed');
        }}
        className={cn(
          "z-30 flex flex-col",
          "bg-white/70 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/40 dark:border-zinc-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
          "fixed bottom-0 left-0 right-0 rounded-t-[32px]", // Mobil
          "md:top-4 md:left-4 md:bottom-4 md:right-auto md:w-[450px] md:rounded-[32px] md:h-auto" // Desktop (szélesebb lett kicsit)
        )}
      >
        {/* Drag Indicator (Mobil) */}
        <div className="md:hidden w-full pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing touch-none" onClick={() => setSheetState(sheetState === 'collapsed' ? 'half' : 'collapsed')}>
          <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full" />
        </div>

        {/* Panel Tartalom */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            {mode === 'view' ? (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-2">
                
                <header className="mb-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Fedezd fel</h2>
                    <p className="text-zinc-500 text-xs font-medium mt-1">Találj megbízható szervizpartnereket</p>
                  </div>
                  <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                    {filteredPartners.length} hely
                  </div>
                </header>

                {/* Kereső */}
                <div className="relative mb-6 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Mit keresel? (pl. Gumis)"
                    className="block w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-800 rounded-2xl text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 dark:ring-zinc-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                {/* Kategóriák - JAVÍTOTT PC LAYOUT */}
                <div className="mb-6">
                    <p className="text-xs font-bold uppercase text-zinc-400 mb-3 ml-1">Kategóriák</p>
                    <div className={cn(
                        "flex gap-2 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide", // Mobil stílus (görgethető)
                        "md:flex-wrap md:overflow-visible md:pb-0 md:mx-0 md:px-0" // PC stílus (wrap, nincs görgetés)
                    )}>
                        {CATEGORIES.map(cat => (
                            <button 
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap transition-all border",
                                filter === cat.id 
                                ? "bg-zinc-900 text-white border-zinc-900 shadow-lg scale-105" 
                                : "bg-white dark:bg-zinc-800 text-zinc-600 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                            )}
                            >
                                <cat.icon size={16} className={filter === cat.id ? "text-white" : "text-zinc-400"} />
                                <span className="text-xs font-bold">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Találati Lista */}
                <div className="space-y-3 pb-20">
                  {filteredPartners.length === 0 ? (
                    <div className="text-center py-10 text-zinc-400 text-sm">Nincs találat a közelben.</div>
                  ) : (
                    filteredPartners.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => {
                          const map = document.querySelector('.leaflet-container');
                          // @ts-ignore
                          if(map) map._leaflet_map.flyTo([p.latitude, p.longitude], 16);
                        }}
                        className="group flex items-center gap-4 p-3 bg-white/60 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-800 border border-white/50 dark:border-zinc-700 rounded-2xl transition-all cursor-pointer hover:shadow-md active:scale-[0.98]"
                      >
                        <div className={cn("w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-white shadow-sm bg-gradient-to-br", CATEGORIES.find(c=>c.id===p.category)?.gradient)}>
                           {(() => { const Icon = CATEGORIES.find(c=>c.id===p.category)?.icon || MapPin; return <Icon size={20} /> })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-zinc-900 dark:text-white text-sm truncate">{p.name}</h4>
                          <p className="text-xs text-zinc-500 truncate">{p.address}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                           <ArrowLeft size={14} className="rotate-180" />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* FAB */}
                <div className="absolute bottom-6 left-6 right-6">
                  <button 
                    onClick={() => { setMode('add'); setSheetState('half'); }}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    <Plus size={20} /> Új hely hozzáadása
                  </button>
                </div>

              </motion.div>
            ) : mode === 'add' ? (
              <motion.div key="add" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pt-2 h-full flex flex-col">
                <button onClick={() => setMode('view')} className="self-start mb-4 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-600 flex items-center gap-1 transition-colors">
                  <ArrowLeft size={14} /> Mégsem
                </button>
                
                <h2 className="text-xl font-black mb-1">Új szerviz felvétele</h2>
                <p className="text-xs text-zinc-500 mb-6">Töltsd ki az adatokat a pontos megjelenéshez.</p>
                
                {/* BŐVÍTETT FORM */}
                <div className="space-y-4 flex-1 pb-10">
                   
                   {/* 1. Név */}
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-400 pl-1">Szerviz neve</label>
                      <input 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 transition-colors" 
                        placeholder="Pl. Kovács Autószerviz" 
                      />
                   </div>

                   {/* 2. Kategória választó (Grid) */}
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-400 pl-1">Kategória</label>
                      <div className="grid grid-cols-2 gap-2">
                        {CATEGORIES.filter(c=>c.id!=='all').map(c => (
                           <button 
                             key={c.id} 
                             onClick={() => setFormData({...formData, category: c.id})}
                             className={cn(
                                "p-2 rounded-xl border text-xs font-medium text-left flex items-center gap-2 transition-all",
                                formData.category === c.id 
                                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500" 
                                    : "border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                             )}
                           >
                              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px]", c.color.replace('bg-', 'bg-'))}>
                                  <c.icon size={12} />
                              </div>
                              {c.label}
                           </button>
                        ))}
                      </div>
                   </div>

                   {/* 3. Telefonszám */}
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-400 pl-1">Telefonszám</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full pl-10 p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 transition-colors" 
                            placeholder="+36 30 123 4567" 
                        />
                      </div>
                   </div>

                   {/* 4. Cím (Map click tölti ki, de szerkeszthető) */}
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-400 pl-1">Pontos Cím</label>
                      <div className="relative">
                        <MapIcon className="absolute left-3 top-3 text-zinc-400" size={16} />
                        <textarea 
                            rows={2}
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="w-full pl-10 p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 transition-colors resize-none" 
                            placeholder={newServiceCoords ? "Cím betöltése..." : "Kattints a térképre a címért vagy írd be kézzel."} 
                        />
                      </div>
                      {!newServiceCoords && <p className="text-[10px] text-orange-500 font-medium ml-1">Kérlek jelöld ki a térképen is a helyet!</p>}
                   </div>

                   {/* 5. Leírás */}
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-400 pl-1">Rövid leírás (Opcionális)</label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 text-zinc-400" size={16} />
                        <textarea 
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full pl-10 p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 transition-colors resize-none" 
                            placeholder="Nyitvatartás, szolgáltatások részletezése..." 
                        />
                      </div>
                   </div>

                   <div className="pt-2">
                      <button 
                        disabled={!newServiceCoords || !formData.name}
                        className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black transition-colors"
                      >
                         <Send size={16} /> Szerviz beküldése
                      </button>
                   </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.aside>

      <style jsx global>{`
        .leaflet-container { font-family: inherit; z-index: 10; }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 16px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.3);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.5);
        }
        .custom-popup .leaflet-popup-tip { background: rgba(255, 255, 255, 0.95); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        
        .pulse-ring {
           animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
           0%, 100% { opacity: 1; transform: scale(1); }
           50% { opacity: .5; transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}