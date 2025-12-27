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
  Pencil, Disc, Snowflake, Sun, Wallet, Banknote, 
  Sparkles, Lightbulb, Plus, Trash2, Gauge, History, 
  CarFront, Zap, TrendingDown, 
  Droplet, MapPin, Activity, ArrowUpRight
} from 'lucide-react';

// --- SEGÉDFÜGGVÉNYEK ---
const getExpiryStatus = (dateString: string | null) => {
  if (!dateString) return { label: 'Hiányzik', status: 'Nincs adat', alert: false, color: 'text-slate-500', bg: 'bg-slate-800/40' };
  const today = new Date();
  const expiry = new Date(dateString);
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { label: 'Lejárt', status: `${Math.abs(diffDays)} napja`, alert: true, color: 'text-rose-500', bg: 'bg-rose-500/10' };
  if (diffDays < 30) return { label: 'Figyelem', status: `${diffDays} nap`, alert: true, color: 'text-amber-500', bg: 'bg-amber-500/10' };
  return { label: 'Aktív', status: expiry.toLocaleDateString('hu-HU'), alert: false, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
}

type Car = {
  id: number; make: string; model: string; plate: string; year: number; mileage: number; 
  image_url: string | null; mot_expiry: string | null; insurance_expiry: string | null; 
  service_interval_km: number; last_service_mileage: number; fuel_type: string; 
  color: string | null; vin: string | null; share_token?: string | null; 
  transmission?: string | null; engine_size?: number | null; power_hp?: number | null;
  is_public_history?: boolean; 
}

export default async function CarDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // --- ADATLEKÉRÉS ---
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
  const isElectric = car.fuel_type === 'Elektromos';

  // --- SZERVIZ ÉS KÖLTSÉG LOGIKA ---
  const totalCost = safeEvents.reduce((sum, e) => sum + (e.cost || 0), 0)
  const serviceCost = safeEvents.filter(e => e.type === 'service').reduce((sum, e) => sum + (e.cost || 0), 0)
  const fuelCost = safeEvents.filter(e => e.type === 'fuel').reduce((sum, e) => sum + (e.cost || 0), 0)
  
  const serviceIntervalKm = car.service_interval_km || (isElectric ? 30000 : 15000); 
  const lastServiceMileage = safeEvents.find(e => e.type === 'service')?.mileage || car.last_service_mileage || 0;
  const kmRemaining = (lastServiceMileage + serviceIntervalKm) - car.mileage;
  const oilLife = Math.max(0, 100 - ((car.mileage - lastServiceMileage) / serviceIntervalKm * 100));

  let healthStatus = { text: "Rendszerek OK", color: "text-emerald-500 bg-emerald-500/10", dot: "bg-emerald-500 shadow-[0_0_8px_#10b981]" };
  if (kmRemaining <= 0) healthStatus = { text: "Karbantartás esedékes", color: "text-rose-500 bg-rose-500/10", dot: "bg-rose-500 animate-pulse" };

  const carIdString = car.id.toString();
  const healthProps = { car, oilLife, kmRemaining, serviceIntervalKm, motStatus: getExpiryStatus(car.mot_expiry), insuranceStatus: getExpiryStatus(car.insurance_expiry) }

  // --- DESKTOP LAYOUT ---
  const DesktopLayout = (
    <div className="grid grid-cols-12 gap-8 items-start">
        <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="glass p-5 rounded-[2.5rem] flex items-center justify-between border-neon-glow shadow-2xl">
               <PublicToggle carId={carIdString} isPublicInitial={car.is_public_history || false} />
               <div className="flex items-center gap-3 px-5 py-2 bg-primary/10 rounded-2xl border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                  <Activity size={14} className="animate-pulse" /> DynamicSense Telemetry Online
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <CarHealthWidget {...healthProps} />
                 <CostCard total={totalCost} fuel={fuelCost} service={serviceCost} isElectric={isElectric} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                 <FuelTrackerCard events={safeEvents} isElectric={isElectric} />
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
             <SmartTipsCard tips={["Optimalizált guminyomás javasolt.", "DynamicSense AI: Szervizablak 45 napon belül."]} />
             <RemindersList reminders={safeReminders} carId={carIdString} />
             <div className="glass p-2 rounded-[3rem] border-neon-glow overflow-hidden space-y-2">
                 <TechnicalSpecs car={car} />
                 <VignetteManager carId={carIdString} vignettes={safeVignettes} />
                 <TireHotelCard tires={safeTires} />
                 <DocumentManager carId={carIdString} documents={safeDocs} />
             </div>
        </div>
    </div>
  );

  // --- MOBIL TABS ---
  const mobileTabs = {
    overview: (
        <div className="space-y-8 px-1 pb-10">
            <div className="glass p-4 rounded-[2rem] border-white/5"><PublicToggle carId={carIdString} isPublicInitial={car.is_public_history || false} /></div>
            <CarHealthWidget {...healthProps} />
            <CostCard total={totalCost} fuel={fuelCost} service={serviceCost} isElectric={isElectric} />
            <FuelTrackerCard events={safeEvents} isElectric={isElectric} />
            <SmartParkingWidget carId={carIdString} activeSession={activeParking} />
            <PredictiveMaintenance carId={car.id} carName={`${car.make} ${car.model}`} />
            <SalesWidget car={car} />
        </div>
    ),
    services: (
        <div className="space-y-8 px-1 pb-10">
            <TechnicalSpecs car={car} />
            <VignetteManager carId={carIdString} vignettes={safeVignettes} />
            <TireHotelCard tires={safeTires} />
            <DocumentManager carId={carIdString} documents={safeDocs} />
        </div>
    ),
    log: (
        <div className="space-y-8 px-1 pb-10">
            <SmartTipsCard tips={["Minden rendszer üzemi paramétereken belül."]} />
            <RemindersList reminders={safeReminders} carId={carIdString} />
            <AnalyticsCharts events={safeEvents} isPro={true} />
            <EventLog events={safeEvents} carId={carIdString} />
        </div>
    )
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-primary/30 pb-40 transition-colors duration-500 overflow-x-hidden">
      
      {/* DINAMIKUS HÁTTÉR FX */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[100vw] h-[100vw] bg-primary/5 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay" />
      </div>

      <HeaderSection car={car} healthStatus={healthStatus} kmRemaining={kmRemaining} />
      
      <div className="relative z-30">
         <DesktopActionGrid carId={carIdString} isElectric={isElectric} />
      </div>
      
      <main className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-20">
        <ResponsiveDashboard mobileTabs={mobileTabs} desktopContent={DesktopLayout} />
      </main>

      <MobileBottomNav carId={carIdString} isElectric={isElectric} />
    </div>
  )
}

// --- AL-KOMPONENSEK ---

function HeaderSection({ car, healthStatus, kmRemaining }: any) {
    return (
        <div className="relative w-full min-h-[30rem] md:h-[40rem] flex flex-col justify-end overflow-hidden group">
            {car.image_url && (
                <div className="absolute inset-0 z-0">
                    <Image src={car.image_url} alt="Car Hero" fill className="object-cover scale-105 blur-[1px] brightness-[0.25] transition-transform duration-1000 group-hover:scale-110" priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
                </div>
            )}
            
            {/* NOTCH SECURE TOP BAR */}
            <div className="absolute top-0 left-0 right-0 z-40 px-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] flex justify-between items-center">
                <Link href="/" className="flex items-center gap-3 text-white/70 hover:text-white bg-white/5 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10 transition-all hover:bg-white/10 group shadow-2xl">
                    <Warehouse size={18} className="transition-transform group-hover:-translate-x-1" />
                    <span className="font-black uppercase tracking-[0.25em] text-[10px]">Garázs</span>
                </Link>
                <div className="flex items-center gap-3">
                    <ExportMenu car={car} events={[]} />
                    <Link href={`/cars/${car.id}/edit`} className="bg-primary text-white p-3.5 rounded-2xl shadow-neon hover:scale-110 transition-all border border-white/20">
                        <Pencil size={20} />
                    </Link>
                </div>
            </div>

            <div className="relative z-20 max-w-[1500px] mx-auto px-6 w-full pb-20">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-12">
                    {/* Portrait Image with Neon Border */}
                    <div className="relative group/img">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-blue-600 rounded-[4rem] blur-xl opacity-30 group-hover/img:opacity-100 transition duration-700" />
                        <div className="w-48 h-48 md:w-80 md:h-80 rounded-[3.8rem] border-4 border-white/10 shadow-2xl overflow-hidden relative bg-slate-900 z-10 transition-transform duration-700 group-hover:rotate-1">
                            {car.image_url ? (
                                <Image src={car.image_url} alt="Profile" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-800"><CarFront size={120} /></div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-8">
                        <div className={`inline-flex items-center gap-3 px-5 py-2 rounded-full border text-[11px] font-black uppercase tracking-[0.3em] ${healthStatus.color} backdrop-blur-3xl border-white/5 shadow-2xl`}>
                            <span className={`w-2 h-2 rounded-full ${healthStatus.dot}`}></span>
                            {healthStatus.text}
                        </div>
                        
                        <div className="space-y-2">
                            <h1 className="text-6xl md:text-[9rem] font-black tracking-tighter uppercase italic leading-[0.75] text-white">
                                {car.make} <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-emerald-400 drop-shadow-2xl">{car.model}</span>
                            </h1>
                            <p className="text-primary/50 font-mono text-2xl md:text-4xl tracking-[0.4em] font-black pt-4">{car.plate}</p>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-4">
                            <StatBadge label="Futásteljesítmény" value={car.mileage.toLocaleString()} unit="KM" />
                            <StatBadge label="Szervizintervallum" value={kmRemaining.toLocaleString()} unit="KM" color={kmRemaining <= 1000 ? 'text-rose-500' : 'text-primary'} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatBadge({ label, value, unit, color = "text-white" }: any) {
    return (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] min-w-[180px] shadow-2xl group hover:border-primary/40 transition-all">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{label}</p>
            <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black tracking-tighter italic ${color}`}>{value}</span>
                <span className="text-[11px] font-bold text-slate-500 uppercase">{unit}</span>
            </div>
        </div>
    )
}

function EventLog({ events, carId }: any) {
    return (
        <div className="glass rounded-[3.5rem] border-neon-glow overflow-hidden shadow-2xl mt-12">
            <div className="px-10 py-10 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-white">
                    <History className="text-primary" size={32} /> Eseménytörténet
                </h3>
                <div className="bg-primary/10 text-primary text-[11px] font-black px-5 py-2.5 rounded-2xl uppercase tracking-widest border border-primary/20">
                    {events.length} Bejegyzés
                </div>
            </div>
            
            <div className="p-10 max-h-[800px] overflow-y-auto custom-scrollbar space-y-10">
                {events.length > 0 ? events.map((event: any) => (
                    <div key={event.id} className="relative pl-14 group/item">
                        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-white/5 group-last/item:h-12" />
                        <div className={`absolute left-0 top-10 w-10 h-10 rounded-2xl border-4 border-[#020617] z-10 shadow-2xl transition-transform group-hover/item:scale-125 ${
                            event.type === 'fuel' ? 'bg-amber-500' : event.type === 'service' ? 'bg-primary' : 'bg-slate-700'
                        }`} />

                        <div className="bg-white/5 hover:bg-white/[0.08] border border-white/5 p-8 rounded-[3rem] transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden group shadow-xl">
                            <Link href={`/cars/${carId}/events/${event.id}/edit`} className="flex-1 space-y-4">
                                <div className="flex items-center gap-5">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-[0.25em]">{new Date(event.event_date).toLocaleDateString('hu-HU', {year: 'numeric', month: 'long', day: 'numeric'})}</span>
                                    {event.mileage && <span className="text-xs font-black text-primary italic bg-primary/10 px-4 py-1 rounded-xl">{event.mileage.toLocaleString()} KM</span>}
                                </div>
                                <h4 className="text-3xl font-black text-white uppercase italic tracking-tight group-hover:text-primary transition-colors leading-none">{event.title}</h4>
                            </Link>

                            <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
                                <span className="text-4xl font-black tabular-nums italic text-white tracking-tighter">
                                    {event.cost > 0 ? `-${event.cost.toLocaleString()} Ft` : 'Díjmentes'}
                                </span>
                                <form action={deleteEvent}>
                                    <input type="hidden" name="id" value={event.id} />
                                    <input type="hidden" name="car_id" value={carId} />
                                    <button className="p-5 bg-rose-500/10 text-rose-500 rounded-[1.5rem] hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 active:scale-90 shadow-xl">
                                        <Trash2 size={24} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )) : <div className="text-center py-40 opacity-20 font-black uppercase italic tracking-widest text-4xl">Üres az élettörténet</div>}
            </div>
        </div>
    )
}

function FuelTrackerCard({ events, isElectric }: any) {
    const fuelEvents = events.filter((e: any) => e.type === 'fuel' && e.liters);
    return (
        <div className="glass rounded-[3rem] p-10 border-neon-glow relative overflow-hidden group shadow-2xl h-full flex flex-col">
            <div className="flex justify-between items-start mb-10">
                <div className="space-y-2">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <TrendingDown size={16} className="text-emerald-500" /> Hatékonyság
                    </h3>
                    <div className="flex items-baseline gap-3">
                        <span className="text-7xl font-black italic tracking-tighter text-white uppercase tabular-nums">6.4</span>
                        <span className="text-primary font-black text-xl uppercase tracking-widest">{isElectric ? 'kWh' : 'L'}/100</span>
                    </div>
                </div>
                <div className="p-5 bg-primary/10 rounded-[2rem] border border-primary/20 text-primary shadow-inner">
                    {isElectric ? <Zap size={32} /> : <Fuel size={32} />}
                </div>
            </div>

            <div className="flex-1 space-y-5">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Utolsó telemetriai adatok</p>
                {fuelEvents.slice(0, 3).map((e: any) => (
                    <div key={e.id} className="flex items-center justify-between p-5 bg-white/5 rounded-[1.8rem] border border-white/5 hover:border-primary/40 transition-all group/item">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover/item:scale-110 transition-transform"><Droplet size={18} /></div>
                            <span className="text-sm font-bold text-slate-300">{new Date(e.event_date).toLocaleDateString('hu-HU', {month: 'short', day: 'numeric'})}</span>
                        </div>
                        <span className="text-lg font-black italic text-white tracking-widest tabular-nums">{e.liters} {isElectric ? 'kWh' : 'L'}</span>
                    </div>
                ))}
            </div>
            
            <Link href={`/cars/${events[0]?.car_id}/events/new?type=fuel`} className="mt-10 w-full py-5 bg-primary text-white rounded-[1.8rem] transition-all text-center text-[11px] font-black uppercase tracking-[0.3em] shadow-neon hover:scale-[1.02] active:scale-95">
                Adat naplózása
            </Link>
        </div>
    )
}

function CostCard({ total, fuel, service, isElectric }: any) {
    return (
        <div className="glass rounded-[3rem] p-10 border-neon-glow shadow-2xl h-full flex flex-col">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
                <Wallet size={16} className="text-primary" /> Költségvetés
            </h3>
            
            <div className="mb-12">
                <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-2">Összesített ráfordítás</p>
                <p className="text-7xl font-black italic tracking-tighter text-white tabular-nums leading-none">{total.toLocaleString()} <span className="text-2xl opacity-50 font-black">FT</span></p>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-auto">
                <div className="bg-white/5 p-6 rounded-[2.2rem] border border-white/5 space-y-3">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Zap size={12} /> {isElectric ? 'Töltés' : 'Üzemanyag'}</p>
                    <p className="text-2xl font-black italic text-white leading-none tabular-nums">{fuel.toLocaleString()} Ft</p>
                </div>
                <div className="bg-white/5 p-6 rounded-[2.2rem] border border-white/5 space-y-3">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Wrench size={12} /> Szerviz</p>
                    <p className="text-2xl font-black italic text-white leading-none tabular-nums">{service.toLocaleString()} Ft</p>
                </div>
            </div>
        </div>
    )
}

function SmartTipsCard({ tips }: { tips: string[] }) {
    return (
        <div className="bg-gradient-to-br from-indigo-600 to-primary rounded-[3rem] p-10 shadow-2xl text-white relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><Lightbulb className="w-6 h-6 text-yellow-300 animate-pulse" /></div>
                <h3 className="font-black uppercase italic tracking-tighter text-2xl">DynamicSense AI</h3>
            </div>
            <div className="space-y-5 relative z-10">
                {tips.map((tip, i) => (
                    <div key={i} className="flex gap-5 items-start bg-black/20 p-5 rounded-[2rem] border border-white/10 backdrop-blur-md hover:bg-black/30 transition-colors">
                        <div className="mt-1.5 w-2 h-2 bg-yellow-400 rounded-full shrink-0 shadow-[0_0_15px_#facc15]" />
                        <p className="text-sm font-bold leading-relaxed italic tracking-tight">{tip}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

function RemindersList({ reminders, carId }: any) {
    return (
        <div className="glass rounded-[3rem] border-white/5 overflow-hidden shadow-2xl">
            <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-xl">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-4 text-white">
                    <Bell className="text-rose-500 animate-bounce" size={24} /> Feladatok
                </h3>
                <Link href={`/cars/${carId}/reminders/new`} className="p-3 bg-primary text-white rounded-2xl shadow-neon hover:scale-110 transition-all border border-white/10">
                    <Plus size={24} />
                </Link>
            </div>
            <div className="divide-y divide-white/5">
                {reminders.length > 0 ? reminders.map((rem: any) => (
                    <div key={rem.id} className="p-8 flex items-center gap-8 hover:bg-white/5 transition-all group">
                        <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex flex-col items-center justify-center border border-white/10 shrink-0 group-hover:border-primary/50 transition-colors text-white shadow-2xl">
                            <span className="text-[10px] font-black uppercase text-primary tracking-widest leading-none mb-1">{new Date(rem.due_date).toLocaleString('hu-HU', { month: 'short' }).replace('.', '')}</span>
                            <span className="text-2xl font-black leading-none">{new Date(rem.due_date).getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0 text-white">
                            <p className="font-black text-lg uppercase italic truncate tracking-tight mb-1">{rem.service_type}</p>
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] truncate">{rem.note || 'Nincs leírás'}</p>
                        </div>
                        <form action={deleteReminder}>
                            <input type="hidden" name="id" value={rem.id} />
                            <input type="hidden" name="car_id" value={carId} />
                            <button className="p-3 text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 active:scale-90"><Trash2 size={20} /></button>
                        </form>
                    </div>
                )) : <div className="p-16 text-center text-slate-700 font-black uppercase tracking-[0.4em] text-xs">Minden teendő elvégezve</div>}
            </div>
        </div>
    )
}

function TechnicalSpecs({ car }: any) {
    return (
        <div className="p-10 space-y-10">
            <h3 className="text-xs font-black uppercase tracking-[0.5em] text-primary flex items-center gap-4">
                <Gauge size={20} /> Specifikációk
            </h3>
            <div className="grid grid-cols-2 gap-y-12 gap-x-12">
                <DataPoint label="Évjárat" value={car.year} />
                <DataPoint label="Üzemanyag" value={car.fuel_type} />
                <DataPoint label="Hajtás" value={car.transmission || 'Ismeretlen'} />
                <DataPoint label="Teljesítmény" value={car.power_hp ? `${car.power_hp} LE` : 'N/A'} />
                <div className="col-span-2 border-t border-white/5 pt-10">
                    <DataPoint label="VIN / Alvázszám" value={car.vin || 'Nincs rögzítve'} mono />
                </div>
            </div>
        </div>
    )
}

function DataPoint({ label, value, mono }: any) {
    return (
        <div className="space-y-3 group cursor-default text-white">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover:text-primary transition-colors">{label}</p>
            <p className={`text-xl font-black uppercase italic tracking-tight leading-none ${mono ? 'font-mono text-sm opacity-60' : ''}`}>{value}</p>
        </div>
    )
}

function TireHotelCard({ tires }: any) {
    return (
        <div className="p-10 space-y-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-4">
                <Disc size={20} /> Gumihotel
            </h3>
            <div className="space-y-4">
                {tires.length > 0 ? tires.map((tire: any) => (
                    <div key={tire.id} className={`flex items-center justify-between p-6 rounded-[2.2rem] border ${tire.is_mounted ? 'bg-primary/10 border-primary/40' : 'bg-white/5 border-white/5'} transition-all hover:bg-white/[0.08]`}>
                        <div className="flex items-center gap-5">
                            <div className={`p-3 rounded-2xl ${tire.type === 'winter' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'} shadow-inner`}>
                                {tire.type === 'winter' ? <Snowflake size={20} /> : <Sun size={20} />}
                            </div>
                            <div>
                                <p className="text-base font-black text-white uppercase italic tracking-tight leading-none mb-2">{tire.brand}</p>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{tire.total_distance.toLocaleString()} KM FUTÁS</p>
                            </div>
                        </div>
                        {tire.is_mounted && <div className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/30 uppercase animate-pulse">Aktív</div>}
                    </div>
                )) : <p className="text-slate-700 font-bold uppercase tracking-widest text-[10px] text-center">Nincs rögzített adat</p>}
            </div>
        </div>
    )
}

// --- NAVIGÁCIÓ ---

function MobileBottomNav({ carId, isElectric }: any) {
    return (
        <div className="md:hidden fixed bottom-10 left-6 right-6 z-[100] transition-all">
            <div className="bg-slate-900/80 backdrop-blur-3xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] rounded-[3rem] p-4 flex justify-around items-center border-neon-glow">
                <NavBtn href={`/cars/${carId}/events/new?type=fuel`} icon={<Fuel size={24} />} label={isElectric ? 'Töltés' : 'Tankol'} active />
                <NavBtn href={`/cars/${carId}/events/new?type=service`} icon={<Wrench size={24} />} label="Szerviz" />
                <NavBtn href={`/cars/${carId}/reminders/new`} icon={<Bell size={24} />} label="Teendő" color="text-rose-500" />
                <NavBtn href={`/cars/${carId}/trips`} icon={<MapPin size={24} />} label="Utak" color="text-blue-400" />
                <NavBtn href={`/cars/${carId}/parts`} icon={<Package size={24} />} label="Alkatr." color="text-emerald-400" />
            </div>
            {/* Safe area spacer for Home Indicator on iOS */}
            <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
    )
}

function NavBtn({ href, icon, label, active, color = "text-slate-500" }: any) {
    return (
        <Link href={href} className="flex flex-col items-center gap-2 px-3 py-2 rounded-[1.5rem] active:scale-90 transition-transform">
            <div className={`${active ? 'text-primary drop-shadow-[0_0_8px_#06b6d4]' : color} transition-all`}>{icon}</div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{label}</span>
        </Link>
    )
}

function DesktopActionGrid({ carId, isElectric }: any) {
    const btnStyle = "group h-24 bg-slate-900 border border-white/5 rounded-[2.5rem] flex items-center justify-center gap-6 transition-all hover:-translate-y-2 hover:border-primary/50 hover:shadow-neon shadow-2xl relative overflow-hidden";
    
    return (
        <div className="max-w-[1500px] mx-auto px-8 -mt-14 hidden md:grid grid-cols-5 gap-10">
            <Link href={`/cars/${carId}/events/new?type=fuel`} className={`${btnStyle} bg-gradient-to-br from-primary/25 to-slate-900`}>
                <div className="p-4 bg-primary text-white rounded-2xl shadow-neon group-hover:scale-110 transition-transform duration-500"><Fuel size={32} /></div>
                <div className="text-left">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] leading-none mb-2 animate-pulse">Live napló</p>
                    <span className="text-lg font-black uppercase italic text-white tracking-widest">{isElectric ? 'Töltés' : 'Tankolás'}</span>
                </div>
                <ArrowUpRight size={20} className="absolute top-5 right-5 text-white/10 group-hover:text-primary transition-colors" />
            </Link>
            
            <ActionBtn href={`/cars/${carId}/events/new?type=service`} icon={<Wrench size={24} />} label="Szerviznapló" />
            <ActionBtn href={`/cars/${carId}/reminders/new`} icon={<Bell size={24} />} label="Emlékeztető" color="group-hover:text-rose-500" />
            <ActionBtn href={`/cars/${carId}/trips`} icon={<MapPin size={24} />} label="Útvonalak" color="group-hover:text-blue-500" />
            <ActionBtn href={`/cars/${carId}/parts`} icon={<Package size={24} />} label="Alkatrészek" color="group-hover:text-emerald-500" />
        </div>
    )
}

function ActionBtn({ href, icon, label, color = "group-hover:text-primary" }: any) {
    return (
        <Link href={href} className="group h-24 bg-slate-900 border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 transition-all hover:-translate-y-2 hover:border-primary/50 hover:shadow-neon shadow-2xl">
            <div className={`text-slate-600 ${color} transition-all group-hover:scale-110 duration-500`}>{icon}</div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-white transition-colors">{label}</span>
        </Link>
    )
}