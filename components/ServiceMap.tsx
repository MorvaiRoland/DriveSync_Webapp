'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { 
  Search, MapPin, Wrench, Car, Zap, Droplets, Plus, 
  ArrowLeft, Send, ShieldCheck, Loader2, X, Navigation, 
  Phone, Info, CheckCircle2, Map as MapIcon, Layers
} from 'lucide-react'
import { createClient } from '@/supabase/client'
import { motion, AnimatePresence, useDragControls, useMotionValue, useSpring } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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

// --- Custom Marker Icon ---
const createModernIcon = (categoryId: string, isActive = false) => {
  if (typeof window === 'undefined') return L.divIcon({});
  const cat = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  const Icon = cat.icon;

  const html = renderToStaticMarkup(
    <div className={cn(
      "relative flex items-center justify-center transition-transform duration-300",
      isActive ? "scale-125 z-[1000]" : "scale-100"
    )}>
      <div className={cn(
        "w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xl border-2 border-white dark:border-zinc-900 bg-gradient-to-br",
        cat.gradient
      )}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className={cn(
        "absolute -bottom-1 w-3 h-3 rotate-45 border-r-2 border-b-2 border-white dark:border-zinc-900 bg-inherit",
        cat.color
      )} />
    </div>
  );

  return L.divIcon({ html, className: '', iconSize: [40, 44], iconAnchor: [20, 44] });
}

// --- Térkép Segédkomponensek ---
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
      // JAVÍTÁS: Az "as [number, number]" hozzáadása a végére megoldja a hibát
      const coords = (Array.isArray(position) 
        ? position 
        : [position.lat, position.lng]) as [number, number];
      
      map.flyTo(coords, 15, { duration: 1.5, easeLinearity: 0.25 });
    }
  }, [position, map]);

  return null;
}

