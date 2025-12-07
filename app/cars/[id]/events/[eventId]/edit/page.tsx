import { createClient } from 'supabase/server'
import { updateEvent } from '../../../actions' // Ellenőrizd, hogy az útvonal helyes-e a te mappaszerkezetedben!
import Link from 'next/link'

export default async function EditEventPage(props: { params: Promise<{ id: string, eventId: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  // Ellenőrizzük, hogy megkaptuk-e az ID-kat
  if (!params.id || !params.eventId) {
    return <div className="p-10 text-center text-red-600 dark:text-red-400">Hiba: Hiányzó URL paraméterek.</div>
  }

  // 1. Lekérjük a szerkesztendő eseményt az adatbázisból
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.eventId)
    .single()

  // Hibakezelés látható módon
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-red-200 dark:border-red-900/30 text-center max-w-md">
          <div className="text-red-500 dark:text-red-400 text-xl font-bold mb-2">Hiba történt az adatok betöltésekor</div>
          <p className="text-slate-600 dark:text-slate-300 mb-4">{error.message}</p>
          <Link href={`/cars/${params.id}`} className="text-amber-600 dark:text-amber-500 font-bold hover:underline">Vissza az autóra</Link>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-slate-900 dark:text-white text-xl font-bold mb-2">A keresett bejegyzés nem található.</div>
          <Link href={`/cars/${params.id}`} className="text-amber-600 dark:text-amber-500 font-bold hover:underline">Vissza az autóra</Link>
        </div>
      </div>
    )
  }

  // 2. Lekérjük az autót is a fejléchez
  const { data: car } = await supabase
    .from('cars')
    .select('make, model, plate')
    .eq('id', params.id)
    .single()

  const isFuel = event.type === 'fuel'

  return (
    // Fő konténer sötét móddal
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      
      {/* Fejléc - ez maradhat sötét alapból, mert jól néz ki */}
      <div className="bg-slate-900 py-12 px-4 text-center shadow-lg">
        <h1 className="text-3xl font-extrabold text-white uppercase tracking-wider">
          Bejegyzés <span className="text-amber-500">Szerkesztése</span>
        </h1>
        {car && (
          <p className="text-slate-400 mt-2 font-medium">
            {car.make} {car.model} ({car.plate})
          </p>
        )}
      </div>

      {/* Űrlap Konténer */}
      <div className="max-w-xl mx-auto px-4 -mt-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 transition-colors">
          
          <form action={updateEvent} className="space-y-6">
            {/* Rejtett mezők az azonosításhoz */}
            <input type="hidden" name="event_id" value={params.eventId} />
            <input type="hidden" name="car_id" value={params.id} />
            <input type="hidden" name="type" value={event.type} />

            {/* Dátum és Km óra */}
            <div className="grid grid-cols-2 gap-4">
               <InputGroup 
                 label="Dátum" 
                 name="event_date" 
                 type="date" 
                 defaultValue={event.event_date} 
                 required 
               />
               <InputGroup 
                 label="Km óra állás" 
                 name="mileage" 
                 type="number" 
                 defaultValue={event.mileage} 
                 required 
               />
            </div>

            {/* Cím (Szerviz neve vagy Töltőállomás) */}
            <InputGroup 
              label={isFuel ? "Töltőállomás" : "Szerviz neve"} 
              name="title" 
              defaultValue={event.title}
              required 
            />

            {/* Költség és Liter (ha tankolás) */}
            <div className="grid grid-cols-2 gap-4">
               <InputGroup 
                 label="Költség (Ft)" 
                 name="cost" 
                 type="number" 
                 defaultValue={event.cost} 
                 required 
               />
               {isFuel && (
                 <InputGroup 
                   label="Mennyiség (Liter)" 
                   name="liters" 
                   type="number" 
                   step="0.01" 
                   defaultValue={event.liters} 
                   required 
                 />
               )}
            </div>

            {/* Leírás (csak ha nem tankolás) */}
            {!isFuel && (
               <div className="space-y-1">
                 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Elvégzett munkák</label>
                 <textarea 
                   name="description" 
                   rows={3} 
                   defaultValue={event.description || ''}
                   className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-slate-50 dark:bg-slate-700 border p-3 text-slate-900 dark:text-white dark:placeholder-slate-400 transition-colors" 
                 />
               </div>
            )}

            {/* Helyszín */}
            <InputGroup 
              label="Helyszín" 
              name="location" 
              defaultValue={event.location || ''} 
            />

            {/* Gombok */}
            <div className="pt-6 flex gap-4 border-t border-slate-100 dark:border-slate-700 mt-6">
              <Link 
                href={`/cars/${params.id}`} 
                className="w-1/3 py-3 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-center border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
              >
                Mégse
              </Link>
              <button 
                type="submit" 
                className="w-2/3 py-3 rounded-lg bg-amber-500 text-white font-bold shadow-lg hover:bg-amber-400 transition-all transform active:scale-[0.98]"
              >
                Frissítés Mentése
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Segéd komponens az inputokhoz (sötétítve)
function InputGroup({ label, name, type = "text", placeholder, required = false, step, defaultValue }: any) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <input 
        type={type} 
        name={name} 
        id={name}
        step={step} 
        defaultValue={defaultValue} 
        required={required} 
        placeholder={placeholder} 
        className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 px-3 bg-slate-50 dark:bg-slate-700 border text-slate-900 dark:text-white dark:placeholder-slate-400 transition-colors" 
      />
    </div>
  )
}