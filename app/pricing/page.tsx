// app/pricing/page.tsx
import { createClient } from '@/supabase/server'
import PricingClient from './PricingClient'
import { getSubscriptionStatus } from '@/utils/subscription'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Lekérjük az aktuális csomagot
  const { plan } = await getSubscriptionStatus(supabase, user?.id || '')

  return (
    <PricingClient 
        initialPlan={plan} 
        userEmail={user?.email} 
        currentPlan={plan} // <--- EZT ADJUK HOZZÁ
    />
  )
}