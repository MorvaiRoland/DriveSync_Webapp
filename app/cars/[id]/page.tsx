import { createClient } from 'supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { deleteEvent, deleteReminder } from './actions'
import PdfDownloadButton from './PdfDownloadButton'
import Image from 'next/image'

export default async function CarDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  // 1. Autó lekérése
  const { data: car, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !car) {
    return notFound()
  }

  // 2. Események lekérése (Múlt)
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('car_id', params.id)
    .order('event_date', { ascending: false })

  // 3. Emlékeztetők lekérése (Jövő)
  const { data: reminders } = await supabase
    .from('service_reminders')
    .select('*')
    .eq('car_id', params.id)
    .order('due_date', { ascending: true })

  const safeEvents = events || []
  const safeReminders = reminders || []

  // --- STATISZTIKAI SZÁMÍTÁSOK (JAVÍTVA) ---
  const totalCost = safeEvents.reduce((sum, event) => sum + (event.cost || 0), 0)
  
  // Különválogatjuk a költségeket a grafikonhoz
  const serviceCost = safeEvents
    .filter(e => e.type === 'service')
    .reduce((sum, e) => sum + (e.cost || 0), 0)

  const fuelCost = safeEvents
    .filter(e => e.type === 'fuel')
    .reduce((sum, e) => sum + (e.cost || 0), 0)
  
  // Átlagfogyasztás
  const fuelEvents = safeEvents.filter(e => e.type === 'fuel' && e.mileage && e.liters).sort((a, b) => a.mileage - b.mileage)
  let avgConsumption = "Nincs adat"
  
  if (fuelEvents.length >= 2) {
    const totalLiters = fuelEvents.reduce((sum, e) => sum + (e.liters || 0), 0) - (fuelEvents[0].liters || 0)
    const distanceDelta = fuelEvents[fuelEvents.length - 1].mileage - fuelEvents[0].mileage
    if (distanceDelta > 0) {
      const consumption = (totalLiters / distanceDelta) * 100
      avgConsumption = `${consumption.toFixed(1)} L`
    }
  }

  // --- OKOS SZERVIZ KALKULÁCIÓ ---
  const lastServiceEvent = safeEvents.find(e => e.type === 'service')
  const serviceIntervalKm = car.service_interval_km || 15000
  const serviceIntervalDays = car.service_interval_days || 365
  
  let kmRemaining = 0;
  let kmSinceService = 0;
  let daysSinceService = 0;
  
  if (lastServiceEvent) {
     // A: Ha VAN rögzített szerviz
     kmSinceService = car.mileage - (lastServiceEvent.mileage || 0);
     kmRemaining = serviceIntervalKm - kmSinceService;
     daysSinceService = Math.floor((new Date().getTime() - new Date(lastServiceEvent.event_date).getTime()) / (1000 * 3600 * 24));
  } else {
     // B: Ha NINCS rögzített szerviz (matematikai becslés)
     const remainder = car.mileage % serviceIntervalKm;
     kmSinceService = remainder;
     kmRemaining = serviceIntervalKm - remainder;
     daysSinceService = 0;
  }

  const daysRemaining = Math.max(0, serviceIntervalDays - daysSinceService)

  // --- OKOS TIPPEK (SMART INSIGHTS) ---
  const smartTips = [];
  if (car.mileage > 200000) smartTips.push("Magas futásteljesítmény: Érdemes sűrűbben ellenőrizni az olajszintet.");
  if (car.year < new Date().getFullYear() - 10) smartTips.push("10 évnél idősebb autó: Az akkumulátor és a gumicsövek állapota kritikus lehet.");
  if (avgConsumption !== "Nincs adat" && parseFloat(avgConsumption) > 10 && car.fuel_type === 'diesel') smartTips.push("A fogyasztás magasnak tűnik dízelhez képest. Ellenőriztesd a légtömegmérőt!");
  if (safeEvents.length === 0) smartTips.push("Kezdd el rögzíteni az adatokat a pontosabb elemzésekhez!");
  if (smartTips.length === 0) smartTips.push("Minden rendben az autóval. Jó utat!");

  // --- ÁLLAPOT LOGIKA ---
  let healthStatus = "Kiváló"
  let healthColor = "text-emerald-600 bg-emerald-100 border-emerald-200"
  let serviceDue = false

  if (kmRemaining <= 0 || (lastServiceEvent && daysRemaining <= 0)) {
    healthStatus = "Szerviz Szükséges!"
    healthColor = "text-red-600 bg-red-100 border-red-200"
    serviceDue = true
  } 
  else if (kmRemaining <= 2000 || (lastServiceEvent && daysRemaining <= 30)) {
    healthStatus = "Hamarosan Esedékes"
    healthColor = "text-amber-600 bg-amber-100 border-amber-200"
  }

  return (
    <div className="h-screen w-full overflow-y-auto overscroll-none bg-slate-50 font-sans text-slate-900 pb-24 md:pb-20">
      
      {/* --- HERO HEADER --- */}
      <div className="relative bg-slate-900 h-[22rem] md:h-96 overflow-hidden shadow-2xl shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 opacity-95" />
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] scale-150 transform rotate-12 pointer-events-none">
           <Logo className="w-[30rem] h-[30rem] text-white" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
           
           <div className="absolute top-6 left-4 right-4 flex justify-between items-center">
             <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors bg-white/5 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 hover:border-amber-500/50">
               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
               Garázs
             </Link>
             
             <div className="flex gap-2">
                 <PdfDownloadButton car={car} events={safeEvents} />
                 <Link href={`/cars/${car.id}/edit`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-3 py-2 rounded-full border border-white/10 hover:bg-white/10">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   <span className="text-xs font-bold uppercase hidden sm:inline">Beállítások</span>
                 </Link>
             </div>
           </div>

           <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6">
             {/* Kép keret */}
             <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-700/50 shadow-2xl overflow-hidden relative flex-shrink-0 bg-slate-800">
                {car.image_url ? (
                    <Image src={car.image_url} alt="Car" fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Logo className="w-16 h-16" />
                    </div>
                )}
             </div>
             <div className="text-center md:text-left flex-1">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  <span className={`w-2 h-2 rounded-full ${car.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  {car.status === 'active' ? 'Aktív flotta' : 'Szervizben'}
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-1">
                 {car.make} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">{car.model}</span>
               </h1>
               <p className="text-slate-400 font-mono text-lg">{car.plate}</p>
             </div>
             
             {/* Kiemelt adat: Hátralévő Km */}
             <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center min-w-[140px]">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Szervizig</p>
                <p className={`text-2xl font-black ${kmRemaining <= 1000 ? 'text-red-500' : 'text-white'}`}>
                    {kmRemaining.toLocaleString()} <span className="text-sm font-medium text-slate-500">km</span>
                </p>
             </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        
        {/* FŐ RÁCS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

           {/* --- BAL OSZLOP (Adatok & Elemzés) --- */}
           <div className="space-y-6">
              
              {/* 1. Okos Tippek Kártya (AI Insight) - ÚJ! */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg></div>
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2 relative z-10">
                      <svg className="w-5 h-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Smart Insight
                  </h3>
                  <div className="relative z-10 text-sm text-indigo-100 space-y-2">
                      {smartTips.map((tip, i) => (
                          <p key={i}>• {tip}</p>
                      ))}
                  </div>
              </div>

              {/* 2. Pénzügyi Elemzés Grafikon - ÚJ! */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                 <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider text-opacity-70">Pénzügyi Elemzés</h3>
                 
                 {/* Grafikon sávok (vizuális dummy) */}
                 <div className="flex items-end gap-2 h-32 mb-4 border-b border-slate-100 pb-2">
                    {[30, 50, 45, 80, 40, 90].map((h, i) => (
                        <div key={i} className="flex-1 bg-slate-50 rounded-t-lg relative group overflow-hidden">
                            <div className="absolute bottom-0 w-full bg-amber-500/80 hover:bg-amber-500 transition-all duration-500 rounded-t-lg" style={{ height: `${h}%` }}></div>
                        </div>
                    ))}
                 </div>
                 <div className="flex justify-between text-xs text-slate-400 uppercase font-bold mb-6">
                    <span>6 hónapja</span>
                    <span>Ma</span>
                 </div>
                 
                 <div className="space-y-3">
                    <CostRow label="Szerviz" amount={serviceCost} color="bg-slate-800" />
                    <CostRow label="Üzemanyag" amount={fuelCost} color="bg-amber-500" />
                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                        <span className="font-bold text-slate-900">Összesen</span>
                        <span className="font-black text-xl text-slate-900">{totalCost.toLocaleString()} Ft</span>
                    </div>
                 </div>
              </div>

              {/* 3. Szerviz Monitor (Meglévő) */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Szerviz Állapot</h3>
                 </div>
                 <div className="p-6 space-y-6">
                   <div>
                     <div className="flex justify-between text-sm mb-2">
                       <span className="text-slate-500 font-medium">Ciklus</span>
                       <span className={`font-bold ${serviceDue ? 'text-red-600' : 'text-slate-900'}`}>{kmSinceService.toLocaleString()} / {serviceIntervalKm.toLocaleString()} km</span>
                     </div>
                     <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${kmRemaining <= 0 ? 'bg-red-500' : kmRemaining <= 2000 ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'}`} style={{ width: `${Math.min((kmSinceService / serviceIntervalKm) * 100, 100)}%` }}></div>
                     </div>
                   </div>
                 </div>
              </div>

              {/* 4. Technikai Adatok */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                 <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider text-opacity-70">Jármű Adatok</h3>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <DataPoint label="Futás" value={`${car.mileage.toLocaleString()} km`} />
                    <DataPoint label="Évjárat" value={car.year} />
                    <DataPoint label="Üzemanyag" value={car.fuel_type} capitalize />
                    <DataPoint label="Szín" value={car.color || '-'} />
                    <DataPoint label="Átlagfogy." value={avgConsumption === 'N/A' ? '-' : `${avgConsumption} L`} highlight />
                    <DataPoint label="VIN" value={car.vin || 'N/A'} mono />
                 </div>
              </div>

           </div>

           {/* --- JOBB OSZLOP (Fő tartalom) --- */}
           <div className="lg:col-span-2 space-y-6">
              
              {/* Emlékeztetők & Kesztyűtartó */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Emlékeztetők */}
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                           Következő Teendők
                        </h3>
                        <Link href={`/cars/${car.id}/reminders/new`} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 transition-colors">+ Hozzáadás</Link>
                    </div>
                    <div className="space-y-3 flex-1">
                        {safeReminders.length > 0 ? (
                           safeReminders.slice(0,3).map((rem: any) => (
                             <div key={rem.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                 <div className="bg-white p-2 rounded-lg border border-slate-200 text-center min-w-[50px]">
                                     <span className="block text-xs text-slate-400 uppercase font-bold">{new Date(rem.due_date).toLocaleString('hu-HU', { month: 'short' }).replace('.', '')}</span>
                                     <span className="block text-lg font-black text-slate-800 leading-none">{new Date(rem.due_date).getDate()}</span>
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <p className="font-bold text-slate-800 text-sm truncate">{rem.service_type}</p>
                                     <p className="text-xs text-slate-500 truncate">{rem.note || 'Nincs megjegyzés'}</p>
                                 </div>
                                 <form action={deleteReminder}>
                                     <input type="hidden" name="id" value={rem.id} />
                                     <input type="hidden" name="car_id" value={car.id} />
                                     <button className="text-slate-300 hover:text-red-500 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                 </form>
                             </div>
                           ))
                        ) : (
                           <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm py-4">
                              <svg className="w-8 h-8 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Nincs betervezett karbantartás.
                           </div>
                        )}
                    </div>
                 </div>

                 {/* Digitális Kesztyűtartó - ÚJ! */}
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">Kesztyűtartó</h3>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Aktív</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <DocCard label="Forgalmi" />
                        <DocCard label="Biztosítás" />
                        <DocCard label="Zöldkártya" />
                        <button className="border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:border-amber-400 hover:text-amber-500 transition-colors h-20">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </div>
                 </div>
              </div>

              {/* NAGY ESEMÉNYNAPLÓ */}
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
                 <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                     <h3 className="font-bold text-lg text-slate-900">Eseménynapló</h3>
                     <span className="text-xs font-bold text-slate-500 bg-slate-200/50 px-2 py-1 rounded">{safeEvents.length} bejegyzés</span>
                 </div>
                 
                 <div className="divide-y divide-slate-50">
                    {safeEvents.length > 0 ? (
                        safeEvents.map((event: any) => (
                            <div key={event.id} className="p-4 hover:bg-slate-50 transition-all group flex gap-4 items-start">
                                {/* Dátum */}
                                <div className="flex-shrink-0 w-12 text-center pt-1">
                                    <span className="block text-lg font-black text-slate-300 group-hover:text-slate-500 transition-colors leading-none">{new Date(event.event_date).getDate()}</span>
                                    <span className="block text-[10px] uppercase font-bold text-slate-400">{new Date(event.event_date).toLocaleDateString('hu-HU', { month: 'short' }).replace('.', '')}</span>
                                </div>
                                
                                {/* Ikon */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-white ${event.type === 'fuel' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                                    {event.type === 'fuel' 
                                      ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                      : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    }
                                </div>

                                {/* Tartalom */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-slate-900 truncate pr-2">{event.title}</h4>
                                        <span className="font-black text-slate-900 whitespace-nowrap">-{event.cost.toLocaleString()} Ft</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">{event.mileage.toLocaleString()} km</span>
                                        {event.type === 'fuel' && <span className="text-amber-600 font-medium">• {event.liters}L</span>}
                                        {event.location && <span className="truncate">• {event.location}</span>}
                                    </div>
                                </div>
                                
                                {/* Törlés gomb (csak hoverre) */}
                                <form action={deleteEvent} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <input type="hidden" name="event_id" value={event.id} />
                                    <input type="hidden" name="car_id" value={car.id} />
                                    <button className="p-2 text-slate-300 hover:text-red-500 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                </form>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center text-slate-400 italic">Még nincsenek adatok.</div>
                    )}
                 </div>
              </div>

           </div>
        </div>
      </div>

      {/* --- STICKY MOBILE BOTTOM BAR --- */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] px-4 py-3 z-50 flex gap-3 pb-safe">
         <Link href={`/cars/${car.id}/events/new?type=fuel`} className="flex-1 bg-amber-500 text-slate-900 py-3 rounded-xl font-bold text-center shadow-sm active:scale-95 transition-transform flex flex-col items-center justify-center gap-1 text-xs">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tankolás
         </Link>
         <Link href={`/cars/${car.id}/events/new?type=service`} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-center shadow-sm active:scale-95 transition-transform flex flex-col items-center justify-center gap-1 text-xs">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Szerviz
         </Link>
         <Link href={`/cars/${car.id}/reminders/new`} className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold text-center shadow-sm active:scale-95 transition-transform flex flex-col items-center justify-center gap-1 text-xs">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Tervező
         </Link>
      </div>

    </div>
  )
}

// --- KISEBB ALKOTÓELEMEK ---

function CostRow({ label, amount, color }: any) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 font-medium text-slate-600">
                <div className={`w-2 h-2 rounded-full ${color}`}></div>
                {label}
            </span>
            <span className="font-bold text-slate-900">{amount.toLocaleString()} Ft</span>
        </div>
    )
}

function DataPoint({ label, value, mono, capitalize, highlight }: any) {
    return (
        <div>
            <p className="text-xs text-slate-400 font-bold uppercase">{label}</p>
            <p className={`text-sm font-bold ${mono ? 'font-mono' : ''} ${capitalize ? 'capitalize' : ''} ${highlight ? 'text-amber-600' : 'text-slate-900'}`}>
                {value}
            </p>
        </div>
    )
}

function DocCard({ label }: any) {
    return (
        <div className="border border-slate-200 rounded-xl p-3 flex flex-col justify-between h-20 bg-slate-50 cursor-pointer hover:border-slate-400 transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2a2 2 0 00-2 2v1h10V4a2 2 0 00-2-2H7zm12 4h-2V4a4 4 0 00-4-4H7a4 4 0 00-4 4v1H1a1 1 0 00-1 1v12a1 1 0 001 1h18a1 1 0 001-1V7a1 1 0 00-1-1zM3 8h14v10H3V8zm2 2v2h10v-2H5zm0 4v2h8v-2H5z"/></svg>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
            <span className="text-xs font-bold text-slate-600">Megtekintés</span>
        </div>
    )
}

function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <path d="M12 17v-6" />
      <path d="M8.5 14.5 12 11l3.5 3.5" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M14.7 9a3 3 0 0 0-4.2 0L5 14.5a2.12 2.12 0 0 0 3 3l5.5-5.5" opacity="0.5" />
    </svg>
  )
}