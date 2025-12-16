'use client'

import { useState, useTransition, useRef } from 'react'
import { 
    Banknote, MapPin, Phone, FileText, UploadCloud, X, Save, 
    Loader2, Store, Check, Plus, Search, GripVertical, EyeOff 
} from 'lucide-react'
import { publishListing } from './actions'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr' // FONTOS: Ez kell a feltöltéshez!

// --- KONFIGURÁCIÓ: EXTRÁK LISTÁJA ---
const CAR_FEATURES = {
    "Biztonság": ["ABS (blokkolásgátló)", "ESP (menetstabilizátor)", "ASR (kipörgésgátló)", "ISOFIX rendszer", "Vezetőoldali légzsák", "Utasoldali légzsák", "Oldallégzsák", "Függönylégzsák", "Térdlégzsák", "Guminyomás-ellenőrző", "Sávtartó rendszer", "Holttér-figyelő", "Táblafelismerő"],
    "Kényelem": ["Automata klíma", "Digitális klíma", "Manuális klíma", "Tempomat", "Adaptív tempomat", "Ülésfűtés", "Üléshűtés/szellőztetés", "Masszírozós ülés", "Elektromos ablak elöl", "Elektromos ablak hátul", "Elektromos tükör", "Fűthető tükör", "Elektromos ülésállítás", "Memóriás vezetőülés", "Bőr belső", "Multikormány", "Keyless Go (kulcsnélküli indítás)"],
    "Multimédia / Navigáció": ["GPS Navigáció", "Bluetooth kihangosító", "Apple CarPlay", "Android Auto", "USB csatlakozó", "AUX csatlakozó", "Hi-Fi rendszer", "Érintőkijelző", "Digitális műszerfal"],
    "Vezetés támogató": ["Tolatóradar", "Tolatókamera", "360 fokos kamera", "Parkolóasszisztens", "Esőszenzor", "Automata fényszórókapcsolás", "Start-Stop rendszer", "Lejtmenet vezérlő", "Visszagurulás-gátló"],
    "Egyéb": ["Vonóhorog", "Tetőablak / Napfénytető", "Panorámatető", "Alufelni", "Metálfényezés", "Sötétített üvegek", "LED fényszóró", "Xenon fényszóró", "Mátrix LED fényszóró"]
}

