import { createClient } from 'supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { deleteEvent, deleteReminder } from './actions'

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

  // --- STATISZTIKAI SZÁMÍTÁSOK ---
  const totalCost = safeEvents.reduce((sum, event) => sum + (event.cost || 0), 0)
  
  // Költségek típus szerint
  const serviceCost = safeEvents.filter(e => e.type === 'service').reduce((sum, e) => sum + (e.cost || 0), 0)
  const fuelCost = safeEvents.filter(e => e.type === 'fuel').reduce((sum, e) => sum + (e.cost || 0), 0)
  
  // Átlagfogyasztás
  const fuelEvents = safeEvents.filter(e => e.type === 'fuel' && e.mileage && e.liters).sort((a, b) => a.mileage - b.mileage)
  let avgConsumption = "Nincs elég adat"
  
  if (fuelEvents.length >= 2) {
    const totalLiters = fuelEvents.reduce((sum, e) => sum + (e.liters || 0), 0) - (fuelEvents[0].liters || 0)
    const distanceDelta = fuelEvents[fuelEvents.length - 1].mileage - fuelEvents[0].mileage
    if (distanceDelta > 0) {
      const consumption = (totalLiters / distanceDelta) * 100
      avgConsumption = `${consumption.toFixed(1)} L/100km`
    }
  }

  // Szerviz Kalkuláció
  const lastServiceEvent = safeEvents.find(e => e.type === 'service')
  const kmSinceService = lastServiceEvent ? car.mileage - (lastServiceEvent.mileage || 0) : 0
  const daysSinceService = lastServiceEvent 
    ? Math.floor((new Date().getTime() - new Date(lastServiceEvent.event_date).getTime()) / (1000 * 3600 * 24))
    : 0

  // Szerviz Állapot (Egészség) logika
  let healthStatus = "Kiváló"
  let healthColor = "text-emerald-600 bg-emerald-100 border-emerald-200"
  let serviceDue = false
  const serviceIntervalKm = 15000
  const serviceIntervalDays = 365

  if (kmSinceService > serviceIntervalKm || daysSinceService > serviceIntervalDays) {
    healthStatus = "Szerviz Szükséges!"
    healthColor = "text-red-600 bg-red-100 border-red-200"
    serviceDue = true
  } else if (kmSinceService > (serviceIntervalKm - 2000) || daysSinceService > (serviceIntervalDays - 30)) {
    healthStatus = "Hamarosan Esedékes"
    healthColor = "text-amber-600 bg-amber-100 border-amber-200"
  }

  // Következő szerviz becslése
  const kmRemaining = Math.max(0, serviceIntervalKm - kmSinceService)
  const daysRemaining = Math.max(0, serviceIntervalDays - daysSinceService)

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 md:pb-20">
      
      {/* --- HERO HEADER --- */}
      <div className="relative bg-slate-900 h-[22rem] md:h-96 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 opacity-95" />
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] scale-150 transform rotate-12 pointer-events-none">
           <Logo className="w-[30rem] h-[30rem] text-white" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
           
           {/* Felső sor */}
           <div className="absolute top-6 left-4 right-4 flex justify-between items-center">
             <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors bg-white/5 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 hover:border-amber-500/50">
               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
               Garázs
             </Link>
             <Link href={`/cars/${car.id}/edit`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-3 py-2 rounded-full border border-white/10 hover:bg-white/10">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               <span className="text-xs font-bold uppercase hidden sm:inline">Beállítások</span>
             </Link>
           </div>

           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-8">
             <div>
               <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest border ${healthColor}`}>
                    {healthStatus}
                  </span>
                  {serviceDue && <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>}
               </div>
               <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-lg">
                 {car.make} <span className="text-amber-500">{car.model}</span>
               </h1>
               <p className="text-slate-400 mt-3 font-mono text-sm md:text-lg flex flex-wrap items-center gap-x-4 gap-y-2">
                 <span className="flex items-center gap-1"><span className="text-slate-600">rendszám:</span> <span className="text-white font-bold bg-slate-800 px-2 rounded border border-slate-700">{car.plate}</span></span>
                 <span className="hidden md:inline text-slate-700">|</span>
                 <span className="flex items-center gap-1"><span className="text-slate-600">évjárat:</span> <span className="text-slate-200">{car.year}</span></span>
               </p>
             </div>
             
             {/* ASZTALI GOMBOK */}
             <div className="hidden md:flex gap-3">
               <Link href={`/cars/${car.id}/reminders/new`} className="bg-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all shadow-lg border border-white/20 flex items-center gap-2 backdrop-blur-sm">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                 Szerviz Terv
               </Link>
               <Link href={`/cars/${car.id}/events/new?type=service`} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition-all shadow-lg border border-slate-600 flex items-center gap-2 transform hover:-translate-y-0.5">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 Szerviz Rögzítés
               </Link>
               <Link href={`/cars/${car.id}/events/new?type=fuel`} className="bg-amber-500 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/20 flex items-center gap-2 transform hover:-translate-y-0.5">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                 Tankolás
               </Link>
             </div>
           </div>
        </div>
      </div>

      {/* --- TARTALOM --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-20 relative z-20">
        
        {/* Statisztika Sáv (Kártyák) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
           <StatCard label="Összes Költés" value={`${totalCost.toLocaleString()} Ft`} icon="wallet" />
           <StatCard label="Átlagfogyasztás" value={avgConsumption} icon="drop" highlight />
           <StatCard label="Km óra állás" value={`${car.mileage.toLocaleString()} km`} icon="road" />
           <StatCard 
              label="Következő szerviz" 
              value={`${Math.round(kmRemaining).toLocaleString()} km`} 
              subValue={`${daysRemaining} nap múlva`}
              icon="health" 
              alert={serviceDue}
           />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- BAL OSZLOP (Adatok, Emlékeztetők) --- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* TERVEZETT SZERVIZEK */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
               <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Következő Szervizek
                  </h3>
                  <Link href={`/cars/${car.id}/reminders/new`} className="text-xs font-bold bg-slate-900 text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors">
                    + Új
                  </Link>
               </div>
               <div className="p-4 space-y-3">
                  {safeReminders.length > 0 ? (
                    safeReminders.map((rem: any) => (
                      <div key={rem.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-amber-200 transition-colors group relative">
                         <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex flex-col items-center justify-center text-xs font-bold shadow-sm flex-shrink-0 text-slate-600">
                            <span>{new Date(rem.due_date).getDate()}</span>
                            <span className="text-[8px] uppercase text-slate-400">{new Date(rem.due_date).toLocaleDateString('hu-HU', { month: 'short' }).replace('.', '')}</span>
                         </div>
                         <div className="flex-1">
                            <h4 className="font-bold text-slate-800 text-sm">{rem.service_type}</h4>
                            <p className="text-xs text-slate-500 mt-1">{rem.note}</p>
                            <div className="flex gap-2 mt-1">
                               {rem.notify_push && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> Push</span>}
                               {rem.notify_email && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> Email</span>}
                            </div>
                         </div>
                         <form action={deleteReminder} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <input type="hidden" name="id" value={rem.id} />
                            <input type="hidden" name="car_id" value={car.id} />
                            <button className="text-slate-300 hover:text-red-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                         </form>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4 italic">Nincs betervezett szerviz.</p>
                  )}
               </div>
            </div>

            {/* Technikai Adatok */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider text-opacity-70">Jármű Törzskönyv</h3>
              <dl className="divide-y divide-slate-100 text-sm">
                <Row label="Alvázszám (VIN)" value={car.vin || '-'} mono />
                <Row label="Szín" value={car.color || '-'} />
                <Row label="Üzemanyag" value={car.fuel_type} capitalize />
              </dl>
            </div>

            {/* Költség Megoszlás (Mini Chart) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
               <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider text-opacity-70">Költség Elemzés</h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                     <span className="flex items-center gap-2 font-medium text-slate-600"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Üzemanyag</span>
                     <span className="font-bold text-slate-900">{fuelCost.toLocaleString()} Ft</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                     <span className="flex items-center gap-2 font-medium text-slate-600"><div className="w-2 h-2 rounded-full bg-slate-800"></div> Szerviz</span>
                     <span className="font-bold text-slate-900">{serviceCost.toLocaleString()} Ft</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full flex overflow-hidden">
                     <div className="bg-amber-500 h-full" style={{ width: `${totalCost > 0 ? (fuelCost / totalCost) * 100 : 0}%` }}></div>
                     <div className="bg-slate-800 h-full" style={{ width: `${totalCost > 0 ? (serviceCost / totalCost) * 100 : 0}%` }}></div>
                  </div>
                  <p className="text-xs text-slate-400 text-center">Teljes életút költség: {totalCost.toLocaleString()} Ft</p>
               </div>
            </div>

          </div>

          {/* --- JOBB OSZLOP (Idővonal & Dokumentumok) --- */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-white min-h-[600px] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 backdrop-blur-sm sticky top-0 z-10 rounded-t-2xl">
                 <h3 className="font-extrabold text-slate-900 text-xl flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></span>
                  Eseménynapló
                 </h3>
                 <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 shadow-sm">{safeEvents.length} bejegyzés</span>
              </div>

              <div className="p-6 md:p-8">
                <div className="relative border-l-2 border-slate-100 ml-4 space-y-12 pl-8 pb-4">
                  {safeEvents.length > 0 ? (
                    safeEvents.map((event: any) => (
                      <div key={event.id} className="relative group">
                          {/* Ikon a vonalon */}
                          <span className={`absolute -left-[49px] top-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md z-10 transition-transform group-hover:scale-110 ${
                            event.type === 'fuel' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-white'
                          }`}>
                            {event.type === 'fuel' 
                              ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> 
                              : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            }
                          </span>

                          {/* Kártya Tartalom */}
                          <div className="flex flex-col md:flex-row md:items-start gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all hover:border-amber-200">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    {event.event_date}
                                  </span>
                                  <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                    {event.mileage.toLocaleString()} km
                                  </span>
                                </div>
                                <h4 className="font-bold text-slate-900 text-lg mb-1">
                                  {event.title}
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                  {event.type === 'fuel' 
                                    ? <span className="flex items-center gap-2"><span className="font-bold text-amber-600">{event.liters} Liter</span> üzemanyag</span>
                                    : event.description}
                                </p>
                                {event.location && (
                                  <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {event.location}
                                  </p>
                                )}
                            </div>

                            <div className="flex flex-row md:flex-col justify-between md:items-end gap-2 md:gap-4 mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                               <p className="text-lg font-black text-slate-900 whitespace-nowrap">
                                 -{event.cost.toLocaleString()} Ft
                               </p>
                               <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                  <Link href={`/cars/${car.id}/events/${event.id}/edit`} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 0 0" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></Link>
                                  <form action={deleteEvent}>
                                    <input type="hidden" name="event_id" value={event.id} />
                                    <input type="hidden" name="car_id" value={car.id} />
                                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                  </form>
                               </div>
                            </div>
                          </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center">
                       <p className="text-slate-500 font-bold text-lg">Még nincsenek rögzített események.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dokumentum Tár */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                   <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   Dokumentumok
                 </h3>
                 <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">Hamarosan</span>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <DocPlaceholder label="Forgalmi" />
                  <DocPlaceholder label="Biztosítás" />
                  <DocPlaceholder label="Szervizkönyv" />
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-amber-300 hover:text-amber-500 transition-all cursor-pointer h-32 group">
                     <svg className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                     <span className="text-xs font-bold">Új feltöltése</span>
                  </div>
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

// --- SEGÉD KOMPONENSEK ---

function StatCard({ label, value, subValue, icon, customColor, alert, highlight }: any) {
  return (
    <div className={`bg-white p-4 md:p-5 rounded-2xl border shadow-sm flex flex-col justify-between h-full transition-shadow hover:shadow-md ${alert ? 'border-red-200 bg-red-50' : 'border-slate-100'} ${highlight ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}>
      <div className="flex justify-between items-start mb-3">
         <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert ? 'bg-red-200 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
            {icon === 'wallet' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            {icon === 'drop' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
            {icon === 'road' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            {icon === 'health' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
         </div>
         {alert && <span className="bg-red-500 w-2 h-2 rounded-full animate-pulse"></span>}
      </div>
      <div>
        <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
        <p className={`text-xl md:text-2xl font-black ${alert ? 'text-red-700' : 'text-slate-900'} tracking-tight`}>{value}</p>
        {subValue && <p className="text-xs font-bold text-slate-500 mt-1">{subValue}</p>}
      </div>
    </div>
  )
}

function Row({ label, value, mono, capitalize, badge }: any) {
  return (
    <div className="flex justify-between py-3 items-center">
      <dt className="text-slate-500 text-xs md:text-sm font-medium">{label}</dt>
      <dd className={`font-bold text-slate-900 text-sm md:text-base ${mono ? 'font-mono' : ''} ${capitalize ? 'capitalize' : ''}`}>
        {badge ? <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">{value}</span> : value}
      </dd>
    </div>
  )
}

function DocPlaceholder({ label }: any) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer h-32 relative overflow-hidden group">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-200 group-hover:bg-amber-400 transition-colors"></div>
        <svg className="w-8 h-8 mb-2 text-slate-300 group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        <span className="text-xs font-semibold text-center">{label}</span>
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