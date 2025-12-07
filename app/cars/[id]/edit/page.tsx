import { createClient } from 'supabase/server'
import { updateCar, deleteCar, addTire, deleteTire, swapTire } from '../actions' // Importáljuk az új actionöket
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'

export default async function EditCarPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  // 1. Autó lekérése
  const { data: car, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !car) {
    return notFound()
  }

  // 2. Gumik lekérése
  const { data: tires } = await supabase
    .from('tires')
    .select('*')
    .eq('car_id', params.id)
    .order('is_mounted', { ascending: false }) // A felszerelt legyen elől

  const safeTires = tires || []

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      
      <div className="bg-slate-900 py-12 px-4 text-center shadow-lg">
        <h1 className="text-3xl font-extrabold text-white uppercase tracking-wider">
          Jármű <span className="text-amber-500">Beállítások</span>
        </h1>
        <p className="text-slate-400 mt-2">{car.make} {car.model} ({car.plate})</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-10">
        
        {/* --- 1. JÁRMŰ ADATOK SZERKESZTÉSE --- */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 mb-8 transition-colors">
          <form action={updateCar} className="space-y-8">
            <input type="hidden" name="car_id" value={car.id} />

            {/* Képcsere */}
            <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-700 shadow-md mb-4 bg-slate-200 dark:bg-slate-700">
                   {car.image_url ? (
                       <Image src={car.image_url} alt="Car" fill className="object-cover" />
                   ) : (
                       <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                           <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                       </div>
                   )}
                </div>
                <label className="cursor-pointer bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                    Fénykép módosítása
                    <input type="file" name="image" accept="image/*" className="hidden" />
                </label>
            </div>

            {/* Alapadatok */}
            <div>
                <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">Alapadatok</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Márka" name="make" defaultValue={car.make} required />
                    <InputGroup label="Modell" name="model" defaultValue={car.model} required />
                    <InputGroup label="Rendszám" name="plate" defaultValue={car.plate} required />
                    <InputGroup label="Évjárat" name="year" type="number" defaultValue={car.year} required />
                    <InputGroup label="Aktuális Km óra állás" name="mileage" type="number" defaultValue={car.mileage} required />
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Üzemanyag</label>
                      <select name="fuel_type" defaultValue={car.fuel_type} className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2 px-3 bg-white dark:bg-slate-800 border text-slate-900 dark:text-white text-sm transition-colors">
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

            {/* Okmányok */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
                   <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   Okmányok Érvényessége
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Műszaki Vizsga Lejárata" name="mot_expiry" type="date" defaultValue={car.mot_expiry} />
                    <InputGroup label="Biztosítás Évfordulója" name="insurance_expiry" type="date" defaultValue={car.insurance_expiry} />
                </div>
            </div>

            {/* Szerviz Intervallum */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800/50">
                <h3 className="font-bold text-amber-800 dark:text-amber-500 border-b border-amber-200 dark:border-amber-800 pb-2 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                    Szerviz Ciklusok
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Km Intervallum" name="service_interval_km" type="number" defaultValue={car.service_interval_km || 15000} />
                    <InputGroup label="Idő Intervallum (Nap)" name="service_interval_days" type="number" defaultValue={car.service_interval_days || 365} />
                </div>
            </div>

            <div className="pt-4 flex gap-4 border-t border-slate-100 dark:border-slate-700">
               <Link href={`/cars/${car.id}`} className="w-1/3 py-3 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-center border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Mégse</Link>
               <button type="submit" className="w-2/3 py-3 rounded-lg bg-amber-500 text-white font-bold shadow-lg hover:bg-amber-400 transition-all">Mentés</button>
            </div>
          </form>
        </div>

        {/* --- 2. GUMIABRONCS HOTEL (ÚJ) --- */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 mb-8 transition-colors">
             <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-slate-700 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Gumiabroncs Hotel
             </h3>

             {/* Gumik listázása */}
             <div className="space-y-4 mb-8">
                 {safeTires.length > 0 ? (
                     safeTires.map((tire: any) => (
                         <div key={tire.id} className={`border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${tire.is_mounted ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                             <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${tire.is_mounted ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                                     {tire.type === 'winter' ? '❄️' : tire.type === 'summer' ? '☀️' : '🌤️'}
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-slate-900 dark:text-white">{tire.brand} {tire.model}</h4>
                                     <p className="text-xs text-slate-500 dark:text-slate-400">{tire.size} • DOT: {tire.dot}</p>
                                     <p className="text-xs font-mono mt-1 dark:text-slate-300">Futott: {tire.total_distance.toLocaleString()} km {tire.is_mounted && <span className="text-emerald-600 dark:text-emerald-400 font-bold">(Felszerelve)</span>}</p>
                                 </div>
                             </div>
                             
                             <div className="flex gap-2 w-full sm:w-auto">
                                 {!tire.is_mounted && (
                                     <form action={swapTire} className="flex-1">
                                         <input type="hidden" name="car_id" value={car.id} />
                                         <input type="hidden" name="tire_id" value={tire.id} />
                                         <button type="submit" className="w-full px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors">
                                             Felszerel
                                         </button>
                                     </form>
                                 )}
                                 <form action={deleteTire} className="flex-shrink-0">
                                     <input type="hidden" name="car_id" value={car.id} />
                                     <input type="hidden" name="tire_id" value={tire.id} />
                                     <button type="submit" className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors" title="Törlés">
                                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                     </button>
                                 </form>
                             </div>
                         </div>
                     ))
                 ) : (
                     <p className="text-center text-slate-400 text-sm italic py-4">Még nincs rögzített gumiabroncs.</p>
                 )}
             </div>

             {/* Új Gumi Hozzáadása Form */}
             <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                 <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-4 uppercase tracking-wide">Új szett hozzáadása</h4>
                 <form action={addTire} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <input type="hidden" name="car_id" value={car.id} />
                     
                     <div className="space-y-1">
                         <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Típus</label>
                         <select name="type" className="block w-full rounded-lg border-slate-300 dark:border-slate-600 py-2 px-3 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                             <option value="summer">Nyári ☀️</option>
                             <option value="winter">Téli ❄️</option>
                             <option value="all_season">Négyévszakos 🌤️</option>
                         </select>
                     </div>
                     <InputGroup label="Márka (pl. Michelin)" name="brand" required />
                     <InputGroup label="Modell (pl. Alpin 6)" name="model" />
                     <InputGroup label="Méret (pl. 205/55 R16)" name="size" required />
                     <InputGroup label="DOT (pl. 2423)" name="dot" placeholder="HHÉÉ" />
                     <InputGroup label="Eddigi futás (km)" name="total_distance" type="number" defaultValue={0} />

                     <div className="md:col-span-2 pt-2">
                         <button type="submit" className="w-full py-2.5 rounded-lg bg-slate-800 dark:bg-slate-700 text-white font-bold text-sm hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors">
                             Szett Mentése
                         </button>
                     </div>
                 </form>
             </div>
        </div>

        {/* --- 3. VESZÉLYZÓNA --- */}
        <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-200 dark:border-red-900/30 mb-8">
            <h3 className="text-red-800 dark:text-red-400 font-bold text-lg mb-2">Veszélyzóna</h3>
            <p className="text-red-600/80 dark:text-red-400/80 text-sm mb-4">
                A jármű törlése végleges. Minden hozzá tartozó tankolás, szerviz és emlékeztető is törlődik.
            </p>
            <form action={deleteCar}>
                <input type="hidden" name="car_id" value={car.id} />
                <button type="submit" className="w-full py-3 rounded-lg border-2 border-red-500 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-white transition-all uppercase text-sm tracking-wider">
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
      <label htmlFor={name} className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</label>
      <input 
        type={type} 
        name={name} 
        id={name} 
        defaultValue={defaultValue}
        required={required} 
        placeholder={placeholder} 
        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2 px-3 bg-white dark:bg-slate-800 border text-slate-900 dark:text-white dark:placeholder-slate-500 transition-colors text-sm" 
      />
    </div>
  )
}