export default function ServiceMap({ initialPartners, user }: { initialPartners: any[], user: any }) {
  const [partners, setPartners] = useState(initialPartners)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<'view' | 'add' | 'success'>('view')
  const [isLoading, setIsLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [newServiceCoords, setNewServiceCoords] = useState<{ lat: number, lng: number } | null>(null)
  const [addressInput, setAddressInput] = useState('')
  const [foundAddress, setFoundAddress] = useState('')
  const [form, setForm] = useState({ name: '', category: 'mechanic', phone: '', description: '', address: '' })
  
  // --- Responsive & Animation States ---
  const [isMobile, setIsMobile] = useState(false)
  const [sheetState, setSheetState] = useState<'collapsed' | 'half' | 'full'>('half')
  const sheetY = useMotionValue(0)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const supabase = createClient()

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

  // --- UI Renders ---
  return (
    <div className="relative w-full h-[100dvh] bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* 1. TÉRKÉP RÉTEG */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[47.4979, 19.0402]}
          zoom={13}
          zoomControl={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; CAR-MAP'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapController onMapClick={(lat, lng) => {
             setNewServiceCoords({ lat, lng });
             setSheetState('half');
          }} isAdding={mode === 'add'} />
          <MapFlyTo position={newServiceCoords || userLocation} />

          {filteredPartners.map(p => (
            <Marker key={p.id} position={[p.latitude, p.longitude]} icon={createModernIcon(p.category)}>
              <Popup closeButton={false} className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1">
                    {CATEGORIES.find(c => c.id === p.category)?.label}
                  </p>
                  <h4 className="font-bold text-zinc-900">{p.name}</h4>
                  <p className="text-xs text-zinc-500 mb-3">{p.address}</p>
                  <button className="w-full py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                    <Navigation size={14} /> Útvonal
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {newServiceCoords && (
            <Marker position={[newServiceCoords.lat, newServiceCoords.lng]} icon={createModernIcon('all', true)} />
          )}
        </MapContainer>
      </div>

      {/* 2. LEBEGŐ KERESŐ (DESKTOP) / HEADER (MOBILE) */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 pointer-events-none flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button 
            onClick={() => window.history.back()}
            className="w-12 h-12 bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl flex items-center justify-center text-zinc-700 dark:text-zinc-200 border border-white/20 backdrop-blur-xl"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="hidden md:flex bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-1 items-center gap-1">
             {CATEGORIES.map(cat => (
               <button 
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  filter === cat.id ? "bg-zinc-900 text-white shadow-lg" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
               >
                 {cat.label}
               </button>
             ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <button onClick={handleLocateMe} className="w-12 h-12 bg-white dark:bg-zinc-900 shadow-xl rounded-2xl flex items-center justify-center text-indigo-500 border border-white/20 backdrop-blur-xl">
            <Navigation size={20} />
          </button>
          <button className="w-12 h-12 bg-white dark:bg-zinc-900 shadow-xl rounded-2xl flex items-center justify-center text-zinc-500 border border-white/20 backdrop-blur-xl">
            <Layers size={20} />
          </button>
        </div>
      </div>

      {/* 3. INTERAKTÍV OLDALPANEL / BOTTOM SHEET */}
      <motion.aside
        initial={isMobile ? { y: '100%' } : { x: -400 }}
        animate={isMobile ? { y: sheetState === 'collapsed' ? '85%' : sheetState === 'half' ? '40%' : '5%' } : { x: 0 }}
        drag={isMobile ? "y" : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={(_, info) => {
            if (info.offset.y < -50) setSheetState('full');
            else if (info.offset.y > 50) setSheetState('collapsed');
        }}
        className={cn(
          "z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-[0_-10px_50px_rgba(0,0,0,0.1)] flex flex-col",
          "fixed bottom-0 left-0 right-0 rounded-t-[40px] md:top-4 md:left-4 md:bottom-4 md:right-auto md:w-[420px] md:rounded-[32px] md:border md:border-white/10"
        )}
      >
        {/* Drag Handle (Mobile only) */}
        <div className="md:hidden w-full py-4 flex justify-center cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {mode === 'view' ? (
              <motion.div key="view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <header className="mb-6">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Fedezd fel</h2>
                  <p className="text-zinc-500 text-sm">Találj megbízható szervizpartnereket</p>
                </header>

                {/* Kereső Sáv */}
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Név, város vagy típus..."
                    className="w-full pl-12 pr-4 py-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                {/* Mobil Kategória Görgető */}
                <div className="md:hidden flex gap-3 overflow-x-auto pb-6 scrollbar-hide">
                   {CATEGORIES.map(cat => (
                     <button 
                      key={cat.id}
                      onClick={() => setFilter(cat.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 min-w-[80px]",
                        filter === cat.id ? "opacity-100" : "opacity-50"
                      )}
                     >
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br", cat.gradient)}>
                          <cat.icon size={22} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{cat.label}</span>
                     </button>
                   ))}
                </div>

                {/* Lista */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-black uppercase text-zinc-400 tracking-widest">{filteredPartners.length} Találat</span>
                    <button className="text-xs font-bold text-indigo-500">Térképen mind</button>
                  </div>

                  {filteredPartners.map(p => (
                    <motion.div 
                      layoutId={p.id}
                      key={p.id}
                      className="group bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 p-4 rounded-[24px] hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer active:scale-95"
                    >
                      <div className="flex gap-4">
                        <div className={cn("w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center text-white shadow-inner bg-gradient-to-br", CATEGORIES.find(c=>c.id===p.category)?.gradient)}>
                           {(() => {
                             const Icon = CATEGORIES.find(c=>c.id===p.category)?.icon || MapPin;
                             return <Icon size={24} />
                           })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-zinc-900 dark:text-white truncate group-hover:text-indigo-500 transition-colors">{p.name}</h4>
                          <p className="text-sm text-zinc-500 truncate flex items-center gap-1">
                            <MapPin size={12} /> {p.address}
                          </p>
                          <div className="flex gap-2 mt-3">
                             <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tighter">4.8 ★ (120+)</span>
                             <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-md text-[10px] font-bold text-emerald-600 uppercase">Nyitva</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Sticky Add Button */}
                <div className="sticky bottom-0 mt-8 pb-2">
                  <button 
                    onClick={() => setMode('add')}
                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[22px] font-bold shadow-2xl shadow-indigo-500/40 flex items-center justify-center gap-3 transition-transform active:scale-95"
                  >
                    <Plus size={20} /> Új hely beküldése
                  </button>
                </div>
              </motion.div>
            ) : mode === 'add' ? (
              <motion.div key="add" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => setMode('view')} className="mb-6 flex items-center gap-2 text-zinc-500 font-bold text-sm">
                  <ArrowLeft size={16} /> Vissza a listához
                </button>
                <h2 className="text-2xl font-black mb-8">Hely hozzáadása</h2>
                
                <div className="space-y-6">
                  <div className="group">
                    <label className="text-xs font-black uppercase text-zinc-400 mb-2 block ml-1">Szerviz neve *</label>
                    <input className="w-full p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-medium" placeholder="Hogy hívják a helyet?" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black uppercase text-zinc-400 mb-2 block ml-1">Típus</label>
                      <select className="w-full p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border-none outline-none font-bold">
                        {CATEGORIES.filter(c=>c.id!=='all').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase text-zinc-400 mb-2 block ml-1">Mobil</label>
                      <input className="w-full p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border-none outline-none font-medium" placeholder="+36..." />
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-[24px] border border-indigo-100 dark:border-indigo-800/30">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
                       <MapIcon size={14} /> JELÖLD KI A TÉRKÉPEN
                    </p>
                    <div className="text-sm text-zinc-600 dark:text-zinc-300 font-medium">
                       {newServiceCoords ? (
                         <span className="flex items-center gap-2 text-emerald-600"><CheckCircle2 size={16} /> Koordináták rögzítve</span>
                       ) : "Kattints a térképre a pontos hely megadásához!"}
                    </div>
                  </div>

                  <button className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[22px] font-black shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95">
                    <Send size={18} /> Beküldés ellenőrzésre
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="success" className="flex flex-col items-center justify-center h-full text-center py-20">
                 <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck size={48} />
                 </div>
                 <h2 className="text-2xl font-black mb-2">Köszönjük!</h2>
                 <p className="text-zinc-500 mb-10">A beküldött adatokat moderátorunk hamarosan jóváhagyja.</p>
                 <button onClick={() => setMode('view')} className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold">Rendben</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      <style jsx global>{`
        .leaflet-container { font-family: inherit; }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 24px;
          padding: 8px;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
        }
        .custom-popup .leaflet-popup-tip { display: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
        @media (prefers-color-scheme: dark) {
          .custom-popup .leaflet-popup-content-wrapper { background: rgba(24, 24, 27, 0.9); border: 1px solid rgba(255,255,255,0.1); }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
        }
      `}</style>
    </div>
  )
}