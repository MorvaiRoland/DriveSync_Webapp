import { createClient } from 'supabase/server' // Figyelj az import útvonalra!
import { notFound } from 'next/navigation'
import { 
    CheckCircle2, Calendar, Gauge, Fuel, Wrench, ShieldCheck, 
    FileText, MapPin, Phone, RefreshCcw, Zap, Info, ArrowUpRight
} from 'lucide-react'
import CarGallery from '@/components/CarGallery' // Az előbb létrehozott komponens

// --- SEGÉDFÜGGVÉNYEK ---
const formatPrice = (price: number | null) => {
    if (!price) return 'Ár megegyezés szerint'
    return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price)
}

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' }) // Csak hónapig elég
}

export default async function SharedCarPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const supabase = await createClient()

    // 1. Autó lekérése
    const { data: car } = await supabase
        .from('marketplace_view') // Győződj meg róla, hogy a view tartalmazza a 'sale_images' oszlopot!
        .select('*')
        .eq('share_token', token)
        .eq('is_for_sale', true)
        .single()

    if (!car) return notFound()

    // 2. Képek összerakása (sale_images tömb + alap kép fallback)
    // A Set kiszűri a duplikációkat
    const imageSet = new Set<string>()
    if (car.sale_images && Array.isArray(car.sale_images)) {
        car.sale_images.forEach((img: string) => imageSet.add(img))
    }
    if (car.image_url) imageSet.add(car.image_url)
    const allImages = Array.from(imageSet)

    // 3. Események
    const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('car_id', car.id)
        .order('event_date', { ascending: false })

    // Adatvédelem
    const displayPlate = car.hide_sensitive ? '******' : car.plate
    const displayVin = car.hide_sensitive ? '*****************' : car.vin

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20">
            
            {/* --- HEADER --- */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
                        <span className="font-bold text-slate-800 tracking-tight hidden sm:block">DynamicSense</span>
                        <span className="text-slate-300 mx-2 hidden sm:block">|</span>
                        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Ellenőrzött hirdetés</span>
                    </div>
                    {/* Ár mobilon headerben is, ha görgetünk (opcionális, most egyszerűsítve) */}
                </div>
            </div>

            <main className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
                
                {/* --- 1. CÍMSOR ÉS BADGE-EK --- */}
                <div className="mb-6 md:mb-8">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-100">
                            <CheckCircle2 className="w-3.5 h-3.5" /> DynamicSense Verified
                        </span>
                        {car.exchange_possible && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">
                                <RefreshCcw className="w-3.5 h-3.5" /> Csere / Beszámítás
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        {car.make} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{car.model}</span>
                    </h1>
                    <div className="flex items-center gap-4 text-slate-500 font-medium mt-2 text-lg">
                        <span>{car.year}</span>
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                        <span>{car.fuel_type}</span>
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                        <span>{car.mileage?.toLocaleString()} km</span>
                    </div>
                </div>

                {/* --- 2. GALÉRIA --- */}
                <CarGallery images={allImages} carModel={`${car.make} ${car.model}`} />

                {/* --- 3. LAYOUT (2 Oszlopos) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
                    
                    {/* BAL OLDAL (Leírás, Adatok, Szerviz) - 8 oszlop */}
                    <div className="lg:col-span-8 space-y-10">
                        
                        {/* Highlights Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FeatureCard icon={Calendar} label="Évjárat" value={car.year} />
                            <FeatureCard icon={Gauge} label="Futásteljesítmény" value={`${car.mileage?.toLocaleString()} km`} />
                            <FeatureCard icon={Zap} label="Teljesítmény" value={car.performance_hp ? `${car.performance_hp} LE` : '-'} />
                            <FeatureCard icon={Wrench} label="Utolsó szerviz" value={car.last_service_mileage ? `${car.last_service_mileage} km` : '-'} />
                        </div>

                        {/* Leírás */}
                        {car.description && (
                            <section>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Az eladó leírása</h3>
                                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="whitespace-pre-wrap">{car.description}</p>
                                </div>
                            </section>
                        )}

                        {/* Részletes Specifikáció */}
                        <section>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Részletes adatok</h3>
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                    <div className="p-6 space-y-4">
                                        <SpecItem label="Márka" value={car.make} />
                                        <SpecItem label="Modell" value={car.model} />
                                        <SpecItem label="Kivitel" value={car.body_type} />
                                        <SpecItem label="Szín" value={car.color} />
                                        <SpecItem label="Motor űrtartalom" value={car.engine_size ? `${car.engine_size} cm³` : null} />
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <SpecItem label="Üzemanyag" value={car.fuel_type} />
                                        <SpecItem label="Váltó" value={car.transmission} />
                                        <SpecItem label="Műszaki érvényes" value={formatDate(car.mot_expiry)} />
                                        {!car.hide_sensitive && (
                                            <>
                                                <SpecItem label="Rendszám" value={displayPlate} badge />
                                                <SpecItem label="Alvázszám" value={displayVin} mono />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Extrák (Ha van ilyen meződ) */}
                        {car.features && car.features.length > 0 && (
                            <section>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Felszereltség</h3>
                                <div className="flex flex-wrap gap-2">
                                    {car.features.map((feature: string, idx: number) => (
                                        <span key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Digitális Szerviztörténet */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Szerviztörténet</h3>
                                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Hitelesített adatok
                                </div>
                            </div>
                            
                            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-4">
                                {events && events.length > 0 ? (
                                    events.map((ev: any) => (
                                        <div key={ev.id} className="relative pl-8 group">
                                            {/* Pötty */}
                                            <div className={`absolute -left-[9px] top-1.5 w-[18px] h-[18px] rounded-full border-4 border-white shadow-sm transition-colors 
                                                ${ev.type === 'service' ? 'bg-indigo-600 group-hover:bg-indigo-500' : 'bg-slate-400'}`}>
                                            </div>

                                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-slate-900">{ev.title}</h4>
                                                        <p className="text-sm text-slate-500">{formatDate(ev.event_date)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                                            <Gauge className="w-3.5 h-3.5 text-slate-400" />
                                                            {ev.mileage.toLocaleString()} km
                                                        </span>
                                                        {/* Ár elrejtése logika */}
                                                        {!car.hide_prices && !car.hide_service_costs && ev.cost > 0 && (
                                                            <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                                                                {formatPrice(ev.cost)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {ev.notes && <p className="text-slate-600 text-sm mt-2 pt-2 border-t border-slate-100">{ev.notes}</p>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="pl-8 text-slate-500 italic">Ehhez az autóhoz még nem rögzítettek publikus eseményt.</div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* JOBB OLDAL (Sticky Sidebar) - 4 oszlop */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-6">
                            
                            {/* ÁR & KAPCSOLAT KÁRTYA */}
                            <div className="bg-white rounded-2xl shadow-xl shadow-indigo-900/5 border border-slate-100 overflow-hidden p-6 md:p-8">
                                <div className="mb-6">
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">Eladási ár</p>
                                    {!car.hide_prices ? (
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                                                {formatPrice(car.price)}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="text-2xl font-bold text-slate-900">Megállapodás szerint</div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {car.seller_phone ? (
                                        <a href={`tel:${car.seller_phone}`} className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]">
                                            <Phone className="w-5 h-5" />
                                            Hívás
                                        </a>
                                    ) : (
                                        <button disabled className="w-full py-4 bg-slate-100 text-slate-400 rounded-xl font-bold cursor-not-allowed">
                                            Nincs telefonszám
                                        </button>
                                    )}

                                    <button className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-bold transition-all">
                                        <Info className="w-5 h-5 text-slate-400" />
                                        Üzenet küldése (Hamarosan)
                                    </button>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                                    {car.location && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                                                <MapPin className="w-4 h-4 text-indigo-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase">Helyszín</p>
                                                <p className="font-semibold text-slate-800">{car.location}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        Az adatok hitelességét a DynamicSense garantálja.
                                    </div>
                                </div>
                            </div>

                            {/* Tipp Box */}
                            <div className="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-2xl p-6 text-white shadow-lg">
                                <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-400" /> TIPP
                                </h4>
                                <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                                    Vásárlás előtt mindig ellenőrizd az autó alvázszámát a hivatalos nyilvántartásban is.
                                </p>
                                <a href="https://szuf.magyarorszag.hu/" target="_blank" className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/30 hover:border-white pb-0.5 inline-flex items-center gap-1">
                                    JSZP Lekérdezés <ArrowUpRight className="w-3 h-3" />
                                </a>
                            </div>

                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}

// --- KISEBB KOMPONENSEK ---

function FeatureCard({ icon: Icon, label, value }: any) {
    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <Icon className="w-6 h-6 text-indigo-500 mb-2" />
            <span className="text-xs font-bold text-slate-400 uppercase mb-0.5">{label}</span>
            <span className="font-bold text-slate-800 text-lg truncate w-full">{value || '-'}</span>
        </div>
    )
}

function SpecItem({ label, value, mono, badge }: any) {
    if (!value) return null
    return (
        <div className="flex justify-between items-center">
            <span className="text-slate-500 text-sm font-medium">{label}</span>
            {badge ? (
                <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-sm border border-slate-200">{value}</span>
            ) : (
                <span className={`font-bold text-slate-900 ${mono ? 'font-mono text-sm' : ''}`}>{value}</span>
            )}
        </div>
    )
}