'use client'

import { useState, useEffect, Suspense } from 'react'
import { addCar } from '@/app/cars/actions' // Ellenőrizd az import útvonalat!
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useFormStatus } from 'react-dom' // Fontos a loading gombhoz!

// --- SUBMIT GOMB KOMPONENS (LOADING STATE) ---
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`px-8 py-3 rounded-xl bg-amber-500 text-slate-900 font-bold shadow-lg shadow-amber-500/20 transition-all transform flex items-center gap-2
        ${pending ? 'opacity-70 cursor-wait' : 'hover:bg-amber-400 hover:shadow-xl active:scale-[0.98]'}`}
    >
      {pending ? (
        <>
           <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
           Mentés folyamatban...
        </>
      ) : (
        "Mentés a Garázsba"
      )}
    </button>
  )
}

// --- FŐ ŰRLAP ---
function CarForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Állapotok
  const [brands, setBrands] = useState<{id: number, name: string}[]>([])
  const [models, setModels] = useState<{id: number, name: string}[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState<string>("")
  
  const [loadingBrands, setLoadingBrands] = useState(true)
  const [loadingModels, setLoadingModels] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Adatok betöltése
  useEffect(() => {
    async function fetchBrands() {
      const { data } = await supabase.from('catalog_brands').select('*').order('name')
      if (data) setBrands(data)
      setLoadingBrands(false)
    }
    fetchBrands()
  }, [])

  useEffect(() => {
    async function fetchModels() {
      if (!selectedBrandId) {
        setModels([])
        return
      }
      setLoadingModels(true)
      const { data } = await supabase.from('catalog_models').select('*').eq('brand_id', selectedBrandId).order('name')
      if (data) setModels(data)
      setLoadingModels(false)
    }
    fetchModels()
  }, [selectedBrandId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const selectedBrandName = brands.find(b => b.id.toString() === selectedBrandId)?.name || ""
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i)
  const colors = ["Fehér", "Fekete", "Ezüst / Szürke", "Kék", "Piros", "Zöld", "Barna / Bézs", "Sárga / Arany", "Narancs", "Egyéb"]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">
      <form action={addCar} className="p-8 space-y-8">
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* 1. KÉP FELTÖLTÉS */}
        <div className="flex justify-center mb-6">
            <div className="w-full">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Jármű fotója (Borítókép)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
                <input type="file" name="image" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                {imagePreview ? (
                    <div className="relative z-10 w-full">
                        <img src={imagePreview} alt="Előnézet" className="h-56 w-full object-cover rounded-xl shadow-md" />
                        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 font-medium">Kattints a cseréhez</p>
                    </div>
                ) : (
                    <div className="space-y-1 text-center z-10 py-4">
                        <svg className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 group-hover:text-amber-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                            <span className="font-medium text-amber-600 dark:text-amber-500 group-hover:underline">Tölts fel képet</span>
                        </div>
                        <p className="text-xs text-slate-500">PNG, JPG (max 5MB)</p>
                    </div>
                )}
            </div>
            </div>
        </div>

        {/* 2. ALAPADATOK */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Azonosítás
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Márka & Modell (Változatlan logika) */}
            <SelectGroup label="Gyártó (Márka)" name="brand_select" required>
                <select 
                    id="brand_select" value={selectedBrandId} onChange={(e) => setSelectedBrandId(e.target.value)} required disabled={loadingBrands}
                    className="block w-full appearance-none rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-3 px-4 bg-slate-50 dark:bg-slate-700 border text-slate-700 dark:text-white"
                >
                    <option value="" disabled>{loadingBrands ? "Betöltés..." : "Válassz márkát..."}</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    <option value="other">Egyéb</option>
                </select>
                <input type="hidden" name="make" value={selectedBrandName || (selectedBrandId === 'other' ? 'Egyéb' : '')} />
            </SelectGroup>

            <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Modell <span className="text-amber-500">*</span></label>
                {selectedBrandId === "other" || (models.length === 0 && !loadingModels && selectedBrandId !== "") ? (
                    <input type="text" name="model" required placeholder="Írd be a típust" className="block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-3 px-4 bg-slate-50 dark:bg-slate-700 border text-slate-900 dark:text-white" />
                ) : (
                    <div className="relative">
                        <select name="model" required disabled={!selectedBrandId || loadingModels} className="block w-full appearance-none rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-3 px-4 bg-slate-50 dark:bg-slate-700 border text-slate-700 dark:text-white disabled:opacity-50">
                            <option value="" disabled selected>{loadingModels ? "Betöltés..." : "Válassz típust..."}</option>
                            {models.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                            <option value="Egyéb">Egyéb</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                    </div>
                )}
            </div>
            
            <InputGroup label="Rendszám" name="plate" placeholder="AA-BB-123" required uppercase />
            <InputGroup label="Alvázszám (VIN)" name="vin" placeholder="Opcionális" uppercase />
          </div>
        </div>

        {/* 3. MŰSZAKI ADATOK (Bővített) */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            Technikai Részletek
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Első sor: Évjárat, Km, Váltó */}
            <SelectGroup label="Évjárat" name="year" required>
              <option value="" disabled selected>Válassz...</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </SelectGroup>

            <InputGroup label="Km óra állás" name="mileage" type="number" placeholder="pl. 154000" required />
            
            <SelectGroup label="Sebességváltó" name="transmission" required>
                <option value="manual">Manuális</option>
                <option value="automatic">Automata</option>
                <option value="cvt">Fokozatmentes (CVT)</option>
                <option value="robotized">Robotizált</option>
            </SelectGroup>

            {/* Második sor: Üzemanyag, Teljesítmény, Motor */}
            <SelectGroup label="Üzemanyag" name="fuel_type" required>
                <option value="Dízel">Dízel</option>
                <option value="Benzin">Benzin</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                <option value="Elektromos">Elektromos</option>
                <option value="LPG / Gáz">LPG / Gáz</option>
            </SelectGroup>

            <InputGroup label="Teljesítmény (LE)" name="power_hp" type="number" placeholder="pl. 150" />
            <InputGroup label="Hengerűrtartalom (cm³)" name="engine_size" type="number" placeholder="pl. 1998" />

            <SelectGroup label="Szín" name="color">
                <option value="" disabled selected>Válassz...</option>
                {colors.map(c => <option key={c} value={c}>{c}</option>)}
            </SelectGroup>
          </div>
        </div>

        {/* 4. DÁTUMOK & EMLÉKEZTETŐK (Új) */}
        <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Fontos Dátumok
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                <InputGroup label="Műszaki vizsga érvényessége" name="mot_expiry" type="date" placeholder="" />
                <InputGroup label="Biztosítási évforduló" name="insurance_expiry" type="date" placeholder="" />
            </div>
        </div>

        {/* 5. STÁTUSZ */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Aktuális Státusz</label>
            <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                        <input type="radio" name="status" value="active" defaultChecked className="peer sr-only" />
                        <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded-full peer-checked:border-emerald-500 peer-checked:bg-emerald-500 transition-all"></div>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Aktív (Használatban)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                        <input type="radio" name="status" value="service" className="peer sr-only" />
                        <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded-full peer-checked:border-amber-500 peer-checked:bg-amber-500 transition-all"></div>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Szerviz alatt</span>
                </label>
            </div>
        </div>

        {/* LÁBLÉC GOMBOK */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-4 sticky bottom-0 bg-white dark:bg-slate-800 p-4 -mx-4 -mb-4 sm:static sm:bg-transparent sm:p-0">
          <Link href="/" className="px-6 py-3 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            Mégse
          </Link>
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}

// --- FŐ OLDAL EXPORT ---
export default function NewCarPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      {/* HEADER */}
      <div className="bg-slate-900 py-12 px-4 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-[100px]"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Új Jármű <span className="text-amber-500">Rögzítése</span>
          </h1>
          <p className="mt-3 text-slate-400 text-lg font-light">Bővítsd a flottádat egy új géppel.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-20">
        <Suspense fallback={<div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl shadow text-slate-500">Betöltés...</div>}>
          <CarForm />
        </Suspense>
      </div>
    </div>
  )
}

// --- SEGÉD KOMPONENSEK (Stílus frissítve) ---

function InputGroup({ label, name, type = "text", placeholder, required = false, uppercase = false }: any) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        required={required}
        placeholder={placeholder}
        className={`block w-full rounded-xl border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-3 px-4 bg-slate-50 dark:bg-slate-700 border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all ${uppercase ? 'uppercase placeholder:normal-case' : ''}`}
      />
    </div>
  )
}

function SelectGroup({ label, name, children, required = false }: any) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>
      <div className="relative">
        {children}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
           <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </div>
  )
}