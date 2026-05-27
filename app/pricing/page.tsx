import { createClient } from '@/supabase/server'
import PricingClient from './PricingClient'
import { getSubscriptionStatus, PLAN_LIMITS } from '@/utils/subscription'
import { signOut } from '@/app/login/action'

export const metadata = {
  title: 'Csomagok & Árazás | DynamicSense',
  description: 'Válaszd a garázsodhoz leginkább passzoló csomagot.'
}

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let plan: keyof typeof PLAN_LIMITS = 'free'
  let isTrial = false
  let isPro = false
  let displayName = ''

  if (user) {
    const subscriptionResult = await getSubscriptionStatus(supabase, user.id)
    plan = subscriptionResult.plan as keyof typeof PLAN_LIMITS
    isTrial = subscriptionResult.isTrial
    const limits = PLAN_LIMITS[plan]
    isPro = limits ? limits.aiMechanic : false
    displayName = user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0]
  }

  return (
    <PricingClient 
      initialPlan={plan} 
      userEmail={user?.email} 
      currentPlan={plan}
      userName={displayName}
      isTrial={isTrial}
      isPro={isPro}
      signOutAction={signOut}
    />
  )
}