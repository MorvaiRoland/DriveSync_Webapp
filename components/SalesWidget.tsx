'use client'

import { useState } from 'react'
import { Share2, Link as LinkIcon, Eye, EyeOff, Shield, Copy, Check } from 'lucide-react'
import { toggleSaleMode } from '@/app/cars/[id]/actions'
import { toast } from 'sonner'

export default function SalesWidget({ car }: { car: any }) {
    const [isSharing, setIsSharing] = useState(car.is_for_sale || false)
    const [copied, setCopied] = useState(false)

    // A teljes publikus link
    const shareUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/share/${car.share_token}`
        : ''

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        toast.success('Link másolva a vágólapra!')
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900/50 flex justify-between items-center">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-indigo-500" />
                    Eladósorban Mód
                </h3>
                
                {/* Fő kapcsoló */}
                <form action={toggleSaleMode}>
                    <input type="hidden" name="car_id" value={car.id} />
                    <input type="hidden" name="enable" value={(!isSharing).toString()} />
                    {/* Megőrizzük a jelenlegi beállításokat kikapcsoláskor is */}
                    <input type="hidden" name="hide_prices" value={car.hide_prices ? 'on' : 'off'} />
                    <input type="hidden" name="hide_sensitive" value={car.hide_sensitive ? 'on' : 'off'} />
                    
                    <button 
                        type="submit"
                        onClick={() => setIsSharing(!isSharing)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isSharing ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isSharing ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </form>
            </div>

            <div className="p-5">
                {isSharing ? (
                    <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
                        
                        {/* Link másolás */}
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                                <LinkIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                <span className="text-xs text-indigo-700 dark:text-indigo-300 truncate font-mono">{shareUrl}</span>
                            </div>
                            <button onClick={handleCopy} className="p-1.5 bg-white dark:bg-slate-800 rounded-lg text-indigo-600 dark:text-indigo-400 shadow-sm hover:bg-indigo-50 transition-colors">
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Beállítások Form */}
                        <form action={toggleSaleMode} className="space-y-3">
                            <input type="hidden" name="car_id" value={car.id} />
                            <input type="hidden" name="enable" value="true" />
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <EyeOff className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Árak elrejtése</span>
                                </div>
                                <input type="checkbox" name="hide_prices" defaultChecked={car.hide_prices} onChange={(e) => e.target.form?.requestSubmit()} className="accent-indigo-600 w-4 h-4" />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Rendszám/VIN elrejtése</span>
                                </div>
                                <input type="checkbox" name="hide_sensitive" defaultChecked={car.hide_sensitive} onChange={(e) => e.target.form?.requestSubmit()} className="accent-indigo-600 w-4 h-4" />
                            </div>
                        </form>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                            <a href={`/share/${car.share_token}`} target="_blank" className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-colors">
                                <Eye className="w-4 h-4" /> Megtekintés vásárlóként
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-2">
                        <p className="text-sm text-slate-500 mb-2">Kapcsold be a megosztást, hogy generálj egy biztonságos linket a hirdetésedhez.</p>
                        <p className="text-xs text-slate-400">A látogatók nem látják a személyes adataidat, csak az autó történetét.</p>
                    </div>
                )}
            </div>
        </div>
    )
}