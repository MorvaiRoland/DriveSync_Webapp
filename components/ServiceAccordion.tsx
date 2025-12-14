'use client'

import { useState } from 'react'
import { ChevronDown, MapPin, FileText, Banknote } from 'lucide-react'

// Pénznem formázó
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(price)
}

export default function ServiceAccordion({ events, hidePrices, hideServiceCosts }: any) {
    // Melyik elem van nyitva? (null = egyik sem)
    const [openId, setOpenId] = useState<string | null>(null)

    const toggle = (id: string) => {
        setOpenId(openId === id ? null : id)
    }

    if (!events || events.length === 0) {
        return <div className="pl-8 text-slate-500 italic">Nincs rögzített publikus esemény.</div>
    }

    return (
        <div className="space-y-4 relative border-l border-white/10 ml-3 pb-2">
            {events.map((ev: any) => {
                const isOpen = openId === ev.id
                
                return (
                    <div key={ev.id} className="relative pl-8 group">
                        
                        {/* Pötty a vonalon */}
                        <div className={`absolute -left-[5px] top-6 w-[11px] h-[11px] rounded-full border-2 border-[#0B0F19] z-10 transition-colors duration-300
                            ${isOpen 
                                ? 'bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.6)]' 
                                : (ev.type === 'service' ? 'bg-indigo-600' : 'bg-slate-600')
                            }`}>
                        </div>

                        {/* Kártya */}
                        <div 
                            onClick={() => toggle(ev.id)}
                            className={`rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
                                ${isOpen 
                                    ? 'bg-white/10 border-white/20 shadow-lg' 
                                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                                }`
                            }
                        >
                            {/* Fejléc (Mindig látható) */}
                            <div className="p-5 flex items-center justify-between">
                                <div>
                                    <h4 className={`font-bold text-lg transition-colors ${isOpen ? 'text-white' : 'text-slate-200'}`}>
                                        {ev.title}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-mono uppercase tracking-wide">
                                        <span>{new Date(ev.event_date).toLocaleDateString('hu-HU')}</span>
                                        <span>•</span>
                                        <span>{ev.mileage.toLocaleString()} km</span>
                                    </div>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                            </div>

                            {/* Lenyíló Tartalom */}
                            <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                <div className="overflow-hidden">
                                    <div className="px-5 pb-5 pt-0 space-y-4 text-sm">
                                        
                                        {/* Elválasztó vonal */}
                                        <div className="h-px bg-white/10 w-full mb-4"></div>

                                        {/* Leírás */}
                                        {ev.description && (
                                            <div className="flex gap-3 text-slate-300">
                                                <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                                                <p className="leading-relaxed whitespace-pre-wrap">{ev.description}</p>
                                            </div>
                                        )}

                                        {/* Helyszín */}
                                        {ev.location && (
                                            <div className="flex gap-3 text-slate-400">
                                                <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                                <span>{ev.location}</span>
                                            </div>
                                        )}

                                        {/* Költség (Ha publikus) */}
                                        {!hidePrices && !hideServiceCosts && ev.cost > 0 && (
                                            <div className="flex gap-3 text-emerald-400 font-bold mt-2">
                                                <Banknote className="w-4 h-4 flex-shrink-0" />
                                                <span>{formatPrice(ev.cost)}</span>
                                            </div>
                                        )}

                                        {/* Ha nincs semmi extra adat */}
                                        {!ev.description && !ev.location && (!ev.cost || hidePrices || hideServiceCosts) && (
                                            <p className="text-slate-500 italic text-xs">Nincs további részlet rögzítve.</p>
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