'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
// HOZZÁADTAM AZ 'AlertTriangle' IKONT AZ IMPORTOKHOZ:
import { MapPin, Camera, Navigation, X, Ban, Loader2, Clock, Check, Timer, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import { startParkingAction, stopParkingAction } from '@/app/parking/actions' 
import { useFormStatus } from 'react-dom'

// --- SEGÉD: Submit Gomb (Változatlan) ---
function SubmitButton({ label, icon: Icon, variant = 'primary', disabled }: any) {
  const { pending } = useFormStatus()
  
  const baseClass = "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-base border"
  
  const variants = {
    primary: "bg-blue-600 text-white border-blue-600 shadow-blue-500/25 hover:bg-blue-500",
    danger: "bg-red-600 text-white border-red-600 shadow-red-500/25 hover:bg-red-500",
  }

  return (
    <button 
      disabled={pending || disabled}
      type="submit" 
      className={`${baseClass} ${variants[variant as keyof typeof variants]}`}
    >
      {pending ? <Loader2 className="animate-spin h-6 w-6"/> : <Icon size={20} />}
      {label}
    </button>
  )
}

// --- SEGÉD: Időzítő Hook (Változatlan) ---
function useParkingTimer(startTime: string | null, expiresAt: string | null) {
    const [displayTime, setDisplayTime] = useState('Indítás...')
    const [isExpired, setIsExpired] = useState(false)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        if (!startTime) return;
        const update = () => {
            const now = new Date().getTime()
            const start = new Date(startTime).getTime()
            
            if (expiresAt) {
                const end = new Date(expiresAt).getTime()
                const total = end - start
                const current = now - start
                const percent = Math.min(100, Math.max(0, (current / total) * 100));
                
                setProgress(100 - percent);

                if (now > end) {
                    setIsExpired(true)
                    setDisplayTime("LEJÁRT")
                } else {
                    const diff = end - now
                    const h = Math.floor(diff / (1000 * 60 * 60))
                    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                    const s = Math.floor((diff % (1000 * 60)) / 1000)
                    setDisplayTime(`${h}:${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`)
                }
            } else {
                const diff = now - start
                const h = Math.floor(diff / (1000 * 60 * 60))
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                setDisplayTime(`${h}ó ${m}p`)
                setProgress(100)
            }
        }
        update() 
        const interval = setInterval(update, 1000)
        return () => clearInterval(interval)
    }, [startTime, expiresAt])

    return { displayTime, isExpired, progress }
}

