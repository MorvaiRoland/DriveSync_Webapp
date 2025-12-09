// components/ServiceHistoryList.tsx
'use client'

import { useState } from 'react'

export default function ServiceHistoryList({ events }: { events: any[] }) {
  // Nyomon követjük, melyik elem van éppen lenyitva (id alapján)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (!events || events.length === 0) {
    return <p className="text-center text-slate-400 italic py-4">Nincs rögzített adat.</p>
  }

  return (
    <div className="space-y-2">
      {events.map((event) => {
        const isExpanded = expandedId === event.id
        
        return (
          <div 
            key={event.id} 
            className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                isExpanded ? 'border-amber-400 shadow-md bg-white' : 'border-slate-100 hover:border-slate-300 bg-white'
            }`}
          >
            {/* --- KATTINTHATÓ FEJLÉC --- */}
            <div 
                onClick={() => toggleExpand(event.id)}
                className="flex justify-between items-center p-4 cursor-pointer select-none"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        event.type === 'service' ? 'bg-blue-100 text-blue-600' :
                        event.type === 'repair' ? 'bg-red-100 text-red-600' :
                        'bg-slate-100 text-slate-600'
                    }`}>
                        {event.type === 'service' ? '🔧' : event.type === 'repair' ? '🛠️' : '📋'}
                    </div>
                    <div>
                        <p className="font-bold text-slate-800 text-sm md:text-base">{event.title || 'Szerviz Bejegyzés'}</p>
                        <p className="text-xs text-slate-500 uppercase font-bold">
                            {new Date(event.event_date).toLocaleDateString('hu-HU')}
                        </p>
                    </div>
                </div>
                
                <div className="text-right flex items-center gap-3">
                     <div className="hidden sm:block">
                        <p className="text-sm font-bold text-slate-700">{event.mileage ? `${event.mileage.toLocaleString()} km` : ''}</p>
                     </div>
                     {/* Nyíl ikon, ami forog ha le van nyitva */}
                     <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                     </svg>
                </div>
            </div>

            {/* --- LENYÍLÓ RÉSZLETEK --- */}
            <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-sm text-slate-700 space-y-4">
                    
                    {/* Részletes adatok rács */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Költség</p>
                            <p className="font-mono font-bold text-slate-900">{event.cost ? `${event.cost.toLocaleString()} Ft` : 'Ingyenes / Nincs megadva'}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Km óra állás</p>
                            <p className="font-mono font-bold text-slate-900">{event.mileage ? `${event.mileage.toLocaleString()} km` : '-'}</p>
                        </div>
                    </div>

                    {/* Leírás / Megjegyzés */}
                    {event.notes && (
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                                Megjegyzés / Leírás
                            </p>
                            <p className="bg-white p-3 rounded-lg border border-slate-200 leading-relaxed italic text-slate-600">
                                "{event.notes}"
                            </p>
                        </div>
                    )}

                    {/* Helyszín */}
                    {event.location && (
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Szerviz Helyszíne
                            </p>
                            <p className="font-medium text-slate-800 pl-1">{event.location}</p>
                        </div>
                    )}

                    <div className="text-[10px] text-slate-400 text-right pt-2">
                        Esemény ID: #{event.id.slice(0, 8)}
                    </div>
                </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}