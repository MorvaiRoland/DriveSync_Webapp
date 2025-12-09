// components/ServiceHistoryList.tsx
'use client'

import { useState } from 'react'

export default function ServiceHistoryList({ events }: { events: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (!events || events.length === 0) {
    return (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-400 italic">Ehhez a járműhöz még nincs feltöltve digitális szerviztörténet.</p>
        </div>
    )
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const isExpanded = expandedId === event.id
        
        // JAVÍTÁS: Biztonságos ID kezelés (String-gé alakítjuk, ha nem az)
        const safeId = event.id ? String(event.id) : 'N/A';
        const displayId = safeId.length > 8 ? safeId.slice(0, 8) : safeId;

        return (
          <div 
            key={event.id} 
            className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                isExpanded ? 'border-amber-500 ring-1 ring-amber-500 shadow-lg bg-white' : 'border-slate-200 hover:border-amber-300 bg-white'
            }`}
          >
            {/* FEJLÉC */}
            <div 
                onClick={() => toggleExpand(event.id)}
                className="flex justify-between items-center p-4 cursor-pointer select-none"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm ${
                        event.type === 'service' ? 'bg-blue-50 text-blue-600' :
                        event.type === 'repair' ? 'bg-red-50 text-red-600' :
                        'bg-slate-50 text-slate-600'
                    }`}>
                        {event.type === 'service' ? '🔧' : event.type === 'repair' ? '🛠️' : '📋'}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 text-base">{event.title || 'Szerviz Bejegyzés'}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-bold uppercase tracking-wider">{new Date(event.event_date).toLocaleDateString('hu-HU')}</span>
                            {event.location && (
                                <>
                                    <span>•</span>
                                    <span className="truncate max-w-[100px] md:max-w-none">{event.location}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="text-right flex items-center gap-3">
                     {event.mileage && (
                         <div className="hidden sm:block bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">
                            {event.mileage.toLocaleString()} km
                         </div>
                     )}
                     <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isExpanded ? 'bg-amber-100 text-amber-600' : 'bg-transparent text-slate-400'}`}>
                         <svg className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                         </svg>
                     </div>
                </div>
            </div>

            {/* RÉSZLETEK */}
            <div className={`transition-all duration-300 ease-in-out bg-slate-50/50 ${isExpanded ? 'max-h-[500px] opacity-100 border-t border-slate-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-5 space-y-4 text-sm text-slate-700">
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Költség</p>
                            <p className="font-mono font-bold text-slate-900 text-lg">{event.cost ? `${event.cost.toLocaleString()} Ft` : '-'}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Km óra állás</p>
                            <p className="font-mono font-bold text-slate-900 text-lg">{event.mileage ? `${event.mileage.toLocaleString()} km` : '-'}</p>
                        </div>
                    </div>

                    {event.notes && (
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Részletek / Elvégzett munka
                            </p>
                            <div className="bg-white p-4 rounded-lg border border-slate-200 text-slate-700 leading-relaxed shadow-sm">
                                {event.notes}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-200/50">
                        <span>DriveSync Verified Entry</span>
                        <span className="font-mono">ID: #{displayId}</span>
                    </div>
                </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}