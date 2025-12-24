'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { 
  Search, MapPin, Wrench, Car, Zap, Droplets, Plus, 
  ArrowLeft, Send, Navigation, Layers, Home, Phone, FileText, Map as MapIcon, X, Locate
} from 'lucide-react'
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useRouter } from 'next/navigation'

// --- Utility: Class merger ---
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

// --- Marker ikon generátor (Premium Look) ---
const createModernIcon = (categoryId: string, isActive = false) => {
  if (typeof window === 'undefined') return L.divIcon({});
  const cat = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  const Icon = cat.icon;

  const html = renderToStaticMarkup(
    <div className={cn(
      "relative flex items-center justify-center transition-all duration-500 ease-out",
      isActive ? "scale-125 z-[1000]" : "scale-100 hover:scale-110"
    )}>
      {/* Pulse effect if active */}
      {isActive && <div className={cn("absolute inset-0 rounded-2xl animate-ping opacity-30", cat.color)}></div>}
      
      <div className={cn(
        "w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-[0_8px_16px_-4px_rgba(0,0,0,0.3)] border-[3px] border-white dark:border-zinc-900 bg-gradient-to-br",
        cat.gradient
      )}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className={cn(
        "absolute -bottom-1.5 w-3 h-3 rotate-45 border-r-[3px] border-b-[3px] border-white dark:border-zinc-900",
        cat.color
      )} />
    </div>
  );
  return L.divIcon({ html, className: '!bg-transparent', iconSize: [40, 48], iconAnchor: [20, 48], popupAnchor: [0, -48] });
}

