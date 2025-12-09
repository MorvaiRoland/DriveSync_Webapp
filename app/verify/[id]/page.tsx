// FILE: app/verify/[id]/page.tsx

import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import ServiceHistoryList from '@/components/ServiceHistoryList'

// Service Role kliens (RLS megkerüléséhez olvasáskor)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Props = {
  params: Promise<{ id: string }>
}

export default async function VerifyPage(props: Props) {
  const params = await props.params
  const { id } = params

  // 1. Autó lekérése (beleértve a kereskedelmi mezőket is, ha vannak)
  const { data: car } = await supabaseAdmin
    .from('cars')
    .select('*')
    .eq('id', id)
    .single()

  if (!car) return notFound()

  // 2. Csak a releváns, publikus események (szerviz, javítás)
  const { data: events } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('car_id', car.id)
    .in('type', ['service', 'repair', 'maintenance'])
    .order('event_date', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 pb-12">
      
      {/* --- FELSŐ SÁV (BRANDING) --- */}
      <div className="bg-slate-900 text-white py-4 px-6 shadow-md sticky top-0 z-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <span className="font-bold text-lg tracking-tight">Drive<span className="text-amber-500">Sync</span> Verified</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400 hidden sm:block">Digitális Járműútlevél</div>
      </div>

      <div className="max-w-3xl mx-auto -mt-0 sm:mt-6 p-0 sm:p-6">
        
        <div className="bg-white sm:rounded-3xl shadow-xl overflow-hidden border border-slate-200">
            
            {/* --- AUTÓ KÉP ÉS CÍM --- */}
            <div className="relative h-64 md:h-80 bg-slate-800">
                {car.image_url ? (
                    <Image src={car.image_url} alt={`${car.make} ${car.model}`} fill className="object-cover" priority />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <span className="text-slate-600 font-bold text-2xl">NINCS KÉP</span>
                    </div>
                )}
                
                {/* Átlátszó sáv a szövegnek */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
                    <div className="flex items-end justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                                {car.make} <span className="text-amber-500">{car.model}</span>
                            </h1>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-md font-mono font-bold text-sm tracking-wider">
                                    {car.plate}
                                </span>
                                {car.vin && (
                                    <span className="text-slate-400 text-xs font-mono flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        VIN: {car.vin}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- FŐ ADATOK RÁCS --- */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                <div className="p-4 text-center hover:bg-slate-50 transition-colors">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Futásteljesítmény</p>
                    <p className="text-lg sm:text-2xl font-black text-slate-900">{car.mileage.toLocaleString()} <span className="text-sm font-normal text-slate-500">km</span></p>
                </div>
                <div className="p-4 text-center hover:bg-slate-50 transition-colors">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Évjárat</p>
                    <p className="text-lg sm:text-2xl font-black text-slate-900">{car.year}</p>
                </div>
                <div className="p-4 text-center hover:bg-slate-50 transition-colors">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Üzemanyag</p>
                    <p className="text-lg sm:text-2xl font-black text-slate-900 capitalize">{car.fuel_type}</p>
                </div>
            </div>

            {/* --- KERESKEDŐI SZEKCIÓ (Csak ha van adat) --- */}
            {(car.price || (car.features && car.features.length > 0)) && (
                <div className="bg-slate-50 border-b border-slate-200 p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        
                        {/* ÁR ÉS MOTOR */}
                        <div className="flex-shrink-0">
                            {car.price && (
                                <div className="mb-3">
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Vételár</p>
                                    <p className="text-4xl font-black text-slate-900">{car.price.toLocaleString()} Ft</p>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-700">
                                {car.engine_details && (
                                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        {car.engine_details}
                                    </div>
                                )}
                                {car.performance_hp && (
                                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">
                                        <span className="text-slate-400">⚡</span>
                                        {car.performance_hp} LE
                                    </div>
                                )}
                                {car.transmission && (
                                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">
                                        <span className="text-slate-400">⚙️</span>
                                        {car.transmission}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* EXTRÁK */}
                        {car.features && car.features.length > 0 && (
                            <div className="flex-1 w-full md:w-auto">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-3 tracking-wider">Kiemelt Felszereltség</p>
                                <div className="flex flex-wrap gap-2">
                                    {car.features.map((feat: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                            {feat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="p-6 md:p-10 bg-white">
                
                {/* --- GARANTÁLT EREDET PECEÉT --- */}
                <div className="mb-10 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-4">
                    <div className="bg-emerald-100 p-2 rounded-full text-emerald-600 flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-emerald-900">Hitelesített Adatok</h3>
                        <p className="text-sm text-emerald-700/80 mt-1">
                            A jármű szerviztörténetét és futásteljesítményét a DriveSync rendszerében rögzítették. Az alábbi adatok megváltoztathatatlan digitális lenyomatok.
                        </p>
                    </div>
                </div>

                {/* --- SZERVIZTÖRTÉNET LISTA --- */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="bg-slate-900 text-white w-6 h-6 rounded flex items-center justify-center text-xs">H</span>
                        Szerviztörténet
                    </h2>
                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{events?.length || 0} bejegyzés</span>
                </div>

                {/* Itt hívjuk meg a javított listát */}
                <ServiceHistoryList events={events || []} />

            </div>

            {/* --- LÁBLÉC --- */}
            <div className="bg-slate-50 p-6 text-center border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-4 max-w-lg mx-auto">
                    Ez a dokumentum tájékoztató jellegű. A vásárlás előtt minden esetben győződjön meg az autó műszaki állapotáról személyesen vagy szakértő bevonásával.
                </p>
                <div className="flex items-center justify-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                    <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold">DS</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">DriveSync Technologies</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}