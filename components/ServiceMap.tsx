'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { Search, MapPin, Wrench, Car, Zap, Droplets, Plus, ArrowLeft, Send, ShieldCheck, Loader2, X, ChevronUp, ChevronDown } from 'lucide-react'
import { createClient } from '@/supabase/client'
import { motion, AnimatePresence, useDragControls, useMotionValue, useTransform } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// --- Segéd: Class merger ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- KATEGÓRIÁK ---
const CATEGORIES = [
  { id: 'all', label: 'Összes', icon: Search, color: 'from-zinc-800 to-black', text: 'text-zinc-500' },
  { id: 'mechanic', label: 'Szerelő', icon: Wrench, color: 'from-slate-700 to-slate-900', text: 'text-slate-500' },
  { id: 'tire', label: 'Gumizás', icon: Car, color: 'from-stone-600 to-stone-800', text: 'text-stone-500' },
  { id: 'wash', label: 'Autómosó', icon: Droplets, color: 'from-blue-600 to-blue-900', text: 'text-blue-500' },
  { id: 'electric', label: 'Villamosság', icon: Zap, color: 'from-amber-500 to-amber-700', text: 'text-amber-500' },
]

// --- Marker Generátor ---
const createCustomIcon = (categoryId: string, isNew = false) => {
  if (typeof window === 'undefined') return L.divIcon({});

  if (isNew) {
    const iconHtml = renderToStaticMarkup(
      <div className="relative flex items-center justify-center">
         <div className="absolute w-full h-full bg-emerald-500/30 rounded-full animate-ping"></div>
         <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 text-white shadow-2xl border-4 border-white dark:border-zinc-900">
            <MapPin className="w-6 h-6" />
         </div>
         <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-500 rotate-45 border-r border-b border-white dark:border-zinc-900"></div>
      </div>
    )
    return L.divIcon({ html: iconHtml, className: 'custom-marker-new', iconSize: [48, 58], iconAnchor: [24, 58] })
  }

  const category = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  const IconComponent = category.icon;
  
  const iconHtml = renderToStaticMarkup(
    <div className="relative group transition-transform hover:scale-110 hover:z-50 cursor-pointer">
      <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-white dark:border-zinc-950 shadow-lg bg-gradient-to-br ${category.color}`}>
        <IconComponent className="w-5 h-5 text-white" />
      </div>
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-3 h-3 bg-gradient-to-br ${category.color} rotate-45 border-r border-b border-white dark:border-zinc-950 -z-10`}></div>
    </div>
  );
  return L.divIcon({ html: iconHtml, className: 'custom-marker-icon', iconSize: [40, 50], iconAnchor: [20, 50], popupAnchor: [0, -50] });
}

// --- Térkép Komponensek ---
function MapController({ onMapClick, isAdding }: { onMapClick: (lat: number, lng: number) => void, isAdding: boolean }) {
  useMapEvents({ 
    click(e) { 
      if (isAdding) onMapClick(e.latlng.lat, e.latlng.lng); 
    }, 
  });
  return null;
}

