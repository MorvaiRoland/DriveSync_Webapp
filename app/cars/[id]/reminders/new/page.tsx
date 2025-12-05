'use client'

import { createBrowserClient } from '@supabase/ssr'
import { addReminder } from '../../actions'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function ReminderForm() {
  const params = useParams()
  const carId = params.id as string
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [car, setCar] = useState<any>(null)
  const [serviceTypes, setServiceTypes] = useState<{id: number, name: string}[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: carData } = await supabase.from('cars').select('*').eq('id', carId).single()
      if (carData) setCar(carData)

      const { data: services } = await supabase.from('service_types').select('*').order('name')
      if (services) setServiceTypes(services)
      
      setLoading(false)
    }
    fetchData()
  }, [carId])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Betöltés...</div>

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <div className="bg-slate-900 py-12 px-4 text-center shadow-lg">
        <h1 className="text-3xl font-extrabold text-white uppercase tracking-wider">
          Szerviz <span className="text-amber-500">Tervezése</span>
        </h1>
        {car && <p className="text-slate-400 mt-2">{car.make} {car.model}</p>}
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <form action={addReminder} className="space-y-6">
            <input type="hidden" name="car_id" value={carId} />

            <div className="space-y-1">
               <label className="block text-sm font-semibold text-slate-700">Szerviz Típusa <span className="text-amber-500">*</span></label>
               <div className="relative">
                 <select name="service_type" required className="block w-full appearance-none rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-3 px-4 bg-slate-50 border text-slate-700 cursor-pointer">
                   <option value="" disabled selected>Mit kell csinálni?</option>
                   {serviceTypes.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                   <option value="Műszaki Vizsga">Műszaki Vizsga</option>
                   <option value="Egyéb">Egyéb karbantartás</option>
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                 </div>
               </div>
            </div>

            <div className="space-y-1">
               <label className="block text-sm font-semibold text-slate-700">Esedékesség Dátuma <span className="text-amber-500">*</span></label>
               <input type="date" name="due_date" required className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-3 px-4 bg-slate-50 border text-slate-900" />
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
               <h4 className="font-bold text-amber-800 text-sm uppercase tracking-wide flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                 Értesítések beállítása
               </h4>
               
               <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-amber-100/50 rounded-lg transition-colors">
                  <input type="checkbox" name="notify_push" className="w-5 h-5 text-amber-500 rounded border-gray-300 focus:ring-amber-500" />
                  <div>
                    <span className="block text-sm font-bold text-slate-800">Push értesítés</span>
                    <span className="block text-xs text-slate-500">Jelzés a telefonon 1 nappal előtte</span>
                  </div>
               </label>

               <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-amber-100/50 rounded-lg transition-colors">
                  <input type="checkbox" name="notify_email" className="w-5 h-5 text-amber-500 rounded border-gray-300 focus:ring-amber-500" />
                  <div>
                    <span className="block text-sm font-bold text-slate-800">Email emlékeztető</span>
                    <span className="block text-xs text-slate-500">Levél küldése 3 nappal előtte</span>
                  </div>
               </label>
            </div>

            <div className="space-y-1">
               <label className="block text-sm font-semibold text-slate-700">Megjegyzés (Opcionális)</label>
               <textarea name="note" rows={2} className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-slate-50 border p-3 text-slate-900" placeholder="pl. Bosch szervizbe vinni, alkatrészt megrendelni..."></textarea>
            </div>

            <div className="pt-4 flex gap-4 border-t border-slate-100 mt-6">
              <Link href={`/cars/${carId}`} className="w-1/3 py-3 rounded-lg text-slate-600 font-bold text-center border border-slate-200 hover:bg-slate-50 flex items-center justify-center">Mégse</Link>
              <button type="submit" className="w-2/3 py-3 rounded-lg bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 transition-all transform active:scale-[0.98]">Emlékeztető Mentése</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function NewReminderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50">Betöltés...</div>}>
      <ReminderForm />
    </Suspense>
  )
}