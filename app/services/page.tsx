import { createClient } from '@/supabase/server'
import ServiceMapWrapper from '@/components/ServiceMapWrapper'
import { redirect } from 'next/navigation'
import { getSubscriptionStatus, PLAN_LIMITS } from '@/utils/subscription'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Szerviz Térkép | DynamicSense',
  description: 'Megbízható partnerek és szervizek a közeledben.'
}

export default async function ServicesPage() {
    const supabase = await createClient()
    
    // 1. Felhasználó ellenőrzése
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        return redirect('/login')
    }

    // 2. JOGOSULTSÁG ELLENŐRZÉS (SERVER SIDE GATEKEEPING)
    // Ha nincs benne a csomagban a térkép használata, visszadobjuk a fizetéshez
    const { plan } = await getSubscriptionStatus(supabase, user.id)
    const limits = PLAN_LIMITS[plan]

    if (!limits.serviceMap) {
        return redirect('/pricing')
    }

    // 3. Adatok lekérése (Csak ha van joga)
    const { data: partners } = await supabase
        .from('service_partners')
        .select('*')
        .order('created_at', { ascending: false })
    
    return (
        <div className="relative h-screen w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
            {/* A ServiceMapWrapper kezeli a térkép logikát és a vissza gombot is */}
            <ServiceMapWrapper initialPartners={partners || []} user={user} />
        </div>
    )
}