import { createClient } from 'supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { deleteEvent, deleteReminder, resetServiceCounter } from './actions'
import PdfDownloadButton from './PdfDownloadButton'
import Image from 'next/image'

// Segédfüggvény: Lejárat számítása
const getExpiryStatus = (dateString: string | null) => {
    if (!dateString) return { label: 'Nincs adat', status: '-', alert: false, color: 'text-slate-500 dark:text-slate-400' };
    
    const today = new Date();
    const expiry = new Date(dateString);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Lejárt!', status: `${Math.abs(diffDays)} napja`, alert: true, color: 'text-red-600 dark:text-red-400' };
    if (diffDays < 30) return { label: 'Lejáróban', status: `${diffDays} nap`, alert: true, color: 'text-amber-600 dark:text-amber-400' };
    return { label: 'Érvényes', status: expiry.toLocaleDateString('hu-HU'), alert: false, color: 'text-emerald-600 dark:text-emerald-400' };
}

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

  // 3. Emlékeztetők lekérése
  const { data: reminders } = await supabase
    .from('service_reminders')
    .select('*')
    .eq('car_id', params.id)
    .order('due_date', { ascending: true })
    
  // 4. Gumik lekérése
  const { data: tires } = await supabase
    .from('tires')
    .select('*')
    .eq('car_id', params.id)
    .order('is_mounted', { ascending: false })

  const safeEvents = events || []
  const safeReminders = reminders || []
  const safeTires = tires || []

  // --- KÖLTSÉGEK ---
  const totalCost = safeEvents.reduce((sum, event) => sum + (event.cost || 0), 0)
  const serviceCost = safeEvents.filter(e => e.type === 'service').reduce((sum, e) => sum + (e.cost || 0), 0)
  const fuelCost = safeEvents.filter(e => e.type === 'fuel').reduce((sum, e) => sum + (e.cost || 0), 0)
  
  // --- FOGYASZTÁS ---
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

  // --- SZERVIZ LOGIKA ---
  const serviceIntervalKm = car.service_interval_km || 15000;
  let baseKm = car.last_service_mileage || 0;
  const lastServiceEvent = safeEvents.find(e => e.type === 'service');
  
  if (lastServiceEvent && lastServiceEvent.mileage > baseKm) {
      baseKm = lastServiceEvent.mileage;
  }
  
  if (baseKm === 0) {
      baseKm = car.mileage;
  }

  const nextServiceKm = baseKm + serviceIntervalKm;
  const kmRemaining = nextServiceKm - car.mileage;
  const kmSinceService = car.mileage - baseKm;

  // Állapot meghatározása
  let healthStatus = "Kiváló";
  let healthColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  let serviceDue = false;

  if (kmRemaining <= 0) {
      healthStatus = "Szerviz Szükséges!";
      healthColor = "text-red-500 bg-red-500/10 border-red-500/20";
      serviceDue = true;
  } else if (kmRemaining < 2000) {
      healthStatus = "Hamarosan";
      healthColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
  }

  // Olaj élettartam
  const percentageUsed = Math.min(100, Math.max(0, (kmSinceService / serviceIntervalKm) * 100));
  const oilLife = 100 - percentageUsed;

  // Okmányok
  const motStatus = getExpiryStatus(car.mot_expiry);
  const insuranceStatus = getExpiryStatus(car.insurance_expiry);

  // --- AI TIPPEK ---
  const smartTips = [];
  if (oilLife < 20) smartTips.push("Az olajcsere hamarosan esedékes. Foglalj időpontot!");
  if (car.mileage > 200000) smartTips.push("Magas futásteljesítmény: Ellenőrizd a vezérlést.");
  if (motStatus.alert) smartTips.push(`A műszaki vizsga állapota kritikus: ${motStatus.status}`);
  if (safeTires.length === 0) smartTips.push("Még nem rögzítettél gumiabroncsokat.");
  if (smartTips.length === 0) smartTips.push("Minden rendszer rendben. Biztonságos utat!");


  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-32 md:pb-20 transition-colors duration-300">
      
      {/* --- HEADER (KÉP & NAVIGÁCIÓ) --- */}
      <div className="relative bg-slate-900 h-[22rem] md:h-[28rem] overflow-hidden shadow-2xl shrink-0 group">
        {car.image_url && (
            <div className="absolute inset-0 z-0 opacity-40 blur-xl scale-110">
                <Image src={car.image_url} alt="Background" fill className="object-cover" />
            </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-950 z-0" />
        
        <div className="absolute inset-0 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
           
           <div className="absolute top-4 md:top-6 left-4 right-4 flex justify-between items-center">
             <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-3 md:px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 hover:bg-white/10">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
               <span className="hidden sm:inline">Garázs</span>
             </Link>
             
             <div className="flex gap-2">
                 <PdfDownloadButton car={car} events={safeEvents} />
                 <Link href={`/cars/${car.id}/edit`} className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-3 md:px-4 py-2 rounded-full border border-white/10 hover:bg-white/10">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   <span className="text-xs font-bold uppercase hidden md:inline">Beállítások</span>
                 </Link>
             </div>
           </div>

           <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 pb-4 mt-12 md:mt-8">
             <div className="w-32 h-32 md:w-56 md:h-56 rounded-3xl border-[6px] border-slate-800 shadow-2xl overflow-hidden relative flex-shrink-0 bg-slate-900">
                {car.image_url ? (
                    <Image src={car.image_url} alt="Car" fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                        <Logo className="w-16 md:w-24 h-16 md:h-24" />
                    </div>
                )}
             </div>
             
             <div className="text-center md:text-left flex-1 space-y-2">
               <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${healthColor}`}>
                  <span className={`w-2 h-2 rounded-full ${serviceDue ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                  {healthStatus}
               </div>
               
               <div>
                  <h1 className="text-3xl md:text-6xl font-black text-white tracking-tighter leading-none">
                    {car.make} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">{car.model}</span>
                  </h1>
                  <p className="text-slate-400 font-mono text-lg md:text-xl tracking-wider mt-1">{car.plate}</p>
               </div>

               <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 pt-2">
                   <div className="bg-white/5 px-3 md:px-4 py-2 rounded-lg border border-white/10">
                       <p className="text-[10px] text-slate-400 uppercase font-bold">Futásteljesítmény</p>
                       <p className="text-white font-mono font-bold text-sm md:text-base">{car.mileage.toLocaleString()} km</p>
                   </div>
                   <div className="bg-white/5 px-3 md:px-4 py-2 rounded-lg border border-white/10">
                       <p className="text-[10px] text-slate-400 uppercase font-bold">Következő Szerviz</p>
                       <p className={`font-mono font-bold text-sm md:text-base ${kmRemaining <= 1000 ? 'text-red-400' : 'text-amber-400'}`}>
                           {nextServiceKm.toLocaleString()} km
                       </p>
                   </div>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* --- GYORS AKCIÓ GOMBOK (DESKTOP) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-30 hidden md:grid grid-cols-3 lg:grid-cols-5 gap-4">
          <Link href={`/cars/${car.id}/events/new?type=fuel`} className="bg-amber-500 hover:bg-amber-400 text-slate-900 p-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform hover:-translate-y-1 font-bold">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Tankolás
          </Link>
          <Link href={`/cars/${car.id}/events/new?type=service`} className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform hover:-translate-y-1 font-bold">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Szerviz
          </Link>
          <Link href={`/cars/${car.id}/reminders/new`} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 p-4 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 transition-transform hover:-translate-y-1 font-bold">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Emlékeztető
          </Link>
          <Link href={`/cars/${car.id}/trips`} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 p-4 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 transition-transform hover:-translate-y-1 font-bold">
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            Útnyilvántartás
          </Link>
          <Link href={`/cars/${car.id}/parts`} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 p-4 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 transition-transform hover:-translate-y-1 font-bold">
            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            Alkatrészek
          </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-20">
        
        {/* FŐ RÁCS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

           {/* --- BAL OSZLOP (Status & Insights) --- */}
           <div className="space-y-6 md:space-y-8">
             
             {/* 1. MŰSZAKI ÁLLAPOT KÁRTYA */}
             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 md:p-6">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm md:text-base">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Jármű Egészség
                    </h3>
                    <form action={resetServiceCounter}>
                        <input type="hidden" name="car_id" value={car.id} />
                        <button className="text-[10px] bg-slate-100 dark:bg-slate-700 hover:bg-amber-100 hover:text-amber-700 dark:hover:text-amber-400 text-slate-600 dark:text-slate-300 px-2 md:px-3 py-1.5 rounded-full font-bold transition-colors uppercase tracking-wider flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Nullázás
                        </button>
                    </form>
                 </div>
                 
                 {/* Olaj élettartam */}
                 <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Olaj élettartam</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{Math.round(oilLife)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${oilLife < 20 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.max(0, oilLife)}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-1">
                        <p className="text-[10px] text-slate-400">Ciklus: {kmSinceService.toLocaleString()} / {serviceIntervalKm.toLocaleString()}</p>
                        <p className={`text-[10px] font-bold ${kmRemaining <= 0 ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>Hátra: {Math.max(0, kmRemaining).toLocaleString()} km</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <StatusItem label="Műszaki" status={motStatus.status} icon="doc" alert={motStatus.alert} color={motStatus.color} />
                    <StatusItem label="Biztosítás" status={insuranceStatus.status} icon="doc" alert={insuranceStatus.alert} color={insuranceStatus.color} />
                 </div>
             </div>

             {/* 2. GUMIABRONCS HOTEL */}
             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 md:p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm md:text-base">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Gumik
                    </h3>
                    <Link href={`/cars/${car.id}/edit`} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Kezelés</Link>
                 </div>

                 <div className="space-y-3">
                    {safeTires.length > 0 ? (
                        safeTires.slice(0,2).map((tire: any) => {
                            let currentTireDistance = tire.total_distance;
                            if (tire.is_mounted) {
                                currentTireDistance += (car.mileage - (tire.mounted_at_mileage || car.mileage));
                            }
                            return (
                                <div key={tire.id} className={`flex items-center justify-between p-3 rounded-xl border ${tire.is_mounted ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">{tire.type === 'winter' ? '❄️' : '☀️'}</div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{tire.brand}</p>
                                            <p className="text-[10px] text-slate-500 font-mono">{currentTireDistance.toLocaleString()} km</p>
                                        </div>
                                    </div>
                                    {tire.is_mounted && <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full shadow-sm">Fent</span>}
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-xs text-slate-400 text-center py-2">Nincs rögzített abroncs.</p>
                    )}
                 </div>
             </div>

             {/* 3. PÉNZÜGYI ELEMZÉS */}
             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 md:p-6">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base">Költségek</h3>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Összes</span>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500">
                             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Eddigi ráfordítás</p>
                            <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{totalCost.toLocaleString()} Ft</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Üzemanyag</p>
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base">{fuelCost.toLocaleString()} Ft</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Szerviz</p>
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base">{serviceCost.toLocaleString()} Ft</p>
                        </div>
                    </div>
                 </div>
             </div>

             {/* 4. AI INSIGHTS */}
             <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 md:p-6 shadow-lg text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><svg className="w-20 md:w-24 h-20 md:h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg></div>
                 <h3 className="font-bold text-base md:text-lg mb-3 flex items-center gap-2 relative z-10">
                     <svg className="w-5 h-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     Smart Tips
                 </h3>
                 <div className="space-y-3 text-xs md:text-sm text-indigo-100 relative z-10">
                     {smartTips.map((tip, i) => (
                         <div key={i} className="flex gap-3 items-start">
                             <span className="mt-1.5 w-1.5 h-1.5 bg-yellow-400 rounded-full flex-shrink-0"></span>
                             <p className="leading-relaxed">{tip}</p>
                         </div>
                     ))}
                 </div>
             </div>

           </div>

           {/* --- JOBB OSZLOP (Timeline & Lists) --- */}
           <div className="lg:col-span-2 space-y-6 md:space-y-8">
             
             {/* KÖVETKEZŐ TEENDŐK */}
             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                 <div className="px-5 md:px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm md:text-base">
                       <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                       Következő Teendők
                    </h3>
                    <Link href={`/cars/${car.id}/reminders/new`} className="text-xs font-bold bg-slate-900 dark:bg-slate-700 text-white px-2 md:px-3 py-1.5 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors">+ Új</Link>
                 </div>
                 
                 <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {safeReminders.length > 0 ? (
                       safeReminders.map((rem: any) => (
                         <div key={rem.id} className="p-4 flex items-center gap-3 md:gap-4 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors group">
                             <div className="w-11 h-11 md:w-12 md:h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 rounded-xl flex flex-col items-center justify-center shadow-sm border border-amber-200 dark:border-amber-800/50 flex-shrink-0">
                                 <span className="text-xs font-bold uppercase">{new Date(rem.due_date).toLocaleString('hu-HU', { month: 'short' }).replace('.', '')}</span>
                                 <span className="text-lg font-black leading-none">{new Date(rem.due_date).getDate()}</span>
                             </div>
                             <div className="flex-1 min-w-0">
                                 <p className="font-bold text-slate-900 dark:text-slate-100 text-sm md:text-base truncate">{rem.service_type}</p>
                                 <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate">{rem.note || 'Nincs megjegyzés'}</p>
                             </div>
                             <form action={deleteReminder}>
                                 <input type="hidden" name="id" value={rem.id} />
                                 <input type="hidden" name="car_id" value={car.id} />
                                 <button className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                 </button>
                             </form>
                         </div>
                       ))
                    ) : (
                       <div className="p-8 text-center text-slate-400 text-xs md:text-sm">Nincs közelgő karbantartás.</div>
                    )}
                 </div>
             </div>

             {/* DIGITÁLIS KESZTYŰTARTÓ */}
             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 md:p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm md:text-base">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                        Digitális Kesztyűtartó
                    </h3>
                 </div>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                    <DocCard label="Forgalmi" />
                    <DocCard label="Biztosítás" />
                    <DocCard label="Szervizkönyv" />
                    <button className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-amber-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors h-20 md:h-24 bg-slate-50 dark:bg-slate-900/50">
                        <svg className="w-5 md:w-6 h-5 md:h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        <span className="text-[10px] md:text-xs font-bold">Feltöltés</span>
                    </button>
                 </div>
             </div>

             {/* TECHNIKAI ADATOK */}
             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 md:p-6">
                 <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 text-xs md:text-sm uppercase tracking-wider text-opacity-70">Jármű Adatok</h3>
                 <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                    <DataPoint label="Futás" value={`${car.mileage.toLocaleString()} km`} />
                    <DataPoint label="Évjárat" value={car.year} />
                    <DataPoint label="Üzemanyag" value={car.fuel_type} capitalize />
                    <DataPoint label="Szín" value={car.color || '-'} />
                    <DataPoint label="Átlagfogy." value={avgConsumption === 'N/A' ? '-' : `${avgConsumption}`} highlight />
                    <DataPoint label="VIN" value={car.vin || 'N/A'} mono />
                 </div>
             </div>

             {/* ESEMÉNYNAPLÓ */}
             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-700 overflow-hidden">
                 <div className="px-5 md:px-6 py-4 md:py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
                     <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-white">Eseménynapló</h3>
                     <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">{safeEvents.length}</span>
                 </div>
                 
                 <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {safeEvents.length > 0 ? (
                        safeEvents.map((event: any) => (
                            <div key={event.id} className="relative p-3 md:p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all group flex gap-3 md:gap-4 items-start">
                                
                                <Link href={`/cars/${car.id}/events/${event.id}/edit`} className="flex-1 flex gap-3 md:gap-4 items-start cursor-pointer min-w-0">
                                    
                                    <div className="flex-shrink-0 w-10 md:w-12 text-center pt-1">
                                        <span className="block text-base md:text-lg font-black text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors leading-none">{new Date(event.event_date).getDate()}</span>
                                        <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">{new Date(event.event_date).toLocaleDateString('hu-HU', { month: 'short' }).replace('.', '')}</span>
                                    </div>
                                    
                                    <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-white dark:border-slate-700 ${event.type === 'fuel' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                        {event.type === 'fuel' 
                                          ? <svg className="w-4 md:w-5 h-4 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                          : <svg className="w-4 md:w-5 h-4 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        }
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors text-sm md:text-base">{event.title}</h4>
                                            <span className="font-black text-slate-900 dark:text-slate-100 whitespace-nowrap text-xs md:text-base flex-shrink-0">-{event.cost.toLocaleString()} Ft</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                                            <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 font-medium">{event.mileage.toLocaleString()} km</span>
                                            {event.type === 'fuel' && <span className="text-amber-600 dark:text-amber-500 font-medium">• {event.liters}L</span>}
                                            {event.location && <span className="truncate hidden sm:inline">• {event.location}</span>}
                                        </div>
                                    </div>

                                    <div className="self-center text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors hidden md:block">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                </Link>
                                
                                <form action={deleteEvent} className="md:absolute md:top-4 md:right-4 z-20 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    <input type="hidden" name="event_id" value={event.id} />
                                    <input type="hidden" name="car_id" value={car.id} />
                                    <button 
                                        className="p-1.5 md:p-2 bg-white dark:bg-slate-800 rounded-full shadow-md text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors border border-slate-100 dark:border-slate-700" 
                                        title="Törlés"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </form>
                            </div>
                        ))
                    ) : (
                        <div className="py-16 md:py-20 text-center text-slate-400 italic text-sm">Még nincsenek adatok.</div>
                    )}
                 </div>
             </div>

           </div>
        </div>
      </div>

      {/* --- STICKY MOBILE BOTTOM BAR (5 GOMB) --- */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] px-2 py-3 z-50 pb-safe">
         <div className="grid grid-cols-5 gap-1.5">
            <Link href={`/cars/${car.id}/events/new?type=fuel`} className="bg-amber-500 text-slate-900 py-2.5 rounded-xl font-bold text-center shadow-sm active:scale-95 transition-transform flex flex-col items-center justify-center gap-0.5">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
               <span className="text-[9px] font-bold">Tankolás</span>
            </Link>
            <Link href={`/cars/${car.id}/events/new?type=service`} className="bg-slate-900 dark:bg-slate-700 text-white py-2.5 rounded-xl font-bold text-center shadow-sm active:scale-95 transition-transform flex flex-col items-center justify-center gap-0.5">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               <span className="text-[9px] font-bold">Szerviz</span>
            </Link>
            <Link href={`/cars/${car.id}/reminders/new`} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl font-bold text-center shadow-sm active:scale-95 transition-transform flex flex-col items-center justify-center gap-0.5">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
               <span className="text-[9px] font-bold">Emlékez.</span>
            </Link>
            <Link href={`/cars/${car.id}/trips`} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl font-bold text-center shadow-sm active:scale-95 transition-transform flex flex-col items-center justify-center gap-0.5">
               <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
               <span className="text-[9px] font-bold">Útnap.</span>
            </Link>
            <Link href={`/cars/${car.id}/parts`} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl font-bold text-center shadow-sm active:scale-95 transition-transform flex flex-col items-center justify-center gap-0.5">
               <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
               <span className="text-[9px] font-bold">Alktrész</span>
            </Link>
         </div>
      </div>

    </div>
  )
}

// --- KISEBB ALKOTÓELEMEK ---

function StatusItem({ label, status, icon, alert, color }: any) {
    return (
        <div className={`flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-xl border ${alert ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700'}`}>
            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${alert ? 'bg-white dark:bg-slate-800 text-red-500' : 'bg-white dark:bg-slate-800 text-slate-500'}`}>
                {icon === 'doc' && <svg className="w-3.5 md:w-4 h-3.5 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-slate-400">{label}</p>
                <p className={`text-xs md:text-sm font-bold truncate ${color ? color : (alert ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200')}`}>{status}</p>
            </div>
        </div>
    )
}

function DataPoint({ label, value, mono, capitalize, highlight }: any) {
    return (
        <div>
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase">{label}</p>
            <p className={`text-xs md:text-sm font-bold ${mono ? 'font-mono' : ''} ${capitalize ? 'capitalize' : ''} ${highlight ? 'text-amber-600 dark:text-amber-500' : 'text-slate-900 dark:text-slate-100'}`}>
                {value}
            </p>
        </div>
    )
}

function DocCard({ label }: any) {
    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 md:p-3 flex flex-col justify-between h-20 md:h-24 bg-slate-50 dark:bg-slate-900/50 cursor-pointer hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-sm transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-10 md:w-12 h-10 md:h-12 dark:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2a2 2 0 00-2 2v1h10V4a2 2 0 00-2-2H7zm12 4h-2V4a4 4 0 00-4-4H7a4 4 0 00-4 4v1H1a1 1 0 00-1 1v12a1 1 0 001 1h18a1 1 0 001-1V7a1 1 0 00-1-1zM3 8h14v10H3V8zm2 2v2h10v-2H5zm0 4v2h8v-2H5z"/></svg>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
            <span className="text-[10px] md:text-xs font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                Megnyitás <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </span>
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