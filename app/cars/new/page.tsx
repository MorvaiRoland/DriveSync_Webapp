'use client'

import { useState, useEffect, Suspense } from 'react'
import { addCar } from '@/app/cars/actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useFormStatus } from 'react-dom'
import {
  CarFront, Calendar, Gauge, Fuel, Zap, Settings,
  Palette, FileText, CheckCircle2, AlertCircle, Upload, ChevronDown,
  ArrowLeft, Info, X
} from 'lucide-react'

// --- 1. LIQUID BUTTON ---
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`
        relative w-full sm:w-auto px-8 py-4 rounded-2xl font-bold tracking-wide transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
        shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(245,158,11,0.2)]
        ${pending
          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-wait'
          : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-amber-500/30'
        }
      `}
    >
      <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      <span className={`flex items-center justify-center gap-2 relative z-10 ${pending ? 'opacity-50' : ''}`}>
        {pending ? 'Mentés...' : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span>Mentés a Garázsba</span>
          </>
        )}
      </span>
    </button>
  )
}

// --- 2. GLASS INPUT MEZŐ ---
function InputGroup({ label, name, type = "text", placeholder, required = false, uppercase = false, icon, suffix }: any) {
  const [focused, setFocused] = useState(false)
  
  return (
    <div className="group relative">
      <label htmlFor={name} className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>
      
      <div className={`
        relative flex items-center rounded-2xl transition-all duration-300 overflow-hidden
        bg-white/60 dark:bg-slate-800/40 backdrop-blur-md border 
        ${focused 
            ? 'border-amber-500 ring-2 ring-amber-500/10 shadow-lg shadow-amber-500/10' 
            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
        }
      `}>
        {icon && (
          <div className={`pl-4 pr-2 transition-colors duration-300 ${focused ? 'text-amber-500' : 'text-slate-400'}`}>
            {icon}
          </div>
        )}
        
        <input
          type={type}
          name={name}
          id={name}
          required={required}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full bg-transparent border-none py-3.5 text-sm font-medium
            text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
            focus:ring-0 focus:outline-none
            ${!icon && 'pl-4'}
            ${uppercase ? 'uppercase placeholder:normal-case' : ''}
          `}
        />
        
        {suffix && (
          <div className="pr-4 pl-2 text-xs font-bold text-slate-400 bg-slate-100/50 dark:bg-white/5 py-1.5 rounded-lg mr-2">
            {suffix}
          </div>
        )}
      </div>
    </div>
  )
}

// --- 3. GLASS SELECT MEZŐ ---
function SelectGroup({ label, name, children, required = false, icon, value, onChange, disabled }: any) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="group relative">
      <label htmlFor={name} className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>
      
      <div className={`
        relative flex items-center rounded-2xl transition-all duration-300 overflow-hidden
        bg-white/60 dark:bg-slate-800/40 backdrop-blur-md border
        ${disabled ? 'opacity-60 cursor-not-allowed border-slate-200 dark:border-slate-800' : ''}
        ${focused && !disabled
            ? 'border-amber-500 ring-2 ring-amber-500/10 shadow-lg shadow-amber-500/10' 
            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
        }
      `}>
        {icon && (
          <div className={`pl-4 pr-2 transition-colors duration-300 ${focused && !disabled ? 'text-amber-500' : 'text-slate-400'}`}>
            {icon}
          </div>
        )}
        
        <select
          name={name}
          id={name}
          required={required}
          {...(value !== undefined ? { value } : {})}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full bg-transparent border-none py-3.5 text-sm font-medium cursor-pointer appearance-none
            text-slate-900 dark:text-white 
            focus:ring-0 focus:outline-none
            ${!icon && 'pl-4'}
          `}
        >
          {children}
        </select>
        
        <div className="absolute right-4 pointer-events-none text-slate-400">
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${focused ? 'rotate-180 text-amber-500' : ''}`} />
        </div>
      </div>
    </div>
  )
}

// --- 4. KÁRTYA CONTAINER (iOS Card Style) ---
function FormSection({ title, step, children }: { title: string, step: string, children: React.ReactNode }) {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-white/40 dark:border-white/5 backdrop-blur-xl shadow-xl p-6 md:p-8 mb-8 transition-all duration-500 hover:shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-inner text-amber-600 dark:text-amber-500 font-black font-mono text-lg border border-white/50 dark:border-white/10">
                    {step}
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>
            </div>
            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    )
}

// --- 5. FŐ ŰRLAP LOGIKA ---
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
  const [isDragOver, setIsDragOver] = useState(false)

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(true);
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  }

  const selectedBrandName = brands.find(b => b.id.toString() === selectedBrandId)?.name || ""
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => currentYear - i)
  const colors = ["Fehér", "Fekete", "Ezüst / Szürke", "Kék", "Piros", "Zöld", "Barna / Bézs", "Sárga / Arany", "Narancs", "Egyéb"]

  return (
    <form action={addCar} className="w-full max-w-5xl mx-auto pb-20">
        
        {error && (
            <div className="mb-8 bg-red-500/10 border border-red-500/20 backdrop-blur-md p-4 rounded-2xl flex items-center gap-4 text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-2">
                <div className="bg-red-500/20 p-2 rounded-xl"><AlertCircle className="w-5 h-5" /></div>
                <p className="font-medium text-sm">{error}</p>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* BAL OLDAL - KÉP (LG: Col 4) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 h-fit space-y-6">
                <div className="relative group">
                    <div className={`
                        relative w-full aspect-[4/3] lg:aspect-[3/4] rounded-[2rem] border-2 border-dashed transition-all duration-500 overflow-hidden cursor-pointer
                        bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-xl
                        ${isDragOver 
                            ? 'border-amber-500 bg-amber-500/10 scale-[1.02]' 
                            : imagePreview 
                                ? 'border-transparent' 
                                : 'border-slate-300 dark:border-slate-700 hover:border-amber-500/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                        }
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    >
                        <input 
                            type="file" name="image" accept="image/*" onChange={handleImageChange} 
                            className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" 
                        />
                        
                        {imagePreview ? (
                            <div className="w-full h-full relative">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="bg-white/20 backdrop-blur-xl p-3 rounded-full border border-white/20 mb-2">
                                        <Palette className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-white font-bold text-sm tracking-wide shadow-black drop-shadow-md">Kép cseréje</span>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={(e) => {e.preventDefault(); setImagePreview(null)}}
                                    className="absolute top-4 right-4 z-30 p-2 bg-black/50 hover:bg-red-500/80 text-white rounded-full backdrop-blur-md transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-amber-500 transition-colors p-6 text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-white/50 dark:border-white/5">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <span className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">Jármű fotója</span>
                                <span className="text-sm font-medium opacity-70">Húzd ide a képet vagy kattints a feltöltéshez</span>
                            </div>
                        )}
                    </div>
                    {/* Floating Badge */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg px-4 py-1.5 rounded-full text-xs font-bold text-amber-500 uppercase tracking-widest z-20">
                        Kiemelt Kép
                    </div>
                </div>

                {/* Desktop Info Box */}
                <div className="hidden lg:block p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 backdrop-blur-md">
                    <h4 className="font-bold text-amber-600 dark:text-amber-500 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" /> Tipp
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        A jó minőségű, tájkép (fekvő) tájolású fotók mutatnak a legjobban a garázsban. Győződj meg róla, hogy a rendszám olvasható.
                    </p>
                </div>
            </div>

            {/* JOBB OLDAL - ŰRLAPOK (LG: Col 7) */}
            <div className="lg:col-span-7 space-y-6">
                
                {/* 1. SZEKCIÓ: ADATOK */}
                <FormSection title="Alapadatok" step="01">
                    <div className="space-y-6">
                        <SelectGroup 
                            label="Gyártó" 
                            name="brand_select" 
                            required 
                            value={selectedBrandId} 
                            onChange={(e: any) => setSelectedBrandId(e.target.value)} 
                            disabled={loadingBrands}
                            icon={<CarFront className="w-5 h-5" />}
                        >
                            <option value="" disabled>Válassz márkát...</option>
                            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            <option value="other">Egyéb / Nem találom</option>
                        </SelectGroup>
                        <input type="hidden" name="make" value={selectedBrandName || (selectedBrandId === 'other' ? 'Egyéb' : '')} />

                        {selectedBrandId === "other" || (models.length === 0 && !loadingModels && selectedBrandId !== "") ? (
                            <InputGroup label="Modell" name="model" required placeholder="pl. Focus" />
                        ) : (
                            <SelectGroup 
                                label="Modell" 
                                name="model" 
                                required 
                                disabled={!selectedBrandId || loadingModels}
                                icon={<Settings className="w-5 h-5" />}
                            >
                                <option value="" disabled selected>Válassz típust...</option>
                                {models.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                <option value="Egyéb">Egyéb</option>
                            </SelectGroup>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Rendszám" name="plate" placeholder="AA-BB-123" required uppercase icon={<FileText className="w-5 h-5" />} />
                            <SelectGroup label="Évjárat" name="year" required icon={<Calendar className="w-5 h-5" />}>
                                <option value="" disabled selected>Év...</option>
                                {years.map(year => <option key={year} value={year}>{year}</option>)}
                            </SelectGroup>
                        </div>
                        
                        <InputGroup label="Alvázszám (VIN)" name="vin" placeholder="Opcionális" uppercase />
                    </div>
                </FormSection>

                {/* 2. SZEKCIÓ: SPECIFIKÁCIÓ */}
                <FormSection title="Specifikációk" step="02">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <InputGroup label="Km óra állás" name="mileage" type="number" placeholder="pl. 154000" required icon={<Gauge className="w-5 h-5" />} />
                            <InputGroup label="Teljesítmény" name="power_hp" type="number" placeholder="pl. 150" suffix="LE" icon={<Zap className="w-5 h-5" />} />
                        </div>

                        <SelectGroup label="Üzemanyag" name="fuel_type" required icon={<Fuel className="w-5 h-5" />}>
                            <option value="Dízel">Dízel</option>
                            <option value="Benzin">Benzin</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Plugin_Hybrid">Plug-in Hybrid</option>
                            <option value="Elektromos">Elektromos</option>
                            <option value="LPG">LPG / Gáz</option>
                        </SelectGroup>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <SelectGroup label="Váltó" name="transmission" required>
                                <option value="manual">Manuális</option>
                                <option value="automatic">Automata</option>
                                <option value="cvt">CVT</option>
                                <option value="robotized">Robotizált</option>
                            </SelectGroup>
                            <InputGroup label="Motor (cm³)" name="engine_size" type="number" placeholder="pl. 1998" suffix="cm³" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <SelectGroup label="Kivitel" name="body_type">
                                <option value="" disabled selected>Válassz...</option>
                                <option value="sedan">Sedan</option>
                                <option value="kombi">Kombi</option>
                                <option value="hatchback">Hatchback</option>
                                <option value="suv">SUV</option>
                                <option value="coupe">Coupé</option>
                                <option value="cabrio">Cabrio</option>
                                <option value="mpv">MPV</option>
                                <option value="van">Furgon</option>
                            </SelectGroup>
                            <SelectGroup label="Szín" name="color" icon={<Palette className="w-5 h-5" />}>
                                <option value="" disabled selected>Válassz...</option>
                                {colors.map(c => <option key={c} value={c}>{c}</option>)}
                            </SelectGroup>
                        </div>
                    </div>
                </FormSection>

                {/* 3. SZEKCIÓ: STÁTUSZ & DÁTUMOK */}
                <FormSection title="Állapot & Lejáratok" step="03">
                    <div className="space-y-8">
                        {/* Státusz kártyák */}
                        <div className="grid grid-cols-2 gap-4">
                            <label className="relative group cursor-pointer">
                                <input type="radio" name="status" value="active" defaultChecked className="peer sr-only" />
                                <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/10 transition-all duration-300 peer-checked:border-amber-500 peer-checked:bg-amber-500/5 peer-checked:shadow-lg peer-checked:shadow-amber-500/10"></div>
                                <div className="relative p-4 flex flex-col items-center justify-center gap-2 text-slate-400 peer-checked:text-slate-900 dark:peer-checked:text-white transition-colors">
                                    <CheckCircle2 className="w-8 h-8 peer-checked:text-amber-500 transition-colors" />
                                    <span className="font-bold uppercase tracking-widest text-xs">Aktív</span>
                                </div>
                            </label>

                            <label className="relative group cursor-pointer">
                                <input type="radio" name="status" value="service" className="peer sr-only" />
                                <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/10 transition-all duration-300 peer-checked:border-amber-500 peer-checked:bg-amber-500/5 peer-checked:shadow-lg peer-checked:shadow-amber-500/10"></div>
                                <div className="relative p-4 flex flex-col items-center justify-center gap-2 text-slate-400 peer-checked:text-slate-900 dark:peer-checked:text-white transition-colors">
                                    <Settings className="w-8 h-8 peer-checked:text-amber-500 transition-colors" />
                                    <span className="font-bold uppercase tracking-widest text-xs">Szervizen</span>
                                </div>
                            </label>
                        </div>

                        <div className="h-px w-full bg-slate-200 dark:bg-white/10"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Műszaki érvényesség" name="mot_expiry" type="date" icon={<Calendar className="w-5 h-5" />} />
                            <InputGroup label="Biztosítási évforduló" name="insurance_expiry" type="date" icon={<Calendar className="w-5 h-5" />} />
                        </div>
                    </div>
                </FormSection>

                {/* ACTIONS */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-6 pt-4">
                    <Link 
                        href="/" 
                        className="group flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-bold text-sm uppercase tracking-wider px-4 py-2"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Mégse
                    </Link>
                    <SubmitButton />
                </div>
            </div>
        </div>
    </form>
  )
}

export default function NewCarPage() {
  return (
    <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-amber-500/30 selection:text-amber-700 dark:selection:text-amber-200 transition-colors duration-500">
      
      {/* --- FOLYÉKONY HÁTTÉR (Light & Dark) --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Dark Mode Blobs */}
        <div className="hidden dark:block">
            <div className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] bg-amber-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
            <div className="absolute top-[40%] -left-[10%] w-[40vw] h-[40vw] bg-blue-600/5 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[0%] right-[20%] w-[30vw] h-[30vw] bg-emerald-600/5 rounded-full blur-[80px]"></div>
        </div>
        {/* Light Mode Blobs */}
        <div className="block dark:hidden">
            <div className="absolute -top-[10%] -right-[10%] w-[60vw] h-[60vw] bg-amber-200/40 rounded-full blur-[100px] animate-pulse-slow"></div>
            <div className="absolute top-[30%] -left-[10%] w-[50vw] h-[50vw] bg-blue-200/30 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[0%] right-[10%] w-[40vw] h-[40vw] bg-orange-100/50 rounded-full blur-[80px]"></div>
        </div>
        
        {/* Grain Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12">
        
        {/* FEJLÉC */}
        <div className="mb-12 md:mb-20 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-amber-600 dark:text-amber-500 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Zap className="w-3 h-3" /> Garázs Bővítése
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 drop-shadow-sm">
                ÚJ JÁRMŰ <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">HOZZÁADÁSA</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                Rögzítsd az új családtagot. Kövesd nyomon a szervizeket és költségeket egy prémium felületen.
            </p>
        </div>

        {/* ŰRLAP KONTÉNER */}
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Suspense fallback={
                <div className="w-full h-96 rounded-[2rem] bg-white/30 dark:bg-slate-900/30 border border-white/20 flex items-center justify-center backdrop-blur-md">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                        <span className="text-slate-500 font-bold tracking-widest text-sm uppercase">Betöltés...</span>
                    </div>
                </div>
            }>
                <CarForm />
            </Suspense>
        </div>

      </div>
    </div>
  )
}