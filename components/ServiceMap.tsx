'use client'

import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { Search, MapPin, Phone, Wrench, Car, Zap, Droplets, Plus, Locate, X, ArrowLeft, Navigation, Send, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react'
import { createClient } from '@/supabase/client'
import Link from 'next/link'
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

// --- Térkép Logika ---
function MapController({ onMapClick, isAdding }: { onMapClick: (lat: number, lng: number) => void, isAdding: boolean }) {
    useMapEvents({ 
        click(e) { 
            if (isAdding) onMapClick(e.latlng.lat, e.latlng.lng); 
        }, 
    });
    return null;
}

function MapFlyTo({ position }: { position: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (position) map.flyTo(position, 16, { duration: 1.2, easeLinearity: 0.25 });
    }, [position, map]);
    return null;
}

// === FŐ KOMPONENS ===
export default function ServiceMap({ initialPartners, user }: { initialPartners: any[], user: any }) {
    const [partners] = useState(initialPartners)
    const [filter, setFilter] = useState('all')
    
    // UI State
    const [mode, setMode] = useState<'view' | 'add' | 'success'>('view')
    const [isLoading, setIsLoading] = useState(false)
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
    
    // Add Service State
    const [newServiceCoords, setNewServiceCoords] = useState<{ lat: number, lng: number } | null>(null)
    const [addressInput, setAddressInput] = useState('')
    const [foundAddress, setFoundAddress] = useState('')
    
    const supabase = createClient()
    const filteredPartners = filter === 'all' ? partners : partners.filter(p => p.category === filter)

    // Pozíció lekérés
    const handleLocateMe = () => {
        setIsLoading(true)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setUserLocation([pos.coords.latitude, pos.coords.longitude])
                setIsLoading(false)
            }, () => { 
                alert("Nem sikerült meghatározni a pozíciót.")
                setIsLoading(false) 
            })
        }
    }

    // Címkeresés
    const handleAddressSearch = async () => {
        if (!addressInput.trim()) return;
        setIsLoading(true)
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}`)
            const data = await res.json()
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0]
                const coords = { lat: parseFloat(lat), lng: parseFloat(lon) }
                setNewServiceCoords(coords)
                setFoundAddress(display_name) // Ezt mentjük el címnek
            } else {
                alert('Nem található ilyen cím.')
            }
        } catch (e) {
            alert('Hiba a kereséskor.')
        }
        setIsLoading(false)
    }

    // Térképre kattintás hozzáadás módban
    const handleMapClick = async (lat: number, lng: number) => {
        setNewServiceCoords({ lat, lng })
        // Reverse geocoding (koordinátából cím) - Opcionális extra
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            const data = await res.json()
            if (data && data.display_name) {
                setFoundAddress(data.display_name)
                setAddressInput(data.display_name.split(',')[0]) // Csak a város/utca jelenjen meg a keresőben
            }
        } catch (e) {
            console.error("Reverse geo error", e)
        }
    }

    // Beküldés
    const submitServiceRequest = async (formData: FormData) => {
        if (!newServiceCoords || !user) return;
        setIsLoading(true)
        
        const data = {
            user_id: user.id,
            name: formData.get('name'),
            category: formData.get('category'),
            phone: formData.get('phone'),
            description: formData.get('description'),
            address: formData.get('address') || foundAddress, // Ha a user átírta, azt használjuk
            latitude: newServiceCoords.lat,
            longitude: newServiceCoords.lng,
            status: 'pending'
        }

        const { error } = await supabase.from('service_requests').insert(data)
        
        setIsLoading(false)
        if (!error) {
            setMode('success')
        } else {
            console.error(error)
            alert("Hiba történt a mentéskor.")
        }
    }

    return (
        <div className="relative w-full h-screen flex flex-col md:flex-row overflow-hidden font-sans bg-zinc-50 dark:bg-zinc-950">
            {/* --- BAL OLDALI SIDEBAR --- */}
            <div className="absolute md:top-4 md:left-4 bottom-0 w-full md:w-[420px] z-[1000] pointer-events-none flex flex-col justify-end md:justify-start">
                <motion.div 
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="pointer-events-auto bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t md:border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-t-[32px] md:rounded-[32px] flex flex-col overflow-hidden h-[60vh] md:h-[calc(100vh-2rem)] transition-all duration-500 ease-in-out"
                >
                    <AnimatePresence mode="wait">
                        {/* 1. NÉZET: LISTA ÉS SZŰRÉS */}
                        {mode === 'view' && (
                            <motion.div 
                                key="view"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col h-full"
                            >
                                {/* Header */}
                                <div className="p-6 pb-2 border-b border-zinc-100 dark:border-zinc-900">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">Szerviz Térkép</h1>
                                            <p className="text-sm text-zinc-500 font-medium mt-1">
                                                {filteredPartners.length} ellenőrzött partner a közelben
                                            </p>
                                        </div>
                                        <button onClick={handleLocateMe} className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                            <Locate className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                    {/* Vissza gomb (csak ha nem a fő nézetben vagyunk) */}
                                    {mode !== 'view' && (
                                        <button onClick={() => setMode('view')} className="mb-2 px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-full text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">
                                            <ArrowLeft className="inline w-4 h-4 mr-1" /> Vissza
                                        </button>
                                    )}
                                    {/* Kategória választó */}
                                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x category-drag-scroll">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setFilter(cat.id)}
                                                className={cn(
                                                    "snap-start flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all border",
                                                    filter === cat.id 
                                                        ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-transparent" 
                                                        : "bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                                )}
                                            >
                                                <cat.icon className="w-3.5 h-3.5" /> {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Lista */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {filteredPartners.length === 0 ? (
                                        <div className="text-center py-10 opacity-50">
                                            <Search className="w-12 h-12 mx-auto mb-2"/>
                                            <p>Nincs találat a kategóriában.</p>
                                        </div>
                                    ) : (
                                        filteredPartners.map((partner, i) => (
                                            <div key={partner.id} className="group flex gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${CATEGORIES.find(c=>c.id === partner.category)?.color} text-white shadow-md`}>
                                                    {(() => { const Icon = CATEGORIES.find(c=>c.id === partner.category)?.icon || Search; return <Icon className="w-6 h-6"/> })()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-zinc-900 dark:text-white truncate">{partner.name}</h3>
                                                    <p className="text-xs text-zinc-500 truncate mb-2">{partner.address}</p>
                                                    <div className="flex gap-2">
                                                        <a href={`tel:${partner.phone}`} className="p-1.5 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-blue-500 transition-colors">
                                                            <Phone className="w-3.5 h-3.5" />
                                                        </a>
                                                        <button onClick={() => window.open(`http://maps.google.com/?q=${partner.latitude},${partner.longitude}`)} className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold flex items-center gap-1.5 ml-auto">
                                                            <Navigation className="w-3 h-3" /> Útvonal
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Add Button Footer */}
                                <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 bg-white/50 dark:bg-black/50 backdrop-blur-md">
                                    <button 
                                        onClick={() => { setMode('add'); setNewServiceCoords(null); setAddressInput(''); setFoundAddress(''); }}
                                        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" /> Új Szerviz Felvétele
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* 2. NÉZET: HOZZÁADÁS */}
                        {mode === 'add' && (
                            <motion.div 
                                key="add"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950"
                            >
                                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                                    <button onClick={() => setMode('view')} className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 hover:text-zinc-800 dark:hover:text-zinc-300">
                                        <ArrowLeft className="w-3 h-3" /> Mégse
                                    </button>
                                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Szerviz Hozzáadása</h2>
                                    <p className="text-sm text-zinc-500">Keress rá a címre, vagy <span className="text-emerald-500 font-bold">bökj a térképre</span> a pozíció megadásához.</p>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6">
                                    {/* Kereső Sáv */}
                                    <div className="relative flex gap-2 mb-8">
                                        <div className="relative flex-1">
                                            <input 
                                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                                                placeholder="Pl. Budapest, Váci út 10..."
                                                value={addressInput}
                                                onChange={(e) => setAddressInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                                            />
                                            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                                        </div>
                                        <button 
                                            onClick={handleAddressSearch}
                                            disabled={isLoading}
                                            className="px-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm disabled:opacity-50"
                                        >
                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Keresés'}
                                        </button>
                                    </div>

                                    {/* Form - Csak akkor aktív ha van koordináta */}
                                    <AnimatePresence>
                                        {newServiceCoords ? (
                                            <motion.form 
                                                initial={{ opacity: 0, y: 20 }} 
                                                animate={{ opacity: 1, y: 0 }}
                                                action={submitServiceRequest}
                                                className="space-y-4"
                                            >
                                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                                    Helyszín sikeresen kijelölve!
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Szerviz neve</label>
                                                    <input name="name" required className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-emerald-500 outline-none transition-colors" placeholder="Hivatalos megnevezés" />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Kategória</label>
                                                        <select name="category" className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-emerald-500 outline-none appearance-none">
                                                            {CATEGORIES.slice(1).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Telefon</label>
                                                        <input name="phone" className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-emerald-500 outline-none" placeholder="+36..." />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Pontos cím</label>
                                                    <input name="address" required defaultValue={foundAddress} className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-emerald-500 outline-none text-zinc-600 dark:text-zinc-400" />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Leírás</label>
                                                    <textarea name="description" rows={3} className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-emerald-500 outline-none resize-none" placeholder="Milyen szolgáltatásokat nyújtanak?" />
                                                </div>

                                                <button type="submit" disabled={isLoading} className="w-full py-4 mt-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-base hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Send className="w-5 h-5" /> Beküldés</>}
                                                </button>
                                            </motion.form>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-40 text-zinc-400 text-center px-6 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
                                                <MapPin className="w-8 h-8 mb-2 opacity-50" />
                                                <p className="text-sm">Használd a keresőt fönn,<br/>vagy kattints a térképre a helyszínhez.</p>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}

                        {/* 3. NÉZET: SIKERES BEKÜLDÉS */}
                        {mode === 'success' && (
                            <motion.div 
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col h-full items-center justify-center p-8 text-center bg-white dark:bg-black"
                            >
                                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                                    <ShieldCheck className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">Köszönjük!</h2>
                                <p className="text-zinc-500 mb-8 leading-relaxed">
                                    A szerviz ajánlását sikeresen rögzítettük.
                                    <br/>
                                    <strong className="text-zinc-900 dark:text-zinc-200">Minden beküldést manuálisan ellenőrzünk</strong>, hogy garantáljuk az adatbázis minőségét. Jóváhagyás után azonnal megjelenik a térképen.
                                </p>
                                <button onClick={() => setMode('view')} className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-xl hover:scale-105 transition-transform">
                                    Vissza a térképhez
                                </button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </motion.div>
            </div>

            {/* --- TÉRKÉP --- */}
            <div className="flex-1 relative z-0">
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
                    <MapFlyTo position={newServiceCoords ? [newServiceCoords.lat, newServiceCoords.lng] : (userLocation || null)} />

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
                                    <a href={`https://maps.google.com/?q=${partner.latitude},${partner.longitude}`} target="_blank" className="block text-center w-full py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-zinc-800">
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
                <div className={`md:hidden absolute inset-0 bg-black/20 z-[999] pointer-events-none transition-opacity ${mode !== 'view' ? 'opacity-100' : 'opacity-0'}`} />
            </div>

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
            `}</style>
        </div>
    )
}