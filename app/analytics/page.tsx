import { createClient } from '@/supabase/server'
import { signOut } from '@/app/login/action'
import { redirect } from 'next/navigation'
import CostAnalyticsDashboard from '@/components/CostAnalyticsDashboard'
import { getSubscriptionStatus, PLAN_LIMITS } from '@/utils/subscription'
import { AuroraBackground, DashboardNav, BottomNav } from '@/components/SharedNavigation'
import { Wallet, TrendingUp, Car, AlertCircle, ArrowUpRight, CalendarRange, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Pénzügyi Intelligencia | DynamicSense',
  description: 'Flotta szintű költségelemzés, trendek és előrejelzések.'
}

// Format currency helper
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(amount)

// Glass container helper
function Glass({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`
      bg-white/60 dark:bg-white/[0.04]
      border border-white/70 dark:border-white/[0.08]
      backdrop-blur-xl shadow-sm
      ${className}
    `}>
      {children}
    </div>
  )
}

export default async function CostAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  // Get data
  const [carsRes, eventsRes, subscriptionResult] = await Promise.all([
    supabase.from('cars').select('*').eq('user_id', user.id).eq('status', 'active'),
    supabase.from('events').select('*').eq('user_id', user.id).order('event_date', { ascending: false }),
    getSubscriptionStatus(supabase, user.id)
  ])

  const cars = carsRes.data || []
  const events = eventsRes.data || []

  if (cars.length === 0) return redirect('/')

  const { plan, isTrial } = subscriptionResult
  const limits = PLAN_LIMITS[plan]
  const isPro = limits.aiMechanic

  // Server stats calculation
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  // 1. Annual spend (YTD)
  const thisYearEvents = events.filter(e => new Date(e.event_date).getFullYear() === currentYear)
  const ytdSpend = thisYearEvents.reduce((acc, e) => acc + Number(e.cost), 0)

  // 2. Last month spend
  const lastMonthEvents = events.filter(e => {
    const d = new Date(e.event_date)
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth - 1
  })
  const lastMonthSpend = lastMonthEvents.reduce((acc, e) => acc + Number(e.cost), 0)

  // 3. Most expensive car
  const spendByCar: Record<string, number> = {}
  thisYearEvents.forEach(e => {
    spendByCar[e.car_id] = (spendByCar[e.car_id] || 0) + Number(e.cost)
  })
  const mostExpensiveCarId = Object.keys(spendByCar).reduce((a, b) => spendByCar[a] > spendByCar[b] ? a : b, Object.keys(spendByCar)[0])
  const expensiveCar = cars.find(c => c.id.toString() === mostExpensiveCarId)

  const displayName = user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0]

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-700 relative overflow-x-hidden">
      <AuroraBackground />

      {/* Navigation */}
      <DashboardNav userName={displayName} plan={plan} isTrial={isTrial} isPro={isPro} signOutAction={signOut} />
      <BottomNav isPro={isPro} />

      {/* Main Container */}
      <main
        className="relative z-10 max-w-5xl mx-auto px-3 sm:px-4 pb-28 md:pb-10"
        style={{ paddingTop: 'calc(max(0.75rem, env(safe-area-inset-top)) + 5rem)' }}
      >

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> Pénzügyi Intelligencia
            </p>
            <h1 className="text-2xl sm:text-3xl font-light text-slate-900 dark:text-white tracking-tight">
              Költség <span className="font-bold">Analízis</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl uppercase tracking-wider">
            <CalendarRange className="w-4 h-4 text-indigo-500" />
            Pénzügyi év: {currentYear}
          </div>
        </div>

        {/* ── METRICS GRID ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

          {/* 1. YTD SPEND */}
          <Glass className="rounded-2xl p-5 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wallet className="w-20 h-20 rotate-12 text-slate-500" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-1.5">Idei összes költés</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
              {formatCurrency(ytdSpend)}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {lastMonthSpend > 0 ? (
                <>Előző hónap: <span className="font-semibold text-slate-600 dark:text-slate-300">{formatCurrency(lastMonthSpend)}</span></>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Költséghatékony időszak
                </span>
              )}
            </p>
          </Glass>

          {/* 2. MOST EXPENSIVE CAR */}
          <Glass className="rounded-2xl p-5 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <AlertCircle className="w-20 h-20 -rotate-12 text-amber-500" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1.5">Legtöbb kiadás</p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-0.5 truncate">
              {expensiveCar ? `${expensiveCar.make} ${expensiveCar.model}` : 'Nincs adat'}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono tracking-widest mb-3">{expensiveCar?.plate || '---'}</p>
            {expensiveCar && spendByCar[expensiveCar.id] > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 rounded-full text-[10px] font-bold uppercase tracking-widest">
                <ArrowUpRight className="w-3 h-3" />
                {((spendByCar[expensiveCar.id] / ytdSpend) * 100).toFixed(0)}% az éves büdzséből
              </span>
            )}
          </Glass>

          {/* 3. FLEET SUMMARY */}
          <Glass className="rounded-2xl p-5 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Car className="w-20 h-20 text-slate-500" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Aktív Flotta</p>
            <div className="flex items-baseline gap-1.5 mb-3">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{cars.length}</h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aktív jármű</span>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-white/[0.06] pt-3">
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Tranzakciók</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{events.length} db</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Átlagos futás</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">
                  ~{Math.round(events.reduce((acc, e) => Math.max(acc, e.mileage || 0), 0) / (cars.length || 1)).toLocaleString()} km
                </p>
              </div>
            </div>
          </Glass>
        </div>

        {/* ── CLIENT DASHBOARD ── */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-5 px-0.5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Részletes Jelentés</h2>
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
          </div>
          <CostAnalyticsDashboard events={events} cars={cars} />
        </div>

        {/* ── FOOTER ── */}
        <footer className="mt-16 border-t border-slate-200/60 dark:border-white/10 pt-8 flex flex-col items-center gap-6 text-center">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {[
              { label: 'Feltételek', href: '/terms' },
              { label: 'Adatvédelem', href: '/privacy' },
              { label: 'Támogatás', href: '/support' }
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-[9px] font-mono text-slate-400 dark:text-slate-600 uppercase tracking-wider">
            DynamicSense • Biztonságos Elemzés • 2026 © Minden jog fenntartva.
          </p>
        </footer>
      </main>
    </div>
  )
}