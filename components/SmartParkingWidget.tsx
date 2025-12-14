'use client'

import { useState, useEffect } from 'react'
import { MapPin, Camera, Navigation, X, Ban, Loader2, Clock, Check, Car, Timer } from 'lucide-react'
import Image from 'next/image'
import { startParkingAction, stopParkingAction } from '@/app/parking/actions' 
import { useFormStatus } from 'react-dom'

// --- SEGÉD: Submit Gomb (Stílusos) ---
function SubmitButton({ label, icon: Icon, variant = 'primary', disabled }: any) {
  const { pending } = useFormStatus()
  
  const baseClass = "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-base"
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-blue-500/25 hover:shadow-blue-500/40 border border-blue-400/20",
    danger: "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-red-500/25 hover:shadow-red-500/40 border border-red-400/20",
    secondary: "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
  }

  return (
    <button 
      disabled={pending || disabled}
      type="submit" 
      className={`${baseClass} ${variants[variant as keyof typeof variants]}`}
    >
      {pending ? <Loader2 className="animate-spin h-6 w-6"/> : <Icon size={20} strokeWidth={2.5} />}
      {label}
    </button>
  )
}

// --- SEGÉD: Időzítő Hook ---
function useParkingTimer(startTime: string | null, expiresAt: string | null) {
    const [displayTime, setDisplayTime] = useState('Indítás...')
    const [isExpired, setIsExpired] = useState(false)
    const [progress, setProgress] = useState(0) // Progress barhoz

    useEffect(() => {
        if (!startTime) return;

        const update = () => {
            const now = new Date().getTime()
            const start = new Date(startTime).getTime()
            
            if (expiresAt) {
                const end = new Date(expiresAt).getTime()
                const totalDuration = end - start
                const diff = end - now
                
                // Progress számítás (fordítva, ahogy fogy az idő)
                const elapsed = now - start;
                const percent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
                setProgress(percent);

                if (diff < 0) {
                    setIsExpired(true)
                    setDisplayTime("LEJÁRT")
                } else {
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
                    setDisplayTime(`${hours}:${minutes < 10 ? '0'+minutes : minutes}:${seconds < 10 ? '0'+seconds : seconds}`)
                }
            } else {
                const diff = now - start
                const hours = Math.floor(diff / (1000 * 60 * 60))
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                setDisplayTime(`${hours}ó ${minutes}p`)
                setProgress(100)
            }
        }
        update() 
        const interval = setInterval(update, 1000)
        return () => clearInterval(interval)
    }, [startTime, expiresAt])

    return { displayTime, isExpired, progress }
}

