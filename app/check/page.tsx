import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { getSubscriptionStatus, PLAN_LIMITS } from '@/utils/subscription'
import VinCheckClient from '@/components/VinCheckClient' // A lenti komponenst importáljuk

export const metadata = {
  title: 'VIN Kereső | DynamicSense',
  description: 'Ellenőrizd az autók előéletét.'
}

export default function VinCheckPage() {
  // Nincs user lekérdezés, nincs redirect, nincs subscription check.
  // Az oldal teljesen publikus.
  
  return (
    <VinCheckClient />
  )
}