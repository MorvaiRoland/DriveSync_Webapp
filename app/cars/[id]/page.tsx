import { createClient } from '@/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { deleteEvent, deleteReminder } from './actions'
import DocumentManager from './DocumentManager'
import ExportMenu from '@/components/ExportMenu'
import PublicToggle from '@/components/PublicToggle'
import { getSubscriptionStatus, PLAN_LIMITS, type SubscriptionPlan } from '@/utils/subscription'
import VignetteManager from '@/components/VignetteManager'
import SmartParkingWidget from '@/components/SmartParkingWidget' 
import SalesWidget from '@/components/SalesWidget'
import AnalyticsCharts from '@/components/AnalyticsCharts'
import ResponsiveDashboard from '@/components/ResponsiveDashboard'
import PredictiveMaintenance from '@/components/PredictiveMaintenance'
import CarHealthWidget from '@/components/CarHealthWidget'

import { 
  Fuel, Wrench, Bell, Map, Package, Warehouse, 
  Pencil, FileText, Lock, 
  ShieldCheck, Disc, Snowflake, Sun, Wallet, Banknote, 
  Sparkles, Lightbulb, Plus, Trash2, Gauge, History, 
  ChevronRight, CarFront, Zap, TrendingUp, TrendingDown, 
  Droplet, MapPin, Calendar, ArrowRight, Search
} from 'lucide-react';

// --- TÍPUSOK ---
type Car = {
  id: number;
  make: string; model: string; plate: string; year: number; mileage: number; 
  image_url: string | null; mot_expiry: string | null; insurance_expiry: string | null; 
  service_interval_km: number; last_service_mileage: number; fuel_type: string; 
  color: string | null; vin: string | null; share_token?: string | null; 
  is_for_sale?: boolean | null; hide_prices?: boolean | null; hide_sensitive?: boolean | null;
  transmission?: string | null; engine_size?: number | null; power_hp?: number | null;
  is_public_history?: boolean; 
}

const MOBILE_CARD_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

