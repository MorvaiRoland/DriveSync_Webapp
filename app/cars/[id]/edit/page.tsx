'use client'

import { createBrowserClient } from '@supabase/ssr'
import { updateCar, deleteCar, addTire, deleteTire, swapTire } from '../actions'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import ShareManager from '@/components/ShareManager'

export default function EditCarPage() {
  const params = useParams()
  const carId = params.id as string
  const router = useRouter()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Referenciák
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Állapotok
  const [car, setCar] = useState<any>(null)
  const [tires, setTires] = useState<any[]>([])
  const [shares, setShares] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Státusz állapot
  const [status, setStatus] = useState<string>('active')
  
  // Kép előnézet
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Értesítés (Toast)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  // Adatok betöltése
  useEffect(() => {
    async function fetchData() {
      // 1. Autó
      const { data: carData } = await supabase.from('cars').select('*').eq('id', carId).single()
      if (carData) {
          setCar(carData)
          setStatus(carData.status)
      }

      // 2. Gumik
      const { data: tireData } = await supabase.from('tires').select('*').eq('car_id', carId).order('is_mounted', { ascending: false })
      if (tireData) setTires(tireData)

      // 3. Megosztások
      const { data: shareData } = await supabase.from('car_shares').select('*').eq('car_id', carId)
      if (shareData) setShares(shareData)
      
      setLoading(false)
    }
    fetchData()
  }, [carId])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      showToast('Kép kiválasztva! A véglegesítéshez nyomj a Mentésre.', 'success')
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
        const formData = new FormData(formRef.current!)
        formData.set('status', status) // Státusz felülírása a state-ből
        
        if (fileInputRef.current?.files?.[0]) {
            formData.set('image', fileInputRef.current.files[0])
        }

        await updateCar(formData)
        
        showToast('Sikeres mentés!', 'success')
        router.refresh()
        // Opcionális: kis késleltetés után a saving state kikapcsolása
        setTimeout(() => setSaving(false), 1000)

    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT') {
            showToast('Sikeres mentés!', 'success')
            return;
        }
        
        console.error(error)
        showToast('Hiba történt a mentéskor.', 'error')
        setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">Betöltés...</div>
  if (!car) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-500">Autó nem található</div>

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      
      {/* --- TOAST --- */}
      {toast && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
              <span className="font-bold text-sm">{toast.message}</span>
          </div>
      )}

      <div className="bg-slate-900 py-12 px-4 text-center shadow-lg">
        <h1 className="text-3xl font-extrabold text-white uppercase tracking-wider">
          Jármű <span className="text-amber-500">Szerkesztése</span>
        </h1>
        <p className="text-slate-400 mt-2">{car.make} {car.model} ({car.plate})</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-10">
        
        {/* --- 1. JÁRMŰ ADATOK SZERKESZTÉSE --- */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 mb-8 transition-colors">
          
          <form ref={formRef} onSubmit={handleSave} className="space-y-8">
            <input type="hidden" name="car_id" value={car.id} />

            {/* Képcsere */}
            <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-700 shadow-md mb-4 bg-slate-200 dark:bg-slate-700">
                   {imagePreview || car.image_url ? (
                       <Image src={imagePreview || car.image_url} alt="Car" fill className="object-cover" />
                   ) : (
                       <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                           <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                       </div>
                   )}
                </div>
                <label className="cursor-pointer bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
                    Fénykép módosítása
                    <input type="file" name="image" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                </label>
            </div>

            {/* A) ALAPADATOK */}
            <div>
                <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 mb-4 uppercase text-sm tracking-wider">Alapadatok</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Márka" name="make" defaultValue={car.make} required />
                    <InputGroup label="Modell" name="model" defaultValue={car.model} required />
                    
                    {/* BODY TYPE (KIVITEL) - ÚJ MEZŐ */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Kivitel</label>
                      <select name="body_type" defaultValue={car.body_type || ""} className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2 px-3 bg-white dark:bg-slate-800 border text-slate-900 dark:text-white text-sm">
                        <option value="" disabled>Válassz...</option>
                        <option value="sedan">Sedan / Limuzin</option>
                        <option value="kombi">Kombi / Touring</option>
                        <option value="hatchback">Ferdehátú (Hatchback)</option>
                        <option value="suv">SUV / Terepjáró</option>
                        <option value="crossover">Crossover</option>
                        <option value="coupe">Coupé</option>
                        <option value="cabrio">Cabriolet</option>
                        <option value="mpv">Egyterű (MPV)</option>
                        <option value="pickup">Pickup</option>
                        <option value="van">Kisbusz / Furgon</option>
                      </select>
                      
                    </div>

                    <InputGroup label="Rendszám" name="plate" defaultValue={car.plate} required />
                    <InputGroup label="Évjárat" name="year" type="number" defaultValue={car.year} required />
                    <InputGroup label="Aktuális Km óra állás" name="mileage" type="number" defaultValue={car.mileage} required />
                    <InputGroup label="Szín" name="color" defaultValue={car.color} />
                    <InputGroup label="Alvázszám (VIN)" name="vin" defaultValue={car.vin} />
                </div>
            </div>

            {/* B) TECHNIKAI ADATOK - ÚJ SZEKCIÓ */}
            <div>
                <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 mb-4 uppercase text-sm tracking-wider">Technikai Részletek</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ÜZEMANYAG - KIBŐVÍTVE */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Üzemanyag</label>
                      <select name="fuel_type" defaultValue={car.fuel_type} className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2 px-3 bg-white dark:bg-slate-800 border text-slate-900 dark:text-white text-sm">
                        <option value="Dízel">Dízel</option>
                        <option value="Benzin">Benzin</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Plugin_Hybrid">Plug-in Hybrid</option>
                        <option value="Elektromos">Elektromos</option>
                        <option value="LPG">LPG / Gáz</option>
                      </select>
                    </div>

                    {/* VÁLTÓ - ÚJ MEZŐ */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Váltó</label>
                      <select name="transmission" defaultValue={car.transmission || "manual"} className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2 px-3 bg-white dark:bg-slate-800 border text-slate-900 dark:text-white text-sm">
                        <option value="manual">Manuális</option>
                        <option value="automatic">Automata</option>
                        <option value="cvt">Fokozatmentes (CVT)</option>
                        <option value="robotized">Robotizált</option>
                      </select>
                    </div>

                    {/* MOTOR ADATOK - ÚJ MEZŐK */}
                    <InputGroup label="Hengerűrtartalom (cm³)" name="engine_size" type="number" defaultValue={car.engine_size} placeholder="pl. 1998" />
                    <InputGroup label="Teljesítmény (LE)" name="power_hp" type="number" defaultValue={car.power_hp} placeholder="pl. 150" />
                </div>
            </div>

            {/* C) STÁTUSZ */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Jármű Állapota</label>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                            type="radio" 
                            name="status_radio" 
                            value="active" 
                            checked={status === 'active'} 
                            onChange={() => setStatus('active')}
                            className="w-5 h-5 text-amber-500 focus:ring-amber-500 border-gray-300" 
                        />
                        <span className={`text-sm font-bold ${status === 'active' ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>
                            Aktív (Használatban)
                        </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                            type="radio" 
                            name="status_radio" 
                            value="service" 
                            checked={status === 'service'} 
                            onChange={() => setStatus('service')}
                            className="w-5 h-5 text-amber-500 focus:ring-amber-500 border-gray-300" 
                        />
                        <span className={`text-sm font-bold ${status === 'service' ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'}`}>
                            Szerviz alatt
                        </span>
                    </label>
                </div>
            </div>

            {/* D) OKMÁNYOK */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 text-sm uppercase">
                   Okmányok Érvényessége
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Műszaki Vizsga Lejárata" name="mot_expiry" type="date" defaultValue={car.mot_expiry} />
                    <InputGroup label="Biztosítás Évfordulója" name="insurance_expiry" type="date" defaultValue={car.insurance_expiry} />
                </div>
            </div>

            {/* E) SZERVIZ CIKLUSOK */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800/50">
                <h3 className="font-bold text-amber-800 dark:text-amber-500 border-b border-amber-200 dark:border-amber-800 pb-2 mb-4 text-sm uppercase">
                    Szerviz Ciklusok (Értesítésekhez)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Km Intervallum" name="service_interval_km" type="number" defaultValue={car.service_interval_km || 15000} />
                    <InputGroup label="Idő Intervallum (Nap)" name="service_interval_days" type="number" defaultValue={car.service_interval_days || 365} />
                </div>
            </div>

            <div className="pt-4 flex gap-4 border-t border-slate-100 dark:border-slate-700">
               <Link href={`/cars/${car.id}`} className="w-1/3 py-3 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-center border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Mégse
               </Link>
               <button 
                  type="submit" 
                  disabled={saving}
                  className="w-2/3 py-3 rounded-lg bg-amber-500 text-white font-bold shadow-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
               >
                  {saving ? 'Mentés folyamatban...' : 'Módosítások Mentése'}
               </button>
            </div>
          </form>
        </div>

        {/* --- 2. KÖZÖS GARÁZS (SHARED) --- */}
        <ShareManager carId={car.id} shares={shares} />

        {/* --- 3. GUMIABRONCS HOTEL --- */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 mb-8 transition-colors">
             <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6 flex items-center gap-2">
                Gumiabroncs Hotel
             </h3>
             <div className="space-y-4 mb-8">
                 {tires.length > 0 ? (
                     tires.map((tire: any) => (
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
                                     <form action={async (fd) => { await swapTire(fd); showToast('Gumi felszerelve!', 'success'); router.refresh(); }} className="flex-1">
                                         <input type="hidden" name="car_id" value={car.id} />
                                         <input type="hidden" name="tire_id" value={tire.id} />
                                         <button type="submit" className="w-full px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors">
                                             Felszerel
                                         </button>
                                     </form>
                                 )}
                                 <form action={async (fd) => { await deleteTire(fd); showToast('Gumi törölve.', 'error'); router.refresh(); }} className="flex-shrink-0">
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

             <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                 <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-4 uppercase tracking-wide">Új szett hozzáadása</h4>
                 <form action={async (fd) => { await addTire(fd); showToast('Gumi hozzáadva!', 'success'); router.refresh(); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* --- 4. VESZÉLYZÓNA --- */}
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