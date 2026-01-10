import { createClient } from '@/supabase/server'
import { signOut } from './login/action'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import dynamicImport from 'next/dynamic'
import { getSubscriptionStatus, PLAN_LIMITS } from '@/utils/subscription'
import { MOBILE_CARD_SIZES } from '@/utils/imageOptimization'
import { Plus, Settings, LogOut, CarFront, Users, Lock, Map, Crown, BarChart3, DollarSign, ArrowRight } from 'lucide-react';
import HeaderNav from '@/components/HeaderNav';
import QuickMileageForm from '@/components/QuickMileageForm';
import { Metadata } from 'next'
import OnboardingTour from '@/components/OnboardingTour';
import { Suspense } from 'react';

// --- SERVER COMPONENTS ---
// Ezeket normál módon importáljuk, mert szerver oldali logikát (cookie/db) használnak
import MarketplaceSection from '@/components/MarketplaceSection';

// --- CLIENT COMPONENTS (LAZY) ---
// Ezek jönnek a külön fájlból, mert 'use client' és 'ssr: false' kell nekik
import { 
  ChangelogModal, 
  AiMechanic, 
  CongratulationModal, 
  GamificationWidget, 
  WeatherWidget, 
  FuelWidget, 
  QuickCostOverview 
} from '@/components/DashboardLazyComponents';

// Loading Skeleton
const LoadingWidget = () => <div className="h-32 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />;

export const runtime = 'edge';
export const preferredRegion = 'lhr1';

export const metadata: Metadata = {
  title: {
    absolute: "DynamicSense | Garázs & Kereskedői Portál"
  }
}

// LandingPage maradhat itt (default import)
const LandingPage = dynamicImport(() => import('@/components/LandingPage'), { ssr: true });

const DEV_SECRET_KEY = "admin"; 
const FEATURES = {
  mileageLog: true, addCar: true, aiMechanic: true, reminders: true,
  activityLog: true, gamification: true, weather: true, fuelPrices: true, sharedCars: true,
};



