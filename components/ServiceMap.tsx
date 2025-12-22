'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { Search, MapPin, Phone, Wrench, Car, Zap, Droplets, Plus, Navigation, Locate, X } from 'lucide-react'
import { createClient } from '@/supabase/client'

// --- Kategóriák és színek konfigurációja ---
const CATEGORIES = [
    { id: 'all', label: 'Összes', icon: Search, color: 'bg-slate-500', text: 'text-slate-500' },
    { id: 'mechanic', label: 'Szerelő', icon: Wrench, color: 'bg-orange-500', text: 'text-orange-500' },
    { id: 'tire', label: 'Gumizás', icon: Car, color: 'bg-blue-500', text: 'text-blue-500' },
    { id: 'wash', label: 'Autómosó', icon: Droplets, color: 'bg-cyan-400', text: 'text-cyan-400' },
    { id: 'electric', label: 'Villamosság', icon: Zap, color: 'bg-yellow-400', text: 'text-yellow-400' },
]

// --- Custom Marker Generátor (Hogy ne a béna kék pin legyen) ---
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
        className: 'custom-marker-icon', // CSS-ben resetelni kell a default backgroundot
        iconSize: [40, 40],
        iconAnchor: [20, 44], // Hegye a koordinátán legyen
        popupAnchor: [0, -45]
    });
}

