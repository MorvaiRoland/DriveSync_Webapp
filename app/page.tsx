import { createClient } from '@/supabase/server'
import { signOut } from './login/action'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getSubscriptionStatus, PLAN_LIMITS } from '@/utils/subscription'
import { MOBILE_CARD_SIZES } from '@/utils/imageOptimization'
import { Plus, Settings, LogOut, CarFront, Users, Lock, ArrowRight, Map, Crown } from 'lucide-react';
import HeaderNav from '@/components/HeaderNav';
import QuickMileageForm from '@/components/QuickMileageForm';
import { Metadata } from 'next'
import OnboardingTour from '@/components/OnboardingTour';

export const metadata: Metadata = {
  title: {
    absolute: "Prémium Garázsmenedzsment"
  }
}

// Dynamic imports
const ChangelogModal = dynamic(() => import('@/components/ChangelogModal'), { loading: () => null });
const AiMechanic = dynamic(() => import('@/components/AiMechanic'), { loading: () => null });
const CongratulationModal = dynamic(() => import('@/components/CongratulationModal'), { loading: () => null });
const GamificationWidget = dynamic(() => import('@/components/GamificationWidget'), { loading: () => null });
const WeatherWidget = dynamic(() => import('@/components/DashboardWidgets').then(m => ({ default: m.WeatherWidget })), { loading: () => null });
const FuelWidget = dynamic(() => import('@/components/FuelWidget'), { loading: () => null });
const MarketplaceSection = dynamic(() => import('@/components/MarketplaceSection'), { loading: () => null });
const QuickCostOverview = dynamic(() => import('@/components/QuickCostOverview'), { loading: () => null });
const LandingPage = dynamic(() => import('@/components/LandingPage'), { ssr: true });

const DEV_SECRET_KEY = "admin"; 
const FEATURES = {
  mileageLog: true, addCar: true, aiMechanic: true, reminders: true,
  activityLog: true, gamification: true, weather: true, fuelPrices: true, sharedCars: true,
};

