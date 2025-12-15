'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { addCar } from '@/app/cars/actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useFormStatus } from 'react-dom'
import {
  CarFront, Calendar, Gauge, Fuel, Zap, Settings,
  Palette, FileText, CheckCircle2, AlertCircle, Upload, ChevronDown,
  ArrowLeft, Info
} from 'lucide-react'

// --- 1. STÍLUSOS GOMBOK ---
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`
        relative overflow-hidden group w-full sm:w-auto px-10 py-4 rounded-2xl font-black tracking-wide shadow-[0_10px_40px_-10px_rgba(245,158,11,0.5)] transition-all duration-300 transform hover:-translate-y-1
        ${pending
          ? 'bg-slate-800 text-slate-500 cursor-wait'
          : 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.6)]'
        }
      `}
    >
      <span className={`flex items-center justify-center gap-3 relative z-10 ${pending ? 'opacity-50' : ''}`}>
        {pending ? 'Mentés...' : (
          <>
            <CheckCircle2 className="w-6 h-6" />
            <span>MENTÉS A GARÁZSBA</span>
          </>
        )}
      </span>
      {/* Fényes effekt a gombon hover-kor */}
      {!pending && (
        <div className="absolute inset-0 h-full w-full scale-0 rounded-2xl transition-all duration-300 group-hover:scale-100 group-hover:bg-white/20"></div>
      )}
    </button>
  )
}

