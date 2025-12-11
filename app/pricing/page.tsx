import { createClient } from '@/supabase/server'
import PricingClient from './PricingClient' // Ezt mindjárt létrehozzuk!

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentPlan = 'free'

  if (user) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status, plan_type')
      .eq('user_id', user.id)
      .single()
    
    if (sub && (sub.status === 'active' || sub.status === 'trialing')) {
        currentPlan = sub.plan_type
    }
  }

  // Átadjuk a szerver oldali adatot a kliens komponensnek
  return <PricingClient initialPlan={currentPlan} />
}