// --- MODAL KOMPONENS (Változatlan) ---
function ParkingDetailsModal({ session, onClose, displayTime, isExpired, progress, isTemp, carId }: any) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = 'auto' }
    }, [])

    if (!mounted) return null;

    const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/${session.longitude},${session.latitude},16,0/600x400?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}`;

    return createPortal(
        <div className="fixed inset-0 z-[99999] isolate flex flex-col justify-end sm:justify-center">
            <div 
                className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="relative w-full sm:max-w-md mx-auto bg-white dark:bg-slate-900 sm:rounded-3xl rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-full duration-300 transition-colors">
                <div className="relative h-48 shrink-0 bg-slate-200 dark:bg-slate-800">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 bg-white/50 dark:bg-black/50 text-slate-900 dark:text-white p-2 rounded-full backdrop-blur border border-white/20 hover:bg-white/80 dark:hover:bg-black/70 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    {session.photo_url ? (
                        <Image src={session.photo_url} alt="Helyszín" fill className="object-cover" />
                    ) : (
                        <div 
                            className="absolute inset-0 bg-cover bg-center opacity-90 dark:opacity-70"
                            style={{ backgroundImage: `url('${mapUrl}')` }}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-6 right-6">
                        <h2 className="text-2xl font-bold text-white truncate drop-shadow-md">
                            {session.note || "Parkolóhely"}
                        </h2>
                        <div className="flex items-center gap-2 text-slate-200 text-xs font-mono mt-1">
                             <MapPin size={12} className="text-blue-400" />
                             {session.latitude.toFixed(5)}, {session.longitude.toFixed(5)}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 pt-2 pb-8 space-y-6 bg-white dark:bg-slate-900 transition-colors">
                    <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 opacity-50 sm:hidden" />
                    
                    {/* INFO BOX A MODALBAN IS */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 p-3 rounded-xl flex gap-3">
                         <AlertTriangle className="text-amber-600 dark:text-amber-500 shrink-0" size={18} />
                         <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                            A pontos időméréshez ne zárd be az alkalmazást, csak tedd háttérbe!
                         </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-colors shadow-sm dark:shadow-none">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">Hátralévő idő</span>
                            <Timer className="text-slate-400 dark:text-slate-600 w-4 h-4" />
                        </div>
                        <div className={`text-4xl font-mono font-bold tracking-tight mb-4 ${isExpired ? 'text-red-500' : 'text-slate-800 dark:text-emerald-400'}`}>
                            {displayTime}
                        </div>
                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 ${isExpired ? 'bg-red-500' : 'bg-blue-500 dark:bg-emerald-500'}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="space-y-3 pt-4">
                        <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${session.latitude},${session.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Navigation size={20} /> Útvonal (Google Maps)
                        </a>

                        <form action={async (formData) => {
                            formData.set('parking_id', session.id);
                            formData.set('car_id', carId);
                            await stopParkingAction(formData);
                            onClose();
                        }}>
                            <SubmitButton 
                                label={isTemp ? "Mentés alatt..." : "Parkolás Vége"} 
                                icon={Ban} 
                                variant="danger" 
                                disabled={isTemp}
                            />
                        </form>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}

// --- FŐ WIDGET (Light/Dark adaptív) ---
export default function SmartParkingWidget({ carId, activeSession }: { carId: string, activeSession: any }) {
    const [isLocating, setIsLocating] = useState(false)
    const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
    const [showStartForm, setShowStartForm] = useState(false)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
    
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [tempSession, setTempSession] = useState<any>(null);

    useEffect(() => {
        if (activeSession) setTempSession(null);
    }, [activeSession]);

    const currentSession = tempSession || activeSession;
    const { displayTime, isExpired, progress } = useParkingTimer(
        currentSession?.start_time || currentSession?.created_at, 
        currentSession?.expires_at
    );

    const handleGetLocation = () => {
        setIsLocating(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => { 
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); 
                setIsLocating(false); setShowStartForm(true); 
            },
            () => { alert('GPS hiba'); setIsLocating(false); }
        )
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; 
        if (file) setPhotoPreview(URL.createObjectURL(file));
    }

    const handleStartParking = async (formData: FormData) => {
        const d = formData.get('duration') ? parseInt(String(formData.get('duration'))) : null;
        const now = new Date();
        
        setTempSession({
            id: 'temp', car_id: carId, 
            latitude: parseFloat(String(formData.get('latitude'))),
            longitude: parseFloat(String(formData.get('longitude'))),
            note: String(formData.get('note') || ''),
            start_time: now.toISOString(),
            expires_at: d ? new Date(now.getTime() + d * 60000).toISOString() : null,
            photo_url: photoPreview
        });
        
        setShowStartForm(false); setLocation(null); setPhotoPreview(null);
        try { await startParkingAction(formData); } catch (e) { setTempSession(null); }
    }

    // --- RENDER ---
    
    // 1. AKTÍV PARKOLÁS KÁRTYA
    if (currentSession) {
        return (
            <>
                <div 
                    onClick={() => setIsDetailsOpen(true)}
                    className="relative w-full h-40 bg-slate-900 rounded-2xl overflow-hidden cursor-pointer border border-slate-200 dark:border-slate-800 shadow-lg group hover:border-blue-500 transition-all"
                >
                    <div 
                        className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700"
                        style={{ backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/${currentSession.longitude},${currentSession.latitude},15,0/600x300?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 p-4 w-full">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>
                            <span className="text-emerald-400 text-xs font-bold uppercase">Aktív Parkolás</span>
                        </div>
                        <h3 className="text-white font-bold text-lg truncate drop-shadow-sm">{currentSession.note || "Parkolóhely"}</h3>
                        <p className="text-slate-300 text-sm font-mono">{displayTime}</p>
                    </div>
                </div>

                {/* ÚJ: FIGYELMEZTETŐ BANNER A KÁRTYA ALATT */}
                <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-3 flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" size={18} />
                    <div className="text-xs text-amber-800 dark:text-amber-200">
                        <p className="font-bold mb-0.5">Fontos!</p>
                        Az értesítésekhez hagyd futni az alkalmazást a háttérben. Ha bezárod a lapot, az időzítő megállhat.
                    </div>
                </div>

                {isDetailsOpen && (
                    <ParkingDetailsModal 
                        session={currentSession}
                        onClose={() => setIsDetailsOpen(false)}
                        displayTime={displayTime}
                        isExpired={isExpired}
                        progress={progress}
                        isTemp={currentSession.id === 'temp'}
                        carId={carId}
                    />
                )}
            </>
        )
    }

    // 2. START FORM (ÜRES ÁLLAPOT)
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-lg transition-colors">
            {!showStartForm ? (
                <button 
                    onClick={handleGetLocation} 
                    disabled={isLocating}
                    className="w-full py-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-500 dark:hover:border-blue-500/50 transition-all group"
                >
                    {isLocating ? <Loader2 className="animate-spin text-blue-500 w-8 h-8"/> : (
                        <>
                            <div className="bg-blue-600/10 dark:bg-blue-600 p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                <MapPin className="text-blue-600 dark:text-white w-6 h-6" />
                            </div>
                            <span className="text-slate-600 dark:text-slate-300 font-bold">Parkolás Itt</span>
                        </>
                    )}
                </button>
            ) : (
                <form action={handleStartParking} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    {/* ... (A form többi része változatlan) ... */}
                    <div className="flex justify-between items-center text-slate-800 dark:text-white">
                        <span className="font-bold flex gap-2 items-center">
                            <Check size={18} className="text-emerald-500"/> Pozíció rögzítve
                        </span>
                        <button type="button" onClick={() => setShowStartForm(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <X size={20} className="text-slate-500 hover:text-slate-900 dark:hover:text-white"/>
                        </button>
                    </div>
                    
                    <input type="hidden" name="car_id" value={carId} />
                    <input type="hidden" name="latitude" value={location?.lat} />
                    <input type="hidden" name="longitude" value={location?.lng} />
                    
                    <div className="h-24 w-full rounded-xl bg-slate-100 dark:bg-slate-800 relative overflow-hidden border border-slate-200 dark:border-slate-700">
                         <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/${location?.lng},${location?.lat},16,0/600x200?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}')` }}
                        />
                    </div>

                    <input 
                        name="note" 
                        placeholder="Megjegyzés (pl. 2. emelet)" 
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-3 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400" 
                    />

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {[15, 30, 60, 120].map(m => (
                            <button 
                                key={m} type="button" 
                                onClick={() => setSelectedDuration(selectedDuration === m ? null : m)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap shadow-sm ${
                                    selectedDuration === m 
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/30' 
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                {m} perc
                            </button>
                        ))}
                         <input type="hidden" name="duration" value={selectedDuration || ''} />
                    </div>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-sm">
                        <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
                            <Camera className="text-slate-500 dark:text-slate-400" size={20}/>
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium flex-1">
                            {photoPreview ? 'Fotó cseréje' : 'Fotó készítése'}
                        </span>
                        <input type="file" name="photo" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
                        {photoPreview && (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 relative overflow-hidden border border-slate-200 dark:border-slate-600">
                                <Image src={photoPreview} fill alt="p" className="object-cover"/>
                            </div>
                        )}
                    </label>

                    <SubmitButton label="Mentés" icon={Check} />
                </form>
            )}
        </div>
    )
}