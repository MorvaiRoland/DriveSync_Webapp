'use client'

import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { Search, MapPin, Wrench, Car, Zap, Droplets, Plus, ArrowLeft, Send, ShieldCheck, Loader2 } from 'lucide-react'
import { createClient } from '@/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
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
  // Ellenőrizzük, hogy a böngészőben vagyunk-e (SSR fix)
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
    <div className="relative group transition-transform hover:scale-110 hover:z-50">
      <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-white dark:border-zinc-950 shadow-lg bg-gradient-to-br ${category.color}`}>
        <IconComponent className="w-5 h-5 text-white" />
      </div>
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-3 h-3 bg-gradient-to-br ${category.color} rotate-45 border-r border-b border-white dark:border-zinc-950 -z-10`}></div>
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-1 bg-black/30 blur-[2px] rounded-full"></div>
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
      // Ha objektum (lat, lng), akkor átalakítjuk tömbbé, egyébként marad tömb
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
  const [fullscreen, setFullscreen] = useState(false)
  const [newServiceCoords, setNewServiceCoords] = useState<{ lat: number, lng: number } | null>(null)
  const [addressInput, setAddressInput] = useState('')
  const [foundAddress, setFoundAddress] = useState('')
  const [form, setForm] = useState({ name: '', category: 'mechanic', phone: '', description: '', address: '' })
  const [formError, setFormError] = useState('')
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
        // Ha hozzáadás módban vagyunk, akkor a saját pozíciónkat is beállítjuk új helynek
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
    
    // Alapvető validáció
    if (!form.name || !form.category || !form.phone || !newServiceCoords) {
      setFormError('Minden *-gal jelölt mező kötelező és a térképen is jelöld a helyet!')
      return
    }

    setIsLoading(true)
    const data = {
      user_id: user?.id, // Opcionális, ha a user nincs bejelentkezve
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
      // Reset form
      setForm({ name: '', category: 'mechanic', phone: '', description: '', address: '' })
      setNewServiceCoords(null)
      setAddressInput('')
      setFoundAddress('')
    } else {
      setFormError('Hiba történt a mentéskor. Kérjük próbáld újra.')
      console.error(error)
    }
  }

  // --- UI ---
  return (
    <div className={clsx(
      'w-full h-screen flex flex-col md:flex-row bg-gradient-to-br from-zinc-50 to-zinc-200 dark:from-zinc-950 dark:to-zinc-900 font-sans overflow-hidden relative',
      fullscreen && 'fixed inset-0 z-[3000] h-screen w-screen')
    }>
      {/* Vissza gomb minden platformon */}
      <div className="fixed top-4 left-4 z-[2000]">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold hover:bg-white dark:hover:bg-zinc-800 transition-all backdrop-blur-xl">
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Vissza</span>
        </button>
      </div>

      {/* Oldalsáv: kereső, szűrő, lista, űrlap, info */}
      <aside className={clsx(
        'relative z-10 w-full md:w-[420px] max-w-full md:max-w-[420px] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t md:border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-t-[32px] md:rounded-[32px] flex flex-col h-[60vh] md:h-[calc(100vh-2rem)] transition-all duration-500 ease-in-out mx-auto md:mx-0 pointer-events-auto mt-auto md:mt-4 md:ml-4 mb-0 md:mb-4',
        fullscreen && 'hidden md:block')
      }>
        {/* Info banner */}
        <div className="p-4 bg-gradient-to-r from-emerald-100/80 to-emerald-50/80 dark:from-emerald-900/40 dark:to-emerald-800/40 border-b border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-sm rounded-t-[32px] md:rounded-t-[32px]">
          <b>Szerviz bejelentés:</b> Add meg a szerviz adatait, helyét, és mi ellenőrizzük, majd jóváhagyás után megjelenik a térképen.
        </div>
        
        {/* Keresőmező */}
        {mode === 'view' && (
            <div className="flex items-center gap-2 p-4 border-b border-zinc-100 dark:border-zinc-800">
            <input
                type="text"
                placeholder="Keresés név, cím, kategória..."
                className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-4 py-2 text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            <button onClick={() => setSearch('')} className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all" title="Keresés törlése">
                <Search className="w-5 h-5" />
            </button>
            </div>
        )}

        {/* Kategória szűrő (csak view módban) */}
        {mode === 'view' && (
            <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-hide snap-x category-drag-scroll border-b border-zinc-100 dark:border-zinc-800">
            {CATEGORIES.map(cat => (
                <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all border-2 whitespace-nowrap snap-start',
                    filter === cat.id
                    ? 'bg-gradient-to-br ' + cat.color + ' text-white border-emerald-400 shadow-lg'
                    : 'bg-zinc-100 dark:bg-zinc-800 ' + cat.text + ' border-transparent hover:border-emerald-300')
                }
                >
                <cat.icon className="w-4 h-4" />
                {cat.label}
                </button>
            ))}
            </div>
        )}

        {/* Lista vagy űrlap vagy sikeres beküldés nézet (animációval) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* 1. NÉZET: LISTA */}
            {mode === 'view' && (
              <motion.div key="view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
                {filteredPartners.length === 0 ? (
                  <div className="text-center text-zinc-400 py-12 flex flex-col items-center">
                      <Search className="w-12 h-12 mb-4 opacity-20" />
                      Nincs találat a keresési feltételekkel.
                  </div>
                ) : (
                  filteredPartners.map((partner) => (
                    <div key={partner.id} className="bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-sm hover:shadow-md border border-zinc-100 dark:border-zinc-800 p-4 flex flex-col gap-2 transition-all cursor-pointer" onClick={() => setNewServiceCoords({ lat: partner.latitude, lng: partner.longitude })}>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 shadow-sm shrink-0">
                           {/* Ikon dinamikus betöltése a kategória alapján */}
                           {(() => {
                               const CatIcon = CATEGORIES.find(c => c.id === partner.category)?.icon || Wrench;
                               return <CatIcon className="w-5 h-5 text-white" />;
                           })()}
                        </span>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100 truncate">{partner.name}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase tracking-wider font-bold shrink-0 ml-2">
                                    {CATEGORIES.find(c => c.id === partner.category)?.label || partner.category}
                                </span>
                            </div>
                            <div className="text-zinc-500 dark:text-zinc-400 text-sm truncate">{partner.address}</div>
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs text-zinc-400 mt-1 pl-[52px]">
                        <span>{partner.phone}</span>
                        {partner.description && <span className="truncate max-w-[150px] opacity-70 border-l border-zinc-300 dark:border-zinc-700 pl-4">{partner.description}</span>}
                      </div>
                    </div>
                  ))
                )}
                
                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button onClick={() => setMode('add')} className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> Új Szerviz Felvétele
                  </button>
                </div>
              </motion.div>
            )}

            {/* 2. NÉZET: HOZZÁADÁS ŰRLAP */}
            {mode === 'add' && (
              <motion.form key="add" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-4" onSubmit={submitServiceRequest}>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Új Szerviz</h2>
                    <button type="button" onClick={() => setMode('view')} className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-800 dark:hover:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg">
                        <ArrowLeft className="w-3 h-3" /> Mégse
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Név*</label>
                            <input type="text" className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-emerald-500 outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400" placeholder="Szerviz neve" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Kategória*</label>
                            <select className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-emerald-500 outline-none text-zinc-900 dark:text-zinc-100" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required>
                                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Telefonszám*</label>
                        <input type="tel" className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-emerald-500 outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400" placeholder="+36 30 123 4567" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Helyszín*</label>
                        <div className="flex gap-2">
                            <input type="text" className="flex-1 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-emerald-500 outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400" placeholder="Cím keresése..." value={addressInput} onChange={e => { setAddressInput(e.target.value); setForm(f => ({ ...f, address: e.target.value })) }} required />
                            <button type="button" onClick={handleAddressSearch} className="px-4 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl font-bold transition-all">
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex justify-between items-center px-1 mt-1">
                            <span className="text-[10px] text-zinc-400">Vagy bökj a térképre!</span>
                            <button type="button" onClick={handleLocateMe} className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Saját pozícióm
                            </button>
                        </div>
                    </div>

                    {newServiceCoords && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            <div>
                                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Pozíció rögzítve</div>
                                <div className="text-[10px] text-emerald-600/70 font-mono">{newServiceCoords.lat.toFixed(5)}, {newServiceCoords.lng.toFixed(5)}</div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Leírás</label>
                        <textarea className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-emerald-500 outline-none resize-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Rövid leírás a szolgáltatásokról..." />
                    </div>

                    {formError && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 text-sm font-bold text-center">{formError}</div>}

                    <button type="submit" disabled={isLoading} className="w-full py-4 mt-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-base hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-xl disabled:opacity-70 disabled:cursor-not-allowed">
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Send className="w-5 h-5" /> Beküldés</>}
                    </button>
                </div>
              </motion.form>
            )}

            {/* 3. NÉZET: SIKERES BEKÜLDÉS */}
            {mode === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-full items-center justify-center p-8 text-center bg-white dark:bg-black rounded-2xl">
                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
                  <ShieldCheck className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">Siker!</h2>
                <p className="text-zinc-500 mb-8 leading-relaxed">
                  A szerviz bejelentését fogadtuk.<br/>
                  <span className="text-sm">Kollégáink ellenőrzik az adatokat, és hamarosan megjelenik a térképen.</span>
                </p>
                <button onClick={() => setMode('view')} className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-xl hover:scale-105 transition-transform">
                  Vissza a listához
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </aside>

      {/* Térkép szekció */}
      <main className={clsx('flex-1 relative z-0', fullscreen && 'w-screen h-screen fixed inset-0 z-[4000]')}>  
        <button onClick={() => setFullscreen(f => !f)} className="hidden md:flex absolute top-4 right-4 z-[2000] px-4 py-2 bg-white/90 dark:bg-zinc-900/90 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold hover:bg-white dark:hover:bg-zinc-800 transition-all backdrop-blur-xl items-center gap-2">
          {fullscreen ? <><X className="w-4 h-4"/> Kilépés</> : <><Plus className="w-4 h-4 rotate-45"/> Teljes nézet</>}
        </button>
        
        <MapContainer
          center={[47.4979, 19.0402]}
          zoom={13}
          zoomControl={false}
          className="w-full h-full bg-zinc-100 dark:bg-zinc-950 outline-none"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          <MapController onMapClick={handleMapClick} isAdding={mode === 'add'} />
          <MapFlyTo position={newServiceCoords ? newServiceCoords : (userLocation || null)} />

          {/* Saját pozíció */}
          {userLocation && (
             <Marker position={userLocation} icon={L.divIcon({ html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg pulse-ring"></div>`, className: 'bg-transparent' })} />
          )}

          {/* Meglévő partnerek */}
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

          {/* ÚJ szolgáltatás jelölő (csak Add módban) */}
          {mode === 'add' && newServiceCoords && (
            <Marker position={[newServiceCoords.lat, newServiceCoords.lng]} icon={createCustomIcon('all', true)} />
          )}
        </MapContainer>

        {/* Mobilon a sötét overlay, ha nyitva a sidebar */}
        <div className={clsx('md:hidden absolute inset-0 bg-black/20 z-[999] pointer-events-none transition-opacity', mode !== 'view' ? 'opacity-100' : 'opacity-0')} />
      </main>

      {/* Globális CSS overrideok */}
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
        .custom-marker-icon, .custom-marker-new { background: transparent; border: none; }
        
        /* Pulse animáció a saját pozícióhoz */
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
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
    )
}

function X({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    )
}