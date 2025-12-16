import { createClient } from '@/supabase/server'
import { signOut } from './login/action'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import ChangelogModal from '@/components/ChangelogModal'
import { WeatherWidget } from '@/components/DashboardWidgets'
import ReminderChecker from '@/components/ReminderChecker'
import AiMechanic from '@/components/AiMechanic'
import GamificationWidget from '@/components/GamificationWidget'
import PromoModal from '@/components/PromoModal'
import SubscribeForm from '@/components/SubscribeForm'
import { getSubscriptionStatus, checkLimit, PLAN_LIMITS, type SubscriptionPlan } from '@/utils/subscription'
import { Hammer, History, Fuel, Wrench, Lock, Plus, Pencil, ArrowRight, Sparkles, Calendar, CheckCircle2, Users, Bell, LogOut, Settings, Gauge, CarFront } from 'lucide-react';
import FuelWidget from '@/components/FuelWidget';
import LandingPage from '@/components/LandingPage';
import CongratulationModal from '@/components/CongratulationModal';
import MarketplaceSection from '@/components/MarketplaceSection'

const DEV_SECRET_KEY = "admin"; 
const FEATURES = {
  mileageLog: true, addCar: true, aiMechanic: true, reminders: true,
  activityLog: true, gamification: true, weather: true, fuelPrices: true, sharedCars: true,
};

async function logCurrentMileage(formData: FormData) {
  'use server'
  const car_id = formData.get('car_id');
  const current_mileage = parseInt(String(formData.get('current_mileage')));

  if (!car_id || isNaN(current_mileage) || current_mileage <= 0) {
    return redirect(`/?dev=${DEV_SECRET_KEY}&error=${encodeURIComponent('Hibás km állás.')}`);
  }

  const supabase = await createClient();
  const { error: carError } = await supabase.from('cars').update({ mileage: current_mileage }).eq('id', car_id);
  
  if (carError) return redirect(`/?dev=${DEV_SECRET_KEY}&error=${encodeURIComponent('Hiba történt.')}`);

  await supabase.from('events').insert({
      car_id: car_id, type: 'other', title: 'Futás rögzítése', event_date: new Date().toISOString(),
      mileage: current_mileage, cost: 0, notes: 'Gyors rögzítés a főoldalról'
  });

  return redirect(`/?dev=${DEV_SECRET_KEY}&success=Km+frissitve`);
}

