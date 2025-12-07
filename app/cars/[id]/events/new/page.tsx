'use client'

import { createBrowserClient } from '@supabase/ssr'
import { addEvent } from '../../actions'
import { scanReceipt } from '@/app/actions/scan-receipt'
import imageCompression from 'browser-image-compression'
import Link from 'next/link'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense, useRef } from 'react'

function EventForm() {
  const params = useParams()
  const searchParams = useSearchParams()
  const carId = params.id as string
  const error = searchParams.get('error')
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
  
  // --- STATE-EK ---
  const [scanning, setScanning] = useState(false) // AI töltés
  const [saving, setSaving] = useState(false)     // Mentés töltés
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Toast értesítés
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  // Űrlap adatok
  const [formData, setFormData] = useState({
      date: new Date().toISOString().split('T')[0],
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

  // --- TOAST KEZELŐ ---
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // --- AI SZÁMLA SZKENNER ---
  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setScanning(true)
      showToast('Számla elemzése folyamatban...', 'success') // Jelzünk, hogy elindult
      
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
              
              setFormData(prev => ({
                  ...prev,
                  title: aiData.title || prev.title,
                  date: aiData.date || prev.date,
                  cost: aiData.cost || prev.cost,
                  location: aiData.location || prev.location,
                  liters: aiData.liters || prev.liters,
                  description: aiData.description || prev.description,
              }))

              if (aiData.type && (aiData.type === 'fuel' || aiData.type === 'service')) {
                  setType(aiData.type)
              }

              showToast('Számla sikeresen beolvasva!', 'success')
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

  // --- MENTÉS KEZELÉSE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const submitData = new FormData(e.target as HTMLFormElement)

    try {
        await addEvent(submitData)
        showToast('Esemény rögzítve!', 'success')
        router.refresh()
    } catch (error: any) {
        // Next.js redirect "hiba" kezelése (ez valójában siker)
        if (error.message === 'NEXT_REDIRECT') {
            showToast('Sikeres mentés! Visszatérés...', 'success')
            return 
        }
        console.error(error)
        showToast('Hiba történt a mentéskor.', 'error')
        setSaving(false)
    }
  }

  const handleChange = (e: any) => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">Betöltés...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      
      {/* --- TOAST --- */}
      {toast && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
              {toast.type === 'success' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
              <span className="font-bold text-sm">{toast.message}</span>
          </div>
      )}

      {/* Fejléc */}
      <div className="bg-slate-900 py-12 px-4 text-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <h1 className="text-3xl font-extrabold text-white uppercase tracking-wider relative z-10">
          {isFuel ? 'Tankolás' : 'Szerviz'} <span className="text-amber-500">Rögzítése</span>
        </h1>
        {car && (
          <p className="text-slate-400 mt-2 font-medium relative z-10">
            {car.make} {car.model} ({car.plate})
          </p>
        )}
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-8 relative z-20">
        
        {/* --- AI SCANNER GOMB --- */}
        <div className="mb-6 flex justify-center">
            <label className={`cursor-pointer group relative flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 ${scanning ? 'bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-amber-500/30'}`}>
                {scanning ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>Számla elemzése...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="font-bold">Számla Beolvasása (AI)</span>
                    </>
                )}
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

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 transition-colors">
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded mb-6 text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* onSubmit handlert használunk a jobb UX érdekében */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="car_id" value={carId} />
            <input type="hidden" name="type" value={type} />

            <div className="grid grid-cols-2 gap-4">
               <InputGroup 
                 label="Dátum" 
                 name="event_date" 
                 type="date" 
                 value={formData.date}
                 onChange={handleChange}
                 required 
               />
               <InputGroup 
                 label="Km óra állás" 
                 name="mileage" 
                 type="number" 
                 value={formData.mileage}
                 onChange={handleChange}
                 required 
               />
            </div>

            {isFuel ? (
               <InputGroup 
                 label="Töltőállomás" 
                 name="title" 
                 placeholder="pl. Shell, OMV" 
                 value={formData.title}
                 onChange={handleChange}
                 required 
               />
            ) : (
               <div className="space-y-1">
                 <label htmlFor="title_select" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                   Szerviz Típusa <span className="text-amber-500">*</span>
                 </label>
                 <div className="relative">
                   <select
                     name="title"
                     id="title_select"
                     required
                     value={formData.title} 
                     onChange={handleChange}
                     className="block w-full appearance-none rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-3 px-4 bg-slate-50 dark:bg-slate-700 border transition-all text-slate-900 dark:text-white cursor-pointer"
                   >
                     <option value="" disabled>Válassz a listából...</option>
                     {serviceTypes.map(s => (
                       <option key={s.id} value={s.name}>{s.name}</option>
                     ))}
                     <option value="Egyéb">Egyéb javítás</option>
                   </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                   </div>
                 </div>
               </div>
            )}

            <div className="grid grid-cols-2 gap-4">
               <InputGroup 
                  label="Költség (Ft)" 
                  name="cost" 
                  type="number" 
                  placeholder="0" 
                  value={formData.cost}
                  onChange={handleChange}
                  required 
               />
               {isFuel && (
                 <InputGroup 
                    label="Mennyiség (Liter)" 
                    name="liters" 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={formData.liters}
                    onChange={handleChange}
                    required 
                 />
               )}
            </div>

            {!isFuel && (
               <div className="space-y-1">
                 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Megjegyzés / Részletek</label>
                 <textarea 
                   name="description" 
                   rows={3} 
                   value={formData.description}
                   onChange={handleChange}
                   className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-slate-50 dark:bg-slate-700 border p-3 text-slate-900 dark:text-white dark:placeholder-slate-400" 
                   placeholder="pl. Castrol olaj, MANN szűrő..."
                 ></textarea>
               </div>
            )}

            <InputGroup 
                label="Helyszín (Opcionális)" 
                name="location" 
                placeholder="Budapest" 
                value={formData.location}
                onChange={handleChange}
            />

            <div className="pt-4 flex gap-4 border-t border-slate-100 dark:border-slate-700 mt-6">
              <Link href={`/cars/${carId}`} className="w-1/3 py-3 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-center border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                Mégse
              </Link>
              <button 
                type="submit" 
                disabled={saving}
                className="w-2/3 py-3 rounded-lg bg-amber-500 text-white font-bold shadow-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
              >
                {saving ? 'Mentés...' : 'Mentés'}
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">Betöltés...</div>}>
      <EventForm />
    </Suspense>
  )
}

function InputGroup({ label, name, type = "text", placeholder, required = false, step, value, onChange }: any) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>
      <input 
        type={type} 
        name={name} 
        id={name} 
        step={step} 
        value={value}       
        onChange={onChange} 
        required={required} 
        placeholder={placeholder} 
        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-3 px-4 bg-slate-50 dark:bg-slate-700 border text-slate-900 dark:text-white dark:placeholder-slate-400 transition-colors" 
      />
    </div>
  )
}