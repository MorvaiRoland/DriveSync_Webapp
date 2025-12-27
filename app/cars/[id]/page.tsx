import { createClient } from '@/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { deleteEvent, deleteReminder } from './actions'
import DocumentManager from './DocumentManager'
import ExportMenu from '@/components/ExportMenu'
import PublicToggle from '@/components/PublicToggle'
import VignetteManager from '@/components/VignetteManager'
import SmartParkingWidget from '@/components/SmartParkingWidget' 
import SalesWidget from '@/components/SalesWidget'
import AnalyticsCharts from '@/components/AnalyticsCharts'
import ResponsiveDashboard from '@/components/ResponsiveDashboard'
import PredictiveMaintenance from '@/components/PredictiveMaintenance'
import CarHealthWidget from '@/components/CarHealthWidget'

import { 
  Fuel, Wrench, Bell, Map, Package, Warehouse, 
  Pencil, ShieldCheck, Disc, Snowflake, Sun, Wallet, Banknote, 
  Sparkles, Lightbulb, Plus, Trash2, Gauge, History, 
  CarFront, Zap, TrendingUp, TrendingDown, 
  Droplet, MapPin, Calendar, Activity, ArrowUpRight
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

const getExpiryStatus = (dateString: string | null) => {
  if (!dateString) return { label: 'Hiányzik', status: 'Nincs rögzítve', alert: false, color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800/50' };
  const today = new Date();
  const expiry = new Date(dateString);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: 'Lejárt', status: `${Math.abs(diffDays)} napja`, alert: true, color: 'text-rose-500', bg: 'bg-rose-500/10' };
  if (diffDays < 30) return { label: 'Figyelem', status: `${diffDays} nap`, alert: true, color: 'text-amber-500', bg: 'bg-amber-500/10' };
  return { label: 'Aktív', status: expiry.toLocaleDateString('hu-HU'), alert: false, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
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

  const totalCost = safeEvents.reduce((sum, e) => sum + (e.cost || 0), 0)
  const serviceCost = safeEvents.filter(e => e.type === 'service').reduce((sum, e) => sum + (e.cost || 0), 0)
  const fuelCost = safeEvents.filter(e => e.type === 'fuel').reduce((sum, e) => sum + (e.cost || 0), 0)
  const isElectric = car.fuel_type === 'Elektromos';
  const unit = isElectric ? 'kWh' : 'L';

  // --- Service Logic ---
  const serviceIntervalKm = car.service_interval_km || (isElectric ? 30000 : 15000); 
  let baseKm = car.last_service_mileage || 0;
  const lastServiceEvent = safeEvents.find(e => e.type === 'service');
  if (lastServiceEvent && lastServiceEvent.mileage > baseKm) baseKm = lastServiceEvent.mileage;
  if (baseKm === 0) baseKm = car.mileage; 

  const nextServiceKm = baseKm + serviceIntervalKm;
  const kmRemaining = nextServiceKm - car.mileage;
  const kmSinceService = car.mileage - baseKm;

  const percentageUsed = Math.min(100, Math.max(0, (kmSinceService / serviceIntervalKm) * 100));
  const oilLife = 100 - percentageUsed; 

  let healthStatus = { text: "Rendszerek OK", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-500 shadow-[0_0_8px_#10b981]" };
  if (kmRemaining <= 0) healthStatus = { text: "Szerviz szükséges", color: "text-rose-500 bg-rose-500/10 border-rose-500/20", dot: "bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" };
  else if (kmRemaining < 2000) healthStatus = { text: "Hamarosan szerviz", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-500 shadow-[0_0_8px_#f59e0b]" };

  const motStatus = getExpiryStatus(car.mot_expiry);
  const insuranceStatus = getExpiryStatus(car.insurance_expiry);

  const smartTips = [];
  if (!isElectric && oilLife < 15) smartTips.push("Olajcsere esedékes: a motor élettartama érdekében ne halogasd.");
  if (motStatus.alert) smartTips.push(`Műszaki vizsga kritikus állapotban: ${motStatus.status}`);
  if (smartTips.length === 0) smartTips.push("Minden rendszer üzemi paramétereken belül. Biztonságos utat!");

  const carIdString = car.id.toString();
  const isPublic = car.is_public_history || false; 

  // --- Widgets Props ---
  const healthProps = { car, oilLife, kmSinceService, serviceIntervalKm, kmRemaining, motStatus, insuranceStatus }

  // --- LAYOUTS ---
  const DesktopLayout = (
    <div className="grid grid-cols-12 gap-8 items-start">
        <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl">
               <PublicToggle carId={carIdString} isPublicInitial={isPublic} />
               <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                  <Activity size={12} /> Live Telemetria
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <CarHealthWidget {...healthProps} />
                 <CostCard total={totalCost} fuel={fuelCost} service={serviceCost} isElectric={isElectric} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                 <FuelTrackerCard events={safeEvents} isElectric={isElectric} carMileage={car.mileage} />
                 <div className="space-y-8">
                    <SmartParkingWidget carId={carIdString} activeSession={activeParking} />
                    <PredictiveMaintenance carId={car.id} carName={`${car.make} ${car.model}`} />
                 </div>
            </div>

            <AnalyticsCharts events={safeEvents} isPro={true} />
            <EventLog events={safeEvents} carId={carIdString} />
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8 sticky top-24">
             <SalesWidget car={car} />
             <SmartTipsCard tips={smartTips} />
             <RemindersList reminders={safeReminders} carId={carIdString} />
             
             <div className="glass p-2 rounded-[2.5rem] border-neon-glow space-y-6">
                 <TechnicalSpecs car={car} avgConsumption="-" />
                 <VignetteManager carId={carIdString} vignettes={safeVignettes} />
                 <TireHotelCard tires={safeTires} carMileage={car.mileage} carId={carIdString} />
                 <DocumentManager carId={carIdString} documents={safeDocs} />
             </div>
        </div>
    </div>
  );

  const mobileTabs = {
    overview: (
        <div className="space-y-6">
            <PublicToggle carId={carIdString} isPublicInitial={isPublic} />
            <CarHealthWidget {...healthProps} />
            <CostCard total={totalCost} fuel={fuelCost} service={serviceCost} isElectric={isElectric} />
            <FuelTrackerCard events={safeEvents} isElectric={isElectric} carMileage={car.mileage} />
            <SmartParkingWidget carId={carIdString} activeSession={activeParking} />
            <PredictiveMaintenance carId={car.id} carName={`${car.make} ${car.model}`} />
            <SalesWidget car={car} />
        </div>
    ),
    services: <div className="space-y-6"><TechnicalSpecs car={car} /><VignetteManager carId={carIdString} vignettes={safeVignettes} /><TireHotelCard tires={safeTires} carMileage={car.mileage} /><DocumentManager carId={carIdString} documents={safeDocs} /></div>,
    log: <div className="space-y-6"><SmartTipsCard tips={smartTips} /><RemindersList reminders={safeReminders} carId={carIdString} /><AnalyticsCharts events={safeEvents} isPro={true} /><EventLog events={safeEvents} carId={carIdString} /></div>
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-primary/30 pb-32 transition-colors duration-500 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <HeaderSection car={car} healthStatus={healthStatus} kmRemaining={kmRemaining} />
      <DesktopActionGrid carId={carIdString} isElectric={isElectric} />
      
      <main className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-20">
        <ResponsiveDashboard mobileTabs={mobileTabs} desktopContent={DesktopLayout} />
      </main>

      <MobileBottomNav carId={carIdString} isElectric={isElectric} />
    </div>
  )
}

// --- SUB-COMPONENTS (Apex Redesign) ---

function HeaderSection({ car, healthStatus, kmRemaining }: any) {
    return (
        <div className="relative w-full min-h-[26rem] md:h-[32rem] flex flex-col justify-end overflow-hidden group">
            {car.image_url && (
                <div className="absolute inset-0 z-0">
                    <Image src={car.image_url} alt="Car Hero" fill className="object-cover scale-105 blur-[2px] brightness-[0.4] transition-transform duration-1000 group-hover:scale-110" priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent" />
                </div>
            )}
            
            {/* Top Bar - Notch Protected */}
            <div className="absolute top-0 left-0 right-0 z-30 px-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] flex justify-between items-center">
                <Link href="/" className="flex items-center gap-3 text-white/70 hover:text-white bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 transition-all hover:bg-white/10 group">
                    <Warehouse className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span className="font-black uppercase tracking-tighter text-xs">Garázs</span>
                </Link>
                <div className="flex items-center gap-3">
                    <ExportMenu car={car} events={[]} />
                    <Link href={`/cars/${car.id}/edit`} className="bg-primary text-white p-3 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 transition-all border border-white/20">
                        <Pencil className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            <div className="relative z-20 max-w-[1500px] mx-auto px-6 w-full pb-16">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
                    {/* Car Portrait Card */}
                    <div className="w-40 h-40 md:w-64 md:h-64 rounded-[3rem] border-4 border-white/10 shadow-2xl overflow-hidden relative bg-slate-800 rotate-1 group-hover:rotate-0 transition-transform duration-700">
                        {car.image_url ? (
                            <Image src={car.image_url} alt="Car" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-primary/20"><CarFront size={80} /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent pointer-events-none" />
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-6">
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${healthStatus.color} backdrop-blur-xl`}>
                            <span className={`w-2 h-2 rounded-full ${healthStatus.dot}`}></span>
                            {healthStatus.text}
                        </div>
                        
                        <div className="space-y-1">
                            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8] text-white">
                                {car.make} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400 drop-shadow-sm">{car.model}</span>
                            </h1>
                            <p className="text-primary/60 font-mono text-xl md:text-3xl tracking-[0.3em] font-black">{car.plate}</p>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <StatBadge label="Odométer" value={`${car.mileage.toLocaleString()}`} unit="KM" />
                            <StatBadge label="Szerviz-ablak" value={`${kmRemaining.toLocaleString()}`} unit="KM" color={kmRemaining <= 1000 ? 'text-rose-500' : 'text-emerald-400'} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatBadge({ label, value, unit, color = "text-white" }: any) {
    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4 rounded-3xl min-w-[140px] shadow-2xl">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black tracking-tighter italic ${color}`}>{value}</span>
                <span className="text-[10px] font-bold text-slate-500">{unit}</span>
            </div>
        </div>
    )
}

function EventLog({ events, carId }: any) {
    return (
        <div className="glass rounded-[2.5rem] border-neon-glow overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-white">
                    <History className="text-primary" /> Eseménynapló
                </h3>
                <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">
                    {events.length} Bejegyzés
                </span>
            </div>
            
            <div className="p-8 max-h-[600px] overflow-y-auto custom-scrollbar space-y-6">
                {events.length > 0 ? (
                    events.map((event: any) => (
                        <div key={event.id} className="relative pl-10 group/item">
                            {/* Timeline Line */}
                            <div className="absolute left-[15px] top-0 bottom-0 w-px bg-white/10 group-last/item:h-8" />
                            {/* Timeline Dot */}
                            <div className={`absolute left-0 top-6 w-8 h-8 rounded-xl border-4 border-[#020617] z-10 transition-transform group-hover/item:scale-110 shadow-xl ${
                                event.type === 'fuel' ? 'bg-amber-500' : event.type === 'service' ? 'bg-primary' : 'bg-slate-600'
                            }`} />

                            <div className="bg-slate-900/50 hover:bg-slate-800/80 border border-white/5 p-6 rounded-[2rem] transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden group">
                                <Link href={`/cars/${carId}/events/${event.id}/edit`} className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(event.event_date).toLocaleDateString('hu-HU')}</span>
                                        {event.mileage && <span className="text-[10px] font-bold text-primary italic">{event.mileage.toLocaleString()} km</span>}
                                    </div>
                                    <h4 className="text-lg font-black text-white uppercase italic tracking-tight group-hover:text-primary transition-colors">{event.title}</h4>
                                </Link>

                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                    <span className="text-xl font-black tabular-nums italic text-white tracking-tighter">
                                        {event.cost > 0 ? `-${event.cost.toLocaleString()} Ft` : 'Díjmentes'}
                                    </span>
                                    <form action={deleteEvent}>
                                        <input type="hidden" name="id" value={event.id} />
                                        <input type="hidden" name="car_id" value={carId} />
                                        <button className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 active:scale-90">
                                            <Trash2 size={16} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 text-slate-500 italic uppercase font-bold tracking-widest text-xs opacity-30">Üres a történet</div>
                )}
            </div>
        </div>
    )
}

function FuelTrackerCard({ events, isElectric }: any) {
    const fuelEvents = events.filter((e: any) => e.type === 'fuel' && e.liters);
    const avgCons = fuelEvents.length > 0 ? "6.4" : "0.0"; // Példa logika

    return (
        <div className="glass rounded-[2.5rem] p-8 border-neon-glow relative overflow-hidden group shadow-2xl h-full flex flex-col">
            <div className="flex justify-between items-start mb-8">
                <div className="space-y-1">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <TrendingDown size={14} className="text-emerald-500" /> Hatékonyság
                    </h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black italic tracking-tighter text-white">{avgCons}</span>
                        <span className="text-primary font-bold text-lg uppercase">{isElectric ? 'kWh' : 'L'}/100</span>
                    </div>
                </div>
                <div className="p-4 bg-primary/10 rounded-[1.5rem] border border-primary/20 text-primary">
                    {isElectric ? <Zap size={28} /> : <Fuel size={28} />}
                </div>
            </div>

            <div className="flex-1 space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Utolsó 3 mérés</p>
                {fuelEvents.slice(0, 3).map((e: any) => (
                    <div key={e.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Droplet size={14} /></div>
                            <span className="text-xs font-bold text-slate-300">{new Date(e.event_date).toLocaleDateString('hu-HU', {month: 'short', day: 'numeric'})}</span>
                        </div>
                        <span className="font-black italic text-white">{e.liters} {isElectric ? 'kWh' : 'L'}</span>
                    </div>
                ))}
            </div>
            
            <Link href={`/cars/${events[0]?.car_id}/events/new?type=fuel`} className="mt-8 w-full py-4 bg-white/5 hover:bg-primary hover:text-white border border-white/10 rounded-2xl transition-all text-center text-[10px] font-black uppercase tracking-widest">
                Új adat rögzítése
            </Link>
        </div>
    )
}

function CostCard({ total, fuel, service, isElectric }: any) {
    return (
        <div className="glass rounded-[2.5rem] p-8 border-neon-glow shadow-2xl h-full flex flex-col">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Wallet size={14} className="text-primary" /> Költségvetés
            </h3>
            
            <div className="mb-10">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Mindenkori Összesen</p>
                <p className="text-5xl font-black italic tracking-tighter text-white">{total.toLocaleString()} <span className="text-xl">FT</span></p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="bg-white/5 p-4 rounded-3xl border border-white/5 space-y-2">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1"><Zap size={10} /> {isElectric ? 'Töltés' : 'Üzemanyag'}</p>
                    <p className="text-lg font-black italic text-white leading-none">{fuel.toLocaleString()} Ft</p>
                </div>
                <div className="bg-white/5 p-4 rounded-3xl border border-white/5 space-y-2">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1"><Wrench size={10} /> Szerviz</p>
                    <p className="text-lg font-black italic text-white leading-none">{service.toLocaleString()} Ft</p>
                </div>
            </div>
        </div>
    )
}

function SmartTipsCard({ tips }: { tips: string[] }) {
    return (
        <div className="bg-gradient-to-br from-indigo-600 to-primary rounded-[2.5rem] p-8 shadow-2xl text-white relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-white/20 rounded-xl"><Lightbulb className="w-5 h-5 text-yellow-300 animate-pulse" /></div>
                <h3 className="font-black uppercase italic tracking-tighter text-lg">Apex AI Insights</h3>
            </div>
            <div className="space-y-4 relative z-10">
                {tips.map((tip, i) => (
                    <div key={i} className="flex gap-4 items-start bg-black/20 p-4 rounded-[1.5rem] border border-white/10 backdrop-blur-md">
                        <div className="mt-1 w-2 h-2 bg-yellow-400 rounded-full shrink-0 shadow-[0_0_10px_#facc15]" />
                        <p className="text-xs font-bold leading-relaxed italic">{tip}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

function RemindersList({ reminders, carId }: any) {
    return (
        <div className="glass rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
                <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-3 text-white">
                    <Bell className="text-rose-500 animate-bounce" /> Feladatok
                </h3>
                <Link href={`/cars/${carId}/reminders/new`} className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all">
                    <Plus size={18} />
                </Link>
            </div>
            <div className="divide-y divide-white/5">
                {reminders.length > 0 ? reminders.map((rem: any) => (
                    <div key={rem.id} className="p-6 flex items-center gap-6 hover:bg-white/5 transition-all group">
                        <div className="w-14 h-14 bg-slate-800 rounded-2xl flex flex-col items-center justify-center border border-white/10 shrink-0 group-hover:border-primary/50 transition-colors">
                            <span className="text-[8px] font-black uppercase text-primary tracking-widest">{new Date(rem.due_date).toLocaleString('hu-HU', { month: 'short' }).replace('.', '')}</span>
                            <span className="text-xl font-black leading-none text-white">{new Date(rem.due_date).getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-white text-sm uppercase italic truncate tracking-tight">{rem.service_type}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">{rem.note || 'Nincs leírás'}</p>
                        </div>
                        <form action={deleteReminder}>
                            <input type="hidden" name="id" value={rem.id} />
                            <input type="hidden" name="car_id" value={carId} />
                            <button className="p-2 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                        </form>
                    </div>
                )) : <div className="p-10 text-center text-slate-600 font-bold uppercase tracking-widest text-[10px]">Minden készen áll</div>}
            </div>
        </div>
    )
}

function TechnicalSpecs({ car }: any) {
    return (
        <div className="p-8 space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                <Gauge size={14} /> Specifikációk
            </h3>
            <div className="grid grid-cols-2 gap-y-8 gap-x-10">
                <DataPoint label="Évjárat" value={car.year} />
                <DataPoint label="Erőforrás" value={car.fuel_type} />
                <DataPoint label="Hajtás" value={car.transmission || '-'} />
                <DataPoint label="Teljesítmény" value={car.power_hp ? `${car.power_hp} LE` : '-'} />
                <div className="col-span-2 border-t border-white/5 pt-6">
                    <DataPoint label="VIN / Alvázszám" value={car.vin || 'Nincs rögzítve'} mono />
                </div>
            </div>
        </div>
    )
}

function DataPoint({ label, value, mono }: any) {
    return (
        <div className="space-y-1">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
            <p className={`text-sm font-black uppercase italic tracking-tight text-white ${mono ? 'font-mono text-[10px]' : ''}`}>{value}</p>
        </div>
    )
}

function TireHotelCard({ tires, carMileage }: any) {
    return (
        <div className="p-8 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                <Disc size={14} /> Gumi Hotel
            </h3>
            <div className="space-y-3">
                {tires.map((tire: any) => (
                    <div key={tire.id} className={`flex items-center justify-between p-4 rounded-2xl border ${tire.is_mounted ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-white/5'} transition-all`}>
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${tire.type === 'winter' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                {tire.type === 'winter' ? <Snowflake size={16} /> : <Sun size={16} />}
                            </div>
                            <div>
                                <p className="text-xs font-black text-white uppercase italic tracking-tight">{tire.brand}</p>
                                <p className="text-[9px] font-bold text-slate-500 uppercase">{tire.total_distance.toLocaleString()} km futás</p>
                            </div>
                        </div>
                        {tire.is_mounted && <div className="text-[8px] font-black text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20 uppercase animate-pulse">Mounted</div>}
                    </div>
                ))}
            </div>
        </div>
    )
}

function MobileBottomNav({ carId, isElectric }: any) {
    return (
        <div className="md:hidden fixed bottom-6 left-4 right-4 bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] z-50 p-2">
            <div className="grid grid-cols-5 gap-2">
                <Link href={`/cars/${carId}/events/new?type=fuel`} className="flex flex-col items-center justify-center py-4 text-primary group active:scale-95 transition-all">
                    <div className="p-3 rounded-2xl group-hover:bg-primary/10"><Fuel size={24} /></div>
                    <span className="text-[8px] font-black uppercase tracking-widest mt-1">{isElectric ? 'Töltés' : 'Tankol'}</span>
                </Link>
                <Link href={`/cars/${carId}/events/new?type=service`} className="flex flex-col items-center justify-center py-4 text-slate-400 group active:scale-95 transition-all">
                    <div className="p-3 rounded-2xl group-hover:bg-white/5"><Wrench size={24} /></div>
                    <span className="text-[8px] font-black uppercase tracking-widest mt-1">Szerviz</span>
                </Link>
                <Link href={`/cars/${carId}/reminders/new`} className="flex flex-col items-center justify-center py-4 text-rose-500 group active:scale-95 transition-all">
                    <div className="p-3 rounded-2xl group-hover:bg-rose-500/10"><Bell size={24} /></div>
                    <span className="text-[8px] font-black uppercase tracking-widest mt-1">Teendő</span>
                </Link>
                <Link href={`/cars/${carId}/trips`} className="flex flex-col items-center justify-center py-4 text-blue-400 group active:scale-95 transition-all">
                    <div className="p-3 rounded-2xl group-hover:bg-blue-400/10"><MapPin size={24} /></div>
                    <span className="text-[8px] font-black uppercase tracking-widest mt-1">Utak</span>
                </Link>
                <Link href={`/cars/${carId}/parts`} className="flex flex-col items-center justify-center py-4 text-emerald-400 group active:scale-95 transition-all">
                    <div className="p-3 rounded-2xl group-hover:bg-emerald-400/10"><Package size={24} /></div>
                    <span className="text-[8px] font-black uppercase tracking-widest mt-1">Alkatr.</span>
                </Link>
            </div>
        </div>
    )
}

function DesktopActionGrid({ carId, isElectric }: any) {
    const btnStyle = "group h-20 bg-slate-900 border border-white/5 rounded-3xl flex items-center justify-center gap-4 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] shadow-xl relative overflow-hidden";
    
    return (
        <div className="max-w-[1500px] mx-auto px-6 -mt-10 relative z-30 hidden md:grid grid-cols-5 gap-6">
            <Link href={`/cars/${carId}/events/new?type=fuel`} className={`${btnStyle} bg-gradient-to-br from-primary/10 to-slate-900`}>
                <div className="p-3 bg-primary text-white rounded-2xl shadow-lg"><Fuel size={24} /></div>
                <span className="text-xs font-black uppercase tracking-widest text-white italic">{isElectric ? 'Töltés rögzítése' : 'Tankolás naplózása'}</span>
                <ArrowUpRight size={16} className="absolute top-4 right-4 text-white/20 group-hover:text-primary transition-colors" />
            </Link>
            <Link href={`/cars/${carId}/events/new?type=service`} className={btnStyle}>
                <Wrench size={20} className="text-slate-500 group-hover:text-primary transition-colors" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">Szerviz esemény</span>
            </Link>
            <Link href={`/cars/${carId}/reminders/new`} className={btnStyle}>
                <Bell size={20} className="text-rose-500/70 group-hover:text-rose-500 transition-colors" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">Emlékeztető</span>
            </Link>
            <Link href={`/cars/${carId}/trips`} className={btnStyle}>
                <MapPin size={20} className="text-blue-500/70 group-hover:text-blue-500 transition-colors" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">Útvonalak</span>
            </Link>
            <Link href={`/cars/${carId}/parts`} className={btnStyle}>
                <Package size={20} className="text-emerald-500/70 group-hover:text-emerald-500 transition-colors" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">Alkatrészbázis</span>
            </Link>
        </div>
    )
}