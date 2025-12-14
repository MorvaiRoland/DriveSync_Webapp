import { createClient } from 'supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { 
    CheckCircle2, Calendar, Gauge, Fuel, Wrench, ShieldCheck, 
    FileText, MapPin, Phone, RefreshCcw, CarFront, Zap, 
    Info, Share2, AlertTriangle, ArrowRight 
} from 'lucide-react'

// Pénznem formázó
const formatPrice = (price: number | null) => {
    if (!price) return 'Ár megegyezés szerint'
    return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price)
}

// Dátum formázó
const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function SharedCarPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const supabase = await createClient()

    // 1. Autó lekérése (csak ha eladó)
    const { data: car } = await supabase
        .from('marketplace_view')
        .select('*')
        .eq('share_token', token)
        .eq('is_for_sale', true)
        .single()

    if (!car) return notFound()

    // 2. Események (Szervizkönyv)
    const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('car_id', car.id)
        .order('event_date', { ascending: false })

    // Adatvédelem
    const displayPlate = car.hide_sensitive ? '******' : car.plate
    const displayVin = car.hide_sensitive ? '*****************' : car.vin

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
            
            {/* --- HERO SZEKCIÓ --- */}
            <div className="relative h-[50vh] md:h-[60vh] bg-slate-900 w-full overflow-hidden">
                {car.image_url ? (
                    <Image src={car.image_url} alt={`${car.make} ${car.model}`} fill className="object-cover opacity-90" priority />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <CarFront className="w-32 h-32 text-slate-700" />
                    </div>
                )}
                
                {/* Gradient Overlay a szöveg alá */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full container mx-auto px-4 pb-8 md:pb-12">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/90 backdrop-blur-md text-white rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-lg">
                                <CheckCircle2 className="w-3 h-3" /> Ellenőrzött DynamicSense Előélet
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white mb-2 drop-shadow-lg tracking-tight">
                                {car.make} <span className="text-emerald-400">{car.model}</span>
                            </h1>
                            <div className="flex items-center gap-4 text-slate-300 font-medium">
                                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {car.year}</span>
                                <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                                <span className="flex items-center gap-1.5"><Gauge className="w-4 h-4" /> {car.mileage?.toLocaleString()} km</span>
                                <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                                <span className="flex items-center gap-1.5"><Fuel className="w-4 h-4" /> {car.fuel_type}</span>
                            </div>
                        </div>

                        {/* Ár Mobilon (Desktopon oldalt lesz) */}
                        <div className="md:hidden">
                            {!car.hide_prices && (
                                <div className="text-3xl font-bold text-white bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                                    {formatPrice(car.price)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- TARTALOM --- */}
            <div className="container mx-auto px-4 py-8 -mt-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* BAL OLDAL (Fő tartalom) - 8 oszlop */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* 1. Gyors Statisztikák Grid */}
                        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatBox icon={Calendar} label="Évjárat" value={car.year} />
                            <StatBox icon={Gauge} label="Futás" value={`${car.mileage?.toLocaleString()} km`} highlight />
                            <StatBox icon={Zap} label="Teljesítmény" value={car.power_hp ? `${car.power_hp} LE` : '-'} />
                            <StatBox icon={ShieldCheck} label="Műszaki" value={car.mot_expiry ? new Date(car.mot_expiry).getFullYear() : '-'} />
                        </div>

                        {/* 2. Leírás (Ha van) */}
                        {car.description && (
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-indigo-500" /> Az eladó leírása
                                </h3>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {car.description}
                                </p>
                            </div>
                        )}

                        {/* 3. Részletes Adatok */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-500" /> Jármű adatok
                            </h3>
                            <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                                <SpecRow label="Márka" value={car.make} />
                                <SpecRow label="Modell" value={car.model} />
                                <SpecRow label="Kivitel" value={car.body_type || '-'} />
                                <SpecRow label="Szín" value={car.color || '-'} />
                                <div className="border-t border-slate-100 my-2 md:col-span-2"></div>
                                <SpecRow label="Motor" value={car.engine_size ? `${car.engine_size} cm³` : '-'} />
                                <SpecRow label="Üzemanyag" value={car.fuel_type} />
                                <SpecRow label="Váltó" value={car.transmission || '-'} />
                                <SpecRow label="Teljesítmény" value={car.power_hp ? `${car.power_hp} LE` : '-'} />
                                <div className="border-t border-slate-100 my-2 md:col-span-2"></div>
                                {!car.hide_sensitive && (
                                    <>
                                        <SpecRow label="Rendszám" value={displayPlate} isBadge />
                                        <SpecRow label="Alvázszám (VIN)" value={displayVin} isMono />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* 4. Digitális Szervizkönyv (Timeline) */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                                <Wrench className="w-5 h-5 text-indigo-500" /> Szerviztörténet
                            </h3>
                            
                            <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
                                {events && events.length > 0 ? (
                                    events.map((ev: any) => (
                                        <div key={ev.id} className="relative pl-8">
                                            {/* Timeline Pötty */}
                                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center 
                                                ${ev.type === 'service' ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                                                <h4 className="font-bold text-slate-800 text-lg">{ev.title}</h4>
                                                <span className="text-xs font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded">
                                                    {formatDate(ev.event_date)}
                                                </span>
                                            </div>

                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                <div className="flex flex-wrap items-center gap-4 text-sm mb-2 text-slate-600 font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <Gauge className="w-4 h-4 text-slate-400" /> {ev.mileage.toLocaleString()} km
                                                    </span>
                                                    {!car.hide_prices && ev.cost > 0 && (
                                                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                                            {formatPrice(ev.cost)}
                                                        </span>
                                                    )}
                                                </div>
                                                {ev.notes && <p className="text-slate-500 text-sm">{ev.notes}</p>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-slate-400 italic">Nincs rögzített esemény ebben az időszakban.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* JOBB OLDAL (Sidebar) - 4 oszlop */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-8 space-y-6">
                            
                            {/* ELADÓ KÁRTYA */}
                            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-indigo-900/5 border border-indigo-50 overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
                                
                                {!car.hide_prices ? (
                                    <div className="mb-6">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Vételár</p>
                                        <p className="text-4xl font-black text-slate-900 tracking-tight">{formatPrice(car.price)}</p>
                                    </div>
                                ) : (
                                    <div className="mb-6">
                                         <p className="text-2xl font-bold text-slate-900">Ár megegyezés szerint</p>
                                         <p className="text-sm text-slate-500">Hívd az eladót az árért!</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {car.seller_phone ? (
                                        <a href={`tel:${car.seller_phone}`} className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]">
                                            <Phone className="w-5 h-5" />
                                            {car.seller_phone}
                                        </a>
                                    ) : (
                                        <div className="text-center p-3 bg-slate-50 rounded-lg text-slate-500 text-sm italic">
                                            Nincs megadott telefonszám
                                        </div>
                                    )}

                                    {car.location && (
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                            <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase">Megtekinthető</p>
                                                <p className="text-slate-800 font-medium">{car.location}</p>
                                            </div>
                                        </div>
                                    )}

                                    {car.exchange_possible && (
                                        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                            <RefreshCcw className="w-4 h-4" />
                                            <span className="font-semibold">Autóbeszámítás lehetséges</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* BIZTONSÁGI INFO */}
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-sm space-y-3">
                                <div className="flex items-center gap-2 text-slate-800 font-bold">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                    Biztonságos vásárlás
                                </div>
                                <p className="text-slate-500 leading-snug">
                                    Ez az adatlap közvetlenül a <span className="font-bold">DynamicSense</span> rendszeréből származik. Az adatok manipulálhatatlanok és hitelesek.
                                </p>
                            </div>

                        </div>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="mt-20 py-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600">DynamicSense</span>
                        <span>•</span>
                        <span>Digitális Szervizkönyv</span>
                    </div>
                    <div>
                       Generálva: {new Date().toLocaleDateString('hu-HU')}
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- KISEBB UI KOMPONENSEK ---

function StatBox({ icon: Icon, label, value, highlight }: any) {
    return (
        <div className={`flex flex-col items-center justify-center p-4 rounded-xl text-center transition-all ${highlight ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-50 border border-slate-100'}`}>
            <Icon className={`w-6 h-6 mb-2 ${highlight ? 'text-indigo-600' : 'text-slate-400'}`} />
            <div className="text-xs font-bold text-slate-400 uppercase mb-0.5">{label}</div>
            <div className={`text-lg font-black ${highlight ? 'text-indigo-900' : 'text-slate-700'}`}>{value}</div>
        </div>
    )
}

function SpecRow({ label, value, isMono, isBadge }: any) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
            <span className="text-slate-500 font-medium">{label}</span>
            {isBadge ? (
                <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200 font-mono text-sm">{value}</span>
            ) : (
                <span className={`font-bold text-slate-900 ${isMono ? 'font-mono text-sm' : ''}`}>{value}</span>
            )}
        </div>
    )
}