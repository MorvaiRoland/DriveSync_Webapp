import { createClient } from '@/supabase/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { deleteTrip } from '../actions'
import TripForm from '@/components/TripForm'
import { Map, Briefcase, Home, ArrowLeft, Trash2, Route, Percent } from 'lucide-react'
import { getSubscriptionStatus, PLAN_LIMITS } from '@/utils/subscription'
import { AuroraBackground, DashboardNav, BottomNav } from '@/components/SharedNavigation'
import { signOut } from '@/app/login/action'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata(props: Props) {
  const params = await props.params
  const supabase = await createClient()
  const { data: car } = await supabase.from('cars').select('make, model').eq('id', params.id).single()
  return {
    title: car ? `${car.make} ${car.model} | Útnyilvántartás` : 'Útnyilvántartás | DynamicSense',
    description: 'Jármű útnyilvántartás vezetése és statisztikák.'
  }
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

export default async function TripLoggerPage(props: Props) {
  const params = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  // Fetch car details and check access
  const { data: carData, error: carError } = await supabase
    .from('cars')
    .select('*, car_shares(email)')
    .eq('id', params.id)
    .single()
  
  if (carError || !carData) return notFound()

  const isOwner = carData.user_id === user.id
  const isShared = carData.car_shares?.some((share: any) => share.email === user.email)
  if (!isOwner && !isShared) return notFound()

  const car = carData

  // Fetch trips for the car
  const { data: trips } = await supabase
    .from('trips')
    .select('*')
    .eq('car_id', params.id)
    .order('trip_date', { ascending: false })

  const safeTrips = trips || []

  // Calculate statistics
  const totalBusinessKm = safeTrips.filter(t => t.purpose === 'business').reduce((sum, t) => sum + t.distance, 0)
  const totalPersonalKm = safeTrips.filter(t => t.purpose === 'personal').reduce((sum, t) => sum + t.distance, 0)
  const totalKm = totalBusinessKm + totalPersonalKm
  const businessRatio = totalKm > 0 ? Math.round((totalBusinessKm / totalKm) * 100) : 0

  // Fetch subscription details for navbar
  const subscriptionResult = await getSubscriptionStatus(supabase, user.id)
  const { plan, isTrial } = subscriptionResult
  const limits = PLAN_LIMITS[plan]
  const isPro = limits.aiMechanic

  const displayName = user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0]
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-700 relative overflow-x-hidden">
      <AuroraBackground />

      {/* Navigation Pill */}
      <DashboardNav userName={displayName} plan={plan} isTrial={isTrial} isPro={isPro} signOutAction={signOut} />
      <BottomNav isPro={isPro} />

      {/* Main Page Area */}
      <main
        className="relative z-10 max-w-5xl mx-auto px-3 sm:px-4 pb-28 md:pb-10"
        style={{ paddingTop: 'calc(max(0.75rem, env(safe-area-inset-top)) + 5rem)' }}
      >
        
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-8">
          <Link href={`/cars/${car.id}`} className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 text-xs font-bold bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-200 dark:border-slate-700/50">
            <ArrowLeft className="w-4 h-4" /> Vissza az autóhoz
          </Link>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight mb-2">
            Út<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">nyilvántartás</span>
          </h1>
          
          <div className="inline-flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50 mt-1 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            {car.make} {car.model} <span className="opacity-50">|</span> {car.plate}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
          {/* Business Trips */}
          <Glass className="rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-slate-400 dark:text-slate-500">
              <Briefcase className="w-4 h-4 text-blue-500" />
              <p className="text-[10px] uppercase font-bold tracking-wider">Üzleti utak</p>
            </div>
            <div>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-tight">{totalBusinessKm.toLocaleString()} km</p>
              <p className="text-[9px] text-slate-400 font-bold mt-1">Céges használat összesen</p>
            </div>
          </Glass>
          
          {/* Personal Trips */}
          <Glass className="rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-slate-400 dark:text-slate-500">
              <Home className="w-4 h-4 text-purple-500" />
              <p className="text-[10px] uppercase font-bold tracking-wider">Magán utak</p>
            </div>
            <div>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400 leading-tight">{totalPersonalKm.toLocaleString()} km</p>
              <p className="text-[9px] text-slate-400 font-bold mt-1">Magán használat összesen</p>
            </div>
          </Glass>
          
          {/* Business Ratio */}
          <Glass className="rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-end mb-2">
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                <Percent className="w-4 h-4 text-indigo-500" />
                <p className="text-[10px] uppercase font-bold tracking-wider">Céges Arány</p>
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{businessRatio}%</p>
            </div>
            <div>
              <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${businessRatio}%` }}></div>
              </div>
              <p className="text-[9px] text-slate-400 font-bold mt-1">Üzleti / Összes futás</p>
            </div>
          </Glass>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Trip Logger Form */}
          <Glass className="rounded-3xl p-6 shadow-md">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-4">
              <Route className="w-4 h-4 text-slate-400" /> Út rögzítése
            </h3>
            <TripForm carId={car.id} defaultDate={today} />
          </Glass>

          {/* Trip History List */}
          <Glass className="rounded-3xl overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-slate-100/60 dark:border-white/[0.06] flex items-center justify-between bg-white/40 dark:bg-white/[0.02]">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-widest flex items-center gap-2">
                <Map className="w-4 h-4 text-slate-400" /> Rögzített utak
              </h3>
              <span className="text-[10px] font-bold bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 px-3 py-1 rounded-full text-slate-500 dark:text-slate-400 shadow-sm">{safeTrips.length} db</span>
            </div>
            
            <div className="divide-y divide-slate-100/60 dark:divide-white/[0.04]">
              {safeTrips.length > 0 ? (
                safeTrips.map((trip: any) => (
                  <div key={trip.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.01] transition-colors group">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${
                        trip.purpose === 'business' 
                          ? 'bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30' 
                          : 'bg-purple-50/50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30'
                      }`}>
                        {trip.purpose === 'business' ? <Briefcase className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white mb-1 flex-wrap leading-tight">
                          <span>{trip.start_location}</span>
                          <span className="text-slate-400 select-none">→</span>
                          <span>{trip.end_location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                          <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200/50 dark:border-white/5">
                            {new Date(trip.trip_date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <Route className="w-3.5 h-3.5" /> {trip.distance} km
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <form action={deleteTrip} className="self-end sm:self-center">
                      <input type="hidden" name="trip_id" value={trip.id} />
                      <input type="hidden" name="car_id" value={car.id} />
                      <button className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl border border-transparent hover:border-red-200 dark:hover:border-red-900/30" title="Törlés">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-xs italic">Még nincs rögzített út ebben a garázsban.</div>
              )}
            </div>
          </Glass>
        </div>

      </main>
    </div>
  )
}