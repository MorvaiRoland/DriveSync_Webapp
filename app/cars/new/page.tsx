'use client'

import { useState, useEffect, Suspense } from 'react'
import { addCar } from '@/app/cars/actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useFormStatus } from 'react-dom'
import { 
  CarFront, Calendar, Gauge, Fuel, Zap, Settings, 
  Palette, FileText, CheckCircle2, AlertCircle, Upload 
} from 'lucide-react'

// --- SUBMIT GOMB ---
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
           Mentés...
        </>
      ) : (
        <>
          <CheckCircle2 className="w-5 h-5" />
          Mentés a Garázsba
        </>
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

  const [brands, setBrands] = useState<{id: number, name: string}[]>([])
  const [models, setModels] = useState<{id: number, name: string}[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState<string>("")
  const [loadingBrands, setLoadingBrands] = useState(true)
  const [loadingModels, setLoadingModels] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // 1. MÁRKÁK BETÖLTÉSE (DEBUGGAL)
  useEffect(() => {
    async function fetchBrands() {
      console.log("Márkák betöltése...")
      const { data, error } = await supabase.from('catalog_brands').select('*').order('name')
      
      if (error) {
          console.error("Hiba a márkák betöltésekor:", error)
          // Fallback: Ha hiba van, legalább az 'Egyéb' opció maradjon
      }

      if (data && data.length > 0) {
          setBrands(data)
      } else {
          console.warn("Nincs adat a catalog_brands táblában!")
      }
      setLoadingBrands(false)
    }
    fetchBrands()
  }, [])

  // 2. MODELLEK BETÖLTÉSE
  useEffect(() => {
    async function fetchModels() {
      if (!selectedBrandId || selectedBrandId === 'other') {
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

  // ... (többi függvény változatlan: handleImageChange, const változók) ...
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const selectedBrandName = brands.find(b => b.id.toString() === selectedBrandId)?.name || ""
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => currentYear - i)
  const colors = ["Fehér", "Fekete", "Ezüst / Szürke", "Kék", "Piros", "Zöld", "Barna / Bézs", "Sárga / Arany", "Narancs", "Egyéb"]


  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
      <form action={addCar} className="p-6 sm:p-10 space-y-10">
        
        {/* ... (Hibaüzenet és Képfeltöltés rész változatlan) ... */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-md">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">
                    Jármű fotója (Opcionális)
                </label>
                <div className="relative group cursor-pointer">
                    <div className={`
                        relative w-full h-64 rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden
                        ${imagePreview 
                            ? 'border-amber-500/50 bg-slate-900' 
                            : 'border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }
                    `}>
                        <input type="file" name="image" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" />
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors">
                                <Upload className="w-10 h-10 mb-3" />
                                <span className="text-sm font-medium">Kattints a feltöltéshez</span>
                                <span className="text-xs mt-1 opacity-70">PNG, JPG (max 5MB)</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* 2. AZONOSÍTÁS */}
        <div>
          <SectionHeader icon={<CarFront className="w-5 h-5 text-amber-500" />} title="Azonosítás" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* JAVÍTOTT MÁRKA VÁLASZTÓ */}
            <SelectGroup label="Gyártó (Márka)" name="brand_select" required>
                <select 
                    id="brand_select" 
                    value={selectedBrandId} 
                    onChange={(e) => setSelectedBrandId(e.target.value)} 
                    required 
                    disabled={loadingBrands}
                    className="form-select"
                >
                    <option value="" disabled>{loadingBrands ? "Betöltés..." : "Válassz márkát..."}</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    <option value="other">Egyéb / Nem találom</option>
                </select>
                {/* Ha 'other'-t választ, akkor a 'make' inputba 'Egyéb' kerül, amit később kézzel felülírhatsz a kódban ha akarsz, vagy hagyod így */}
                <input type="hidden" name="make" value={selectedBrandName || (selectedBrandId === 'other' ? 'Egyéb' : '')} />
            </SelectGroup>

            {/* MODELL VÁLASZTÓ (Változatlan, csak a logikája) */}
            <div className="space-y-1.5">
                <Label required>Modell</Label>
                {/* Ha 'Egyéb' márka van kiválasztva, VAGY nincs betöltött modell, akkor kézi input */}
                {selectedBrandId === "other" || (models.length === 0 && !loadingModels && selectedBrandId !== "") ? (
                    <input 
                        type="text" 
                        name="model" 
                        required 
                        placeholder="Írd be a típust (pl. Focus)" 
                        className="form-input" 
                    />
                ) : (
                    <div className="relative">
                        <select 
                            name="model" 
                            required 
                            disabled={!selectedBrandId || loadingModels} 
                            className="form-select disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="" disabled selected>{loadingModels ? "Modellek betöltése..." : "Válassz típust..."}</option>
                            {models.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                            <option value="Egyéb">Egyéb / Kézzel írom be</option>
                        </select>
                        <SelectChevron />
                    </div>
                )}
            </div>
            
            <InputGroup label="Rendszám" name="plate" placeholder="AA-BB-123" required uppercase icon={<FileText className="w-4 h-4" />} />
            <InputGroup label="Alvázszám (VIN)" name="vin" placeholder="Opcionális" uppercase icon={<FileText className="w-4 h-4" />} />
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* ... (Technikai Részletek és Dátumok szekció változatlan, mert az jó volt) ... */}
        <div>
          <SectionHeader icon={<Settings className="w-5 h-5 text-amber-500" />} title="Technikai Részletek" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SelectGroup label="Évjárat" name="year" required icon={<Calendar className="w-4 h-4" />}>
              <option value="" disabled selected>Válassz...</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </SelectGroup>
            <InputGroup label="Km óra állás" name="mileage" type="number" placeholder="pl. 154000" required icon={<Gauge className="w-4 h-4" />} />
            <SelectGroup label="Sebességváltó" name="transmission" required icon={<Settings className="w-4 h-4" />}>
                <option value="manual">Manuális</option>
                <option value="automatic">Automata</option>
                <option value="cvt">Fokozatmentes (CVT)</option>
                <option value="robotized">Robotizált</option>
            </SelectGroup>
            <SelectGroup label="Üzemanyag" name="fuel_type" required icon={<Fuel className="w-4 h-4" />}>
                <option value="Dízel">Dízel</option>
                <option value="Benzin">Benzin</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                <option value="Elektromos">Elektromos</option>
                <option value="LPG / Gáz">LPG / Gáz</option>
            </SelectGroup>
            <InputGroup label="Hengerűrtartalom" name="engine_size" type="number" placeholder="pl. 1998" suffix="cm³" />
            <InputGroup label="Teljesítmény" name="power_hp" type="number" placeholder="pl. 150" suffix="LE" icon={<Zap className="w-4 h-4" />} />
            <div className="sm:col-span-2 lg:col-span-1">
                <SelectGroup label="Szín" name="color" icon={<Palette className="w-4 h-4" />}>
                    <option value="" disabled selected>Válassz...</option>
                    {colors.map(c => <option key={c} value={c}>{c}</option>)}
                </SelectGroup>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" /> Fontos Dátumok
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Műszaki vizsga érvényessége" name="mot_expiry" type="date" />
                <InputGroup label="Biztosítási évforduló" name="insurance_expiry" type="date" />
            </div>
        </div>

        {/* 5. JAVÍTOTT STÁTUSZ VÁLASZTÓ (Reszponzív) */}
        <div>
            <Label>Aktuális Státusz</Label>
            {/* ITT A JAVÍTÁS: grid-cols-1 (mobil) -> sm:grid-cols-2 (tablet/pc) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <StatusOption value="active" label="Aktív (Használatban)" defaultChecked />
                <StatusOption value="service" label="Szerviz alatt" />
            </div>
        </div>

        <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-4">
          <Link href="/" className="w-full sm:w-auto px-6 py-3 rounded-xl text-center text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Mégse
          </Link>
          <div className="w-full sm:w-auto">
            <SubmitButton />
          </div>
        </div>
      </form>
    </div>
  )
}

// --- FŐ OLDAL ---
export default function NewCarPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans">
      
      {/* DEKORÁCIÓS HEADER */}
      <div className="relative bg-slate-900 pt-16 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
                ÚJ JÁRMŰ
            </h1>
            <p className="text-slate-400 text-lg">Bővítsd a flottádat egy új géppel</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-20">
        <Suspense fallback={<div className="h-96 bg-white dark:bg-slate-900 rounded-3xl shadow-xl animate-pulse"></div>}>
          <CarForm />
        </Suspense>
      </div>
    </div>
  )
}

// --- JAVÍTOTT SEGÉD KOMPONENSEK ---

const Label = ({ children, required }: { children: React.ReactNode, required?: boolean }) => (
    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
        {children} {required && <span className="text-amber-500">*</span>}
    </label>
)

function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
    return (
        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">{icon}</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
    )
}

function InputGroup({ label, name, type = "text", placeholder, required = false, uppercase = false, icon, suffix }: any) {
  return (
    <div className="space-y-1.5 w-full">
      <Label required={required}>{label}</Label>
      <div className="relative group">
        {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                {icon}
            </div>
        )}
        <input
          type={type}
          name={name}
          id={name}
          required={required}
          placeholder={placeholder}
          className={`form-input ${icon ? 'pl-10' : ''} ${uppercase ? 'uppercase placeholder:normal-case' : ''}`}
        />
        {suffix && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{suffix}</span>
            </div>
        )}
      </div>
    </div>
  )
}

function SelectGroup({ label, name, children, required = false, icon }: any) {
  return (
    <div className="space-y-1.5 w-full">
      <Label required={required}>{label}</Label>
      <div className="relative group">
        {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                {icon}
            </div>
        )}
        <select
          name={name}
          id={name}
          required={required}
          className={`form-select ${icon ? 'pl-10' : ''}`}
        >
          {children}
        </select>
        <SelectChevron />
      </div>
    </div>
  )
}

const SelectChevron = () => (
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    </div>
)

const StatusOption = ({ value, label, defaultChecked }: any) => (
    <label className={`
        relative flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
        bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600
        has-[:checked]:border-amber-500 dark:has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50 dark:has-[:checked]:bg-amber-900/10
    `}>
        <input type="radio" name="status" value={value} defaultChecked={defaultChecked} className="peer sr-only" />
        <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-500 rounded-full peer-checked:border-amber-500 peer-checked:bg-amber-500 transition-all flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
        </div>
        <span className="font-bold text-slate-700 dark:text-slate-200">{label}</span>
    </label>
)