import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { getSubscriptionStatus, PLAN_LIMITS } from '@/utils/subscription'
import VinCheckClient from '@/components/VinCheckClient' // A lenti komponenst importáljuk

export const metadata = {
  title: 'VIN Kereső | DynamicSense',
  description: 'Ellenőrizd az autók előéletét.'
}

export default async function VinCheckPage() {
  const supabase = await createClient()
  
  // 1. Bejelentkezés ellenőrzése
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  // 2. JOGOSULTSÁG ELLENŐRZÉS (SERVER SIDE)
  // Itt dől el, hogy betölt-e az oldal.
  const { plan } = await getSubscriptionStatus(supabase, user.id)
  const limits = PLAN_LIMITS[plan]

  // Ha a csomagban nincs benne a VIN keresés (false), azonnal átirányítjuk
  if (!limits.vinSearch) {
     return redirect('/pricing') 
  }

  // 3. Ha minden oké, betöltjük a kliens komponenst
  return (
    <VinCheckClient />
  )
}