// --- FŐ KOMPONENS ---
export default function SmartParkingWidget({ carId, activeSession }: { carId: string, activeSession: any }) {
    const [isLocating, setIsLocating] = useState(false)
    const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
    const [showStartForm, setShowStartForm] = useState(false)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
    
    // UI State: Full Screen Details
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    
    const [tempSession, setTempSession] = useState<any>(null);

    useEffect(() => {
        if (activeSession) setTempSession(null);
    }, [activeSession]);

    const currentSession = tempSession || activeSession;
    const safeStartTime = currentSession?.start_time || currentSession?.created_at || new Date().toISOString();

    const { displayTime, isExpired, progress } = useParkingTimer(safeStartTime, currentSession?.expires_at || null)

    // Body scroll lock when details open
    useEffect(() => {
        if (isDetailsOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto'; }
    }, [isDetailsOpen]);

    const handleGetLocation = () => {
       setIsLocating(true)
       if (!navigator.geolocation) { alert('GPS nem elérhető'); setIsLocating(false); return }
       navigator.geolocation.getCurrentPosition(
           (pos) => { 
               setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); 
               setIsLocating(false); 
               setShowStartForm(true); 
           },
           (err) => { alert('GPS hiba'); setIsLocating(false); },
           { enableHighAccuracy: true }
       )
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; 
        if (file) setPhotoPreview(URL.createObjectURL(file));
    }

    const handleStartParking = async (formData: FormData) => {
        // Optimista UI update
        const lat = parseFloat(String(formData.get('latitude')));
        const lng = parseFloat(String(formData.get('longitude')));
        const duration = formData.get('duration') ? parseInt(String(formData.get('duration'))) : null;
        
        const now = new Date();
        setTempSession({
            id: 'temp-id', car_id: carId, latitude: lat, longitude: lng,
            note: String(formData.get('note') || ''),
            start_time: now.toISOString(),
            expires_at: duration ? new Date(now.getTime() + duration * 60000).toISOString() : null,
            photo_url: photoPreview
        });
        
        setShowStartForm(false);
        setLocation(null);
        setPhotoPreview(null);

        try { await startParkingAction(formData); } 
        catch (e) { setTempSession(null); alert("Hiba a mentéskor"); }
    }

    const handleStopParking = async (formData: FormData) => {
        if (currentSession?.id === 'temp-id') {
            setTempSession(null); setIsDetailsOpen(false); return;
        }
        try {
            formData.set('car_id', carId);
            await stopParkingAction(formData);
            setIsDetailsOpen(false);
        } catch (e) { alert("Hiba a leállításkor"); }
    }

    // --- AKTÍV PARKOLÁS NÉZET (Dashboard Widget + Full Screen Modal) ---
    if (currentSession) {
        const isTemp = currentSession.id === 'temp-id';
        const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/${currentSession.longitude},${currentSession.latitude},15,0/800x600?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}`;

        return (
            <>
                {/* 1. DASHBOARD WIDGET (A kártya amit alapból látsz) */}
                <div 
                    onClick={() => setIsDetailsOpen(true)}
                    className="relative w-full h-44 rounded-3xl overflow-hidden cursor-pointer group shadow-2xl border border-slate-800"
                >
                    {/* Background Map Placeholder/Image */}
                    <div className="absolute inset-0 bg-slate-900">
                        <div 
                             className="w-full h-full opacity-60 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-out"
                             style={{ backgroundImage: `url('${mapUrl}')`, backgroundColor: '#0f172a' }}
                        />
                        {/* Sötétítés a szöveg alatt */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/60 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 px-3 py-1 rounded-full">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Aktív Parkolás</span>
                            </div>
                            {isTemp && <Loader2 className="animate-spin text-white/50 w-5 h-5"/>}
                        </div>

                        <div>
                            <h3 className="text-white text-2xl font-black tracking-tight mb-1 truncate">{currentSession.note || "Parkolóhely"}</h3>
                            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                <Clock size={16} />
                                <span className={isExpired ? "text-red-400 font-bold" : "text-emerald-400 font-bold font-mono"}>
                                    {displayTime}
                                </span>
                                <span>•</span>
                                <span className="text-slate-500">Kattints a részletekért</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. FULL SCREEN "APP" VIEW (Ez a lényeg: Elfedi az egészet) */}
                {isDetailsOpen && (
                    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-200">
                        
                        {/* Header: Kép és Bezárás */}
                        <div className="relative h-[45vh] w-full shrink-0">
                            {/* Bezárás gomb - Mindig látható felül */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsDetailsOpen(false); }}
                                className="absolute top-6 right-6 z-50 bg-black/40 backdrop-blur-md text-white p-3 rounded-full border border-white/10 active:scale-90 transition-transform"
                            >
                                <X size={24} />
                            </button>

                            {/* Háttér kép/térkép */}
                            {currentSession.photo_url ? (
                                <Image src={currentSession.photo_url} alt="Parkolás" fill className="object-cover" />
                            ) : (
                                <div 
                                    className="w-full h-full bg-slate-800 bg-cover bg-center"
                                    style={{ backgroundImage: `url('${mapUrl}')` }}
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-slate-950" />
                            
                            {/* Cím a kép alján */}
                            <div className="absolute bottom-0 left-0 w-full p-8 pb-10">
                                <h1 className="text-4xl font-black text-white mb-2 leading-tight">{currentSession.note || "Ismeretlen hely"}</h1>
                                <div className="flex items-center gap-2 text-slate-300 font-mono text-sm">
                                    <MapPin className="text-blue-500" size={16} />
                                    {currentSession.latitude.toFixed(5)}, {currentSession.longitude.toFixed(5)}
                                </div>
                            </div>
                        </div>

                        {/* Alsó tartalom rész (Görgethető) */}
                        <div className="flex-1 bg-slate-950 px-6 -mt-6 relative z-10 rounded-t-3xl border-t border-slate-800/50 flex flex-col overflow-y-auto pb-10">
                            
                            {/* Húzóka design elem */}
                            <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mt-4 mb-8" />

                            {/* Timer Kártya */}
                            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl mb-8 relative overflow-hidden">
                                <div className="flex justify-between items-end mb-4 relative z-10">
                                    <div>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Hátralévő idő</p>
                                        <p className={`text-4xl font-mono font-bold tracking-tighter ${isExpired ? 'text-red-500' : 'text-white'}`}>
                                            {displayTime}
                                        </p>
                                    </div>
                                    <Timer className="text-slate-700 w-10 h-10" />
                                </div>
                                
                                {/* Progress bar */}
                                {currentSession.expires_at && (
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${isExpired ? 'bg-red-500' : 'bg-blue-500'}`} 
                                            style={{ width: `${progress}%` }} 
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons - A képernyő aljára tolva ha van hely */}
                            <div className="mt-auto flex flex-col gap-4">
                                <a 
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${currentSession.latitude},${currentSession.longitude}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-4 rounded-2xl bg-slate-800 text-white font-bold flex items-center justify-center gap-3 border border-slate-700 active:scale-95 transition-transform"
                                >
                                    <Navigation size={20} />
                                    Útvonal tervezése
                                </a>

                                <form action={handleStopParking}>
                                    <input type="hidden" name="parking_id" value={currentSession.id} />
                                    <SubmitButton 
                                        label={isTemp ? "Mégse (Szinkronizálás...)" : "Parkolás Befejezése"}
                                        icon={Ban}
                                        variant="danger"
                                    />
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </>
        )
    }

    // --- ÜRES ÁLLAPOT (Start Form) ---
    // Ez nagyjából maradt, csak szebb design-t kapott
    return (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-1 w-full shadow-xl">
            {!showStartForm ? (
                <button 
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="w-full py-10 rounded-[1.4rem] border-2 border-dashed border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all group flex flex-col items-center justify-center gap-4 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {isLocating ? (
                        <>
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                            <span className="text-slate-400 font-medium">GPS keresése...</span>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                                <MapPin className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-center relative z-10">
                                <span className="block font-bold text-xl text-white mb-1">Parkolás indítása</span>
                                <span className="text-sm text-slate-500">Rögzítsd a pozíciód egy gombnyomással</span>
                            </div>
                        </>
                    )}
                </button>
            ) : (
                <form action={handleStartParking} className="p-5 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-white font-bold text-lg">
                            <MapPin className="text-blue-500 fill-blue-500/20" /> 
                            <span>Pozíció megvan</span>
                        </div>
                        <button type="button" onClick={() => setShowStartForm(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
                            <X size={18} />
                        </button>
                    </div>

                    <input type="hidden" name="car_id" value={carId} />
                    <input type="hidden" name="latitude" value={location?.lat} />
                    <input type="hidden" name="longitude" value={location?.lng} />

                    {/* Hely térkép preview */}
                    <div className="h-28 w-full rounded-2xl overflow-hidden relative border border-slate-700 bg-slate-800">
                        <div 
                             className="absolute inset-0 bg-cover bg-center opacity-80"
                             style={{ backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/${location?.lng},${location?.lat},16,0/600x200?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}')` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-blue-500 p-2 rounded-full shadow-lg shadow-blue-500/50 animate-bounce">
                                <Car className="text-white w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Jegyzet */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Megjegyzés</label>
                        <input 
                            name="note" 
                            placeholder="Pl. P3 zóna, 2. emelet..." 
                            className="w-full px-5 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    
                    {/* Fotó */}
                    <label className="block w-full cursor-pointer group">
                        <div className="relative h-16 rounded-2xl bg-slate-800 border border-slate-700 border-dashed flex items-center justify-center gap-3 hover:bg-slate-700/50 transition-all overflow-hidden">
                            {photoPreview ? (
                                <Image src={photoPreview} alt="Preview" fill className="object-cover opacity-50" />
                            ) : null}
                            <Camera className="text-slate-400 group-hover:text-blue-400" size={20} />
                            <span className="text-sm font-bold text-slate-400 group-hover:text-slate-200">Fotó csatolása</span>
                            <input type="file" name="photo" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
                        </div>
                    </label>

                    {/* Időtartam Választó */}
                    <div className="grid grid-cols-4 gap-2">
                        {[15, 30, 60, 120].map(min => (
                            <div 
                                key={min} 
                                onClick={() => setSelectedDuration(min === selectedDuration ? null : min)}
                                className={`cursor-pointer py-3 rounded-xl text-center text-xs font-bold transition-all border ${
                                    selectedDuration === min 
                                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/50' 
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                }`}
                            >
                                {min}p
                                {selectedDuration === min && <input type="hidden" name="duration" value={min} />}
                            </div>
                        ))}
                    </div>

                    <SubmitButton label="Parkolás Indítása" icon={Check} variant="primary" />
                </form>
            )}
        </div>
    )
}