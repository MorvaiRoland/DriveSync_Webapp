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
  const [scanning, setScanning] = useState(false) 
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [aiFilled, setAiFilled] = useState<string[]>([])
  const [showAiDisclaimer, setShowAiDisclaimer] = useState(false)

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  // JAVÍTÁS: A dátumot biztonságos "YYYY-MM-DD" stringként inicializáljuk
  // (A new Date().toISOString() néha bezavarhat az időzónák miatt)
  const today = new Date().toLocaleDateString('en-CA'); // Ez mindig YYYY-MM-DD formátumot ad

  const [formData, setFormData] = useState({
      date: today,
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

              // JAVÍTÁS: Ha az AI nem talál dátumot, ne írjuk felül üresre
              let newDate = aiData.date || formData.date;

              setFormData(prev => ({
                  ...prev,
                  title: newTitle, 
                  date: newDate,
                  cost: aiData.cost || prev.cost,
                  location: aiData.location || prev.location,
                  liters: aiData.liters || prev.liters,
                  description: aiData.description || prev.description,
                  mileage: aiData.mileage || prev.mileage 
              }))

              const filledFields = []
              if (aiData.title) filledFields.push('title')
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

  // JAVÍTOTT handleChange: Egyszerűen átvesszük az értéket
  const handleChange = (e: any) => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">Betöltés...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      
      {toast && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
              <span className="font-bold text-sm">{toast.message}</span>
          </div>
      )}

      {scanning && (
          <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
              <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-bold animate-pulse">Az AI elemzi a számlát...</p>
              <p className="text-sm text-slate-400">Kérlek várj egy pillanatot</p>
          </div>
      )}

      <div className="bg-slate-900 py-10 px-4 text-center shadow-lg relative overflow-hidden">
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

      <div className="max-w-xl mx-auto px-4 -mt-6 relative z-20">
        
        <div className="mb-6 flex justify-center">
            <label className={`cursor-pointer group relative w-full sm:w-auto flex justify-center items-center gap-3 px-6 py-4 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-amber-500/30`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="font-bold">Számla Beolvasása (AI)</span>
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

        {showAiDisclaimer && (
            <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                    <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">Ellenőrizd az adatokat!</h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-1">Az AI nagy pontossággal dolgozik, de előfordulhatnak tévedések. Kérlek, nézd át a sárgával jelölt mezőket mentés előtt.</p>
                </div>
                <button onClick={() => setShowAiDisclaimer(false)} className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 transition-colors">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="car_id" value={carId} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="min-w-0">
                   <InputGroup 
                     label="Dátum" 
                     name="event_date" 
                     type="date" 
                     value={formData.date}
                     onChange={handleChange}
                     required 
                   />
               </div>
               <div className="min-w-0">
                   <InputGroup 
                     label="Km óra állás" 
                     name="mileage" 
                     type="number" 
                     value={formData.mileage}
                     onChange={handleChange}
                     highlight={aiFilled.includes('mileage')} 
                     required 
                   />
               </div>
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
                     className={`block w-full appearance-none h-11 rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-base sm:text-sm px-4 bg-slate-50 dark:bg-slate-700 border transition-all text-slate-900 dark:text-white cursor-pointer ${aiFilled.includes('title') ? 'ring-2 ring-amber-400 bg-amber-50 dark:bg-amber-900/20' : ''}`}
                   >
                     <option value="" disabled>Válassz...</option>
                     {formData.title && !serviceTypes.some(s => s.name === formData.title) && formData.title !== 'Egyéb' && (
                         <option value={formData.title}>{formData.title}</option>
                     )}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="min-w-0">
                   <InputGroup 
                      label="Költség (Ft)" 
                      name="cost" 
                      type="number" 
                      placeholder="0" 
                      value={formData.cost}
                      onChange={handleChange}
                      highlight={aiFilled.includes('cost')}
                      required 
                   />
               </div>
               {isFuel && (
                 <div className="min-w-0">
                     <InputGroup 
                        label="Mennyiség (Liter)" 
                        name="liters" 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        value={formData.liters}
                        onChange={handleChange}
                        highlight={aiFilled.includes('liters')}
                        required 
                     />
                 </div>
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
                   className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-slate-50 dark:bg-slate-700 border p-3 text-slate-900 dark:text-white dark:placeholder-slate-400 text-base sm:text-sm transition-colors" 
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
                highlight={aiFilled.includes('location')}
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

// JAVÍTOTT InputGroup: Fix magasság (h-11) és appearance-none
function InputGroup({ label, name, type = "text", placeholder, required = false, step, value, onChange, highlight }: any) {
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
        className={`block w-full appearance-none h-11 rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 px-4 bg-slate-50 dark:bg-slate-700 border text-slate-900 dark:text-white dark:placeholder-slate-400 text-base sm:text-sm transition-all duration-500 ${highlight ? 'ring-2 ring-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-300' : ''}`} 
      />
    </div>
  )
}