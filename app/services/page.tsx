import { createClient } from '@/supabase/server'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Dinamikus import SSR kikapcsolásával, mert a Leaflet ablakot (window) használ
const ServiceMap = dynamic(() => import('@/components/ServiceMap'), { 
    ssr: false,
    loading: () => <div className="w-full h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><p className="text-xl font-bold animate-pulse text-slate-400">Térkép betöltése...</p></div>
})

export default async function ServicesPage() {
    const supabase = await createClient()
    
    // Felhasználó lekérése (hogy tudjon saját szervizt hozzáadni)
    const { data: { user } } = await supabase.auth.getUser()

    // Partnerek lekérése
    const { data: partners } = await supabase
        .from('service_partners')
        .select('*')
    
    return (
        <div className="relative h-screen w-full overflow-hidden">
            {/* Vissza gomb a Dashboardra, lebegve a térkép felett */}
            <div className="absolute top-4 left-4 z-[9999]">
                <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform font-bold text-sm">
                    <ArrowLeft className="w-4 h-4" /> Vissza a Dashboardra
                </Link>
            </div>

            <ServiceMap initialPartners={partners || []} user={user} />
        </div>
    )
}