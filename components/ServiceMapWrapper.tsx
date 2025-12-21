'use client'

import dynamic from 'next/dynamic'

// Dinamikus import Client oldalon -> ÍGY HELYES
const ServiceMap = dynamic(() => import('./ServiceMap'), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xl font-bold text-slate-400">Térkép betöltése...</p>
            </div>
        </div>
    )
})

export default function ServiceMapWrapper({ initialPartners, user }: { initialPartners: any[], user: any }) {
    return <ServiceMap initialPartners={initialPartners} user={user} />
}