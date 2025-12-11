import { createClient } from '@/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { deleteEvent, deleteReminder, resetServiceCounter } from './actions'
import DocumentManager from './DocumentManager'
import ExportMenu from '@/components/ExportMenu'
import LockedFeature from '@/components/LockedFeature'
import { getSubscriptionStatus, type SubscriptionPlan } from '@/utils/subscription'
import VignetteManager from '@/components/VignetteManager'
import ParkingAssistant from '@/components/ParkingAssistant'
import SalesWidget from '@/components/SalesWidget'
import AnalyticsCharts from '@/components/AnalyticsCharts'
import ResponsiveDashboard from '@/components/ResponsiveDashboard'

import { 
  Fuel, Wrench, Bell, Map, Package, Warehouse, 
  Lock, Pencil, Activity, FileText, 
  ShieldCheck, Disc, Snowflake, Sun, Wallet, Banknote, 
  Sparkles, Lightbulb, Plus, Trash2, Gauge, History, 
  ChevronRight, CarFront
} from 'lucide-react';

// --- TÍPUSOK ---
type Car = {
  id: number;
  make: string; model: string; plate: string; year: number; mileage: number; 
  image_url: string | null; mot_expiry: string | null; insurance_expiry: string | null; 
  service_interval_km: number; last_service_mileage: number; fuel_type: string; 
  color: string | null; vin: string | null; share_token?: string | null; 
  is_for_sale?: boolean | null; hide_prices?: boolean | null; hide_sensitive?: boolean | null 
}

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

type Props = { params: Promise<{ id: string }> }

