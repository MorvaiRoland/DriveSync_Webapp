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
import { Hammer, History, Fuel, Wrench, Lock, Plus, Pencil, ArrowRight, Sparkles, Calendar, CheckCircle2, Users } from 'lucide-react';
import FuelWidget from '@/components/FuelWidget';

// --- KONFIGURÁCIÓ ---
const DEV_SECRET_KEY = "admin"; 

// --- FEATURE FLAGS ---
const FEATURES = {
  mileageLog: true, addCar: true, aiMechanic: true, reminders: true,
  activityLog: true, gamification: true, weather: true, fuelPrices: true, sharedCars: true,
};

// --- SERVER ACTION: Km Naplózása ---
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
// ÚJ LANDING PAGE KOMPONENS
// =================================================================================================
function LandingPage({ promo, updates }: { promo?: any, updates: any[] }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200 selection:bg-amber-500/30 overflow-x-hidden">
      
      {/* 1. PROMÓCIÓS MODAL (Popup) */}
      {promo && <PromoModal promo={promo} />}

      {/* HÁTTÉR EFFEKTEK */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-amber-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[10%] left-[-10%] w-[30vw] h-[30vw] bg-blue-900/10 rounded-full blur-[100px]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* NAVBAR (Egyszerűsített) */}
      <nav className="relative z-50 w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
                <Image src="/drivesync-logo.png" alt="Logo" fill className="object-contain" priority />
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase hidden sm:block">
                Drive<span className="text-amber-500">Sync</span>
            </span>
        </div>
        <Link href="/login" className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all backdrop-blur-md flex items-center gap-2">
            Belépés <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10 flex-1 flex flex-col items-center pt-10 pb-20 px-4">
        
        {/* AKTÍV PROMÓCIÓ BANNER (Ha van) - Így nem csak Popupban látszik */}
        {promo && (
            <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700 w-full max-w-2xl">
                <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-purple-500/10 blur-xl group-hover:bg-purple-500/20 transition-all"></div>
                    <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-500/30 text-purple-300 relative z-10">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="flex-1 relative z-10">
                        <h3 className="font-bold text-white text-sm uppercase tracking-wide mb-0.5">{promo.title}</h3>
                        <p className="text-xs text-purple-200 line-clamp-1">{promo.description}</p>
                    </div>
                    <Link href="/login" className="relative z-10 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                        Megnézem
                    </Link>
                </div>
            </div>
        )}

        <div className="text-center max-w-3xl mx-auto space-y-6 mb-16">
            <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight leading-[1.1] drop-shadow-2xl">
                Az autód <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600">digitális agya.</span>
            </h1>
            <div className="max-w-2xl mx-auto space-y-6 my-8">
              <p className="text-lg sm:text-xl text-slate-400 leading-relaxed font-light">
                  Lépj ki a <span className="text-slate-200 font-medium">papíralapú múltból</span>. 
                  Az autód modern, a nyilvántartásod miért ne lenne az?
              </p>
              <p className="text-lg sm:text-xl text-slate-400 leading-relaxed font-light">
                  Cseréld le a füzetet egy <span className="text-amber-400 font-bold">profi rendszerre</span>, 
                  ahol minden adatod <span className="text-slate-200 font-medium">biztonságban van</span>, 
                  és mindig kéznél, amikor szükséged van rá.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/login" className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-lg font-bold px-8 py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:-translate-y-1 flex items-center justify-center gap-2">
                    Kezdés Ingyen <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#changelog" className="bg-slate-800 hover:bg-slate-700 text-white text-lg font-bold px-8 py-4 rounded-2xl transition-all border border-slate-700 hover:border-slate-600 flex items-center justify-center gap-2">
                    Újdonságok
                </a>
            </div>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl mb-24">
             {[
                { icon: '🤖', title: 'AI Szerelő', desc: 'Hibakód elemzés másodpercek alatt.' },
                { icon: '📊', title: 'Statisztika', desc: 'Költségek és fogyasztás vizualizálva.' },
                { icon: '🔔', title: 'Emlékeztetők', desc: 'Műszaki, olajcsere, biztosítás.' },
                { icon: '☁️', title: 'Felhő Alapú', desc: 'Minden adatod biztonságban, bárhol.' }
              ].map((item, i) => (
                <div key={i} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl hover:bg-slate-800/50 transition-colors group">
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">{item.icon}</div>
                    <h3 className="font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
        </div>

        {/* CHANGELOG SECTION */}
        <div id="changelog" className="w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Calendar className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Frissítési Napló</h2>
                    <p className="text-slate-400 text-sm">A fejlődés sosem áll meg.</p>
                </div>
            </div>

            <div className="relative border-l border-slate-800 ml-5 space-y-10 pb-10">
                {updates.length > 0 ? (
                    updates.map((update, index) => (
                        <div key={update.id || index} className="relative pl-10 group">
                            {/* Timeline Dot */}
                            <div className={`absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full border-2 ${index === 0 ? 'bg-amber-500 border-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-slate-900 border-slate-600 group-hover:border-slate-400'} transition-colors`}></div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-2">
                                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                                    {update.title}
                                    {index === 0 && <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">Új</span>}
                                </h3>
                                <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                    {update.version} • {new Date(update.release_date).toLocaleDateString('hu-HU')}
                                </span>
                            </div>
                            
                            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
                                {update.description}
                            </p>
                        </div>
                    ))
                ) : (
                    /* Ha nincs adatbázis adat, statikus placeholder */
                    <div className="relative pl-10">
                        <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-amber-500 shadow-[0_0_10px_#f59e0b]"></div>
                        <h3 className="text-lg font-bold text-white mb-1">DriveSync 1.8  🚀</h3>
                        <p className="text-slate-400 text-sm">Az alkalmazás hivatalosan elindult! AI funkciók, felhő szinkronizáció és modern design.</p>
                    </div>
                )}
                
                {/* Jövőbeli tervek teaser */}
                <div className="relative pl-10 opacity-50 hover:opacity-100 transition-opacity">
                    <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-slate-700"></div>
                    <h3 className="text-sm font-bold text-slate-300 mb-1 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Hamarosan...
                    </h3>
                    <ul className="text-xs text-slate-500 list-disc list-inside">
                        <li>-</li>
                        <li>-</li>
                    </ul>
                </div>
            </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center relative z-10">
         <p className="text-slate-600 text-xs font-mono uppercase tracking-widest">
            DriveSync Hungary • <span className="text-slate-500">2025</span>
         </p>
      </footer>
    </div>
  )
}

// =================================================================================================
// DASHBOARD LOGIKA (Változatlan)
// =================================================================================================
async function DashboardComponent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

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

  // --- ÚJ: ELLENŐRIZZÜK A PREMIUM STÁTUSZT ---
  const isPremium = subscription?.plan_type === 'pro' || subscription?.plan_type === 'lifetime' || subscription?.plan_type === 'founder';

  const { data: carsData } = await supabase
      .from('cars')
      .select('*, events(type, mileage)') 
      .order('created_at', { ascending: false })
  
  if (carsData) {
      cars = carsData
      myCars = carsData.filter(car => car.user_id === user.id)
      sharedCars = carsData.filter(car => car.user_id !== user.id)
      latestCarId = myCars.length > 0 ? myCars[0].id : (cars.length > 0 ? cars[0].id : null);
  }

  canAddCar = checkLimit(plan, 'maxCars', myCars.length);
  canUseAi = checkLimit(plan, 'allowAi');
  // Ezt illeszd be a fleetHealth számítás után:
const hasServices = myCars.some(car => car.events && car.events.some((e: any) => e.type === 'service'));

  if (cars.length > 0) {
      const { data: reminders } = await supabase.from('service_reminders').select('*, cars(make, model)').order('due_date', { ascending: true }).limit(3);
      if (reminders) upcomingReminders = reminders;

      const { data: activities } = await supabase.from('events').select('*, cars(make, model)').order('event_date', { ascending: false }).limit(5);
      if (activities) recentActivity = activities;

      const { data: allCosts } = await supabase.from('events').select('cost, event_date');
      if (allCosts) {
          const now = new Date();
          const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
          const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

          spentLast30Days = allCosts.filter(e => new Date(e.event_date) >= thirtyDaysAgo).reduce((sum, e) => sum + (e.cost || 0), 0);
          const spentPrev30Days = allCosts.filter(e => { const d = new Date(e.event_date); return d >= sixtyDaysAgo && d < thirtyDaysAgo; }).reduce((sum, e) => sum + (e.cost || 0), 0);

          if (spentPrev30Days > 0) spendingTrend = Math.round(((spentLast30Days - spentPrev30Days) / spentPrev30Days) * 100);
          else if (spentLast30Days > 0) spendingTrend = 100;
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
    <div className="h-screen w-full overflow-y-auto overscroll-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-32 transition-colors duration-300 selection:bg-amber-500/30">
      
      {FEATURES.aiMechanic && canUseAi ? <AiMechanic isPro={true} /> : null}
      <ChangelogModal />
      <ReminderChecker />
      
      {/* NAVBAR */}
      <nav className="bg-slate-900 sticky top-0 z-50 shadow-lg border-b border-white/5 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center gap-6"> 
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-8 h-8 group-hover:scale-110 transition-transform">
                  <Image src="/drivesync-logo.png" alt="DriveSync" fill className="object-contain" priority />
                </div>
                <span className="text-xl font-bold tracking-tight text-white uppercase hidden sm:block">
                  Drive<span className="text-amber-500">Sync</span>
                </span>
              </Link>
              <Link href="/pricing" className="hidden md:block text-sm font-medium text-slate-300 hover:text-white transition-colors">Csomagok</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/pricing" className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  subscription?.plan_type === 'founder' || subscription?.plan_type === 'lifetime' 
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-500 hover:bg-amber-500/20' 
                  : subscription?.plan_type === 'pro' 
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 hover:bg-blue-500/20' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}>
                  {(subscription?.plan_type === 'founder' || subscription?.plan_type === 'lifetime') && <span className="text-sm">🚀</span>}
                  {
                    subscription?.plan_type === 'founder' ? 'Founder' : 
                    subscription?.plan_type === 'lifetime' ? 'Lifetime' :
                    subscription?.plan_type === 'pro' ? 'Pro' : 'Starter'
                  }
              </Link>
              <Link href="/settings" className="rounded-full bg-white/10 text-white p-2 hover:bg-white/20 transition-colors" title="Beállítások">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </Link>
              <form action={signOut}>
                <button className="bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-slate-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border border-white/5">Kilépés</button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* HEADER & METRICS */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h2 className="text-slate-500 dark:text-slate-400 font-medium text-sm uppercase tracking-wider mb-1">{greeting},</h2>
              <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                      {user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0]}
                  </h1>
                  
                  <Link 
                    href="/pricing"
                    className={`sm:hidden px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border align-middle flex items-center gap-1 transition-transform active:scale-95 ${
                      subscription?.plan_type === 'founder' || subscription?.plan_type === 'lifetime' 
                      ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/20' 
                      : subscription?.plan_type === 'pro'
                      ? 'bg-blue-500 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                      : 'bg-slate-700 text-slate-300 border-slate-600'
                    }`}>
                      {
                        subscription?.plan_type === 'founder' ? 'Founder 🚀' : 
                        subscription?.plan_type === 'lifetime' ? 'Lifetime 🚀' :
                        subscription?.plan_type === 'pro' ? 'Pro ⚡' : 'Free'
                      }
                  </Link>
              </div>
            </div>

            {cars.length > 0 && (
    <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-6 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
        
        {/* --- BAL OLDAL: FLOTTA EGÉSZSÉG --- */}
        <div className="flex-1 flex items-center justify-between sm:justify-end gap-4 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-700 pb-4 sm:pb-0 sm:pr-6">
            
            {/* FELTÉTEL: Cseréld a '!hasServices'-t a saját változódra (pl. services.length === 0) */}
            {!hasServices ? (
                // --- HA NINCS ADAT: TÁJÉKOZTATÁS ---
                <div className="w-full flex flex-col items-start sm:items-end justify-center h-12">
                     <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Flotta Egészség</p>
                     <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span className="text-xs font-medium text-right leading-tight">
                            Rögzítsen szervizt<br className="hidden sm:block"/> a számításhoz
                        </span>
                        <svg className="w-5 h-5 opacity-60 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                     </div>
                </div>
            ) : (
                // --- HA VAN ADAT: EREDETI DIAGRAM ---
                <>
                    <div className="text-left sm:text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Flotta Egészség</p>
                        <p className={`text-3xl font-black ${fleetHealth === 100 ? 'text-emerald-500' : fleetHealth > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                            {fleetHealth}%
                        </p>
                    </div>
                    <div className="relative w-12 h-12 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-100 dark:text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                            <path className={`${fleetHealth === 100 ? 'text-emerald-500' : fleetHealth > 50 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000 ease-out`} strokeDasharray={`${fleetHealth}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </div>
                </>
            )}
        </div>

        {/* --- JOBB OLDAL: KÖLTSÉGEK (VÁLTOZATLAN) --- */}
        <div className="flex-1 flex items-center justify-between sm:justify-start gap-4 sm:pl-2">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Elmúlt 30 nap</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                        {spentLast30Days.toLocaleString()} <span className="text-sm font-bold text-slate-400">Ft</span>
                    </p>
                    {spendingTrend !== 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center ${spendingTrend > 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                            {spendingTrend > 0 ? '↑' : '↓'} {Math.abs(spendingTrend)}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    </div>
)}
        </div>

        {/* FŐ TARTALOM GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-10">
              
              {/* 1. GYORS KM NAPLÓZÁS */}
              {FEATURES.mileageLog && myCars.length > 0 && (
                  <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 text-white border border-slate-700 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-white/10 transition-colors duration-500"></div>
                      <div className="relative z-10 flex items-center gap-4 w-full md:w-auto">
                          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          </div>
                          <div>
                              <p className="font-bold text-base text-white">Gyors Km Rögzítés</p>
                              <p className="text-xs text-slate-400">Válaszd ki az autót és írd be az új állást.</p>
                          </div>
                      </div>
                      <form action={logCurrentMileage} className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch">
                          <select 
                              name="car_id" 
                              className="px-4 py-3 border border-white/10 rounded-xl bg-slate-800/50 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer text-sm font-medium appearance-none hover:bg-slate-800 transition-colors min-w-[200px]"
                              defaultValue={latestCarId || ""}
                          >
                              {myCars.map((car) => (
                                  <option key={car.id} value={car.id} className="text-slate-900 bg-white">
                                      {car.make} {car.model} ({car.plate})
                                  </option>
                              ))}
                          </select>
                          <div className="relative">
                              <input 
                                  type="number" 
                                  name="current_mileage" 
                                  placeholder="Új km..."
                                  className="pl-4 pr-12 py-3 border border-white/10 rounded-xl w-full sm:w-32 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-800/50 text-white placeholder-slate-500 text-sm font-mono"
                                  required
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">KM</span>
                          </div>
                          <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 text-sm">Mentés</button>
                      </form>
                  </div>
              )}

              {/* 2. SAJÁT AUTÓK */}
              {(myCars.length > 0 || FEATURES.addCar || sharedCars.length > 0) && (
                  <div className="space-y-4">
                      <div className="flex justify-between items-end px-1">
                          <h3 className="font-bold text-slate-900 dark:text-white text-xl flex items-center gap-2">
                              <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                              Saját Garázs
                          </h3>
                          <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                              {myCars.length} / {PLAN_LIMITS[plan].maxCars === Infinity ? '∞' : PLAN_LIMITS[plan].maxCars} autó
                          </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {myCars.map((car) => (
                              <CarCard key={car.id} car={car} />
                          ))}
                          
                          {FEATURES.addCar && (
                             <Link 
                               href={canAddCar ? "/cars/new" : "/pricing"} 
                               className={`group relative flex flex-col items-center justify-center min-h-[320px] rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
                                 canAddCar 
                                   ? 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xl'
                                   : 'border-slate-300 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-900/10 hover:bg-slate-200 dark:hover:bg-slate-800/30'
                               }`}
                             >
                                  {canAddCar ? (
                                    <>
                                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                      <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                          <Plus className="w-8 h-8 text-slate-400 group-hover:text-amber-500 transition-colors" />
                                      </div>
                                      <span className="font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white text-lg">Új jármű hozzáadása</span>
                                      <span className="text-xs text-slate-400 mt-1">Bővítsd a garázsodat</span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-amber-500/50 group-hover:text-amber-500 transition-colors shadow-sm">
                                          <Lock className="w-8 h-8" />
                                      </div>
                                      <span className="font-bold text-slate-400 text-lg mb-1">Garázs megtelt</span>
                                      <span className="text-xs font-bold text-amber-500 uppercase tracking-wide bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full group-hover:bg-amber-500 group-hover:text-white transition-colors">Válts Pro csomagra</span>
                                    </>
                                  )}
                             </Link>
                          )}
                      </div>
                  </div>
              )}

              {/* 3. MEGOSZTOTT AUTÓK */}
              {FEATURES.sharedCars && sharedCars.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <h3 className="font-bold text-slate-900 dark:text-white text-xl flex items-center gap-2 px-1">
                          <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          Megosztva Velem
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {sharedCars.map((car) => (
                              <CarCard key={car.id} car={car} shared={true} />
                          ))}
                      </div>
                  </div>
              )}

              {cars.length === 0 && !FEATURES.addCar && (
                  <div className="bg-white dark:bg-slate-800 p-16 rounded-3xl border border-slate-200 dark:border-slate-700 text-center shadow-lg">
                        <p className="text-slate-500">Nincs megjeleníthető autó.</p>
                  </div>
              )}

            </div>

            <div className="lg:col-span-4 space-y-8">
              
              {/* --- ÚJ: KÖZÖSSÉG WIDGET (CSAK PRO/LIFETIME) --- */}
              <div className="relative overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800 p-6 shadow-xl opacity-90">
    {/* Háttér effektek - kicsit halványítva */}
    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-slate-500/10 rounded-full blur-2xl"></div>
    <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-20 h-20 bg-slate-500/10 rounded-full blur-2xl"></div>
    
    <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
            {/* Ikon doboz - szürkébb, inaktívabb hatás */}
            <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-400">
                <Hammer className="w-6 h-6" />
            </div>

            {/* Státusz címke */}
            <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-1 rounded border border-amber-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> HAMAROSAN
            </span>
        </div>

        <h3 className="text-xl font-bold text-slate-200 mb-1">DriveSync Klub</h3>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            A közösségi funkciók és a piactér jelenleg fejlesztés alatt állnak. Értesítünk, amint elérhető lesz!
        </p>

        {/* Gomb - Letiltva, nem kattintható */}
        <button 
            disabled
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm 
            bg-slate-800/50 text-slate-500 border border-slate-700/50 cursor-not-allowed select-none"
        >
            Fejlesztés alatt <Lock className="w-3 h-3 opacity-50" />
        </button>
    </div>
</div>

              {FEATURES.gamification && <GamificationWidget badges={badges} />}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  {FEATURES.weather && <WeatherWidget />}
                  {FEATURES.fuelPrices && <FuelWidget />}
              </div>
              {FEATURES.reminders && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            Emlékeztetők
                        </h3>
                        {upcomingReminders.length > 0 && <Link href="/reminders" className="text-xs font-bold text-slate-400 hover:text-amber-500 transition-colors">Összes</Link>}
                    </div>
                    <div className="p-4 space-y-3">
                        {upcomingReminders.length > 0 ? (
                            upcomingReminders.map((rem: any) => (
                                <div key={rem.id} className="flex items-center gap-3 p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700 transition-colors cursor-pointer group">
                                    <div className="flex-col flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-500 font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
                                        <span>{new Date(rem.due_date).getDate()}</span>
                                        <span className="text-[8px] uppercase">{new Date(rem.due_date).toLocaleString('hu-HU', { month: 'short' }).replace('.', '')}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{rem.service_type}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{rem.cars?.make} {rem.cars?.model}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-sm text-slate-400 italic">Nincs közelgő teendő.</p>
                            </div>
                        )}
                    </div>
                </div>
              )}
              {FEATURES.activityLog && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <History className="w-5 h-5 text-slate-400" />
                        Legutóbbiak
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {recentActivity.length > 0 ? (
                        recentActivity.map((act: any) => (
                            <div key={act.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center w-12 flex-shrink-0 gap-1">
                                <div className="text-center leading-none">
                                <span className="block text-sm font-black text-slate-400 dark:text-slate-500 uppercase">
                                    {new Date(act.event_date).toLocaleString('hu-HU', { month: 'short' }).replace('.', '')}
                                </span>
                                <span className="block text-xl font-black text-slate-800 dark:text-slate-200">
                                    {new Date(act.event_date).getDate()}
                                </span>
                                </div>
                                <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm dark:border-slate-700
                                ${act.type === 'fuel' 
                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500' 
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }
                                `}>
                                {act.type === 'fuel' ? <Fuel className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{act.title}</p>
                                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                                <span className="truncate">{act.cars?.make} {act.cars?.model}</span>
                                {act.mileage > 0 && <span className="flex-shrink-0">• {act.mileage.toLocaleString()} km</span>}
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <span className={`block text-sm font-bold ${act.cost > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                {act.cost > 0 ? `${act.cost.toLocaleString()} Ft` : '-'}
                                </span>
                            </div>
                            </div>
                        ))
                        ) : (
                        <div className="text-center py-6">
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
    <div className={`relative group flex flex-col bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-200 dark:border-slate-700 h-full ${shared ? 'ring-2 ring-blue-500/30' : ''}`}>
      <Link href={`/cars/${car.id}`} className="relative h-56 bg-slate-900 overflow-hidden">
         {car.image_url ? (
            <Image src={car.image_url} alt={`${car.make} ${car.model}`} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
         ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <span className="text-4xl font-black text-slate-700 uppercase tracking-widest">{car.make}</span>
            </div>
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
         <div className={`absolute top-4 right-4 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md shadow-lg border border-white/10 ${car.status === 'active' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>
             {car.status === 'active' ? 'Aktív' : 'Szerviz'}
         </div>
         {shared && (
             <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-md text-white p-2 rounded-full shadow-lg" title="Megosztott autó">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
             </div>
         )}
         <div className="absolute bottom-4 left-4 right-4">
             <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-1 drop-shadow-md">
                 {car.make} <span className="font-light text-slate-300">{car.model}</span>
             </h3>
             <div className="flex items-center gap-2">
                 <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white border border-white/20">
                     {car.plate}
                 </span>
             </div>
         </div>
      </Link>
      <Link href={`/cars/${car.id}`} className="p-5 flex-1 flex flex-col justify-between gap-4">
         <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 group-hover:border-amber-500/20 transition-colors">
                 <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Futásteljesítmény</p>
                 <p className="font-bold text-slate-900 dark:text-white text-sm font-mono">{car.mileage.toLocaleString()} km</p>
             </div>
             <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 group-hover:border-amber-500/20 transition-colors">
                 <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Évjárat</p>
                 <p className="font-bold text-slate-900 dark:text-white text-sm">{car.year}</p>
             </div>
         </div>
      </Link>
      <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
         {!shared && (
             <Link href={`/cars/${car.id}/edit`} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-amber-500 shadow-lg hover:scale-110 transition-all border border-slate-200 dark:border-slate-600" title="Szerkesztés">
                 <Pencil className="w-4 h-4" />
             </Link>
         )}
      </div>
    </div>
  )
}

// --- FŐ BELÉPÉSI PONT ---
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  
  // 1. Megnézzük, van-e bejelentkezett felhasználó
  const { data: { user } } = await supabase.auth.getUser()

  // 2. HA VAN USER -> Irány a Dashboard (Promóció itt NEM kell, mert már regisztrált)
  if (user) {
    return <DashboardComponent />
  }

  // 3. HA NINCS USER (Vendég) -> Lekérjük az aktív promóciót
  // maybeSingle() biztosítja, hogy ne dobjon hibát, ha nincs adat
  const { data: activePromo } = await supabase
    .from('promotions')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // 4. Frissítési Napló (Changelog) - ha nincs tábla, üres tömb lesz
  const { data: updates } = await supabase
    .from('release_notes')
    .select('*')
    .order('release_date', { ascending: false })
    .limit(5);

  // 5. Fejlesztői mód ellenőrzése
  const params = await searchParams
  const secret = params.dev
  if (secret === DEV_SECRET_KEY) {
    return <DashboardComponent />
  }

  // 6. Megjelenítjük a Landing Page-et a promócióval
  return <LandingPage promo={activePromo} updates={updates || []} />
}