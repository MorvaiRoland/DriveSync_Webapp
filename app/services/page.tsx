import { createClient } from '@/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ServiceMapWrapper from '@/components/ServiceMapWrapper'

export const dynamic = 'force-dynamic' // Mindig friss adatot kérjen

export default async function ServicesPage() {
    const supabase = await createClient()
    
    // Felhasználó lekérése
    const { data: { user } } = await supabase.auth.getUser()

    // Partnerek lekérése
    const { data: partners } = await supabase
        .from('service_partners')
        .select('*')
        .order('created_at', { ascending: false }) // Legújabbak elöl
    
    return (
        <div className="relative h-screen w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
            {/* Abszolút pozícionált Vissza gomb (iOS Glass style) */}
            <div className="absolute top-6 left-6 z-[9999]">
                <Link 
                    href="/" 
                    className="group flex items-center gap-2 px-5 py-3 
                    bg-white/60 dark:bg-black/40 backdrop-blur-xl 
                    border border-white/40 dark:border-white/10
                    text-slate-900 dark:text-white rounded-full 
                    shadow-lg hover:shadow-2xl hover:scale-105 
                    transition-all duration-300 ease-out"
                >
                    <div className="bg-white dark:bg-white/20 p-1.5 rounded-full group-hover:-translate-x-1 transition-transform">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm tracking-wide">Vissza a Dashboardra</span>
                </Link>
            </div>

            {/* Térkép Wrapper */}
            <ServiceMapWrapper initialPartners={partners || []} user={user} />
        </div>
    )
}