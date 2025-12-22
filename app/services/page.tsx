import { createClient } from '@/supabase/server'
import ServiceMapWrapper from '@/components/ServiceMapWrapper'

export const dynamic = 'force-dynamic'

export default async function ServicesPage() {
    const supabase = await createClient()
    
    // Adatok lekérése
    const { data: { user } } = await supabase.auth.getUser()
    const { data: partners } = await supabase
        .from('service_partners')
        .select('*')
        .order('created_at', { ascending: false })
    
    return (
        <div className="relative h-screen w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
            {/* Itt már nincs a vissza gomb, a ServiceMapWrapper kezeli */}
            <ServiceMapWrapper initialPartners={partners || []} user={user} />
        </div>
    )
}