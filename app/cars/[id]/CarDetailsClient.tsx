'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Fuel, Wrench, Bell, Map, Package, Lock,
  Disc, Snowflake, Sun, Wallet, Banknote,
  Sparkles, Lightbulb, Plus, Trash2, Gauge, History,
  CarFront, Zap, TrendingUp, TrendingDown,
  Droplet, MapPin, Search, Eye, ChevronRight, FileText, Calendar,
  Activity, Info, Warehouse, Pencil, AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { deleteEvent, deleteReminder } from './actions'
import DocumentManager from './DocumentManager'
import ExportMenu from '@/components/ExportMenu'
import PublicToggle from '@/components/PublicToggle'
import VignetteManager from '@/components/VignetteManager'
import SmartParkingWidget from '@/components/SmartParkingWidget'
import SalesWidget from '@/components/SalesWidget'
import dynamic from 'next/dynamic'
import CarHealthWidget from '@/components/CarHealthWidget'

const AnalyticsCharts = dynamic(() => import('@/components/AnalyticsCharts'), { ssr: false })
const PredictiveMaintenance = dynamic(() => import('@/components/PredictiveMaintenance'), { ssr: false })

// ──────────────────────────────────────────
// CONFIGURATION & HELPERS
// ──────────────────────────────────────────
const COLORS = {
  fuel: '#3b82f6',
  service: '#ef4444',
  insurance: '#8b5cf6',
  maintenance: '#f59e0b',
  parking: '#10b981',
  tax: '#64748b',
  other: '#94a3b8'
}

const CATEGORY_LABELS = {
  fuel: 'Üzemanyag', service: 'Szerviz', insurance: 'Biztosítás',
  maintenance: 'Karbantartás', parking: 'Parkolás', tax: 'Adó/Illeték', other: 'Egyéb'
}

const formatHUF = (val: number) =>
  new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(val)

const formatNumber = (val: number) =>
  new Intl.NumberFormat('hu-HU').format(val)

