import { createClient } from 'supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { deleteEvent } from './actions'

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

  // 2. Események lekérése
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('car_id', params.id)
    .order('event_date', { ascending: false })

  const safeEvents = events || []

  // --- STATISZTIKAI SZÁMÍTÁSOK ---

  const totalCost = safeEvents.reduce((sum, event) => sum + (event.cost || 0), 0)
  const serviceCost = safeEvents.filter(e => e.type === 'service').reduce((sum, e) => sum + e.cost, 0)
  const fuelCost = safeEvents.filter(e => e.type === 'fuel').reduce((sum, e) => sum + e.cost, 0)

  // Átlagfogyasztás
  const fuelEvents = safeEvents.filter(e => e.type === 'fuel' && e.mileage && e.liters).sort((a, b) => a.mileage - b.mileage)
  let avgConsumption = "Nincs elég adat"
  
  if (fuelEvents.length >= 2) {
    const totalLiters = fuelEvents.reduce((sum, e) => sum + e.liters, 0) - fuelEvents[0].liters 
    const distanceDelta = fuelEvents[fuelEvents.length - 1].mileage - fuelEvents[0].mileage
    
    if (distanceDelta > 0) {
      const consumption = (totalLiters / distanceDelta) * 100
      avgConsumption = `${consumption.toFixed(1)} L/100km`
    }
  }

  // Utolsó szerviz kalkulációk
  const lastServiceEvent = safeEvents.find(e => e.type === 'service')
  const kmSinceService = lastServiceEvent ? car.mileage - lastServiceEvent.mileage : 0
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
        
        {/* Dekoráció */}
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] scale-150 transform rotate-12 pointer-events-none">
           <Logo className="w-[30rem] h-[30rem] text-white" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
           {/* Breadcrumb */}
           <div className="absolute top-6 left-4 md:left-8">
             <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors bg-white/5 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 hover:border-amber-500/50">
               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
               Garázs
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

             {/* Asztali Gombok (Mobilon rejtett, mert ott sticky bar van) */}
             <div className="hidden md:flex gap-3">
               <Link href={`/cars/${car.id}/events/new?type=fuel`} className="bg-amber-500 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/20 flex items-center gap-2 transform hover:-translate-y-0.5">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                 Tankolás
               </Link>
               <Link href={`/cars/${car.id}/events/new?type=service`} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition-all shadow-lg border border-slate-600 flex items-center gap-2 transform hover:-translate-y-0.5">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 Szerviz
               </Link>
             </div>
           </div>
        </div>
      </div>

      {/* --- FŐ TARTALOM --- */}
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
          
          {/* --- BAL OSZLOP (Adatok & Egészség) --- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Szerviz Monitor (Vizuális Progress) */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Szerviz Állapot
                </h3>
              </div>
              <div className="p-6 space-y-6">
                 {/* Km alapú */}
                 <div>
                   <div className="flex justify-between text-sm mb-2">
                     <span className="text-slate-500 font-medium">Futásteljesítmény</span>
                     <span className={`font-bold ${serviceDue ? 'text-red-600' : 'text-slate-900'}`}>{kmSinceService.toLocaleString()} / {serviceIntervalKm.toLocaleString()} km</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${kmSinceService > serviceIntervalKm ? 'bg-red-500' : 'bg-gradient-to-r from-amber-400 to-amber-600'}`} style={{ width: `${Math.min((kmSinceService / serviceIntervalKm) * 100, 100)}%` }}></div>
                   </div>
                 </div>
                 
                 {/* Idő alapú */}
                 <div>
                   <div className="flex justify-between text-sm mb-2">
                     <span className="text-slate-500 font-medium">Időszak</span>
                     <span className={`font-bold ${serviceDue ? 'text-red-600' : 'text-slate-900'}`}>{daysSinceService} / {serviceIntervalDays} nap</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${daysSinceService > serviceIntervalDays ? 'bg-red-500' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`} style={{ width: `${Math.min((daysSinceService / serviceIntervalDays) * 100, 100)}%` }}></div>
                   </div>
                 </div>

                 <div className="pt-2 border-t border-slate-50">
                   <p className="text-xs text-center text-slate-400">
                     Utolsó rögzített szerviz: <span className="font-medium text-slate-600">{lastServiceEvent ? lastServiceEvent.event_date : 'Nincs adat'}</span>
                   </p>
                 </div>
              </div>
            </div>

            {/* Technikai Adatok Kártya */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider text-opacity-70">Jármű Törzskönyv</h3>
              <dl className="divide-y divide-slate-100 text-sm">
                <Row label="Gyártmány" value={car.make} />
                <Row label="Modell" value={car.model} />
                <Row label="Rendszám" value={car.plate} badge />
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

            {/* Galéria Placeholder */}
            <div className="bg-slate-200 rounded-2xl h-48 flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400 relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-slate-900 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                <div className="text-center">
                   <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                   <span className="text-sm font-medium">Fotó hozzáadása</span>
                </div>
            </div>

          </div>

          {/* --- JOBB OSZLOP (Idővonal) --- */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-white min-h-[600px] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 backdrop-blur-sm sticky top-0 z-10 rounded-t-2xl">
                 <h3 className="font-extrabold text-slate-900 text-xl flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></span>
                  Eseménynapló
                 </h3>
                 <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 shadow-sm">{safeEvents.length} esemény</span>
              </div>

              <div className="p-6 md:p-8">
                <div className="relative border-l-2 border-slate-100 ml-4 space-y-12 pl-8 pb-4">
                  {safeEvents.length > 0 ? (
                    safeEvents.map((event: any) => (
                      <div key={event.id} className="relative group">
                          {/* Ikon a vonalon (Nagyobb, szebb) */}
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
                                <div className="flex items-center gap-3 mb-2">
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
                               <div className="flex items-center gap-1">
                                  <Link 
                                    href={`/cars/${car.id}/events/${event.id}/edit`}
                                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                    title="Szerkesztés"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                  </Link>
                                  <form action={deleteEvent}>
                                    <input type="hidden" name="event_id" value={event.id} />
                                    <input type="hidden" name="car_id" value={car.id} />
                                    <button 
                                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Törlés"
                                      type="submit"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                  </form>
                               </div>
                            </div>
                          </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center">
                       <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 border-2 border-dashed border-slate-200">
                         <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                       </div>
                       <p className="text-slate-500 font-bold text-lg">Még nincsenek rögzített események.</p>
                       <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">Kezdd el most egy tankolás vagy szerviz rögzítésével!</p>
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
         <Link href={`/cars/${car.id}/events/new?type=fuel`} className="flex-1 bg-amber-500 text-slate-900 py-3 rounded-xl font-bold text-center shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tankolás
         </Link>
         <Link href={`/cars/${car.id}/events/new?type=service`} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-center shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Szerviz
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

function DocPlaceholder({ label }: any) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer h-32 relative overflow-hidden group">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-200 group-hover:bg-amber-400 transition-colors"></div>
        <svg className="w-8 h-8 mb-2 text-slate-300 group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        <span className="text-xs font-semibold text-center">{label}</span>
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