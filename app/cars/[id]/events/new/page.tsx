'use client'

import { createBrowserClient } from '@supabase/ssr'
import { addEvent } from '../../actions'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function EventForm() {
  const params = useParams()
  const searchParams = useSearchParams()
  const carId = params.id as string
  const error = searchParams.get('error')
  
  // Alapértelmezett típus: fuel (tankolás), ha nincs megadva
  const type = searchParams.get('type') === 'service' ? 'service' : 'fuel'
  const isFuel = type === 'fuel'

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [car, setCar] = useState<any>(null)
  const [serviceTypes, setServiceTypes] = useState<{id: number, name: string}[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      // 1. Autó adatainak lekérése
      const { data: carData } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .single()
      
      if (carData) setCar(carData)

      // 2. Szerviz típusok lekérése (csak ha szervizt rögzítünk)
      if (!isFuel) {
        const { data: services } = await supabase
          .from('service_types')
          .select('*')
          .order('name')
        
        if (services) setServiceTypes(services)
      }
      
      setLoading(false)
    }
    fetchData()
  }, [carId, isFuel])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">Betöltés...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      <div className="bg-slate-900 py-12 px-4 text-center shadow-lg">
        <h1 className="text-3xl font-extrabold text-white uppercase tracking-wider">
          {isFuel ? 'Tankolás' : 'Szerviz'} <span className="text-amber-500">Rögzítése</span>
        </h1>
        {car && (
          <p className="text-slate-400 mt-2 font-medium">
            {car.make} {car.model} ({car.plate})
          </p>
        )}
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded mb-6 text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <form action={addEvent} className="space-y-6">
            <input type="hidden" name="car_id" value={carId} />
            <input type="hidden" name="type" value={type} />

            <div className="grid grid-cols-2 gap-4">
               <InputGroup 
                 label="Dátum" 
                 name="event_date" 
                 type="date" 
                 defaultValue={new Date().toISOString().split('T')[0]} 
                 required 
               />
               <InputGroup 
                 label="Km óra állás" 
                 name="mileage" 
                 type="number" 
                 defaultValue={car?.mileage} 
                 required 
               />
            </div>

            {/* DINAMIKUS MEZŐ: Tankolásnál szöveg, Szerviznél lista */}
            {isFuel ? (
               <InputGroup 
                 label="Töltőállomás" 
                 name="title" 
                 placeholder="pl. Shell, OMV" 
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
                     className="block w-full appearance-none rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-3 px-4 bg-slate-50 dark:bg-slate-700 border transition-all text-slate-900 dark:text-white cursor-pointer"
                   >
                     <option value="" disabled selected>Válassz a listából...</option>
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
               <InputGroup label="Költség (Ft)" name="cost" type="number" placeholder="0" required />
               {isFuel && (
                 <InputGroup label="Mennyiség (Liter)" name="liters" type="number" step="0.01" placeholder="0.00" required />
               )}
            </div>

            {!isFuel && (
               <div className="space-y-1">
                 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Megjegyzés / Részletek</label>
                 <textarea 
                   name="description" 
                   rows={3} 
                   className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-slate-50 dark:bg-slate-700 border p-3 text-slate-900 dark:text-white dark:placeholder-slate-400" 
                   placeholder="pl. Castrol olaj, MANN szűrő..."
                 ></textarea>
               </div>
            )}

            <InputGroup label="Helyszín (Opcionális)" name="location" placeholder="Budapest" />

            <div className="pt-4 flex gap-4 border-t border-slate-100 dark:border-slate-700 mt-6">
              <Link href={`/cars/${carId}`} className="w-1/3 py-3 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-center border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center">
                Mégse
              </Link>
              <button type="submit" className="w-2/3 py-3 rounded-lg bg-amber-500 text-white font-bold shadow-lg hover:bg-amber-400 transition-all transform active:scale-[0.98]">
                Mentés
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Fő oldal komponens Suspense-szel
export default function NewEventPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">Betöltés...</div>}>
      <EventForm />
    </Suspense>
  )
}

// Segéd komponens (Input mezők sötétítése)
function InputGroup({ label, name, type = "text", placeholder, required = false, step, defaultValue }: any) {
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
        defaultValue={defaultValue} 
        required={required} 
        placeholder={placeholder} 
        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-3 px-4 bg-slate-50 dark:bg-slate-700 border text-slate-900 dark:text-white dark:placeholder-slate-400 transition-colors" 
      />
    </div>
  )
}