const getExpiryStatus = (dateString: string | null) => {
  if (!dateString) return { label: 'Nincs megadva', status: 'Kitöltés...', alert: false, color: 'text-slate-400 dark:text-slate-500', bg: 'bg-slate-50/50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10' }
  const today = new Date()
  const expiry = new Date(dateString)
  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { label: 'Lejárt!', status: `${Math.abs(diffDays)} napja`, alert: true, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30' }
  if (diffDays < 30) return { label: 'Lejáróban', status: `${diffDays} nap`, alert: true, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30' }
  return { label: 'Érvényes', status: expiry.toLocaleDateString('hu-HU'), alert: false, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30' }
}

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

// ──────────────────────────────────────────
// CLIENT SIDE DASHBOARD WRAPPER
// ──────────────────────────────────────────
export default function CarDetailsClient({
  car,
  events,
  reminders,
  tires,
  docs,
  vignettes,
  activeParking,
  limits,
  plan,
  isPro,
  hasEditAccess,
  signOutAction
}: any) {
  // Tabs states
  const [leftTab, setLeftTab] = useState<'status' | 'finance' | 'fuel'>('status')
  const [rightTab, setRightTab] = useState<'specs' | 'todos' | 'docs'>('todos')
  const [logFilter, setLogFilter] = useState<'all' | 'fuel' | 'service' | 'other'>('all')

  const carIdString = car.id.toString()
  const isElectric = car.fuel_type === 'Elektromos'
  const unit = isElectric ? 'kWh' : 'L'
  const isPublic = car.is_public_history || false

  // Totals calculations
  const totalCost = events.reduce((sum: number, e: any) => sum + (e.cost || 0), 0)
  const serviceCost = events.filter((e: any) => e.type === 'service').reduce((sum: number, e: any) => sum + (e.cost || 0), 0)
  const fuelCost = events.filter((e: any) => e.type === 'fuel').reduce((sum: number, e: any) => sum + (e.cost || 0), 0)

  const fuelEvents = events.filter((e: any) => e.type === 'fuel' && e.mileage && e.liters).sort((a: any, b: any) => a.mileage - b.mileage)
  let avgConsumption = 'Nincs adat'

  if (fuelEvents.length >= 2) {
    const totalLiters = fuelEvents.reduce((sum: number, e: any) => sum + (e.liters || 0), 0) - (fuelEvents[0].liters || 0)
    const distanceDelta = fuelEvents[fuelEvents.length - 1].mileage - fuelEvents[0].mileage
    if (distanceDelta > 0) avgConsumption = `${((totalLiters / distanceDelta) * 100).toFixed(1)} ${unit}`
  }

  // Service Interval Calculations
  const serviceIntervalKm = car.service_interval_km || (isElectric ? 30000 : 15000)
  let baseKm = car.last_service_mileage || 0
  const lastServiceEvent = events.find((e: any) => e.type === 'service')
  if (lastServiceEvent && lastServiceEvent.mileage > baseKm) baseKm = lastServiceEvent.mileage
  if (baseKm === 0) baseKm = car.mileage

  const nextServiceKm = baseKm + serviceIntervalKm
  const kmRemaining = nextServiceKm - car.mileage
  const kmSinceService = car.mileage - baseKm

  let healthStatus = { text: 'Kiváló', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50', dot: 'bg-emerald-500' }
  if (kmRemaining <= 0) healthStatus = { text: 'Szerviz Most!', color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50', dot: 'bg-red-500 animate-pulse' }
  else if (kmRemaining < 2000) healthStatus = { text: 'Hamarosan', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50', dot: 'bg-amber-500' }

  const percentageUsed = Math.min(100, Math.max(0, (kmSinceService / serviceIntervalKm) * 100))
  const oilLife = 100 - percentageUsed
  const motStatus = getExpiryStatus(car.mot_expiry)
  const insuranceStatus = getExpiryStatus(car.insurance_expiry)

  // Smart advice
  const smartTips = []
  if (!isElectric && oilLife < 15) smartTips.push('Az olajcsere nagyon hamarosan esedékes.')
  if (isElectric && kmRemaining < 2000) smartTips.push('Közeleg a kötelező átvizsgálás ideje.')
  if (car.mileage > 200000) smartTips.push(isElectric ? '200e km felett érdemes az akku SOH mérése.' : '200e km felett érdemes ellenőrizni a vezérlést.')
  if (motStatus.alert) smartTips.push(`A műszaki vizsga kritikus: ${motStatus.status}`)
  if (tires.length === 0) smartTips.push('Rögzítsd a gumikat a Gumihotelben.')
  if (smartTips.length === 0) smartTips.push('Minden rendszer rendben. Biztonságos utat!')

  const healthProps = { car, oilLife, kmSinceService, serviceIntervalKm, kmRemaining, motStatus, insuranceStatus }
  const techProps = { car, avgConsumption, isElectric, canVinSearch: limits.vinSearch, hasEditAccess }
  const costProps = { total: totalCost, fuel: fuelCost, service: serviceCost, isElectric }

  // Filtered log
  const filteredEventsList = events.filter((e: any) => {
    if (logFilter === 'all') return true
    if (logFilter === 'fuel') return e.type === 'fuel'
    if (logFilter === 'service') return e.type === 'service'
    return e.type !== 'fuel' && e.type !== 'service'
  })

  return (
    <div className="space-y-6">

      {/* ── CINEMATIC CAR IMAGE HERO VIEWPORT ── */}
      <div className="relative w-full rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[21/9] min-h-[300px] sm:min-h-[360px] bg-slate-950 border border-white/10 dark:border-white/10 shadow-2xl group">
        {/* Car Image (Cinematic Cover) */}
        {car.image_url ? (
          <div className="absolute inset-0 z-0">
            <Image
              src={car.image_url}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-[1000ms] ease-out"
              priority
              quality={90}
            />
            {/* Dark radial/linear gradient overlay for high legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30 z-10" />
            {/* Sweep light reflection effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-[1500ms] ease-out z-20 pointer-events-none" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-tr from-slate-950 via-[#0a0f1d] to-slate-950 flex flex-col items-center justify-center overflow-hidden">
            {/* Tech grid mesh backdrop */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" aria-hidden>
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,10 L100,10 M0,20 L100,20 M0,30 L100,30 M0,40 L100,40 M0,50 L100,50 M0,60 L100,60 M0,70 L100,70 M0,80 L100,80 M0,90 L100,90" stroke="currentColor" strokeWidth="0.15" />
                <path d="M10,0 L10,100 M20,0 L20,100 M30,0 L30,100 M40,0 L40,100 M50,0 L50,100 M60,0 L60,100 M70,0 L70,100 M80,0 L80,100 M90,0 L90,100" stroke="currentColor" strokeWidth="0.15" />
              </svg>
            </div>
            {/* Glowing neon vector wireframe car profile */}
            <svg className="w-[80%] max-w-md opacity-85 select-none" viewBox="0 0 800 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#d946ef" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="7" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g opacity="0.25">
                <line x1="0" y1="260" x2="800" y2="260" stroke="#6366f1" strokeWidth="1.5" />
                <line x1="0" y1="280" x2="800" y2="280" stroke="#6366f1" strokeWidth="1" />
                <line x1="100" y1="260" x2="0" y2="300" stroke="#6366f1" strokeWidth="1" />
                <line x1="250" y1="260" x2="150" y2="300" stroke="#6366f1" strokeWidth="1" />
                <line x1="400" y1="260" x2="400" y2="300" stroke="#6366f1" strokeWidth="1" />
                <line x1="550" y1="260" x2="650" y2="300" stroke="#6366f1" strokeWidth="1" />
                <line x1="700" y1="260" x2="800" y2="300" stroke="#6366f1" strokeWidth="1" />
              </g>
              <path d="M 120,240 L 180,240 C 195,240 205,210 220,210 C 235,210 245,240 260,240 L 540,240 C 555,240 565,210 580,210 C 595,210 605,240 620,240 L 680,240 C 710,240 730,220 740,200 C 745,190 745,175 735,165 C 720,150 680,140 640,135 C 610,130 550,110 510,95 C 470,80 380,75 320,80 C 250,85 190,115 160,135 C 130,155 100,180 90,195 C 80,210 90,240 120,240 Z" stroke="url(#neonGlow)" strokeWidth="3" filter="url(#glow)" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="220" cy="210" r="32" stroke="url(#neonGlow)" strokeWidth="3" filter="url(#glow)" />
              <circle cx="220" cy="210" r="16" stroke="url(#neonGlow)" strokeWidth="1.5" />
              <circle cx="580" cy="210" r="32" stroke="url(#neonGlow)" strokeWidth="3" filter="url(#glow)" />
              <circle cx="580" cy="210" r="16" stroke="url(#neonGlow)" strokeWidth="1.5" />
              <path d="M 50,150 L 110,150" stroke="#6366f1" strokeWidth="1.5" opacity="0.5" strokeDasharray="10 5" />
              <path d="M 30,170 L 80,170" stroke="#d946ef" strokeWidth="1.5" opacity="0.4" strokeDasharray="5 5" />
              <path d="M 680,105 L 730,115" stroke="#3b82f6" strokeWidth="1.5" opacity="0.6" />
            </svg>
            <div className="text-[9px] font-mono tracking-[0.25em] text-indigo-400/40 uppercase select-none animate-pulse mb-6">DYNAMIC ENGINE SPECIFICATIONS</div>
          </div>
        )}

        {/* Floating Top Action Pill Overlays */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 transition-all hover:bg-white/15 text-[10px] font-bold uppercase tracking-widest shadow-lg">
            <Warehouse className="w-3.5 h-3.5" />
            <span>Garázs</span>
          </Link>
          <div className="flex items-center gap-2">
            {hasEditAccess && limits.export ? (
              <div className="shadow-lg"><ExportMenu car={car} events={events} /></div>
            ) : hasEditAccess ? (
              <Link href="/pricing" className="bg-black/40 hover:bg-black/50 text-white/70 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest shadow-lg">
                <Lock className="w-3 h-3" /> Export
              </Link>
            ) : null}

            {hasEditAccess && (
              <Link href={`/cars/${car.id}/edit`} className="bg-black/40 hover:bg-black/50 text-white p-2.5 rounded-xl backdrop-blur-md transition-colors border border-white/10 shadow-lg">
                <Pencil className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Bottom Floating Glass Console Bar (Floating HUD island) */}
        <div className="absolute bottom-4 left-4 right-4 z-20 p-4 sm:p-5 backdrop-blur-md bg-black/60 border border-white/10 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
          <div className="space-y-1.5">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-widest ${healthStatus.color} shadow-sm`}>
              <span className={`w-1.5 h-1.5 rounded-full ${healthStatus.dot}`} />
              {healthStatus.text}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-none">
                {car.make} <span className="text-white/60 font-light">{car.model}</span>
              </h1>
              <p className="text-white/40 font-mono text-[9px] tracking-[0.25em] uppercase mt-1">{hasEditAccess ? car.plate : '***-***'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none bg-white/10 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-md flex flex-col items-center justify-center min-w-[100px]">
              <p className="text-[8px] text-white/50 uppercase font-bold tracking-widest mb-0.5">Mérőóra</p>
              <p className="font-mono font-bold text-xs text-white">{car.mileage.toLocaleString()} km</p>
            </div>
            <div className="flex-1 sm:flex-none bg-white/10 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-md flex flex-col items-center justify-center min-w-[100px]">
              <p className="text-[8px] text-white/50 uppercase font-bold tracking-widest mb-0.5">Szervizig</p>
              <p className={`font-mono font-bold text-xs ${kmRemaining <= 1000 ? 'text-red-400' : 'text-emerald-400'}`}>{kmRemaining.toLocaleString()} km</p>
            </div>
          </div>
        </div>
      </div>


      {/* ── ACTION GRID (DESKTOP) ── */}
      {hasEditAccess && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          <Link href={`/cars/${carIdString}/events/new?type=fuel`} className="flex items-center justify-center gap-2 h-11 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-transparent shadow-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 active:scale-95">
            {isElectric ? <Zap className="w-4 h-4" /> : <Fuel className="w-4 h-4" />}
            <span>{isElectric ? 'Töltés' : 'Tankolás'}</span>
          </Link>
          <Link href={`/cars/${carIdString}/events/new?type=service`} className="flex items-center justify-center gap-2 h-11 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:scale-105 active:scale-95">
            <Wrench className="w-4 h-4" />
            <span>Szerviz</span>
          </Link>
          <Link href={`/cars/${carIdString}/reminders/new`} className="flex items-center justify-center gap-2 h-11 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 active:scale-95">
            <Bell className="w-4 h-4" />
            <span>Teendő</span>
          </Link>
          {limits.mileageLog ? (
            <Link href={`/cars/${carIdString}/trips`} className="flex items-center justify-center gap-2 h-11 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 active:scale-95">
              <Map className="w-4 h-4" />
              <span>Utak</span>
            </Link>
          ) : (
            <Link href="/pricing" className="flex items-center justify-center gap-2 h-11 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border bg-slate-100/50 dark:bg-white/[0.01] border-slate-200/50 dark:border-white/5 text-slate-400 cursor-not-allowed">
              <Lock className="w-3.5 h-3.5" />
              <span>Utak</span>
            </Link>
          )}
          <Link href={`/cars/${carIdString}/parts`} className="flex items-center justify-center gap-2 h-11 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:scale-105 active:scale-95">
            <Package className="w-4 h-4" />
            <span>Alkatrészek</span>
          </Link>
          {limits.serviceMap ? (
            <Link href="/services" className="flex items-center justify-center gap-2 h-11 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:scale-105 active:scale-95">
              <MapPin className="w-4 h-4" />
              <span>Térkép</span>
            </Link>
          ) : (
            <Link href="/pricing" className="flex items-center justify-center gap-2 h-11 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border bg-slate-100/50 dark:bg-white/[0.01] border-slate-200/50 dark:border-white/5 text-slate-400 cursor-not-allowed">
              <Lock className="w-3.5 h-3.5" />
              <span>Térkép</span>
            </Link>
          )}
        </div>
      )}

      {/* ── MAIN CONTENT AREA (Bento hubs) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT MEGA-HUB: DYNAMICS & FINANCE (8 columns) ── */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">

          {/* Navigation/Tabs selector for Left Hub */}
          <Glass className="rounded-2xl p-1.5 flex gap-1">
            {[
              { id: 'status', label: 'Státusz & AI', icon: Activity },
              { id: 'finance', label: 'Költségek', icon: Wallet },
              { id: 'fuel', label: 'Fogyasztás', icon: Fuel }
            ].map(tab => {
              const Icon = tab.icon
              const active = leftTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setLeftTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 ${
                    active
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </Glass>

          {/* Tab content area */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {leftTab === 'status' && (
                <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                  {/* Public toggle / alert */}
                  {hasEditAccess && <PublicToggle carId={carIdString} isPublicInitial={isPublic} />}

                  {/* Combined Health metrics */}
                  <CarHealthWidget {...healthProps} />

                  {/* Smart parking or predictive maintenance */}
                  {hasEditAccess && (
                    <SmartParkingWidget carId={carIdString} activeSession={activeParking} />
                  )}

                  {/* Predictive maint */}
                  {isPro && hasEditAccess ? (
                    <PredictiveMaintenance carId={car.id} carName={`${car.make} ${car.model}`} />
                  ) : hasEditAccess ? (
                    <PremiumLockWidget title="Prediktív Karbantartás" icon={<Sparkles className="w-5 h-5 text-amber-500" />} />
                  ) : null}
                </motion.div>
              )}

              {leftTab === 'finance' && (
                <motion.div key="finance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                  <CostCard {...costProps} />
                  <AnalyticsCharts events={events} isPro={isPro} />
                </motion.div>
              )}

              {leftTab === 'fuel' && (
                <motion.div key="fuel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                  <FuelTrackerCard events={events} isElectric={isElectric} carMileage={car.mileage} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT MEGA-HUB: SPECS & DOCS (4 columns) ── */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">

          {/* Tabs selector for Right Hub */}
          <Glass className="rounded-2xl p-1.5 flex gap-1">
            {[
              { id: 'todos', label: 'Teendők', icon: Bell },
              { id: 'specs', label: 'Specifikáció', icon: Info },
              { id: 'docs', label: 'Garázs', icon: Package }
            ].map(tab => {
              const active = rightTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setRightTab(tab.id as any)}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${
                    active
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </Glass>

          {/* Tab Content right side */}
          <div className="min-h-[350px]">
            <AnimatePresence mode="wait">
              {rightTab === 'todos' && (
                <motion.div key="todos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                  {isPro && hasEditAccess ? (
                    <SmartTipsCard tips={smartTips} />
                  ) : hasEditAccess ? (
                    <PremiumLockWidget title="AI Szerelő Tippek" icon={<Lightbulb className="w-5 h-5 text-yellow-400" />} />
                  ) : null}

                  {hasEditAccess && (
                    <RemindersList reminders={reminders} carId={carIdString} />
                  )}

                  <SalesWidget car={car} />
                </motion.div>
              )}

              {rightTab === 'specs' && (
                <motion.div key="specs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <Glass className="rounded-2xl p-5">
                    <TechnicalSpecs {...techProps} />
                  </Glass>
                </motion.div>
              )}

              {rightTab === 'docs' && (
                <motion.div key="docs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                  {hasEditAccess && vignettes && vignettes.length > 0 && (
                    <Glass className="rounded-2xl p-5">
                      <VignetteManager carId={carIdString} vignettes={vignettes} />
                    </Glass>
                  )}
                  {hasEditAccess && (
                    <Glass className="rounded-2xl p-5">
                      <TireHotelCard tires={tires} carMileage={car.mileage} carId={carIdString} />
                    </Glass>
                  )}
                  {hasEditAccess && (
                    <DocumentManager carId={carIdString} documents={docs} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── TIMELINE LOG HISTORY (Full width at bottom) ── */}
      <Glass className="rounded-2xl overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-slate-100/60 dark:border-white/[0.06] flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white/40 dark:bg-white/[0.02]">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" /> Idővonal
            </h3>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">Összes rögzített esemény és szervizmúlt</p>
          </div>

          {/* Timeline Filter Pills */}
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl whitespace-nowrap border border-slate-200/40 dark:border-white/5">
            {[
              { id: 'all', label: 'Összes' },
              { id: 'service', label: 'Szerviz' },
              { id: 'fuel', label: 'Tankolás' },
              { id: 'other', label: 'Egyéb' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setLogFilter(f.id as any)}
                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                  logFilter === f.id
                    ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 pr-1 max-h-[500px] overflow-y-auto">
          {filteredEventsList.length > 0 ? (
            <div className="relative border-l-2 border-slate-100 dark:border-white/5 ml-3 space-y-6">
              {filteredEventsList.map((event: any) => (
                <div key={event.id} className="relative pl-6 group">
                  <div className={`absolute -left-[9px] top-3.5 w-4 h-4 rounded-full border-4 border-[#F5F5F7] dark:border-[#000000] ${
                    event.type === 'fuel' ? 'bg-amber-500' :
                    event.type === 'service' ? 'bg-indigo-500' : 'bg-slate-400'
                  } shadow-sm`} />

                  <Glass className="rounded-2xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors relative overflow-hidden">
                    <Link href={hasEditAccess ? `/cars/${carIdString}/events/${event.id}/edit` : '#'} className={`block p-4 ${!hasEditAccess && 'cursor-default'}`}>
                      <div className="flex justify-between items-start mb-2 pr-8">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 block">
                            {new Date(event.event_date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{event.title}</h4>
                        </div>
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white whitespace-nowrap">
                          {event.cost > 0 ? `-${event.cost.toLocaleString()} Ft` : '-'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5" /> {event.mileage.toLocaleString()} km</span>
                        {event.liters && (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-500"><Fuel className="w-3.5 h-3.5" /> {event.liters}L</span>
                        )}
                      </div>
                    </Link>

                    {hasEditAccess && (
                      <div className="absolute top-2.5 right-2.5">
                        <form action={deleteEvent}>
                          <input type="hidden" name="id" value={event.id} />
                          <input type="hidden" name="car_id" value={carIdString} />
                          <button
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                            title="Bejegyzés törlése"
                            type="submit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    )}
                  </Glass>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="text-slate-900 dark:text-white font-bold text-xs">Nincs esemény</h4>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">Nincs rögzített esemény a megadott szűrésnek megfelelően.</p>
            </div>
          )}
        </div>
      </Glass>
    </div>
  )
}

// ──────────────────────────────────────────
// SUB-COMPONENTS
// ──────────────────────────────────────────

function PremiumLockWidget({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <Glass className="rounded-2xl p-6 relative overflow-hidden group">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-bold text-slate-400 dark:text-slate-500">{title}</h3>
      </div>
      <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-4">
        <Lock className="w-6 h-6 text-amber-500 mb-2" />
        <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Premium funkció</p>
        <Link href="/pricing" className="mt-3 text-[10px] font-bold uppercase tracking-widest text-white bg-amber-500 px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors shadow-sm">
          Feloldás
        </Link>
      </div>
      <div className="space-y-3 opacity-30 blur-sm pointer-events-none">
        <div className="h-4 bg-slate-200 dark:bg-white/5 rounded w-3/4" />
        <div className="h-4 bg-slate-200 dark:bg-white/5 rounded w-1/2" />
        <div className="h-4 bg-slate-200 dark:bg-white/5 rounded w-full" />
      </div>
    </Glass>
  )
}

function CostCard({ total, fuel, service, isElectric }: any) {
  return (
    <Glass className="rounded-2xl p-5 flex flex-col justify-between h-full">
      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-4">
        <Wallet className="w-4 h-4 text-slate-400" />Költségek
      </h3>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-500 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center shadow-inner">
          <Banknote className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Összesen</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{total.toLocaleString()} Ft</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <CostItem label={isElectric ? 'Töltés' : 'Üzemanyag'} value={fuel} icon={isElectric ? <Zap className="w-3.5 h-3.5" /> : <Fuel className="w-3.5 h-3.5" />} />
        <CostItem label="Szerviz" value={service} icon={<Wrench className="w-3.5 h-3.5" />} />
      </div>
    </Glass>
  )
}

function CostItem({ label, value, icon }: any) {
  return (
    <div className="bg-slate-900/5 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200/50 dark:border-white/5">
      <div className="flex items-center gap-1.5 mb-1 text-slate-400">
        {icon}
        <span className="text-[9px] uppercase font-bold tracking-widest">{label}</span>
      </div>
      <p className="font-bold text-slate-800 dark:text-slate-200 text-xs font-mono">{value.toLocaleString()} Ft</p>
    </div>
  )
}

function SmartTipsCard({ tips }: { tips: string[] }) {
  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 shadow-sm text-white relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <div className="p-1 rounded-lg bg-yellow-400/20"><Lightbulb className="w-4 h-4 text-yellow-300" /></div>
        <h3 className="font-bold text-xs uppercase tracking-widest">AI Szerelő Tippek</h3>
      </div>
      <div className="space-y-2 relative z-10">
        {tips.map((tip, i) => (
          <div key={i} className="flex gap-2.5 items-start text-xs text-indigo-100/90 bg-black/10 p-2 rounded-xl border border-white/5">
            <span className="mt-1.5 w-1.5 h-1.5 bg-yellow-400 rounded-full flex-shrink-0" />
            <p className="leading-snug">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function RemindersList({ reminders, carId }: any) {
  return (
    <Glass className="rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100/60 dark:border-white/[0.06] flex justify-between items-center bg-white/40 dark:bg-white/[0.02]">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {reminders.length > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${reminders.length > 0 ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
          </span>
          Teendők
        </h3>
        <Link href={`/cars/${carId}/reminders/new`} className="text-[9px] font-bold uppercase tracking-widest bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1"><Plus className="w-3 h-3" /> Új</Link>
      </div>
      <div className="divide-y divide-slate-100/60 dark:divide-white/[0.04]">
        {reminders.length > 0 ? (
          reminders.map((rem: any) => (
            <div key={rem.id} className="p-3.5 flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/[0.01] transition-colors group">
              <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex flex-col items-center justify-center border border-indigo-100 dark:border-indigo-900/30 flex-shrink-0">
                <span className="text-[8px] font-bold uppercase leading-none mb-0.5">{new Date(rem.due_date).toLocaleString('hu-HU', { month: 'short' }).replace('.', '')}</span>
                <span className="text-base font-black leading-none">{new Date(rem.due_date).getDate()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">{rem.service_type}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{rem.note || 'Nincs leírás'}</p>
              </div>
              <form action={deleteReminder}>
                <input type="hidden" name="id" value={rem.id} />
                <input type="hidden" name="car_id" value={carId} />
                <button className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </form>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs italic">Minden teendő elvégezve.</div>
        )}
      </div>
    </Glass>
  )
}

function TechnicalSpecs({ car, avgConsumption, canVinSearch, hasEditAccess }: any) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
          <Gauge className="w-4 h-4 text-slate-400" /> Specifikációk
        </h3>
        {canVinSearch && car.vin && hasEditAccess ? (
          <a href={`https://vincheck.com/${car.vin}`} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100 transition-colors flex items-center gap-1 shadow-sm">
            <Search className="w-3 h-3" /> Vizsgálat
          </a>
        ) : hasEditAccess ? (
          <Link href="/pricing" className="text-[9px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 px-2.5 py-1 rounded flex items-center gap-1">
            <Lock className="w-3 h-3" /> Vizsgálat
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
        <DataPoint label="Futásteljesítmény" value={car.mileage ? `${car.mileage.toLocaleString()} km` : '-'} />
        <DataPoint label="Évjárat" value={car.year} />
        <DataPoint label="Motor" value={car.engine_size ? `${car.engine_size} ccm` : '-'} />
        <DataPoint label="Teljesítmény" value={car.power_hp ? `${car.power_hp} LE` : '-'} />
        <DataPoint label="Váltó" value={car.transmission || '-'} />
        <DataPoint label="Üzemanyag" value={car.fuel_type || '-'} />
        <DataPoint label="Szín" value={car.color || '-'} />
        <DataPoint label="Átlagfogyasztás" value={avgConsumption === 'Nincs adat' ? '-' : avgConsumption} highlight />

        <div className="col-span-2 grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-white/5 pt-3">
          <DataPoint
            label="Műszaki vizsga"
            value={formatDate(car.mot_expiry)}
            className={car.mot_expiry && new Date(car.mot_expiry) < new Date() ? 'text-red-500 dark:text-red-400 font-bold' : ''}
          />
          <DataPoint
            label="Biztosítás"
            value={formatDate(car.insurance_expiry)}
          />
        </div>

        <div className="col-span-2 border-t border-slate-100 dark:border-white/5 pt-3">
          <DataPoint label="Alvázszám (VIN)" value={hasEditAccess ? (car.vin || 'Nincs megadva') : '*** BIZTONSÁGI OKOKBÓL REJTETT ***'} mono />
        </div>
      </div>
    </div>
  )
}

function DataPoint({ label, value, mono, capitalize, highlight, className = '' }: any) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-0.5">{label}</span>
      <span className={`text-xs font-bold ${mono ? 'font-mono text-[10px]' : ''} ${capitalize ? 'capitalize' : ''} ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>{value}</span>
    </div>
  )
}

function TireHotelCard({ tires, carMileage, carId }: any) {
  return (
    <div className="space-y-4 pt-1">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
          <Disc className="w-4 h-4 text-slate-400" /> Gumihotel
        </h3>
        <Link href={`/cars/${carId}/edit`} className="text-[9px] font-bold uppercase tracking-widest bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-2.5 py-1 hover:bg-slate-50 transition-colors rounded">Kezelés</Link>
      </div>
      <div className="space-y-2">
        {tires.length > 0 ? (
          tires.slice(0, 2).map((tire: any) => {
            let currentDistance = tire.total_distance
            if (tire.is_mounted) currentDistance += (carMileage - (tire.mounted_at_mileage || carMileage))
            return (
              <div key={tire.id} className={`flex items-center justify-between p-2.5 rounded-xl border ${tire.is_mounted ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30' : 'bg-slate-900/5 dark:bg-white/5 border-slate-200/40 dark:border-white/5'}`}>
                <div className="flex items-center gap-3">
                  {tire.type === 'winter' ? <Snowflake className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{tire.brand}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{currentDistance.toLocaleString()} km</p>
                  </div>
                </div>
                {tire.is_mounted && <span className="text-[8px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-white dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/30 px-2 py-0.5 rounded shadow-sm">Aktív</span>}
              </div>
            )
          })
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4 bg-slate-900/5 dark:bg-white/5 rounded-xl border border-dashed border-slate-200/50 dark:border-white/5">Nincs rögzített abroncs.</p>
        )}
      </div>
    </div>
  )
}

function FuelTrackerCard({ events, isElectric, carMileage }: { events: any[]; isElectric: boolean; carMileage: number }) {
  const fuelEvents = events
    .filter(e => e.type === 'fuel' && e.mileage && e.liters)
    .sort((a, b) => a.mileage - b.mileage)

  let totalLiters = 0
  let totalCost = 0
  const history = []

  for (let i = 0; i < fuelEvents.length; i++) {
    const current = fuelEvents[i]
    totalLiters += current.liters || 0
    totalCost += current.cost || 0

    const stats = {
      consumption: 0,
      distance: 0,
      pricePerUnit: (current.cost && current.liters) ? Math.round(current.cost / current.liters) : 0,
    }

    if (i > 0) {
      const prev = fuelEvents[i - 1]
      const distance = current.mileage - prev.mileage
      if (distance > 0) {
        stats.consumption = (current.liters / distance) * 100
        stats.distance = distance
      }
    }
    history.push({ ...current, ...stats })
  }

  const validSegments = history.filter(h => h.consumption > 0 && h.consumption < 50)
  const avgCons = validSegments.length > 0
    ? validSegments.reduce((sum, h) => sum + h.consumption, 0) / validSegments.length
    : 0

  const lastEvent = history[history.length - 1]
  const lastPricePerUnit = lastEvent ? lastEvent.pricePerUnit : 0
  const lastDistance = lastEvent ? lastEvent.distance : 0
  const displayHistory = [...history].reverse().slice(0, 4)

  const unit = isElectric ? 'kWh' : 'L'
  const themeColor = isElectric ? 'text-cyan-600 dark:text-cyan-400' : 'text-amber-600 dark:text-amber-400'
  const lightBg = isElectric ? 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-100 dark:border-cyan-900/40' : 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40'

  return (
    <Glass className="rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="p-5 pb-3">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">
              Átlagfogyasztás
            </h3>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-bold tracking-tight ${themeColor}`}>
                {avgCons > 0 ? avgCons.toFixed(1) : '-'}
              </span>
              <span className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider pl-1">
                {unit}/100km
              </span>
            </div>
          </div>
          <div className={`p-2.5 rounded-xl border ${lightBg} ${themeColor}`}>
            {isElectric ? <Zap className="w-5 h-5" /> : <Fuel className="w-5 h-5" />}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <SummaryBox label="Egységár" value={lastPricePerUnit > 0 ? `${lastPricePerUnit} Ft` : '-'} subLabel={`/${unit}`} />
          <SummaryBox label="Utolsó táv" value={lastDistance > 0 ? `${lastDistance} km` : '-'} subLabel="távolság" />
          <SummaryBox label="Összesen" value={`${(totalCost / 1000).toFixed(0)}k Ft`} subLabel={`${fuelEvents.length} alkalom`} />
        </div>
      </div>

      <div className="flex-1 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100/60 dark:border-white/[0.06] p-4">
        <h4 className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">Tankolási napló</h4>
        <div className="space-y-2">
          {displayHistory.length > 0 ? displayHistory.map((item, idx) => {
            const isBetter = item.consumption < avgCons
            const diff = Math.abs(item.consumption - avgCons).toFixed(1)
            return (
              <div key={item.id || idx} className="bg-white/80 dark:bg-white/[0.02] border border-slate-100/60 dark:border-white/5 p-3 rounded-xl flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center font-bold text-[9px] border ${lightBg} ${themeColor}`}>
                    <span>{new Date(item.event_date).getMonth() + 1}.</span>
                    <span className="text-xs -mt-0.5">{new Date(item.event_date).getDate()}</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">{item.title || 'Tankolás'}</p>
                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                      <span className="font-mono">{item.mileage.toLocaleString()} km</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/10" />
                      <span>{item.liters} {unit}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {item.consumption > 0 ? (
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-slate-900 dark:text-white text-xs font-mono">
                        {item.consumption.toFixed(1)} <span className="text-[9px] text-slate-400 font-sans font-normal">{unit}</span>
                      </span>
                      <div className={`text-[8px] font-bold flex items-center gap-0.5 ${isBetter ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isBetter ? <TrendingDown className="w-2.5 h-2.5" /> : <TrendingUp className="w-2.5 h-2.5" />}
                        {diff}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[9px] text-slate-400 italic">Bázis</span>
                  )}
                </div>
              </div>
            )
          }) : (
            <div className="text-center py-4 text-slate-400 dark:text-slate-500 text-xs italic">Nincs elegendő adat.</div>
          )}
        </div>
      </div>
    </Glass>
  )
}

function SummaryBox({ label, value, subLabel }: any) {
  return (
    <div className="bg-slate-900/5 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200/50 dark:border-white/5">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{label}</p>
      <p className="font-bold text-slate-900 dark:text-white text-xs mt-0.5 truncate">{value}</p>
      <p className="text-[8px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{subLabel}</p>
    </div>
  )
}

