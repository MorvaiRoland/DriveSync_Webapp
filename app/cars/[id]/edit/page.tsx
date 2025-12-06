import { createClient } from 'supabase/server'
import { updateCar, deleteCar } from '../actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'

export default async function EditCarPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  // Autó lekérése (Most már az intervallumokat is hozza a *)
  const { data: car, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !car) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* Fejléc */}
      <div className="bg-slate-900 pt-12 pb-24 px-4 text-center shadow-lg">
        <h1 className="text-3xl font-extrabold text-white uppercase tracking-wider">
          Jármű <span className="text-amber-500">Beállítások</span>
        </h1>
        <p className="text-slate-400 mt-2">{car.make} {car.model} ({car.plate})</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10">
        
        {/* --- SZERKESZTŐ FORM --- */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 mb-8">
          <form action={updateCar} className="space-y-8">
            <input type="hidden" name="car_id" value={car.id} />

            {/* Képcsere */}
            <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-md mb-4 bg-slate-200">
                   {car.image_url ? (
                       <Image src={car.image_url} alt="Car" fill className="object-cover" />
                   ) : (
                       <div className="w-full h-full flex items-center justify-center text-slate-400">
                           <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                       </div>
                   )}
                </div>
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                    Fénykép módosítása
                    <input type="file" name="image" accept="image/*" className="hidden" />
                </label>
            </div>

            {/* Alapadatok */}
            <div>
                <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Alapadatok</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Márka" name="make" defaultValue={car.make} required />
                    <InputGroup label="Modell" name="model" defaultValue={car.model} required />
                    <InputGroup label="Rendszám" name="plate" defaultValue={car.plate} required />
                    <InputGroup label="Évjárat" name="year" type="number" defaultValue={car.year} required />
                    <InputGroup label="Aktuális Km óra állás" name="mileage" type="number" defaultValue={car.mileage} required />
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-slate-700">Üzemanyag</label>
                      <select name="fuel_type" defaultValue={car.fuel_type} className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-3 px-4 bg-slate-50 border">
                        <option value="diesel">Dízel</option>
                        <option value="petrol">Benzin</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="electric">Elektromos</option>
                        <option value="lpg">LPG</option>
                      </select>
                    </div>
                    <InputGroup label="Szín" name="color" defaultValue={car.color} />
                    <InputGroup label="Alvázszám (VIN)" name="vin" defaultValue={car.vin} />
                </div>
            </div>

            {/* Szerviz Intervallum Beállítások (ÚJ SZEKCIÓ) */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <h3 className="font-bold text-amber-800 border-b border-amber-200 pb-2 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                    Szerviz Ciklusok
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup 
                        label="Km Intervallum (pl. 15000)" 
                        name="service_interval_km" 
                        type="number" 
                        defaultValue={car.service_interval_km || 15000} 
                        placeholder="15000"
                    />
                    <InputGroup 
                        label="Idő Intervallum (Nap)" 
                        name="service_interval_days" 
                        type="number" 
                        defaultValue={car.service_interval_days || 365} 
                        placeholder="365"
                    />
                </div>
                <p className="text-xs text-amber-700 mt-2">
                    A rendszer ezeket az értékeket használja a szerviz állapot (zöld/sárga/piros) kiszámításához.
                </p>
            </div>

            <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Státusz</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="status" value="active" defaultChecked={car.status === 'active'} className="text-amber-500 focus:ring-amber-500" />
                        <span className="text-slate-700">Aktív</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="status" value="service" defaultChecked={car.status === 'service'} className="text-amber-500 focus:ring-amber-500" />
                        <span className="text-slate-700">Szervizben</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="status" value="sold" defaultChecked={car.status === 'sold'} className="text-amber-500 focus:ring-amber-500" />
                        <span className="text-slate-700">Eladva / Inaktív</span>
                    </label>
                </div>
            </div>

            <div className="pt-4 flex gap-4 border-t border-slate-100">
               <Link href={`/cars/${car.id}`} className="w-1/3 py-3 rounded-lg text-slate-600 font-bold text-center border border-slate-200 hover:bg-slate-50 transition-colors">
                 Mégse
               </Link>
               <button type="submit" className="w-2/3 py-3 rounded-lg bg-amber-500 text-white font-bold shadow-lg hover:bg-amber-400 transition-all">
                 Mentés
               </button>
            </div>
          </form>
        </div>

        {/* --- VESZÉLYZÓNA (TÖRLÉS) --- */}
        <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
            <h3 className="text-red-800 font-bold text-lg mb-2">Veszélyzóna</h3>
            <p className="text-red-600/80 text-sm mb-4">
                A jármű törlése végleges. Minden hozzá tartozó tankolás, szerviz és emlékeztető is törlődik.
            </p>
            <form action={deleteCar}>
                <input type="hidden" name="car_id" value={car.id} />
                <button 
                    type="submit" 
                    className="w-full py-3 rounded-lg border-2 border-red-500 text-red-600 font-bold hover:bg-red-50 hover:text-white transition-all uppercase text-sm tracking-wider"
                >
                    Jármű Végleges Törlése
                </button>
            </form>
        </div>

      </div>
    </div>
  )
}

function InputGroup({ label, name, type = "text", placeholder, defaultValue, required = false }: any) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-semibold text-slate-700">{label}</label>
      <input 
        type={type} 
        name={name} 
        id={name} 
        defaultValue={defaultValue}
        required={required} 
        placeholder={placeholder} 
        className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-3 px-4 bg-slate-50 border text-slate-900 transition-colors" 
      />
    </div>
  )
}