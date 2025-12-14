'use client'

import { useState, useEffect, useTransition } from 'react'
import { 
  Share2, Link as LinkIcon, Eye, EyeOff, Shield, Copy, Check, Store, 
  MapPin, Phone, Banknote, RefreshCcw, FileText, Save, Loader2,
  Image as ImageIcon, X, UploadCloud, Wrench // ÚJ ikonok
} from 'lucide-react'
import { toggleSaleMode } from '@/app/cars/[id]/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Image from 'next/image' // Next.js Image komponens az előnézethez

export default function SalesWidget({ car }: { car: any }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // --- ÁLLAPOTOK ---
    const [isForSale, setIsForSale] = useState(car.is_for_sale || false)
    const [shareToken, setShareToken] = useState(car.share_token || '')
    
    // ÚJ: Képek állapotai
    const [selectedImages, setSelectedImages] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])

    const [formData, setFormData] = useState({
        price: car.price || '',
        location: car.location || '',
        seller_phone: car.seller_phone || '',
        description: car.description || '',
        exchange_possible: car.exchange_possible || false,
        listed_on_marketplace: car.is_listed_on_marketplace || false,
        hide_prices: car.hide_prices || false,
        hide_sensitive: car.hide_sensitive || false,
        hide_service_costs: car.hide_service_costs || false // ÚJ mező
    })

    const [origin, setOrigin] = useState('')
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        setOrigin(window.location.origin)
    }, [])

    useEffect(() => {
        if (car.share_token) setShareToken(car.share_token)
    }, [car.share_token])

    // ÚJ: Takarítás (memória szivárgás elkerülése a preview URL-eknél)
    useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url))
        }
    }, [previews])

    const shareUrl = shareToken ? `${origin}/share/${shareToken}` : 'Link generálása...'

    // --- ÚJ: KÉPKEZELŐ FÜGGVÉNYEK ---
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files)
            
            // Új fájlok hozzáadása a meglévőkhöz
            setSelectedImages(prev => [...prev, ...filesArray])

            // Előnézeti URL-ek generálása
            const newPreviews = filesArray.map(file => URL.createObjectURL(file))
            setPreviews(prev => [...prev, ...newPreviews])
        }
    }

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index))
        setPreviews(prev => {
            // A törölt URL felszabadítása
            URL.revokeObjectURL(prev[index])
            return prev.filter((_, i) => i !== index)
        })
    }

    // --- MŰVELETEK ---

    const handleToggleSale = async (checked: boolean) => {
        setIsForSale(checked)
        
        const formDataPayload = new FormData()
        formDataPayload.append('car_id', car.id)
        formDataPayload.append('enable', checked.toString())
        
        Object.entries(formData).forEach(([key, value]) => {
            formDataPayload.append(key, value.toString())
        })

        startTransition(async () => {
            const result = await toggleSaleMode(formDataPayload)
            
            if (result.success) {
                toast.success(checked ? 'Hirdetés aktiválva!' : 'Hirdetés leállítva')
                router.refresh()
            } else {
                setIsForSale(!checked)
                toast.error('Hiba történt: ' + result.error)
            }
        })
    }

    const handleSaveDetails = async (e: React.FormEvent) => {
        e.preventDefault()
        
        const formDataPayload = new FormData()
        formDataPayload.append('car_id', car.id)
        formDataPayload.append('enable', isForSale.toString())
        
        formDataPayload.append('price', formData.price)
        formDataPayload.append('location', formData.location)
        formDataPayload.append('seller_phone', formData.seller_phone)
        formDataPayload.append('description', formData.description)
        
        if (formData.exchange_possible) formDataPayload.append('exchange_possible', 'on')
        if (formData.listed_on_marketplace) formDataPayload.append('listed_on_marketplace', 'on')
        if (formData.hide_prices) formDataPayload.append('hide_prices', 'on')
        if (formData.hide_sensitive) formDataPayload.append('hide_sensitive', 'on')
        // ÚJ: Szervizköltség
        if (formData.hide_service_costs) formDataPayload.append('hide_service_costs', 'on')

        // ÚJ: Képek csatolása
        selectedImages.forEach((file) => {
            formDataPayload.append('images', file) 
        })

        startTransition(async () => {
            const result = await toggleSaleMode(formDataPayload)
            if (result.success) {
                toast.success('Adatok és képek sikeresen mentve!')
                // Képek törlése mentés után, ha a szerver sikeresen feldolgozta
                setSelectedImages([])
                setPreviews([])
                router.refresh()
            } else {
                toast.error('Mentési hiba')
            }
        })
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.type === 'checkbox' 
            ? (e.target as HTMLInputElement).checked 
            : e.target.value
            
        setFormData(prev => ({ ...prev, [e.target.name]: value }))
    }

    const handleCopy = () => {
        if (!shareToken) return
        navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        toast.success('Link másolva!')
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900/50 flex justify-between items-center">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-indigo-500" />
                    Hirdetés kezelése
                </h3>
                {isPending && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
            </div>

            <div className="p-5">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors hover:border-indigo-200 dark:hover:border-indigo-800 mb-6">
                    <div>
                        <span className="font-bold text-slate-900 dark:text-white block text-lg">Eladósorban</span>
                        <span className="text-xs text-slate-500">
                            {isForSale ? 'A hirdetés aktív és elérhető.' : 'A hirdetés jelenleg inaktív.'}
                        </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={isForSale} 
                            onChange={(e) => handleToggleSale(e.target.checked)}
                            disabled={isPending}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                </div>

                {isForSale && (
                    <form onSubmit={handleSaveDetails} className="space-y-6 animate-in fade-in slide-in-from-top-2">
                        
                        {/* --- ÚJ: KÉPFELTÖLTÉS SZEKCIÓ --- */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> Fotók feltöltése
                            </label>
                            
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/50">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                    {/* Előnézeti képek */}
                                    {previews.map((src, idx) => (
                                        <div key={idx} className="relative aspect-video group">
                                            <img 
                                                src={src} 
                                                alt={`Preview ${idx}`} 
                                                className="w-full h-full object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {/* Feltöltés gomb */}
                                    <label className="cursor-pointer aspect-video flex flex-col items-center justify-center rounded-lg border border-indigo-200 dark:border-indigo-800/50 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                        <UploadCloud className="w-6 h-6 text-indigo-500 mb-1" />
                                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Képek kiválasztása</span>
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <p className="text-[10px] text-slate-400 text-center">
                                    Tölts fel több képet a jobb eladhatóság érdekében. (Max 5MB/kép)
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Helyszín
                                </label>
                                <input 
                                    type="text" 
                                    name="location" 
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="pl. Budapest"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> Telefonszám
                                </label>
                                <input 
                                    type="text" 
                                    name="seller_phone" 
                                    value={formData.seller_phone}
                                    onChange={handleInputChange}
                                    placeholder="+36 30..."
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 h-full">
                                <div className="flex items-center gap-2">
                                    <RefreshCcw className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium">Csere érdekel?</span>
                                </div>
                                <input 
                                    type="checkbox" 
                                    name="exchange_possible" 
                                    checked={formData.exchange_possible}
                                    onChange={handleInputChange}
                                    className="accent-indigo-600 w-5 h-5 rounded" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                                <FileText className="w-3 h-3" /> Leírás
                            </label>
                            <textarea 
                                name="description" 
                                rows={4}
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                            ></textarea>
                        </div>

                        {/* Beállítások */}
                        <div className="bg-slate-50 dark:bg-slate-900/30 rounded-xl p-4 space-y-3 border border-slate-100 dark:border-slate-700/50">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Megjelenítés</h4>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Store className="w-4 h-4 text-amber-500" />
                                    <div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">DynamicSense Piactér</span>
                                        <span className="text-[10px] text-slate-400 block">Megjelenés a főoldalon</span>
                                    </div>
                                </div>
                                <input 
                                    type="checkbox" 
                                    name="listed_on_marketplace" 
                                    checked={formData.listed_on_marketplace}
                                    onChange={handleInputChange}
                                    className="accent-amber-500 w-4 h-4 rounded" 
                                />
                            </div>

                            <div className="h-px bg-slate-200 dark:bg-slate-700/50 my-2"></div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <EyeOff className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Eladási ár elrejtése</span>
                                </div>
                                <input 
                                    type="checkbox" 
                                    name="hide_prices" 
                                    checked={formData.hide_prices}
                                    onChange={handleInputChange}
                                    className="accent-indigo-600 w-4 h-4 rounded" 
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Rendszám/VIN elrejtése</span>
                                </div>
                                <input 
                                    type="checkbox" 
                                    name="hide_sensitive" 
                                    checked={formData.hide_sensitive}
                                    onChange={handleInputChange}
                                    className="accent-indigo-600 w-4 h-4 rounded" 
                                />
                            </div>

                            {/* --- ÚJ: SZERVIZKÖLTSÉG ELREJTÉSE --- */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Wrench className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Szervizköltségek elrejtése</span>
                                </div>
                                <input 
                                    type="checkbox" 
                                    name="hide_service_costs" 
                                    checked={formData.hide_service_costs}
                                    onChange={handleInputChange}
                                    className="accent-indigo-600 w-4 h-4 rounded" 
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isPending}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isPending ? 'Mentés...' : 'Beállítások mentése'}
                        </button>

                        {shareToken && (
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
                                    >
                                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                
                                <a 
                                    href={`/share/${shareToken}`} 
                                    target="_blank" 
                                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-colors"
                                >
                                    <Eye className="w-4 h-4" /> Publikus nézet ellenőrzése
                                </a>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    )
}