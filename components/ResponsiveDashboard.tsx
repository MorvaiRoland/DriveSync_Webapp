'use client'

import { useState } from 'react'
import { LayoutDashboard, Wrench, History } from 'lucide-react'

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
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'log'>('overview')

  const tabs = [
    { id: 'overview', label: 'Áttekintés', icon: LayoutDashboard },
    { id: 'services', label: 'Szerviz & Infó', icon: Wrench },
    { id: 'log', label: 'Napló & Stat', icon: History },
  ] as const

  return (
    <>
      {/* --- MOBILE VIEW (Tabbed) --- */}
      <div className="md:hidden">
        {/* Sticky Menu - Javítva: top-0 és erősebb háttér */}
        <div className="sticky top-0 z-50 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 -mx-4 px-4 py-3 mb-6 shadow-sm transition-all">
          <div className="flex p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon
              // @ts-ignore
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  // @ts-ignore
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md transform scale-[1.02]'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Mobile Content */}
        <div className="min-h-[50vh] animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
          {activeTab === 'overview' && <div className="space-y-6">{mobileTabs.overview}</div>}
          {activeTab === 'services' && <div className="space-y-6">{mobileTabs.services}</div>}
          {activeTab === 'log' && <div className="space-y-6">{mobileTabs.log}</div>}
        </div>
      </div>

      {/* --- DESKTOP VIEW --- */}
      <div className="hidden md:block">
        {desktopContent}
      </div>
    </>
  )
}