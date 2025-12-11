'use client'

import { useState } from 'react'
import { LayoutDashboard, Wrench, History } from 'lucide-react'

// Típus definíció a biztonságos kódhoz (ts-ignore helyett)
type TabId = 'overview' | 'services' | 'log';

export default function ResponsiveDashboard({ 
  mobileTabs,
  desktopContent 
}: { 
  mobileTabs: {
    overview: React.ReactNode,
    services: React.ReactNode,
    log: React.ReactNode
  },
  desktopContent: React.ReactNode
}) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const tabs = [
    { id: 'overview' as TabId, label: 'Áttekintés', icon: LayoutDashboard },
    { id: 'services' as TabId, label: 'Szerviz & Infó', icon: Wrench },
    { id: 'log' as TabId, label: 'Napló & Stat', icon: History },
  ] as const

  return (
    <>
      {/* --- MOBILE VIEW (Tabbed) --- */}
      <div className="md:hidden">
        
        {/* Modern Sticky Navigation Bar */}
        <div className="sticky top-0 z-50 -mx-4 mb-6">
            {/* Blurry Backdrop Container */}
            <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                <div className="flex p-1.5 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl border border-white/10 dark:border-white/5">
                    {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    
                    return (
                        <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            relative flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ease-out
                            ${isActive 
                                ? 'text-indigo-600 dark:text-white shadow-md bg-white dark:bg-slate-800 ring-1 ring-black/5 dark:ring-white/10' 
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-white/5'
                            }
                        `}
                        >
                        {/* Ikon animáció és stílus */}
                        <Icon 
                            className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110 stroke-[2.5px]' : 'scale-100'}`} 
                        />
                        <span className="relative z-10">{tab.label}</span>
                        
                        {/* Aktív állapot jelző pötty (opcionális design elem) */}
                        {isActive && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full opacity-0"></span>
                        )}
                        </button>
                    )
                    })}
                </div>
            </div>
        </div>

        {/* Mobile Content with Fade Effect */}
        <div className="min-h-[50vh] pb-32 px-1">
            <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-forwards">
                {activeTab === 'overview' && <div className="space-y-6">{mobileTabs.overview}</div>}
                {activeTab === 'services' && <div className="space-y-6">{mobileTabs.services}</div>}
                {activeTab === 'log' && <div className="space-y-6">{mobileTabs.log}</div>}
            </div>
        </div>
      </div>

      {/* --- DESKTOP VIEW --- */}
      <div className="hidden md:block animate-in fade-in duration-700">
        {desktopContent}
      </div>
    </>
  )
}