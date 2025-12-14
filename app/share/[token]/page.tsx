import { createClient } from 'supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image' // Fontos import a logóhoz
import { 
    CheckCircle2, Calendar, Gauge, Fuel, Wrench, ShieldCheck, 
    MapPin, Phone, Zap, Info, ArrowUpRight, Share2
} from 'lucide-react'
import CarGallery from '@/components/CarGallery'

// --- SEGÉDFÜGGVÉNYEK ---
const formatPrice = (price: number | null) => {
    if (!price) return 'Ár megegyezés szerint'
    return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price)
}

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' })
}

export default async function SharedCarPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const supabase = await createClient()

    // 1. Autó lekérése
    const { data: car } = await supabase
        .from('marketplace_view')
        .select('*')
        .eq('share_token', token)
        .eq('is_for_sale', true)
        .single()

    if (!car) return notFound()

    // 2. Képek intelligens összefűzése
    let allImages: string[] = []
    
    // Fő kép hozzáadása
    if (car.image_url) {
        allImages.push(car.image_url)
    }

    // Galéria képek hozzáadása (duplikáció szűréssel)
    if (car.sale_images && Array.isArray(car.sale_images)) {
        car.sale_images.forEach((img: string) => {
            // Csak akkor adjuk hozzá, ha nem egyezik a fő képpel
            if (img !== car.image_url) {
                allImages.push(img)
            }
        })
    }

    // 3. Események lekérése
    const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('car_id', car.id)
        .order('event_date', { ascending: false })

    const displayPlate = car.hide_sensitive ? '******' : car.plate
    const displayVin = car.hide_sensitive ? '*****************' : car.vin

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
            
            {/* --- HEADER (Tiszta, csík nélküli) --- */}
            <div className="bg-white sticky top-0 z-40 shadow-sm"> 
                <div className="container mx-auto px-4 h-20 flex items-center justify-between max-w-7xl">
                    <div className="flex items-center gap-3">
                        {/* SAJÁT LOGÓ HELYE */}
                        {/* Tedd a logódat a 'public' mappába 'logo.png' néven */}
                        <div className="relative h-10 w-32 md:w-40 flex items-center">
                             <Image 
                                src="/DynamicSense-logo.png"  // Cseréld le a fájlnevet, ha más a neve
                                alt="Logo" 
                                width={160} 
                                height={40} 
                                className="object-contain object-left"
                                priority
                             />
                             {/* Fallback szöveg, ha még nincs kép (kivehető) */}
                             {/* <span className="font-bold text-xl ml-2">DynamicSense</span> */}
                        </div>
                        
                        <div className="hidden sm:flex items-center px-3 py-1 bg-slate-100 rounded-full">
                             <CheckCircle2 className="w-3 h-3 text-emerald-500 mr-1.5" />
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ellenőrzött Hirdetés</span>
                        </div>
                    </div>
                    
                    <button className="p-2.5 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors border border-transparent hover:border-slate-200">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                
                {/* --- 1. CÍMSOR SZEKCIÓ --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
                            {car.make} <span className="text-indigo-600">{car.model}</span>
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 font-medium text-lg">
                            <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-slate-400" /> {car.year}</span>
                            <span className="flex items-center gap-2"><Fuel className="w-5 h-5 text-slate-400" /> {car.fuel_type}</span>
                            <span className="flex items-center gap-2"><Gauge className="w-5 h-5 text-slate-400" /> {car.mileage?.toLocaleString()} km</span>
                        </div>
                    </div>

                    <div className="hidden md:block text-right">
                         {!car.hide_prices ? (
                            <>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Irányár</p>
                                <p className="text-4xl font-black text-slate-900 tracking-tight">{formatPrice(car.price)}</p>
                            </>
                        ) : (
                            <p className="text-2xl font-bold text-slate-900">Ár megegyezés szerint</p>
                        )}
                    </div>
                </div>

                {/* --- 2. GALÉRIA (Kliens komponens) --- */}
                <CarGallery images={allImages} carModel={`${car.make} ${car.model}`} />

                {/* --- 3. TARTALOM GRID --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-12 relative">
                    
                    {/* BAL OSZLOP (Adatok) */}
                    <div className="lg:col-span-8 space-y-12">
                        
                        {/* Kiemelt Adatok */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard label="Évjárat" value={car.year} sub="Gyártási év" />
                            <StatCard label="Futás" value={`${car.mileage?.toLocaleString()} km`} sub="Garantált" highlighted />
                            <StatCard label="Teljesítmény" value={car.performance_hp || '-'} sub="Lóerő (LE)" />
                            <StatCard label="Műszaki" value={car.mot_expiry ? new Date(car.mot_expiry).getFullYear() : '-'} sub="Érvényesség" />
                        </div>

                        {/* Leírás */}
                        {car.description && (
                            <section>
                                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-indigo-500" /> Leírás
                                </h3>
                                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="whitespace-pre-wrap">{car.description}</p>
                                </div>
                            </section>
                        )}

                        {/* Részletes Adatok Táblázat */}
                        <section>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Specifikáció</h3>
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                    <div className="p-6 md:p-8 space-y-5">
                                        <SpecItem label="Márka" value={car.make} />
                                        <SpecItem label="Modell" value={car.model} />
                                        <SpecItem label="Kivitel" value={car.body_type || '-'} />
                                        <SpecItem label="Szín" value={car.color || '-'} />
                                        <SpecItem label="Motor" value={car.engine_size ? `${car.engine_size} cm³` : '-'} />
                                    </div>
                                    <div className="p-6 md:p-8 space-y-5">
                                        <SpecItem label="Üzemanyag" value={car.fuel_type} />
                                        <SpecItem label="Váltó" value={car.transmission === 'manual' ? 'Manuális' : car.transmission || '-'} />
                                        <SpecItem label="Műszaki vizsga" value={formatDate(car.mot_expiry)} />
                                        
                                        {!car.hide_sensitive && (
                                            <>
                                                <div className="h-px bg-slate-100 my-4"></div>
                                                <SpecItem label="Rendszám" value={displayPlate} isBadge />
                                                <SpecItem label="Alvázszám (VIN)" value={displayVin} isMono />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Felszereltség */}
                        {car.features && car.features.length > 0 && (
                            <section>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Felszereltség</h3>
                                <div className="flex flex-wrap gap-2">
                                    {car.features.map((feature: string, idx: number) => (
                                        <span key={idx} className="px-4 py-2 bg-white text-slate-700 rounded-lg text-sm font-semibold border border-slate-200 shadow-sm">
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Szerviztörténet */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Wrench className="w-5 h-5 text-indigo-500" /> Szerviztörténet
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Hitelesített adatok
                                </div>
                            </div>
                            
                            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-2">
                                {events && events.length > 0 ? (
                                    events.map((ev: any) => (
                                        <div key={ev.id} className="relative pl-8 group">
                                            {/* Idővonal Pötty */}
                                            <div className={`absolute -left-[9px] top-1.5 w-[18px] h-[18px] rounded-full border-4 border-white shadow-sm z-10 
                                                ${ev.type === 'service' ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                                            </div>

                                            <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-lg leading-tight">{ev.title}</h4>
                                                        <p className="text-sm text-slate-500 mt-1 font-medium">{formatDate(ev.event_date)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg">
                                                            <Gauge className="w-3.5 h-3.5 text-slate-400" />
                                                            {ev.mileage.toLocaleString()} km
                                                        </div>
                                                        
                                                        {/* Költség elrejtése logika */}
                                                        {!car.hide_prices && !car.hide_service_costs && ev.cost > 0 && (
                                                            <div className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                                                                {formatPrice(ev.cost)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {ev.notes && (
                                                    <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-50 pt-3 mt-1">
                                                        {ev.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="pl-8 text-slate-500 italic py-4">Ehhez az autóhoz még nem rögzítettek publikus eseményt.</div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* JOBB OSZLOP (Sticky Sidebar) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-28 space-y-6">
                            
                            {/* KAPCSOLAT KÁRTYA */}
                            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8 relative overflow-hidden">
                                
                                {/* Ár (Desktop/Mobile egységesen) */}
                                <div className="mb-8">
                                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Vételár</p>
                                     {!car.hide_prices ? (
                                        <p className="text-4xl font-black text-slate-900 tracking-tight">{formatPrice(car.price)}</p>
                                     ) : (
                                        <p className="text-2xl font-bold text-slate-900">Megállapodás szerint</p>
                                     )}
                                </div>

                                <div className="space-y-3">
                                    {car.seller_phone ? (
                                        <a href={`tel:${car.seller_phone}`} className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
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
                                        Üzenet
                                    </button>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100">
                                    {car.location && (
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                <MapPin className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Megtekinthető</p>
                                                <p className="font-bold text-slate-900 text-lg">{car.location}</p>
                                            </div>
                                        </div>
                                    )}
                                    <p className="text-xs text-slate-400 leading-snug flex gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                        Az adatok közvetlenül a DynamicSense rendszeréből származnak.
                                    </p>
                                </div>
                            </div>

                            {/* Tipp Kártya */}
                            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12" />
                                <h4 className="font-bold text-lg mb-2 flex items-center gap-2 relative z-10">
                                    TIPP VÁSÁRLÓKNAK
                                </h4>
                                <p className="text-indigo-100 text-sm leading-relaxed mb-4 relative z-10">
                                    Használt autó vásárlásakor mindig ellenőrizd az előéletet hivatalos forrásból is.
                                </p>
                                <a href="https://szuf.magyarorszag.hu/" target="_blank" className="relative z-10 text-xs font-bold uppercase tracking-wider text-white bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg inline-flex items-center gap-1 transition-colors">
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

// --- KOMPONENSEK ---

function StatCard({ label, value, sub, highlighted }: any) {
    return (
        <div className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${highlighted ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-200'}`}>
            <span className="text-xs font-bold text-slate-400 uppercase mb-1">{label}</span>
            <span className={`text-xl md:text-2xl font-black ${highlighted ? 'text-indigo-900' : 'text-slate-800'}`}>{value}</span>
            {sub && <span className="text-[10px] font-medium text-slate-500 mt-1">{sub}</span>}
        </div>
    )
}

function SpecItem({ label, value, isMono, isBadge }: any) {
    if (!value) return null
    return (
        <div className="flex justify-between items-center group">
            <span className="text-slate-500 text-sm font-medium group-hover:text-slate-800 transition-colors">{label}</span>
            {isBadge ? (
                <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded text-sm border border-slate-200 font-mono tracking-wide">{value}</span>
            ) : (
                <span className={`font-bold text-slate-900 ${isMono ? 'font-mono text-sm tracking-wide' : 'text-base'}`}>{value}</span>
            )}
        </div>
    )
}