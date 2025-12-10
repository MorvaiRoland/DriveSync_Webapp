// components/MobileTabContainer.tsx
'use client'
import { useState } from 'react'

export default function MobileTabContainer({ tabOverview, tabServices, tabLog }: any) {
    const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'log'>('overview')

    return (
        <>
            {/* MOBIL TAB MENÜ */}
            <div className="md:hidden sticky top-0 z-30 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 border-b border-slate-200 dark:border-slate-800 mb-6 flex justify-between gap-2 overflow-x-auto no-scrollbar">
                <button onClick={() => setActiveTab('overview')} className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>Áttekintés</button>
                <button onClick={() => setActiveTab('services')} className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'services' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>Szolgáltatások</button>
                <button onClick={() => setActiveTab('log')} className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'log' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>Napló</button>
            </div>

            {/* MOBIL TARTALOM */}
            <div className="md:hidden">
                <div className={activeTab === 'overview' ? 'block animate-in fade-in' : 'hidden'}>{tabOverview}</div>
                <div className={activeTab === 'services' ? 'block animate-in fade-in' : 'hidden'}>{tabServices}</div>
                <div className={activeTab === 'log' ? 'block animate-in fade-in' : 'hidden'}>{tabLog}</div>
            </div>

            {/* DESKTOP TARTALOM */}
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-8">{tabOverview}</div>
                <div className="space-y-8">{tabServices}</div>
                <div className="space-y-8">{tabLog}</div>
            </div>
        </>
    )
}