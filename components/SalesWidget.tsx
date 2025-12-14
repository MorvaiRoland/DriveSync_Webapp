'use client'

import { useState, useEffect } from 'react'
import { Share2, Link as LinkIcon, Eye, EyeOff, Shield, Copy, Check, Store } from 'lucide-react'
import { toggleSaleMode } from '@/app/cars/[id]/actions'
import { toast } from 'sonner'

export default function SalesWidget({ car }: { car: any }) {
    const [isSharing, setIsSharing] = useState(car.is_for_sale || false)
    const [copied, setCopied] = useState(false)
    const [origin, setOrigin] = useState('')

    useEffect(() => {
        setOrigin(window.location.origin)
    }, [])

    const shareUrl = car.share_token ? `${origin}/share/${car.share_token}` : `${origin}/...`

    const handleCopy = () => {
        if (!car.share_token) {
            toast.error('A link generálása folyamatban...')
            return
        }
        navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        toast.success('Link másolva a vágólapra!')
        setTimeout(() => setCopied(false), 2000)
    }

    // --- EZ AZ ÚJ RÉSZ (Wrapper függvény) ---
    // Ez kezeli a Server Action hívását és a visszajelzést
    const handleFormAction = async (formData: FormData) => {
        // Optimista UI frissítés vagy Loading jelző itt lenne (opcionális)
        
        // 1. Meghívjuk a szerver akciót
        const result = await toggleSaleMode(formData)

        // 2. Kezeljük az eredményt
        if (result.success) {
            toast.success('Beállítások sikeresen mentve!')
        } else {
            toast.error('Hiba történt a mentéskor.')
            console.error(result.error)
            // Itt esetleg visszaállíthatnád a switch-et, ha hiba volt
        }
    }

    const handleAutoSave = (e: React.ChangeEvent<HTMLFormElement>) => {
        // Ez a requestSubmit fogja meghívni a fenti handleFormAction-t
        e.currentTarget.requestSubmit()
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
             {/* ... Fejléc változatlan ... */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900/50 flex justify-between items-center">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-indigo-500" />
                    Eladás & Megosztás
                </h3>
            </div>

            <div className="p-5">
                {/* JAVÍTÁS: Itt cseréltük le a toggleSaleMode-ot handleFormAction-re.
                    Így a TypeScript boldog lesz, mert ez egy helyi függvény.
                */}
                <form action={handleFormAction} onChange={handleAutoSave} className="space-y-6">
                    <input type="hidden" name="car_id" value={car.id} />
                    
                    {/* ... A többi rész változatlan ... */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div>
                            <span className="font-semibold text-slate-900 dark:text-white block">Eladósorban mód</span>
                            <span className="text-xs text-slate-500">Publikus link generálása</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="enable" 
                                value="true"
                                checked={isSharing} 
                                onChange={(e) => setIsSharing(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    {isSharing && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
                            {/* ... A belső tartalom változatlan ... */}
                            {/* Link másoló mező */}
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                                    <LinkIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                    <span className="text-xs text-indigo-700 dark:text-indigo-300 truncate font-mono select-all">
                                        {car.share_token ? shareUrl : 'Token generálása...'}
                                    </span>
                                </div>
                                <button type="button" onClick={handleCopy} className="p-1.5 bg-white dark:bg-slate-800 rounded-lg text-indigo-600 dark:text-indigo-400 shadow-sm hover:bg-indigo-50 transition-colors flex-shrink-0">
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="space-y-3 pt-2">
                                {/* Marketplace Toggle */}
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-500">
                                            <Store className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 block">
                                                DynamicSense Marketplace
                                            </span>
                                            <span className="text-[10px] text-slate-400 block">
                                                Megjelenés a főoldali listában
                                            </span>
                                        </div>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        name="listed_on_marketplace" 
                                        defaultChecked={car.is_listed_on_marketplace} 
                                        className="accent-amber-500 w-4 h-4 rounded border-slate-300" 
                                    />
                                </div>

                                {/* Egyéb beállítások */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <EyeOff className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Ár elrejtése</span>
                                    </div>
                                    <input type="checkbox" name="hide_prices" defaultChecked={car.hide_prices} className="accent-indigo-600 w-4 h-4 rounded border-slate-300" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Rendszám/VIN elrejtése</span>
                                    </div>
                                    <input type="checkbox" name="hide_sensitive" defaultChecked={car.hide_sensitive} className="accent-indigo-600 w-4 h-4 rounded border-slate-300" />
                                </div>
                            </div>

                            {/* Előnézet gomb */}
                            {car.share_token && (
                                <div className="pt-2">
                                    <a href={`/share/${car.share_token}`} target="_blank" className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-colors">
                                        <Eye className="w-4 h-4" /> Hirdetés megtekintése
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}