async function DashboardComponent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  // --- ELŐFIZETÉS & LIMITEK LEKÉRÉSE ---
  const { plan, isTrial } = await getSubscriptionStatus(supabase, user.id);
  const limits = PLAN_LIMITS[plan];

  // Jogosultságok
  const canUseAi = limits.aiMechanic;
  const canTripPlan = limits.tripPlanner;
  
  const isPro = limits.aiMechanic;

  // --- ADATLEKÉRÉSEK ---
  let cars: any[] = []
  let myCars: any[] = []      
  let sharedCars: any[] = []  
  let upcomingReminders: any[] = []
  let recentActivity: any[] = []
  let spentLast30Days = 0; 
  let spendingTrend = 0;   
  let fleetHealth = 100 
  let latestCarId = null
  let badges: any[] = []
  let totalCostAllTime = 0;

  const { data: carsData } = await supabase
      .from('cars')
      .select('*, events(type, mileage), car_shares(email)')
      .order('created_at', { ascending: false })
  
  if (carsData) {
      cars = carsData
      myCars = carsData.filter(car => car.user_id === user.id)
      sharedCars = carsData.filter(car => 
        car.user_id !== user.id && 
        car.car_shares && 
        car.car_shares.some((share: any) => share.email === user.email)
      )
      latestCarId = myCars.length > 0 ? myCars[0].id : (cars.length > 0 ? cars[0].id : null);
  }

  // Autó hozzáadás limit ellenőrzése
  const isCarLimitReached = myCars.length >= limits.maxCars;

  const hasServices = myCars.some(car => car.events && car.events.some((e: any) => e.type === 'service'));

  if (cars.length > 0) {
      const relevantCarIds = [...myCars, ...sharedCars].map(c => c.id);
      if (relevantCarIds.length > 0) {
          const { data: reminders } = await supabase.from('service_reminders').select('*, cars(make, model)').in('car_id', relevantCarIds).order('due_date', { ascending: true }).limit(3);
          if (reminders) upcomingReminders = reminders;

          const { data: activities } = await supabase.from('events').select('*, cars(make, model)').in('car_id', relevantCarIds).order('event_date', { ascending: false }).limit(5);
          if (activities) recentActivity = activities;

          const { data: allCosts } = await supabase.from('events').select('cost, event_date').in('car_id', relevantCarIds);
          if (allCosts) {
              const now = new Date();
              const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
              const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
              spentLast30Days = allCosts.filter(e => new Date(e.event_date) >= thirtyDaysAgo).reduce((sum, e) => sum + (e.cost || 0), 0);
              const spentPrev30Days = allCosts.filter(e => { const d = new Date(e.event_date); return d >= sixtyDaysAgo && d < thirtyDaysAgo; }).reduce((sum, e) => sum + (e.cost || 0), 0);
              if (spentPrev30Days > 0) spendingTrend = Math.round(((spentLast30Days - spentPrev30Days) / spentPrev30Days) * 100);
              else if (spentLast30Days > 0) spendingTrend = 100;
              totalCostAllTime = allCosts.reduce((sum, e) => sum + (e.cost || 0), 0);
          }
      }
    if (myCars.length > 0) {
         const totalHealth = myCars.reduce((sum, car) => {
            if (car.fuel_type === 'Elektromos') {
                 return sum + 100;
            }
            const interval = car.service_interval_km || 15000;
            let lastServiceKm = car.last_service_mileage || 0;
            if (car.events && Array.isArray(car.events)) {
                const serviceEvents = car.events.filter((e: any) => e.type === 'service');
                if (serviceEvents.length > 0) {
                    const maxEventKm = Math.max(...serviceEvents.map((e: any) => e.mileage));
                    if (maxEventKm > lastServiceKm) {
                        lastServiceKm = maxEventKm;
                    }
                }
            }
            const currentKm = car.mileage || 0;
            const kmDrivenSinceService = Math.max(0, currentKm - lastServiceKm);
            let healthPercent = ((interval - kmDrivenSinceService) / interval) * 100;
            healthPercent = Math.max(0, Math.min(100, healthPercent));
            return sum + healthPercent;
         }, 0);
         fleetHealth = Math.round(totalHealth / myCars.length);
      } else {
         fleetHealth = 100;
      }
    }
  const hour = new Date().getHours();
  const greeting = hour < 10 ? 'Jó reggelt' : hour < 18 ? 'Szép napot' : 'Szép estét';

  const isHighMiler = cars.some(c => c.mileage >= 200000);
  const isAdmin = recentActivity.length > 0;
  const isEcoDriver = fleetHealth >= 90;
  badges = [
      { id: 'high-miler', name: 'High Miler', icon: '🛣️', description: '200.000+ km.', earned: isHighMiler, color: 'from-purple-500 to-indigo-600 text-white' },
      { id: 'eco-driver', name: 'Eco Driver', icon: '🍃', description: 'Flotta egészség >90%.', earned: isEcoDriver, color: 'from-emerald-400 to-green-600 text-white' },
      { id: 'admin', name: 'Pontos Admin', icon: '📅', description: 'Aktív használat.', earned: isAdmin, color: 'from-blue-400 to-blue-600 text-white' }
  ];

  // --- OKOS MEGJELENÍTÉSI LOGIKA ---
  
  // 1. Van-e autója?
  const hasCars = cars.length > 0;
  
  // 2. Fiók kora (órában)
  // Ha a user.created_at valamiért hiányzik, fallback a mostani időre (így 0 órásnak tűnik)
  const userCreated = new Date(user.created_at || new Date().toISOString());
  const now = new Date();
  const accountAgeHours = (now.getTime() - userCreated.getTime()) / (1000 * 60 * 60);

  // 3. TÚRA logika:
  // Csak akkor mutatjuk, ha NINCS autója ÉS a fiókja fiatalabb, mint 24 óra.
  // Így a visszatérő, de autótlan felhasználókat nem zaklatjuk.
  const showTour = !hasCars && accountAgeHours < 24;

  // 4. CHANGELOG logika:
  // Csak akkor mutatjuk, ha VAN autója (aktív felhasználó).
  const showChangelog = hasCars;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500 selection:bg-amber-500/30 selection:text-amber-600">
      
      {/* ONBOARDING TÚRA - Feltételes megjelenítés */}
      {showTour && <OnboardingTour />}

      {/* HÁTTÉR EFFEKTEK */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <CongratulationModal currentPlan={plan} />
      
      {/* AI MECHANIC: Csak ha a csomag engedi */}
      {canUseAi ? <AiMechanic isPro={true} /> : null}
      
      {/* CHANGELOG: Csak ha van autója */}
      {showChangelog && <ChangelogModal />}
      
      <nav 
        className="absolute left-0 right-0 z-50 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-[env(safe-area-inset-top)]" 
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-lg shadow-black/5 px-4 h-16 flex items-center justify-between transition-all duration-300 mt-2">

          <div className="flex items-center">
            {/* HeaderNav megkapja az isPro propot */}
            <HeaderNav isPro={isPro} />
          </div>

          <div className="flex items-center gap-3">
            {/* ÚTTERVEZŐ GOMB - LIMIT KEZELÉSSEL */}
            {canTripPlan ? (
                <Link href="/trip-planner" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                  <Map className="w-4 h-4" /> Úttervező
                </Link>
            ) : (
                <Link href="/pricing" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-xs uppercase tracking-wider transition-all">
                  <Lock className="w-4 h-4" /> Úttervező
                </Link>
            )}
            
            {/* --- PLAN BADGE (Dinamikus) --- */}
            <Link href="/pricing" className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all shadow-sm ${
                plan === 'free' ? 'bg-slate-100 text-slate-500 border-slate-200' : 
                plan === 'lifetime' ? 'bg-purple-100 text-purple-600 border-purple-200' :
                'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-600'
            }`}>
              {plan === 'lifetime' ? <><Crown className="w-3 h-3"/> Lifetime</> : isTrial ? 'Early Access Pro' : plan === 'free' ? 'Starter' : 'Pro Plan'}
            </Link>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
            
            <Link href="/settings" className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Beállítások">
              <Settings className="w-5 h-5" />
            </Link>
            
            <form action={signOut}>
              <button className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors" title="Kilépés">
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>

        </div>
      </nav>

      <div 
        className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10 pb-32 pt-[calc(env(safe-area-inset-top)+6rem)]"
      >
        
        {/* 2. ID: tour-welcome */}
        <div id="tour-welcome" className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h2 className="text-slate-500 dark:text-slate-400 font-medium text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {greeting},
              </h2>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0]}
              </h1>
            </div>
            
            {/* 3. ID: tour-stats */}
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
                  <QuickMileageForm 
                      cars={myCars} 
                      latestCarId={latestCarId} 
                  />
              )}

              {(myCars.length > 0 || FEATURES.addCar || sharedCars.length > 0) && (
                  <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                          <h3 className="text-xl font-bold flex items-center gap-2">
                              <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600"><CarFront className="w-5 h-5" /></span>
                              Saját Garázs
                          </h3>
                          {/* LIMIT KIJELZÉS */}
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${isCarLimitReached ? 'bg-red-50 text-red-500 border-red-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                              {myCars.length} / {limits.maxCars === 999 ? '∞' : limits.maxCars}
                          </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {myCars.map((car: any) => (
                              <CarCard key={car.id} car={car} />
                          ))}
                          
                          {/* 4. ID: tour-add-car */}
                          {/* ÚJ AUTÓ GOMB: Csak ha belefér a limitbe */}
                          {!isCarLimitReached ? (
                             <Link href="/cars/new" id="tour-add-car" className="group relative flex flex-col items-center justify-center min-h-[300px] rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-400 transition-all cursor-pointer">
                                  <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                      <Plus className="w-8 h-8 text-slate-400 group-hover:text-amber-500" />
                                  </div>
                                  <span className="font-bold text-slate-500 group-hover:text-slate-900">Új jármű hozzáadása</span>
                             </Link>
                          ) : (
                             /* LOCKED STATE - Ha elérte a limitet */
                             <Link href="/pricing" id="tour-add-car" className="group relative flex flex-col items-center justify-center min-h-[300px] rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800 opacity-75 hover:opacity-100 transition-all cursor-pointer">
                                  <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
                                      <Lock className="w-8 h-8" />
                                  </div>
                                  <span className="font-bold text-slate-500">Limit elérve</span>
                                  <span className="text-xs text-amber-500 font-bold mt-2 uppercase tracking-wide">Válts Pro-ra a bővítéshez</span>
                             </Link>
                          )}
                      </div>
                  </div>
              )}

              {FEATURES.sharedCars && sharedCars.length > 0 && (
                  <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between px-2">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-500"><Users className="w-5 h-5" /></span>
                              Megosztva Velem
                          </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {sharedCars.map((car) => (
                              <CarCard key={car.id} car={car} shared={true} />
                          ))}
                      </div>
                  </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-8">
               
               {/* Ha FREE user, itt reklámozhatod a Pro funkciókat */}
               {plan === 'free' && (
                   <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white text-center shadow-xl relative overflow-hidden group cursor-pointer">
                       <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>
                       <h3 className="text-xl font-black uppercase italic mb-2 relative z-10">Hiányzik az AI?</h3>
                       <p className="text-sm text-indigo-100 mb-4 relative z-10">Az AI Szerelő és a korlátlan garázs csak egy kattintásra van.</p>
                       <Link href="/pricing" className="inline-block w-full bg-white text-indigo-600 font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-50 transition-colors relative z-10">
                           Pro Csomag Megnézése
                       </Link>
                   </div>
               )}

              <Link href="/showroom" className="block relative group overflow-hidden rounded-3xl shadow-xl transition-transform hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-700"></div>
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="relative p-8 flex flex-col items-center text-center text-white">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 text-3xl shadow-inner border border-white/20 group-hover:rotate-12 transition-transform duration-500">🔥</div>
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Showroom Battle</h3>
                  <p className="text-sm text-orange-100 font-medium mb-6 leading-relaxed">Szavazz a legszebb autókra, gyűjts XP-t és urald a ranglistát!</p>
                  <div className="w-full bg-white/10 backdrop-blur-sm border border-white/20 py-3 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 group-hover:bg-white group-hover:text-red-600 transition-colors">
                    <span>Belépés az Arénába</span><ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>

              <MarketplaceSection />
              {FEATURES.gamification && <GamificationWidget badges={badges} />}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                  {FEATURES.weather && <WeatherWidget />}
                  {FEATURES.fuelPrices && <FuelWidget />}
                  {cars.length > 0 && (
                    <QuickCostOverview 
                      spentLast30Days={spentLast30Days} 
                      spendingTrend={spendingTrend} 
                      totalSpent={totalCostAllTime}
                    />
                  )}
              </div>

              {FEATURES.reminders && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">Emlékeztetők</h3>
                        {upcomingReminders.length > 0 && <Link href="/reminders" className="text-xs font-bold text-slate-400 hover:text-amber-500 transition-colors">Összes</Link>}
                    </div>
                    <div className="p-5 space-y-4">
                        {upcomingReminders.length > 0 ? (
                            upcomingReminders.map((rem: any) => (
                                <div key={rem.id} className="flex items-center gap-4 p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700 transition-colors cursor-pointer group">
                                    <div className="flex-col flex items-center justify-center w-12 h-12 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-500 font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                                        <span>{new Date(rem.due_date).getDate()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{rem.service_type}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{rem.cars?.make} {rem.cars?.model}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-sm text-slate-400 italic">Nincs közelgő teendő.</div>
                        )}
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

function CarCard({ car, shared }: { car: any, shared?: boolean }) {
  return (
    <div className={`relative group flex flex-col bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-slate-100 dark:border-slate-700 h-full ${shared ? 'ring-2 ring-blue-500/30' : ''}`}>
      <Link href={`/cars/${car.id}`} className="relative h-60 overflow-hidden">
         {car.image_url ? (
            <Image 
              src={car.image_url} 
              alt={`${car.make} ${car.model}`} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-700" 
              loading="lazy"
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

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    return <DashboardComponent />
  }

  const params = await searchParams
  if (params.check !== undefined) {
      return redirect('/check')
  }

  const { data: activePromo } = await supabase.from('promotions').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(1).maybeSingle()
  const { data: updates } = await supabase.from('release_notes').select('*').order('release_date', { ascending: false }).limit(5);

  const secret = params.dev
  if (secret === DEV_SECRET_KEY) {
    return <DashboardComponent />
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500 selection:bg-amber-500/30 selection:text-amber-600">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="w-full flex flex-col items-center justify-center py-12 md:py-24">
          <LandingPage promo={activePromo} updates={updates || []} />
        </div>
      </div>
    </div>
  )
}