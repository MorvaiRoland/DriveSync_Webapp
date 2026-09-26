import { createClient } from '@/supabase/server'
import { signOut } from './login/action'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import dynamicImport from 'next/dynamic'
import { getSubscriptionStatus, PLAN_LIMITS } from '@/utils/subscription'
import { MOBILE_CARD_SIZES } from '@/utils/imageOptimization'
import {
  Plus, CarFront, Users, Lock,
  Crown, ArrowRight, Bell, Activity,
  Cpu, Zap, TrendingUp, Flame
} from 'lucide-react'
import QuickMileageForm from '@/components/QuickMileageForm'
import { Metadata } from 'next'
import OnboardingTour from '@/components/OnboardingTour'
import { Suspense } from 'react'
import MarketplaceSection from '@/components/MarketplaceSection'
import {
  ChangelogModal, AiMechanic, CongratulationModal,
  GamificationWidget, WeatherWidget, FuelWidget,
} from '@/components/DashboardLazyComponents'
import { AuroraBackground, DashboardNav, BottomNav } from '@/components/SharedNavigation'

export const runtime = 'edge'
export const preferredRegion = 'lhr1'

export const metadata: Metadata = {
  title: { absolute: 'DynamicSense | Garázs & Portál' }
}

const LandingPage = dynamicImport(() => import('@/components/LandingPage'), { ssr: true })

const DEV_SECRET_KEY = 'admin'

// ── SKELETON ──
const Skeleton = ({ h = 'h-32', w = 'w-full' }: { h?: string; w?: string }) => (
  <div className={`${h} ${w} rounded-2xl bg-white/5 animate-shimmer border border-white/[0.04]`} />
)

// ── GLASS CARD ──
function Glass({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`
      bg-white/60 dark:bg-white/[0.035]
      border border-white/50 dark:border-white/[0.06]
      backdrop-blur-xl shadow-sm
      ${className}
    `}>
      {children}
    </div>
  )
}

