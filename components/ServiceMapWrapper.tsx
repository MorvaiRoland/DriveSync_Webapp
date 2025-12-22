'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const ServiceMap = dynamic(() => import('./ServiceMap'), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin relative z-10" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500 tracking-wider uppercase">Térkép betöltése...</p>
        </div>
    )
})

export default function ServiceMapWrapper(props: any) {
    return <ServiceMap {...props} />
}