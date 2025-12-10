'use client'

import { useState, useEffect } from 'react'
import { MapPin, Camera, Timer, Navigation, X, Check, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { startParkingAction, stopParkingAction } from '@/app/parking/actions' // Vagy ahol létrehoztad
import { toast } from 'sonner' // Ha használod a sonner-t, vagy sima alert

export default function ParkingAssistant({ carId, activeSession }: { carId: string, activeSession: any }) {
    const [isLocating, setIsLocating] = useState(false)
    const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    
    // Visszaszámláló logika
    const [timeLeft, setTimeLeft] = useState<string>('')
    
    useEffect(() => {
        if (!activeSession?.expires_at) return;
        
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(activeSession.expires_at).getTime();
            const diff = end - now;

            if (diff < 0) {
                setTimeLeft('LEJÁRT');
                clearInterval(interval);
            } else {
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${hours}ó ${minutes}p`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [activeSession]);

    // GPS Lekérése
    const handleGetLocation = () => {
        setIsLocating(true)
        if (!navigator.geolocation) {
            toast.error('A böngésződ nem támogatja a helymeghatározást.')
            setIsLocating(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })
                setIsLocating(false)
                setShowForm(true) // Megnyitjuk az űrlapot ha megvan a pozíció
            },
            (error) => {
                console.error(error)
                toast.error('Nem sikerült lekérni a pozíciót. Engedélyezd a GPS-t!')
                setIsLocating(false)
            },
            { enableHighAccuracy: true }
        )
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setPhotoPreview(URL.createObjectURL(file))
        }
    }

    // --- 1. AKTÍV PARKOLÁS NÉZET ---
    if (activeSession) {
        return (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-xl border border-slate-700 relative overflow-hidden">
                {/* Háttér effekt */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-400 fill-blue-400/20" />
                            Parkolás Aktív
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            {new Date(activeSession.created_at).toLocaleTimeString('hu-HU', {hour: '2-digit', minute:'2-digit'})}-kor rögzítve
                        </p>
                    </div>
                    {activeSession.expires_at && (
                        <div className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${timeLeft === 'LEJÁRT' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-blue-500/20 border-blue-500 text-blue-400'}`}>
                            {timeLeft || '--:--'}
                        </div>
                    )}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                    {/* Fotó bizonyíték */}
                    {activeSession.photo_url ? (
                        <div className="relative h-24 rounded-xl overflow-hidden border border-white/10 group cursor-pointer" onClick={() => window.open(activeSession.photo_url, '_blank')}>
                            <Image src={activeSession.photo_url} alt="Parkolás helye" fill className="object-cover group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    ) : (
                        <div className="h-24 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-slate-500">
                            <Camera className="w-6 h-6 mb-1 opacity-50" />
                            <span className="text-[10px]">Nincs fotó</span>
                        </div>
                    )}

                    {/* Navigáció Gomb */}
                    <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${activeSession.latitude},${activeSession.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-24 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors flex flex-col items-center justify-center gap-2 text-white shadow-lg shadow-blue-900/50"
                    >
                        <Navigation className="w-8 h-8" />
                        <span className="text-xs font-bold uppercase tracking-wider">Vezess oda</span>
                    </a>
                </div>

                {activeSession.note && (
                    <div className="bg-white/5 p-3 rounded-lg mb-4 text-sm text-slate-300 italic border border-white/5">
                        "{activeSession.note}"
                    </div>
                )}

                <form action={stopParkingAction}>
                    <input type="hidden" name="id" value={activeSession.id} />
                    <button className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm transition-colors border border-slate-600 flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" /> Parkolás vége
                    </button>
                </form>
            </div>
        )
    }

    // --- 2. PARKOLÁS INDÍTÁSA NÉZET ---
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
            {!showForm ? (
                // Kezdőállapot gomb
                <button 
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="w-full py-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group flex flex-col items-center justify-center gap-2"
                >
                    {isLocating ? (
                        <>
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            <span className="text-sm font-bold text-slate-500">Pozíció keresése...</span>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200">Itt parkoltam le</span>
                            <span className="text-xs text-slate-400">Kattints a pozíció mentéséhez</span>
                        </>
                    )}
                </button>
            ) : (
                // Részletes űrlap
                <form action={async (formData) => {
                    await startParkingAction(formData);
                    setShowForm(false);
                    setPhotoPreview(null);
                }} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Parkolás rögzítése</h3>
                        <button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
                    </div>

                    <input type="hidden" name="car_id" value={carId} />
                    <input type="hidden" name="latitude" value={location?.lat} />
                    <input type="hidden" name="longitude" value={location?.lng} />

                    {/* Időtartam */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                            <Timer className="w-3 h-3" /> Időtartam (opcionális)
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {[15, 30, 60, 120].map(min => (
                                <label key={min} className="cursor-pointer">
                                    <input type="radio" name="duration" value={min} className="peer sr-only" />
                                    <div className="py-2 text-center text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 transition-all hover:bg-slate-50 dark:hover:bg-slate-700">
                                        {min}p
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Fotó */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                            <Camera className="w-3 h-3" /> Fotó a helyről
                        </label>
                        <label className="block w-full cursor-pointer">
                            <div className="relative h-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors overflow-hidden">
                                {photoPreview ? (
                                    <Image src={photoPreview} alt="Preview" fill className="object-cover opacity-80" />
                                ) : (
                                    <div className="text-center text-slate-400">
                                        <Camera className="w-8 h-8 mx-auto mb-1 opacity-50" />
                                        <span className="text-xs">Kattints a fotózáshoz</span>
                                    </div>
                                )}
                                <input type="file" name="photo" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
                            </div>
                        </label>
                    </div>

                    {/* Jegyzet */}
                    <div>
                        <input 
                            name="note" 
                            placeholder="Pl. 2. emelet, 145-ös hely, vagy zónakód" 
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all">
                        Mentés és Indítás
                    </button>
                </form>
            )}
        </div>
    )
}