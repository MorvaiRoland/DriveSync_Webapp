import { createClient } from '@/supabase/server'
import ServiceMapWrapper from '@/components/ServiceMapWrapper'
import { redirect } from 'next/navigation'
import { getSubscriptionStatus, PLAN_LIMITS } from '@/utils/subscription'
import { AuroraBackground, DashboardNav, BottomNav } from '@/components/SharedNavigation'
import { signOut } from '@/app/login/action'

export const runtime = 'edge'
export const preferredRegion = 'lhr1'

export const metadata = {
  title: 'Szerviz Térkép | DynamicSense',
  description: 'Megbízható partnerek és szervizek a közeledben.'
}

export default async function ServicesPage() {
  const supabase = await createClient()
  
  // 1. Check user auth
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return redirect('/login')
  }

  // 2. Permission Check (Server-side gatekeeping)
  const subscriptionResult = await getSubscriptionStatus(supabase, user.id)
  const { plan, isTrial } = subscriptionResult
  const limits = PLAN_LIMITS[plan]

  if (!limits.serviceMap) {
    return redirect('/pricing')
  }

  // 3. Fetch partners
  const { data: partners } = await supabase
    .from('service_partners')
    .select('*')
    .order('created_at', { ascending: false })
  
  const isPro = limits.aiMechanic
  const displayName = user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0]

  return (
    <div className="h-screen w-full flex flex-col bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-700 relative overflow-hidden">
      <AuroraBackground />
      
      {/* Navigation */}
      <DashboardNav userName={displayName} plan={plan} isTrial={isTrial} isPro={isPro} signOutAction={signOut} />
      <BottomNav isPro={isPro} />

      {/* Map Content Viewport */}
      <main className="flex-1 relative z-10 w-full overflow-hidden pt-[calc(max(0.75rem, env(safe-area-inset-top)) + 4.5rem)] pb-[max(0px, env(safe-area-inset-bottom)) + 4.5rem] md:pb-0">
        <ServiceMapWrapper initialPartners={partners || []} user={user} />
      </main>
    </div>
  )
}