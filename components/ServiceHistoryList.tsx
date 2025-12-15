// components/ServiceHistoryList.tsx
'use client'

import { useState } from 'react'
import { Wrench, Calendar, Gauge, MapPin, ChevronDown, ChevronUp, FileText } from 'lucide-react'

export default function ServiceHistoryList({ events, hideCosts }: { events: any[], hideCosts: boolean }) {
  // State a lenyitott elem ID-jának tárolására
  const [openId, setOpenId] = useState<number | null>(null)

  const toggle = (id: number) => {
    setOpenId(openId === id ? null : id)
  }

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });

  if (events.length === 0) {
    return <p className="text-slate-500 italic text-center py-4">Nincs rögzített szerviztörténet.</p>
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const isOpen = openId === event.id;
        return (
          <div 
            key={event.id} 
            className={`border rounded-2xl transition-all duration-300 overflow-hidden ${isOpen ? 'border-indigo-500 bg-white dark:bg-slate-800 shadow-md' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-indigo-300'}`}
          >
            {/* FEJLÉC (Kattintható) */}
            <div 
              onClick={() => toggle(event.id)}
              className="p-4 cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full flex-shrink-0 ${isOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                    <Wrench className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                        {event.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {formatDate(event.event_date)}</span>
                        <span className="flex items-center gap-1"><Gauge className="w-3 h-3"/> {event.mileage.toLocaleString()} km</span>
                    </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                 {!hideCosts && event.cost > 0 && (
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 hidden sm:block">
                        {formatPrice(event.cost)}
                    </span>
                 )}
                 {isOpen ? <ChevronUp className="w-5 h-5 text-indigo-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
            </div>

            {/* LENYÍLÓ RÉSZLETEK */}
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-700/50 mt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            
                            {/* Leírás */}
                            <div className="col-span-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> Elvégzett munka / Megjegyzés
                                </p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {event.description || event.notes || "Nincs részletes leírás."}
                                </p>
                            </div>

                            {/* Helyszín (Ha van) */}
                            {event.location && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span>Szerviz: <strong>{event.location}</strong></span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}