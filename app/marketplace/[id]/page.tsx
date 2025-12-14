import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Gauge, Fuel, Info, Phone, ShieldCheck } from 'lucide-react'

// Mivel ez dinamikus oldal (mindig más autó), nem cache-elünk erősen
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>
}

export default async function PublicCarAdPage(props: Props) {
  const params = await props.params
  const supabase = await createClient()

  // Lekérjük az autót, DE csak ha eladó és listázva van!
  // Így, ha valaki beírja egy privát autód ID-ját, 404-et kap.
  const { data: car } = await supabase
    .from('marketplace_view')
    .select('*')
    .eq('car_id', params.id)
    .eq('is_for_sale', true)            // Biztonsági szűrő
    .eq('is_listed_on_marketplace', true) // Biztonsági szűrő
    .single()

  if (!car) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">A hirdetés nem elérhető</h1>
            <p className="text-slate-500 mb-4">Lehet, hogy az autót eladták, vagy levették a piactérről.</p>
            <Link href="/marketplace" className="text-blue-600 hover:underline">Vissza a piactérre</Link>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] pb-20">
        
        {/* FELSŐ SÁV */}
        <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 p-4">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <Link href="/marketplace" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-500 font-bold text-sm transition-colors">
                    <ArrowLeft size={18} /> Vissza a találatokhoz
                </Link>
                <div className="text-xs font-bold bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full border border-emerald-500/20">
                    Ellenőrzött hirdetés
                </div>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* BAL OSZLOP: KÉPEK (Nagyobb helyet kap: 8 col) */}
            <div className="lg:col-span-8 space-y-6">
                <div className="relative h-80 md:h-[500px] w-full bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                    {car.main_image ? (
                        <Image src={car.main_image} alt={car.brand} fill className="object-cover" priority />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 flex-col gap-2">
                             <ShieldCheck size={40} className="opacity-20"/>
                             <span>Nincs feltöltött kép</span>
                        </div>
                    )}
                </div>

                {/* Leírás doboz */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Info size={20} className="text-blue-500"/> Az eladó leírása
                    </h2>
                    <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                        {car.description || 'Az eladó nem adott meg részletes leírást.'}
                    </div>
                </div>
            </div>

            {/* JOBB OSZLOP: ADATOK & KAPCSOLAT (Kisebb hely, de sticky: 4 col) */}
            <div className="lg:col-span-4">
                <div className="sticky top-24 space-y-6">
                    
                    {/* Fő Infó Kártya */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-blue-900/5">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
                            {car.brand} <span className="font-normal text-slate-500">{car.model}</span>
                        </h1>
                        
                        <div className="flex items-center gap-2 text-slate-500 mb-6 text-sm font-medium">
                            <MapPin size={16} className="text-amber-500"/> {car.location || 'Helyszín nincs megadva'}
                        </div>

                        <div className="mb-6">
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Vételár</p>
                             <p className="text-4xl font-black text-emerald-500 tracking-tight">
                                {car.price ? `${Number(car.price).toLocaleString()} Ft` : 'Megegyezés szerint'}
                             </p>
                        </div>

                        {/* Gyors adatok */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="text-slate-400 text-[10px] uppercase font-bold mb-1 flex items-center gap-1"><Calendar size={10}/> Évjárat</div>
                                <div className="font-bold text-slate-900 dark:text-white">{car.year}</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="text-slate-400 text-[10px] uppercase font-bold mb-1 flex items-center gap-1"><Gauge size={10}/> Km óra</div>
                                <div className="font-bold text-slate-900 dark:text-white">{car.mileage ? `${(car.mileage/1000).toFixed(0)}k km` : '-'}</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="text-slate-400 text-[10px] uppercase font-bold mb-1 flex items-center gap-1"><Fuel size={10}/> Üzemanyag</div>
                                <div className="font-bold text-slate-900 dark:text-white">{car.fuel_type}</div>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2">
                            <Phone size={20} /> Kapcsolatfelvétel
                        </button>
                    </div>

                    {/* Biztonsági Tipp */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                        <h4 className="font-bold text-amber-700 dark:text-amber-500 text-sm mb-1 flex items-center gap-2">
                            <ShieldCheck size={16}/> Vásárlói tipp
                        </h4>
                        <p className="text-xs text-amber-600/80 dark:text-amber-500/70 leading-relaxed">
                            Soha ne utalj előre pénzt! Találkozzatok nyilvános helyen és vizsgáld át az autót személyesen.
                        </p>
                    </div>

                </div>
            </div>

        </div>
    </div>
  )
}