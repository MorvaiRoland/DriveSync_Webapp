import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowLeft, MapPin, Calendar, Gauge, Fuel, 
  ShieldCheck, CheckCircle2, AlertTriangle, Share2, CarFront
} from 'lucide-react'
// JAVÍTÁS: Ellenőrizd, hogy a ContactButton hol van! Ha a components mappában:
import ContactButton from '@/components/ContactButton' 

export const revalidate = 0

// Next.js 15 kompatibilis params definíció
export default async function AdDetailsPage(props: { params: Promise<{ id: string }> }) {
  // 1. Params feloldása
  const params = await props.params;
  const carId = params.id;

  const supabase = await createClient()

  // 2. Adatlekérés
  const { data: car } = await supabase
    .from('marketplace_view')
    .select('*')
    .eq('id', carId)
    .single()

  // Ha nincs autó, vagy nem publikus, 404
  if (!car) {
    return notFound()
  }

  // 3. Ár formázó
  const formatPrice = (price: number) => 
    new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans">
      
      {/* --- NAVIGÁCIÓS SÁV --- */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link 
                href="/marketplace" 
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors py-2"
            >
                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <ArrowLeft className="w-4 h-4" /> 
                </div>
                <span>Vissza a listához</span>
            </Link>
            
            <button className="p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-full transition-all" title="Megosztás">
                <Share2 className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* --- BAL OLDAL: KÉPEK ÉS LEÍRÁS (8 col) --- */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* Fő Kép Galéria */}
            <div className="relative aspect-[16/9] w-full bg-slate-200 dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 group">
                {car.image_url ? (
                    <Image 
                        src={car.image_url} 
                        alt={`${car.make} ${car.model}`} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 flex-col gap-3 bg-slate-100 dark:bg-slate-900">
                        <CarFront className="w-16 h-16 opacity-20" />
                        <span className="font-bold text-sm opacity-50">Nincs feltöltött kép</span>
                    </div>
                )}
                
                {/* Badge */}
                <div className="absolute top-4 left-4">
                    <div className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-white/10 shadow-lg">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Ellenőrzött hirdetés
                    </div>
                </div>
            </div>

            {/* Specifikációk Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <SpecCard icon={<Calendar className="text-blue-500" />} label="Évjárat" value={car.year} />
                <SpecCard icon={<Gauge className="text-amber-500" />} label="Futásteljesítmény" value={`${car.mileage?.toLocaleString()} km`} />
                <SpecCard icon={<Fuel className="text-emerald-500" />} label="Üzemanyag" value={car.fuel_type || '-'} />
                <SpecCard icon={<MapPin className="text-red-500" />} label="Helyszín" value={car.location || 'Budapest'} />
            </div>

            {/* Leírás */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-lg">📝</span> 
                    Részletes Leírás
                </h3>
                <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-base">
                    {car.description || (
                        <span className="text-slate-400 italic">Az eladó nem adott meg részletes leírást ehhez a járműhöz.</span>
                    )}
                </div>
            </div>

            {/* Szerviztörténet Teaser */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20">
                {/* Háttér dekoráció */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-indigo-100 uppercase tracking-wider text-xs">DynamicSense Verified</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black mb-3 tracking-tight">Digitális Szervizkönyv</h3>
                        <p className="text-indigo-100 max-w-lg leading-relaxed text-sm md:text-base opacity-90">
                            Ez az autó rendelkezik a rendszerben vezetett, hitelesített előélettel. A kilométeróra állások és szervizek nyomon követhetők, így biztos lehetsz a vásárlásban.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* --- JOBB OLDAL: ÁR ÉS KAPCSOLAT (4 col) --- */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* Ár Kártya (Sticky) */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-xl lg:sticky lg:top-24">
                
                {/* Autó Neve */}
                <div className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-6">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight mb-2">
                        {car.make} <span className="text-slate-500 font-medium">{car.model}</span>
                    </h1>
                    <p className="text-sm text-slate-400 font-mono font-bold tracking-wide">
                        ID: {car.id ? car.id.toString().slice(0,8) : '...'}
                    </p>
                </div>

                {/* Ár */}
                <div className="mb-8">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Irányár</p>
                    {car.hide_prices ? (
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Megegyezés szerint</h2>
                    ) : (
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                            {car.price ? formatPrice(car.price) : '-'}
                        </h2>
                    )}
                </div>

                <div className="space-y-4">
                    {/* Kapcsolat Gomb */}
                    <ContactButton 
                        phone={car.contact_phone || car.seller_phone} 
                        email={car.email} 
                    />
                    
                    {/* Figyelmeztetés */}
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl text-xs text-amber-800 dark:text-amber-200 space-y-2 border border-amber-100 dark:border-amber-900/20">
                        <div className="flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                            <p className="leading-snug font-medium">Soha ne utalj előre pénzt! Találkozz személyesen az eladóval és vizsgáld át az autót alaposan.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold text-lg border border-white dark:border-slate-600 shadow-sm">
                            {car.make ? car.make[0] : 'U'}
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Hirdető</p>
                            <p className="font-bold text-slate-900 dark:text-white text-base">Tulajdonos</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  )
}

// Kis segédkomponens a specifikációkhoz (Szebb dizájn)
function SpecCard({ icon, label, value }: { icon: any, label: string, value: string | number }) {
    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center gap-3 group">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl group-hover:scale-110 transition-transform duration-300 [&>svg]:w-6 [&>svg]:h-6">
                {icon}
            </div>
            <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wide">{label}</p>
                <p className="font-bold text-slate-900 dark:text-white text-sm truncate w-full">{value}</p>
            </div>
        </div>
    )
}