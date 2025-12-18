import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, ShieldCheck, Calendar, Gauge, Fuel, MapPin, ArrowRight, CarFront, Zap, Settings, Tag, FileText, History, Wrench, Info, Search } from 'lucide-react'

// Mivel ez server component, itt nem használunk 'use client'-et, kivéve ha interaktivitás kell.
// A timeline-t most statikusan rendereljük le a szerveren a legjobb teljesítményért.

export const revalidate = 0

export default async function VerifyPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const carId = params.id;
  const supabase = await createClient()

  // 1. Adatlekérés (Autó + Szervizek)
  const [carRes, historyRes] = await Promise.all([
    supabase
      .from('cars')
      .select('*')
      .eq('id', carId)
      .single(),
    supabase
      .from('events')
      .select('id, event_date, title, mileage, cost, type, notes, location, description')
      .eq('car_id', carId)
      .order('event_date', { ascending: false })
  ])

  const car = carRes.data
  const serviceHistory = historyRes.data || []

  if (!car) return notFound()

  // Helper komponens a kis adatblokkokhoz (inline definíció a server componentben)
  const DataCard = ({ icon, label, value }: any) => (
      <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-slate-700/50 rounded-lg text-slate-400">
              {icon}
          </div>
          <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{label}</div>
              <div className="text-sm font-bold text-white">{value || '-'}</div>
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

      <div className="relative max-w-6xl mx-auto px-4 py-20">
        
        {/* FEJLÉC & STÁTUSZ */}
        <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/50 border border-slate-700/50 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md shadow-lg">
                <ShieldCheck className="w-3.5 h-3.5" /> DynamicSense Verified
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-white">
                Jármű Előélet <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Jelentés</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base font-mono">
                Lekérdezés ideje: {new Date().toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>

        {/* AUTÓ FŐ ADATLAP */}
        <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-b from-slate-900 to-[#0F131F] border border-slate-800 shadow-2xl mb-20">
            
            {/* Hero Image Background */}
            {car.image_url && (
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                    <Image src={car.image_url} alt="" fill className="object-cover blur-3xl scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F131F] via-[#0F131F]/80 to-transparent"></div>
                </div>
            )}

            <div className="relative z-10 p-8 md:p-12 lg:p-16">
                
                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    {/* Car Image Card */}
                    <div className="w-full lg:w-5/12">
                        <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-slate-800 border border-white/10 shadow-2xl group">
                            {car.image_url ? (
                                <Image src={car.image_url} alt={car.model} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                                    <div className="p-6 bg-slate-900/50 rounded-full"><Search className="w-10 h-10" /></div>
                                    <span className="font-medium">Nincs kép feltöltve</span>
                                </div>
                            )}
                            <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3" /> Ellenőrzött
                            </div>
                        </div>
                    </div>

                    {/* Car Details */}
                    <div className="flex-1 w-full">
                        <div className="mb-10">
                            <div className="text-slate-400 font-mono text-sm tracking-widest mb-2 uppercase">
                                {car.make}
                            </div>
                            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-6">
                                {car.model}
                            </h2>
                            
                            <div className="flex flex-wrap gap-3">
                                <div className="inline-flex items-center gap-2 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/50">
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Rendszám</span>
                                    <span className="font-mono text-white font-bold tracking-widest">{car.plate}</span>
                                </div>
                                {!car.hide_sensitive && (
                                    <div className="inline-flex items-center gap-2 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/50">
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">VIN</span>
                                        <span className="font-mono text-emerald-400 font-bold tracking-widest">{car.vin}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DataCard icon={<Calendar className="w-5 h-5" />} label="Évjárat" value={car.year} />
                            <DataCard icon={<Gauge className="w-5 h-5" />} label="Futásteljesítmény" value={`${car.mileage.toLocaleString()} km`} />
                            <DataCard icon={<Fuel className="w-5 h-5" />} label="Üzemanyag" value={car.fuel_type} />
                            <DataCard icon={<Settings className="w-5 h-5" />} label="Váltó" value={car.transmission} />
                            <DataCard icon={<Zap className="w-5 h-5" />} label="Teljesítmény" value={car.power_hp ? `${car.power_hp} LE` : null} />
                            <DataCard icon={<Tag className="w-5 h-5" />} label="Kivitel" value={car.body_type} />
                            <DataCard icon={<Calendar className="w-4 h-4" />} label="Műszaki" value={car.mot_expiry} />
                            {car.hide_sensitive && (
                                <DataCard icon={<ShieldCheck className="w-4 h-4 text-amber-500" />} label="Adatvédelem" value="Szenzitív adatok rejtve" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* SZERVIZTÖRTÉNET */}
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-6 mb-16 justify-center">
                <div className="h-px w-24 bg-gradient-to-r from-transparent to-slate-800"></div>
                <h3 className="text-3xl font-black text-white flex items-center gap-3">
                    <History className="w-8 h-8 text-slate-600" /> 
                    Szerviztörténet
                </h3>
                <div className="h-px w-24 bg-gradient-to-l from-transparent to-slate-800"></div>
            </div>

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-slate-800 md:-translate-x-1/2"></div>

                <div className="space-y-12">
                    {serviceHistory.map((event: any, i: number) => {
                        const isLeft = i % 2 === 0;
                        const date = new Date(event.event_date);
                        // Hide costs check
                        const hideCosts = car.hide_service_costs || car.hide_prices || false;

                        return (
                            <div key={i} className={`relative flex flex-col md:flex-row items-start md:items-center w-full ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                                
                                {/* Középső pötty */}
                                <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full border-[3px] border-[#0B0F19] z-10 shadow-lg mt-6 md:mt-0 bg-white"></div>

                                {/* Üres oldal */}
                                <div className="hidden md:block w-1/2"></div>

                                {/* Kártya */}
                                <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}>
                                    <div className="bg-[#131722] border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all shadow-xl group relative overflow-hidden">
                                        
                                        {/* Kártya dekoráció */}
                                        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br opacity-5 rounded-bl-[4rem] transition-opacity group-hover:opacity-10
                                            ${event.type === 'service' ? 'from-emerald-400 to-transparent' : 'from-blue-400 to-transparent'}`}></div>

                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="font-mono text-xs text-slate-500 mb-1">
                                                    {date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </div>
                                                <div className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                    {event.title}
                                                </div>
                                                <div className="text-slate-500 text-xs font-mono uppercase tracking-wider mt-1">
                                                    {event.type === 'service' ? 'Karbantartás' : event.type === 'fuel' ? 'Tankolás' : 'Egyéb'}
                                                </div>
                                            </div>
                                            <div className="bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 text-xs font-mono font-bold text-slate-300">
                                                {event.mileage.toLocaleString()} km
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {event.description && (
                                                <div className="flex gap-3 text-sm text-slate-300">
                                                    <Wrench className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                                    <p className="leading-relaxed">{event.description}</p>
                                                </div>
                                            )}
                                            {event.notes && (
                                                <div className="flex gap-3 text-sm text-slate-400 italic bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                                                    <Info className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                                                    <p>"{event.notes}"</p>
                                                </div>
                                            )}
                                            
                                            {/* Cost Display logic */}
                                            {!hideCosts && event.cost > 0 && (
                                                <div className="flex gap-2 items-center mt-2 pt-2 border-t border-slate-800/50">
                                                    <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
                                                        {event.cost.toLocaleString()} Ft
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {serviceHistory.length === 0 && (
                        <div className="text-center py-10 text-slate-500 italic">
                            Ehhez az autóhoz még nem rögzítettek publikus eseményt a rendszerben.
                        </div>
                    )}
                    
                    {/* Start pont */}
                    <div className="relative flex flex-col items-center pt-8">
                            <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-10 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10"></div>
                            <div className="pl-16 md:pl-0">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                                Rendszerbe regisztrálva
                            </div>
                            </div>
                    </div>
                </div>
            </div>
        </div>

        {/* FOOTER */}
        <div className="text-center pt-16 border-t border-slate-800/50 mt-20">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                Készült a DynamicSense Rendszerével <ArrowRight className="w-4 h-4" />
            </Link>
        </div>

      </div>
    </div>
  )
}