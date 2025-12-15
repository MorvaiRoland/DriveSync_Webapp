'use client'

import { createBrowserClient } from '@supabase/ssr'
import { addEvent } from '../../actions'
import { scanReceipt } from '@/app/actions/scan-receipt'
import imageCompression from 'browser-image-compression'
import Link from 'next/link'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense, useRef,  } from 'react'
import { 
  Fuel, Wrench, ScanLine, ArrowLeft, CheckCircle2, 
  MapPin, Calendar, FileText, Banknote, Gauge, 
  Loader2, AlertCircle, X, ChevronDown, Sparkles 
} from 'lucide-react'

// --- SEGÉDFÜGGVÉNY ---
const getLocalToday = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function EventForm() {
  const params = useParams()
  const searchParams = useSearchParams()
  const carId = params.id as string
  const router = useRouter()
  
  const defaultType = searchParams.get('type') === 'service' ? 'service' : 'fuel'
  const [type, setType] = useState(defaultType)
  const isFuel = type === 'fuel'

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [car, setCar] = useState<any>(null)
  const [serviceTypes, setServiceTypes] = useState<{id: number, name: string}[]>([])
  const [loading, setLoading] = useState(true)
  
  const [scanning, setScanning] = useState(false) 
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [aiFilled, setAiFilled] = useState<string[]>([])
  const [showAiDisclaimer, setShowAiDisclaimer] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  const [formData, setFormData] = useState({
      event_date: getLocalToday(), 
      mileage: '',
      title: '',
      cost: '',
      liters: '',
      location: '',
      description: ''
  })

  useEffect(() => {
    async function fetchData() {
      const { data: carData } = await supabase.from('cars').select('*').eq('id', carId).single()
      if (carData) {
          setCar(carData)
          setFormData(prev => ({ ...prev, mileage: carData.mileage }))
      }

      const { data: services } = await supabase.from('service_types').select('*').order('name')
      if (services) setServiceTypes(services)
      
      setLoading(false)
    }
    fetchData()
  }, [carId])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setScanning(true)
      setAiFilled([]) 
      setShowAiDisclaimer(false)
      showToast('🤖 AI elemzés folyamatban...', 'success')
      
      try {
          const compressedFile = await imageCompression(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920
          })

          const data = new FormData()
          data.append('receipt', compressedFile)
          
          const result = await scanReceipt(data)

          if (result.success && result.data) {
              const aiData = result.data
              
              if (aiData.type && (aiData.type === 'fuel' || aiData.type === 'service')) {
                  setType(aiData.type)
              }

              let newTitle = aiData.title || formData.title;
              let newDate = formData.event_date;
              if (aiData.date) {
                 if (aiData.date.includes('T')) {
                     newDate = aiData.date.split('T')[0];
                 } else if (aiData.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                     newDate = aiData.date;
                 }
              }

              setFormData(prev => ({
                  ...prev,
                  title: newTitle, 
                  event_date: newDate,
                  cost: aiData.cost || prev.cost,
                  location: aiData.location || prev.location,
                  liters: aiData.liters || prev.liters,
                  description: aiData.description || prev.description,
                  mileage: aiData.mileage || prev.mileage 
              }))

              const filledFields = []
              if (aiData.title) filledFields.push('title')
              if (aiData.date) filledFields.push('event_date')
              if (aiData.cost) filledFields.push('cost')
              if (aiData.liters) filledFields.push('liters')
              if (aiData.location) filledFields.push('location')
              if (aiData.mileage) filledFields.push('mileage')
              setAiFilled(filledFields)

              setShowAiDisclaimer(true)
              showToast('✨ Adatok sikeresen kinyerve!', 'success')
          } else {
              showToast('Nem sikerült minden adatot kinyerni.', 'error')
          }

      } catch (err) {
          console.error(err)
          showToast('Hiba a szkennelés közben.', 'error')
      } finally {
          setScanning(false)
          if (fileInputRef.current) fileInputRef.current.value = ''
      }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const submitData = new FormData(e.target as HTMLFormElement)
    submitData.set('type', type) 

    try {
        await addEvent(submitData)
        showToast('Esemény rögzítve!', 'success')
        router.refresh()
    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT') {
            showToast('Sikeres mentés! Visszatérés...', 'success')
            return 
        }
        showToast('Hiba történt a mentéskor.', 'error')
        setSaving(false)
    }
  }

  const handleChange = (e: any) => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (loading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">Betöltés...</p>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-500 selection:bg-amber-500/30 selection:text-amber-600 relative overflow-x-hidden">
      
      {/* HÁTTÉR EFFEKTEK */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* TOAST */}
      {toast && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 backdrop-blur-md border border-white/10 ${toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-bold text-sm">{toast.message}</span>
          </div>
      )}

      {/* SCANNING OVERLAY */}
      {scanning && (
          <div className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
              <div className="relative">
                  <div className="w-20 h-20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                      <ScanLine className="w-8 h-8 text-amber-500 animate-pulse" />
                  </div>
              </div>
              <p className="text-xl font-bold animate-pulse mb-2">Az AI elemzi a számlát...</p>
              <p className="text-sm text-slate-400">Ez eltarthat pár másodpercig</p>
          </div>
      )}

      {/* --- HERO HEADER --- */}
      <div className="relative pt-8 pb-16 px-4 overflow-hidden">
        <div className="max-w-2xl mx-auto text-center relative z-10">
            <Link href={`/cars/${carId}`} className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 text-sm font-bold bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                <ArrowLeft className="w-4 h-4" /> Vissza az autóhoz
            </Link>
            
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                {isFuel ? 'Tankolás' : 'Szerviz'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Rögzítése</span>
            </h1>
            
            {car && (
                <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {car.make} {car.model} <span className="opacity-50">|</span> {car.plate}
                </div>
            )}
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-20">
        
        {/* AI SCANNER CARD */}
        <div className="mb-8">
            <label className={`cursor-pointer group relative w-full flex flex-col items-center justify-center gap-3 p-8 rounded-3xl shadow-xl transition-all transform hover:-translate-y-1 active:scale-[0.98] bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden border border-slate-700`}>
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-amber-500/30 transition-colors"></div>
                
                <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-300">
                        <ScanLine className="w-7 h-7 text-amber-400" />
                    </div>
                    <div className="text-center">
                        <span className="block text-lg font-bold">Számla Beolvasása (AI)</span>
                        <span className="text-sm text-slate-400">Fotózd le a blokkot, mi kitöltjük az adatokat.</span>
                    </div>
                </div>
                
                <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleScan}
                    disabled={scanning}
                />
            </label>
        </div>

        {/* AI DISCLAIMER */}
        {showAiDisclaimer && (
            <div className="mb-6 bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 backdrop-blur-md rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-500">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">AI adatok betöltve!</h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-1 leading-relaxed">
                        Az AI kitöltötte a mezőket. Kérlek, nézd át a sárgával jelölt adatokat mentés előtt a pontosság érdekében.
                    </p>
                </div>
                <button onClick={() => setShowAiDisclaimer(false)} className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 p-1 hover:bg-amber-100 dark:hover:bg-amber-800 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
        )}

        {/* --- FORM CARD (LIQUID STYLE) --- */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-6 sm:p-10 border border-white/20 dark:border-slate-700 relative overflow-hidden">
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <input type="hidden" name="car_id" value={carId} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <InputGroup 
                  label="Dátum" 
                  name="event_date" 
                  type="date" 
                  value={formData.event_date}
                  onChange={handleChange}
                  highlight={aiFilled.includes('event_date')}
                  required 
                  icon={<Calendar className="w-5 h-5" />}
               />
               <InputGroup 
                  label="Km óra állás" 
                  name="mileage" 
                  type="number" 
                  value={formData.mileage}
                  onChange={handleChange}
                  highlight={aiFilled.includes('mileage')} 
                  required 
                  icon={<Gauge className="w-5 h-5" />}
                  suffix="km"
               />
            </div>

            {isFuel ? (
               <InputGroup 
                 label="Töltőállomás" 
                 name="title" 
                 placeholder="pl. Shell, OMV" 
                 value={formData.title}
                 onChange={handleChange}
                 highlight={aiFilled.includes('title')}
                 required 
                 icon={<MapPin className="w-5 h-5" />}
               />
            ) : (
               <SelectGroup 
                  label="Szerviz Típusa" 
                  name="title" 
                  value={formData.title}
                  onChange={handleChange}
                  required
                  highlight={aiFilled.includes('title')}
                  icon={<Wrench className="w-5 h-5" />}
               >
                  <option value="" disabled>Válassz...</option>
                  {formData.title && !serviceTypes.some(s => s.name === formData.title) && formData.title !== 'Egyéb' && (
                      <option value={formData.title}>{formData.title}</option>
                  )}
                  {serviceTypes.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                  <option value="Egyéb">Egyéb javítás</option>
               </SelectGroup>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <InputGroup 
                  label="Költség" 
                  name="cost" 
                  type="number" 
                  placeholder="0" 
                  value={formData.cost}
                  onChange={handleChange}
                  highlight={aiFilled.includes('cost')}
                  required 
                  icon={<Banknote className="w-5 h-5" />}
                  suffix="Ft"
               />
               {isFuel && (
                 <InputGroup 
                    label="Mennyiség" 
                    name="liters" 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={formData.liters}
                    onChange={handleChange}
                    highlight={aiFilled.includes('liters')}
                    required 
                    icon={<Fuel className="w-5 h-5" />}
                    suffix="L"
                 />
               )}
            </div>

            {!isFuel && (
               <div className="space-y-2 group">
                 <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Megjegyzés</label>
                 <div className="relative">
                    <textarea 
                      name="description" 
                      rows={3} 
                      value={formData.description}
                      onChange={handleChange}
                      className="block w-full rounded-2xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none shadow-sm" 
                      placeholder="pl. Castrol olaj, MANN szűrő..."
                    ></textarea>
                    <div className="absolute top-4 right-4 pointer-events-none text-slate-400">
                        <FileText className="w-5 h-5" />
                    </div>
                 </div>
               </div>
            )}

            <InputGroup 
                label="Helyszín (Opcionális)" 
                name="location" 
                placeholder="Budapest" 
                value={formData.location}
                onChange={handleChange}
                highlight={aiFilled.includes('location')}
                icon={<MapPin className="w-5 h-5" />}
            />

            <div className="pt-6 flex gap-4 border-t border-slate-100 dark:border-slate-800">
              <Link href={`/cars/${carId}`} className="w-1/3 py-4 rounded-xl text-slate-500 dark:text-slate-400 font-bold text-center border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm uppercase tracking-wide flex items-center justify-center">
                Mégse
              </Link>
              <button 
                type="submit" 
                disabled={saving}
                className="relative w-2/3 py-4 rounded-2xl font-bold shadow-lg transition-all transform hover:-translate-y-1 active:scale-[0.98] bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-amber-500/30 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl"></div>
                <span className="relative flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    {saving ? 'Mentés...' : 'Mentés a naplóba'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function NewEventPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">Betöltés...</p>
        </div>
    }>
      <EventForm />
    </Suspense>
  )
}

// --- REUSABLE COMPONENTS ---

function InputGroup({ label, name, type = "text", placeholder, required = false, step, value, onChange, highlight, icon, suffix }: any) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="space-y-2 group">
      <label htmlFor={name} className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
        <span>{label}</span>
        {required && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></span>}
      </label>
      
      <div className={`
        relative flex items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-300
        ${highlight 
            ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-900/10 ring-2 ring-amber-500/10' 
            : focused 
                ? 'border-amber-500 ring-2 ring-amber-500/10 shadow-lg shadow-amber-500/5' 
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        }
      `}>
        {icon && (
          <div className={`pl-4 pr-2 transition-colors duration-300 ${focused || highlight ? 'text-amber-500' : 'text-slate-400'}`}>
            {icon}
          </div>
        )}
        
        <input 
            type={type} 
            name={name} 
            id={name} 
            step={step} 
            value={value}       
            onChange={onChange} 
            required={required} 
            placeholder={placeholder} 
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`
                w-full bg-transparent border-none py-3.5 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 focus:outline-none
                ${!icon && 'pl-4'}
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

function SelectGroup({ label, name, value, onChange, required, highlight, icon, children }: any) {
    const [focused, setFocused] = useState(false)
  
    return (
      <div className="space-y-2 group">
        <label htmlFor={name} className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
          <span>{label}</span>
          {required && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></span>}
        </label>
        
        <div className={`
          relative flex items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-300
          ${highlight 
              ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-900/10 ring-2 ring-amber-500/10' 
              : focused 
                  ? 'border-amber-500 ring-2 ring-amber-500/10 shadow-lg shadow-amber-500/5' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          }
        `}>
          {icon && (
            <div className={`pl-4 pr-2 transition-colors duration-300 ${focused || highlight ? 'text-amber-500' : 'text-slate-400'}`}>
              {icon}
            </div>
          )}
          
          <select
            name={name}
            id={name}
            required={required}
            value={value} 
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`
                w-full bg-transparent border-none py-3.5 text-sm font-bold text-slate-900 dark:text-white cursor-pointer appearance-none focus:ring-0 focus:outline-none
                ${!icon && 'pl-4'}
                [&>option]:bg-white [&>option]:text-slate-900 
                dark:[&>option]:bg-slate-900 dark:[&>option]:text-white
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