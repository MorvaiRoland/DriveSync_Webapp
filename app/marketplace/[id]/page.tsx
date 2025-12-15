import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft, MapPin, Calendar, Gauge, Fuel,
  ShieldCheck, CheckCircle2, AlertTriangle, Share2, CarFront,
  Wrench
} from 'lucide-react'
import ContactButton from '@/components/ContactButton'

export const revalidate = 0

export default async function AdDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const carId = params.id;
  const supabase = await createClient()

  // 1. Párhuzamos adatlekérés
  const [carRes, historyRes] = await Promise.all([
    supabase
      .from('marketplace_view')
      .select('*')
      .eq('id', carId)
      .single(),
    supabase
      .from('events')
      .select('id, event_date, title, mileage, cost, type, notes')
      .eq('car_id', carId)
      .eq('type', 'service')
      .order('event_date', { ascending: false })
  ])

  const car = carRes.data
  const serviceHistory = historyRes.data || []

  if (!car) return notFound()

  // Formázók
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans">

      {/* NAVIGÁCIÓ */}
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

        {/* --- BAL OLDAL (8 col) --- */}
        <div className="lg:col-span-8 space-y-10">

            {/* GALÉRIA */}
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

                <div className="absolute top-4 left-4">
                    <div className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-white/10 shadow-lg">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Ellenőrzött hirdetés
                    </div>
                </div>
            </div>

            {/* FŐ ADATOK */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <SpecCard icon={<Calendar className="text-blue-500" />} label="Évjárat" value={car.year} />
                <SpecCard icon={<Gauge className="text-amber-500" />} label="Futásteljesítmény" value={`${car.mileage?.toLocaleString()} km`} />
                <SpecCard icon={<Fuel className="text-emerald-500" />} label="Üzemanyag" value={car.fuel_type || '-'} />
                <SpecCard icon={<MapPin className="text-red-500" />} label="Helyszín" value={car.location || 'Budapest'} />
            </div>

            {/* --- FELSZERELTSÉG (EXTRÁK) --- */}
            {car.features && car.features.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <span className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-lg">✨</span>
                        Felszereltség & Extrák
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {car.features.map((feature: string, idx: number) => (
                            <span key={idx} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                {feature}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* LEÍRÁS */}
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

            {/* --- SZERVIZTÖRTÉNET (IDŐVONAL) --- */}
            {serviceHistory.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-lg">🔧</span>
                            Szerviztörténet
                        </h3>
                        <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20 uppercase tracking-wide flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Hitelesített
                        </div>
                    </div>

                    <div className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-8 ml-2">
                        {serviceHistory.map((event: any, index: number) => (
                            <div key={event.id} className="relative pl-6">
                                {/* Idővonal Pötty */}
                                <div className="absolute -left-[21px] top-1.5 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 bg-indigo-500 shadow-sm"></div>

                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                                        {event.title}
                                    </h4>
                                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded self-start sm:self-auto">
                                        {formatDate(event.event_date)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mb-2">
                                    <div className="flex items-center gap-1.5">
                                        <Gauge className="w-3.5 h-3.5 text-slate-400" />
                                        {event.mileage.toLocaleString()} km
                                    </div>
                                    {!car.hide_service_costs && event.cost > 0 && (
                                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                            <span>•</span>
                                            {formatPrice(event.cost)}
                                        </div>
                                    )}
                                </div>

                                {event.notes && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                        {event.notes}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {car.hide_service_costs && (
                        <div className="mt-6 text-center text-xs text-slate-400 italic">
                            * A szervizköltségeket az eladó elrejtette.
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* --- JOBB OLDAL (4 col) --- */}
        <div className="lg:col-span-4 space-y-6">

            {/* Ár Kártya */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-xl lg:sticky lg:top-24">
                <div className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-6">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight mb-2">
                        {car.make} <span className="text-slate-500 font-medium">{car.model}</span>
                    </h1>
                    <p className="text-sm text-slate-400 font-mono font-bold tracking-wide">
                        ID: {car.id ? car.id.toString().slice(0,8) : '...'}
                    </p>
                </div>

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
                    <ContactButton
                        phone={car.contact_phone || car.seller_phone}
                        email={car.email}
                    />

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