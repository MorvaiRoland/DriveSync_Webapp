'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { Search, MapPin, Phone, Wrench, Car, Zap, Droplets, Plus, Locate, X, ArrowLeft, Navigation, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/supabase/client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// --- Segéd: Class merger ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- KATEGÓRIÁK (Monokróm edition) ---
// Minden szín fekete/fehér/szürke gradiensre cserélve
const CATEGORIES = [
    { id: 'all', label: 'Összes', icon: Search, color: 'from-neutral-800 to-black', ring: 'ring-neutral-500' },
    { id: 'mechanic', label: 'Szerelő', icon: Wrench, color: 'from-neutral-700 to-neutral-900', ring: 'ring-neutral-700' },
    { id: 'tire', label: 'Gumizás', icon: Car, color: 'from-neutral-600 to-neutral-800', ring: 'ring-neutral-600' },
    { id: 'wash', label: 'Autómosó', icon: Droplets, color: 'from-neutral-500 to-neutral-700', ring: 'ring-neutral-500' },
    { id: 'electric', label: 'Villamosság', icon: Zap, color: 'from-neutral-400 to-neutral-600', ring: 'ring-neutral-400' },
]

// --- Marker Generátor (Fekete-Fehér stílus) ---
const createCustomIcon = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
    const IconComponent = category.icon;
    
    const iconHtml = renderToStaticMarkup(
        <div className="relative group">
            {/* Fehér keret, Fekete belső - klasszikus kontraszt */}
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-white dark:border-neutral-900 shadow-2xl bg-gradient-to-br ${category.color} transform transition-transform group-hover:scale-110`}>
                <IconComponent className="w-5 h-5 text-white" />
            </div>
            {/* Tüske alul */}
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-3 h-3 bg-gradient-to-br ${category.color} rotate-45 border-r border-b border-white dark:border-neutral-900 -z-10`}></div>
            {/* Árnyék */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-black/40 blur-[2px] rounded-full"></div>
        </div>
    );
    return L.divIcon({
        html: iconHtml,
        className: 'custom-marker-icon',
        iconSize: [40, 50],
        iconAnchor: [20, 50],
        popupAnchor: [0, -50]
    });
}

// --- Toast Értesítés (Minimalista) ---
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
    <motion.div 
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        className={cn(
            "fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl backdrop-blur-xl border border-white/10",
            // Fekete háttér, fehér szöveg (Inverted look)
            "bg-neutral-900/90 text-white"
        )}
    >
        {type === 'success' ? <CheckCircle className="w-5 h-5 text-neutral-400" /> : <AlertCircle className="w-5 h-5 text-white" />}
        <span className="font-medium text-sm tracking-wide">{message}</span>
        <button onClick={onClose} className="ml-4 hover:bg-white/20 p-1 rounded-full transition-colors"><X className="w-4 h-4" /></button>
    </motion.div>
)

// --- Térkép vezérlő ---
function MapController({ onMapClick, userLocation }: { onMapClick: (lat: number, lng: number) => void, userLocation: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (userLocation) map.flyTo(userLocation, 14, { duration: 1.5, easeLinearity: 0.25 });
    }, [userLocation, map]);
    useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng); }, });
    return null;
}

