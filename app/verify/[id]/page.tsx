import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ShieldCheck, Calendar, Gauge, Fuel, ArrowRight, Zap, Settings, Tag, History, Wrench, Info } from 'lucide-react'

export const revalidate = 0

export default async function VerifyPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const carId = params.id;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Adatlekérés (Autó + CSAK SZERVIZ események)
  const [carRes, historyRes] = await Promise.all([
    supabaseAdmin
      .from('cars')
      .select('*')
      .eq('id', carId)
      .single(),
    supabaseAdmin
      .from('events')
      .select('id, event_date, title, mileage, cost, type, location, description') // 'liters' eltávolítva
      .eq('car_id', carId)
      .eq('type', 'service') // SZŰRÉS: Csak a szerviz típusú események
      .order('event_date', { ascending: false })
  ])

  const car = carRes.data
  const serviceHistory = historyRes.data || []

  if (!car) return notFound()

  // --- ADAT ELŐKÉSZÍTÉS ---
  const engineInfo = car.engine_details 
    ? car.engine_details 
    : (car.engine_size ? `${car.engine_size} ccm` : '-');
  
  const powerInfo = car.power_hp ? `${car.power_hp} LE` : '-';
  const transmissionInfo = car.transmission || '-';

  const DataCard = ({ icon, label, value }: any) => (
      <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl flex items-center gap-4 hover:bg-slate-800/60 transition-colors">
          <div className="p-2.5 bg-slate-700/50 rounded-xl text-emerald-400">
              {icon}
          </div>
          <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">{label}</div>
              <div className="text-base font-bold text-white leading-tight">{value || '-'}</div>
          </div>
      </div>
  )

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden pb-10">
        <div className="fixed inset-0 pointer-events-none hidden sm:block">
            <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-indigo-600/5 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-emerald-600/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative max-w-3xl mx-auto px-2 sm:px-4 py-8 sm:py-16" style={{ paddingTop: 'calc(env(safe-area-inset-top, 1rem) + 2.5rem)' }}>
            <div className="text-center mb-10 sm:mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-700/50 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 sm:mb-8 backdrop-blur-md shadow-md">
                    <ShieldCheck className="w-3.5 h-3.5" /> DynamicSense Hitelesített
                </div>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-3 sm:mb-4 tracking-tighter text-white">
                    Jármű Előélet <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Jelentés</span>
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm md:text-base font-mono">
                    Lekérdezés ideje: {new Date().toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>

            {/* 1. FŐ ADATLAP */}
            <div className="relative rounded-2xl sm:rounded-[2.5rem] overflow-hidden bg-gradient-to-b from-slate-900 to-[#0F131F] border border-slate-800 shadow-lg sm:shadow-2xl mb-10 sm:mb-20 p-4 sm:p-8 md:p-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6 mb-8 sm:mb-12 border-b border-slate-800 pb-6 sm:pb-8">
                    <div>
                        <div className="text-slate-400 font-mono text-xs sm:text-sm tracking-widest mb-1 sm:mb-2 uppercase flex items-center gap-2">
                            {car.make} <span className="w-1 h-1 rounded-full bg-slate-600"></span> {car.year}
                        </div>
                        <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-2 sm:mb-4">
                            {car.model}
                        </h2>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-2 sm:px-3 py-1 rounded-lg border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase">
                                <CheckCircle2 className="w-3 h-3" /> Aktív Rendszerben
                            </div>
                            <div className="inline-flex items-center gap-2 bg-slate-800 px-2 sm:px-3 py-1 rounded-lg text-slate-300 text-xs font-mono font-bold tracking-widest uppercase border border-slate-700">
                                {car.plate}
                            </div>
                        </div>
                    </div>
                    {!car.hide_sensitive && (
                        <div className="bg-slate-950 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 text-right">
                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Alvázszám (VIN)</div>
                            <div className="font-mono text-base sm:text-lg text-emerald-400 font-bold tracking-widest">{car.vin}</div>
                        </div>
                    )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                    <DataCard icon={<Calendar className="w-5 h-5" />} label="Évjárat" value={car.year} />
                    <DataCard icon={<Gauge className="w-5 h-5" />} label="Futásteljesítmény" value={`${car.mileage.toLocaleString()} km`} />
                    <DataCard icon={<Fuel className="w-5 h-5" />} label="Üzemanyag" value={car.fuel_type} />
                    <DataCard icon={<Settings className="w-5 h-5" />} label="Motor" value={engineInfo} />
                    <DataCard icon={<Zap className="w-5 h-5" />} label="Teljesítmény" value={powerInfo} />
                    <DataCard icon={<Tag className="w-5 h-5" />} label="Váltó" value={transmissionInfo} />
                    <DataCard icon={<Tag className="w-5 h-5" />} label="Kivitel" value={car.body_type} />
                    <DataCard icon={<Calendar className="w-5 h-5" />} label="Műszaki Érvényes" value={car.mot_expiry || 'Nincs adat'} />
                </div>
            </div>

            {/* 2. SZERVIZTÖRTÉNET (TIMELINE) */}
            <div className="max-w-2xl sm:max-w-3xl mx-auto">
                <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-16 justify-center">
                    <div className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent to-slate-800"></div>
                    <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-3">
                        <History className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-500" /> Digitális Szervizkönyv
                    </h3>
                    <div className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent to-slate-800"></div>
                </div>

                <div className="relative pl-4 sm:pl-8 md:pl-0">
                    <div className="absolute left-0 sm:left-1/2 top-0 bottom-0 w-px bg-slate-800 sm:-translate-x-1/2"></div>
                    <div className="space-y-8 sm:space-y-12">
                        {serviceHistory.length > 0 ? (
                            serviceHistory.map((event: any, i: number) => {
                                const isLeft = i % 2 === 0;
                                const date = new Date(event.event_date);
                                const hideCosts = car.hide_service_costs || car.hide_prices || false;
                                return (
                                    <div key={i} className={`relative flex flex-col sm:flex-row items-start sm:items-center w-full ${isLeft ? 'sm:flex-row-reverse' : ''}`}>
                                        <div className="absolute left-[-5px] sm:left-1/2 sm:-translate-x-1/2 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] z-10 border-2 border-[#0B0F19]"></div>
                                        <div className="hidden sm:block w-1/2"></div>
                                        <div className={`w-full sm:w-1/2 pl-4 sm:pl-0 ${isLeft ? 'sm:pr-6 md:pr-10' : 'sm:pl-6 md:pl-10'}`}>
                                            <div className="bg-[#131722] border border-slate-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl hover:border-slate-700 transition-all shadow-md sm:shadow-xl group relative overflow-hidden">
                                                <div className="flex justify-between items-start mb-2 sm:mb-3">
                                                    <div>
                                                        <div className="text-xs font-mono text-slate-500 mb-0.5 sm:mb-1">
                                                            {date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </div>
                                                        <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                            {event.title}
                                                        </h4>
                                                    </div>
                                                    <div className="bg-slate-900 px-2 py-1 rounded text-[10px] font-mono font-bold text-slate-300 border border-slate-800">
                                                        {event.mileage.toLocaleString()} km
                                                    </div>
                                                </div>
                                                <div className="space-y-1 sm:space-y-2">
                                                    {event.description && (
                                                        <div className="flex gap-2 sm:gap-3 text-xs sm:text-sm text-slate-400">
                                                            <Wrench className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                                                            <p className="leading-relaxed text-xs">{event.description}</p>
                                                        </div>
                                                    )}
                                                    {!hideCosts && event.cost > 0 && (
                                                        <div className="pt-1 sm:pt-2 mt-1 sm:mt-2 border-t border-slate-800/50 flex justify-end">
                                                            <div className="text-xs font-bold text-emerald-500">
                                                                {event.cost.toLocaleString()} Ft
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center py-8 sm:py-12 bg-slate-900/30 rounded-xl sm:rounded-2xl border border-slate-800">
                                <p className="text-slate-500 italic">Ehhez az autóhoz még nem rögzítettek publikus szerviz eseményt.</p>
                            </div>
                        )}
                        <div className="relative flex flex-col items-center pt-6 sm:pt-8">
                            <div className="absolute left-[-5px] sm:left-1/2 sm:-translate-x-1/2 w-3 h-3 rounded-full bg-slate-700 z-10 border-2 border-[#0B0F19]"></div>
                            <div className="pl-4 sm:pl-0 sm:text-center mt-2">
                                <div className="text-xs text-slate-600 uppercase tracking-widest font-bold">Rendszerbe regisztrálva</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center pt-10 sm:pt-16 mt-10 sm:mt-20 border-t border-slate-800/50">
                <Link href="/" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-500 hover:text-emerald-400 transition-colors bg-emerald-500/10 px-3 sm:px-4 py-2 rounded-full border border-emerald-500/20">
                    Hitelesítve a DynamicSense által <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    </div>
  )
}