function MapFlyTo({ position }: { position: { lat: number, lng: number } | [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      const coords: [number, number] = !Array.isArray(position) ? [position.lat, position.lng] : position;
      map.flyTo(coords, 15, { duration: 1.5 });
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
  const [isLoading, setIsLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [newServiceCoords, setNewServiceCoords] = useState<{ lat: number, lng: number } | null>(null)
  const [addressInput, setAddressInput] = useState('')
  const [foundAddress, setFoundAddress] = useState('')
  const [form, setForm] = useState({ name: '', category: 'mechanic', phone: '', description: '', address: '' })
  const [formError, setFormError] = useState('')
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(true) // Mobil panel állapota
  const supabase = createClient()

  // --- FILTERED PARTNERS ---
  const filteredPartners = useMemo(() => {
    let list = partners
    if (filter !== 'all') list = list.filter(p => p.category === filter)
    if (search.trim()) {
      const s = search.trim().toLowerCase()
      list = list.filter(p =>
        (p.name && p.name.toLowerCase().includes(s)) ||
        (p.address && p.address.toLowerCase().includes(s)) ||
        (p.category && p.category.toLowerCase().includes(s))
      )
    }
    return list
  }, [partners, filter, search])

  // --- LOCATION ---
  const handleLocateMe = () => {
    setIsLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords)
        setIsLoading(false)
        if (mode === 'add') {
            handleMapClick(coords[0], coords[1]);
        }
      }, () => {
        alert('Nem sikerült meghatározni a pozíciót.')
        setIsLoading(false)
      })
    }
  }

  // --- ADDRESS SEARCH ---
  const handleAddressSearch = async () => {
    if (!addressInput.trim()) return
    setIsLoading(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}`)
      const data = await res.json()
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0]
        const coords = { lat: parseFloat(lat), lng: parseFloat(lon) }
        setNewServiceCoords(coords)
        setFoundAddress(display_name)
      } else {
        alert('Nem található ilyen cím.')
      }
    } catch (e) {
      alert('Hiba a kereséskor.')
    }
    setIsLoading(false)
  }

  // --- MAP CLICK (ADD MODE) ---
  const handleMapClick = async (lat: number, lng: number) => {
    setNewServiceCoords({ lat, lng })
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      const data = await res.json()
      if (data && data.display_name) {
        setFoundAddress(data.display_name)
        setAddressInput(data.display_name.split(',')[0])
        setForm(f => ({ ...f, address: data.display_name }))
      }
    } catch (e) {
      // ignore
    }
  }

  // --- SUBMIT FORM ---
  const submitServiceRequest = async (e: any) => {
    e.preventDefault()
    setFormError('')
    if (!form.name || !form.category || !form.phone || !newServiceCoords) {
      setFormError('Minden *-gal jelölt mező kötelező és a térképen is jelöld a helyet!')
      return
    }
    setIsLoading(true)
    const data = {
      user_id: user?.id,
      name: form.name,
      category: form.category,
      phone: form.phone,
      description: form.description,
      address: form.address || foundAddress,
      latitude: newServiceCoords.lat,
      longitude: newServiceCoords.lng,
      status: 'pending'
    }
    const { error } = await supabase.from('service_requests').insert(data)
    setIsLoading(false)
    if (!error) {
      setMode('success')
      setForm({ name: '', category: 'mechanic', phone: '', description: '', address: '' })
      setNewServiceCoords(null)
      setAddressInput('')
      setFoundAddress('')
    } else {
      setFormError('Hiba történt a mentéskor. Kérjük próbáld újra.')
    }
  }

  // --- UI ---
  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-zinc-100 dark:bg-zinc-950">
      
      {/* 1. TÉRKÉP (TELJES HÁTTÉR) */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[47.4979, 19.0402]}
          zoom={13}
          zoomControl={false}
          className="w-full h-full outline-none"
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapController onMapClick={handleMapClick} isAdding={mode === 'add'} />
          <MapFlyTo position={newServiceCoords ? newServiceCoords : (userLocation || null)} />

          {userLocation && (
             <Marker position={userLocation} icon={L.divIcon({ html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg pulse-ring"></div>`, className: 'bg-transparent' })} />
          )}

          {mode === 'view' && filteredPartners.map((partner) => (
            <Marker key={partner.id} position={[partner.latitude, partner.longitude]} icon={createCustomIcon(partner.category)}>
              <Popup className="glass-popup" closeButton={false} minWidth={280}>
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 ${CATEGORIES.find(c=>c.id === partner.category)?.text}`}>
                      {CATEGORIES.find(c => c.id === partner.category)?.label}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-1">{partner.name}</h3>
                  <p className="text-xs text-zinc-500 mb-3">{partner.address}</p>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${partner.latitude},${partner.longitude}`} target="_blank" rel="noopener noreferrer" className="block text-center w-full py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors">
                    Útvonaltervezés
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}

          {mode === 'add' && newServiceCoords && (
            <Marker position={[newServiceCoords.lat, newServiceCoords.lng]} icon={createCustomIcon('all', true)} />
          )}
        </MapContainer>
      </div>

      {/* 2. LEBEGŐ GOMBOK (VISSZA, HELYZET) */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <button onClick={() => window.history.back()} className="p-3 bg-white/90 dark:bg-zinc-900/90 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:scale-105 transition-transform backdrop-blur-md">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      
      <div className="absolute top-4 right-4 z-20">
         <button onClick={handleLocateMe} className="p-3 bg-white/90 dark:bg-zinc-900/90 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-800 text-blue-500 hover:scale-105 transition-transform backdrop-blur-md">
            <MapPin className="w-5 h-5" />
         </button>
      </div>

      {/* 3. TARTALOM PANEL (DRAWER / SIDEBAR) */}
      <motion.div 
        initial={false}
        animate={isMobilePanelOpen ? "open" : "closed"}
        variants={{
            open: { y: "0%" },
            closed: { y: "calc(100% - 140px)" } // Mobilon ennyi lógjon be
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
            // Alap (Mobil): Bottom sheet
            "absolute bottom-0 left-0 right-0 z-30 bg-white dark:bg-zinc-900 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex flex-col h-[85dvh] touch-none",
            // Desktop: Floating sidebar
            "md:top-4 md:left-4 md:bottom-4 md:w-[400px] md:h-auto md:right-auto md:rounded-[24px] md:shadow-2xl md:translate-y-0 md:!transform-none"
        )}
      >
         {/* Mobil Fogantyú (Drag Handle) */}
         <div 
            className="md:hidden w-full p-4 flex justify-center items-center cursor-grab active:cursor-grabbing"
            onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
         >
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
         </div>

         {/* Panel Tartalom (Scrollable) */}
         <div className="flex-1 overflow-y-auto px-4 pb-8 md:p-6 custom-scrollbar">
            
            {/* VÁLTÓGOMB: View / Add mód */}
            <AnimatePresence mode="wait">
                {mode === 'view' ? (
                    <motion.div key="view-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        
                        {/* Kereső */}
                        <div className="relative mb-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                            <input 
                                type="text" 
                                placeholder="Hová mennél? / Mit keresel?" 
                                className="w-full pl-12 pr-4 py-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all shadow-inner"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Kategóriák */}
                        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFilter(cat.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 min-w-[70px] snap-start transition-opacity",
                                        filter === cat.id ? "opacity-100" : "opacity-60 hover:opacity-80"
                                    )}
                                >
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-md transition-transform active:scale-95",
                                        cat.color,
                                        filter === cat.id ? "ring-2 ring-offset-2 ring-zinc-900 dark:ring-white" : ""
                                    )}>
                                        <cat.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">{cat.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Találatok Listája */}
                        <div className="space-y-3 mt-2">
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Közelben</div>
                            {filteredPartners.length === 0 ? (
                                <div className="text-center py-8 text-zinc-400 text-sm">Nincs találat a környéken.</div>
                            ) : (
                                filteredPartners.map(partner => (
                                    <div 
                                        key={partner.id} 
                                        className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-[0.98]"
                                        onClick={() => {
                                            setNewServiceCoords({ lat: partner.latitude, lng: partner.longitude });
                                            // Mobilon lehúzzuk a panelt, hogy látszódjon a térkép
                                            if (window.innerWidth < 768) setIsMobilePanelOpen(false);
                                        }}
                                    >
                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br shrink-0", CATEGORIES.find(c=>c.id===partner.category)?.color || 'from-gray-500 to-gray-700')}>
                                            {(() => {
                                                const Icon = CATEGORIES.find(c=>c.id===partner.category)?.icon || Wrench;
                                                return <Icon className="w-5 h-5 text-white" />
                                            })()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-zinc-900 dark:text-white truncate">{partner.name}</h3>
                                            <p className="text-xs text-zinc-500 truncate">{partner.address}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                                            <ArrowLeft className="w-4 h-4 rotate-180 text-zinc-400" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Új Hozzáadása Gomb (Sticky alul a panelben) */}
                        <div className="sticky bottom-0 pt-4 bg-gradient-to-t from-white via-white to-transparent dark:from-zinc-900 dark:via-zinc-900 pb-2">
                            <button 
                                onClick={() => setMode('add')} 
                                className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                            >
                                <Plus className="w-5 h-5" /> Új Szerviz Ajánlása
                            </button>
                        </div>

                    </motion.div>
                ) : mode === 'add' ? (
                    <motion.form key="add-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={submitServiceRequest} className="flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-6">
                            <button type="button" onClick={() => setMode('view')} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                <ArrowLeft className="w-6 h-6 text-zinc-900 dark:text-white" />
                            </button>
                            <h2 className="text-xl font-black text-zinc-900 dark:text-white">Új Hely</h2>
                        </div>

                        <div className="space-y-6 flex-1">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Név</label>
                                <input type="text" required className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="Pl. Kovács Autószerviz" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Kategória</label>
                                    <select className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl font-medium outline-none appearance-none" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                        {CATEGORIES.filter(c => c.id !== 'all').map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Telefon</label>
                                    <input type="tel" required className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="+36..." value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Cím / Helyszín</label>
                                <div className="flex gap-2">
                                    <input type="text" required className="flex-1 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="Keress vagy bökj a térképre..." value={addressInput} onChange={e => { setAddressInput(e.target.value); setForm(f => ({ ...f, address: e.target.value })) }} />
                                    <button type="button" onClick={handleAddressSearch} className="px-4 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 rounded-xl transition-colors"><Search className="w-5 h-5" /></button>
                                </div>
                                {newServiceCoords && (
                                    <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium mt-2 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg">
                                        <CheckCircle2 className="w-4 h-4" /> Pozíció rögzítve a térképen
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Leírás (Opcionális)</label>
                                <textarea rows={3} className="w-full p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none" placeholder="Szolgáltatások, nyitvatartás..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                            </div>
                        </div>

                        {formError && <p className="text-red-500 text-sm font-bold mt-2 text-center">{formError}</p>}

                        <button type="submit" disabled={isLoading} className="w-full py-4 mt-6 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} Beküldés
                        </button>
                    </motion.form>
                ) : (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">Siker!</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-[250px]">
                            A bejelentést rögzítettük. Ellenőrzés után megjelenik a térképen.
                        </p>
                        <button onClick={() => setMode('view')} className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-xl">
                            Vissza a kezdőlapra
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
         </div>
      </motion.div>

      {/* GLOBÁLIS STÍLUSOK (Leaflet popup, scrollbar) */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper { 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          box-shadow: 0 20px 40px -5px rgba(0,0,0,0.2);
          padding: 0;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .leaflet-popup-content { margin: 0 !important; width: 100% !important; }
        .leaflet-popup-tip { background: rgba(255, 255, 255, 0.95); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 4px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
        .pulse-ring {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
            animation: pulse-blue 2s infinite;
        }
        @keyframes pulse-blue {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `}</style>
    </div>
  )
}

function CheckCircle2({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
}