import { createClient } from '@/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { getSubscriptionStatus, PLAN_LIMITS } from '@/utils/subscription'
import { AuroraBackground, DashboardNav, BottomNav } from '@/components/SharedNavigation'
import { signOut } from '@/app/login/action'
import CarDetailsClient from './CarDetailsClient'
import { Eye } from 'lucide-react'

type Car = {
  id: number
  make: string; model: string; plate: string; year: number; mileage: number
  image_url: string | null; mot_expiry: string | null; insurance_expiry: string | null
  service_interval_km: number; last_service_mileage: number; fuel_type: string
  color: string | null; vin: string | null; share_token?: string | null
  is_for_sale?: boolean | null
  is_listed_on_marketplace?: boolean | null
  hide_prices?: boolean | null; hide_sensitive?: boolean | null
  transmission?: string | null; engine_size?: number | null; power_hp?: number | null
  is_public_history?: boolean
  user_id: string
  car_shares?: { email: string }[]
}

type Props = { params: Promise<{ id: string }> }

export const runtime = 'edge';

export async function generateMetadata(props: Props) {
  const params = await props.params
  const supabase = await createClient()
  const { data: car } = await supabase.from('cars').select('make, model').eq('id', params.id).single()
  return {
    title: car ? `${car.make} ${car.model} | DynamicSense` : 'Autó Adatlap | DynamicSense',
    description: 'Részletes járműtörténet és adatok.'
  }
}

export default async function CarDetailsPage(props: Props) {
  const params = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  // 🛡️ SECURITY & PERMISSION CHECK
  const { data: carData, error } = await supabase
    .from('cars')
    .select('*, car_shares(email)')
    .eq('id', params.id)
    .single()

  if (error || !carData) return notFound()

  const car: Car = carData
  const isOwner = car.user_id === user.id
  const isShared = car.car_shares?.some((share: any) => share.email === user.email)
  const hasEditAccess = isOwner || isShared

  if (!hasEditAccess) {
    const isPublic = car.is_public_history || (car.is_for_sale && car.is_listed_on_marketplace)
    if (!isPublic) return notFound()
  }

  // DATA FETCHING
  const [eventsRes, remindersRes, tiresRes, docsRes, vignettesRes, parkingRes, subscriptionResult] = await Promise.all([
    supabase.from('events').select('id, type, title, description, event_date, mileage, cost, car_id, liters').eq('car_id', params.id).order('event_date', { ascending: false }),
    supabase.from('service_reminders').select('id, service_type, due_date, due_mileage, notify_email, notification_sent, note').eq('car_id', params.id).order('due_date', { ascending: true }),
    supabase.from('tires').select('id, brand, size, type, is_mounted, season, tread_depth, purchase_date').eq('car_id', params.id).order('is_mounted', { ascending: false }),
    supabase.from('car_documents').select('id, name, file_url, file_type, created_at, car_id').eq('car_id', params.id).order('created_at', { ascending: false }),
    supabase.from('vignettes').select('id, country, expiry_date, sticker_number').eq('car_id', params.id),
    supabase.from('parking_sessions').select('id, started_at, location, fee_paid').eq('car_id', params.id).maybeSingle(),
    getSubscriptionStatus(supabase, user.id)
  ])

  const safeEvents = eventsRes.data || []
  const safeReminders = remindersRes.data || []
  const safeTires = tiresRes.data || []
  const safeDocs = docsRes.data || []
  const safeVignettes = vignettesRes.data || []
  const activeParking = parkingRes.data || null

  const { plan, isTrial } = subscriptionResult
  const limits = PLAN_LIMITS[plan]
  const isPro = limits.aiMechanic

  const displayName = user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0]

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

        {/* Read-only view alert */}
        {!hasEditAccess && (
          <div className="mb-6">
            <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/50 rounded-xl p-4 flex items-center gap-3 justify-center text-amber-800 dark:text-amber-400 font-bold text-sm backdrop-blur-md">
              <Eye className="w-5 h-5 flex-shrink-0" />
              <span>Nyilvános nézet (Szerkesztési jogosultság nélkül)</span>
            </div>
          </div>
        )}

        {/* Consolidated Client Side Dashboard */}
        <CarDetailsClient
          car={car}
          events={safeEvents}
          reminders={safeReminders}
          tires={safeTires}
          docs={safeDocs}
          vignettes={safeVignettes}
          activeParking={activeParking}
          limits={limits}
          plan={plan}
          isPro={isPro}
          hasEditAccess={hasEditAccess}
          signOutAction={signOut}
        />
      </main>
    </div>
  )
}