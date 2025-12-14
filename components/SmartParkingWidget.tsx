'use client'

import { useState, useEffect } from 'react'
import { MapPin, Camera, Navigation, X, Ban, Loader2, Clock, Check, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import { startParkingAction, stopParkingAction } from '@/app/parking/actions' 
import { useFormStatus } from 'react-dom'

// --- SEGÉD: Submit Gomb ---
function SubmitButton({ label, icon: Icon, colorClass, disabled }: any) {
  const { pending } = useFormStatus()
  return (
    <button 
      disabled={pending || disabled}
      type="submit" 
      className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${colorClass}`}
    >
      {pending ? <Loader2 className="animate-spin h-5 w-5"/> : <><Icon size={18} /> {label}</>}
    </button>
  )
}

// --- SEGÉD: Időzítő Hook ---
function useParkingTimer(startTime: string | null, expiresAt: string | null) {
    const [displayTime, setDisplayTime] = useState('Indítás...')
    const [isExpired, setIsExpired] = useState(false)

    useEffect(() => {
        if (!startTime) {
            setDisplayTime('Indítás...');
            return;
        }

        const update = () => {
            const now = new Date().getTime()
            
            if (expiresAt) {
                const end = new Date(expiresAt).getTime()
                if (isNaN(end)) { setDisplayTime('--:--'); return }

                const diff = end - now
                if (diff < 0) {
                    setIsExpired(true)
                    setDisplayTime("LEJÁRT")
                } else {
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                    setDisplayTime(`${hours}ó ${minutes}p (hátralévő)`)
                }
            } else {
                const start = new Date(startTime).getTime()
                if (isNaN(start)) { setDisplayTime('Most'); return }
                
                const diff = now - start
                const hours = Math.floor(diff / (1000 * 60 * 60))
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                setDisplayTime(`${hours}ó ${minutes}p (eltelt)`)
            }
        }
        update() 
        const interval = setInterval(update, 60000)
        return () => clearInterval(interval)
    }, [startTime, expiresAt])

    return { displayTime, isExpired }
}

// --- FŐ KOMPONENS ---
export default function SmartParkingWidget({ carId, activeSession }: { carId: string, activeSession: any }) {
    // UI Állapotok
    const [isLocating, setIsLocating] = useState(false)
    const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
    const [showStartForm, setShowStartForm] = useState(false)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    
    // Parkolás Állapotok
    // tempSession: amit mi hozunk létre a UI-on azonnal (optimista)
    const [tempSession, setTempSession] = useState<any>(null);

    // Ha a szerverről megérkezik a friss adat (activeSession), akkor a tempSession-t töröljük
    useEffect(() => {
        if (activeSession) {
            setTempSession(null);
        }
    }, [activeSession]);

    // A megjelenítendő session kiválasztása
    const currentSession = tempSession || activeSession;
    const safeStartTime = currentSession?.start_time || currentSession?.created_at || new Date().toISOString();

    const { displayTime, isExpired } = useParkingTimer(
        safeStartTime, 
        currentSession?.expires_at || null
    )

    // --- GPS Mérés ---
    const handleGetLocation = () => {
       setIsLocating(true)
       if (!navigator.geolocation) { alert('A böngésző nem támogatja a helymeghatározást.'); setIsLocating(false); return }
       navigator.geolocation.getCurrentPosition(
           (pos) => { 
               setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); 
               setIsLocating(false); 
               setShowStartForm(true); 
           },
           (err) => { 
               alert('Nem sikerült lekérni a pozíciót. Engedélyezd a GPS-t!'); 
               setIsLocating(false); 
           },
           { enableHighAccuracy: true, timeout: 10000 }
       )
    }

    // --- Fotó Kezelés ---
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; 
        if (file) setPhotoPreview(URL.createObjectURL(file));
    }

    // --- Form Reset ---
    const resetForm = () => {
        setShowStartForm(false); setLocation(null); setPhotoPreview(null); setSelectedDuration(null);
    }

    // --- ACTION: Parkolás Indítása ---
    const handleStartParking = async (formData: FormData) => {
        const lat = parseFloat(String(formData.get('latitude')));
        const lng = parseFloat(String(formData.get('longitude')));
        const note = String(formData.get('note') || '');
        const duration = formData.get('duration') ? parseInt(String(formData.get('duration'))) : null;
        
        const now = new Date();
        const fakeSession = {
            id: 'temp-id', // Jelzi, hogy ez még csak kliens oldali
            car_id: carId,
            latitude: lat,
            longitude: lng,
            note: note,
            start_time: now.toISOString(),
            expires_at: duration ? new Date(now.getTime() + duration * 60000).toISOString() : null,
            photo_url: photoPreview
        };

        // 1. Optimista UI frissítés
        setTempSession(fakeSession);
        resetForm();

        // 2. Szerver hívás
        try {
            await startParkingAction(formData);
        } catch (error) {
            console.error("Indítási hiba:", error);
            alert("Nem sikerült elmenteni a parkolást.");
            setTempSession(null); 
        }
    }

    // --- ACTION: Parkolás Leállítása (JAVÍTVA) ---
    const handleStopParking = async (formData: FormData) => {
        // JAVÍTÁS: Ha "temp-id" van, akkor csak a helyi állapotot dobjuk el (Mégse funkció)
        // Nem hívunk szervert, mert nincs valós ID, ami beragadást okozna
        if (currentSession?.id === 'temp-id') {
            setTempSession(null);
            setIsDetailsOpen(false);
            return;
        }

        try {
            // Biztosítjuk, hogy a car_id átmenjen
            formData.set('car_id', carId);
            
            // 1. Szerver hívás
            await stopParkingAction(formData);
            
            // 2. Kliens takarítás
            setTempSession(null);
            setIsDetailsOpen(false);

        } catch (error) {
            console.error("Leállítási hiba:", error);
            alert("Hiba történt a leállításkor. Próbáld újra.");
            setIsDetailsOpen(false);
        }
    }

    // --- RENDERELÉS: AKTÍV PARKOLÁS ---
    if (currentSession) {
        const isTemp = currentSession.id === 'temp-id';

        return (
            <>
                {/* WIDGET KÁRTYA */}
                <div 
                    onClick={() => setIsDetailsOpen(true)}
                    className="relative h-48 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                    <div 
                        className="absolute inset-0 bg-slate-800 bg-cover bg-center opacity-90 group-hover:scale-105 transition-transform duration-700"
                        style={{ 
                            backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/${currentSession.longitude},${currentSession.latitude},15,0/600x300?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}')`
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-5">
                        <div className="absolute top-4 left-4 flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-emerald-500/30">
                            {isTemp ? (
                                <>
                                    <Loader2 className="animate-spin h-3 w-3" /> Mentés...
                                </>
                            ) : (
                                <>
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Parkolás aktív
                                </>
                            )}
                        </div>
                        
                        <p className="text-white font-black text-xl leading-tight mb-1 truncate drop-shadow-md">
                            {currentSession.note || "Parkolóhely"}
                        </p>
                        
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-slate-400 text-[10px] uppercase font-bold">Időtartam</span>
                                <span className={`font-mono text-sm font-bold ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {displayTime}
                                </span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold text-white border border-white/20 hover:bg-white/20 transition-colors">
                                Részletek
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL - JAVÍTOTT POZICIONÁLÁS (z-index, fixed) */}
                {isDetailsOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        {/* Háttér sötétítés */}
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsDetailsOpen(false)} />
                        
                        {/* Modal ablak */}
                        <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                            
                            {/* Térkép / Fotó Fejléc */}
                            <div className="h-48 relative w-full bg-slate-800 shrink-0">
                                {currentSession.photo_url ? (
                                     <Image src={currentSession.photo_url} alt="Bizonyíték" fill className="object-cover" />
                                ) : (
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center opacity-60"
                                        style={{ 
                                            backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/${currentSession.longitude},${currentSession.latitude},16,0/600x400?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}')`
                                        }}
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900" />
                                <button 
                                    onClick={() => setIsDetailsOpen(false)} 
                                    className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur hover:bg-black/70 transition-colors z-50"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Tartalom - Gördíthető, ha túl hosszú */}
                            <div className="px-6 pb-6 -mt-10 relative z-10 overflow-y-auto">
                                <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-600 rounded-2xl p-4 mb-5 shadow-xl">
                                    <h2 className="text-2xl font-bold text-white mb-1">{currentSession.note || "Parkolás"}</h2>
                                    <div className="flex items-center text-slate-400 text-xs gap-2 mb-4 font-mono">
                                        <MapPin size={12} className="text-emerald-500" />
                                        {currentSession.latitude.toFixed(5)}, {currentSession.longitude.toFixed(5)}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold">Kezdés</p>
                                            <p className="text-lg font-mono text-white">
                                                {safeStartTime ? new Date(safeStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                                            </p>
                                        </div>
                                        <div className={`bg-slate-900/60 p-3 rounded-xl border border-slate-700 ${isExpired ? 'border-red-500/50' : ''}`}>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold">Státusz</p>
                                            <p className={`text-lg font-mono font-bold ${isExpired ? 'text-red-500' : 'text-emerald-400'}`}>
                                                {displayTime}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <a 
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${currentSession.latitude},${currentSession.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors shadow-lg shadow-blue-900/20"
                                    >
                                        <Navigation size={18} /> Odavezetés (Maps)
                                    </a>

                                    <form action={handleStopParking}>
                                        <input type="hidden" name="parking_id" value={currentSession.id} />
                                        
                                        {/* JAVÍTÁS: Szinkronizálás alatt is KATTINTHATÓ a "Mégse" gomb */}
                                        {isTemp ? (
                                            <button 
                                                type="submit"
                                                className="w-full py-3.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold border border-slate-600 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                            >
                                                <X size={18} /> Mégse (Szinkronizálás megszakítása)
                                            </button>
                                        ) : (
                                            <SubmitButton 
                                                label="Parkolás Leállítása" 
                                                icon={Ban} 
                                                colorClass="bg-slate-800 hover:bg-red-500/10 text-white hover:text-red-500 border border-slate-700 hover:border-red-500/30" 
                                            />
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>
        )
    }

    // --- RENDERELÉS: START FORM (Ha nincs session) ---
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-1 w-full">
            {!showStartForm ? (
                <button 
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="w-full py-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group flex flex-col items-center justify-center gap-3"
                >
                    {isLocating ? (
                        <>
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            <span className="text-sm font-bold text-slate-500">GPS pozíció keresése...</span>
                        </>
                    ) : (
                        <>
                            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                <MapPin className="w-7 h-7" />
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-lg text-slate-700 dark:text-slate-200">Itt parkoltam le</span>
                                <span className="text-xs text-slate-400">Kattints a pozíció mentéséhez</span>
                            </div>
                        </>
                    )}
                </button>
            ) : (
                <form action={handleStartParking} className="p-4 space-y-5 animate-in fade-in slide-in-from-bottom-2">
                    
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <MapPin className="text-blue-500" size={18} /> Pozíció rögzítve
                        </h3>
                        <div className="flex gap-2">
                            <button type="button" onClick={handleGetLocation} title="Újra mérés" className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition-colors">
                                <RefreshCw className="w-4 h-4 text-slate-500" />
                            </button>
                            <button type="button" onClick={resetForm} title="Bezárás" className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition-colors">
                                <X className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>
                    </div>

                    <input type="hidden" name="car_id" value={carId} />
                    <input type="hidden" name="latitude" value={location?.lat} />
                    <input type="hidden" name="longitude" value={location?.lng} />
                    
                    {location && (
                        <div className="h-24 w-full rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-700">
                             <div 
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ 
                                    backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/${location.lng},${location.lat},16,0/600x200?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}')`
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-blue-500/20 p-2 rounded-full animate-pulse">
                                    <MapPin className="text-blue-500 fill-blue-500 drop-shadow-md" size={24} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Emlékeztető (opcionális)
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {[15, 30, 60, 120].map(min => (
                                <div 
                                    key={min} 
                                    onClick={() => setSelectedDuration(min === selectedDuration ? null : min)}
                                    className={`cursor-pointer py-2 text-center text-xs font-bold rounded-lg border transition-all ${
                                        selectedDuration === min 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {min}p
                                    {selectedDuration === min && <input type="hidden" name="duration" value={min} />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                         <label className="block w-full cursor-pointer group">
                            <div className="relative h-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors overflow-hidden">
                                {photoPreview ? (
                                    <>
                                        <Image src={photoPreview} alt="Preview" fill className="object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                        <div className="relative z-10 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full text-white text-xs font-bold backdrop-blur-sm">
                                            <Camera size={14} /> Fotó cseréje
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                        <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <span className="text-xs font-bold">Fotó hozzáadása</span>
                                    </div>
                                )}
                                <input type="file" name="photo" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
                            </div>
                        </label>
                    </div>

                    <input 
                        name="note" 
                        placeholder="Megjegyzés (pl. 2. emelet, 14-es hely)..." 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
                    />

                    <SubmitButton 
                        label="Mentés és Parkolás" 
                        icon={Check} 
                        colorClass="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20" 
                    />
                </form>
            )}
        </div>
    )
}