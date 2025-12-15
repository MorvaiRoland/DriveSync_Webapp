import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Calendar, Gauge, Fuel, MapPin, 
  CheckCircle2, ArrowRight, Smartphone, 
  LogIn, UserPlus, Lock, ShieldCheck
} from 'lucide-react'
import ServiceHistoryList from '@/components/ServiceHistoryList' // Feltételezzük, hogy ez a komponens létezik
import ImageGallery from '@/components/ImageGallery'           // Feltételezzük, hogy ez a komponens létezik
import ShareButton from '@/components/ShareButton'             // A korábban megírt gomb

// Gyorsítótárazás beállítása (ISR) - 60 másodpercig tárolja a szerver
export const revalidate = 60

export default async function PublicSharedAdPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const carId = params.id;
  const supabase = await createClient()

  // --- ADATLEKÉRÉS ---
  // 1. Autó adatok (Marketplace view)
  const { data: car } = await supabase
    .from('marketplace_view')
    .select('*')
    .eq('id', carId)
    .single()

  // 2. Szerviztörténet (Limitált lekérés, csak demonstrációra)
  const { data: serviceHistory } = await supabase
    .from('events')
    .select('*')
    .eq('car_id', carId)
    .eq('type', 'service') 
    .order('event_date', { ascending: false })
    .limit(3) // Csak az utolsó 3 eseményt kérjük le előnézetnek

  if (!car) return notFound()

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-500 selection:text-white pb-20">
      
      {/* --- 1. PUBLIKUS FEJLÉC (Navigation) --- */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo és Brand */}
            <Link href="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                    D
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                    DynamicSense
                </span>
            </Link>

            {/* CTA Gombok */}
            <div className="flex items-center gap-3 sm:gap-4">
                <Link href="/login" className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <LogIn className="w-4 h-4" />
                    Belépés
                </Link>
                <Link href="/register" className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Fiók létrehozása</span>
                    <span className="sm:hidden">Regisztráció</span>
                </Link>
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* --- 2. MARKETING BANNER --- */}
        <div className="mb-10 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-1 shadow-2xl shadow-blue-900/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white dark:bg-slate-900 rounded-[1.3rem] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left relative overflow-hidden">
                {/* Háttér dekoráció */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10 flex items-center gap-5">
                    <div className="hidden sm:flex h-16 w-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl items-center justify-center flex-shrink-0">
                        <Smartphone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
                            Ez egy megosztott jármű adatlap
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
                            A DynamicSense alkalmazással nyomon követheted autóid szerviztörténetét és biztonságosan adhatsz-vehetsz.
                        </p>
                    </div>
                </div>
                
                <Link 
                    href="/register" 
                    className="whitespace-nowrap px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 group relative z-10"
                >
                    App kipróbálása ingyen
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>

        {/* --- 3. FŐ TARTALOM (Autó adatok) --- */}
        
        {/* Fejléc: Cím és Ár */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {car.body_type || 'Személyautó'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {car.location || 'Helyszín nincs megadva'}
                    </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                    {car.make} <span className="text-blue-600 dark:text-blue-500">{car.model}</span>
                </h1>
                <p className="text-lg text-slate-500 font-medium">
                    {car.version}
                </p>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-3">
                 {car.hide_prices ? (
                    <div className="text-3xl font-black text-slate-900 dark:text-white">Megegyezés szerint</div>
                ) : (
                    <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                        {formatPrice(car.price)}
                    </div>
                )}
                <ShareButton title={`${car.make} ${car.model}`} carId={carId} />
            </div>
        </div>

        {/* Galéria */}
        <div className="relative aspect-[16/9] bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl mb-12 border border-slate-200 dark:border-slate-800">
             <ImageGallery mainImage={car.image_url} alt={`${car.make} ${car.model}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* BAL OSZLOP (Adatok) - 8 egység */}
            <div className="lg:col-span-8 space-y-10">
                
                {/* 4 Fő Adat Kártya */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <PublicSpecBox icon={<Calendar className="text-blue-500" />} label="Évjárat" value={car.year} />
                    <PublicSpecBox icon={<Gauge className="text-amber-500" />} label="Futás" value={`${car.mileage?.toLocaleString()} km`} />
                    <PublicSpecBox icon={<Fuel className="text-emerald-500" />} label="Üzemanyag" value={car.fuel_type || '-'} />
                    <PublicSpecBox icon={<CheckCircle2 className="text-purple-500" />} label="Állapot" value={car.condition || 'Normál'} />
                </div>

                {/* Leírás */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <span className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-lg">📝</span> 
                        Részletes leírás
                    </h3>
                    <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {car.ad_description || car.description || 'Az eladó nem adott meg részletes leírást.'}
                    </div>
                </div>

                {/* Szervizkönyv Előnézet (Teaser) */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative group">
                    <div className="flex items-center justify-between mb-8">
                         <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-lg">🔧</span> 
                            Digitális Szervizkönyv
                        </h3>
                        <div className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Ellenőrzött rendszer
                        </div>
                    </div>

                    {/* Elhomályosított lista */}
                    <div className="relative">
                        <div className="mask-gradient-bottom">
                            <ServiceHistoryList events={serviceHistory || []} hideCosts={true} />
                        </div>
                        
                        {/* Overlay CTA - Regisztrációs felhívás */}
                        <div className="absolute inset-x-0 bottom-0 top-12 bg-gradient-to-b from-white/60 via-white/95 to-white dark:from-slate-900/60 dark:via-slate-900/95 dark:to-slate-900 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6 rounded-xl border border-white/20">
                            <div className="w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center mb-4 shadow-xl">
                                <Lock className="w-5 h-5" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                A teljes előélet védett adat
                            </h4>
                            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto text-sm">
                                Jelentkezz be ingyenesen a részletes szerviztörténet, a dátumok és a dokumentumok megtekintéséhez.
                            </p>
                            <Link href="/register" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-blue-600/20">
                                Ingyenes regisztráció
                            </Link>
                            <p className="mt-4 text-xs text-slate-400">
                                Már van fiókod? <Link href="/login" className="text-blue-600 font-bold hover:underline">Belépés</Link>
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* JOBB OSZLOP (Sticky CTA) - 4 egység */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* Kapcsolat Box */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-xl lg:sticky lg:top-24">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Érdekel az autó?</h3>
                    <p className="text-sm text-slate-500 mb-6">Lépj kapcsolatba az eladóval biztonságosan.</p>
                    
                    {/* Elrejtett telefonszám vizualizáció */}
                    <div className="space-y-4 mb-6 relative">
                        {/* Fake adatok elhomályosítva */}
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 opacity-50 blur-[2px] select-none">
                            <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                            <div className="space-y-2 w-full">
                                <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-1/2"></div>
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                            </div>
                        </div>

                        {/* Lock Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-sm">
                                <Lock className="w-3 h-3 text-slate-400" />
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Elérhetőség rejtve</span>
                            </div>
                        </div>
                    </div>

                    <Link href="/login" className="block w-full py-3.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl transition-colors text-center shadow-lg">
                        Belépés a telefonszámhoz
                    </Link>
                    
                    <div className="mt-4 text-center">
                        <p className="text-xs text-slate-400">
                            Nincs még fiókod? <Link href="/register" className="text-blue-500 font-bold hover:underline">Regisztrálj 1 perc alatt.</Link>
                        </p>
                    </div>
                </div>

                {/* App Promo Box */}
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] p-6 border border-blue-100 dark:border-blue-900/30 text-center">
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Miért a DynamicSense?</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2 mb-4 text-left px-2">
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            Hiteles digitális szervizkönyv
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            Valós idejű költségkövetés
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            Biztonságos adás-vétel
                        </li>
                    </ul>
                </div>

            </div>
        </div>
      </main>

      {/* --- 4. FOOTER --- */}
      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-slate-900 text-center">
         <p className="text-slate-500 font-bold text-sm">DynamicSense Marketplace</p>
         <p className="text-slate-400 text-xs mt-2">© {new Date().getFullYear()} Minden jog fenntartva.</p>
      </footer>
    </div>
  )
}

// Segéd komponens a kártyákhoz
function PublicSpecBox({ icon, label, value }: { icon: any, label: string, value: string | number }) {
    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center gap-2 h-28">
            <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-full [&>svg]:w-5 [&>svg]:h-5">
                {icon}
            </div>
            <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">{label}</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{value}</div>
            </div>
        </div>
    )
}