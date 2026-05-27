'use client'

import { addEvent } from '../../actions' 
import { scanReceipt } from '@/app/actions/scan-receipt'
import imageCompression from 'browser-image-compression'
import Link from 'next/link'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { 
  Fuel, Wrench, ScanLine, ArrowLeft, CheckCircle2, 
  MapPin, Calendar, FileText, Banknote, Gauge, 
  Loader2, AlertCircle, X, ChevronDown, Sparkles 
} from 'lucide-react'

// --- TYPES ---
interface Car {
  id: number
  make: string
  model: string
  plate: string
  mileage: number
}

interface ServiceType {
  id: number
  name: string
}

interface FormState {
  event_date: string
  mileage: string | number
  title: string
  cost: string | number
  liters: string | number
  location: string
  description: string
}

interface ToastState {
  message: string
  type: 'success' | 'error'
}

interface EventFormClientProps {
  car: Car
  serviceTypes: ServiceType[]
  isPro: boolean
}

const getLocalToday = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function Glass({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`
      bg-white/60 dark:bg-white/[0.04]
      border border-white/70 dark:border-white/[0.08]
      backdrop-blur-xl shadow-sm
      ${className}
    `}>
      {children}
    </div>
  )
}

export default function EventFormClient({ car, serviceTypes, isPro }: EventFormClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const carId = car.id.toString()
  
  const defaultType = searchParams.get('type') === 'service' ? 'service' : 'fuel'
  const [type, setType] = useState<'service' | 'fuel'>(defaultType)
  const isFuel = type === 'fuel'

  // States
  const [scanning, setScanning] = useState(false) 
  const [saving, setSaving] = useState(false)
  const [aiFilled, setAiFilled] = useState<string[]>([])
  const [showAiDisclaimer, setShowAiDisclaimer] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [customTitle, setCustomTitle] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<FormState>({
    event_date: getLocalToday(), 
    mileage: car.mileage || '',
    title: '', 
    cost: '',
    liters: '',
    location: '',
    description: ''
  })

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const preventMinus = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', '+', 'e', 'E'].includes(e.key)) {
      e.preventDefault()
    }
  }

  // AI Receipt Scanner
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
        maxWidthOrHeight: 1920,
        useWebWorker: true
      })

      const data = new FormData()
      data.append('receipt', compressedFile)
      
      const result = await scanReceipt(data)

      if (result.success && result.data) {
        const aiData = result.data
        
        if (aiData.type && (aiData.type === 'fuel' || aiData.type === 'service')) {
          setType(aiData.type as 'fuel' | 'service')
        }

        let newDate = formData.event_date
        if (aiData.date) {
          try {
            const parsedDate = new Date(aiData.date)
            if (!isNaN(parsedDate.getTime())) {
              newDate = parsedDate.toISOString().split('T')[0]
            }
          } catch (e) {
            console.warn("Dátum formázási hiba", e)
          }
        }

        setFormData(prev => ({
          ...prev,
          title: aiData.title || prev.title, 
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
    
    let finalTitle = formData.title
    let finalDescription = formData.description

    if (formData.title === 'Egyéb') {
      finalTitle = customTitle
    }

    if (!isFuel && (!finalDescription || finalDescription.trim() === '')) {
      finalDescription = finalTitle
    }
    
    const submitData = new FormData()
    submitData.set('car_id', carId)
    submitData.set('type', type)
    submitData.set('event_date', formData.event_date)
    submitData.set('mileage', String(formData.mileage))
    submitData.set('cost', String(formData.cost))
    submitData.set('location', formData.location)
    submitData.set('description', finalDescription)
    submitData.set('title', finalTitle)

    if (isFuel) {
      submitData.set('liters', String(formData.liters))
    }

    try {
      await addEvent(submitData)
      showToast('Esemény rögzítve!', 'success')
      router.refresh()
    } catch (error: any) {
      if (error.message === 'NEXT_REDIRECT') {
        showToast('Sikeres mentés! Visszatérés...', 'success')
        return 
      }
      console.error(error)
      showToast('Hiba történt a mentéskor.', 'error')
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="w-full pb-20">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-[calc(1.2rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 backdrop-blur-md border border-white/10 ${toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="font-bold text-sm leading-tight">{toast.message}</span>
        </div>
      )}

      {/* Scanning loading screen */}
      {scanning && (
        <div className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in fade-in duration-300 px-4 text-center">
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

      {/* Header and Toggle Mode */}
      <div className="max-w-2xl mx-auto mb-6 flex flex-col items-center">
        <Link href={`/cars/${carId}`} className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 text-xs font-bold bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-200 dark:border-slate-700/50">
          <ArrowLeft className="w-4 h-4" /> Vissza az autóhoz
        </Link>
        
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight mb-2 text-center">
          {isFuel ? 'Tankolás' : 'Szerviz'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Rögzítése</span>
        </h1>
        
        <div className="inline-flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50 mt-1 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {car.make} {car.model} <span className="opacity-50">|</span> {car.plate}
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Toggle Fuel/Service Selector */}
        <Glass className="rounded-2xl p-1.5 flex gap-1">
          <button
            onClick={() => setType('fuel')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 ${
              isFuel
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Fuel className="w-4 h-4" />
            <span>Tankolás</span>
          </button>
          <button
            onClick={() => setType('service')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 ${
              !isFuel
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Szerviz</span>
          </button>
        </Glass>

        {/* AI SCANNER CARD */}
        <label className={`cursor-pointer group relative w-full flex flex-col items-center justify-center gap-3 p-6 md:p-8 rounded-3xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-[0.99] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden border border-white/10`}>
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 group-hover:opacity-10 transition-opacity"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-amber-500/20 transition-colors"></div>
          
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-105 transition-transform duration-300">
              <ScanLine className="w-6 h-6 text-amber-400" />
            </div>
            <div className="text-center">
              <span className="block text-sm font-bold">Számla Beolvasása (AI)</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Fotózd le a bizonylatot, az AI automatikusan kitölti az adatokat.</span>
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

        {/* AI DISCLAIMER */}
        {showAiDisclaimer && (
          <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/50 backdrop-blur-md rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-500 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-amber-800 dark:text-amber-400 text-xs">AI adatok betöltve!</h4>
              <p className="text-[10px] text-amber-700 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                Az AI kitöltötte a mezőket. Kérlek, nézd át a sárgával jelölt adatokat mentés előtt.
              </p>
            </div>
            <button onClick={() => setShowAiDisclaimer(false)} className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 p-1 hover:bg-amber-100 dark:hover:bg-amber-800 rounded-lg transition-colors shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* FORM CARD */}
        <Glass className="rounded-3xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputGroup 
                label="Dátum" 
                name="event_date" 
                type="date" 
                value={formData.event_date}
                onChange={handleChange}
                highlight={aiFilled.includes('event_date')}
                required 
                icon={<Calendar className="w-4 h-4" />}
                accentColor={isFuel ? 'amber' : 'indigo'}
              />
              <InputGroup 
                label="Km óra állás" 
                name="mileage" 
                type="number"
                min={0}
                onKeyDown={preventMinus}
                value={formData.mileage}
                onChange={handleChange}
                highlight={aiFilled.includes('mileage')} 
                required 
                icon={<Gauge className="w-4 h-4" />}
                suffix="km"
                accentColor={isFuel ? 'amber' : 'indigo'}
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
                icon={<MapPin className="w-4 h-4" />}
                accentColor="amber"
              />
            ) : (
              <>
                <SelectGroup 
                  label="Szerviz Típusa" 
                  name="title" 
                  value={formData.title}
                  onChange={handleChange}
                  required
                  highlight={aiFilled.includes('title')}
                  icon={<Wrench className="w-4 h-4" />}
                  accentColor="indigo"
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

                {formData.title === 'Egyéb' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <InputGroup 
                      label="Javítás Típusa" 
                      name="custom_title" 
                      placeholder="pl. Váltóolaj csere" 
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      required 
                      icon={<Wrench className="w-4 h-4" />}
                      accentColor="indigo"
                    />
                  </div>
                )}
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputGroup 
                label="Költség" 
                name="cost" 
                type="number"
                min={0}
                onKeyDown={preventMinus}
                placeholder="0" 
                value={formData.cost}
                onChange={handleChange}
                highlight={aiFilled.includes('cost')}
                required 
                icon={<Banknote className="w-4 h-4" />}
                suffix="Ft"
                accentColor={isFuel ? 'amber' : 'indigo'}
              />
              {isFuel && (
                <InputGroup 
                  label="Mennyiség" 
                  name="liters" 
                  type="number" 
                  min={0}
                  onKeyDown={preventMinus}
                  step="0.01" 
                  placeholder="0.00" 
                  value={formData.liters}
                  onChange={handleChange}
                  highlight={aiFilled.includes('liters')}
                  required 
                  icon={<Fuel className="w-4 h-4" />}
                  suffix="L"
                  accentColor="amber"
                />
              )}
            </div>

            {!isFuel && (
              <div className="space-y-1.5 group">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Megjegyzés</label>
                <div className="relative">
                  <textarea 
                    name="description" 
                    rows={3} 
                    value={formData.description}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] backdrop-blur-md p-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-0 focus:outline-none transition-all resize-none shadow-inner" 
                    placeholder={formData.title && formData.title !== 'Egyéb' ? `pl. ${formData.title} elvégezve...` : "Részletek..."}
                  ></textarea>
                  <div className="absolute top-4 right-4 pointer-events-none text-slate-400">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 italic ml-1">
                  * Ha üresen hagyod, automatikusan "{formData.title === 'Egyéb' ? customTitle : formData.title}" kerül beírásra.
                </p>
              </div>
            )}

            <InputGroup 
              label="Helyszín (Opcionális)" 
              name="location" 
              placeholder="Budapest" 
              value={formData.location}
              onChange={handleChange}
              highlight={aiFilled.includes('location')}
              icon={<MapPin className="w-4 h-4" />}
              accentColor={isFuel ? 'amber' : 'indigo'}
            />

            <div className="pt-6 flex gap-3 border-t border-slate-100 dark:border-white/[0.06]">
              <Link href={`/cars/${carId}`} className="w-1/3 py-3 rounded-xl text-slate-500 dark:text-slate-400 font-bold text-center border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors text-xs uppercase tracking-wide flex items-center justify-center">
                Mégse
              </Link>
              <button 
                type="submit" 
                disabled={saving}
                className={`relative w-2/3 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-white text-xs uppercase tracking-wider overflow-hidden group ${
                  isFuel 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-amber-500/20' 
                    : 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-indigo-500/20'
                }`}
              >
                <span className="relative flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {saving ? 'Mentés...' : 'Mentés a naplóba'}
                </span>
              </button>
            </div>
          </form>
        </Glass>
      </div>
    </div>
  )
}

// --- SUB-COMPONENTS ---

interface InputGroupProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  step?: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  highlight?: boolean
  icon?: React.ReactNode
  suffix?: string
  min?: string | number
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  accentColor: 'amber' | 'indigo'
}

function InputGroup({ label, name, type = "text", placeholder, required = false, step, value, onChange, highlight, icon, suffix, min, onKeyDown, accentColor }: InputGroupProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="space-y-1.5 group w-full">
      <label htmlFor={name} className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
        <span>{label}</span>
        {required && <span className={`w-1 h-1 rounded-full ${accentColor === 'amber' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]'}`}></span>}
      </label>
      
      <div className={`
        relative flex items-center bg-white/50 dark:bg-white/[0.02] backdrop-blur-md border rounded-xl overflow-hidden transition-all duration-300
        ${highlight 
          ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-900/10 ring-2 ring-amber-500/10' 
          : focused 
            ? accentColor === 'amber'
              ? 'border-amber-500 ring-2 ring-amber-500/10 shadow-lg shadow-amber-500/5'
              : 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-lg shadow-indigo-500/5'
            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
        }
      `}>
        {icon && (
          <div className={`pl-4 pr-2 transition-colors duration-300 shrink-0 ${focused || highlight ? accentColor === 'amber' ? 'text-amber-500' : 'text-indigo-500' : 'text-slate-400'}`}>
            {icon}
          </div>
        )}
        
        <input 
          type={type} 
          name={name} 
          id={name} 
          step={step} 
          min={min}
          onKeyDown={onKeyDown}
          value={value}       
          onChange={onChange} 
          required={required} 
          placeholder={placeholder} 
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full bg-transparent border-none py-3 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 focus:outline-none
            ${!icon && 'pl-4'}
          `} 
        />
        
        {suffix && (
          <div className="pr-4 pl-2 text-[10px] font-bold text-slate-400 bg-slate-100/50 dark:bg-white/5 py-1.5 rounded-lg mr-2 shrink-0">
            {suffix}
          </div>
        )}
      </div>
    </div>
  )
}

interface SelectGroupProps {
  label: string
  name: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  required?: boolean
  highlight?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  accentColor: 'amber' | 'indigo'
}

function SelectGroup({ label, name, value, onChange, required, highlight, icon, children, accentColor }: SelectGroupProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="space-y-1.5 group w-full">
      <label htmlFor={name} className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
        <span>{label}</span>
        {required && <span className={`w-1 h-1 rounded-full ${accentColor === 'amber' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]'}`}></span>}
      </label>
      
      <div className={`
        relative flex items-center bg-white/50 dark:bg-white/[0.02] backdrop-blur-md border rounded-xl overflow-hidden transition-all duration-300
        ${highlight 
          ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-900/10 ring-2 ring-amber-500/10' 
          : focused 
            ? accentColor === 'amber'
              ? 'border-amber-500 ring-2 ring-amber-500/10 shadow-lg shadow-amber-500/5'
              : 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-lg shadow-indigo-500/5'
            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
        }
      `}>
        {icon && (
          <div className={`pl-4 pr-2 transition-colors duration-300 shrink-0 ${focused || highlight ? accentColor === 'amber' ? 'text-amber-500' : 'text-indigo-500' : 'text-slate-400'}`}>
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
            w-full bg-transparent border-none py-3 text-sm font-bold text-slate-900 dark:text-white cursor-pointer appearance-none focus:ring-0 focus:outline-none
            ${!icon && 'pl-4'}
            [&>option]:bg-white [&>option]:text-slate-900 
            dark:[&>option]:bg-slate-900 dark:[&>option]:text-white
          `}
        >
          {children}
        </select>
        
        <div className="absolute right-4 pointer-events-none text-slate-400">
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${focused ? 'rotate-180' : ''}`} />
        </div>
      </div>
    </div>
  )
}
