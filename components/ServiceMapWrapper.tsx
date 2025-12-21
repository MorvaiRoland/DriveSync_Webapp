'use client'

import dynamic from 'next/dynamic'

// Itt végezzük a dinamikus importot, Client oldalon
const ServiceMap = dynamic(() => import('./ServiceMap'), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <p className="text-xl font-bold animate-pulse text-slate-400">Térkép betöltése...</p>
        </div>
    )
})

export default function ServiceMapWrapper({ initialPartners, user }: { initialPartners: any[], user: any }) {
    return <ServiceMap initialPartners={initialPartners} user={user} />
}