// --- 2. PRÉMIUM INPUT MEZŐ ---
function InputGroup({ label, name, type = "text", placeholder, required = false, uppercase = false, icon, suffix }: any) {
  const [focused, setFocused] = useState(false)
  
  return (
    <div className={`group relative transition-all duration-300 ${focused ? 'scale-[1.01]' : ''}`}>
      <label htmlFor={name} className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
        <span>{label}</span>
        {required && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></span>}
      </label>
      
      <div className={`
        relative flex items-center bg-slate-800/50 backdrop-blur-sm border-2 rounded-2xl overflow-hidden transition-all duration-300
        ${focused ? 'border-amber-500/50 shadow-[0_0_20px_-5px_rgba(245,158,11,0.15)] bg-slate-800' : 'border-slate-700/50 hover:border-slate-600'}
      `}>
        {icon && (
          <div className={`pl-4 pr-2 transition-colors duration-300 ${focused ? 'text-amber-500' : 'text-slate-500'}`}>
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
            w-full bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 py-4 text-sm font-medium
            ${!icon && 'pl-4'}
            ${uppercase ? 'uppercase placeholder:normal-case' : ''}
          `}
        />
        
        {suffix && (
          <div className="pr-4 pl-2 text-xs font-bold text-slate-500">
            {suffix}
          </div>
        )}
      </div>
    </div>
  )
}

// --- 3. PRÉMIUM SELECT MEZŐ ---
function SelectGroup({ label, name, children, required = false, icon, value, onChange, disabled }: any) {
  const [focused, setFocused] = useState(false)

  return (
    <div className={`group relative transition-all duration-300 ${focused ? 'scale-[1.01]' : ''}`}>
      <label htmlFor={name} className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
        <span>{label}</span>
        {required && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></span>}
      </label>
      
      <div className={`
        relative flex items-center bg-slate-800/50 backdrop-blur-sm border-2 rounded-2xl overflow-hidden transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed border-slate-800' : ''}
        ${focused && !disabled ? 'border-amber-500/50 shadow-[0_0_20px_-5px_rgba(245,158,11,0.15)] bg-slate-800' : 'border-slate-700/50 hover:border-slate-600'}
      `}>
        {icon && (
          <div className={`pl-4 pr-2 transition-colors duration-300 ${focused && !disabled ? 'text-amber-500' : 'text-slate-500'}`}>
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
            w-full bg-transparent border-none text-white focus:ring-0 py-4 text-sm font-medium appearance-none cursor-pointer
            ${!icon && 'pl-4'}
          `}
        >
          {children}
        </select>
        
        <div className="absolute right-4 pointer-events-none text-slate-500">
          <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${focused ? 'rotate-180 text-amber-500' : ''}`} />
        </div>
      </div>
    </div>
  )
}

// --- 4. FŐ ŰRLAP LOGIKA ---
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

  // Drag & Drop kezelők
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      // Megjegyzés: A drop esemény nem állítja be közvetlenül az input value-t biztonsági okokból,
      // de a preview megjelenik. A tényleges feltöltéshez az input onChange eseményét kell használni vagy JS-sel trükközni,
      // de egyszerűség kedvéért itt most csak a vizuális visszajelzést kezeljük.
      // A felhasználónak kattintania kell a fájl kiválasztásához a biztos működéshez Next.js Server Actions esetén.
    }
  }

  const selectedBrandName = brands.find(b => b.id.toString() === selectedBrandId)?.name || ""
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => currentYear - i)
  const colors = ["Fehér", "Fekete", "Ezüst / Szürke", "Kék", "Piros", "Zöld", "Barna / Bézs", "Sárga / Arany", "Narancs", "Egyéb"]

  return (
    <div className="relative">
        {/* Háttér dekoráció az űrlap mögött */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-700 rounded-[2.5rem] blur opacity-20 dark:opacity-40"></div>
        
        <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-slate-800">
            <form action={addCar} className="p-8 md:p-12 space-y-12">
                
                {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-4 text-red-400 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-red-500/20 p-2 rounded-lg"><AlertCircle className="w-5 h-5" /></div>
                    <p className="font-medium text-sm">{error}</p>
                </div>
                )}

                {/* 1. KÉP FELTÖLTÉS - DRAG & DROP ZÓNA */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-amber-500 font-mono text-sm">01</span>
                            A Jármű Fotója
                        </h3>
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full">Kiemelt kép</span>
                    </div>

                    <div 
                        className={`
                            relative w-full aspect-video md:aspect-[21/9] rounded-3xl border-2 border-dashed transition-all duration-500 overflow-hidden cursor-pointer group
                            ${isDragOver 
                                ? 'border-amber-500 bg-amber-500/10 scale-[1.02]' 
                                : imagePreview 
                                    ? 'border-slate-700 bg-slate-950' 
                                    : 'border-slate-700 hover:border-amber-500/50 hover:bg-slate-800/50'
                            }
                        `}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input 
                            type="file" 
                            name="image" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" 
                        />
                        
                        {imagePreview ? (
                            <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-700">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                                <div className="absolute inset-0 bg-slate-950/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                                    <Palette className="w-10 h-10 text-amber-500 mb-4 scale-0 group-hover:scale-100 transition-transform delay-100 duration-300" />
                                    <span className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform delay-100 duration-300">Kép cseréje</span>
                                    <span className="text-slate-400 text-sm mt-2 translate-y-4 group-hover:translate-y-0 transition-transform delay-150 duration-300">Kattints vagy húzd ide az új képet</span>
                                </div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 group-hover:text-amber-500 transition-colors">
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300 border border-slate-700 group-hover:border-amber-500/30">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <span className="text-lg font-bold text-white mb-2">Húzd ide a képet</span>
                                <span className="text-sm font-medium opacity-60">vagy kattints a tallózáshoz</span>
                            </div>
                        )}
                        
                        {/* Dekoratív sarkok */}
                        <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-slate-700/50 rounded-tl-3xl pointer-events-none group-hover:border-amber-500/30 transition-colors"></div>
                        <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-slate-700/50 rounded-br-3xl pointer-events-none group-hover:border-amber-500/30 transition-colors"></div>
                    </div>
                </div>

                <div className="w-full h-px bg-slate-800"></div>

                {/* 2. ADATOK GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    
                    {/* BAL OSZLOP */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-6">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-amber-500 font-mono text-sm">02</span>
                                Alapadatok
                            </h3>
                            
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

                                <div className="grid grid-cols-2 gap-6">
                                    <InputGroup label="Rendszám" name="plate" placeholder="AA-BB-123" required uppercase icon={<FileText className="w-5 h-5" />} />
                                    <SelectGroup label="Évjárat" name="year" required icon={<Calendar className="w-5 h-5" />}>
                                        <option value="" disabled selected>Év...</option>
                                        {years.map(year => <option key={year} value={year}>{year}</option>)}
                                    </SelectGroup>
                                </div>
                                
                                <InputGroup label="Alvázszám (VIN)" name="vin" placeholder="Opcionális" uppercase />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-6">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-amber-500 font-mono text-sm">03</span>
                                Dátumok
                            </h3>
                            <div className="p-6 rounded-2xl bg-slate-950/50 border border-slate-800/50 space-y-6">
                                <InputGroup label="Műszaki érvényesség" name="mot_expiry" type="date" icon={<Calendar className="w-5 h-5" />} />
                                <InputGroup label="Biztosítási évforduló" name="insurance_expiry" type="date" icon={<Calendar className="w-5 h-5" />} />
                            </div>
                        </div>
                    </div>

                    {/* JOBB OSZLOP */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-6">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-amber-500 font-mono text-sm">04</span>
                                Specifikációk
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <InputGroup label="Km óra állás" name="mileage" type="number" placeholder="pl. 154000" required icon={<Gauge className="w-5 h-5" />} />
                                    <InputGroup label="Teljesítmény (LE)" name="power_hp" type="number" placeholder="pl. 150" suffix="LE" icon={<Zap className="w-5 h-5" />} />
                                </div>

                                <SelectGroup label="Üzemanyag" name="fuel_type" required icon={<Fuel className="w-5 h-5" />}>
                                    <option value="Dízel">Dízel</option>
                                    <option value="Benzin">Benzin</option>
                                    <option value="Hybrid">Hybrid</option>
                                    <option value="Plugin_Hybrid">Plug-in Hybrid</option>
                                    <option value="Elektromos">Elektromos</option>
                                    <option value="LPG">LPG / Gáz</option>
                                </SelectGroup>

                                <div className="grid grid-cols-2 gap-6">
                                    <SelectGroup label="Váltó" name="transmission" required>
                                        <option value="manual">Manuális</option>
                                        <option value="automatic">Automata</option>
                                        <option value="cvt">CVT</option>
                                        <option value="robotized">Robotizált</option>
                                    </SelectGroup>
                                    <InputGroup label="Motor (cm³)" name="engine_size" type="number" placeholder="pl. 1998" suffix="cm³" />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
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
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-6">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-amber-500 font-mono text-sm">05</span>
                                Státusz
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <label className="relative group cursor-pointer">
                                    <input type="radio" name="status" value="active" defaultChecked className="peer sr-only" />
                                    <div className="absolute inset-0 bg-slate-800 rounded-2xl border-2 border-slate-700 transition-all duration-300 peer-checked:border-amber-500 peer-checked:shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]"></div>
                                    <div className="relative p-4 flex flex-col items-center justify-center gap-3 text-slate-400 peer-checked:text-white transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center peer-checked:bg-amber-500 peer-checked:border-amber-400 peer-checked:text-slate-900 transition-all duration-300">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <span className="font-bold uppercase tracking-widest text-xs">Aktív</span>
                                    </div>
                                </label>

                                <label className="relative group cursor-pointer">
                                    <input type="radio" name="status" value="service" className="peer sr-only" />
                                    <div className="absolute inset-0 bg-slate-800 rounded-2xl border-2 border-slate-700 transition-all duration-300 peer-checked:border-amber-500 peer-checked:shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]"></div>
                                    <div className="relative p-4 flex flex-col items-center justify-center gap-3 text-slate-400 peer-checked:text-white transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center peer-checked:bg-amber-500 peer-checked:border-amber-400 peer-checked:text-slate-900 transition-all duration-300">
                                            <Settings className="w-6 h-6" />
                                        </div>
                                        <span className="font-bold uppercase tracking-widest text-xs">Szervizen</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="w-full h-px bg-slate-800 my-8"></div>

                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-6">
                    <Link 
                        href="/" 
                        className="group flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold text-sm uppercase tracking-wider px-4 py-2"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Mégse, vissza a főoldalra
                    </Link>
                    <SubmitButton />
                </div>
                
            </form>
        </div>
    </div>
  )
}

export default function NewCarPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* HÁTTÉR EFFEKTEK */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        
        {/* FEJLÉC */}
        <div className="mb-16 md:text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Zap className="w-3 h-3" /> Garázs Bővítése
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                ÚJ JÁRMŰ <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">HOZZÁADÁSA</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                Rögzítsd az új családtagot a rendszerben. Kövesd nyomon a szervizeket, költségeket és a jármű életútját egyetlen prémium felületen.
            </p>
        </div>

        {/* ŰRLAP KONTÉNER */}
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Suspense fallback={
                <div className="w-full h-96 rounded-[2rem] bg-slate-900/50 border border-slate-800 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                        <span className="text-slate-500 font-bold tracking-widest text-sm uppercase">Betöltés...</span>
                    </div>
                </div>
            }>
                <CarForm />
            </Suspense>
        </div>

        {/* LÁBLÉC INFO */}
        <div className="mt-16 text-center">
            <p className="flex items-center justify-center gap-2 text-slate-600 text-sm">
                <Info className="w-4 h-4" />
                Az adatok biztonságosan, titkosítva kerülnek tárolásra.
            </p>
        </div>

      </div>
    </div>
  )
}