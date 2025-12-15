import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Calendar, Gauge, Fuel, MapPin, 
  CheckCircle2, ArrowRight, Download, Smartphone 
} from 'lucide-react'
import ServiceHistoryList from '@/components/ServiceHistoryList'
import ImageGallery from '@/components/ImageGallery'

// Fontos: Ez az oldal legyen cache-elhető, de frissüljön gyakran (vagy 0 a valós idejűhöz)
export const revalidate = 60 

export default async function PublicSharedAdPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const carId = params.id;
  const supabase = await createClient()

  // Lekérjük az autót (publikus nézet)
  const { data: car } = await supabase
    .from('marketplace_view')
    .select('*')
    .eq('id', carId)
    .single()

  // Szervizek
  const { data: serviceHistory } = await supabase
    .from('events')
    .select('*')
    .eq('car_id', carId)
    .eq('type', 'service') 
    .order('event_date', { ascending: false })
    .limit(3) // Csak az utolsó 3-at mutatjuk kedvcsinálónak

  if (!car) return notFound()

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* 1. PUBLIKUS FEJLÉC (MARKETING) */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo helye */}
            <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tighter text-slate-900 dark:text-white">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">D</div>
                DynamicSense
            </Link>

            <div className="flex items-center gap-4">
                <span className="hidden sm:inline text-sm text-slate-500 font-medium">Van fiókod?</span>
                <Link href="/login" className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
                    Belépés
                </Link>
                <Link href="/register" className="hidden sm:flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
                    Regisztráció
                </Link>
            </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* MARKETING BANNER: "Ez egy megosztott autó" */}
        <div className="mb-8 p-1 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient-x">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full">
                        <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-slate-900 dark:text-white">Töltsd le a DynamicSense alkalmazást!</h2>
                        <p className="text-sm text-slate-500">Kezeld szervizkönyvedet digitálisan és találd meg a legjobb autókat.</p>
                    </div>
                </div>
                <Link href="/register" className="whitespace-nowrap px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2">
                    <Download className="w-4 h-4" /> App kipróbálása
                </Link>
            </div>
        </div>

        {/* CÍM ÉS ÁR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">
                    {car.make} {car.model}
                </h1>
                <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                        {car.year}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                        {car.fuel_type}
                    </span>
                </div>
            </div>
            <div className="text-right">
                 {car.hide_prices ? (
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">Megegyezés szerint</div>
                ) : (
                    <div className="text-3xl md:text-4xl font-black text-blue-600 dark:text-blue-400">
                        {formatPrice(car.price)}
                    </div>
                )}
            </div>
        </div>

        {/* KÉPGALÉRIA */}
        <div className="relative aspect-[16/9] bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-xl mb-12">
             <ImageGallery mainImage={car.image_url} alt={`${car.make} ${car.model}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* BAL OSZLOP: Infók */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* GRID SPECIFIKÁCIÓK */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <PublicSpecBox icon={<Calendar />} label="Évjárat" value={car.year} />
                    <PublicSpecBox icon={<Gauge />} label="Futás" value={`${car.mileage?.toLocaleString()} km`} />
                    <PublicSpecBox icon={<Fuel />} label="Üzemanyag" value={car.fuel_type || '-'} />
                    <PublicSpecBox icon={<MapPin />} label="Helyszín" value={car.location || '-'} />
                </div>

                {/* LEÍRÁS */}
                <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Leírás</h3>
                    <p className="whitespace-pre-wrap leading-relaxed">
                        {car.ad_description || car.description || 'Nincs megadott leírás.'}
                    </p>
                </div>

                {/* SZERVIZKÖNYV KEDVCSINÁLÓ */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                            Digitális Szervizkönyv
                        </h3>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Előnézet</span>
                    </div>

                    <div className="relative mask-linear-fade">
                        <ServiceHistoryList events={serviceHistory || []} hideCosts={true} />
                    </div>

                    {/* OVERLAY CTA */}
                    <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white dark:from-slate-900 via-white/90 dark:via-slate-900/90 to-transparent flex flex-col items-center justify-end pb-8 text-center px-4">
                        <p className="font-bold text-slate-900 dark:text-white mb-2">
                            Kíváncsi vagy a teljes előéletre?
                        </p>
                        <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
                            A DynamicSense rendszerben részletesen nyomon követheted ennek az autónak a szervizeit.
                        </p>
                        <Link href="/register" className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
                            Teljes történet megtekintése <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* JOBB OSZLOP: Kapcsolat (Korlátozott) */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg sticky top-24">
                    <h3 className="font-bold text-lg mb-4">Érdekel ez az autó?</h3>
                    
                    {/* Kapcsolat gombok - REJTVE, HA NINCS BELÉPVE (opcionális, vagy mutasd) */}
                    <div className="space-y-3 blur-[2px] select-none pointer-events-none opacity-50 mb-4">
                        <div className="w-full h-12 bg-slate-100 rounded-xl"></div>
                        <div className="w-full h-12 bg-slate-100 rounded-xl"></div>
                    </div>

                    <div className="text-center">
                        <p className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                            A telefonszám megjelenítéséhez jelentkezz be!
                        </p>
                        <Link href="/login" className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
                            Belépés a kapcsolatfelvételhez
                        </Link>
                        <p className="mt-4 text-xs text-slate-400">
                            Ingyenes regisztráció mindössze 1 perc alatt.
                        </p>
                    </div>
                </div>

                {/* PROMO BOX */}
                <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl p-6 text-center">
                    <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Smartphone className="w-6 h-6 text-blue-500" />
                    </div>
                    <h4 className="font-bold mb-2">DynamicSense App</h4>
                    <p className="text-xs text-slate-500 mb-4">
                        Kezeld autóidat egy helyen, oszd meg a szervizkönyvet és adj el gyorsabban.
                    </p>
                    <Link href="/" className="text-blue-600 text-sm font-bold hover:underline">
                        Tudj meg többet &rarr;
                    </Link>
                </div>
            </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-8 mt-12 text-center">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} DynamicSense. Minden jog fenntartva.</p>
          <p className="text-slate-400 text-xs mt-2">Ez egy publikusan megosztott hirdetés.</p>
      </footer>
    </div>
  )
}

function PublicSpecBox({ icon, label, value }: any) {
    return (
        <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-center gap-2">
            <div className="text-slate-400 [&>svg]:w-5 [&>svg]:h-5">{icon}</div>
            <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">{label}</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[100px]">{value}</div>
            </div>
        </div>
    )
}