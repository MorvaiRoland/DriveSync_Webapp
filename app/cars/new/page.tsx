'use client'

import { useState, useEffect, Suspense } from 'react'
import { addCar } from '@/app/cars/actions' // Ellenőrizd az elérési utat!
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useFormStatus } from 'react-dom'
import { 
  CarFront, Calendar, Gauge, Fuel, Zap, Settings, 
  Palette, FileText, CheckCircle2, AlertCircle, Upload, ChevronDown 
} from 'lucide-react'

// --- BETÖLTÉS GOMB ---
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold shadow-lg transition-all transform flex items-center justify-center gap-2
        ${pending 
          ? 'bg-slate-700 text-slate-400 cursor-wait' 
          : 'bg-amber-500 text-slate-900 hover:bg-amber-400 hover:shadow-amber-500/20 active:scale-[0.98]'}`}
    >
      {pending ? 'Mentés folyamatban...' : (
        <>
          <CheckCircle2 className="w-5 h-5" />
          Mentés a Garázsba
        </>
      )}
    </button>
  )
}

// --- INPUT MEZŐ ---
function InputGroup({ label, name, type = "text", placeholder, required = false, uppercase = false, icon, suffix }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={name} className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>
      <div className="relative group">
        {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors z-10">
                {icon}
            </div>
        )}
        <input
          type={type}
          name={name}
          id={name}
          required={required}
          placeholder={placeholder}
          className={`
            block w-full rounded-xl border border-slate-300 dark:border-slate-700 
            bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
            placeholder-slate-400 dark:placeholder-slate-600
            focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none
            py-3.5 text-sm transition-all shadow-sm
            ${icon ? 'pl-11' : 'pl-4'} 
            ${uppercase ? 'uppercase placeholder:normal-case' : ''}
          `}
        />
        {suffix && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">{suffix}</span>
            </div>
        )}
      </div>
    </div>
  )
}

// --- SELECT MEZŐ (JAVÍTVA) ---
// A value propot opcionálissá tettük, hogy működjön kontrollált és nem kontrollált módban is
function SelectGroup({ label, name, children, required = false, icon, value, onChange, disabled }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={name} className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>
      <div className="relative group">
        {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors z-10">
                {icon}
            </div>
        )}
        <select
          name={name}
          id={name}
          required={required}
          // Csak akkor adjuk át a value-t, ha nem undefined, különben az űrlap "uncontrolled" marad
          {...(value !== undefined ? { value } : {})}
          onChange={onChange}
          disabled={disabled}
          className={`
            block w-full rounded-xl border border-slate-300 dark:border-slate-700 
            bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
            focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none
            py-3.5 pr-10 text-sm transition-all shadow-sm appearance-none cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-11' : 'pl-4'}
          `}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
            <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
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
      {/* Fontos: az encType nélkül nem mennek át a fájlok! */}
      <form action={addCar} className="p-6 sm:p-10 space-y-10">
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {/* 1. KÉP FELTÖLTÉS */}
        <div className="flex flex-col items-center">
            <div className="w-full max-w-lg">
                <div className={`
                    relative w-full h-56 rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer group
                    ${imagePreview 
                        ? 'border-amber-500/50 bg-slate-900' 
                        : 'border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }
                `}>
                    <input 
                        type="file" 
                        name="image" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" 
                    />
                    
                    {imagePreview ? (
                        <div className="w-full h-full relative">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white font-bold flex gap-2"><Palette className="w-5 h-5"/> Kép cseréje</span>
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors">
                            <Upload className="w-10 h-10 mb-3" />
                            <span className="text-sm font-bold">Autó fotó feltöltése</span>
                            <span className="text-xs mt-1 opacity-70 font-medium">PNG, JPG (max 5MB)</span>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* 2. AZONOSÍTÁS */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500"><CarFront className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Azonosítás</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <SelectGroup 
                label="Gyártó (Márka)" 
                name="brand_select" 
                required 
                value={selectedBrandId} 
                onChange={(e: any) => setSelectedBrandId(e.target.value)} 
                disabled={loadingBrands}
            >
                <option value="" disabled>Válassz márkát...</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                <option value="other">Egyéb / Nem találom</option>
            </SelectGroup>
            <input type="hidden" name="make" value={selectedBrandName || (selectedBrandId === 'other' ? 'Egyéb' : '')} />

            <div className="w-full">
                {selectedBrandId === "other" || (models.length === 0 && !loadingModels && selectedBrandId !== "") ? (
                    <InputGroup label="Modell" name="model" required placeholder="pl. Focus" />
                ) : (
                    <SelectGroup 
                        label="Modell" 
                        name="model" 
                        required 
                        disabled={!selectedBrandId || loadingModels}
                    >
                        <option value="" disabled selected>Válassz típust...</option>
                        {models.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                        <option value="Egyéb">Egyéb / Kézzel írom be</option>
                    </SelectGroup>
                )}
            </div>
            
            <InputGroup label="Rendszám" name="plate" placeholder="AA-BB-123" required uppercase icon={<FileText className="w-4 h-4" />} />
            <InputGroup label="Alvázszám (VIN)" name="vin" placeholder="Opcionális" uppercase icon={<FileText className="w-4 h-4" />} />
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* 3. TECHNIKAI RÉSZLETEK */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500"><Settings className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Technikai Részletek</h3>
          </div>
          
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

            {/* JAVÍTOTT: Az opciók értéke (value) angol, a megjelenítés magyar */}
            <SelectGroup label="Üzemanyag" name="fuel_type" required icon={<Fuel className="w-4 h-4" />}>
                <option value="Dízel">Dízel</option>
                <option value="Benzin">Benzin</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Plugin_Hybrid">Plug-in Hybrid</option>
                <option value="Elektromos">Elektromos</option>
                <option value="LPG">LPG / Gáz</option>
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

        {/* 4. DÁTUMOK */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" /> Lejáratok / Vizsgák
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Műszaki vizsga érvényessége" name="mot_expiry" type="date" />
                <InputGroup label="Biztosítási évforduló" name="insurance_expiry" type="date" />
            </div>
        </div>

        {/* 5. STÁTUSZ */}
        <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Aktuális Státusz</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="relative flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer hover:border-amber-500 transition-all has-[:checked]:border-amber-500 has-[:checked]:bg-amber-500/10">
                    <input type="radio" name="status" value="active" defaultChecked className="peer sr-only" />
                    <div className="w-5 h-5 rounded-full border-2 border-slate-400 peer-checked:border-amber-500 peer-checked:bg-amber-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">Aktív (Használatban)</span>
                </label>
                
                <label className="relative flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer hover:border-amber-500 transition-all has-[:checked]:border-amber-500 has-[:checked]:bg-amber-500/10">
                    <input type="radio" name="status" value="service" className="peer sr-only" />
                    <div className="w-5 h-5 rounded-full border-2 border-slate-400 peer-checked:border-amber-500 peer-checked:bg-amber-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">Szerviz alatt</span>
                </label>
            </div>
        </div>

        <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-4">
          <Link href="/" className="w-full sm:w-auto px-6 py-4 rounded-xl text-center text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Mégse
          </Link>
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}

export default function NewCarPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans">
      <div className="relative bg-slate-900 pt-12 pb-24 px-6 overflow-hidden">
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