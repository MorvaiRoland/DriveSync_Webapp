import { createClient } from '@/supabase/server'
import { signOut } from './login/action'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import dynamicImport from 'next/dynamic'
import { getSubscriptionStatus, PLAN_LIMITS } from '@/utils/subscription'
import { MOBILE_CARD_SIZES } from '@/utils/imageOptimization'
import {
  Plus, Settings, LogOut, CarFront, Users, Lock,
  Crown, DollarSign, ArrowRight, Bell, Activity,
  Gauge, BarChart3, Map, Search, Cpu, Zap
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

// ──────────────────────────────────────────
// LOADING SKELETON
// ──────────────────────────────────────────
const Skeleton = ({ h = 'h-32', w = 'w-full' }: { h?: string; w?: string }) => (
  <div className={`${h} ${w} rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse`} />
)

// ──────────────────────────────────────────
// GLASS CARD WRAPPER
// ──────────────────────────────────────────
function Glass({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`
      bg-white/60 dark:bg-white/[0.04]
      border border-white/70 dark:border-white/[0.08]
      backdrop-blur-xl
      shadow-sm
      ${className}
    `}>
      {children}
    </div>
  )
}

// ──────────────────────────────────────────
// PREMIUM CAR CARD
// ──────────────────────────────────────────
function CarCard({ car, shared, priority = false }: { car: any; shared?: boolean; priority?: boolean }) {
  return (
    <Link
      href={`/cars/${car.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-500
        hover:-translate-y-1.5
        bg-white/50 dark:bg-white/[0.04]
        border ${shared ? 'border-blue-300/60 dark:border-blue-500/20' : 'border-white/60 dark:border-white/[0.08]'}
        backdrop-blur-xl
        shadow-[0_2px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)]
        hover:shadow-[0_8px_40px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)]
        ${shared ? 'ring-1 ring-blue-400/20' : ''}
      `}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-900">
        {car.image_url ? (
          <Image
            src={car.image_url}
            alt={`${car.make} ${car.model}`}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            sizes={MOBILE_CARD_SIZES}
            quality={85}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
            <CarFront className="w-16 h-16 text-slate-300 dark:text-slate-700" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          {shared && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest">
              <Users className="w-3 h-3" /> Megosztva
            </span>
          )}
          <span className={`ml-auto px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full backdrop-blur-md ${
            car.status === 'active' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'
          }`}>
            {car.status === 'active' ? 'Aktív' : 'Szerviz'}
          </span>
        </div>

        {/* Car name */}
        <div className="absolute bottom-3 left-4 right-4">
          <span className="text-white/50 text-[10px] font-mono tracking-[0.2em] uppercase block mb-1">{car.plate}</span>
          <h3 className="text-xl font-light text-white tracking-tight">
            <span className="font-bold">{car.make}</span>{' '}
            <span className="text-white/70">{car.model}</span>
          </h3>
        </div>
      </div>

      {/* Info strip */}
      <div className="flex items-stretch bg-white/40 dark:bg-white/[0.03] border-t border-white/50 dark:border-white/[0.06]">
        <div className="flex-1 px-4 py-3">
          <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest mb-0.5">Kilométer</p>
          <p className="font-bold text-slate-900 dark:text-white text-sm font-mono">{car.mileage.toLocaleString()} <span className="text-[10px] text-slate-400 font-sans">km</span></p>
        </div>
        <div className="w-px bg-slate-100/60 dark:bg-white/5" />
        <div className="flex-1 px-4 py-3">
          <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest mb-0.5">Évjárat</p>
          <p className="font-bold text-slate-900 dark:text-white text-sm">{car.year}</p>
        </div>
        <div className="flex items-center px-3 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  )
}

// ──────────────────────────────────────────
// ADD CAR CARD
// ──────────────────────────────────────────
function AddCarCard({ isLocked }: { isLocked: boolean }) {
  return (
    <Link
      href={isLocked ? '/pricing' : '/cars/new'}
      id="tour-add-car"
      className={`group flex flex-col items-center justify-center rounded-3xl transition-all duration-500 min-h-[180px]
        border-2 border-dashed
        ${isLocked
          ? 'border-slate-200 dark:border-white/10 bg-white/20 dark:bg-white/[0.01] opacity-60'
          : 'border-slate-200 dark:border-white/10 bg-white/20 dark:bg-white/[0.02] hover:bg-white/40 dark:hover:bg-white/[0.06] hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:-translate-y-1'
        }
      `}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-500 border ${
        isLocked
          ? 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10'
          : 'bg-white/80 dark:bg-white/10 border-white/60 dark:border-white/10 group-hover:scale-110 shadow-sm'
      }`}>
        {isLocked
          ? <Lock className="w-5 h-5 text-slate-400 dark:text-slate-600" />
          : <Plus className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
        }
      </div>
      {isLocked ? (
        <>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Limit elérve</span>
          <span className="mt-2 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
            Válts Pro-ra
          </span>
        </>
      ) : (
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
          Új jármű hozzáadása
        </span>
      )}
    </Link>
  )
}

// ──────────────────────────────────────────
// HEADER (greeting + stats bar)
// ──────────────────────────────────────────
function HeroHeader({ displayName, greeting, myCars, spentLast30Days, fleetHealth, hasServices }: any) {
  return (
    <div id="tour-welcome" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
      <div>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {greeting},
        </p>
        <h1 className="text-2xl sm:text-3xl font-light text-slate-900 dark:text-white tracking-tight">
          Üdvözlünk, <span className="font-bold">{displayName}</span>
        </h1>
      </div>

      {myCars.length > 0 && (
        <div id="tour-stats" className="flex gap-3">
          {/* Fleet health */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl
            bg-white/60 dark:bg-white/5
            border border-white/60 dark:border-white/10
            backdrop-blur-xl">
            <svg className="w-8 h-8 -rotate-90 flex-shrink-0" viewBox="0 0 36 36">
              <path className="text-slate-200 dark:text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
              <path
                className={fleetHealth > 70 ? 'text-emerald-500' : fleetHealth > 40 ? 'text-amber-500' : 'text-red-500'}
                strokeDasharray={`${fleetHealth}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
              />
            </svg>
            <div>
              <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest">Egészség</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{hasServices ? `${fleetHealth}%` : 'N/A'}</p>
            </div>
          </div>

          {/* Cost */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl
            bg-white/60 dark:bg-white/5
            border border-white/60 dark:border-white/10
            backdrop-blur-xl">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest">30 nap</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{spentLast30Days.toLocaleString()} Ft</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────
// COMBINED SIDEBAR WIDGET (Reminders + Activity)
// ──────────────────────────────────────────
function ActivityCard({ reminders, activity }: { reminders: any[]; activity: any[] }) {
  return (
    <Glass className="rounded-2xl overflow-hidden">
      {reminders.length > 0 && (
        <>
          <div className="px-5 py-3.5 border-b border-slate-100/60 dark:border-white/[0.06] flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-amber-500" /> Emlékeztetők
            </h3>
            <Link href="/reminders" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors uppercase tracking-widest">
              Összes
            </Link>
          </div>
          <div className="p-3 space-y-2">
            {reminders.map((rem: any) => (
              <div key={rem.id} className="flex items-center gap-3 p-2.5 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-100/60 dark:border-amber-900/30">
                <div className="w-9 h-9 bg-white dark:bg-amber-950/40 rounded-lg flex items-center justify-center text-sm font-black text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 flex-shrink-0">
                  {new Date(rem.due_date).getDate()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{rem.service_type}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{rem.cars?.make} {rem.cars?.model}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activity.length > 0 && (
        <>
          <div className={`px-5 py-3.5 ${reminders.length > 0 ? 'border-t' : ''} border-b border-slate-100/60 dark:border-white/[0.06] flex items-center gap-2`}>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-500" /> Legutóbbi
            </h3>
          </div>
          <div className="divide-y divide-slate-100/60 dark:divide-white/[0.04]">
            {activity.slice(0, 4).map((act: any) => (
              <div key={act.id} className="px-4 py-2.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{act.title}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(act.event_date).toLocaleDateString('hu-HU')}</p>
                </div>
                {act.cost > 0 && (
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex-shrink-0">
                    {act.cost.toLocaleString()} Ft
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {reminders.length === 0 && activity.length === 0 && (
        <div className="p-6 text-center text-sm text-slate-400 dark:text-slate-500 italic">Nincs adat.</div>
      )}
    </Glass>
  )
}

// ──────────────────────────────────────────
// DEALER DASHBOARD
// ──────────────────────────────────────────
function DealerDashboard({ user, cars }: { user: any; cars: any[] }) {
  const displayName = user.user_metadata?.full_name || 'Kereskedés'
  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-700 relative">
      <AuroraBackground />
      <DashboardNav userName={displayName} plan="dealer" isTrial={false} isPro={true} isDealer signOutAction={signOut} />

      <main className="relative z-10 max-w-5xl mx-auto px-4 pb-24"
        style={{ paddingTop: 'calc(max(0.75rem, env(safe-area-inset-top)) + 5rem)' }}>

        <div className="mb-8">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Kereskedői Portál
          </p>
          <h1 className="text-3xl font-light text-slate-900 dark:text-white">
            Üdvözlünk, <span className="font-bold">{displayName}</span>
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Készlet', value: String(cars.length), icon: <CarFront className="w-5 h-5 text-indigo-500" /> },
            { label: 'Készletérték', value: '---', icon: <DollarSign className="w-5 h-5 text-emerald-500" /> },
            { label: 'Megtekintés', value: '0', icon: <Users className="w-5 h-5 text-blue-500" /> },
          ].map((s) => (
            <Glass key={s.label} className="rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">{s.icon}</div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
            </Glass>
          ))}
        </div>

        <Link href="/cars/new" className="inline-flex items-center gap-2 mb-8 px-5 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Új autó felvétele
        </Link>

        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Készlet</h2>
          <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
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
  const [subscriptionResult, carsResult] = await Promise.all([
    getSubscriptionStatus(supabase, user.id),
    supabase
      .from('cars')
      .select('id, make, model, year, plate, mileage, image_url, status, fuel_type, user_id, service_interval_km, last_service_mileage, created_at, events(type, mileage), car_shares(email)')
      .order('created_at', { ascending: false })
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
  const relevantCarIds = carsData.map((c: any) => c.id)

  let upcomingReminders: any[] = []
  let recentActivity: any[] = []
  let spentLast30Days = 0

  if (relevantCarIds.length > 0) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const [remRes, actRes, costRes] = await Promise.all([
      supabase.from('service_reminders').select('*, cars(make,model)').in('car_id', relevantCarIds).order('due_date', { ascending: true }).limit(3),
      supabase.from('events').select('id, title, event_date, cost, car_id, cars(make,model)').in('car_id', relevantCarIds).order('event_date', { ascending: false }).limit(5),
      supabase.from('events').select('cost, event_date').in('car_id', relevantCarIds).gte('event_date', thirtyDaysAgo)
    ])
    upcomingReminders = remRes.data || []
    recentActivity = actRes.data || []
    spentLast30Days = (costRes.data || []).reduce((s: number, e: any) => s + (e.cost || 0), 0)
  }

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
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-700 relative">
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

        {/* ── TOP ROW: Weather + Fuel (full width on mobile, side-by-side on md) ── */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <WeatherWidget />
          <FuelWidget />
        </div>

        {/* ── QUICK MILEAGE (only when cars exist) ── */}
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
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <CarFront className="w-4 h-4 text-indigo-500" /> Saját Garázs
                </h2>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  isCarLimitReached
                    ? 'bg-red-50 dark:bg-red-950/30 text-red-500 border-red-200 dark:border-red-900/50'
                    : 'bg-white/60 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-white/60 dark:border-white/10'
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
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" /> Megosztva Velem
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sharedCars.map((car: any) => <CarCard key={car.id} car={car} shared />)}
                </div>
              </section>
            )}

            {/* PRO UPSELL – only on free */}
            {plan === 'free' && (
              <Glass className="rounded-2xl p-5 flex items-start gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center flex-shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                  <Cpu className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" /> Próbáld ki a Pro funkciót
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">AI Szerelő, korlátlan garázs és VIN kereső egy csomagban.</p>
                  <Link href="/pricing" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white bg-slate-900 dark:bg-white dark:text-slate-900 px-4 py-2 rounded-xl hover:scale-105 transition-all">
                    Csomagok megtekintése <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Glass>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="flex flex-col gap-4">

            {/* Reminders + Activity (combined) */}
            <ActivityCard reminders={upcomingReminders} activity={recentActivity} />

            {/* Gamification */}
            <GamificationWidget badges={badges} />

            {/* Marketplace */}
            <Suspense fallback={<Skeleton />}>
              <MarketplaceSection />
            </Suspense>

            {/* Showroom Battle CTA */}
            <Link href="/showroom" className="group relative overflow-hidden rounded-2xl block">
              <Glass className="rounded-2xl p-5 text-center relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="text-3xl mb-3 group-hover:rotate-12 transition-transform duration-500 inline-block">🔥</div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-3">Showroom Battle</h3>
                  <div className="w-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 group-hover:bg-red-500 group-hover:text-white dark:group-hover:bg-red-500 dark:group-hover:text-white group-hover:border-red-500 transition-all">
                    Belépés <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Glass>
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
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    const role = userData?.role || 'user'

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