export default function ServiceMap({ initialPartners, user }: { initialPartners: any[], user: any }) {
    const [partners, setPartners] = useState(initialPartners)
    const [filter, setFilter] = useState('all')
    const [isAdding, setIsAdding] = useState(false)
    const [newServiceCoords, setNewServiceCoords] = useState<{ lat: number, lng: number } | null>(null)
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
    const [loadingLocation, setLoadingLocation] = useState(false)
    const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null)
    
    const supabase = createClient()
    const filteredPartners = filter === 'all' ? partners : partners.filter(p => p.category === filter)

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000)
            return () => clearTimeout(timer)
        }
    }, [toast])

    const handleLocateMe = () => {
        setLoadingLocation(true)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setUserLocation([pos.coords.latitude, pos.coords.longitude])
                setLoadingLocation(false)
            }, () => { 
                setToast({msg: "Nem sikerült meghatározni a pozíciót.", type: 'error'})
                setLoadingLocation(false) 
            })
        }
    }

    const handleMapClick = (lat: number, lng: number) => {
        if (isAdding) setNewServiceCoords({ lat, lng })
    }

    const submitServiceRequest = async (formData: FormData) => {
        if (!newServiceCoords || !user) return;
        
        const data = {
            user_id: user.id,
            name: formData.get('name'),
            category: formData.get('category'),
            phone: formData.get('phone'),
            description: formData.get('description'),
            address: formData.get('address'),
            latitude: newServiceCoords.lat,
            longitude: newServiceCoords.lng,
            status: 'pending'
        }

        const { error } = await supabase.from('service_requests').insert(data)
        
        if (!error) {
            setIsAdding(false)
            setNewServiceCoords(null)
            setToast({msg: "Sikeres beküldés! Ellenőrzés után megjelenik.", type: 'success'})
        } else {
            console.error(error)
            setToast({msg: "Hiba történt. Kérlek próbáld újra.", type: 'error'})
        }
    }

    return (
        <div className="relative w-full h-screen flex flex-col md:flex-row overflow-hidden font-sans bg-neutral-100 dark:bg-black">
            
            <AnimatePresence>
                {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>
            
            {/* --- MOBIL VISSZA GOMB --- */}
            <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} className="md:hidden absolute top-4 left-4 z-[1000]">
                <Link href="/" className="flex items-center justify-center w-10 h-10 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-full shadow-lg border border-neutral-200 dark:border-neutral-800">
                    <ArrowLeft className="w-5 h-5 text-black dark:text-white" />
                </Link>
            </motion.div>

            {/* --- SIDEBAR (Üveghatás + Fekete/Fehér) --- */}
            <div className="absolute md:top-6 md:left-6 bottom-0 w-full md:w-[400px] md:h-auto z-[1000] pointer-events-none flex flex-col justify-end md:justify-start">
                
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="pointer-events-auto bg-white/80 dark:bg-black/80 backdrop-blur-3xl border-t md:border border-white/40 dark:border-white/10 shadow-2xl rounded-t-[32px] md:rounded-[32px] flex flex-col overflow-hidden max-h-[75vh] md:max-h-[85vh]"
                >
                    
                    {/* Header */}
                    <div className="p-6 pb-4 border-b border-neutral-200/50 dark:border-white/5">
                        <div className="hidden md:flex mb-4 items-center gap-2">
                             <Link href="/" className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all text-xs font-bold text-neutral-600 dark:text-neutral-400">
                                <div className="bg-neutral-300 dark:bg-neutral-700 rounded-full p-1 group-hover:-translate-x-0.5 transition-transform"><ArrowLeft className="w-3 h-3" /></div>
                                Vissza a Dashboardra
                            </Link>
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-black text-black dark:text-white tracking-tighter">
                                    Szerviz Térkép
                                </h1>
                                <p className="text-sm text-neutral-500 font-medium mt-1 flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black dark:bg-white opacity-50"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-800 dark:bg-neutral-200"></span>
                                    </span>
                                    {filteredPartners.length} partner elérhető
                                </p>
                            </div>
                            {/* Locate Button: Fekete gomb */}
                            <button onClick={handleLocateMe} className="group p-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl shadow-xl hover:scale-110 transition-all active:scale-95">
                                <Locate className={`w-5 h-5 ${loadingLocation ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Filter Scroll */}
                    <div className="px-6 py-4">
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                            {CATEGORIES.map(cat => {
                                const isActive = filter === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setFilter(cat.id)}
                                        className={cn(
                                            "relative snap-start flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all z-10 border",
                                            isActive 
                                                ? "text-white border-transparent" 
                                                : "bg-transparent border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div 
                                                layoutId="activeFilter"
                                                className="absolute inset-0 rounded-xl bg-black dark:bg-neutral-800 -z-10 shadow-lg"
                                            />
                                        )}
                                        <cat.icon className="w-4 h-4" />
                                        <span>{cat.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Lista */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 min-h-[150px] relative">
                        <AnimatePresence mode='wait'>
                            {filteredPartners.length === 0 ? (
                                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center py-12">
                                    <Search className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                                    <p className="text-neutral-400 font-medium">Nincs találat.</p>
                                </motion.div>
                            ) : (
                                filteredPartners.map((partner, i) => (
                                    <motion.div 
                                        key={partner.id} 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group relative p-4 bg-white/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:bg-white dark:hover:bg-neutral-900 transition-all cursor-pointer shadow-sm hover:shadow-lg"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold text-black dark:text-white text-base">{partner.name}</h3>
                                                <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{partner.description || 'Nincs leírás'}</p>
                                            </div>
                                            {/* Kis ikon a lista elemen: Fekete */}
                                            <div className="p-2 rounded-xl bg-black dark:bg-white text-white dark:text-black">
                                                {(() => {
                                                    const CatIcon = CATEGORIES.find(c=>c.id === partner.category)?.icon || Search
                                                    return <CatIcon className="w-3.5 h-3.5" />
                                                })()}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 mt-3">
                                            <MapPin className="w-3.5 h-3.5" /> {partner.address}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Submit Button Area */}
                    <div className="p-4 border-t border-neutral-200/50 dark:border-white/5 bg-white/50 dark:bg-black/50 backdrop-blur-md">
                         <button 
                            onClick={() => { setIsAdding(!isAdding); setNewServiceCoords(null); }}
                            className={cn(
                                "w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg transform active:scale-95",
                                isAdding 
                                    ? "bg-white border-2 border-black text-black hover:bg-neutral-100" // Mégse gomb (Inverz)
                                    : "bg-black text-white dark:bg-white dark:text-black hover:shadow-xl hover:-translate-y-1" // Hozzáadás gomb (Fekete)
                            )}
                        >
                            {isAdding ? <><X className="w-5 h-5"/> Mégse</> : <><Plus className="w-5 h-5" /> Szerviz Ajánlása</>}
                        </button>
                        
                        <AnimatePresence>
                            {isAdding && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-3 text-center p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-black dark:text-white flex items-center justify-center gap-2 animate-pulse">
                                        <MapPin className="w-4 h-4" />
                                        Kattints a térképre a helyszín megjelöléséhez!
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            {/* --- TÉRKÉP (Szürkeárnyalatos csempékkel) --- */}
            <div className={`flex-1 relative z-0 transition-all duration-500 ${isAdding ? 'cursor-crosshair' : ''}`}>
                <MapContainer center={[47.4979, 19.0402]} zoom={13} scrollWheelZoom={true} zoomControl={false} style={{ height: "100%", width: "100%", outline: "none" }} className="bg-neutral-100 dark:bg-black">
                    {/* CartoDB Dark Matter (Sötét mód) vagy Positron (Világos mód) lenne a legjobb, itt a Positron-t használjuk alapnak a tiszta B&W hatáshoz */}
                    <TileLayer 
                        attribution='&copy; OSM & CartoDB'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // VAGY: dark_all ha sötét térkép kell
                    />
                    
                    <MapController onMapClick={handleMapClick} userLocation={userLocation} />
                    
                    {/* User Marker: Fekete/Szürke pulzálás */}
                    {userLocation && (
                        <Marker position={userLocation} icon={L.divIcon({ 
                            html: `
                                <div class="relative flex items-center justify-center w-6 h-6">
                                    <div class="absolute w-full h-full bg-black rounded-full animate-ping opacity-30"></div>
                                    <div class="relative w-4 h-4 bg-black rounded-full border-2 border-white shadow-lg"></div>
                                </div>
                            `, 
                            className: 'bg-transparent',
                            iconSize: [24, 24]
                        })} />
                    )}
                    
                    {filteredPartners.map((partner) => (
                        <Marker key={partner.id} position={[partner.latitude, partner.longitude]} icon={createCustomIcon(partner.category)}>
                            <Popup className="glass-popup" closeButton={false}>
                                <div className="p-2 min-w-[240px]">
                                    <div className="flex items-center gap-2 mb-3">
                                        {/* Kategória jelző a popupban: Fekete */}
                                        <div className="p-1.5 rounded-lg bg-black text-white">
                                            {(() => { const I = CATEGORIES.find(c=>c.id === partner.category)?.icon || Search; return <I className="w-3.5 h-3.5"/> })()}
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                            {CATEGORIES.find(c => c.id === partner.category)?.label}
                                        </span>
                                    </div>
                                    
                                    <h3 className="font-black text-lg text-black leading-tight mb-1">{partner.name}</h3>
                                    <p className="text-xs text-neutral-500 mb-3 leading-relaxed">{partner.description || "Nincs leírás megadva."}</p>
                                    
                                    <div className="flex gap-2">
                                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${partner.latitude},${partner.longitude}`} target="_blank" className="flex-1 flex items-center justify-center gap-2 text-xs font-bold text-white bg-black p-2.5 rounded-xl hover:bg-neutral-800 transition-all shadow-lg">
                                            <Navigation className="w-3 h-3"/> Útvonal
                                        </a>
                                        {partner.phone && (
                                            <a href={`tel:${partner.phone}`} className="flex items-center justify-center p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black transition-colors">
                                                <Phone className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* BEKÜLDÉS FORM POPUP */}
                    {newServiceCoords && (
                        <Marker position={[newServiceCoords.lat, newServiceCoords.lng]} icon={createCustomIcon('all')}>
                             <Popup minWidth={340} closeButton={false} className="glass-popup">
                                <motion.form 
                                    initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}}
                                    action={submitServiceRequest} 
                                    className="p-1 space-y-3"
                                >
                                    <div className="flex items-center justify-between border-b pb-2 mb-2 border-neutral-200">
                                        <div>
                                            <h3 className="font-bold text-black">Új Szerviz</h3>
                                            <p className="text-[10px] text-neutral-400 font-medium">Moderációra vár.</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <input name="name" placeholder="Szerviz neve" required className="w-full bg-neutral-50 border border-neutral-200 focus:border-black p-2.5 rounded-xl text-sm outline-none transition-all" />
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="relative">
                                                <select name="category" className="w-full appearance-none bg-neutral-50 border border-neutral-200 p-2.5 rounded-xl text-sm outline-none">
                                                    {CATEGORIES.slice(1).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                                </select>
                                                <div className="absolute right-2 top-3 pointer-events-none text-neutral-400"><ArrowLeft className="w-3 h-3 -rotate-90"/></div>
                                            </div>
                                            <input name="phone" placeholder="Tel. szám" className="w-full bg-neutral-50 border border-neutral-200 p-2.5 rounded-xl text-sm outline-none" />
                                        </div>

                                        <input name="address" placeholder="Cím" required className="w-full bg-neutral-50 border border-neutral-200 p-2.5 rounded-xl text-sm outline-none" />
                                        <textarea name="description" placeholder="Leírás..." rows={2} className="w-full bg-neutral-50 border border-neutral-200 p-2.5 rounded-xl text-sm resize-none outline-none"></textarea>
                                    </div>
                                    
                                    <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-lg">
                                        <Send className="w-3.5 h-3.5" /> Beküldés
                                    </button>
                                </motion.form>
                             </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
            
            <style jsx global>{`
                .custom-marker-icon { background: transparent; border: none; }
                .leaflet-popup-content-wrapper { 
                    background: rgba(255, 255, 255, 0.95); 
                    backdrop-filter: blur(20px); 
                    border-radius: 24px; 
                    padding: 0; 
                    box-shadow: 0 20px 50px -12px rgba(0,0,0,0.2);
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .leaflet-popup-content { margin: 16px; width: auto !important; }
                .leaflet-popup-tip { background: rgba(255, 255, 255, 0.95); }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    )
}