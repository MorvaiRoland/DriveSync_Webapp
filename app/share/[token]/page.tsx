import { createClient } from 'supabase/server'
import { notFound } from 'next/navigation'
import { 
    CheckCircle2, Calendar, Gauge, Fuel, Wrench, ShieldCheck, 
    MapPin, Phone, Zap, Info, ArrowUpRight, Share2, Star
} from 'lucide-react'
import CarGallery from '@/components/CarGallery'
import ServiceAccordion from '@/components/ServiceAccordion' // ÚJ IMPORT

// ... (formatPrice, formatDate, glassCardStyle maradhat a régiben)
const formatPrice = (price: number | null) => {
    if (!price) return 'Ár megegyezés szerint'
    return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price)
}

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' })
}

const glassCardStyle = "bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl"

export default async function SharedCarPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const supabase = await createClient()

    const { data: car } = await supabase
        .from('marketplace_view')
        .select('*')
        .eq('share_token', token)
        .eq('is_for_sale', true)
        .single()

    if (!car) return notFound()

    let allImages: string[] = []
    if (car.image_url) allImages.push(car.image_url)
    if (car.sale_images && Array.isArray(car.sale_images)) {
        car.sale_images.forEach((img: string) => {
            if (img !== car.image_url) allImages.push(img)
        })
    }

    // LEKÉRDEZZÜK A LEÍRÁST IS A LISTÁHOZ
    const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('car_id', car.id)
        .order('event_date', { ascending: false })

    const displayPlate = car.hide_sensitive ? '******' : car.plate
    const displayVin = car.hide_sensitive ? '*****************' : car.vin

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-indigo-500 selection:text-white pb-20 overflow-x-hidden relative">
            
            {/* HÁTTÉR */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]"></div>
            </div>

            {/* NAVBAR - JAVÍTOTT SZÖVEGES LOGÓ */}
            <div className="sticky top-4 z-50 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl h-16 flex items-center justify-between px-6 shadow-2xl shadow-black/20">
                        
                        {/* SZÖVEGES LOGÓ (Kép helyett) */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-black text-lg text-white shadow-lg shadow-indigo-500/30">
                                D
                            </div>
                            <span className="font-bold text-xl tracking-tight text-white hidden sm:block">
                                Dynamic<span className="text-indigo-400">Sense</span>
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                                <CheckCircle2 className="w-3 h-3" /> Ellenőrzött
                            </span>
                            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-slate-300 hover:text-white">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
                
                {/* HERO SZEKCIÓ (Változatlan) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                    <div className="lg:col-span-8 space-y-6">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-2">
                                {car.make} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{car.model}</span>
                            </h1>
                            <div className="flex items-center gap-4 text-slate-400 font-medium">
                                <span>{car.year}</span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                <span>{car.fuel_type}</span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                <span>{car.mileage?.toLocaleString()} km</span>
                            </div>
                        </div>
                        <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 bg-[#1a1f2e]">
                            <CarGallery images={allImages} carModel={`${car.make} ${car.model}`} />
                        </div>
                    </div>

                    <div className="lg:col-span-4 lg:pt-24">
                        <div className={`${glassCardStyle} p-6 md:p-8 sticky top-24`}>
                            <div className="mb-8">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Vételár</p>
                                {!car.hide_prices ? (
                                    <p className="text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-lg">
                                        {formatPrice(car.price)}
                                    </p>
                                ) : (
                                    <p className="text-2xl font-bold text-white">Megállapodás szerint</p>
                                )}
                            </div>
                            <div className="space-y-3">
                                {car.seller_phone ? (
                                    <a href={`tel:${car.seller_phone}`} className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black hover:bg-slate-200 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98]">
                                        <Phone className="w-5 h-5" />
                                        Hívás
                                    </a>
                                ) : (
                                    <button disabled className="w-full py-4 bg-white/10 text-slate-400 rounded-xl font-bold cursor-not-allowed border border-white/5">
                                        Nincs telefonszám
                                    </button>
                                )}
                                <button className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all">
                                    <Info className="w-5 h-5" />
                                    Üzenet
                                </button>
                            </div>
                            <div className="mt-8 pt-6 border-t border-white/10">
                                {car.location && (
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Megtekinthető</p>
                                            <p className="font-bold text-white">{car.location}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="text-xs text-slate-500 flex gap-2 items-center">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    DynamicSense Verified System
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <GlassStat label="Évjárat" value={car.year} />
                            <GlassStat label="Futás" value={`${car.mileage?.toLocaleString()} km`} highlight />
                            <GlassStat label="Teljesítmény" value={car.performance_hp || '-'} sub="LE" />
                            <GlassStat label="Műszaki" value={car.mot_expiry ? new Date(car.mot_expiry).getFullYear() : '-'} />
                        </div>

                        {car.description && (
                            <div className={`${glassCardStyle} p-8`}>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Leírás
                                </h3>
                                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap font-light text-base">
                                    {car.description}
                                </p>
                            </div>
                        )}

                        <div className={`${glassCardStyle} overflow-hidden`}>
                            <div className="p-6 border-b border-white/5">
                                <h3 className="text-lg font-bold text-white">Specifikáció</h3>
                            </div>
                            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
                                <div className="p-6 space-y-4">
                                    <SpecRow label="Márka" value={car.make} />
                                    <SpecRow label="Modell" value={car.model} />
                                    <SpecRow label="Kivitel" value={car.body_type || '-'} />
                                    <SpecRow label="Szín" value={car.color || '-'} />
                                    <SpecRow label="Motor" value={car.engine_size ? `${car.engine_size} cm³` : '-'} />
                                </div>
                                <div className="p-6 space-y-4">
                                    <SpecRow label="Üzemanyag" value={car.fuel_type} />
                                    <SpecRow label="Váltó" value={car.transmission === 'manual' ? 'Manuális' : car.transmission || '-'} />
                                    <SpecRow label="Műszaki vizsga" value={formatDate(car.mot_expiry)} />
                                    {!car.hide_sensitive && (
                                        <>
                                            <div className="h-px bg-white/5 my-2"></div>
                                            <SpecRow label="Rendszám" value={displayPlate} badge />
                                            <SpecRow label="Alvázszám" value={displayVin} mono />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {car.features && car.features.length > 0 && (
                            <div className={`${glassCardStyle} p-8`}>
                                <h3 className="text-lg font-bold text-white mb-4">Felszereltség</h3>
                                <div className="flex flex-wrap gap-2">
                                    {car.features.map((feature: string, idx: number) => (
                                        <span key={idx} className="px-3 py-1.5 bg-white/5 text-slate-200 rounded-lg text-sm font-medium border border-white/5 hover:bg-white/10 transition-colors">
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- SZERVIZ ACCORDION (ÚJ) --- */}
                        <div className={`${glassCardStyle} p-8`}>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Wrench className="w-5 h-5 text-indigo-400" /> Szerviztörténet
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Ellenőrzött
                                </div>
                            </div>

                            {/* Itt hívjuk meg az új komponenst */}
                            <ServiceAccordion 
                                events={events} 
                                hidePrices={car.hide_prices} 
                                hideServiceCosts={car.hide_service_costs} 
                            />
                        </div>

                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <div className={`${glassCardStyle} p-6 relative overflow-hidden group`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12" />
                            <h4 className="font-bold text-lg mb-2 flex items-center gap-2 text-white relative z-10">
                                TIPP VÁSÁRLÓKNAK
                            </h4>
                            <p className="text-slate-300 text-sm leading-relaxed mb-4 relative z-10">
                                A biztonság az első. Mindig ellenőrizd az autó adatait a hivatalos állami nyilvántartásban is (JSZP).
                            </p>
                            <a href="https://szuf.magyarorszag.hu/" target="_blank" className="relative z-10 text-xs font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2.5 rounded-xl inline-flex items-center gap-2 transition-all">
                                JSZP Lekérdezés <ArrowUpRight className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

// --- STAT KOMPONENS ---
function GlassStat({ label, value, sub, highlight }: any) {
    return (
        <div className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${highlight ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/5'}`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">{label}</span>
            <span className={`text-lg md:text-xl font-bold ${highlight ? 'text-indigo-300' : 'text-white'}`}>{value}</span>
            {sub && <span className="text-[10px] font-medium text-slate-500">{sub}</span>}
        </div>
    )
}

function SpecRow({ label, value, badge, mono }: any) {
    if (!value) return null
    return (
        <div className="flex justify-between items-center group">
            <span className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors">{label}</span>
            {badge ? (
                <span className="font-bold text-slate-900 bg-slate-200 px-2.5 py-0.5 rounded text-sm">{value}</span>
            ) : (
                <span className={`font-medium text-slate-100 ${mono ? 'font-mono tracking-widest' : ''}`}>{value}</span>
            )}
        </div>
    )
}