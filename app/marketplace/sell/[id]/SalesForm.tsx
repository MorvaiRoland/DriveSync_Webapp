// app/marketplace/sell/[id]/SalesForm.tsx
'use client'

import { useState, useTransition, useRef } from 'react'
import { Banknote, MapPin, Phone, FileText, UploadCloud, X, Save, Loader2, Store, EyeOff, Shield } from 'lucide-react'
import { publishListing } from './actions' // Ezt kell használnunk, amit előzőleg megírtunk
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function SalesForm({ car }: { car: any }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Form State
    const [price, setPrice] = useState(car.price || '')
    const [description, setDescription] = useState(car.description || '')
    const [phone, setPhone] = useState(car.contact_phone || car.seller_phone || '') // Kompatibilitás miatt
    const [location, setLocation] = useState(car.location || '')
    const [isPublic, setIsPublic] = useState(car.is_listed_on_marketplace || false)
    
    // Kép State
    const [selectedImages, setSelectedImages] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])

    // Képkezelés
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files)
            setSelectedImages(prev => [...prev, ...files])
            
            // Előnézetek
            const newPreviews = files.map(file => URL.createObjectURL(file))
            setPreviews(prev => [...prev, ...newPreviews])
        }
    }

    const removeImage = (index: number) => {
        URL.revokeObjectURL(previews[index])
        setPreviews(prev => prev.filter((_, i) => i !== index))
        setSelectedImages(prev => prev.filter((_, i) => i !== index))
    }

    // Submit kezelése
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append('car_id', car.id)
        formData.append('price', price.toString())
        formData.append('description', description)
        formData.append('contact_phone', phone)
        // Ha van location mező a DB-ben, azt is küldhetjük, de a 'publishListing' actiont frissíteni kell hozzá
        // formData.append('location', location) 
        
        if (isPublic) formData.append('is_public', 'on')

        // Képek csatolása (Ha az action támogatja - jelenleg a publishListing még nem, de hozzáadható)
        selectedImages.forEach((file) => {
            formData.append('images', file)
        })

        startTransition(async () => {
            // Itt hívjuk meg a Server Actiont
            // MEGJEGYZÉS: Győződj meg róla, hogy a 'publishListing' action visszatér valami eredménnyel (pl. { success: true })
            // Jelenleg redirectel, ami szintén jó, de kliens oldalon jobb kezelni a választ.
            
            await publishListing(formData) 
            // Mivel a publishListing redirectel, a toast lehet nem látszik, de a navigáció megtörténik.
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* ÁR BEVITEL */}
            <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                    <Banknote className="w-4 h-4" /> Eladási ár (HUF)
                </label>
                <div className="relative group">
                    <input 
                        type="number" 
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="pl. 4 500 000"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-5 pl-6 pr-6 text-2xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">Ft</div>
                </div>
            </div>

            {/* LEÍRÁS */}
            <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Részletes Leírás
                </label>
                <textarea 
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Írj az autó állapotáról, szervizeiről, extrákról..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-base text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all resize-none leading-relaxed"
                ></textarea>
            </div>

            {/* KAPCSOLAT & HELY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Telefonszám
                    </label>
                    <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+36 30 123 4567"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-5 font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    />
                </div>
                {/* Ha van location mező az adatbázisban */}
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Helyszín (Város)
                    </label>
                    <input 
                        type="text" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="pl. Budapest"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-5 font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* KÉPFELTÖLTÉS (Opcionális, ha a backend támogatja) */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                    <UploadCloud className="w-4 h-4" /> További Fotók
                </label>
                
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    {previews.map((src, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-900/10 flex flex-col items-center justify-center text-slate-400 transition-all group"
                    >
                        <UploadCloud className="w-8 h-8 mb-2 group-hover:text-amber-500" />
                        <span className="text-xs font-bold">Kép hozzáadása</span>
                    </button>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageChange} 
                />
            </div>

            {/* PUBLIKÁLÁS KAPCSOLÓ */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-amber-500/30 transition-colors" onClick={() => setIsPublic(!isPublic)}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isPublic ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                        <Store className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">Piactér Publikálás</h4>
                        <p className="text-sm text-slate-500">Jelenjen meg az autó a közösségi listában?</p>
                    </div>
                </div>
                
                <div className={`w-16 h-8 rounded-full p-1 transition-colors duration-300 ${isPublic ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                    <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isPublic ? 'translate-x-8' : 'translate-x-0'}`}></div>
                </div>
            </div>

            {/* MENTÉS GOMB */}
            <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-lg font-black py-5 rounded-2xl shadow-xl shadow-orange-500/20 transform hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
                {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                {isPublic ? 'Hirdetés Publikálása' : 'Piszkozat Mentése'}
            </button>
            
            <p className="text-center text-xs text-slate-400 font-medium">
                A "Publikálás" gomb megnyomásával elfogadod a felhasználási feltételeket.
            </p>
        </form>
    )
}