const getExpiryStatus = (dateString: string | null) => {
  if (!dateString) return { label: 'Nincs megadva', status: 'Kitöltés...', alert: false, color: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/50 border-dashed'};
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

  if (!user) return notFound()

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

  // --- ELŐFIZETÉS ELLENŐRZÉS ---
  const { plan } = await getSubscriptionStatus(supabase, user.id);
  const limits = PLAN_LIMITS[plan];
  
  const isPro = limits.aiMechanic; 
  const canServiceMap = limits.serviceMap;
  const canVinSearch = limits.vinSearch;
  const canExport = limits.export; // Export jog
  const canMileageLog = limits.mileageLog; // Útnyilvántartás jog

  // --- Calculations ---
  const totalCost = safeEvents.reduce((sum, e) => sum + (e.cost || 0), 0)
  const serviceCost = safeEvents.filter(e => e.type === 'service').reduce((sum, e) => sum + (e.cost || 0), 0)
  const fuelCost = safeEvents.filter(e => e.type === 'fuel').reduce((sum, e) => sum + (e.cost || 0), 0)
  
  const fuelEvents = safeEvents.filter(e => e.type === 'fuel' && e.mileage && e.liters).sort((a, b) => a.mileage - b.mileage)
  let avgConsumption = "Nincs adat"
  
  const isElectric = car.fuel_type === 'Elektromos';
  const unit = isElectric ? 'kWh' : 'L';

  if (fuelEvents.length >= 2) {
    const totalLiters = fuelEvents.reduce((sum, e) => sum + (e.liters || 0), 0) - (fuelEvents[0].liters || 0)
    const distanceDelta = fuelEvents[fuelEvents.length - 1].mileage - fuelEvents[0].mileage
    if (distanceDelta > 0) avgConsumption = `${((totalLiters / distanceDelta) * 100).toFixed(1)} ${unit}`
  }

  // --- Service Logic ---
  const serviceIntervalKm = car.service_interval_km || (isElectric ? 30000 : 15000); 
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
  if (!isElectric && oilLife < 15) smartTips.push("Az olajcsere nagyon hamarosan esedékes.");
  if (isElectric && kmRemaining < 2000) smartTips.push("Közeleg a kötelező átvizsgálás ideje.");
  if (car.mileage > 200000) smartTips.push(isElectric ? "200e km felett érdemes az akku SOH mérése." : "200e km felett érdemes ellenőrizni a vezérlést.");
  if (motStatus.alert) smartTips.push(`A műszaki vizsga kritikus: ${motStatus.status}`);
  if (safeTires.length === 0) smartTips.push("Rögzítsd a téli/nyári gumikat a Gumihotelben.");
  if (smartTips.length === 0) smartTips.push("Minden rendszer rendben. Biztonságos utat!");

  const healthProps = { car, oilLife, kmSinceService, serviceIntervalKm, kmRemaining, motStatus, insuranceStatus }
  const techProps = { car, avgConsumption, isElectric, canVinSearch }
  const costProps = { total: totalCost, fuel: fuelCost, service: serviceCost, isElectric }
  const carIdString = car.id.toString();
  const isPublic = car.is_public_history || false; 

  // --- WIDGET LOGIKA ---
  const WidgetParking = <SmartParkingWidget carId={carIdString} activeSession={activeParking} />;
  const WidgetHealth = <CarHealthWidget {...healthProps} />;
  
  const WidgetPrediction = isPro 
    ? <PredictiveMaintenance carId={car.id} carName={`${car.make} ${car.model}`} /> 
    : <PremiumLockWidget title="Prediktív Karbantartás" icon={<Sparkles className="w-5 h-5 text-amber-500" />} />;
    
  const WidgetTips = isPro 
    ? <SmartTipsCard tips={smartTips} /> 
    : <PremiumLockWidget title="AI Szerelő Tippek" icon={<Lightbulb className="w-5 h-5 text-yellow-400" />} />;

  const WidgetCost = <CostCard {...costProps} />;
  const WidgetSales = <SalesWidget car={car} />;
  const WidgetSpecs = <TechnicalSpecs {...techProps} />;
  const WidgetVignette = <VignetteManager carId={carIdString} vignettes={safeVignettes} />;
  const WidgetTires = <TireHotelCard tires={safeTires} carMileage={car.mileage} carId={carIdString} />;
  const WidgetDocs = <DocumentManager carId={carIdString} documents={safeDocs} />;
  const WidgetReminders = <RemindersList reminders={safeReminders} carId={carIdString} />;
  const WidgetCharts = <AnalyticsCharts events={safeEvents} isPro={isPro} />;
  const WidgetLog = <EventLog events={safeEvents} carId={carIdString} />;
  const WidgetFuel = <FuelTrackerCard events={safeEvents} isElectric={isElectric} carMileage={car.mileage} />;

  // --- MOBILE TABS CONTENT ---
  const mobileTabs = {
    overview: (
        <div className="space-y-6">
            <PublicToggle carId={carIdString} isPublicInitial={isPublic} />
            {WidgetHealth}
            {WidgetCost}
            {WidgetFuel}
            {WidgetParking}
            {WidgetPrediction}
            {WidgetSales}
        </div>
    ),
    services: <div className="space-y-6">{WidgetSpecs}{WidgetVignette}{WidgetTires}{WidgetDocs}</div>,
    log: <div className="space-y-6">{WidgetTips}{WidgetReminders}{WidgetCharts}{WidgetLog}</div>
  };

  // --- DESKTOP BENTO GRID CONTENT ---
  const DesktopLayout = (
    <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="col-span-12 lg:col-span-8 space-y-6 lg:space-y-8">
            <PublicToggle carId={carIdString} isPublicInitial={isPublic} />
            
            {/* SOR 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {WidgetHealth}
                 {WidgetCost}
            </div>

            {/* SOR 2 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                 <div>{WidgetFuel}</div>
                 <div className="space-y-6">
                    {WidgetParking}
                    {WidgetPrediction}
                 </div>
            </div>

            {/* SOR 3 */}
            {WidgetCharts}
            {WidgetLog}
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6 sticky top-24">
             {WidgetSales}
             {WidgetTips}
             {WidgetReminders}
             
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
      <HeaderSection 
         car={car} 
         healthStatus={healthStatus} 
         nextServiceKm={nextServiceKm} 
         kmRemaining={kmRemaining} 
         safeEvents={safeEvents} 
         isPro={isPro} 
         canExport={canExport} // ÚJ PROP
      />
      
      {/* DESKTOP ACTION GRID - SZERVIZ TÉRKÉP ÉS ÚTNYILVÁNTARTÁS LIMITTEL */}
      <DesktopActionGrid carId={carIdString} isElectric={isElectric} canServiceMap={canServiceMap} canMileageLog={canMileageLog} />
      
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-20">
        <ResponsiveDashboard mobileTabs={mobileTabs} desktopContent={DesktopLayout} />
      </div>
      <MobileBottomNav carId={carIdString} isElectric={isElectric} canMileageLog={canMileageLog} />
    </div>
  )
}

// --- SUB-COMPONENTS ---

// *** PRÉMIUM FUNKCIÓ LEZÁRÓ WIDGET ***
function PremiumLockWidget({ title, icon }: { title: string, icon: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-4">
                {icon}
                <h3 className="font-bold text-slate-400 dark:text-slate-500">{title}</h3>
            </div>
            <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-4">
                <Lock className="w-8 h-8 text-amber-500 mb-2" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">Prémium Funkció</p>
                <Link href="/pricing" className="mt-3 text-xs font-bold text-white bg-amber-500 px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors">
                    Feloldás
                </Link>
            </div>
            {/* Fake Content Background */}
            <div className="space-y-3 opacity-30 blur-sm pointer-events-none">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            </div>
        </div>
    )
}

function EventLog({ events, carId }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <History className="w-5 h-5 text-slate-400" /> Eseménytörténet
                </h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{events.length} bejegyzés</span>
            </div>
            
            <div className="p-6 max-h-[500px] overflow-y-auto custom-scrollbar">
                {events.length > 0 ? (
                    <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-8">
                        {events.map((event: any, index: number) => (
                            <div key={event.id} className="relative pl-8 group">
                                <div className={`absolute -left-[9px] top-4 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 ${
                                    event.type === 'fuel' ? 'bg-amber-500' : 
                                    event.type === 'service' ? 'bg-indigo-500' : 'bg-slate-400'
                                } shadow-sm`}></div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-amber-500/30 hover:shadow-md transition-all relative overflow-hidden">
                                    <Link href={`/cars/${carId}/events/${event.id}/edit`} className="block p-4 z-0">
                                        <div className="flex justify-between items-start mb-2 pr-8"> 
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                                                    {new Date(event.event_date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </span>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-base">{event.title}</h4>
                                            </div>
                                            <span className={`font-mono font-bold whitespace-nowrap ${event.cost > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                                {event.cost > 0 ? `-${event.cost.toLocaleString()} Ft` : '-'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Gauge className="w-3.5 h-3.5" />
                                                {event.mileage.toLocaleString()} km
                                            </div>
                                            {event.liters && (
                                                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                                                    <Fuel className="w-3.5 h-3.5" />
                                                    {event.liters}L
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="absolute top-2 right-2 z-10">
                                         <form action={deleteEvent}>
                                            <input type="hidden" name="id" value={event.id} />
                                            <input type="hidden" name="car_id" value={carId} />
                                            <button 
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                                title="Bejegyzés törlése"
                                                type="submit"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                         </form>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center text-slate-400 text-sm italic">Nincs rögzített esemény.</div>
                )}
            </div>
        </div>
    )
}

function FuelTrackerCard({ events, isElectric, carMileage }: { events: any[], isElectric: boolean, carMileage: number }) {
  const fuelEvents = events
    .filter(e => e.type === 'fuel' && e.mileage && e.liters)
    .sort((a, b) => a.mileage - b.mileage);

  let totalLiters = 0;
  let totalCost = 0;
  const history = [];

  for (let i = 0; i < fuelEvents.length; i++) {
    const current = fuelEvents[i];
    
    totalLiters += current.liters || 0;
    totalCost += current.cost || 0;

    let stats = {
      consumption: 0,
      distance: 0,
      pricePerUnit: (current.cost && current.liters) ? Math.round(current.cost / current.liters) : 0,
    };

    if (i > 0) {
      const prev = fuelEvents[i - 1];
      const distance = current.mileage - prev.mileage;
      
      if (distance > 0) {
        const cons = (current.liters / distance) * 100;
        stats.consumption = cons;
        stats.distance = distance;
      }
    }
    history.push({ ...current, ...stats });
  }
  
  const validSegments = history.filter(h => h.consumption > 0 && h.consumption < 50);
  const avgCons = validSegments.length > 0 
    ? validSegments.reduce((sum, h) => sum + h.consumption, 0) / validSegments.length 
    : 0;
  
  const lastEvent = history[history.length - 1];
  const lastPricePerUnit = lastEvent ? lastEvent.pricePerUnit : 0;
  const lastDistance = lastEvent ? lastEvent.distance : 0;

  const displayHistory = [...history].reverse().slice(0, 4);

  const unit = isElectric ? 'kWh' : 'L';
  const currency = 'Ft';
  const themeColor = isElectric ? 'text-cyan-500' : 'text-amber-500';
  const lightBg = isElectric ? 'bg-cyan-50 dark:bg-cyan-900/20' : 'bg-amber-50 dark:bg-amber-900/20';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full relative group">
      <div className={`absolute top-0 right-0 w-32 h-32 ${isElectric ? 'bg-cyan-500/5' : 'bg-amber-500/5'} rounded-full blur-3xl -z-10 transition-all group-hover:scale-150`} />

      <div className="p-5 pb-2">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">
              Átlagfogyasztás
            </h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl md:text-5xl font-black tracking-tighter ${themeColor}`}>
                {avgCons > 0 ? avgCons.toFixed(1) : '-'}
              </span>
              <span className="text-slate-400 font-bold text-lg">
                {unit}/100km
              </span>
            </div>
          </div>
          <div className={`p-2.5 rounded-xl ${lightBg} ${themeColor}`}>
            {isElectric ? <Zap className="w-5 h-5" /> : <Fuel className="w-5 h-5" />}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <SummaryBox label="Egységár" value={lastPricePerUnit > 0 ? `${lastPricePerUnit} ${currency}` : '-'} subLabel={`/${unit}`} />
          <SummaryBox label="Előző Táv" value={lastDistance > 0 ? `${lastDistance} km` : '-'} subLabel="utolsó tankolás" />
          <SummaryBox label="Összesen" value={`${(totalCost/1000).toFixed(0)} E ${currency}`} subLabel={`${fuelEvents.length} alkalom`} />
        </div>
      </div>

      <div className="flex-1 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800/50 p-4">
        <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Legutóbbiak</h4>
        <div className="space-y-2">
          {displayHistory.length > 0 ? displayHistory.map((item, idx) => {
            const isBetter = item.consumption < avgCons;
            const diff = Math.abs(item.consumption - avgCons).toFixed(1);
            
            return (
              <div key={item.id || idx} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 transition-all shadow-sm hover:shadow-md">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center font-bold text-[10px] leading-none ${lightBg} ${themeColor}`}>
                      <span>{new Date(item.event_date).getMonth() + 1}.</span>
                      <span className="text-xs">{new Date(item.event_date).getDate()}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{item.title || 'Kút'}</p>
                      <div className="flex items-center gap-2 text-9px text-slate-400 font-medium">
                        <span className="flex items-center gap-1"><Gauge className="w-3 h-3"/> {item.mileage.toLocaleString()}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="flex items-center gap-1"><Droplet className="w-3 h-3"/> {item.liters}{unit}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                      {item.consumption > 0 ? (
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-slate-900 dark:text-white text-sm tabular-nums">
                            {item.consumption.toFixed(1)} <span className="text-[9px] text-slate-400 font-normal">{unit}</span>
                          </span>
                          <div className={`text-[9px] font-bold flex items-center gap-0.5 ${isBetter ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isBetter ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                            {diff}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[9px] text-slate-400 italic">Bázis</span>
                      )}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-4 text-slate-400 text-xs italic">Nincs elegendő adat.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryBox({ label, value, subLabel }: any) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-center md:text-left">
      <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5 truncate">{label}</p>
      <p className="font-bold text-slate-800 dark:text-slate-200 text-xs md:text-sm truncate">{value}</p>
      <p className="text-[9px] text-slate-400 truncate opacity-70">{subLabel}</p>
    </div>
  )
}

function HeaderSection({ car, healthStatus, nextServiceKm, kmRemaining, safeEvents, isPro, canExport }: any) {
    return (
        <div className="relative bg-slate-900 w-full overflow-hidden shadow-2xl shrink-0 group min-h-[22rem] md:h-[28rem]">
            {car.image_url && (
                <div className="absolute inset-0 z-0">
                    <Image src={car.image_url} alt="Background" fill className="object-cover opacity-50 blur-xl scale-110" priority />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/80 to-slate-50 dark:to-slate-950 z-10" />
                </div>
            )}
            
            <div className="relative z-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-8 pt-20 md:pt-0 md:pb-0 md:justify-center">
                <div className="absolute top-0 left-0 right-0 z-30 px-4 pb-4 md:px-6 md:pb-6 flex justify-between items-center pt-[calc(env(safe-area-inset-top)+1rem)]">
                    <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 transition-all hover:bg-white/10">
                        <Warehouse className="w-4 h-4" />
                        <span className="hidden sm:inline font-bold text-sm">Garázs</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        {/* --- EXPORT MENU - CSAK HA JOGOSULT --- */}
                        {canExport ? (
                            <ExportMenu car={car} events={safeEvents} />
                        ) : (
                            <Link href="/pricing" className="bg-black/20 hover:bg-black/30 text-white/70 p-2.5 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-1 text-xs font-bold">
                                <Lock className="w-3 h-3" /> Export
                            </Link>
                        )}

                        <Link href={`/cars/${car.id}/edit`} className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full backdrop-blur-md transition-colors border border-white/10">
                            <Pencil className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 mt-6 md:mt-0">
                    <div className="w-32 h-32 md:w-52 md:h-52 rounded-[2rem] border-4 border-white/10 shadow-2xl overflow-hidden relative flex-shrink-0 bg-slate-800 group-hover:scale-105 transition-transform duration-500 ease-out">
                        {car.image_url ? (
                            <Image src={car.image_url} alt="Car" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-800">
                                <CarFront className="w-12 h-12 mb-2 opacity-50" />
                            </div>
                        )}
                    </div>
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
        <div className="bg-slate-900/80 px-4 py-2 md:py-3 rounded-xl border border-white/10 backdrop-blur-md shadow-lg flex flex-col items-center justify-center min-w-[120px] flex-grow md:flex-grow-0">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">{label}</p>
            <p className={`font-mono font-bold text-sm md:text-lg ${valueColor} drop-shadow-sm`}>{value}</p>
        </div>
    )
}

function MobileBottomNav({ carId, isElectric, canMileageLog }: { carId: string, isElectric?: boolean, canMileageLog: boolean }) {
    const btnBase = "flex flex-col items-center justify-center gap-1.5 py-2 rounded-2xl transition-all active:scale-95";
    return (
        <div className="md:hidden fixed bottom-6 left-4 right-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl z-50">
            <div className="grid grid-cols-5 gap-1 p-2">
                <Link href={`/cars/${carId}/events/new?type=fuel`} className={`${btnBase} hover:bg-white/5 ${isElectric ? 'text-cyan-400' : 'text-amber-500'}`}>
                    {isElectric ? <Zap className="w-5 h-5" /> : <Fuel className="w-5 h-5" />}
                    <span className="text-[9px] font-bold">{isElectric ? 'Töltés' : 'Tankol'}</span>
                </Link>
                <Link href={`/cars/${carId}/events/new?type=service`} className={`${btnBase} text-slate-300 hover:bg-white/5`}>
                    <Wrench className="w-5 h-5" /><span className="text-[9px] font-bold">Szerviz</span>
                </Link>
                <Link href={`/cars/${carId}/reminders/new`} className={`${btnBase} text-indigo-400 hover:bg-white/5`}>
                    <Bell className="w-5 h-5" /><span className="text-[9px] font-bold">Emlék.</span>
                </Link>
                
                {/* --- ÚTNYILVÁNTARTÁS LIMIT --- */}
                {canMileageLog ? (
                    <Link href={`/cars/${carId}/trips`} className={`${btnBase} text-blue-400 hover:bg-white/5`}>
                        <Map className="w-5 h-5" /><span className="text-[9px] font-bold">Utak</span>
                    </Link>
                ) : (
                    <Link href="/pricing" className={`${btnBase} text-slate-500 opacity-70`}>
                        <Lock className="w-5 h-5" /><span className="text-[9px] font-bold">Utak</span>
                    </Link>
                )}

                <Link href={`/cars/${carId}/parts`} className={`${btnBase} text-emerald-400 hover:bg-white/5`}>
                    <Package className="w-5 h-5" /><span className="text-[9px] font-bold">Alkatr.</span>
                </Link>
            </div>
        </div>
    )
}

function DesktopActionGrid({ carId, isElectric, canServiceMap, canMileageLog }: { carId: string, isElectric?: boolean, canServiceMap: boolean, canMileageLog: boolean }) {
    const btnClass = "group h-16 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all hover:-translate-y-1 font-bold border border-transparent overflow-hidden relative";
    const shine = "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer";
    return (
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-30 hidden md:grid grid-cols-6 gap-4">
             <Link href={`/cars/${carId}/events/new?type=fuel`} className={`${btnClass} ${isElectric ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-slate-900'}`}>
                <div className={shine} />
                {isElectric ? <Zap className="w-5 h-5" /> : <Fuel className="w-5 h-5" />}
                {isElectric ? 'Töltés' : 'Tankolás'}
             </Link>
             <Link href={`/cars/${carId}/events/new?type=service`} className={`${btnClass} bg-slate-800 hover:bg-slate-700 text-white`}>
                <div className={shine} />
                <Wrench className="w-5 h-5" />Szerviz
             </Link>
             <Link href={`/cars/${carId}/reminders/new`} className={`${btnClass} bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border-slate-200 dark:border-slate-700`}>
                <Bell className="w-5 h-5" />Emlékeztető
             </Link>
             
             {/* --- ÚTNYILVÁNTARTÁS LIMIT --- */}
             {canMileageLog ? (
                <Link href={`/cars/${carId}/trips`} className={`${btnClass} bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border-slate-200 dark:border-slate-700`}>
                    <Map className="w-5 h-5" />Útnyilvántartás
                </Link>
             ) : (
                <Link href="/pricing" className={`${btnClass} bg-slate-100 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed border-slate-200 dark:border-slate-800`}>
                    <Lock className="w-4 h-4" />Útnyilvántartás
                </Link>
             )}

             <Link href={`/cars/${carId}/parts`} className={`${btnClass} bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 border-slate-200 dark:border-slate-700`}>
                <Package className="w-5 h-5" />Alkatrészek
             </Link>
             
             {/* SZERVIZ TÉRKÉP */}
             {canServiceMap ? (
                 <Link href={`/services`} className={`${btnClass} bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 border-slate-200 dark:border-slate-700`}>
                    <MapPin className="w-5 h-5" />Szerviz Térkép
                 </Link>
             ) : (
                 <Link href="/pricing" className={`${btnClass} bg-slate-100 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed border-slate-200 dark:border-slate-800`}>
                    <Lock className="w-4 h-4" />Szerviz Térkép
                 </Link>
             )}
        </div>
    )
}

function CostCard({ total, fuel, service, isElectric }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 h-full flex flex-col justify-between">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4"><Wallet className="w-5 h-5 text-slate-400" />Költségek</h3>
            <div className="flex items-center gap-5 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-500 shadow-inner">
                    <Banknote className="w-7 h-7" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Eddigi Összes</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{total.toLocaleString()} Ft</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                 <CostItem label={isElectric ? "Töltés" : "Üzemanyag"} value={fuel} icon={isElectric ? <Zap className="w-3 h-3" /> : <Fuel className="w-3 h-3" />} />
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

function TechnicalSpecs({ car, avgConsumption, canVinSearch }: any) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('hu-HU', {
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-slate-400" /> Specifikációk
                </h3>
                {/* VIN KERESŐ GOMB */}
                {canVinSearch && car.vin ? (
                    <a href={`https://vincheck.com/${car.vin}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded flex items-center gap-1 hover:bg-indigo-100 transition-colors">
                        <Search className="w-3 h-3" /> Elemzés
                    </a>
                ) : (
                    <Link href="/pricing" className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-1 rounded flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Elemzés
                    </Link>
                )}
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <DataPoint label="Futásteljesítmény" value={car.mileage ? `${car.mileage.toLocaleString()} km` : '-'} />
                <DataPoint label="Évjárat" value={car.year} />
                <DataPoint label="Motor (ccm)" value={car.engine_size ? `${car.engine_size} cm³` : '-'} />
                <DataPoint label="Teljesítmény" value={car.power_hp ? `${car.power_hp} LE` : '-'} />
                <DataPoint label="Sebességváltó" value={car.transmission || '-'} />
                <DataPoint label="Üzemanyag" value={car.fuel_type || '-'} />
                <DataPoint label="Kivitel" value={car.body_type || '-'} />
                <DataPoint label="Szín" value={car.color || '-'} />
                
                <div className="col-span-2 grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                    <DataPoint 
                        label="Műszaki érvényesség" 
                        value={formatDate(car.mot_expiry)} 
                        className={car.mot_expiry && new Date(car.mot_expiry) < new Date() ? "text-red-500 font-bold" : ""}
                    />
                    <DataPoint 
                        label="Biztosítás évforduló" 
                        value={formatDate(car.insurance_expiry)} 
                    />
                </div>

                <DataPoint label="Átlagfogyasztás" value={avgConsumption === 'Nincs adat' ? '-' : avgConsumption} highlight />
                
                <div className="col-span-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                    <DataPoint label="VIN / Alvázszám" value={car.vin || 'Nincs rögzítve'} mono />
                </div>
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