// --- Map Logic ---
function MapController({ onMapClick, isAdding }: { onMapClick: (lat: number, lng: number) => void, isAdding: boolean }) {
  useMapEvents({ 
    click(e) { if (isAdding) onMapClick(e.latlng.lat, e.latlng.lng); },
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
  
  // Location & Form
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [newServiceCoords, setNewServiceCoords] = useState<{ lat: number, lng: number } | null>(null)
  const [formData, setFormData] = useState({ name: '', category: 'mechanic', phone: '', address: '', description: '' })

  // UI States
  const [isMobile, setIsMobile] = useState(false)
  const [sheetPosition, setSheetPosition] = useState<'hidden' | 'partial' | 'full'>('partial') // Mobil sheet status
  const router = useRouter()
  const dragControls = useDragControls()

  // Resize Listener
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSheetPosition('full'); // Desktopon mindig látszik
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter Logic
  const filteredPartners = useMemo(() => {
    let list = partners
    if (filter !== 'all') list = list.filter(p => p.category === filter)
    if (search.trim()) {
      const s = search.trim().toLowerCase()
      list = list.filter(p => p.name?.toLowerCase().includes(s) || p.address?.toLowerCase().includes(s))
    }
    return list
  }, [partners, filter, search])

  // GPS Location
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude])
        const map = document.querySelector('.leaflet-container');
        // @ts-ignore
        if(map && map._leaflet_map) map._leaflet_map.flyTo([pos.coords.latitude, pos.coords.longitude], 15);
      }, (err) => {
        alert("Nem sikerült meghatározni a helyzetedet.");
      })
    }
  }

  // Handle Map Click (Add Mode)
  const handleMapClick = async (lat: number, lng: number) => {
    setNewServiceCoords({ lat, lng });
    if(isMobile) setSheetPosition('full'); // Mobilon felhúzzuk a panelt teljesen
    
    // Reverse Geocoding
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        if(data && data.display_name) {
            // Cím rövidítése (hogy szebb legyen)
            const shortAddress = data.display_name.split(',').slice(0, 3).join(',');
            setFormData(prev => ({ ...prev, address: shortAddress }));
        }
    } catch(e) { console.error("Címkeresés hiba", e); }
  }

  // Mobil Drag Handler
  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.y > threshold) {
      setSheetPosition('partial');
    } else if (info.offset.y < -threshold) {
      setSheetPosition('full');
    }
  }

  // Sheet Variánsok (Framer Motion)
  const sheetVariants = {
    hidden: { y: "calc(100% - 60px)" }, // Csak a "fül" látszik
    partial: { y: "60%" }, // Félig felhúzva
    full: { y: "0%" } // Teljes képernyő (vagy majdnem)
  };

  return (
    <div className="relative w-full h-[100dvh] bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* 1. MAP LAYER */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[47.4979, 19.0402]}
          zoom={13}
          zoomControl={false}
          className="w-full h-full outline-none"
        >
          {/* Sötét mód barát térkép stílus (CartoDB Voyager) */}
          <TileLayer
            attribution='&copy; CAR-MAP'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapController onMapClick={handleMapClick} isAdding={mode === 'add'} />
          <MapFlyTo position={newServiceCoords || userLocation} />

          {/* User Marker */}
          {userLocation && (
             <Marker position={userLocation} icon={L.divIcon({ 
                 html: `<div class="relative flex items-center justify-center w-6 h-6">
                          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white shadow-md"></span>
                        </div>`, 
                 className: 'bg-transparent' 
             })} />
          )}

          {/* Service Markers */}
          {mode === 'view' && filteredPartners.map(p => (
            <Marker key={p.id} position={[p.latitude, p.longitude]} icon={createModernIcon(p.category)}>
              <Popup closeButton={false} className="custom-popup" offset={[0, -40]}>
                <div className="p-1 min-w-[220px]">
                  <div className="relative h-20 bg-zinc-100 rounded-t-xl overflow-hidden mb-2">
                     <div className={cn("absolute inset-0 opacity-20 bg-gradient-to-br", CATEGORIES.find(c=>c.id===p.category)?.gradient)} />
                     <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 rounded-lg text-[10px] font-bold uppercase tracking-wider text-zinc-800 shadow-sm">
                        {CATEGORIES.find(c => c.id === p.category)?.label}
                     </div>
                  </div>
                  <div className="px-2 pb-2">
                    <h4 className="font-bold text-zinc-900 text-lg leading-tight mb-1">{p.name}</h4>
                    <p className="text-xs text-zinc-500 mb-3 flex items-start gap-1">
                        <MapPin size={12} className="mt-0.5 shrink-0" /> 
                        {p.address}
                    </p>
                    <button className="w-full py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-zinc-900/20">
                      <Navigation size={14} /> Útvonal indítása
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* New Service Marker */}
          {mode === 'add' && newServiceCoords && (
            <Marker position={[newServiceCoords.lat, newServiceCoords.lng]} icon={createModernIcon(formData.category || 'all', true)} />
          )}
        </MapContainer>
      </div>

      {/* 2. FLOATING CONTROLS (Desktop & Mobile header) */}
      <div className="absolute top-0 left-0 right-0 p-4 lg:p-6 z-20 pointer-events-none flex justify-between items-start">
        {/* Bal felső gombok */}
        <div className="flex flex-col gap-3 pointer-events-auto">
            <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="w-11 h-11 lg:w-12 lg:h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl flex items-center justify-center text-zinc-700 dark:text-zinc-200 border border-white/50 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 transition-colors group"
            title="Vissza a főoldalra"
            >
            <Home size={20} className="group-hover:text-indigo-500 transition-colors" />
            </motion.button>
            
            {/* Vissza gomb (csak ha mélyebben vagyunk) */}
            {mode === 'add' && (
                <motion.button 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                onClick={() => setMode('view')}
                className="w-11 h-11 lg:w-12 lg:h-12 bg-zinc-900/90 backdrop-blur-xl shadow-lg rounded-2xl flex items-center justify-center text-white border border-white/20"
                >
                <ArrowLeft size={20} />
                </motion.button>
            )}
        </div>

        {/* Jobb felső vezérlők */}
        <div className="flex flex-col gap-3 pointer-events-auto">
          <motion.button 
             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
             onClick={handleLocateMe} 
             className="w-11 h-11 lg:w-12 lg:h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl flex items-center justify-center text-indigo-600 border border-white/50 dark:border-zinc-700"
          >
            <Locate size={20} />
          </motion.button>
        </div>
      </div>

      {/* 3. RESPONSIVE DRAWER / BOTTOM SHEET */}
      <motion.aside
        initial={false}
        animate={isMobile ? sheetPosition : { x: 0 }}
        variants={isMobile ? sheetVariants : undefined}
        transition={{ type: "spring", damping: 25, stiffness: 250 }}
        drag={isMobile ? "y" : false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className={cn(
          "z-30 flex flex-col absolute bg-white/80 dark:bg-zinc-900/90 backdrop-blur-2xl shadow-2xl",
          // Mobile Styles
          "w-full h-[90dvh] bottom-0 left-0 rounded-t-[32px] border-t border-white/20 dark:border-zinc-700",
          // Desktop Styles
          "lg:top-6 lg:left-6 lg:bottom-6 lg:w-[420px] lg:h-auto lg:rounded-[32px] lg:border border-white/40 dark:border-zinc-700 lg:shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
        )}
      >
        {/* Mobile Drag Handle */}
        <div 
            className="lg:hidden w-full pt-4 pb-2 flex justify-center cursor-grab active:cursor-grabbing touch-none shrink-0"
            onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full" />
        </div>

        {/* --- CONTENT CONTAINER --- */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* --- VIEW MODE --- */}
            {mode === 'view' ? (
              <motion.div key="view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-2 h-full flex flex-col">
                
                <header className="mb-6">
                  <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter mb-1">
                    Garázs <span className="text-indigo-500">Térkép</span>
                  </h2>
                  <p className="text-zinc-500 text-sm font-medium">
                    {filteredPartners.length} szervizpartner a közeledben
                  </p>
                </header>

                {/* Kereső */}
                <div className="relative mb-6 group shrink-0">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Mit keresel? (pl. Gumis)"
                    className="block w-full pl-11 pr-4 py-4 bg-zinc-50 dark:bg-black/20 rounded-2xl text-sm font-bold text-zinc-900 dark:text-white shadow-inner ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onFocus={() => isMobile && setSheetPosition('full')}
                  />
                </div>

                {/* Kategóriák */}
                <div className="mb-8 shrink-0">
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide lg:flex-wrap lg:mx-0 lg:px-0 lg:pb-0">
                        {CATEGORIES.map(cat => (
                            <button 
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            className={cn(
                                "flex flex-col items-center gap-2 p-3 min-w-[80px] rounded-2xl transition-all border",
                                filter === cat.id 
                                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-lg scale-105" 
                                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                            )}
                            >
                                <cat.icon size={24} strokeWidth={1.5} />
                                <span className="text-[10px] font-bold">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Találati Lista */}
                <div className="flex-1 space-y-3 min-h-[200px]">
                  {filteredPartners.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-zinc-400 opacity-50">
                        <MapIcon size={48} strokeWidth={1} className="mb-2" />
                        <p className="text-sm font-medium">Nincs találat a közelben.</p>
                    </div>
                  ) : (
                    filteredPartners.map(p => (
                      <motion.div 
                        layoutId={p.id}
                        key={p.id}
                        onClick={() => {
                          const map = document.querySelector('.leaflet-container');
                          // @ts-ignore
                          if(map) map._leaflet_map.flyTo([p.latitude, p.longitude], 16);
                          if(isMobile) setSheetPosition('partial'); // Mobilon lehúzzuk félig, hogy látszódjon a térkép
                        }}
                        className="group flex items-center gap-4 p-4 bg-white dark:bg-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50 rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98]"
                      >
                        <div className={cn("w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-white shadow-sm bg-gradient-to-br", CATEGORIES.find(c=>c.id===p.category)?.gradient)}>
                           {(() => { const Icon = CATEGORIES.find(c=>c.id===p.category)?.icon || MapPin; return <Icon size={20} /> })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-zinc-900 dark:text-white text-sm truncate">{p.name}</h4>
                          <p className="text-xs text-zinc-500 truncate">{p.address}</p>
                          <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-400">
                                  {CATEGORIES.find(c=>c.id===p.category)?.label}
                              </span>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-indigo-500 group-hover:border-indigo-200 transition-colors">
                           <ArrowLeft size={14} className="rotate-180" />
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* FAB (Floating Action Button) */}
                <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-zinc-50 dark:from-zinc-900 to-transparent">
                  <button 
                    onClick={() => { setMode('add'); if(isMobile) setSheetPosition('full'); }}
                    className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold text-sm shadow-xl shadow-zinc-900/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    <Plus size={18} strokeWidth={2.5} /> Új hely hozzáadása
                  </button>
                </div>

              </motion.div>
            ) : mode === 'add' ? (
              
              /* --- ADD MODE --- */
              <motion.div key="add" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pt-2 h-full flex flex-col">
                
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Új szerviz</h2>
                        <p className="text-xs text-zinc-500">Jelöld meg a térképen és töltsd ki az adatokat.</p>
                    </div>
                    <button onClick={() => setMode('view')} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-5 flex-1 overflow-y-auto pb-20 custom-scrollbar pr-1">
                   
                   {/* Name Input */}
                   <div className="group">
                      <label className="text-[11px] font-bold uppercase text-zinc-400 mb-1.5 block tracking-wider">Szerviz neve</label>
                      <input 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                        placeholder="Pl. Kovács Autószerviz" 
                      />
                   </div>

                   {/* Category Grid */}
                   <div>
                      <label className="text-[11px] font-bold uppercase text-zinc-400 mb-2 block tracking-wider">Kategória</label>
                      <div className="grid grid-cols-2 gap-3">
                        {CATEGORIES.filter(c=>c.id!=='all').map(c => (
                           <button 
                             key={c.id} 
                             onClick={() => setFormData({...formData, category: c.id})}
                             className={cn(
                                "p-3 rounded-2xl border text-xs font-bold text-left flex items-center gap-3 transition-all",
                                formData.category === c.id 
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md transform scale-[1.02]" 
                                    : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                             )}
                           >
                              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm", formData.category === c.id ? "bg-white/20" : c.color)}>
                                  <c.icon size={14} />
                              </div>
                              {c.label}
                           </button>
                        ))}
                      </div>
                   </div>

                   {/* Address & Coords */}
                   <div>
                      <label className="text-[11px] font-bold uppercase text-zinc-400 mb-1.5 block tracking-wider">Pontos Cím</label>
                      <div className={cn(
                          "relative transition-all duration-300",
                          !newServiceCoords && "ring-2 ring-orange-500/50 rounded-2xl"
                      )}>
                        <MapIcon className="absolute left-4 top-4 text-zinc-400" size={18} />
                        <textarea 
                            rows={2}
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="w-full pl-12 p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed" 
                            placeholder={newServiceCoords ? "Cím betöltése..." : "Kattints a térképre a hely megjelöléséhez!"} 
                        />
                      </div>
                      {!newServiceCoords && (
                          <div className="flex items-center gap-2 mt-2 text-orange-500 text-xs font-bold animate-pulse">
                              <MapPin size={14} /> Kérlek bökj a térképre a pontosításhoz!
                          </div>
                      )}
                   </div>

                   {/* Phone */}
                   <div>
                      <label className="text-[11px] font-bold uppercase text-zinc-400 mb-1.5 block tracking-wider">Telefonszám</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full pl-12 p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-colors" 
                            placeholder="+36 30 123 4567" 
                        />
                      </div>
                   </div>

                   {/* Submit Button */}
                   <div className="pt-4">
                      <button 
                        disabled={!newServiceCoords || !formData.name}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 active:scale-[0.98] transition-all"
                      >
                         <Send size={18} /> Szerviz Beküldése
                      </button>
                   </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Global Styles Fixes */}
      <style jsx global>{`
        .leaflet-container { font-family: inherit; z-index: 10; background: #f4f4f5; }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 20px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 20px 50px -10px rgba(0,0,0,0.3);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.5);
        }
        .custom-popup .leaflet-popup-content { margin: 0; width: auto !important; }
        .custom-popup .leaflet-popup-tip { background: rgba(255, 255, 255, 0.9); }
        .custom-popup a.leaflet-popup-close-button { display: none; }
        
        /* Scrollbar styling */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
      `}</style>
    </div>
  )
}