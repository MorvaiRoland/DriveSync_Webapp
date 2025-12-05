import { createClient } from 'supabase/server'
import { addEvent } from '../../actions'
import Link from 'next/link'

export default async function NewEventPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ type: string }> }) {
  const params = await props.params
  const searchParams = await props.searchParams
  const supabase = await createClient()
  
  const type = searchParams.type === 'service' ? 'service' : 'fuel' // Alapértelmezett a tankolás
  const isFuel = type === 'fuel'

  // Autó lekérése a fejléchez
  const { data: car } = await supabase.from('cars').select('*').eq('id', params.id).single()

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <div className="bg-slate-900 py-12 px-4 text-center">
        <h1 className="text-3xl font-extrabold text-white uppercase tracking-wider">
          {isFuel ? 'Tankolás' : 'Szerviz'} <span className="text-amber-500">Rögzítése</span>
        </h1>
        <p className="text-slate-400 mt-2">{car?.make} {car?.model} ({car?.plate})</p>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <form action={addEvent} className="space-y-6">
            <input type="hidden" name="car_id" value={params.id} />
            <input type="hidden" name="type" value={type} />

            <div className="grid grid-cols-2 gap-4">
               <InputGroup label="Dátum" name="event_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
               <InputGroup label="Km óra állás" name="mileage" type="number" placeholder={car?.mileage} required />
            </div>

            <InputGroup 
              label={isFuel ? "Töltőállomás" : "Szerviz neve"} 
              name="title" 
              placeholder={isFuel ? "pl. Shell, OMV" : "pl. Bosch Car Service"} 
              required 
            />

            <div className="grid grid-cols-2 gap-4">
               <InputGroup label="Költség (Ft)" name="cost" type="number" placeholder="0" required />
               {isFuel && (
                 <InputGroup label="Mennyiség (Liter)" name="liters" type="number" step="0.01" placeholder="0.00" required />
               )}
            </div>

            {!isFuel && (
               <div className="space-y-1">
                 <label className="block text-sm font-semibold text-slate-700">Elvégzett munkák</label>
                 <textarea name="description" rows={3} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-slate-50 border p-3" placeholder="pl. Olajcsere, szűrők..."></textarea>
               </div>
            )}

            <InputGroup label="Helyszín (Opcionális)" name="location" placeholder="Budapest" />

            <div className="pt-4 flex gap-4">
              <Link href={`/cars/${params.id}`} className="w-1/3 py-3 rounded-lg text-slate-600 font-bold text-center border border-slate-200 hover:bg-slate-50">
                Mégse
              </Link>
              <button type="submit" className="w-2/3 py-3 rounded-lg bg-amber-500 text-white font-bold shadow-lg hover:bg-amber-400 transition-all">
                Mentés
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function InputGroup({ label, name, type = "text", placeholder, required = false, step, defaultValue }: any) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-semibold text-slate-700">{label}</label>
      <input type={type} name={name} step={step} defaultValue={defaultValue} required={required} placeholder={placeholder} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 px-3 bg-slate-50 border" />
    </div>
  )
}