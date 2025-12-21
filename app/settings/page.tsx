import { createClient } from '@/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ServiceMapWrapper from '@/components/ServiceMapWrapper' // <--- Az új wrappert importáljuk simán

export default async function ServicesPage() {
    const supabase = await createClient()
    
    // Felhasználó lekérése
    const { data: { user } } = await supabase.auth.getUser()

    // Partnerek lekérése
    const { data: partners } = await supabase
        .from('service_partners')
        .select('*')
    
    return (
        <div className="relative h-screen w-full overflow-hidden">
            {/* Vissza gomb */}
            <div className="absolute top-4 left-4 z-[9999]">
                <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform font-bold text-sm">
                    <ArrowLeft className="w-4 h-4" /> Vissza a Dashboardra
                </Link>
            </div>

            {/* Itt hívjuk meg a wrappert, ami majd betölti a térképet */}
            <ServiceMapWrapper initialPartners={partners || []} user={user} />
        </div>
    )
}