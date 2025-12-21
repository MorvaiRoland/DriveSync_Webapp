'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Search, MapPin, Phone, Globe, Wrench, Car, Zap, Droplets, Plus } from 'lucide-react'
import { createClient } from '@/supabase/client' // Vagy a te kliens oldali importod

// --- Ikon hiba javítása Next.js-ben ---
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Kategória Ikonok ---
const CATEGORIES = [
    { id: 'all', label: 'Összes', icon: Search },
    { id: 'mechanic', label: 'Szerelő', icon: Wrench },
    { id: 'tire', label: 'Gumizás', icon: Car },
    { id: 'wash', label: 'Autómosó', icon: Droplets },
    { id: 'electric', label: 'Villamosság', icon: Zap },
]

// --- Segédkomponens a kattintáshoz ---
function MapClickEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
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
    const supabase = createClient()

    // Szűrés
    const filteredPartners = filter === 'all' 
        ? partners 
        : partners.filter(p => p.category === filter)

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
            setPartners([...partners, newPartner])
            setIsAdding(false)
            setNewServiceCoords(null)
            alert('Szerviz sikeresen hozzáadva!')
        } else {
            alert('Hiba történt a mentéskor.')
        }
    }

    return (
        <div className="relative w-full h-screen flex flex-col md:flex-row">
            
            {/* --- SIDEBAR / FILTER --- */}
            <div className="w-full md:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-xl">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Szerviz Térkép</h1>
                    <p className="text-sm text-slate-500">Keress megbízható partnert vagy regisztráld a sajátod.</p>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="space-y-2 mb-6">
                        <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Szűrés</p>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setFilter(cat.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${filter === cat.id ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                <cat.icon className="w-4 h-4" />
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                         <button 
                            onClick={() => setIsAdding(!isAdding)}
                            className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isAdding ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}
                        >
                            {isAdding ? 'Mégse' : <><Plus className="w-4 h-4" /> Szerviz hozzáadása</>}
                        </button>
                        {isAdding && <p className="text-xs text-center mt-2 text-amber-600 animate-pulse">Kattints a térképre a pozíció megadásához!</p>}
                    </div>
                </div>
            </div>

            {/* --- TÉRKÉP --- */}
            <div className="flex-1 relative z-10">
                <MapContainer center={[47.4979, 19.0402]} zoom={12} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickEvents onMapClick={handleMapClick} />
                    
                    {/* Meglévő partnerek */}
                    {filteredPartners.map((partner) => (
                        <Marker key={partner.id} position={[partner.latitude, partner.longitude]}>
                            <Popup>
                                <div className="min-w-[200px]">
                                    <h3 className="font-bold text-lg">{partner.name}</h3>
                                    <p className="text-xs font-bold uppercase text-amber-600 mb-2">{CATEGORIES.find(c => c.id === partner.category)?.label || partner.category}</p>
                                    <p className="text-sm text-slate-600 mb-2">{partner.description}</p>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex items-center gap-2 text-slate-500"><MapPin className="w-3 h-3"/> {partner.address}</div>
                                        {partner.phone && <div className="flex items-center gap-2 text-slate-500"><Phone className="w-3 h-3"/> {partner.phone}</div>}
                                    </div>
                                    <button className="mt-3 w-full bg-slate-900 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800">Időpontfoglalás</button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Új partner pozíció jelölő */}
                    {newServiceCoords && (
                        <Marker position={[newServiceCoords.lat, newServiceCoords.lng]}>
                             <Popup minWidth={300}>
                                <form action={saveService} className="space-y-3 p-1">
                                    <h3 className="font-bold border-b pb-2">Új Szerviz Regisztrálása</h3>
                                    <input name="name" placeholder="Szerviz neve" required className="w-full border p-2 rounded text-sm" />
                                    <select name="category" className="w-full border p-2 rounded text-sm">
                                        <option value="mechanic">Autószerelő</option>
                                        <option value="tire">Gumizás</option>
                                        <option value="wash">Autómosó</option>
                                        <option value="electric">Villamosság</option>
                                    </select>
                                    <input name="address" placeholder="Cím" required className="w-full border p-2 rounded text-sm" />
                                    <input name="phone" placeholder="Telefonszám" className="w-full border p-2 rounded text-sm" />
                                    <textarea name="description" placeholder="Rövid leírás" className="w-full border p-2 rounded text-sm"></textarea>
                                    <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">Mentés és Beküldés</button>
                                </form>
                             </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
        </div>
    )
}