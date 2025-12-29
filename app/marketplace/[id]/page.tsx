import { createClient } from 'supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, MapPin, Calendar, Gauge, Fuel, 
  CheckCircle2, AlertTriangle, Zap, Settings, Info, CalendarClock, Scale, 
} from 'lucide-react'
import ContactButton from '@/components/ContactButton'
import ServiceHistoryList from '@/components/ServiceHistoryList'
import ShareButton from '@/components/ShareButton'     
import ImageGallery from '@/components/ImageGallery'   

export const revalidate = 0

export default async function AdDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const carId = params.id;
  const supabase = await createClient()

  // 1. ADATLEKÉRÉS
  const { data: car } = await supabase
    .from('marketplace_view')
    .select('*')
    .eq('id', carId)
    .single()

  // Szervizek lekérése
  const { data: serviceHistory } = await supabase
    .from('events')
    .select('*')
    .eq('car_id', carId)
    .eq('type', 'service') 
    .order('event_date', { ascending: false })

  if (!car) return notFound()

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-500 overflow-x-hidden relative">
      
      {/* NAVIGÁCIÓ (STICKY + NOTCH KEZELÉS) */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-2 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 sm:h-14 flex items-center justify-between">
            <Link 
                href="/marketplace" 
                className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors py-2"
            >
                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
                </div>
                <span>Vissza a listához</span>
            </Link>
            
            <ShareButton 
                title={`${car.make} ${car.model} - ${car.year}`} 
                carId={car.id} 
            />
        </div>
      </div>

      {/* SAFE AREA BOTTOM PADDING */}
      <div className="pb-[calc(1.5rem+env(safe-area-inset-bottom))] px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
            {/* --- BAL OLDAL --- */}
            <div className="lg:col-span-8 space-y-8 sm:space-y-10 order-2 lg:order-1">
                {/* GALÉRIA */}
                <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full bg-slate-200 dark:bg-slate-800 rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
                    <ImageGallery 
                        mainImage={car.image_url} 
                        images={((car as any).images as string[]) || []} 
                        alt={`${car.make} ${car.model}`}
                    />
                </div>
                
                {/* Specifikáció kártyák - Mobilon 2 oszlop, Tableten 4 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <SpecCard icon={<Calendar className="text-blue-500" />} label="Évjárat" value={car.year} />
                    <SpecCard icon={<Gauge className="text-amber-500" />} label="Futás" value={`${car.mileage?.toLocaleString()} km`} />
                    <SpecCard icon={<Fuel className="text-emerald-500" />} label="Üzemanyag" value={car.fuel_type || '-'} />
                    <SpecCard icon={<MapPin className="text-red-500" />} label="Helyszín" value={car.location || 'Nincs megadva'} />
                </div>
                
                {/* Technikai Adatok */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <span className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-lg">⚙️</span> 
                        Technikai Adatok
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-y-6 gap-x-12">
                        <DetailRow label="Motor űrtartalom" value={car.engine_size ? `${car.engine_size} cm³` : '-'} icon={<Settings className="w-4 h-4"/>} />
                        <DetailRow label="Teljesítmény" value={car.power_hp ? `${car.power_hp} LE` : '-'} icon={<Zap className="w-4 h-4"/>} />
                        <DetailRow label="Sebességváltó" value={car.transmission || '-'} icon={<Gauge className="w-4 h-4"/>} />
                        <DetailRow label="Szín" value={car.color || '-'} icon={<Info className="w-4 h-4"/>} />
                        
                        {!car.hide_sensitive && (
                            <>
                                <DetailRow label="Rendszám" value={car.plate} icon={<Info className="w-4 h-4"/>} isMono />
                                <DetailRow label="Alvázszám (VIN)" value={car.vin} icon={<Info className="w-4 h-4"/>} isMono />
                            </>
                        )}
                        
                        {car.mot_expiry && (
                            <DetailRow label="Műszaki érvényes" value={new Date(car.mot_expiry).toLocaleDateString('hu-HU')} icon={<CalendarClock className="w-4 h-4"/>} />
                        )}
                    </div>
                </div>

                {/* Felszereltség */}
                {car.features && car.features.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-lg">✨</span> 
                            Felszereltség
                        </h3>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {car.features.map((feature: string, idx: number) => (
                                <span key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                                    {feature}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Leírás */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <span className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-lg">📝</span> 
                        Az eladó leírása
                    </h3>
                    <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                        {car.ad_description || car.description || (
                            <span className="text-slate-400 italic">Az eladó nem adott meg részletes leírást ehhez a járműhöz.</span>
                        )}
                    </div>
                </div>
                
                {/* Szervizkönyv */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-lg">🔧</span> 
                            Digitális Szervizkönyv
                        </h3>
                        <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20 uppercase tracking-wide flex items-center gap-1.5 w-fit">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Hitelesített
                        </div>
                    </div>

                    <div className="relative pl-2 sm:pl-4 border-l-2 border-slate-100 dark:border-slate-800 sm:ml-2">
                        <ServiceHistoryList 
                            events={serviceHistory || []} 
                            hideCosts={car.hide_service_costs} 
                        />
                    </div>
                    
                    {car.hide_service_costs && (
                        <div className="mt-6 text-center text-xs text-slate-400 italic">
                            * A szervizköltségeket az eladó elrejtette.
                        </div>
                    )}
                </div>
            </div>

            {/* --- JOBB OLDAL (Ár & Kapcsolat) --- */}
            <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
                <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-xl lg:sticky lg:top-24">
                    <div className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-6">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-2">
                            {car.make} <span className="text-slate-500 font-medium">{car.model}</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 font-mono font-bold tracking-wide">
                            ID: {car.id ? car.id.toString() : '...'}
                        </p>
                    </div>

                    <div className="mb-8">
                        <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Irányár</p>
                        {car.hide_prices ? (
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Megegyezés szerint</h2>
                        ) : (
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                                {car.price ? formatPrice(car.price) : '-'}
                            </h2>
                        )}
                    </div>

                    <div className="space-y-4">
                        <ContactButton 
                            phone={car.seller_phone || car.contact_phone} 
                            email={car.email} 
                        />
                        
                        {car.exchange_possible && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2 border border-blue-100 dark:border-blue-800">
                                <Scale className="w-4 h-4" /> Csere / Beszámítás lehetséges
                            </div>
                        )}

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl text-xs text-amber-800 dark:text-amber-200 space-y-2 border border-amber-100 dark:border-amber-900/20">
                            <div className="flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                <p className="leading-snug font-medium">Soha ne utalj előre pénzt! Találkozz személyesen az eladóval és vizsgáld át az autót alaposan.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

function SpecCard({ icon, label, value }: { icon: any, label: string, value: string | number }) {
    return (
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center gap-2 sm:gap-3 group">
            <div className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl group-hover:scale-110 transition-transform duration-300 [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6">
                {icon}
            </div>
            <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 sm:mb-1 tracking-wide">{label}</p>
                <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate w-full px-1">{value}</p>
            </div>
        </div>
    )
}

function DetailRow({ label, value, icon, isMono }: { label: string, value: string | number, icon: any, isMono?: boolean }) {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
            <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm">
                {icon}
                <span>{label}</span>
            </div>
            <span className={`font-bold text-slate-900 dark:text-white text-xs sm:text-sm text-right ${isMono ? 'font-mono tracking-wide' : ''}`}>
                {value}
            </span>
        </div>
    )
}