// --- Térkép vezérlő komponensek ---
function MapController({ onMapClick, userLocation }: { onMapClick: (lat: number, lng: number) => void, userLocation: [number, number] | null }) {
    const map = useMap();
    
    // Ha megvan a user pozíciója, odarepülünk egyszer
    useEffect(() => {
        if (userLocation) {
            map.flyTo(userLocation, 14, { duration: 2 });
        }
    }, [userLocation, map]);

    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
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

    const filteredPartners = filter === 'all' 
        ? partners 
        : partners.filter(p => p.category === filter)

    // Saját pozíció kérése
    const handleLocateMe = () => {
        setLoadingLocation(true)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setUserLocation([pos.coords.latitude, pos.coords.longitude])
                setLoadingLocation(false)
            }, () => {
                alert("Nem sikerült meghatározni a pozíciót.")
                setLoadingLocation(false)
            })
        }
    }

    const handleMapClick = (lat: number, lng: number) => {
        if (isAdding) {
            setNewServiceCoords({ lat, lng })
        }
    }

    const saveService = async (formData: FormData) => {
        if (!newServiceCoords || !user) return;
        
        const data = {
            user_id: user.id,
            name: formData.get('name'),
            category: formData.get('category'),
            phone: formData.get('phone'),
            description: formData.get('description'),
            address: formData.get('address'),
            latitude: newServiceCoords.lat,
            longitude: newServiceCoords.lng
        }

        const { data: newPartner, error } = await supabase.from('service_partners').insert(data).select().single()
        
        if (!error && newPartner) {
            setPartners([newPartner, ...partners])
            setIsAdding(false)
            setNewServiceCoords(null)
        } else {
            console.error(error)
            alert('Hiba történt a mentéskor.')
        }
    }

    return (
        <div className="relative w-full h-screen flex flex-col md:flex-row">
            
            {/* --- iOS Glass Sidebar --- */}
            <div className="absolute md:top-6 md:left-6 bottom-0 w-full md:w-[380px] md:h-[calc(100vh-3rem)] z-[1000] pointer-events-none flex flex-col justify-end md:justify-start">
                
                {/* A tartalom már kattintható */}
                <div className="pointer-events-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-t md:border border-white/20 dark:border-white/10 shadow-2xl rounded-t-3xl md:rounded-3xl flex flex-col overflow-hidden max-h-[60vh] md:max-h-full transition-all duration-500">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                                Szerviz Térkép
                            </h1>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                                {filteredPartners.length} partner a közelben
                            </p>
                        </div>
                        <button onClick={handleLocateMe} className="p-2 bg-blue-500/10 text-blue-600 rounded-full hover:bg-blue-500/20 transition">
                            <Locate className={`w-5 h-5 ${loadingLocation ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Filter Scroll */}
                    <div className="px-6 py-4">
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFilter(cat.id)}
                                    className={`snap-start flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-300 border
                                    ${filter === cat.id 
                                        ? `${cat.color} text-white border-transparent shadow-lg shadow-${cat.color.replace('bg-', '')}/30` 
                                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'}`}
                                >
                                    <cat.icon className="w-3.5 h-3.5" />
                                    <span>{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lista (Desktopon látszik jobban) */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 hidden md:block">
                        {filteredPartners.map(partner => (
                            <div key={partner.id} className="group p-4 bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/5 rounded-2xl hover:bg-white/80 dark:hover:bg-white/10 transition-all cursor-pointer">
                                <div className="flex items-start justify-between">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{partner.name}</h3>
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md bg-opacity-10 ${CATEGORIES.find(c=>c.id === partner.category)?.text} bg-current`}>
                                        {CATEGORIES.find(c=>c.id === partner.category)?.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                                    <MapPin className="w-3 h-3" /> {partner.address}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Button Area */}
                    <div className="p-4 border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-md">
                         <button 
                            onClick={() => {
                                setIsAdding(!isAdding)
                                setNewServiceCoords(null)
                            }}
                            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg
                            ${isAdding 
                                ? 'bg-red-500/10 text-red-600 border border-red-500/20' 
                                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02]'}`}
                        >
                            {isAdding ? <><X className="w-4 h-4"/> Mégse</> : <><Plus className="w-4 h-4" /> Új Szerviz Regisztrálása</>}
                        </button>
                        {isAdding && (
                            <div className="mt-2 text-center text-xs font-semibold text-orange-500 bg-orange-500/10 py-1.5 rounded-lg animate-pulse">
                                📍 Kattints a térképre a helyszín kijelöléséhez!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- TÉRKÉP --- */}
            <div className="flex-1 relative z-0">
                <MapContainer 
                    center={[47.4979, 19.0402]} 
                    zoom={13} 
                    scrollWheelZoom={true} 
                    zoomControl={false} // Saját zoom controlt rakhatnánk, de most letisztultabb nélküle
                    style={{ height: "100%", width: "100%", outline: "none" }}
                    className="bg-slate-200 dark:bg-slate-800"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Szebb, tisztább térkép stílus
                    />
                    
                    <MapController onMapClick={handleMapClick} userLocation={userLocation} />
                    
                    {/* User Marker */}
                    {userLocation && (
                        <Marker position={userLocation} icon={L.divIcon({
                            html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>`,
                            className: 'bg-transparent'
                        })} />
                    )}

                    {/* Partnerek */}
                    {filteredPartners.map((partner) => (
                        <Marker 
                            key={partner.id} 
                            position={[partner.latitude, partner.longitude]}
                            icon={createCustomIcon(partner.category)}
                        >
                            <Popup className="glass-popup" closeButton={false}>
                                <div className="p-1 min-w-[220px]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white ${CATEGORIES.find(c => c.id === partner.category)?.color}`}>
                                            {CATEGORIES.find(c => c.id === partner.category)?.label}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{partner.name}</h3>
                                    <p className="text-xs text-slate-500 mb-3">{partner.description || 'Nincs leírás megadva.'}</p>
                                    
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-1.5 rounded">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400"/> {partner.address}
                                        </div>
                                        {partner.phone && (
                                            <a href={`tel:${partner.phone}`} className="flex items-center gap-2 text-xs font-medium text-white bg-green-500 p-1.5 rounded hover:bg-green-600 transition">
                                                <Phone className="w-3.5 h-3.5"/> {partner.phone}
                                            </a>
                                        )}
                                        <a 
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${partner.latitude},${partner.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 text-xs font-bold text-white bg-slate-900 p-2 rounded-lg mt-2 hover:bg-slate-800 transition shadow-md"
                                        >
                                            <Navigation className="w-3 h-3"/> Útvonaltervezés
                                        </a>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Új partner hozzáadása Popup */}
                    {newServiceCoords && (
                        <Marker position={[newServiceCoords.lat, newServiceCoords.lng]} icon={createCustomIcon('all')}>
                             <Popup minWidth={320} closeButton={false} className="glass-popup">
                                <form action={saveService} className="space-y-3 p-1">
                                    <div className="flex items-center justify-between border-b pb-2 mb-2">
                                        <h3 className="font-bold text-slate-900">Új Szerviz Felvétele</h3>
                                        <button type="button" onClick={() => setNewServiceCoords(null)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4"/></button>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <input name="name" placeholder="Szerviz neve" required className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            <select name="category" className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm text-slate-600">
                                                {CATEGORIES.slice(1).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                            </select>
                                            <input name="phone" placeholder="Tel. szám" className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm" />
                                        </div>

                                        <input name="address" placeholder="Pontos cím" required className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm" />
                                        <textarea name="description" rows={2} placeholder="Rövid leírás a szolgáltatásokról..." className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm resize-none"></textarea>
                                    </div>

                                    <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2.5 rounded-lg font-bold text-sm hover:shadow-lg hover:scale-[1.02] transition-all">
                                        Mentés és Publikálás
                                    </button>
                                </form>
                             </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>

            {/* Global Styles for Custom Markers reset */}
            <style jsx global>{`
                .custom-marker-icon {
                    background: transparent;
                    border: none;
                }
                .leaflet-popup-content-wrapper {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 16px;
                    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.2);
                    padding: 0;
                    overflow: hidden;
                }
                .leaflet-popup-content {
                    margin: 12px;
                    width: auto !important;
                }
                .leaflet-popup-tip {
                    background: rgba(255, 255, 255, 0.95);
                }
                /* Hide scrollbar for Chrome, Safari and Opera */
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `}</style>
        </div>
    )
}