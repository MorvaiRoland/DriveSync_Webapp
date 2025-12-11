'use client'

import { useState } from 'react'
import { LayoutDashboard, Wrench, History } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion' // Opcionális: npm install framer-motion, ha nincs, sima div is jó

export default function MobileTabContainer({ 
  tabOverview, 
  tabServices, 
  tabLog 
}: { 
  tabOverview: React.ReactNode
  tabServices: React.ReactNode
  tabLog: React.ReactNode 
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'log'>('overview')

  const tabs = [
    { id: 'overview', label: 'Áttekintés', icon: LayoutDashboard },
    { id: 'services', label: 'Szerviz & Infó', icon: Wrench },
    { id: 'log', label: 'Napló & Stat', icon: History },
  ] as const

  return (
    <>
      {/* --- MOBILE STICKY TAB MENU --- */}
      <div className="md:hidden sticky top-[60px] z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 -mx-4 px-4 py-2 mb-6">
        <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* --- MOBILE CONTENT (ANIMATED) --- */}
      <div className="md:hidden min-h-[50vh]">
        {/* Ha nincs framer-motion, használd a sima div-et feltétellel */}
        {activeTab === 'overview' && <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">{tabOverview}</div>}
        {activeTab === 'services' && <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">{tabServices}</div>}
        {activeTab === 'log' && <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">{tabLog}</div>}
      </div>

      {/* --- DESKTOP GRID LAYOUT (3 COLUMNS) --- */}
      <div className="hidden md:grid grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Bal Oszlop: Fő infók */}
        <div className="col-span-12 lg:col-span-4 space-y-6 lg:space-y-8">
           {tabOverview}
        </div>

        {/* Középső Oszlop: Műszaki & Dokumentumok */}
        <div className="col-span-12 lg:col-span-4 space-y-6 lg:space-y-8">
           {tabServices}
        </div>

        {/* Jobb Oszlop: Történet & Statisztika */}
        <div className="col-span-12 lg:col-span-4 space-y-6 lg:space-y-8">
           {tabLog}
        </div>
      </div>
    </>
  )
}