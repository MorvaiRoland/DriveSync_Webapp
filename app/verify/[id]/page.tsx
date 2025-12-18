import { createClient } from '@supabase/supabase-js' // Direkt import, hogy használhassuk a Service Role-t
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ShieldCheck, Calendar, Gauge, Fuel, ArrowRight, Zap, Settings, Tag, History, Wrench, Info } from 'lucide-react'

// Statikus oldal, de minden kérésnél frissüljön az adat
export const revalidate = 0

export default async function VerifyPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const carId = params.id;

  // FONTOS: Admin jogú kliens létrehozása CSAK ehhez a lekéréshez
  // Ez átmegy az RLS-en, így biztosan visszakapod az adatokat a publikus nézetben is
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Ez a titkos kulcs a .env.local-ban
  )

  // 1. Adatlekérés (Autó + Szervizek)
  const [carRes, historyRes] = await Promise.all([
    supabaseAdmin
      .from('cars')
      .select('*')
      .eq('id', carId)
      .single(),
    supabaseAdmin
      .from('events')
      .select('id, event_date, title, mileage, cost, type, notes, location, description')
      .eq('car_id', carId)
      .order('event_date', { ascending: false })
  ])

  const car = carRes.data
  const serviceHistory = historyRes.data || []

  if (!car) return notFound()

  // --- ADAT ELŐKÉSZÍTÉS ---
  // Motor adat kombinálása
  const engineInfo = car.engine_details 
    ? car.engine_details 
    : (car.engine_size ? `${car.engine_size} ccm` : '-');
  
  const powerInfo = car.power_hp 
    ? `${car.power_hp} LE` 
    : '-';

  const transmissionInfo = car.transmission || '-';

  // Helper komponens a kis adatblokkokhoz
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
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden pb-20">
      
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-indigo-600/5 rounded-full blur-[150px]"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-emerald-600/5 rounded-full blur-[150px]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-16">
        
        {/* FEJLÉC & STÁTUSZ */}
        <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/50 border border-slate-700/50 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md shadow-lg">
                <ShieldCheck className="w-3.5 h-3.5" /> DynamicSense Hitelesített
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-white">
                Jármű Előélet <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Jelentés</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base font-mono">
                Lekérdezés ideje: {new Date().toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>

        {/* 1. FŐ ADATLAP (KÉP NÉLKÜL, CSAK ADATOK) */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-b from-slate-900 to-[#0F131F] border border-slate-800 shadow-2xl mb-20 p-8 md:p-12">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-slate-800 pb-8">
                <div>
                    <div className="text-slate-400 font-mono text-sm tracking-widest mb-2 uppercase flex items-center gap-2">
                        {car.make} <span className="w-1 h-1 rounded-full bg-slate-600"></span> {car.year}
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-4">
                        {car.model}
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase">
                            <CheckCircle2 className="w-3 h-3" /> Aktív Rendszerben
                        </div>
                        <div className="inline-flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-lg text-slate-300 text-xs font-mono font-bold tracking-widest uppercase border border-slate-700">
                            {car.plate}
                        </div>
                    </div>
                </div>
                
                {/* VIN Kártya (ha publikus) */}
                {!car.hide_sensitive && (
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Alvázszám (VIN)</div>
                        <div className="font-mono text-lg text-emerald-400 font-bold tracking-widest">{car.vin}</div>
                    </div>
                )}
            </div>

            {/* ADAT GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-6 mb-16 justify-center">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-slate-800"></div>
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                    <History className="w-6 h-6 text-emerald-500" /> 
                    Digitális Szervizkönyv
                </h3>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-slate-800"></div>
            </div>

            <div className="relative pl-8 md:pl-0">
                {/* Függőleges vonal */}
                <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-slate-800 md:-translate-x-1/2"></div>

                <div className="space-y-12">
                    {serviceHistory.length > 0 ? (
                        serviceHistory.map((event: any, i: number) => {
                            const isLeft = i % 2 === 0;
                            const date = new Date(event.event_date);
                            const hideCosts = car.hide_service_costs || car.hide_prices || false;

                            return (
                                <div key={i} className={`relative flex flex-col md:flex-row items-start md:items-center w-full ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                                    
                                    {/* Pötty a vonalon */}
                                    <div className="absolute left-[-5px] md:left-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10 border-2 border-[#0B0F19]"></div>

                                    {/* Üres térfél (Desktopon) */}
                                    <div className="hidden md:block w-1/2"></div>

                                    {/* Kártya */}
                                    <div className={`w-full md:w-1/2 pl-8 md:pl-0 ${isLeft ? 'md:pr-10' : 'md:pl-10'}`}>
                                        <div className="bg-[#131722] border border-slate-800 p-5 rounded-2xl hover:border-slate-700 transition-all shadow-xl group relative overflow-hidden">
                                            
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <div className="text-xs font-mono text-slate-500 mb-1">
                                                        {date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </div>
                                                    <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                        {event.title}
                                                    </h4>
                                                </div>
                                                <div className="bg-slate-900 px-2 py-1 rounded text-[10px] font-mono font-bold text-slate-300 border border-slate-800">
                                                    {event.mileage.toLocaleString()} km
                                                </div>
                                            </div>

                                            {/* Tartalom */}
                                            <div className="space-y-2">
                                                {event.description && (
                                                    <div className="flex gap-3 text-sm text-slate-400">
                                                        <Wrench className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                                                        <p className="leading-relaxed text-xs">{event.description}</p>
                                                    </div>
                                                )}
                                                {event.notes && (
                                                    <div className="flex gap-3 text-xs text-slate-500 italic bg-slate-900/30 p-2 rounded border border-slate-800/30">
                                                        <Info className="w-3 h-3 text-slate-600 mt-0.5 flex-shrink-0" />
                                                        <p>"{event.notes}"</p>
                                                    </div>
                                                )}
                                                
                                                {!hideCosts && event.cost > 0 && (
                                                    <div className="pt-2 mt-2 border-t border-slate-800/50 flex justify-end">
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
                        <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800">
                            <p className="text-slate-500 italic">Ehhez az autóhoz még nem rögzítettek publikus eseményt.</p>
                        </div>
                    )}
                    
                    {/* Kezdőpont */}
                    <div className="relative flex flex-col items-center pt-8">
                         <div className="absolute left-[-5px] md:left-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full bg-slate-700 z-10 border-2 border-[#0B0F19]"></div>
                         <div className="pl-8 md:pl-0 md:text-center mt-2">
                            <div className="text-xs text-slate-600 uppercase tracking-widest font-bold">Rendszerbe regisztrálva</div>
                         </div>
                    </div>
                </div>
            </div>
        </div>

        {/* FOOTER */}
        <div className="text-center pt-16 mt-20 border-t border-slate-800/50">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-500 hover:text-emerald-400 transition-colors bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                Hitelesítve a DynamicSense által <ArrowRight className="w-4 h-4" />
            </Link>
        </div>

      </div>
    </div>
  )
}