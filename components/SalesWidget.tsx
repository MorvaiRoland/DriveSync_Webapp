'use client'

import { useState, useEffect } from 'react'
import { 
  Share2, Link as LinkIcon, Eye, EyeOff, Shield, Copy, Check, Store, 
  MapPin, Phone, Banknote, RefreshCcw, FileText, Save 
} from 'lucide-react'
import { toggleSaleMode } from '@/app/cars/[id]/actions'
import { toast } from 'sonner'

export default function SalesWidget({ car }: { car: any }) {
    // Állapotok
    const [isSharing, setIsSharing] = useState(car.is_for_sale || false)
    const [copied, setCopied] = useState(false)
    const [origin, setOrigin] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    // Form állapotok (hogy gépelés közben ne frissüljön állandóan a szerver)
    // Csak a szöveges mezőkhöz használjuk
    const [formData, setFormData] = useState({
        price: car.price || '',
        location: car.location || '',
        seller_phone: car.seller_phone || '',
        description: car.description || ''
    })

    useEffect(() => {
        setOrigin(window.location.origin)
    }, [])

    const shareUrl = car.share_token ? `${origin}/share/${car.share_token}` : 'Link generálása...'

    // Link másolása
    const handleCopy = () => {
        if (!car.share_token) {
            toast.error('Mentsd el a beállításokat a link generálásához!')
            return
        }
        navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        toast.success('Link másolva!')
        setTimeout(() => setCopied(false), 2000)
    }

    // Fő műveletkezelő
    const handleFormAction = async (formDataPayload: FormData) => {
        setIsSaving(true)
        const result = await toggleSaleMode(formDataPayload)
        setIsSaving(false)

        if (result.success) {
            toast.success('Hirdetés frissítve!')
        } else {
            toast.error('Hiba történt a mentéskor.')
        }
    }

    // Automatikus mentés (Checkboxokhoz)
    const handleAutoSave = (e: React.ChangeEvent<HTMLFormElement>) => {
        // Ha nem szöveges input változott, azonnal küldjük
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
            e.currentTarget.requestSubmit()
        }
    }

    // Input változások kezelése (lokális state)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Fejléc */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900/50 flex justify-between items-center">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-indigo-500" />
                    Hirdetés kezelése
                </h3>
                {isSaving && <span className="text-xs text-indigo-500 animate-pulse">Mentés...</span>}
            </div>

            <div className="p-5">
                <form action={handleFormAction} onChange={handleAutoSave} className="space-y-6">
                    <input type="hidden" name="car_id" value={car.id} />
                    
                    {/* 1. FŐKAPCSOLÓ */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors hover:border-indigo-200 dark:hover:border-indigo-800">
                        <div>
                            <span className="font-bold text-slate-900 dark:text-white block text-lg">Eladósorban</span>
                            <span className="text-xs text-slate-500">Hirdetés aktiválása és link generálás</span>
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
                            <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    {isSharing && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                            
                            {/* 2. RÉSZLETEK - GRID ELRENDEZÉS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Ár megadása */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                                        <Banknote className="w-3 h-3" /> Eladási ár (Ft)
                                    </label>
                                    <input 
                                        type="number" 
                                        name="price" 
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="pl. 4 500 000"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                                    />
                                </div>

                                {/* Helyszín */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Megtekinthető itt
                                    </label>
                                    <input 
                                        type="text" 
                                        name="location" 
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="pl. Budapest, XI. kerület"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                {/* Telefonszám */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> Telefonszám
                                    </label>
                                    <input 
                                        type="text" 
                                        name="seller_phone" 
                                        value={formData.seller_phone}
                                        onChange={handleInputChange}
                                        placeholder="+36 30 123 4567"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                {/* Csere opció */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 h-full">
                                    <div className="flex items-center gap-2">
                                        <RefreshCcw className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-medium">Csere érdekel?</span>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        name="exchange_possible" 
                                        defaultChecked={car.exchange_possible} 
                                        className="accent-indigo-600 w-5 h-5 rounded border-slate-300" 
                                    />
                                </div>
                            </div>

                            {/* Leírás */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> Hirdetés leírása
                                </label>
                                <textarea 
                                    name="description" 
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Írj le mindent, ami fontos: állapot, szerviztörténet, extrák..."
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm"
                                ></textarea>
                            </div>

                            {/* 3. BEÁLLÍTÁSOK ÉS VÉDELEM */}
                            <div className="bg-slate-50 dark:bg-slate-900/30 rounded-xl p-4 space-y-3 border border-slate-100 dark:border-slate-700/50">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Megjelenítési beállítások</h4>
                                
                                {/* Marketplace */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Store className="w-4 h-4 text-amber-500" />
                                        <div>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">DynamicSense Piactér</span>
                                            <span className="text-[10px] text-slate-400 block">Megjelenés a főoldalon a közösség számára</span>
                                        </div>
                                    </div>
                                    <input type="checkbox" name="listed_on_marketplace" defaultChecked={car.is_listed_on_marketplace} className="accent-amber-500 w-4 h-4 rounded" />
                                </div>

                                <div className="h-px bg-slate-200 dark:bg-slate-700/50 my-2"></div>

                                {/* Privacy */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <EyeOff className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Ár elrejtése (Csak hívásra)</span>
                                    </div>
                                    <input type="checkbox" name="hide_prices" defaultChecked={car.hide_prices} className="accent-indigo-600 w-4 h-4 rounded" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Rendszám/VIN elrejtése</span>
                                    </div>
                                    <input type="checkbox" name="hide_sensitive" defaultChecked={car.hide_sensitive} className="accent-indigo-600 w-4 h-4 rounded" />
                                </div>
                            </div>

                            {/* Mentés Gomb - Fontos a szöveges adatokhoz */}
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                <Save className="w-4 h-4" /> 
                                {isSaving ? 'Mentés folyamatban...' : 'Hirdetés frissítése'}
                            </button>

                            {/* Link Megosztás */}
                            {car.share_token && (
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-3">
                                    <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <LinkIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <span className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate flex-grow">
                                            {shareUrl}
                                        </span>
                                        <button 
                                            type="button" 
                                            onClick={handleCopy} 
                                            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md text-slate-500 transition-colors"
                                            title="Link másolása"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    
                                    <a href={`/share/${car.share_token}`} target="_blank" className="flex items-center justify-center gap-2 w-full py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-colors">
                                        <Eye className="w-4 h-4" /> Publikus nézet ellenőrzése
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