// =================================================================================================
// DASHBOARD KOMPONENS (DESIGN FRISSÍTVE: STICKY NAV + THEMED WIDGET)
// =================================================================================================
async function DashboardComponent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

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
  let subscription: any = null
  let plan: SubscriptionPlan = 'free'; 
  let canAddCar = true;
  let canUseAi = false;

  plan = await getSubscriptionStatus(user.id);
  const { data: subData } = await supabase.from('subscriptions').select('status, plan_type').eq('user_id', user.id).single();
  subscription = subData;

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

  canAddCar = checkLimit(plan, 'maxCars', myCars.length);
  canUseAi = checkLimit(plan, 'allowAi');
  
  const hasServices = myCars.some(car => car.events && car.events.some((e: any) => e.type === 'service'));

  if (cars.length > 0) {
      const relevantCarIds = [...myCars, ...sharedCars].map(c => c.id);

      if (relevantCarIds.length > 0) {
          const { data: reminders } = await supabase
            .from('service_reminders')
            .select('*, cars(make, model)')
            .in('car_id', relevantCarIds)
            .order('due_date', { ascending: true })
            .limit(3);
          if (reminders) upcomingReminders = reminders;

          const { data: activities } = await supabase
            .from('events')
            .select('*, cars(make, model)')
            .in('car_id', relevantCarIds)
            .order('event_date', { ascending: false })
            .limit(5);
          if (activities) recentActivity = activities;

          const { data: allCosts } = await supabase
            .from('events')
            .select('cost, event_date')
            .in('car_id', relevantCarIds);
            
          if (allCosts) {
              const now = new Date();
              const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
              const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

              spentLast30Days = allCosts.filter(e => new Date(e.event_date) >= thirtyDaysAgo).reduce((sum, e) => sum + (e.cost || 0), 0);
              const spentPrev30Days = allCosts.filter(e => { const d = new Date(e.event_date); return d >= sixtyDaysAgo && d < thirtyDaysAgo; }).reduce((sum, e) => sum + (e.cost || 0), 0);

              if (spentPrev30Days > 0) spendingTrend = Math.round(((spentLast30Days - spentPrev30Days) / spentPrev30Days) * 100);
              else if (spentLast30Days > 0) spendingTrend = 100;
          }
      }

      if (myCars.length > 0) {
          const totalHealthScore = myCars.reduce((sum, car) => {
              if (car.status === 'service') return sum + 0;
              const interval = car.service_interval_km || 15000;
              let lastServiceKm = car.last_service_mileage || 0;
              if (car.events && car.events.length > 0) {
                  const serviceEvents = car.events.filter((e: any) => e.type === 'service').map((e: any) => e.mileage);
                  if (serviceEvents.length > 0) {
                      const maxServiceKm = Math.max(...serviceEvents);
                      if (maxServiceKm > lastServiceKm) lastServiceKm = maxServiceKm;
                  }
              }
              if (lastServiceKm === 0 && car.mileage < interval) lastServiceKm = 0; 
              const drivenSinceService = Math.max(0, car.mileage - lastServiceKm);
              let carHealth = (1 - (drivenSinceService / interval)) * 100;
              carHealth = Math.max(0, Math.min(100, carHealth));
              return sum + carHealth;
          }, 0);
          fleetHealth = Math.round(totalHealthScore / myCars.length);
      } else {
          fleetHealth = 100;
      }

      const isHighMiler = cars.some(c => c.mileage >= 200000);
      const lastActivityDate = recentActivity.length > 0 ? new Date(recentActivity[0].event_date) : new Date(0);
      const diffDays = Math.floor((new Date().getTime() - lastActivityDate.getTime()) / (1000 * 3600 * 24));
      const isAdmin = recentActivity.length > 0 && diffDays <= 7;
      const isEcoDriver = fleetHealth >= 90;

      badges = [
          { id: 'high-miler', name: 'High Miler', icon: '🛣️', description: '200.000+ km.', earned: isHighMiler, color: 'from-purple-500 to-indigo-600 text-white' },
          { id: 'eco-driver', name: 'Eco Driver', icon: '🍃', description: 'Flotta egészség >90%.', earned: isEcoDriver, color: 'from-emerald-400 to-green-600 text-white' },
          { id: 'admin', name: 'Pontos Admin', icon: '📅', description: 'Aktivitás 7 napon belül.', earned: isAdmin, color: 'from-blue-400 to-blue-600 text-white' }
      ];
  }

  const hour = new Date().getHours();
  const greeting = hour < 10 ? 'Jó reggelt' : hour < 18 ? 'Szép napot' : 'Szép estét';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500 selection:bg-amber-500/30 selection:text-amber-600">
      
      {/* HÁTTÉR EFFEKTEK */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <CongratulationModal currentPlan={subscription?.plan_type || 'free'} />
      {FEATURES.aiMechanic && canUseAi ? <AiMechanic isPro={true} /> : null}
      <ChangelogModal />
      <ReminderChecker />

      {/* --- NAVBAR (LIQUID GLASS STYLE & STICKY FIX) --- */}
      {/* --- NAVBAR (FIXED POZÍCIÓ) --- */}
      <nav className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-lg shadow-black/5 px-4 h-16 flex items-center justify-between transition-all duration-300">
           {/* ... a belső tartalom változatlan ... */}
           <div className="flex items-center gap-6"> 
             <Link href="/" className="flex items-center gap-3 group">
               <div className="relative w-8 h-8 group-hover:rotate-12 transition-transform duration-500">
                 <Image src="/DynamicSense-logo.png" alt="DynamicSense" fill className="object-contain drop-shadow-md" priority />
               </div>
               <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase hidden sm:block">
                 Dynamic<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Sense</span>
               </span>
             </Link>
             <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                <Link href="/pricing" className="hover:text-amber-500 transition-colors">Csomagok</Link>
                <Link href="/showroom" className="flex items-center gap-1 hover:text-orange-500 transition-colors">
                   <span className="text-lg">🔥</span> Showroom
                </Link>
             </div>
           </div>

           <div className="flex items-center gap-3">
             <Link href="/pricing" className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all shadow-sm ${
                 subscription?.plan_type === 'founder' || subscription?.plan_type === 'lifetime' 
                   ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' 
                 : subscription?.plan_type === 'pro' 
                   ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400' 
                 : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
             }`}>
                 {(subscription?.plan_type === 'founder' || subscription?.plan_type === 'lifetime') && <span className="text-sm">🚀</span>}
                 {
                   subscription?.plan_type === 'founder' ? 'Founder' : 
                   subscription?.plan_type === 'lifetime' ? 'Lifetime' :
                   subscription?.plan_type === 'pro' ? 'Pro' : 'Starter'
                 }
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

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10 pb-32">
        
        {/* --- HERO HEADER --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h2 className="text-slate-500 dark:text-slate-400 font-medium text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  {greeting},
              </h2>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0]}
              </h1>
            </div>

            {/* --- KPI STATS BAR --- */}
            {cars.length > 0 && (
                <div className="w-full lg:w-auto bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-2 border border-white/20 dark:border-slate-700 shadow-xl flex flex-col sm:flex-row gap-2">
                    {/* Health Score */}
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

                    {/* Spending */}
                    <div className="flex items-center gap-4 px-6 py-3 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm min-w-[220px]">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <span className="font-bold text-lg">💰</span>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Elmúlt 30 nap</p>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-black text-slate-900 dark:text-white">{spentLast30Days.toLocaleString()}</p>
                                {spendingTrend !== 0 && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${spendingTrend > 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'}`}>
                                        {spendingTrend > 0 ? '↑' : '↓'} {Math.abs(spendingTrend)}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* --- MAIN GRID CONTENT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* BAL OLDAL (Fő funkciók) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* 1. GYORS KM NAPLÓZÁS WIDGET (TÉMA KORREKCIÓ: Fekete/Fehér) */}
              {FEATURES.mileageLog && myCars.length > 0 && (
                  <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl p-6 sm:p-8 group border border-slate-200 dark:border-slate-800">
                      
                      {/* Background decorations - Subtle */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-colors duration-700"></div>
                      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

                      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                          <div className="flex items-center gap-4 w-full md:w-auto">
                              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
                                  <Gauge className="w-7 h-7 text-amber-500" />
                              </div>
                              <div>
                                  <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Gyors Km Rögzítés</h3>
                                  <p className="text-slate-500 dark:text-slate-400 text-sm">Frissítsd az óraállást egy kattintással.</p>
                              </div>
                          </div>

                          <form action={logCurrentMileage} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                              <div className="relative group/input">
                                  <select 
                                      name="car_id" 
                                      className="w-full sm:w-48 pl-4 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none appearance-none cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
                                      defaultValue={latestCarId || ""}
                                  >
                                      {myCars.map((car) => (
                                          <option key={car.id} value={car.id}>
                                              {car.make} {car.model}
                                          </option>
                                      ))}
                                  </select>
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                  </div>
                              </div>

                              <div className="relative flex-1 sm:flex-none">
                                  <input 
                                      type="number" 
                                      name="current_mileage" 
                                      placeholder="Új állás..." 
                                      className="w-full sm:w-36 pl-4 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white"
                                      required
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">KM</span>
                              </div>

                              <button type="submit" className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-2">
                                  <CheckCircle2 className="w-5 h-5" />
                                  <span className="hidden sm:inline">Mentés</span>
                              </button>
                          </form>
                      </div>
                  </div>
              )}

              {/* 2. SAJÁT AUTÓK */}
              {(myCars.length > 0 || FEATURES.addCar || sharedCars.length > 0) && (
                  <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500">
                                  <CarFront className="w-5 h-5" />
                              </span>
                              Saját Garázs
                          </h3>
                          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              {myCars.length} / {PLAN_LIMITS[plan].maxCars === Infinity ? '∞' : PLAN_LIMITS[plan].maxCars}
                          </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {myCars.map((car) => (
                              <CarCard key={car.id} car={car} />
                          ))}
                          
                          {FEATURES.addCar && (
                             <Link 
                               href={canAddCar ? "/cars/new" : "/pricing"} 
                               className={`group relative flex flex-col items-center justify-center min-h-[300px] rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
                                 canAddCar 
                                   ? 'border-slate-300 dark:border-slate-700 bg-white/30 dark:bg-slate-800/30 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xl'
                                   : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 opacity-70'
                               }`}
                             >
                                  {canAddCar ? (
                                    <>
                                      <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                          <Plus className="w-8 h-8 text-slate-400 group-hover:text-amber-500 transition-colors" />
                                      </div>
                                      <span className="font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white text-lg">Új jármű hozzáadása</span>
                                      <span className="text-xs text-slate-400 mt-1">Bővítsd a garázsodat</span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-amber-500/50 group-hover:text-amber-500 transition-colors">
                                          <Lock className="w-8 h-8" />
                                      </div>
                                      <span className="font-bold text-slate-400 text-lg mb-1">Garázs megtelt</span>
                                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">Válts Pro csomagra</span>
                                    </>
                                  )}
                             </Link>
                          )}
                      </div>
                  </div>
              )}

              {/* 3. MEGOSZTOTT AUTÓK */}
              {FEATURES.sharedCars && sharedCars.length > 0 && (
                  <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between px-2">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-500">
                                  <Users className="w-5 h-5" />
                              </span>
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

            {/* JOBB OLDAL (Widgetek) */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* SHOWROOM BATTLE WIDGET */}
              <Link href="/showroom" className="block relative group overflow-hidden rounded-3xl shadow-xl transition-transform hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-700"></div>
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                
                <div className="relative p-8 flex flex-col items-center text-center text-white">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 text-3xl shadow-inner border border-white/20 group-hover:rotate-12 transition-transform duration-500">
                    🔥
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Showroom Battle</h3>
                  <p className="text-sm text-orange-100 font-medium mb-6 leading-relaxed">
                    Szavazz a legszebb autókra, gyűjts XP-t és urald a ranglistát!
                  </p>
                  <div className="w-full bg-white/10 backdrop-blur-sm border border-white/20 py-3 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 group-hover:bg-white group-hover:text-red-600 transition-colors">
                    <span>Belépés az Arénába</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>

              <MarketplaceSection />

              {FEATURES.gamification && <GamificationWidget badges={badges} />}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                  {FEATURES.weather && <WeatherWidget />}
                  {FEATURES.fuelPrices && <FuelWidget />}
              </div>
              
              {/* EMLÉKEZTETŐK WIDGET */}
              {FEATURES.reminders && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-amber-500" />
                            Emlékeztetők
                        </h3>
                        {upcomingReminders.length > 0 && <Link href="/reminders" className="text-xs font-bold text-slate-400 hover:text-amber-500 transition-colors">Összes</Link>}
                    </div>
                    <div className="p-5 space-y-4">
                        {upcomingReminders.length > 0 ? (
                            upcomingReminders.map((rem: any) => (
                                <div key={rem.id} className="flex items-center gap-4 p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700 transition-colors cursor-pointer group">
                                    <div className="flex-col flex items-center justify-center w-12 h-12 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-500 font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                                        <span>{new Date(rem.due_date).getDate()}</span>
                                        <span className="text-[9px] uppercase">{new Date(rem.due_date).toLocaleString('hu-HU', { month: 'short' }).replace('.', '')}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{rem.service_type}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{rem.cars?.make} {rem.cars?.model}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                                    <Bell className="w-6 h-6 opacity-50" />
                                </div>
                                <p className="text-sm text-slate-400 italic">Nincs közelgő teendő.</p>
                            </div>
                        )}
                    </div>
                </div>
              )}

              {/* ACTIVITY LOG WIDGET */}
              {FEATURES.activityLog && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <History className="w-5 h-5 text-slate-400" />
                        Legutóbbiak
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {recentActivity.length > 0 ? (
                        recentActivity.map((act: any) => (
                            <div key={act.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors flex items-center gap-4">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm dark:border-slate-700
                                    ${act.type === 'fuel' 
                                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500' 
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                    }
                                `}>
                                    {act.type === 'fuel' ? <Fuel className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{act.title}</p>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="font-medium text-slate-400 dark:text-slate-500">
                                            {new Date(act.event_date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}
                                        </span>
                                        <span>•</span>
                                        <span className="truncate">{act.cars?.make} {act.cars?.model}</span>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <span className={`block text-sm font-bold font-mono ${act.cost > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                    {act.cost > 0 ? `${act.cost.toLocaleString()} Ft` : '-'}
                                    </span>
                                </div>
                            </div>
                        ))
                        ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-slate-400 italic">Nincs előzmény.</p>
                        </div>
                        )}
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
            <Image src={car.image_url} alt={`${car.make} ${car.model}`} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
         ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                <CarFront className="w-16 h-16 text-slate-300 dark:text-slate-600" />
            </div>
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent"></div>
         
         <div className={`absolute top-4 right-4 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md shadow-lg border border-white/10 ${car.status === 'active' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>
             {car.status === 'active' ? 'Aktív' : 'Szerviz'}
         </div>
         
         {shared && (
             <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-md text-white p-2 rounded-full shadow-lg border border-white/10" title="Megosztott autó">
                 <Users className="w-4 h-4" />
             </div>
         )}
         
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
      
      {!shared && (
          <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
             <Link href={`/cars/${car.id}/edit`} className="flex bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white hover:text-slate-900 shadow-lg border border-white/20 transition-all">
                 <Pencil className="w-4 h-4" />
             </Link>
          </div>
      )}
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

  const { data: activePromo } = await supabase
    .from('promotions')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: updates } = await supabase
    .from('release_notes')
    .select('*')
    .order('release_date', { ascending: false })
    .limit(5);

  const params = await searchParams
  const secret = params.dev
  if (secret === DEV_SECRET_KEY) {
    return <DashboardComponent />
  }

  return <LandingPage promo={activePromo} updates={updates || []} />
}