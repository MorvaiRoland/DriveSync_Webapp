'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { Search, MapPin, Phone, Wrench, Car, Zap, Droplets, Plus, Locate, X, ArrowLeft, Navigation, Send } from 'lucide-react'
import { createClient } from '@/supabase/client'
import Link from 'next/link'

// --- Kategóriák ---
const CATEGORIES = [
    { id: 'all', label: 'Összes', icon: Search, color: 'bg-slate-500', text: 'text-slate-500' },
    { id: 'mechanic', label: 'Szerelő', icon: Wrench, color: 'bg-orange-500', text: 'text-orange-500' },
    { id: 'tire', label: 'Gumizás', icon: Car, color: 'bg-blue-500', text: 'text-blue-500' },
    { id: 'wash', label: 'Autómosó', icon: Droplets, color: 'bg-cyan-400', text: 'text-cyan-400' },
    { id: 'electric', label: 'Villamosság', icon: Zap, color: 'bg-yellow-400', text: 'text-yellow-400' },
]

// --- Marker Generátor ---
const createCustomIcon = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
    const IconComponent = category.icon;
    const iconHtml = renderToStaticMarkup(
        <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-xl ${category.color} transform transition-transform`}>
            <IconComponent className="w-5 h-5 text-white" />
            <div className="absolute -bottom-1 w-2 h-2 bg-inherit rotate-45"></div>
        </div>
    );
    return L.divIcon({
        html: iconHtml,
        className: 'custom-marker-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 44],
        popupAnchor: [0, -45]
    });
}

// --- Térkép vezérlő ---
function MapController({ onMapClick, userLocation }: { onMapClick: (lat: number, lng: number) => void, userLocation: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (userLocation) map.flyTo(userLocation, 14, { duration: 2 });
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
    const supabase = createClient()

    const filteredPartners = filter === 'all' ? partners : partners.filter(p => p.category === filter)

    const handleLocateMe = () => {
        setLoadingLocation(true)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setUserLocation([pos.coords.latitude, pos.coords.longitude])
                setLoadingLocation(false)
            }, () => { alert("Nem sikerült meghatározni a pozíciót."); setLoadingLocation(false) })
        }
    }

    const handleMapClick = (lat: number, lng: number) => {
        if (isAdding) setNewServiceCoords({ lat, lng })
    }

    // --- ÚJ LOGIKA: Kérelem beküldése ---
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
            status: 'pending' // Alapértelmezetten függőben
        }

        // Fontos: Most a 'service_requests' táblába írunk, nem a 'service_partners'-be!
        const { error } = await supabase.from('service_requests').insert(data)
        
        if (!error) {
            // Nem adjuk hozzá a térképhez (setPartners), csak visszajelzünk és bezárjuk
            setIsAdding(false)
            setNewServiceCoords(null)
            alert('Köszönjük! A szervizt sikeresen beküldted ellenőrzésre. Jóváhagyás után megjelenik a térképen.')
        } else {
            console.error(error)
            alert('Hiba történt a beküldéskor. Kérlek próbáld újra.')
        }
    }

    return (
        <div className="relative w-full h-screen flex flex-col md:flex-row">
            
            {/* --- MOBIL VISSZA GOMB --- */}
            <div className="md:hidden absolute top-4 left-4 z-[1000]">
                <Link href="/" className="flex items-center justify-center w-10 h-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
                    <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-white" />
                </Link>
            </div>

            {/* --- LEBEGŐ SIDEBAR / PANEL --- */}
            <div className="absolute md:top-6 md:left-6 bottom-0 w-full md:w-[380px] md:h-auto z-[1000] pointer-events-none flex flex-col justify-end md:justify-start">
                
                <div className="pointer-events-auto bg-white/85 dark:bg-[#1a1f2e]/90 backdrop-blur-2xl border-t md:border border-white/20 dark:border-white/10 shadow-2xl rounded-t-3xl md:rounded-3xl flex flex-col overflow-hidden max-h-[70vh] md:max-h-[90vh] transition-all duration-500">
                    
                    {/* Header */}
                    <div className="p-5 border-b border-slate-200/50 dark:border-white/5">
                        <div className="hidden md:block mb-4">
                            <Link href="/" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200/50 dark:bg-white/10 hover:bg-slate-300/50 dark:hover:bg-white/20 transition-colors text-xs font-bold text-slate-700 dark:text-slate-300">
                                <ArrowLeft className="w-3.5 h-3.5" /> Vissza a Dashboardra
                            </Link>
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                                    Szerviz Térkép
                                </h1>
                                <p className="text-xs text-slate-500 font-medium mt-1.5 ml-0.5">
                                    {filteredPartners.length} partner a közelben
                                </p>
                            </div>
                            <button onClick={handleLocateMe} className="p-2.5 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:scale-105 transition active:scale-95">
                                <Locate className={`w-5 h-5 ${loadingLocation ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Filter Scroll */}
                    <div className="px-5 py-3 bg-slate-50/50 dark:bg-black/20">
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFilter(cat.id)}
                                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border
                                    ${filter === cat.id 
                                        ? 'bg-slate-800 dark:bg-blue-600 text-white border-transparent shadow-lg' 
                                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                                >
                                    <cat.icon className="w-3.5 h-3.5" />
                                    <span>{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lista */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-[100px]">
                        {filteredPartners.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">Nincs találat a szűrésre.</div>
                        ) : (
                            filteredPartners.map(partner => (
                                <div key={partner.id} className="group p-4 bg-white dark:bg-[#252a3a] border border-slate-100 dark:border-white/5 rounded-2xl hover:border-blue-500/30 transition-all cursor-pointer shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200">{partner.name}</h3>
                                        <div className={`p-1.5 rounded-lg ${CATEGORIES.find(c=>c.id === partner.category)?.color} bg-opacity-10`}>
                                            {(() => {
                                                const CatIcon = CATEGORIES.find(c=>c.id === partner.category)?.icon || Search
                                                return <CatIcon className={`w-4 h-4 ${CATEGORIES.find(c=>c.id === partner.category)?.text}`} />
                                            })()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                                        <MapPin className="w-3.5 h-3.5" /> {partner.address}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Submit Request Button Area */}
                    <div className="p-4 border-t border-slate-200/50 dark:border-white/5 bg-white dark:bg-[#151925]">
                         <button 
                            onClick={() => { setIsAdding(!isAdding); setNewServiceCoords(null); }}
                            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg
                            ${isAdding 
                                ? 'bg-red-50 text-red-600 border border-red-200' 
                                : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:scale-[1.02]'}`}
                        >
                            {isAdding ? <><X className="w-4 h-4"/> Mégse</> : <><Plus className="w-4 h-4" /> Szerviz Ajánlása</>}
                        </button>
                        {isAdding && (
                            <div className="mt-2 text-center text-xs font-bold text-orange-500 animate-pulse">
                                📍 Kattints a térképre a helyszín kijelöléséhez!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- TÉRKÉP --- */}
            <div className="flex-1 relative z-0">
                <MapContainer center={[47.4979, 19.0402]} zoom={13} scrollWheelZoom={true} zoomControl={false} style={{ height: "100%", width: "100%", outline: "none" }} className="bg-slate-200 dark:bg-slate-950">
                    <TileLayer attribution='© OSM' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    <MapController onMapClick={handleMapClick} userLocation={userLocation} />
                    {userLocation && <Marker position={userLocation} icon={L.divIcon({ html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>`, className: 'bg-transparent' })} />}
                    
                    {/* Meglévő partnerek */}
                    {filteredPartners.map((partner) => (
                        <Marker key={partner.id} position={[partner.latitude, partner.longitude]} icon={createCustomIcon(partner.category)}>
                            <Popup className="glass-popup" closeButton={false}>
                                <div className="p-1 min-w-[200px]">
                                    <h3 className="font-bold text-base text-slate-900 mb-1">{partner.name}</h3>
                                    <p className="text-xs text-slate-500 mb-2">{partner.description}</p>
                                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${partner.latitude},${partner.longitude}`} target="_blank" className="flex items-center justify-center gap-2 text-xs font-bold text-white bg-blue-600 p-2 rounded-lg hover:bg-blue-700 transition">
                                        <Navigation className="w-3 h-3"/> Útvonaltervezés
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* ÚJ SZERVIZ ŰRLAP POPUP */}
                    {newServiceCoords && (
                        <Marker position={[newServiceCoords.lat, newServiceCoords.lng]} icon={createCustomIcon('all')}>
                             <Popup minWidth={300} closeButton={false} className="glass-popup">
                                <form action={submitServiceRequest} className="space-y-3 p-1">
                                    <div className="border-b pb-2 mb-2">
                                        <h3 className="font-bold text-slate-900">Új Szerviz Ajánlása</h3>
                                        <p className="text-[10px] text-slate-500">Az adatok ellenőrzés után jelennek meg.</p>
                                    </div>
                                    
                                    <input name="name" placeholder="Szerviz neve" required className="w-full border p-2 rounded text-sm bg-slate-50" />
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <select name="category" className="w-full border p-2 rounded text-sm bg-slate-50">
                                            {CATEGORIES.slice(1).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                        </select>
                                        <input name="phone" placeholder="Tel. szám" className="w-full border p-2 rounded text-sm bg-slate-50" />
                                    </div>

                                    <input name="address" placeholder="Cím" required className="w-full border p-2 rounded text-sm bg-slate-50" />
                                    <textarea name="description" placeholder="Rövid leírás..." rows={2} className="w-full border p-2 rounded text-sm bg-slate-50 resize-none"></textarea>
                                    
                                    <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2">
                                        <Send className="w-3.5 h-3.5" /> Beküldés Ellenőrzésre
                                    </button>
                                </form>
                             </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
            <style jsx global>{`
                .custom-marker-icon { background: transparent; border: none; }
                .leaflet-popup-content-wrapper { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 12px; padding: 0; }
                .leaflet-popup-content { margin: 12px; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    )
}