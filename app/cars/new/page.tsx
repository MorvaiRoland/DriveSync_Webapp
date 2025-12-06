'use client'

import { useState, useEffect, Suspense } from 'react'
import { addCar } from '../actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

// --- Űrlap Komponens (Külön választva a Suspense miatt) ---
function CarForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  // Supabase kliens (Kliens oldali)
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
  const [imagePreview, setImagePreview] = useState<string | null>(null) // Előnézeti kép

  // 1. Márkák betöltése indításkor
  useEffect(() => {
    async function fetchBrands() {
      const { data } = await supabase
        .from('catalog_brands')
        .select('*')
        .order('name')
      
      if (data) setBrands(data)
      setLoadingBrands(false)
    }
    fetchBrands()
  }, [])

  // 2. Modellek betöltése, ha változik a márka
  useEffect(() => {
    async function fetchModels() {
      if (!selectedBrandId) {
        setModels([])
        return
      }
      
      setLoadingModels(true)
      const { data } = await supabase
        .from('catalog_models')
        .select('*')
        .eq('brand_id', selectedBrandId)
        .order('name')
      
      if (data) setModels(data)
      setLoadingModels(false)
    }
    fetchModels()
  }, [selectedBrandId])

  // Kép előnézet kezelése
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  // Keresünk egy márkanevet az ID alapján a rejtett inputnak
  const selectedBrandName = brands.find(b => b.id.toString() === selectedBrandId)?.name || ""

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i)

  const colors = [
    "Fehér", "Fekete", "Ezüst / Szürke", "Kék", "Piros", 
    "Zöld", "Barna / Bézs", "Sárga / Arany", "Narancs", "Egyéb"
  ]

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      <form action={addCar} className="p-8 space-y-8">
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* --- KÉP FELTÖLTÉS (ÚJ SZEKCIÓ) --- */}
        <div className="flex justify-center mb-6">
            <div className="w-full">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Autó Fotója (Opcionális)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer relative overflow-hidden bg-slate-50/50">
                <input 
                    type="file" 
                    name="image" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                />
                
                {imagePreview ? (
                    <div className="relative z-10">
                        <img src={imagePreview} alt="Előnézet" className="h-48 object-cover rounded-lg shadow-md" />
                        <p className="text-xs text-center text-slate-500 mt-2">Kattints a cseréhez</p>
                    </div>
                ) : (
                    <div className="space-y-1 text-center z-10 py-4">
                        <svg className="mx-auto h-12 w-12 text-slate-400 group-hover:text-amber-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-slate-600 justify-center">
                            <span className="font-medium text-amber-600 hover:text-amber-500">Tölts fel egy képet</span>
                            <p className="pl-1">vagy húzd ide</p>
                        </div>
                        <p className="text-xs text-slate-500">PNG, JPG, GIF (max 5MB)</p>
                    </div>
                )}
            </div>
            </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Jármű Azonosítás
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* MÁRKA - Adatbázisból */}
            <div className="space-y-1">
              <label htmlFor="brand_select" className="block text-sm font-semibold text-slate-700">
                Gyártó (Márka) <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="brand_select"
                  required
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                  className="block w-full appearance-none rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-3 px-4 bg-slate-50 border transition-all text-slate-700 cursor-pointer disabled:bg-slate-100"
                  disabled={loadingBrands}
                >
                  <option value="" disabled>
                    {loadingBrands ? "Betöltés..." : "Válassz márkát..."}
                  </option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                  <option value="other">Egyéb / Nem listázott</option>
                </select>
                {/* Rejtett input, hogy a nevet küldjük el a szervernek, ne az ID-t */}
                <input type="hidden" name="make" value={selectedBrandName || (selectedBrandId === 'other' ? 'Egyéb' : '')} />
                
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* MODELL - Adatbázisból */}
            <div className="space-y-1">
              <label htmlFor="model_select" className="block text-sm font-semibold text-slate-700">
                Modell (Típus) <span className="text-amber-500">*</span>
              </label>
              
              {/* Ha "Egyéb" a márka, vagy nincs modell az adatbázisban, engedjük gépelni */}
              {selectedBrandId === "other" || (models.length === 0 && !loadingModels && selectedBrandId !== "") ? (
                <input
                  type="text"
                  name="model"
                  required
                  placeholder="Írd be a típust"
                  className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-3 px-4 bg-slate-50 border"
                />
              ) : (
                <div className="relative">
                  <select
                    name="model"
                    id="model_select"
                    required
                    disabled={!selectedBrandId || loadingModels}
                    className="block w-full appearance-none rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-3 px-4 bg-slate-50 border transition-all text-slate-700 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="" disabled selected>
                      {loadingModels ? "Betöltés..." : (!selectedBrandId ? "Először válassz márkát..." : "Válassz típust...")}
                    </option>
                    {models.map(model => (
                      <option key={model.id} value={model.name}>{model.name}</option>
                    ))}
                    <option value="Egyéb">Egyéb / Nincs a listában</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              )}
            </div>
            
            <InputGroup label="Rendszám" name="plate" placeholder="AA-BB-123" required uppercase />
            <InputGroup label="Alvázszám (VIN)" name="vin" placeholder="Opcionális" uppercase />
          </div>
        </div>

        {/* Szekció 2: Részletek */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            Műszaki Adatok
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <SelectGroup label="Évjárat" name="year" required>
              <option value="" disabled selected>Válassz...</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </SelectGroup>

            <InputGroup label="Km óra állás" name="mileage" type="number" placeholder="pl. 154000" required />
            
            <SelectGroup label="Üzemanyag" name="fuel_type" required>
                <option value="diesel">Dízel</option>
                <option value="petrol">Benzin</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Elektromos</option>
                <option value="lpg">LPG / Gáz</option>
            </SelectGroup>

            <SelectGroup label="Szín" name="color">
                <option value="" disabled selected>Válassz színt...</option>
                {colors.map(c => <option key={c} value={c}>{c}</option>)}
            </SelectGroup>
            
            <div className="space-y-1 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Státusz</label>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center">
                      <input type="radio" name="status" value="active" defaultChecked className="peer sr-only" />
                      <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-amber-500 peer-checked:bg-amber-500 transition-all"></div>
                  </div>
                  <span className="text-slate-700 group-hover:text-amber-600 transition-colors">Aktív (Használatban)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center">
                      <input type="radio" name="status" value="service" className="peer sr-only" />
                      <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-amber-500 peer-checked:bg-amber-500 transition-all"></div>
                  </div>
                  <span className="text-slate-700 group-hover:text-amber-600 transition-colors">Szerviz alatt</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-4">
          <Link href="/" className="px-6 py-3 rounded-lg text-slate-600 font-semibold hover:bg-slate-100 transition-colors">
            Mégse
          </Link>
          <button type="submit" className="px-8 py-3 rounded-lg bg-amber-500 text-white font-bold shadow-lg hover:bg-amber-400 hover:shadow-xl transition-all transform active:scale-[0.98]">
            Mentés a Garázsba
          </button>
        </div>
      </form>
    </div>
  )
}

// --- FŐ OLDAL (Suspense Wrapperrel a Hiba Elkerülésére) ---
export default function NewCarPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <div className="bg-slate-900 pt-10 pb-24 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-extrabold text-white uppercase tracking-wider">
            Új Jármű <span className="text-amber-500">Rögzítése</span>
          </h1>
          <p className="mt-2 text-slate-400">Válassz a márkák és típusok adatbázisából.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <Suspense fallback={<div className="p-8 text-center bg-white rounded-2xl shadow">Betöltés...</div>}>
          <CarForm />
        </Suspense>
      </div>
    </div>
  )
}

// --- Segéd Komponensek ---

function InputGroup({ label, name, type = "text", placeholder, required = false, uppercase = false }: any) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        required={required}
        placeholder={placeholder}
        className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-3 px-4 bg-slate-50 border transition-all ${uppercase ? 'uppercase placeholder:normal-case' : ''}`}
      />
    </div>
  )
}

function SelectGroup({ label, name, children, required = false }: any) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>
      <div className="relative">
        <select
          name={name}
          id={name}
          required={required}
          className="block w-full appearance-none rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-3 px-4 bg-slate-50 border transition-all text-slate-700 cursor-pointer"
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
           <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </div>
  )
}