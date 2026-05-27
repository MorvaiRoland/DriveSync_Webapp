import { createClient } from '@/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { getSubscriptionStatus, PLAN_LIMITS } from '@/utils/subscription'
import { AuroraBackground, DashboardNav, BottomNav } from '@/components/SharedNavigation'
import { signOut } from '@/app/login/action'
import EventFormClient from './EventFormClient'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata(props: Props) {
  const params = await props.params
  const supabase = await createClient()
  const { data: car } = await supabase.from('cars').select('make, model').eq('id', params.id).single()
  return {
    title: car ? `${car.make} ${car.model} | Új esemény` : 'Új esemény | DynamicSense',
    description: 'Esemény rögzítése a jármű naplójába.'
  }
}

export default async function NewEventPage(props: Props) {
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

  // Fetch service types
  const { data: serviceTypes } = await supabase
    .from('service_types')
    .select('*')
    .order('name')

  // Fetch subscription details for navbar
  const subscriptionResult = await getSubscriptionStatus(supabase, user.id)
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
        <EventFormClient car={car} serviceTypes={serviceTypes || []} isPro={isPro} />
      </main>
    </div>
  )
}