export default function SalesForm({ car }: { car: any }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Form State
    const [price, setPrice] = useState(car.price || '')
    const [description, setDescription] = useState(car.description || '')
    const [phone, setPhone] = useState(car.contact_phone || car.seller_phone || '') 
    const [location, setLocation] = useState(car.location || '')
    
    // BEÁLLÍTÁSOK STATE
    const [isPublic, setIsPublic] = useState(car.is_listed_on_marketplace || false)
    const [hideServiceCosts, setHideServiceCosts] = useState(car.hide_service_costs || false)
    const [hidePrices, setHidePrices] = useState(car.hide_prices || false)

    // Extrák State
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>(car.features || [])
    const [featureSearch, setFeatureSearch] = useState('')

    // Kép State
    const [selectedImages, setSelectedImages] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    
    // Feltöltés státusz jelző
    const [uploadStatus, setUploadStatus] = useState<string | null>(null)

    // --- FÜGGVÉNYEK ---

    const toggleFeature = (feature: string) => {
        setSelectedFeatures(prev => 
            prev.includes(feature) 
                ? prev.filter(f => f !== feature) 
                : [...prev, feature]
        )
    }

    // Új képek hozzáadása a listához
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files)
            
            // Hozzáadjuk a meglévőkhöz
            setSelectedImages(prev => [...prev, ...files])
            
            // Létrehozzuk az előnézeti képeket
            const newPreviews = files.map(file => URL.createObjectURL(file))
            setPreviews(prev => [...prev, ...newPreviews])
            
            // Input mező törlése, hogy ugyanazt a fájlt újra ki lehessen választani ha kell
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    // Kép törlése a listából (Mielőtt feltöltenénk)
    const removeImage = (index: number) => {
        // Memória felszabadítása
        URL.revokeObjectURL(previews[index])
        
        // Eltávolítás a state-ből
        setPreviews(prev => prev.filter((_, i) => i !== index))
        setSelectedImages(prev => prev.filter((_, i) => i !== index))
    }

    // --- A FŐ LOGIKA: FELTÖLTÉS ÉS MENTÉS ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // 1. Státusz beállítása
        setUploadStatus('Képek előkészítése...')
        
        // Supabase kliens inicializálása (Kliens oldali)
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const uploadedUrls: string[] = []
        const BUCKET_NAME = 'car-images'

        // 2. Képek feltöltése egyesével (ha van kiválasztva)
        if (selectedImages.length > 0) {
            for (let i = 0; i < selectedImages.length; i++) {
                const file = selectedImages[i]
                setUploadStatus(`Kép feltöltése (${i + 1} / ${selectedImages.length})...`)

                // Fájlnév generálás: carID / timestamp-index.kiterjesztés
                const fileExt = file.name.split('.').pop()
                const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '')
                const fileName = `${car.id}/${Date.now()}-${i}.${fileExt}`

                // Feltöltés Supabase Storage-ba
                const { error: uploadError } = await supabase.storage
                    .from(BUCKET_NAME)
                    .upload(fileName, file)

                if (uploadError) {
                    console.error('Hiba a feltöltésnél:', uploadError)
                    alert(`Hiba a(z) ${file.name} feltöltésekor.`)
                    continue // Ha egy kép nem sikerül, a többit még megpróbáljuk
                }

                // Publikus URL lekérése
                const { data: { publicUrl } } = supabase.storage
                    .from(BUCKET_NAME)
                    .getPublicUrl(fileName)
                
                uploadedUrls.push(publicUrl)
            }
        }

        // 3. Adatok elküldése a szervernek (Actions)
        setUploadStatus('Adatok mentése...')

        const formData = new FormData()
        
        // Szöveges adatok
        formData.append('car_id', car.id)
        formData.append('price', price.toString())
        formData.append('description', description)
        formData.append('contact_phone', phone)
        formData.append('location', location)
        
        // Extrák JSON-ben
        formData.append('features', JSON.stringify(selectedFeatures))

        // Kapcsolók
        if (isPublic) formData.append('is_public', 'on')
        if (hideServiceCosts) formData.append('hide_service_costs', 'on')
        if (hidePrices) formData.append('hide_prices', 'on')

        // FONTOS: Nem a fájlokat küldjük, hanem a kész URL-eket!
        if (uploadedUrls.length > 0) {
            formData.append('uploaded_image_urls', JSON.stringify(uploadedUrls))
        }

        // 4. Server Action hívása
        startTransition(async () => {
            await publishListing(formData)
            setUploadStatus(null)
        })
    }

    // Segédfüggvény: van-e aktív folyamat?
    const isProcessing = isPending || uploadStatus !== null

    return (
        <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* 1. SZEKCIÓ: ÁR ÉS ALAPADATOK */}
            <div className="space-y-6">
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
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-5 pl-6 pr-12 text-3xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">Ft</div>
                    </div>
                </div>

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
            </div>

            {/* 2. SZEKCIÓ: FELSZERELTSÉG */}
            <div className="space-y-6 pt-8 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <GripVertical className="w-5 h-5 text-amber-500" /> Felszereltség & Extrák
                    </h3>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Extra keresése..." 
                            value={featureSearch}
                            onChange={(e) => setFeatureSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                    </div>
                </div>
                
                <div className="space-y-8">
                    {Object.entries(CAR_FEATURES).map(([category, items]) => {
                        const filteredItems = items.filter(i => i.toLowerCase().includes(featureSearch.toLowerCase()));
                        if (filteredItems.length === 0 && featureSearch) return null;
                        return (
                            <div key={category} className="space-y-3">
                                <h4 className="text-xs font-bold uppercase text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">{category}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {filteredItems.map((item) => {
                                        const isSelected = selectedFeatures.includes(item);
                                        return (
                                            <div key={item} onClick={() => toggleFeature(item)} className={`cursor-pointer flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 select-none group ${isSelected ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${isSelected ? 'bg-amber-500 border-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-slate-400'}`}>{isSelected && <Check className="w-3.5 h-3.5" />}</div>
                                                <span className={`text-sm font-medium ${isSelected ? 'text-amber-900 dark:text-amber-100' : 'text-slate-600 dark:text-slate-400'}`}>{item}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 3. SZEKCIÓ: LEÍRÁS ÉS KÉPEK */}
            <div className="space-y-6 pt-8 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Részletes Leírás
                    </label>
                    <textarea 
                        rows={6}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Írj az autó állapotáról, szervizeiről, esetleges hibáiról..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-base text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all resize-none leading-relaxed"
                    ></textarea>
                </div>

                {/* KÉPFELTÖLTÉS RÉSZ */}
                <div className="space-y-3 pt-4">
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2"><UploadCloud className="w-4 h-4" /> További Fotók</label>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        
                        {/* Előnézeti képek */}
                        {previews.map((src, idx) => (
                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-700">
                                <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                
                                {/* TÖRLÉS GOMB - ITT TÖRTÉNIK A VARÁZSLAT */}
                                <button 
                                    type="button" 
                                    onClick={() => removeImage(idx)} 
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 z-10"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                        
                        {/* Hozzáadás gomb */}
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-900/10 flex flex-col items-center justify-center text-slate-400 transition-all group">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors"><Plus className="w-5 h-5 group-hover:text-amber-500" /></div>
                            <span className="text-xs font-bold">Kép csatolása</span>
                        </button>
                    </div>
                    
                    {/* Rejtett input */}
                    <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                </div>
            </div>

            {/* 4. SZEKCIÓ: ADATVÉDELEM ÉS PUBLIKÁLÁS */}
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
                
                {/* Adatvédelmi Kapcsolók */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Szervizköltség Rejtése */}
                    <div 
                        className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between ${hideServiceCosts ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'}`}
                        onClick={() => setHideServiceCosts(!hideServiceCosts)}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${hideServiceCosts ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                                <EyeOff className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Szervizköltségek elrejtése</h4>
                                <p className="text-xs text-slate-500">A nézők nem látják az árakat a szervizkönyvben.</p>
                            </div>
                        </div>
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${hideServiceCosts ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${hideServiceCosts ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </div>
                    </div>

                    {/* Eladási Ár Rejtése */}
                    <div 
                        className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between ${hidePrices ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'}`}
                        onClick={() => setHidePrices(!hidePrices)}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${hidePrices ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                                <Banknote className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Ár elrejtése</h4>
                                <p className="text-xs text-slate-500">"Megegyezés szerint" jelenik meg ár helyett.</p>
                            </div>
                        </div>
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${hidePrices ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${hidePrices ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </div>
                    </div>
                </div>

                {/* Publikálás Kapcsoló */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-amber-500/30 transition-colors" onClick={() => setIsPublic(!isPublic)}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isPublic ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                            <Store className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Publikálás a Piactéren</h4>
                            <p className="text-sm text-slate-500">Jelenjen meg az autó a közösségi listában?</p>
                        </div>
                    </div>
                    
                    <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${isPublic ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                        <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isPublic ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-lg font-black py-5 rounded-2xl shadow-xl shadow-orange-500/20 transform hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                    {/* Itt jelenik meg a státusz szöveg (pl. Kép feltöltése...) */}
                    {uploadStatus ? uploadStatus : (isPublic ? 'Hirdetés Publikálása' : 'Mentés Piszkozatként')}
                </button>
            </div>
        </form>
    )
}