import { createClient } from '@/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { deleteEvent, deleteReminder, resetServiceCounter } from './actions'
import DocumentManager from './DocumentManager'
import ExportMenu from '@/components/ExportMenu'
import LockedFeature from '@/components/LockedFeature'
import { getSubscriptionStatus, type SubscriptionPlan } from '@/utils/subscription'

// --- Típusdefiníciók ---
type Car = {
  id: string
  make: string
  model: string
  plate: string
  year: number
  mileage: number
  image_url: string | null
  mot_expiry: string | null
  insurance_expiry: string | null
  service_interval_km: number
  last_service_mileage: number
  fuel_type: string
  color: string | null
  vin: string | null
}

// --- Segédfüggvények ---

const getExpiryStatus = (dateString: string | null) => {
  if (!dateString) return { label: 'Nincs adat', status: '-', alert: false, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' };
  
  const today = new Date();
  const expiry = new Date(dateString);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { label: 'Lejárt!', status: `${Math.abs(diffDays)} napja`, alert: true, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
  if (diffDays < 30) return { label: 'Lejáróban', status: `${diffDays} nap`, alert: true, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' };
  return { label: 'Érvényes', status: expiry.toLocaleDateString('hu-HU'), alert: false, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
}

// --- FŐ KOMPONENS ---

type Props = {
  params: Promise<{ id: string }>
}

export default async function CarDetailsPage(props: Props) {
  const params = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Adatlekérések párhuzamosítása
  const [carRes, eventsRes, remindersRes, tiresRes, docsRes] = await Promise.all([
    supabase.from('cars').select('*').eq('id', params.id).single(),
    supabase.from('events').select('*').eq('car_id', params.id).order('event_date', { ascending: false }),
    supabase.from('service_reminders').select('*').eq('car_id', params.id).order('due_date', { ascending: true }),
    supabase.from('tires').select('*').eq('car_id', params.id).order('is_mounted', { ascending: false }),
    supabase.from('car_documents').select('*').eq('car_id', params.id).order('created_at', { ascending: false })
  ])

  if (carRes.error || !carRes.data) return notFound()

  const car: Car = carRes.data
  const safeEvents = eventsRes.data || []
  const safeReminders = remindersRes.data || []
  const safeTires = tiresRes.data || []
  const safeDocs = docsRes.data || []

  // --- Előfizetés és Jogosultságok ---
  let plan: SubscriptionPlan = 'free';
  if (user) {
      plan = await getSubscriptionStatus(user.id);
  }
  const isPro = plan === 'pro' || plan === 'founder';

  // --- Üzleti Logika Számítások ---
  
  // Költségek
  const totalCost = safeEvents.reduce((sum, e) => sum + (e.cost || 0), 0)
  const serviceCost = safeEvents.filter(e => e.type === 'service').reduce((sum, e) => sum + (e.cost || 0), 0)
  const fuelCost = safeEvents.filter(e => e.type === 'fuel').reduce((sum, e) => sum + (e.cost || 0), 0)
  
  // Fogyasztás
  const fuelEvents = safeEvents.filter(e => e.type === 'fuel' && e.mileage && e.liters).sort((a, b) => a.mileage - b.mileage)
  let avgConsumption = "Nincs adat"
  if (fuelEvents.length >= 2) {
    const totalLiters = fuelEvents.reduce((sum, e) => sum + (e.liters || 0), 0) - (fuelEvents[0].liters || 0)
    const distanceDelta = fuelEvents[fuelEvents.length - 1].mileage - fuelEvents[0].mileage
    if (distanceDelta > 0) {
      avgConsumption = `${((totalLiters / distanceDelta) * 100).toFixed(1)} L`
    }
  }

  // Szerviz intervallum
  const serviceIntervalKm = car.service_interval_km || 15000;
  let baseKm = car.last_service_mileage || 0;
  
  const lastServiceEvent = safeEvents.find(e => e.type === 'service');
  if (lastServiceEvent && lastServiceEvent.mileage > baseKm) {
      baseKm = lastServiceEvent.mileage;
  }
  if (baseKm === 0) baseKm = car.mileage; 

  const nextServiceKm = baseKm + serviceIntervalKm;
  const kmRemaining = nextServiceKm - car.mileage;
  const kmSinceService = car.mileage - baseKm;

  // Állapot jelzők
  let healthStatus = { text: "Kiváló", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-500" };
  if (kmRemaining <= 0) {
      healthStatus = { text: "Szerviz Most!", color: "text-red-500 bg-red-500/10 border-red-500/20", dot: "bg-red-500 animate-pulse" };
  } else if (kmRemaining < 2000) {
      healthStatus = { text: "Hamarosan", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-500" };
  }

  const percentageUsed = Math.min(100, Math.max(0, (kmSinceService / serviceIntervalKm) * 100));
  const oilLife = 100 - percentageUsed;

  const motStatus = getExpiryStatus(car.mot_expiry);
  const insuranceStatus = getExpiryStatus(car.insurance_expiry);

  // AI Tippek
  const smartTips = [];
  if (oilLife < 15) smartTips.push("Az olajcsere nagyon hamarosan esedékes.");
  if (car.mileage > 200000) smartTips.push("200e km felett érdemes ellenőrizni a vezérlést.");
  if (motStatus.alert) smartTips.push(`A műszaki vizsga kritikus: ${motStatus.status}`);
  if (safeTires.length === 0) smartTips.push("Rögzítsd a téli/nyári gumikat a Gumihotelben.");
  if (smartTips.length === 0) smartTips.push("Minden rendszer rendben. Biztonságos utat!");

  // --- RENDER ---

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-32 md:pb-20 transition-colors duration-300">
      
      {/* 1. HEADER SZEKCIÓ */}
      <HeaderSection 
        car={car} 
        healthStatus={healthStatus} 
        nextServiceKm={nextServiceKm} 
        kmRemaining={kmRemaining} 
        safeEvents={safeEvents} 
        isPro={isPro} // Átadjuk az előfizetési státuszt
      />

      {/* 2. DESKTOP GYORS GOMBOK (Mobilon rejtve) */}
      <DesktopActionGrid carId={car.id} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          {/* 3. BAL OSZLOP (Status & Insights) */}
          <div className="space-y-6 md:space-y-8">
             <HealthCard 
                car={car} 
                oilLife={oilLife} 
                kmSinceService={kmSinceService} 
                serviceIntervalKm={serviceIntervalKm} 
                kmRemaining={kmRemaining}
                motStatus={motStatus}
                insuranceStatus={insuranceStatus}
             />
             
             <TireHotelCard tires={safeTires} carMileage={car.mileage} carId={car.id} />
             
             <CostCard total={totalCost} fuel={fuelCost} service={serviceCost} />
             
             {isPro ? (
                <SmartTipsCard tips={smartTips} />
             ) : (
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 shadow-lg border border-indigo-500/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-3 text-indigo-400">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h3 className="font-bold text-white mb-1">AI Szerelő Tippek</h3>
                        <p className="text-sm text-indigo-200 mb-4">Személyre szabott karbantartási tanácsok az autód adatai alapján.</p>
                        <Link href="/pricing" className="bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-500/20">
                            Pro Funkció
                        </Link>
                    </div>
                </div>
             )}
          </div>

          {/* 4. JOBB OSZLOP (Timeline & Lists) */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
             <RemindersList reminders={safeReminders} carId={car.id} />
             
             {/* DIGITÁLIS KESZTYŰTARTÓ (KORLÁTOZOTT) */}
             {isPro ? (
                 <DocumentManager carId={car.id} documents={safeDocs} />
             ) : (
                 <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                     <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Digitális Kesztyűtartó
                     </h3>
                     <LockedFeature label="dokumentum kezelés" />
                 </div>
             )}
             
             <TechnicalSpecs car={car} avgConsumption={avgConsumption} />
             
             <EventLog events={safeEvents} carId={car.id} />
          </div>

        </div>
      </div>

      {/* 5. MOBIL ALSÓ MENÜ (Sticky) */}
      <MobileBottomNav carId={car.id} />
      
    </div>
  )
}

// ----------------------------------------------------------------------
// ALKOMPONENSEK
// ----------------------------------------------------------------------

function HeaderSection({ car, healthStatus, nextServiceKm, kmRemaining, safeEvents, isPro }: any) {
    return (
        <div className="relative bg-slate-900 h-[22rem] md:h-[28rem] overflow-hidden shadow-2xl shrink-0 group">
            {car.image_url && (
                <div className="absolute inset-0 z-0 opacity-40 blur-xl scale-110">
                    <Image src={car.image_url} alt="Background" fill className="object-cover" priority />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/90 to-slate-950 z-0" />
            
            <div className="absolute inset-0 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
              {/* Top Nav */}
                <div className="absolute top-4 md:top-6 left-4 right-4 flex justify-between items-center pt-4 md:pt-0 z-50">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-black/20 backdrop-blur-md px-3 md:px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 hover:bg-white/10 h-[40px]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        <span className="hidden sm:inline">Garázs</span>
                    </Link>
                    
                    <div className="flex gap-2 items-center">
                        
                        {/* --- EXPORT MENÜ (Feltételes megjelenítés) --- */}
                        <div className="scale-90 md:scale-100 origin-right">
                            {isPro ? (
                                <ExportMenu car={car} events={safeEvents} />
                            ) : (
                                <Link href="/pricing" className="inline-flex items-center gap-2 text-slate-400 bg-black/20 px-3 py-2 rounded-full border border-white/5 hover:bg-white/5 transition-colors h-[40px]" title="Pro funkció">
                                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                     <span className="text-xs font-bold uppercase hidden md:inline">Export</span>
                                     <svg className="w-3 h-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </Link>
                            )}
                        </div>
                        
                        {/* Szerkesztés Gomb */}
                        <Link href={`/cars/${car.id}/edit`} className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-black/20 backdrop-blur-md px-3 md:px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 h-[40px]">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span className="text-xs font-bold uppercase hidden md:inline">Szerk.</span>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 pb-4 mt-12 md:mt-8">
                    <div className="w-32 h-32 md:w-56 md:h-56 rounded-3xl border-[6px] border-slate-800 shadow-2xl overflow-hidden relative flex-shrink-0 bg-slate-900">
                        {car.image_url ? (
                            <Image src={car.image_url} alt="Car" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-700">
                                <span className="font-bold">NO IMAGE</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="text-center md:text-left flex-1 space-y-2">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${healthStatus.color}`}>
                            <span className={`w-2 h-2 rounded-full ${healthStatus.dot}`}></span>
                            {healthStatus.text}
                        </div>
                        
                        <div>
                            <h1 className="text-3xl md:text-6xl font-black text-white tracking-tighter leading-none">
                                {car.make} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">{car.model}</span>
                            </h1>
                            <p className="text-slate-400 font-mono text-lg md:text-xl tracking-wider mt-1">{car.plate}</p>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 pt-2">
                            <StatBadge label="Futásteljesítmény" value={`${car.mileage.toLocaleString()} km`} />
                            <StatBadge 
                                label="Következő Szerviz" 
                                value={`${nextServiceKm.toLocaleString()} km`} 
                                valueColor={kmRemaining <= 1000 ? 'text-red-400' : 'text-amber-400'} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatBadge({ label, value, valueColor = "text-white" }: any) {
    return (
        <div className="bg-white/5 px-3 md:px-4 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
            <p className="text-[10px] text-slate-400 uppercase font-bold">{label}</p>
            <p className={`font-mono font-bold text-sm md:text-base ${valueColor}`}>{value}</p>
        </div>
    )
}

function MobileBottomNav({ carId }: { carId: string }) {
    const btnBase = "flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all active:scale-95";
    
    return (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-50 pb-[env(safe-area-inset-bottom)]">
            <div className="grid grid-cols-5 gap-1 px-2 py-2">
                <Link href={`/cars/${carId}/events/new?type=fuel`} className={`${btnBase} text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    <span className="text-[10px] font-bold leading-none">Tankolás</span>
                </Link>

                <Link href={`/cars/${carId}/events/new?type=service`} className={`${btnBase} text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="text-[10px] font-bold leading-none">Szerviz</span>
                </Link>

                <Link href={`/cars/${carId}/reminders/new`} className={`${btnBase} text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-[10px] font-bold leading-none truncate max-w-full">Emlékez.</span>
                </Link>

                <Link href={`/cars/${carId}/trips`} className={`${btnBase} text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                    <span className="text-[10px] font-bold leading-none">Utak</span>
                </Link>

                <Link href={`/cars/${carId}/parts`} className={`${btnBase} text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    <span className="text-[10px] font-bold leading-none">Alkatrész</span>
                </Link>
            </div>
        </div>
    )
}

function DesktopActionGrid({ carId }: { carId: string }) {
    const btnClass = "p-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform hover:-translate-y-1 font-bold border border-transparent";
    
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-30 hidden md:grid grid-cols-3 lg:grid-cols-5 gap-4">
             <Link href={`/cars/${carId}/events/new?type=fuel`} className={`${btnClass} bg-amber-500 hover:bg-amber-400 text-slate-900`}>
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                 Tankolás Rögzítése
             </Link>
             <Link href={`/cars/${carId}/events/new?type=service`} className={`${btnClass} bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white`}>
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 Szerviz Rögzítése
             </Link>
             <Link href={`/cars/${carId}/reminders/new`} className={`${btnClass} bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700`}>
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                 Emlékeztető
             </Link>
             <Link href={`/cars/${carId}/trips`} className={`${btnClass} bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700`}>
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                Útnyilvántartás
             </Link>
             <Link href={`/cars/${carId}/parts`} className={`${btnClass} bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700`}>
                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                Alkatrészek
             </Link>
        </div>
    )
}

function HealthCard({ car, oilLife, kmSinceService, serviceIntervalKm, kmRemaining, motStatus, insuranceStatus }: any) {
    // Kördiagram konfiguráció
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    // Biztosítjuk, hogy 0 és 100 között maradjon a vizuális megjelenítéshez
    const safeOilLife = Math.min(100, Math.max(0, oilLife));
    const offset = circumference - ((safeOilLife / 100) * circumference);

    // Szín logika
    let colorClass = 'text-emerald-500';
    let strokeColor = '#10b981'; // emerald-500
    let statusText = 'Kiváló';

    if (safeOilLife < 20) {
        colorClass = 'text-red-500';
        strokeColor = '#ef4444'; // red-500
        statusText = 'Kritikus';
    } else if (safeOilLife < 50) {
        colorClass = 'text-amber-500';
        strokeColor = '#f59e0b'; // amber-500
        statusText = 'Figyelj';
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm md:text-base">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Jármű Egészség
                </h3>
                
                {/* Gyors nullázó gomb */}
                <form action={resetServiceCounter}>
                    <input type="hidden" name="car_id" value={car.id} />
                    <button className="text-[10px] bg-slate-100 dark:bg-slate-700 hover:bg-amber-100 hover:text-amber-700 dark:hover:text-amber-400 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full font-bold transition-colors uppercase tracking-wider flex items-center gap-1 group">
                        <svg className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Nullázás
                    </button>
                </form>
            </div>
            
            <div className="flex items-center gap-6 mb-8">
                {/* KÖRDIAGRAM (Olaj alapú egészség) */}
                <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Háttér kör */}
                        <circle
                            cx="50%"
                            cy="50%"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-slate-100 dark:text-slate-700"
                        />
                        {/* Progress kör */}
                        <circle
                            cx="50%"
                            cy="50%"
                            r={radius}
                            stroke={strokeColor}
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-xl font-black ${colorClass}`}>{Math.round(safeOilLife)}%</span>
                        <span className="text-[9px] uppercase font-bold text-slate-400">{statusText}</span>
                    </div>
                </div>

                {/* ADATOK */}
                <div className="flex-1 space-y-3">
                    <div>
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-xs font-bold text-slate-500 uppercase">Olajcsere</span>
                            <span className={`text-xs font-bold ${kmRemaining <= 0 ? 'text-red-500 animate-pulse' : 'text-slate-800 dark:text-slate-200'}`}>
                                {kmRemaining > 0 ? `${Math.round(kmRemaining).toLocaleString()} km múlva` : 'ESEDÉKES!'}
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full transition-all ${colorClass.replace('text-', 'bg-')}`} style={{ width: `${safeOilLife}%` }}></div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-50 dark:border-slate-700/50">
                        <span>Megtett: {kmSinceService.toLocaleString()} km</span>
                        <span>Ciklus: {serviceIntervalKm.toLocaleString()} km</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
                <StatusItem label="Műszaki" data={motStatus} icon="doc" />
                <StatusItem label="Biztosítás" data={insuranceStatus} icon="doc" />
            </div>
        </div>
    )
}

function StatusItem({ label, data, icon }: any) {
    return (
        <div className={`flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-xl border ${data.bg} ${data.alert ? 'border-red-100 dark:border-red-800' : 'border-slate-100 dark:border-slate-700'}`}>
            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white dark:bg-slate-800 ${data.alert ? 'text-red-500' : 'text-slate-500'}`}>
                <svg className="w-3.5 md:w-4 h-3.5 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-slate-400">{label}</p>
                <p className={`text-xs md:text-sm font-bold truncate ${data.color}`}>{data.status}</p>
            </div>
        </div>
    )
}

function TireHotelCard({ tires, carMileage, carId }: any) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 md:p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm md:text-base">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Gumi Hotel
                </h3>
                <Link href={`/cars/${carId}/edit`} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Kezelés</Link>
            </div>
            <div className="space-y-3">
                {tires.length > 0 ? (
                    tires.slice(0,2).map((tire: any) => {
                        let currentDistance = tire.total_distance;
                        if (tire.is_mounted) {
                            currentDistance += (carMileage - (tire.mounted_at_mileage || carMileage));
                        }
                        return (
                            <div key={tire.id} className={`flex items-center justify-between p-3 rounded-xl border ${tire.is_mounted ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">{tire.type === 'winter' ? '❄️' : '☀️'}</div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{tire.brand}</p>
                                        <p className="text-[10px] text-slate-500 font-mono">{currentDistance.toLocaleString()} km</p>
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
    )
}

function CostCard({ total, fuel, service }: any) {
    return (
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
                        <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{total.toLocaleString()} Ft</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Üzemanyag</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base">{fuel.toLocaleString()} Ft</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Szerviz</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base">{service.toLocaleString()} Ft</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SmartTipsCard({ tips }: { tips: string[] }) {
    return (
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 md:p-6 shadow-lg text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><svg className="w-20 md:w-24 h-20 md:h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg></div>
             <h3 className="font-bold text-base md:text-lg mb-3 flex items-center gap-2 relative z-10">
                 <svg className="w-5 h-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 Smart Tips
             </h3>
             <div className="space-y-3 text-xs md:text-sm text-indigo-100 relative z-10">
                 {tips.map((tip, i) => (
                     <div key={i} className="flex gap-3 items-start">
                         <span className="mt-1.5 w-1.5 h-1.5 bg-yellow-400 rounded-full flex-shrink-0"></span>
                         <p className="leading-relaxed">{tip}</p>
                     </div>
                 ))}
             </div>
        </div>
    )
}

function RemindersList({ reminders, carId }: any) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-5 md:px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm md:text-base">
                   <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                   Következő Teendők
                </h3>
                <Link href={`/cars/${carId}/reminders/new`} className="text-xs font-bold bg-slate-900 dark:bg-slate-700 text-white px-2 md:px-3 py-1.5 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors">+ Új</Link>
            </div>
            
            <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {reminders.length > 0 ? (
                   reminders.map((rem: any) => (
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
                              <input type="hidden" name="car_id" value={carId} />
                              <button className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 flex-shrink-0">
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
    )
}

function TechnicalSpecs({ car, avgConsumption }: any) {
    return (
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

function EventLog({ events, carId }: any) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-700 overflow-hidden">
            <div className="px-5 md:px-6 py-4 md:py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
                <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-white">Eseménynapló</h3>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">{events.length} bejegyzés</span>
            </div>
            
            <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {events.length > 0 ? (
                    events.map((event: any) => (
                        <div key={event.id} className="relative p-3 md:p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all group flex gap-3 md:gap-4 items-start">
                            
                            <Link href={`/cars/${carId}/events/${event.id}/edit`} className="flex-1 flex gap-3 md:gap-4 items-start cursor-pointer min-w-0">
                                
                                {/* Dátum */}
                                <div className="flex-shrink-0 w-10 md:w-12 text-center pt-1">
                                    <span className="block text-base md:text-lg font-black text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors leading-none">{new Date(event.event_date).getDate()}</span>
                                    <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">{new Date(event.event_date).toLocaleDateString('hu-HU', { month: 'short' }).replace('.', '')}</span>
                                </div>
                                
                                {/* Ikon */}
                                <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-white dark:border-slate-700 ${event.type === 'fuel' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                    {event.type === 'fuel' 
                                      ? <svg className="w-4 md:w-5 h-4 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                      : <svg className="w-4 md:w-5 h-4 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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
                            
                            <form action={deleteEvent} className="absolute top-3 right-3 md:top-4 md:right-4 z-20 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <input type="hidden" name="event_id" value={event.id} />
                                <input type="hidden" name="car_id" value={carId} />
                                <button className="p-1.5 md:p-2 bg-white dark:bg-slate-800 rounded-full shadow-md text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors border border-slate-100 dark:border-slate-700" title="Törlés">
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
    )
}