// ── CARBON NOIR CAR CARD ──
function CarCard({ car, shared, priority = false }: { car: any; shared?: boolean; priority?: boolean }) {
  return (
    <Link
      href={`/cars/${car.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-500
        hover:-translate-y-1.5 active:scale-[0.98]
        bg-white/50 dark:bg-[#111114]
        border ${shared ? 'border-orange-500/30' : 'border-white/40 dark:border-white/[0.06]'}
        shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.5)]
        hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,107,0,0.1)]
        ${shared ? 'ring-1 ring-orange-500/20' : ''}
      `}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-black/20">
        {car.image_url ? (
          <Image
            src={car.image_url}
            alt={`${car.make} ${car.model}`}
            fill
            className="object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out"
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            sizes={MOBILE_CARD_SIZES}
            quality={85}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-black dark:from-[#0f0f12] dark:to-black">
            <CarFront className="w-16 h-16 text-orange-500/20" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Shared badge */}
        {shared && (
          <div className="absolute top-3 left-3">
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/90 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest">
              <Users className="w-3 h-3" /> Megosztva
            </span>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full backdrop-blur-md ${
            car.status === 'active'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
          }`}>
            {car.status === 'active' ? '● Aktív' : '◌ Szerviz'}
          </span>
        </div>

        {/* Car name overlay */}
        <div className="absolute bottom-3 left-4 right-4">
          <span className="text-white/40 text-[10px] font-mono tracking-[0.2em] uppercase block mb-0.5">{car.plate}</span>
          <h3 className="text-lg font-light text-white tracking-tight">
            <span className="font-black">{car.make}</span>{' '}
            <span className="text-white/60">{car.model}</span>
          </h3>
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex items-stretch border-t border-white/[0.05] dark:border-white/[0.04] bg-black/5 dark:bg-black/20">
        <div className="flex-1 px-4 py-3">
          <p className="text-[9px] uppercase font-black text-slate-400/60 dark:text-white/25 tracking-widest mb-0.5">Km</p>
          <p className="font-black text-slate-900 dark:text-white text-sm font-mono">
            {car.mileage.toLocaleString('hu-HU')}
            <span className="text-[10px] text-slate-400 dark:text-white/30 font-sans ml-0.5">km</span>
          </p>
        </div>
        <div className="w-px bg-white/10" />
        <div className="flex-1 px-4 py-3">
          <p className="text-[9px] uppercase font-black text-slate-400/60 dark:text-white/25 tracking-widest mb-0.5">Évjárat</p>
          <p className="font-black text-slate-900 dark:text-white text-sm">{car.year}</p>
        </div>
        <div className="flex items-center px-3 text-slate-300/40 dark:text-white/15 group-hover:text-orange-400 dark:group-hover:text-orange-400 transition-colors">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  )
}

// ── CARBON NOIR ADD CAR CARD ──
function AddCarCard({ isLocked }: { isLocked: boolean }) {
  return (
    <Link
      href={isLocked ? '/pricing' : '/cars/new'}
      id="tour-add-car"
      className={`group flex flex-col items-center justify-center rounded-2xl transition-all duration-500 min-h-[180px]
        border-2 border-dashed
        ${isLocked
          ? 'border-white/10 bg-white/5 dark:bg-white/[0.02] opacity-50'
          : 'border-white/10 dark:border-white/[0.05] bg-white/20 dark:bg-white/[0.02] hover:bg-orange-500/5 hover:border-orange-500/30 hover:-translate-y-1'
        }
      `}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-500 border ${
        isLocked
          ? 'bg-white/5 border-white/10'
          : 'bg-black/10 dark:bg-white/[0.05] border-white/10 group-hover:border-orange-500/30 group-hover:bg-orange-500/10 group-hover:scale-110'
      }`}>
        {isLocked
          ? <Lock className="w-5 h-5 text-white/20" />
          : <Plus className="w-5 h-5 text-slate-400 dark:text-white/30 group-hover:text-orange-400 transition-colors" />
        }
      </div>
      {isLocked ? (
        <>
          <span className="text-xs font-black text-white/20 uppercase tracking-widest">Limit elérve</span>
          <span className="mt-2 text-[10px] font-black text-orange-400 uppercase tracking-widest px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
            Válts Pro-ra
          </span>
        </>
      ) : (
        <span className="text-xs font-black text-slate-400/60 dark:text-white/20 uppercase tracking-widest group-hover:text-orange-400 transition-colors">
          Új jármű
        </span>
      )}
    </Link>
  )
}

// ── CARBON NOIR HERO HEADER ──
function HeroHeader({ displayName, greeting, myCars, spentLast30Days, fleetHealth, hasServices }: any) {
  return (
    <div id="tour-welcome" className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      <div>
        <p className="text-[10px] font-black text-orange-400/80 uppercase tracking-[0.3em] mb-1.5 flex items-center gap-2">
          <span className="dot-orange inline-block" />
          {greeting}
        </p>
        <h1 className="text-2xl sm:text-3xl font-light text-slate-900 dark:text-white tracking-tight">
          Üdvözlünk, <span className="font-black text-gradient-fire">{displayName}</span>
        </h1>
      </div>

      {myCars.length > 0 && (
        <div id="tour-stats" className="flex gap-3">
          {/* Fleet health */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl
            bg-white/60 dark:bg-[#111114]
            border border-white/50 dark:border-white/[0.06]
            shadow-sm dark:shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
            <svg className="w-8 h-8 -rotate-90 flex-shrink-0" viewBox="0 0 36 36">
              <path className="text-slate-200 dark:text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
              <path
                className={fleetHealth > 70 ? 'text-emerald-500' : fleetHealth > 40 ? 'text-orange-400' : 'text-red-500'}
                strokeDasharray={`${fleetHealth}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
              />
            </svg>
            <div>
              <p className="text-[9px] uppercase font-black text-slate-400/50 dark:text-white/25 tracking-widest">Egészség</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{hasServices ? `${fleetHealth}%` : 'N/A'}</p>
            </div>
          </div>

          {/* Cost */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl
            bg-white/60 dark:bg-[#111114]
            border border-white/50 dark:border-white/[0.06]
            shadow-sm dark:shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-[9px] uppercase font-black text-slate-400/50 dark:text-white/25 tracking-widest">30 nap</p>
              <p className="text-sm font-black text-slate-900 dark:text-white font-mono">{spentLast30Days.toLocaleString('hu-HU')} <span className="text-[10px] text-slate-400 dark:text-white/30 font-sans">Ft</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── CARBON NOIR ACTIVITY CARD ──
function ActivityCard({ reminders, activity }: { reminders: any[]; activity: any[] }) {
  return (
    <div className="rounded-2xl overflow-hidden bg-white/60 dark:bg-[#111114] border border-white/40 dark:border-white/[0.06] shadow-sm dark:shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
      {reminders.length > 0 && (
        <>
          <div className="px-5 py-3.5 border-b border-white/30 dark:border-white/[0.05] flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-orange-400" /> Emlékeztetők
            </h3>
            <Link href="/reminders" className="text-[10px] font-black text-white/20 hover:text-orange-400 transition-colors uppercase tracking-widest">
              Összes
            </Link>
          </div>
          <div className="p-3 space-y-2">
            {reminders.map((rem: any) => (
              <div key={rem.id} className="flex items-center gap-3 p-2.5 bg-orange-500/5 rounded-xl border border-orange-500/15">
                <div className="w-9 h-9 bg-orange-500/10 rounded-lg flex items-center justify-center text-sm font-black text-orange-400 border border-orange-500/20 flex-shrink-0">
                  {new Date(rem.due_date).getDate()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{rem.service_type}</p>
                  <p className="text-[10px] text-slate-400 dark:text-white/30 truncate">{rem.cars?.make} {rem.cars?.model}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activity.length > 0 && (
        <>
          <div className={`px-5 py-3.5 ${reminders.length > 0 ? 'border-t' : ''} border-b border-white/30 dark:border-white/[0.05]`}>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-500" /> Legutóbbi
            </h3>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {activity.slice(0, 4).map((act: any) => (
              <div key={act.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-white/5 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{act.title}</p>
                  <p className="text-[10px] text-slate-400 dark:text-white/25">{new Date(act.event_date).toLocaleDateString('hu-HU')}</p>
                </div>
                {act.cost > 0 && (
                  <span className="text-xs font-mono font-black text-orange-400/80 flex-shrink-0">
                    {act.cost.toLocaleString('hu-HU')} Ft
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {reminders.length === 0 && activity.length === 0 && (
        <div className="p-6 text-center text-sm text-white/20 italic">Nincs adat.</div>
      )}
    </div>
  )
}

// ── CARBON NOIR DEALER DASHBOARD ──
function DealerDashboard({ user, cars }: { user: any; cars: any[] }) {
  const displayName = user.user_metadata?.full_name || 'Kereskedés'
  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#09090C] text-slate-900 dark:text-white font-sans transition-colors duration-700 relative">
      <AuroraBackground />
      <DashboardNav userName={displayName} plan="dealer" isTrial={false} isPro={true} isDealer signOutAction={signOut} />

      <main className="relative z-10 max-w-5xl mx-auto px-4 pb-24"
        style={{ paddingTop: 'calc(max(0.75rem, env(safe-area-inset-top)) + 5rem)' }}>

        <div className="mb-8">
          <p className="text-[10px] font-black text-orange-400/80 uppercase tracking-[0.3em] mb-1.5 flex items-center gap-2">
            <span className="dot-orange inline-block" /> Kereskedői Portál
          </p>
          <h1 className="text-3xl font-light text-slate-900 dark:text-white">
            Üdvözlünk, <span className="font-black text-gradient-fire">{displayName}</span>
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Készlet', value: String(cars.length), icon: <CarFront className="w-5 h-5 text-orange-400" /> },
            { label: 'Készletérték', value: '---', icon: <TrendingUp className="w-5 h-5 text-emerald-400" /> },
            { label: 'Megtekintés', value: '0', icon: <Users className="w-5 h-5 text-blue-400" /> },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 bg-white/60 dark:bg-[#111114] border border-white/40 dark:border-white/[0.06] shadow-sm">
              <div className="flex items-center gap-2 mb-2">{s.icon}</div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-[10px] font-black text-slate-400/50 dark:text-white/25 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <Link href="/cars/new" className="btn-primary inline-flex mb-8">
          <Plus className="w-4 h-4" /> Új autó felvétele
        </Link>

        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Készlet</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-orange-500/30 to-transparent" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cars.map((car: any, i: number) => <CarCard key={car.id} car={car} priority={i === 0} />)}
          {cars.length === 0 && <AddCarCard isLocked={false} />}
        </div>
      </main>
    </div>
  )
}

// ──────────────────────────────────────────
// USER DASHBOARD
// ──────────────────────────────────────────
async function UserDashboard({ user, supabase }: any) {
  // ⚡ OPTIMALIZÁCIÓ: Egyetlen hullámban fut az összes lekérdezés
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [subscriptionResult, carsResult, remRes, actRes, costRes] = await Promise.all([
    getSubscriptionStatus(supabase, user.id),
    supabase
      .from('cars')
      .select('id, make, model, year, plate, mileage, image_url, status, fuel_type, user_id, service_interval_km, last_service_mileage, created_at, events(type, mileage), car_shares(email)')
      .order('created_at', { ascending: false }),
    // Emlékeztetők – user_id alapján szűrve közvetlenül (RLS-en keresztül)
    supabase.from('service_reminders').select('*, cars!inner(make, model, user_id)').eq('cars.user_id', user.id).order('due_date', { ascending: true }).limit(3),
    // Legutóbbi események
    supabase.from('events').select('id, title, event_date, cost, car_id, cars!inner(make, model, user_id)').eq('cars.user_id', user.id).order('event_date', { ascending: false }).limit(5),
    // Költségek az elmúlt 30 napban
    supabase.from('events').select('cost, event_date, cars!inner(user_id)').eq('cars.user_id', user.id).gte('event_date', thirtyDaysAgo),
  ])

  const { plan, isTrial } = subscriptionResult
  const carsData = carsResult.data || []
  const limits = PLAN_LIMITS[plan]
  const isPro = limits.aiMechanic

  const myCars = carsData.filter((c: any) => c.user_id === user.id)
  const sharedCars = carsData.filter((c: any) =>
    c.user_id !== user.id && c.car_shares?.some((s: any) => s.email === user.email)
  )

  const isCarLimitReached = myCars.length >= limits.maxCars
  const latestCarId = myCars[0]?.id ?? carsData[0]?.id ?? null

  const upcomingReminders = remRes.data || []
  const recentActivity = actRes.data || []
  const spentLast30Days = (costRes.data || []).reduce((s: number, e: any) => s + (e.cost || 0), 0)

  // Fleet health
  const hasServices = myCars.some((c: any) => c.events?.some((e: any) => e.type === 'service'))
  let fleetHealth = 100
  if (myCars.length > 0) {
    const total = myCars.reduce((sum: number, car: any) => {
      if (car.fuel_type === 'Elektromos') return sum + 100
      const interval = car.service_interval_km || 15000
      let lastKm = car.last_service_mileage || 0
      const serviceEvts = car.events?.filter((e: any) => e.type === 'service') || []
      if (serviceEvts.length) lastKm = Math.max(lastKm, ...serviceEvts.map((e: any) => e.mileage))
      return sum + Math.max(0, Math.min(100, ((interval - Math.max(0, (car.mileage || 0) - lastKm)) / interval) * 100))
    }, 0)
    fleetHealth = Math.round(total / myCars.length)
  }

  // Badges
  const totalMileage = myCars.reduce((s: number, c: any) => s + (c.mileage || 0), 0)
  const badges = [
    { id: 'first_car', name: 'Garázs Tulaj', icon: '🔑', description: 'Hozzáadtad az első autódat.', achieved: myCars.length >= 1, progress: myCars.length >= 1 ? '1/1' : '0/1' },
    { id: 'fleet_boss', name: 'Flotta Főnök', icon: '😎', description: '3+ autó a garázsban.', achieved: myCars.length >= 3, progress: `${Math.min(myCars.length, 3)}/3` },
    { id: 'world_traveler', name: 'Világutazó', icon: '🌍', description: '500,000 km összesítve.', achieved: totalMileage >= 500000, progress: `${Math.floor(Math.min(totalMileage, 500000) / 1000)}k/500k` },
    { id: 'eco_warrior', name: 'Zöld Hullám', icon: '⚡', description: 'Elektromos/hibrid autó.', achieved: myCars.some((c: any) => ['Elektromos', 'Plug-in Hibrid', 'Hibrid'].includes(c.fuel_type)), progress: myCars.some((c: any) => ['Elektromos', 'Plug-in Hibrid', 'Hibrid'].includes(c.fuel_type)) ? '1/1' : '0/1' },
    { id: 'caring', name: 'Gondos Gazda', icon: '🛠️', description: 'Rögzítettél szerviz eseményt.', achieved: hasServices, progress: hasServices ? '1/1' : '0/1' },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 10 ? 'Jó reggelt' : hour < 18 ? 'Szép napot' : 'Szép estét'
  const displayName = user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0]
  const showTour = !carsData.length && (Date.now() - new Date(user.created_at || Date.now()).getTime()) / 36e5 < 24

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#09090C] text-slate-900 dark:text-white font-sans transition-colors duration-700 relative">
      <AuroraBackground />

      {/* Modals */}
      {showTour && <OnboardingTour />}
      <CongratulationModal currentPlan={plan} />
      {isPro && <AiMechanic isPro />}
      {carsData.length > 0 && <ChangelogModal />}

      {/* Nav */}
      <DashboardNav userName={displayName} plan={plan} isTrial={isTrial} isPro={isPro} signOutAction={signOut} />
      <BottomNav isPro={isPro} />

      {/* Main */}
      <main
        className="relative z-10 max-w-5xl mx-auto px-3 sm:px-4 pb-28 md:pb-10"
        style={{ paddingTop: 'calc(max(0.75rem, env(safe-area-inset-top)) + 5rem)' }}
      >

        {/* ── GREETING ── */}
        <HeroHeader
          displayName={displayName}
          greeting={greeting}
          myCars={myCars}
          spentLast30Days={spentLast30Days}
          fleetHealth={fleetHealth}
          hasServices={hasServices}
        />

        {/* ── TOP ROW: Weather + Fuel ── */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <WeatherWidget />
          <FuelWidget />
        </div>

        {/* ── QUICK MILEAGE ── */}
        {myCars.length > 0 && (
          <div className="mb-6">
            <QuickMileageForm cars={myCars} latestCarId={latestCarId} />
          </div>
        )}

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Cars (span 2) */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* MY GARAGE */}
            <section>
              <div className="flex items-center justify-between mb-4 px-0.5">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <CarFront className="w-4 h-4 text-orange-400" /> Saját Garázs
                </h2>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                  isCarLimitReached
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : 'bg-white/60 dark:bg-white/[0.04] text-slate-400 dark:text-white/30 border-white/40 dark:border-white/[0.06]'
                }`}>
                  {myCars.length} / {limits.maxCars === 999 ? '∞' : limits.maxCars}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myCars.map((car: any, i: number) => (
                  <CarCard key={car.id} car={car} priority={i === 0} />
                ))}
                <AddCarCard isLocked={isCarLimitReached} />
              </div>
            </section>

            {/* SHARED CARS */}
            {sharedCars.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 px-0.5">
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-400" /> Megosztva Velem
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sharedCars.map((car: any) => <CarCard key={car.id} car={car} shared />)}
                </div>
              </section>
            )}

            {/* PRO UPSELL */}
            {plan === 'free' && (
              <div className="rounded-2xl p-5 flex items-start gap-4 relative overflow-hidden
                bg-gradient-to-br from-orange-500/5 to-amber-500/5
                border border-orange-500/20
                shadow-[0_2px_12px_rgba(255,107,0,0.06)]">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none bg-orange-500/10" />
                <div className="w-10 h-10 bg-orange-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-orange-500/20">
                  <Cpu className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-400" /> Próbáld ki a Pro funkciót
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-white/40 mb-3">AI Szerelő, korlátlan garázs és VIN kereső egy csomagban.</p>
                  <Link href="/pricing" className="btn-primary text-xs inline-flex">
                    Csomagok <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="flex flex-col gap-4">

            {/* Reminders + Activity */}
            <ActivityCard reminders={upcomingReminders} activity={recentActivity} />

            {/* Gamification */}
            <GamificationWidget badges={badges} />

            {/* Marketplace */}
            <Suspense fallback={<Skeleton />}>
              <MarketplaceSection />
            </Suspense>

            {/* Showroom Battle CTA */}
            <Link href="/showroom" className="group relative overflow-hidden rounded-2xl block">
              <div className="rounded-2xl p-5 text-center relative
                bg-gradient-to-br from-red-500/8 to-orange-500/5
                border border-orange-500/15
                hover:border-orange-500/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="text-3xl mb-3 group-hover:rotate-12 transition-transform duration-500 inline-block">🔥</div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">Showroom Battle</h3>
                  <div className="w-full border border-orange-500/20 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-orange-400 flex items-center justify-center gap-2 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all">
                    Belépés <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

// ──────────────────────────────────────────
// MAIN PAGE
// ──────────────────────────────────────────
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // ⚡ OPTIMALIZÁCIÓ: role kiolvasása user_metadata-ból – nincs DB round-trip!
    const role = (user.user_metadata?.role as string) || 'user'

    if (role === 'dealer') {
      const { data: dealerCars } = await supabase.from('cars').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      return <DealerDashboard user={user} cars={dealerCars || []} />
    }
    return <UserDashboard user={user} supabase={supabase} />
  }

  const params = await searchParams
  if (params.check !== undefined) return redirect('/check')

  const [promoRes, updatesRes] = await Promise.all([
    supabase.from('promotions').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('release_notes').select('*').order('release_date', { ascending: false }).limit(5)
  ])

  if (params.dev === DEV_SECRET_KEY) {
    return <UserDashboard user={{ id: 'dev-user', email: 'dev@test.com', created_at: new Date().toISOString() }} supabase={supabase} />
  }

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100">
      <LandingPage promo={promoRes.data} updates={updatesRes.data || []} />
    </div>
  )
}