// --- HELPER COMPONENT: CarCard ---
function CarCard({ car, shared, priority = false }: { car: any, shared?: boolean, priority?: boolean }) {
  return (
    <div className={`relative group flex flex-col bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-slate-100 dark:border-slate-700 h-full ${shared ? 'ring-2 ring-blue-500/30' : ''}`}>
      <Link href={`/cars/${car.id}`} className="relative h-60 overflow-hidden">
         {car.image_url ? (
            <Image 
              src={car.image_url} 
              alt={`${car.make} ${car.model}`} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-700" 
              priority={priority}
              loading={priority ? undefined : "lazy"}
              sizes={MOBILE_CARD_SIZES}
              quality={75}
            />
         ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                <CarFront className="w-16 h-16 text-slate-300 dark:text-slate-600" />
            </div>
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent"></div>
         <div className={`absolute top-4 right-4 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md shadow-lg border border-white/10 ${car.status === 'active' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>
             {car.status === 'active' ? 'Aktív' : 'Szerviz'}
         </div>
         <div className="absolute bottom-5 left-6 right-6">
             <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-1 drop-shadow-md">
                 {car.make} <span className="font-light text-slate-300">{car.model}</span>
             </h3>
             <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white border border-white/20 inline-block">
                 {car.plate}
             </span>
         </div>
      </Link>
      <Link href={`/cars/${car.id}`} className="p-6 flex-1 flex flex-col justify-between gap-4">
         <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 group-hover:border-amber-500/20 transition-colors">
                 <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Futás</p>
                 <p className="font-bold text-slate-900 dark:text-white text-sm font-mono">{car.mileage.toLocaleString()} km</p>
             </div>
             <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 group-hover:border-amber-500/20 transition-colors">
                 <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Évjárat</p>
                 <p className="font-bold text-slate-900 dark:text-white text-sm">{car.year}</p>
             </div>
         </div>
      </Link>
    </div>
  )
}

// --- DEALER DASHBOARD ---
function DealerDashboard({ user, cars }: { user: any, cars: any[] }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
            <nav className="absolute left-0 right-0 z-50 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-[env(safe-area-inset-top)]">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-lg px-4 h-16 flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        <span className="font-black text-indigo-600 text-lg uppercase tracking-tight">DynamicSense</span>
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Dealer</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/settings" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><Settings size={20}/></Link>
                        <form action={signOut}>
                            <button className="p-2 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500"><LogOut size={20}/></button>
                        </form>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-32 pt-[calc(env(safe-area-inset-top)+6rem)]">
                <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h2 className="text-slate-500 dark:text-slate-400 font-medium text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> Kereskedői Portál
                    </h2>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                    {user.user_metadata?.full_name || 'Kereskedés'}
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                            <CarFront size={24} />
                        </div>
                        <span className="text-xs font-bold bg-green-100 text-green-600 px-2 py-1 rounded">Aktív</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{cars.length}</h3>
                        <p className="text-sm text-slate-500">Jármű a készleten</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                            <DollarSign size={24} />
                        </div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">--- Ft</h3>
                        <p className="text-sm text-slate-500">Becsült készletérték (Hamarosan)</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                            <Users size={24} />
                        </div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">0</h3>
                        <p className="text-sm text-slate-500">Megtekintés ezen a héten</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <Link href="/cars/new" className="flex items-center gap-3 p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors font-bold shadow-lg shadow-indigo-500/20">
                        <Plus size={20} /> Új autó felvétele
                    </Link>
                    <button className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 font-bold opacity-50 cursor-not-allowed">
                        <BarChart3 size={20} /> Statisztikák (Hamarosan)
                    </button>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Készlet</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cars.map((car: any, index: number) => (
                         <CarCard key={car.id} car={car} priority={index === 0} />
                    ))}
                    {cars.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                        <p className="text-slate-500 mb-4">Még nincs autód a rendszerben.</p>
                        <Link href="/cars/new" className="text-indigo-500 font-bold hover:underline">Kezdd el most!</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// --- USER DASHBOARD (OPTIMALIZÁLT) ---
async function UserDashboard({ user, supabase }: any) {
  
  const [subscriptionResult, carsResult] = await Promise.all([
    getSubscriptionStatus(supabase, user.id),
    supabase
      .from('cars')
      .select('id, make, model, year, plate, mileage, image_url, status, fuel_type, user_id, service_interval_km, last_service_mileage, created_at, events(type, mileage), car_shares(email)')
      .order('created_at', { ascending: false })
  ]);

  const { plan, isTrial } = subscriptionResult;
  const carsData = carsResult.data || [];
  const limits = PLAN_LIMITS[plan];

  const canUseAi = limits.aiMechanic;
  const canTripPlan = limits.tripPlanner;
  const isPro = limits.aiMechanic;

  const myCars = carsData.filter((car:any) => car.user_id === user.id);
  const sharedCars = carsData.filter((car:any) => 
    car.user_id !== user.id && 
    car.car_shares?.some((share: any) => share.email === user.email)
  );
  // ... (ez a rész már megvan a kódodban, a myCars szűrés után) ...
  
  // --- ÚJ RÉSZ: JELVÉNYEK (BADGES) KISZÁMÍTÁSA ---
  // Nem kell hozzá adatbázis, kiszámoljuk a meglévő adatokból!
  
  const totalMileage = myCars.reduce((sum: number, car: any) => sum + (car.mileage || 0), 0);
  const hasElectric = myCars.some((car: any) => car.fuel_type === 'Elektromos' || car.fuel_type === 'Plug-in Hibrid');
  const carCount = myCars.length;
  const hasServiceHistory = myCars.some((car: any) => car.events && car.events.length > 0);

  // Itt definiáljuk a jelvényeket és a feltételeket
  const badges = [
    {
      id: 'first_car',
      name: 'Garázs Tulaj',
      icon: '🔑',
      description: 'Hozzáadtad az első autódat a rendszerhez.',
      achieved: carCount >= 1,
      progress: carCount >= 1 ? '1/1' : '0/1'
    },
    {
      id: 'fleet_boss',
      name: 'Flotta Főnök',
      icon: '😎',
      description: 'Legalább 3 autó parkol a garázsodban.',
      achieved: carCount >= 3,
      progress: `${Math.min(carCount, 3)}/3`
    },
    {
      id: 'world_traveler',
      name: 'Világutazó',
      icon: '🌍',
      description: 'A flotta összesített futásteljesítménye elérte a 500,000 km-t.',
      achieved: totalMileage >= 500000,
      progress: `${Math.floor(Math.min(totalMileage, 500000) / 1000)}k/500k`
    },
    {
      id: 'eco_warrior',
      name: 'Zöld Hullám',
      icon: '⚡',
      description: 'Van elektromos vagy hibrid autód.',
      achieved: hasElectric,
      progress: hasElectric ? '1/1' : '0/1'
    },
    {
      id: 'caring_owner',
      name: 'Gondos Gazda',
      icon: '🛠️',
      description: 'Rögzítettél már szerviz vagy költség eseményt.',
      achieved: hasServiceHistory,
      progress: hasServiceHistory ? '1/1' : '0/1'
    }
  ];
  
  // --- JELVÉNYEK VÉGE ---
  
  const cars = carsData;
  const latestCarId = myCars.length > 0 ? myCars[0].id : (cars.length > 0 ? cars[0].id : null);
  const relevantCarIds = cars.map((c:any) => c.id);
  
  let upcomingReminders: any[] = [];
  let recentActivity: any[] = [];
  let spentLast30Days = 0;
  
  if (relevantCarIds.length > 0) {
    const [remindersRes, activitiesRes, costsRes] = await Promise.all([
      supabase.from('service_reminders').select('*, cars(make, model)').in('car_id', relevantCarIds).order('due_date', { ascending: true }).limit(3),
      supabase.from('events').select('id, title, event_date, cost, car_id, cars(make, model)').in('car_id', relevantCarIds).order('event_date', { ascending: false }).limit(5),
      supabase.from('events').select('cost, event_date').in('car_id', relevantCarIds)
    ]);

    upcomingReminders = remindersRes.data || [];
    recentActivity = activitiesRes.data || [];
    const allCosts = costsRes.data || [];

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    spentLast30Days = allCosts
      .filter((e: any) => e.event_date && new Date(e.event_date) >= thirtyDaysAgo)
      .reduce((sum: number, e: any) => sum + (e.cost || 0), 0);
  }

  const hasServices = myCars.some((car:any) => car.events?.some((e: any) => e.type === 'service'));
  let fleetHealth = 100;

  if (myCars.length > 0) {
     const totalHealth = myCars.reduce((sum: number, car: any) => {
        if (car.fuel_type === 'Elektromos') return sum + 100;
        
        const interval = car.service_interval_km || 15000;
        let lastServiceKm = car.last_service_mileage || 0;
        
        const serviceEvents = car.events?.filter((e: any) => e.type === 'service') || [];
        if (serviceEvents.length > 0) {
            const maxEventKm = Math.max(...serviceEvents.map((e: any) => e.mileage));
            if (maxEventKm > lastServiceKm) lastServiceKm = maxEventKm;
        }
        
        const currentKm = car.mileage || 0;
        const kmDrivenSinceService = Math.max(0, currentKm - lastServiceKm);
        const healthPercent = Math.max(0, Math.min(100, ((interval - kmDrivenSinceService) / interval) * 100));
        return sum + healthPercent;
     }, 0);
     fleetHealth = Math.round(totalHealth / myCars.length);
  }

  const isCarLimitReached = myCars.length >= limits.maxCars;
  const hour = new Date().getHours();
  const greeting = hour < 10 ? 'Jó reggelt' : hour < 18 ? 'Szép napot' : 'Szép estét';
  
  const userCreatedTime = new Date(user.created_at || Date.now()).getTime();
  const accountAgeHours = (Date.now() - userCreatedTime) / 36e5;
  const showTour = !cars.length && accountAgeHours < 24;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500">
      
      {showTour && <OnboardingTour />}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <CongratulationModal currentPlan={plan} />
      {canUseAi && <AiMechanic isPro={true} />}
      {cars.length > 0 && <ChangelogModal />}
      
      <nav className="absolute left-0 right-0 z-50 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-[env(safe-area-inset-top)]">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-lg px-4 h-16 flex items-center justify-between mt-2">
          <div className="flex items-center"><HeaderNav isPro={isPro} /></div>
          <div className="flex items-center gap-3">
            <Link href={canTripPlan ? "/trip-planner" : "/pricing"} className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${canTripPlan ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
              {canTripPlan ? <Map className="w-4 h-4" /> : <Lock className="w-4 h-4" />} Úttervező
            </Link>
            <Link href="/pricing" className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all shadow-sm ${plan === 'free' ? 'bg-slate-100 text-slate-500 border-slate-200' : plan === 'lifetime' ? 'bg-purple-100 text-purple-600 border-purple-200' : 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-600'}`}>
              {plan === 'lifetime' ? <><Crown className="w-3 h-3"/> Lifetime</> : isTrial ? 'Early Access Pro' : plan === 'free' ? 'Starter' : 'Pro Plan'}
            </Link>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
            <Link href="/settings" className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><Settings className="w-5 h-5" /></Link>
            <form action={signOut}>
              <button className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10 pb-32 pt-[calc(env(safe-area-inset-top)+6rem)]">
        
        <div id="tour-welcome" className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h2 className="text-slate-500 dark:text-slate-400 font-medium text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {greeting},
              </h2>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0]}
              </h1>
            </div>
            
            <div id="tour-stats">
              {cars.length > 0 && (
                  <div className="w-full lg:w-auto bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-2 border border-white/20 dark:border-slate-700 shadow-xl flex flex-col sm:flex-row gap-2">
                      <div className="flex items-center gap-4 px-6 py-3 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm min-w-[200px]">
                          <div className="relative w-10 h-10 flex-shrink-0">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                  <path className="text-slate-200 dark:text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                  <path className={`${fleetHealth === 100 ? 'text-emerald-500' : fleetHealth > 50 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000 ease-out`} strokeDasharray={`${fleetHealth}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <span className={`text-[10px] font-black ${fleetHealth === 100 ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-300'}`}>{fleetHealth}%</span>
                              </div>
                          </div>
                          <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Flotta Egészség</p>
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{hasServices ? 'Kalkulált érték' : 'Nincs adat'}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-4 px-6 py-3 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm min-w-[220px]">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-50"><span className="font-bold text-lg">💰</span></div>
                          <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Elmúlt 30 nap</p>
                              <p className="text-lg font-black text-slate-900 dark:text-white">{spentLast30Days.toLocaleString()}</p>
                          </div>
                      </div>
                  </div>
              )}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              
              {FEATURES.mileageLog && myCars.length > 0 && (
                  <QuickMileageForm cars={myCars} latestCarId={latestCarId} />
              )}

              <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600"><CarFront className="w-5 h-5" /></span>
                          Saját Garázs
                      </h3>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${isCarLimitReached ? 'bg-red-50 text-red-500 border-red-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {myCars.length} / {limits.maxCars === 999 ? '∞' : limits.maxCars}
                      </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {myCars.map((car: any, index: number) => (
                          <CarCard key={car.id} car={car} priority={index === 0} />
                      ))}
                      
                      {!isCarLimitReached ? (
                         <Link href="/cars/new" id="tour-add-car" className="group relative flex flex-col items-center justify-center min-h-[300px] rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-400 transition-all cursor-pointer">
                             <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                 <Plus className="w-8 h-8 text-slate-400 group-hover:text-amber-500" />
                             </div>
                             <span className="font-bold text-slate-500 group-hover:text-slate-900">Új jármű hozzáadása</span>
                         </Link>
                      ) : (
                         <Link href="/pricing" id="tour-add-car" className="group relative flex flex-col items-center justify-center min-h-[300px] rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 dark:bg-slate-900/50 opacity-75 hover:opacity-100 transition-all cursor-pointer">
                             <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-400"><Lock className="w-8 h-8" /></div>
                             <span className="font-bold text-slate-500">Limit elérve</span>
                             <span className="text-xs text-amber-500 font-bold mt-2 uppercase tracking-wide">Válts Pro-ra a bővítéshez</span>
                         </Link>
                      )}
                  </div>
              </div>

              {FEATURES.sharedCars && sharedCars.length > 0 && (
                  <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between px-2">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-500"><Users className="w-5 h-5" /></span>
                              Megosztva Velem
                          </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {sharedCars?.map((car: any) => <CarCard key={car.id} car={car} shared={true} />)}
                      </div>
                  </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-8">
               
               {plan === 'free' && (
                   <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white text-center shadow-xl relative overflow-hidden group cursor-pointer">
                       <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>
                       <h3 className="text-xl font-black uppercase italic mb-2 relative z-10">Hiányzik az AI?</h3>
                       <p className="text-sm text-indigo-100 mb-4 relative z-10">Az AI Szerelő és a korlátlan garázs csak egy kattintásra van.</p>
                       <Link href="/pricing" className="inline-block w-full bg-white text-indigo-600 font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-50 transition-colors relative z-10">Pro Csomag Megnézése</Link>
                   </div>
               )}

              <Link href="/showroom" className="block relative group overflow-hidden rounded-3xl shadow-xl transition-transform hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-700"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="relative p-8 flex flex-col items-center text-center text-white">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 text-3xl shadow-inner border border-white/20 group-hover:rotate-12 transition-transform duration-500">🔥</div>
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Showroom Battle</h3>
                  <div className="w-full bg-white/10 backdrop-blur-sm border border-white/20 py-3 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 group-hover:bg-white group-hover:text-red-600 transition-colors">
                    <span>Belépés az Arénába</span><ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>

              {/* Streaming Content: A Server Componentet Suspense-el töltjük */}
              <Suspense fallback={<LoadingWidget />}>
                  <MarketplaceSection />
              </Suspense>

             {FEATURES.gamification && <GamificationWidget badges={badges} />}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                  {FEATURES.weather && <WeatherWidget />}
                  {FEATURES.fuelPrices && <FuelWidget />}
                  {cars.length > 0 && (
                    <QuickCostOverview spentLast30Days={spentLast30Days} spendingTrend={0} totalSpent={0} />
                  )}
              </div>

              {FEATURES.reminders && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">Emlékeztetők</h3>
                        {upcomingReminders.length > 0 && <Link href="/reminders" className="text-xs font-bold text-slate-400 hover:text-amber-500 transition-colors">Összes</Link>}
                    </div>
                    <div className="p-5 space-y-4">
                        {upcomingReminders.length > 0 ? upcomingReminders.map((rem: any) => (
                             <div key={rem.id} className="flex items-center gap-4 p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                                 <div className="flex-col flex items-center justify-center w-12 h-12 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-500 font-bold text-sm shadow-sm">
                                     <span>{new Date(rem.due_date).getDate()}</span>
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{rem.service_type}</p>
                                     <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{rem.cars?.make} {rem.cars?.model}</p>
                                 </div>
                             </div>
                        )) : <div className="text-center py-8 text-sm text-slate-400 italic">Nincs közelgő teendő.</div>}
                    </div>
                </div>
              )}
              
              {FEATURES.activityLog && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Legutóbbiak</h3>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {recentActivity.length > 0 ? recentActivity.map((act: any) => (
                            <div key={act.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{act.title}</p>
                                    <p className="text-xs text-slate-500">{new Date(act.event_date).toLocaleDateString('hu-HU')}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <span className="block text-sm font-bold font-mono">{act.cost > 0 ? `${act.cost.toLocaleString()} Ft` : '-'}</span>
                                </div>
                            </div>
                        )) : <div className="text-center py-8 text-sm text-slate-400 italic">Nincs előzmény.</div>}
                    </div>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  )
}

// --- MAIN PAGE COMPONENT ---
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = userData?.role || 'user';

    if (role === 'dealer') {
        const { data: dealerCars } = await supabase
            .from('cars')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        return <DealerDashboard user={user} cars={dealerCars || []} />
    } else {
        return <UserDashboard user={user} supabase={supabase} />
    }
  }

  const params = await searchParams
  if (params.check !== undefined) return redirect('/check');

  const [promoRes, updatesRes] = await Promise.all([
      supabase.from('promotions').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('release_notes').select('*').order('release_date', { ascending: false }).limit(5)
  ]);

  const activePromo = promoRes.data;
  const updates = updatesRes.data;

  const secret = params.dev
  if (secret === DEV_SECRET_KEY) {
    return <UserDashboard user={{ id: 'dev-user', email: 'dev@test.com' }} supabase={supabase} />
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="w-full flex flex-col items-center justify-center py-12 md:py-24">
          <LandingPage promo={activePromo} updates={updates || []} />
        </div>
      </div>
    </div>
  )
}