export default async function CarDetailsPage(props: Props) {
  const params = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [carRes, eventsRes, remindersRes, tiresRes, docsRes, vigRes, parkingRes] = await Promise.all([
    supabase.from('cars').select('*').eq('id', params.id).single(),
    supabase.from('events').select('*').eq('car_id', params.id).order('event_date', { ascending: false }),
    supabase.from('service_reminders').select('*').eq('car_id', params.id).order('due_date', { ascending: true }),
    supabase.from('tires').select('*').eq('car_id', params.id).order('is_mounted', { ascending: false }),
    supabase.from('car_documents').select('*').eq('car_id', params.id).order('created_at', { ascending: false }),
    supabase.from('vignettes').select('*').eq('car_id', params.id),
    supabase.from('parking_sessions').select('*').eq('car_id', params.id).maybeSingle()
  ])

  if (carRes.error || !carRes.data) return notFound()

  const car: Car = carRes.data
  const safeEvents = eventsRes.data || []
  const safeReminders = remindersRes.data || []
  const safeTires = tiresRes.data || []
  const safeDocs = docsRes.data || []
  const safeVignettes = vigRes.data || []
  const activeParking = parkingRes.data || null

  let plan: SubscriptionPlan = 'free';
  if (user) plan = await getSubscriptionStatus(user.id);
  const isPro = plan === 'pro' || plan === 'lifetime';

  // --- Calculations ---
  const totalCost = safeEvents.reduce((sum, e) => sum + (e.cost || 0), 0)
  const serviceCost = safeEvents.filter(e => e.type === 'service').reduce((sum, e) => sum + (e.cost || 0), 0)
  const fuelCost = safeEvents.filter(e => e.type === 'fuel').reduce((sum, e) => sum + (e.cost || 0), 0)
  
  const fuelEvents = safeEvents.filter(e => e.type === 'fuel' && e.mileage && e.liters).sort((a, b) => a.mileage - b.mileage)
  let avgConsumption = "Nincs adat"
  if (fuelEvents.length >= 2) {
    const totalLiters = fuelEvents.reduce((sum, e) => sum + (e.liters || 0), 0) - (fuelEvents[0].liters || 0)
    const distanceDelta = fuelEvents[fuelEvents.length - 1].mileage - fuelEvents[0].mileage
    if (distanceDelta > 0) avgConsumption = `${((totalLiters / distanceDelta) * 100).toFixed(1)} L`
  }

  // --- Service Logic ---
  const serviceIntervalKm = car.service_interval_km || 15000;
  let baseKm = car.last_service_mileage || 0;
  const lastServiceEvent = safeEvents.find(e => e.type === 'service');
  if (lastServiceEvent && lastServiceEvent.mileage > baseKm) baseKm = lastServiceEvent.mileage;
  if (baseKm === 0) baseKm = car.mileage; 

  const nextServiceKm = baseKm + serviceIntervalKm;
  const kmRemaining = nextServiceKm - car.mileage;
  const kmSinceService = car.mileage - baseKm;

  let healthStatus = { text: "Kiváló", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-500" };
  if (kmRemaining <= 0) healthStatus = { text: "Szerviz Most!", color: "text-red-500 bg-red-500/10 border-red-500/20", dot: "bg-red-500 animate-pulse" };
  else if (kmRemaining < 2000) healthStatus = { text: "Hamarosan", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-500" };

  const percentageUsed = Math.min(100, Math.max(0, (kmSinceService / serviceIntervalKm) * 100));
  const oilLife = 100 - percentageUsed;
  const motStatus = getExpiryStatus(car.mot_expiry);
  const insuranceStatus = getExpiryStatus(car.insurance_expiry);

  // --- Smart Tips ---
  const smartTips = [];
  if (oilLife < 15) smartTips.push("Az olajcsere nagyon hamarosan esedékes.");
  if (car.mileage > 200000) smartTips.push("200e km felett érdemes ellenőrizni a vezérlést.");
  if (motStatus.alert) smartTips.push(`A műszaki vizsga kritikus: ${motStatus.status}`);
  if (safeTires.length === 0) smartTips.push("Rögzítsd a téli/nyári gumikat a Gumihotelben.");
  if (smartTips.length === 0) smartTips.push("Minden rendszer rendben. Biztonságos utat!");

  const healthProps = { car, oilLife, kmSinceService, serviceIntervalKm, kmRemaining, motStatus, insuranceStatus }
  const techProps = { car, avgConsumption }
  const costProps = { total: totalCost, fuel: fuelCost, service: serviceCost }
  const carIdString = car.id.toString();

  // --- WIDGET DEFINITIONS ---
  const WidgetParking = <ParkingAssistant carId={carIdString} activeSession={activeParking} />;
  const WidgetHealth = <HealthCard {...healthProps} />;
  const WidgetCost = <CostCard {...costProps} />;
  const WidgetSales = isPro ? <SalesWidget car={car} /> : <ProTeaser />;
  const WidgetSpecs = <TechnicalSpecs {...techProps} />;
  const WidgetVignette = <VignetteManager carId={carIdString} vignettes={safeVignettes} />;
  const WidgetTires = <TireHotelCard tires={safeTires} carMileage={car.mileage} carId={carIdString} />;
  const WidgetDocs = isPro ? <DocumentManager carId={carIdString} documents={safeDocs} /> : (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-400" /> Digitális Kesztyűtartó
            </h3>
            <Lock className="w-4 h-4 text-amber-500" />
        </div>
        <LockedFeature label="dokumentum kezelés" />
    </div>
  );
  const WidgetTips = isPro ? <SmartTipsCard tips={smartTips} /> : null;
  const WidgetReminders = <RemindersList reminders={safeReminders} carId={carIdString} />;
  
  // Itt van a grafikon widget definiálása
  const WidgetCharts = <AnalyticsCharts events={safeEvents} />;
  
  const WidgetLog = <EventLog events={safeEvents} carId={carIdString} />;

  // --- MOBILE TABS CONTENT ---
  const mobileTabs = {
    overview: <div className="space-y-6">{WidgetParking}{WidgetHealth}{WidgetCost}{WidgetSales}</div>,
    services: <div className="space-y-6">{WidgetSpecs}{WidgetVignette}{WidgetTires}{WidgetDocs}</div>,
    // Itt van a grafikon a mobilos Napló fülben
    log: <div className="space-y-6">{WidgetTips}{WidgetReminders}{WidgetCharts}{WidgetLog}</div>
  };

  // --- DESKTOP BENTO GRID CONTENT ---
  const DesktopLayout = (
    <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* BAL OSZLOP (Fő tartalom) - 8 egység széles */}
        <div className="col-span-12 lg:col-span-8 space-y-6 lg:space-y-8">
            {/* Statisztikai Sor */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                 {WidgetHealth}
                 <div className="space-y-6">
                    {WidgetParking}
                    {WidgetCost}
                 </div>
            </div>

            {/* Itt van a grafikon a desktop nézetben */}
            {WidgetCharts}

            {/* Napló teljes szélességben */}
            {WidgetLog}
        </div>

        {/* JOBB OSZLOP (Sidebar) - 4 egység széles, Sticky */}
        <div className="col-span-12 lg:col-span-4 space-y-6 sticky top-24">
             {WidgetSales}
             {WidgetTips}
             {WidgetReminders}
             
             {/* Kisebb widgetek csoportosítva egy konténerbe */}
             <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                 <div className="px-2 pt-2">{WidgetSpecs}</div>
                 <div className="px-2">{WidgetVignette}</div>
                 <div className="px-2">{WidgetTires}</div>
                 <div className="p-2">{WidgetDocs}</div>
             </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-32 md:pb-20 transition-colors duration-300">
      
      {/* HEADER SECTION - Javított dizájnnal */}
      <HeaderSection car={car} healthStatus={healthStatus} nextServiceKm={nextServiceKm} kmRemaining={kmRemaining} safeEvents={safeEvents} isPro={isPro} />
      
      {/* ACTION GRID (Desktop Only) */}
      <DesktopActionGrid carId={carIdString} />

      {/* MAIN CONTENT AREA */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-20">
        <ResponsiveDashboard 
            mobileTabs={mobileTabs}
            desktopContent={DesktopLayout}
        />
      </div>

      {/* MOBILE FLOATING NAV */}
      <MobileBottomNav carId={carIdString} />
    </div>
  )
}

// --- SUB-COMPONENTS (UI Elemek) ---

function ProTeaser() {
    return (
        <div className="relative group overflow-hidden rounded-2xl border border-indigo-500/30 bg-slate-900 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 opacity-100 transition-opacity group-hover:opacity-80"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl"></div>
            <div className="relative p-6 flex flex-col items-center text-center z-10">
                <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30 text-white transform group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">AI Asszisztens</h3>
                <p className="text-sm text-indigo-200/80 mb-5 leading-relaxed">Generálj eladási adatlapot és kapj személyre szabott tippeket.</p>
                <Link href="/pricing" className="inline-flex items-center gap-2 bg-white text-indigo-900 hover:bg-indigo-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5">
                    <Lock className="w-4 h-4" /> Előfizetés
                </Link>
            </div>
        </div>
    )
}

function HeaderSection({ car, healthStatus, nextServiceKm, kmRemaining, safeEvents, isPro }: any) {
    return (
        // JAVÍTÁS: PC-n fix magasságot (h-[28rem]) adtam vissza, hogy legyen elég hely a tartalomnak
        <div className="relative bg-slate-900 w-full overflow-hidden shadow-2xl shrink-0 group min-h-[22rem] md:h-[28rem]">
            {car.image_url && (
                <div className="absolute inset-0 z-0">
                    <Image src={car.image_url} alt="Background" fill className="object-cover opacity-50 blur-xl scale-110" priority />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/80 to-slate-50 dark:to-slate-950 z-10" />
                </div>
            )}
            
            {/* JAVÍTÁS: md:justify-center visszakerült PC-re, hogy vertikálisan középen legyen */}
            {/* Mobilon (alapértelmezett) marad a justify-end és pb-8, ahogy kérted */}
            <div className="relative z-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-8 pt-20 md:pt-0 md:pb-0 md:justify-center">
                
                {/* Top Nav */}
                <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-30">
                    <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 transition-all hover:bg-white/10">
                        <Warehouse className="w-4 h-4" />
                        <span className="hidden sm:inline font-bold text-sm">Garázs</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        {isPro ? (
                             <ExportMenu car={car} events={safeEvents} />
                        ) : (
                            <Link href="/pricing" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/40 border border-amber-500/30 px-3 py-2 rounded-full hover:bg-amber-900/50 transition-colors">
                                <Lock className="w-3 h-3" /> Pro
                            </Link>
                        )}
                        <Link href={`/cars/${car.id}/edit`} className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full backdrop-blur-md transition-colors border border-white/10">
                            <Pencil className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 mt-6 md:mt-0">
                    {/* Autó Kép */}
                    <div className="w-32 h-32 md:w-52 md:h-52 rounded-[2rem] border-4 border-white/10 shadow-2xl overflow-hidden relative flex-shrink-0 bg-slate-800 group-hover:scale-105 transition-transform duration-500 ease-out">
                        {car.image_url ? (
                            <Image src={car.image_url} alt="Car" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-800">
                                <CarFront className="w-12 h-12 mb-2 opacity-50" />
                            </div>
                        )}
                    </div>
                    
                    {/* Szöveges Infók */}
                    <div className="text-center md:text-left flex-1 space-y-3 pb-2 w-full">
                         <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] md:text-xs font-bold uppercase tracking-widest ${healthStatus.color} backdrop-blur-md`}>
                            <span className={`w-2 h-2 rounded-full ${healthStatus.dot}`}></span>
                            {healthStatus.text}
                        </div>
                        
                        <div>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none mb-1 break-words">
                                {car.make} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">{car.model}</span>
                            </h1>
                            <p className="text-slate-300/80 font-mono text-lg md:text-xl tracking-widest">{car.plate}</p>
                        </div>

                        {/* Badge-ek - Mobilon középen, PC-n balra igazítva */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-1 w-full">
                            <StatBadge label="Futásteljesítmény" value={`${car.mileage.toLocaleString()} km`} />
                            <StatBadge label="Szervizig" value={`${kmRemaining.toLocaleString()} km`} valueColor={kmRemaining <= 1000 ? 'text-red-400' : 'text-emerald-400'} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatBadge({ label, value, valueColor = "text-white" }: any) {
    return (
        // JAVÍTÁS: flex-grow mobilon, hogy kitöltse a teret, ha kell
        <div className="bg-slate-900/80 px-4 py-2 md:py-3 rounded-xl border border-white/10 backdrop-blur-md shadow-lg flex flex-col items-center justify-center min-w-[120px] flex-grow md:flex-grow-0">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">{label}</p>
            <p className={`font-mono font-bold text-sm md:text-lg ${valueColor} drop-shadow-sm`}>{value}</p>
        </div>
    )
}

function MobileBottomNav({ carId }: { carId: string }) {
    const btnBase = "flex flex-col items-center justify-center gap-1.5 py-2 rounded-2xl transition-all active:scale-95";
    return (
        <div className="md:hidden fixed bottom-6 left-4 right-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl z-50">
            <div className="grid grid-cols-5 gap-1 p-2">
                <Link href={`/cars/${carId}/events/new?type=fuel`} className={`${btnBase} text-amber-500 hover:bg-white/5`}>
                    <Fuel className="w-5 h-5" /><span className="text-[9px] font-bold">Tankol</span>
                </Link>
                <Link href={`/cars/${carId}/events/new?type=service`} className={`${btnBase} text-slate-300 hover:bg-white/5`}>
                    <Wrench className="w-5 h-5" /><span className="text-[9px] font-bold">Szerviz</span>
                </Link>
                <Link href={`/cars/${carId}/reminders/new`} className={`${btnBase} text-indigo-400 hover:bg-white/5`}>
                    <Bell className="w-5 h-5" /><span className="text-[9px] font-bold">Emlék.</span>
                </Link>
                <Link href={`/cars/${carId}/trips`} className={`${btnBase} text-blue-400 hover:bg-white/5`}>
                    <Map className="w-5 h-5" /><span className="text-[9px] font-bold">Utak</span>
                </Link>
                <Link href={`/cars/${carId}/parts`} className={`${btnBase} text-emerald-400 hover:bg-white/5`}>
                    <Package className="w-5 h-5" /><span className="text-[9px] font-bold">Alkatr.</span>
                </Link>
            </div>
        </div>
    )
}

function DesktopActionGrid({ carId }: { carId: string }) {
    const btnClass = "group h-16 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all hover:-translate-y-1 font-bold border border-transparent overflow-hidden relative";
    const shine = "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer";
    
    return (
        // JAVÍTÁS: A -mt-8 (negatív margin) miatt lógnak bele a gombok a képbe.
        // Ez PC-n szép design elem ("floating cards"), de ha neked ez "felcsúszásnak" tűnik,
        // akkor itt állíthatod. Most hagytam -mt-8-on, de biztosítottam a z-indexet (z-30).
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-30 hidden md:grid grid-cols-5 gap-4">
             <Link href={`/cars/${carId}/events/new?type=fuel`} className={`${btnClass} bg-amber-500 hover:bg-amber-400 text-slate-900`}>
                <div className={shine} />
                <Fuel className="w-5 h-5" />Tankolás
             </Link>
             <Link href={`/cars/${carId}/events/new?type=service`} className={`${btnClass} bg-slate-800 hover:bg-slate-700 text-white`}>
                <div className={shine} />
                <Wrench className="w-5 h-5" />Szerviz
             </Link>
             <Link href={`/cars/${carId}/reminders/new`} className={`${btnClass} bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border-slate-200 dark:border-slate-700`}>
                <Bell className="w-5 h-5" />Emlékeztető
             </Link>
             <Link href={`/cars/${carId}/trips`} className={`${btnClass} bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border-slate-200 dark:border-slate-700`}>
                <Map className="w-5 h-5" />Útnyilvántartás
             </Link>
             <Link href={`/cars/${carId}/parts`} className={`${btnClass} bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 border-slate-200 dark:border-slate-700`}>
                <Package className="w-5 h-5" />Alkatrészek
             </Link>
        </div>
    )
}

function HealthCard({ car, oilLife, kmSinceService, serviceIntervalKm, kmRemaining, motStatus, insuranceStatus }: any) {
    const safeOilLife = Math.min(100, Math.max(0, oilLife));
    let colorClass = 'text-emerald-500';
    let trackColor = 'bg-emerald-500';
    if (safeOilLife < 20) { colorClass = 'text-red-500'; trackColor = 'bg-red-500'; } 
    else if (safeOilLife < 50) { colorClass = 'text-amber-500'; trackColor = 'bg-amber-500'; }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Activity className="w-5 h-5 text-slate-400" />Állapot</h3>
                <form action={resetServiceCounter}>
                    <input type="hidden" name="car_id" value={car.id.toString()} />
                    <button className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors">Nullázás</button>
                </form>
            </div>
            <div className="flex items-center gap-6 mb-8">
                <div className="flex-1 space-y-4">
                    <div>
                        <div className="flex justify-between items-end mb-2">
                             <span className="text-xs font-bold text-slate-400 uppercase">Olaj Élettartam</span>
                             <span className={`text-xl font-black ${colorClass}`}>{Math.round(safeOilLife)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-1000 ${trackColor}`} style={{ width: `${safeOilLife}%` }}></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                         <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                             <p className="text-[10px] text-slate-400 uppercase font-bold">Még megtehető</p>
                             <p className="font-bold text-slate-800 dark:text-slate-200">{kmRemaining > 0 ? `${Math.round(kmRemaining).toLocaleString()} km` : 'Túlfutás!'}</p>
                         </div>
                         <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                             <p className="text-[10px] text-slate-400 uppercase font-bold">Ciklus</p>
                             <p className="font-bold text-slate-800 dark:text-slate-200">{serviceIntervalKm.toLocaleString()} km</p>
                         </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
                <StatusItem label="Műszaki Vizsga" data={motStatus} iconType="file" />
                <StatusItem label="Biztosítás" data={insuranceStatus} iconType="shield" />
            </div>
        </div>
    )
}

function StatusItem({ label, data, iconType }: any) {
    return (
        <div className={`flex items-center justify-between p-3 rounded-xl border ${data.bg} ${data.alert ? 'border-red-200 dark:border-red-900/50' : 'border-slate-100 dark:border-slate-800'}`}>
            <div className="flex items-center gap-3">
                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${data.alert ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-white dark:bg-slate-800 text-emerald-500'}`}>
                    {iconType === 'file' ? <FileText className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                 </div>
                 <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{label}</p>
                    <p className={`text-sm font-bold ${data.color}`}>{data.status}</p>
                 </div>
            </div>
            {data.alert && <span className="text-xs">⚠️</span>}
        </div>
    )
}

function TireHotelCard({ tires, carMileage, carId }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Disc className="w-5 h-5 text-slate-400" />Gumi Hotel</h3>
                <Link href={`/cars/${carId}/edit`} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded hover:bg-slate-200 transition-colors">Kezelés</Link>
            </div>
            <div className="space-y-3">
                {tires.length > 0 ? (
                    tires.slice(0,2).map((tire: any) => {
                        let currentDistance = tire.total_distance;
                        if (tire.is_mounted) currentDistance += (carMileage - (tire.mounted_at_mileage || carMileage));
                        return (
                            <div key={tire.id} className={`flex items-center justify-between p-3 rounded-xl border ${tire.is_mounted ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="text-xl">{tire.type === 'winter' ? <Snowflake className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-amber-500" />}</div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{tire.brand}</p>
                                        <p className="text-[10px] text-slate-500 font-mono">{currentDistance.toLocaleString()} km</p>
                                    </div>
                                </div>
                                {tire.is_mounted && <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-indigo-950 px-2 py-0.5 rounded shadow-sm">Aktív</span>}
                            </div>
                        )
                    })
                ) : (
                    <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">Nincs rögzített abroncs.</p>
                )}
            </div>
        </div>
    )
}

function CostCard({ total, fuel, service }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6"><Wallet className="w-5 h-5 text-slate-400" />Költségek</h3>
            <div className="flex items-center gap-5 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-500 shadow-inner">
                    <Banknote className="w-7 h-7" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Eddigi Összes</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{total.toLocaleString()} Ft</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                 <CostItem label="Üzemanyag" value={fuel} icon={<Fuel className="w-3 h-3" />} />
                 <CostItem label="Szerviz" value={service} icon={<Wrench className="w-3 h-3" />} />
            </div>
        </div>
    )
}

function CostItem({ label, value, icon }: any) {
    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                {icon}
                <span className="text-[10px] uppercase font-bold">{label}</span>
            </div>
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{value.toLocaleString()} Ft</p>
        </div>
    )
}

function SmartTipsCard({ tips }: { tips: string[] }) {
    return (
        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden group">
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
             <div className="flex items-center gap-2 mb-4 relative z-10">
                 <div className="p-1.5 bg-yellow-400/20 rounded-lg"><Lightbulb className="w-4 h-4 text-yellow-300" /></div>
                 <h3 className="font-bold text-sm">AI Szerelő Tippek</h3>
             </div>
             <div className="space-y-3 relative z-10">
                 {tips.map((tip, i) => (
                     <div key={i} className="flex gap-3 items-start text-xs md:text-sm text-indigo-100/90 bg-black/10 p-2 rounded-lg border border-white/5">
                         <span className="mt-1 w-1.5 h-1.5 bg-yellow-400 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(250,204,21,0.6)]"></span>
                         <p className="leading-snug">{tip}</p>
                     </div>
                 ))}
             </div>
        </div>
    )
}

function RemindersList({ reminders, carId }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                   <div className="relative flex h-2.5 w-2.5">
                      {reminders.length > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${reminders.length > 0 ? 'bg-red-500' : 'bg-slate-300'}`}></span>
                   </div>
                   Teendők
                </h3>
                <Link href={`/cars/${carId}/reminders/new`} className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1 shadow-sm"><Plus className="w-3 h-3" /> Új</Link>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {reminders.length > 0 ? (
                   reminders.map((rem: any) => (
                      <div key={rem.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex flex-col items-center justify-center border border-indigo-100 dark:border-indigo-900/30 flex-shrink-0">
                              <span className="text-[10px] font-bold uppercase">{new Date(rem.due_date).toLocaleString('hu-HU', { month: 'short' }).replace('.', '')}</span>
                              <span className="text-lg font-black leading-none">{new Date(rem.due_date).getDate()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{rem.service_type}</p>
                              <p className="text-xs text-slate-500 truncate">{rem.note || 'Nincs megjegyzés'}</p>
                          </div>
                          <form action={deleteReminder}>
                              <input type="hidden" name="id" value={rem.id} />
                              <input type="hidden" name="car_id" value={carId} />
                              <button className="p-2 text-slate-300 hover:text-red-500 transition-colors md:opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                          </form>
                      </div>
                   ))
                ) : (
                   <div className="p-8 text-center text-slate-400 text-sm italic">Minden teendő elvégezve.</div>
                )}
            </div>
        </div>
    )
}

function TechnicalSpecs({ car, avgConsumption }: any) {
    const fuelTranslations: Record<string, string> = { 'petrol': 'Benzin', 'diesel': 'Dízel', 'electric': 'Elektromos', 'hybrid': 'Hibrid', 'lpg': 'Gáz (LPG)', 'cng': 'Gáz (CNG)' };
    const displayFuel = fuelTranslations[car.fuel_type.toLowerCase()] || car.fuel_type;
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2"><Gauge className="w-5 h-5 text-slate-400" />Specifikációk</h3>
            <div className="grid grid-cols-2 gap-4">
                <DataPoint label="Futás" value={`${car.mileage.toLocaleString()} km`} />
                <DataPoint label="Évjárat" value={car.year} />
                <DataPoint label="Üzemanyag" value={displayFuel} capitalize />
                <DataPoint label="Szín" value={car.color || '-'} />
                <DataPoint label="Fogyasztás" value={avgConsumption === 'N/A' ? '-' : `${avgConsumption}`} highlight />
                <DataPoint label="VIN / Alvázszám" value={car.vin || 'N/A'} mono />
            </div>
        </div>
    )
}

function DataPoint({ label, value, mono, capitalize, highlight }: any) {
    return (
        <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{label}</span>
            <span className={`text-sm font-bold ${mono ? 'font-mono text-xs' : ''} ${capitalize ? 'capitalize' : ''} ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-200'}`}>{value}</span>
        </div>
    )
}

function EventLog({ events, carId }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><History className="w-5 h-5 text-slate-400" />Események</h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{events.length} bejegyzés</span>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-[500px] overflow-y-auto custom-scrollbar">
                {events.length > 0 ? (
                    events.map((event: any) => (
                        <div key={event.id} className="relative p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                            <Link href={`/cars/${carId}/events/${event.id}/edit`} className="flex gap-4 items-start">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${event.type === 'fuel' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 text-amber-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600'}`}>
                                    {event.type === 'fuel' ? <Fuel className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{event.title}</h4>
                                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs flex-shrink-0">-{event.cost.toLocaleString()} Ft</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span>{new Date(event.event_date).toLocaleDateString('hu-HU')}</span>
                                        <span>•</span>
                                        <span>{event.mileage.toLocaleString()} km</span>
                                        {event.liters && <span className="text-amber-600 dark:text-amber-500">• {event.liters}L</span>}
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 self-center" />
                            </Link>
                            <form action={deleteEvent} className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <input type="hidden" name="event_id" value={event.id} />
                                <input type="hidden" name="car_id" value={carId} />
                                <button className="p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </form>
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center text-slate-400 text-sm italic">Nincs rögzített esemény.</div>
                )}
            </div>
        </div>
    )
}