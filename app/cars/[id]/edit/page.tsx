'use client'

import { createBrowserClient } from '@supabase/ssr'
import { updateCar, deleteCar, addTire, deleteTire, swapTire } from '../actions'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import ShareManager from '@/components/ShareManager'
import { 
  ArrowLeft, Upload, CheckCircle2, AlertCircle, 
  Trash2, CarFront, Disc, Snowflake, Sun, 
  ShieldAlert, Settings, Wrench, Fuel
} from 'lucide-react'

export default function EditCarPage() {
  const params = useParams()
  const carId = params.id as string
  const router = useRouter()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const [car, setCar] = useState<any>(null)
  const [tires, setTires] = useState<any[]>([])
  const [shares, setShares] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<string>('active')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  // --- 🛡️ BIZTONSÁGI JAVÍTÁS: ADATBETÖLTÉS ÉS JOGOSULTSÁG ELLENŐRZÉS 🛡️ ---
  useEffect(() => {
    async function fetchData() {
      // 1. Megnézzük, ki van bejelentkezve
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
          router.push('/login')
          return
      }

      // 2. Lekérjük az autót
      const { data: carData, error } = await supabase.from('cars').select('*').eq('id', carId).single()
      
      if (error || !carData) {
          // Ha nincs autó, vagy hiba van -> Vissza a főoldalra
          router.push('/')
          return
      }

      // 3. Lekérjük a megosztásokat (hogy tudjuk, jogosult-e a szerkesztésre)
      const { data: shareData } = await supabase.from('car_shares').select('*').eq('car_id', carId)
      
      // --- 🛡️ A KIDOBÓEMBER: JOGOSULTSÁG ELLENŐRZÉS 🛡️ ---
      const isOwner = carData.user_id === user.id
      // Ellenőrizzük, hogy a user emailje benne van-e a megosztásokban
      const isSharedUser = shareData?.some(share => share.email === user.email)

      // Ha NEM tulajdonos és NEM is osztották meg vele -> Redirect
      if (!isOwner && !isSharedUser) {
          console.warn("Jogosulatlan hozzáférési kísérlet!")
          router.push('/') // Visszadobjuk a főoldalra
          return
      }
      // -----------------------------------------------------

      // Ha átjutott az ellenőrzésen, beállítjuk az adatokat
      setCar(carData)
      setStatus(carData.status)
      if (shareData) setShares(shareData)

      const { data: tireData } = await supabase.from('tires').select('*').eq('car_id', carId).order('is_mounted', { ascending: false })
      if (tireData) setTires(tireData)
      
      setLoading(false)
    }
    fetchData()
  }, [carId, router, supabase])

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
        formData.set('status', status) 
        
        if (fileInputRef.current?.files?.[0]) {
            formData.set('image', fileInputRef.current.files[0])
        }

        await updateCar(formData)
        
        showToast('Sikeres mentés!', 'success')
        router.refresh()
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
  
  // Extra védelem rendereléskor is (bár a useEffect elkapja)
  if (!car) return null 

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500 relative overflow-x-hidden">
      
      {/* NOTCH PADDING BOTTOM - Biztosítja, hogy az alja ne csússzon a Home Bar alá */}
      <div className="pb-[env(safe-area-inset-bottom)]">

        {/* HÁTTÉR EFFEKTEK */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[80px] md:blur-[120px] animate-pulse-slow"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
        </div>

        {/* TOAST - Safe area figyelembevételével */}
        {toast && (
            <div className={`fixed top-[calc(1.5rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 backdrop-blur-md border border-white/10 ${toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <span className="font-bold text-sm leading-tight">{toast.message}</span>
            </div>
        )}

        {/* --- HERO HEADER --- */}
        {/* pt-[calc(env(safe-area-inset-top)+2rem)] - Ez kezeli a Notch-ot felül */}
        <div className="relative pt-[calc(env(safe-area-inset-top)+2rem)] pb-10 md:pb-16 px-4 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
              <Link href={`/cars/${carId}`} className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 text-xs md:text-sm font-bold bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                  <ArrowLeft className="w-4 h-4" /> Vissza az autóhoz
              </Link>
              
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                  Jármű <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 block md:inline">Szerkesztése</span>
              </h1>
              
              <p className="text-slate-500 dark:text-slate-400 font-medium relative z-10 text-sm md:text-base">
                  {car.make} {car.model} ({car.plate})
              </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-6 relative z-20 pb-10">
          
          {/* --- 1. JÁRMŰ ADATOK SZERKESZTÉSE --- */}
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl md:rounded-[2.5rem] shadow-xl p-5 md:p-10 border border-white/20 dark:border-slate-700 mb-8 overflow-hidden relative group">
            
            <form ref={formRef} onSubmit={handleSave} className="space-y-8 md:space-y-10 relative z-10">
              <input type="hidden" name="car_id" value={car.id} />

              {/* KÉPCSERE */}
              <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl md:rounded-[2rem] overflow-hidden border-4 border-white/50 dark:border-slate-700 shadow-2xl mb-4 md:mb-6 bg-slate-200 dark:bg-slate-800 group/image cursor-pointer hover:scale-105 transition-transform duration-500">
                      {imagePreview || car.image_url ? (
                          <Image src={imagePreview || car.image_url} alt="Car" fill className="object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                              <CarFront className="w-12 h-12 md:w-16 md:h-16 opacity-50" />
                          </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity backdrop-blur-sm">
                          <Upload className="w-8 h-8 text-white" />
                      </div>
                      <input type="file" name="image" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" ref={fileInputRef} onChange={handleImageChange} />
                  </div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs md:text-sm font-bold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors uppercase tracking-wider flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/10 rounded-full">
                      <Upload className="w-4 h-4" /> Fénykép módosítása
                  </button>
              </div>

              {/* A) ALAPADATOK */}
              <FormSection title="Alapadatok" icon={<CarFront className="w-5 h-5 text-amber-500" />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <InputGroup label="Márka" name="make" defaultValue={car.make} required />
                      <InputGroup label="Modell" name="model" defaultValue={car.model} required />
                      
                      <SelectGroup label="Kivitel" name="body_type" defaultValue={car.body_type}>
                          <option value="" disabled>Válassz...</option>
                          <option value="Sedan">Sedan / Limuzin</option>
                          <option value="Kombi">Kombi / Touring</option>
                          <option value="Ferdehátú">Ferdehátú</option>
                          <option value="SUV">SUV / Terepjáró</option>
                          <option value="Crossover">Crossover</option>
                          <option value="Coupé">Coupé</option>
                          <option value="Kabrio">Kabrió</option>
                          <option value="Egyterű">Egyterű</option>
                          <option value="Pickup">Pickup</option>
                          <option value="Kisbusz">Kisbusz</option>
                      </SelectGroup>

                      <InputGroup label="Rendszám" name="plate" defaultValue={car.plate} required uppercase />
                      <InputGroup label="Évjárat" name="year" type="number" defaultValue={car.year} required />
                      <InputGroup label="Aktuális Km" name="mileage" type="number" defaultValue={car.mileage} required suffix="km" />
                      <InputGroup label="Szín" name="color" defaultValue={car.color} />
                      <InputGroup label="Alvázszám (VIN)" name="vin" defaultValue={car.vin} uppercase />
                  </div>
              </FormSection>

              {/* B) TECHNIKAI ADATOK */}
              <FormSection title="Technikai Részletek" icon={<Settings className="w-5 h-5 text-amber-500" />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <SelectGroup label="Üzemanyag" name="fuel_type" defaultValue={car.fuel_type}>
                          <option value="Dízel">Dízel</option>
                          <option value="Benzin">Benzin</option>
                          <option value="Hibrid">Hibrid</option>
                          <option value="Plugin_Hybrid">Plug-in Hybrid</option>
                          <option value="Elektromos">Elektromos</option>
                          <option value="LPG">LPG / Gáz</option>
                      </SelectGroup>

                      <SelectGroup label="Váltó" name="transmission" defaultValue={car.transmission || "manual"}>
                          <option value="Manuális">Manuális</option>
                          <option value="Automata">Automata</option>
                          <option value="Fokozatmentes">Fokozatmentes</option>
                          <option value="Robotizált">Robotizált</option>
                      </SelectGroup>

                      <InputGroup label="Hengerűrtartalom" name="engine_size" type="number" defaultValue={car.engine_size} placeholder="pl. 1998" suffix="cm³" />
                      <InputGroup label="Teljesítmény" name="power_hp" type="number" defaultValue={car.power_hp} placeholder="pl. 150" suffix="LE" />
                  </div>
              </FormSection>

              {/* C) STÁTUSZ */}
              <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Jármű Állapota</label>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <label className={`cursor-pointer group relative flex flex-col items-center justify-center gap-2 p-3 md:p-4 rounded-xl border-2 transition-all ${status === 'active' ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'}`}>
                          <input type="radio" name="status_radio" value="active" checked={status === 'active'} onChange={() => setStatus('active')} className="hidden" />
                          <CheckCircle2 className={`w-6 h-6 ${status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`} />
                          <span className={`text-sm font-bold ${status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>Aktív</span>
                      </label>
                      <label className={`cursor-pointer group relative flex flex-col items-center justify-center gap-2 p-3 md:p-4 rounded-xl border-2 transition-all ${status === 'service' ? 'border-amber-500 bg-amber-500/5' : 'border-slate-200 dark:border-slate-700 hover:border-amber-500/50'}`}>
                          <input type="radio" name="status_radio" value="service" checked={status === 'service'} onChange={() => setStatus('service')} className="hidden" />
                          <Wrench className={`w-6 h-6 ${status === 'service' ? 'text-amber-500' : 'text-slate-400'}`} />
                          <span className={`text-sm font-bold ${status === 'service' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>Szervizen</span>
                      </label>
                  </div>
              </div>

              {/* D) OKMÁNYOK & CIKLUSOK */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-700">
                      <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3 mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-amber-500" /> Okmányok
                      </h3>
                      <div className="space-y-4">
                          <InputGroup label="Műszaki Vizsga" name="mot_expiry" type="date" defaultValue={car.mot_expiry} />
                          <InputGroup label="Biztosítás Évforduló" name="insurance_expiry" type="date" defaultValue={car.insurance_expiry} />
                      </div>
                  </div>

                  <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl p-4 md:p-6 border border-amber-200/50 dark:border-amber-800/30">
                      <h3 className="font-bold text-amber-800 dark:text-amber-500 border-b border-amber-200/50 dark:border-amber-800/30 pb-3 mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
                          <Settings className="w-4 h-4" /> Szerviz Ciklusok
                      </h3>
                      <div className="space-y-4">
                          <InputGroup label="Km Intervallum" name="service_interval_km" type="number" defaultValue={car.service_interval_km || 15000} suffix="km" />
                          <InputGroup label="Idő Intervallum" name="service_interval_days" type="number" defaultValue={car.service_interval_days || 365} suffix="nap" />
                      </div>
                  </div>
              </div>

              {/* ACTIONS */}
              <div className="pt-6 flex flex-col-reverse md:flex-row gap-3 md:gap-4 border-t border-slate-200 dark:border-slate-700">
                 <Link href={`/cars/${car.id}`} className="w-full md:w-1/3 py-3.5 md:py-4 rounded-xl text-slate-500 dark:text-slate-400 font-bold text-center border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm uppercase tracking-wide flex items-center justify-center">
                   Mégse
                 </Link>
                 <button 
                   type="submit" 
                   disabled={saving}
                   className="relative w-full md:w-2/3 py-3.5 md:py-4 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-1 active:scale-[0.98] bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-amber-500/30 overflow-hidden group"
                 >
                   <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-xl"></div>
                   <span className="relative flex items-center justify-center gap-2">
                       {saving ? 'Mentés...' : 'Módosítások Mentése'}
                   </span>
                 </button>
              </div>
            </form>
          </div>

          {/* --- 2. KÖZÖS GARÁZS (SHARED) --- */}
          {/* Fontos, hogy a ShareManager is reszponzív legyen, de az egy külső komponens */}
          <ShareManager carId={car.id} shares={shares} />

          {/* --- 3. GUMIABRONCS HOTEL --- */}
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl md:rounded-[2.5rem] shadow-xl p-5 md:p-8 border border-white/20 dark:border-slate-700 mb-8">
               <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6 flex items-center gap-2">
                  <Disc className="w-5 h-5 text-slate-400" /> Gumiabroncs Hotel
               </h3>
               <div className="space-y-4 mb-8">
                   {tires.length > 0 ? (
                       tires.map((tire: any) => (
                           <div key={tire.id} className={`border rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${tire.is_mounted ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
                               <div className="flex items-center gap-4 w-full md:w-auto">
                                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${tire.is_mounted ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                       {tire.type === 'winter' ? '❄️' : tire.type === 'summer' ? '☀️' : '🌤️'}
                                   </div>
                                   <div>
                                       <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{tire.brand} {tire.model}</h4>
                                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tire.size} • DOT: {tire.dot}</p>
                                       <p className="text-xs font-mono mt-1 dark:text-slate-300">Futott: {tire.total_distance.toLocaleString()} km {tire.is_mounted && <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1">(Felszerelve)</span>}</p>
                                   </div>
                               </div>
                               
                               <div className="flex gap-2 w-full md:w-auto">
                                   {!tire.is_mounted && (
                                       <form action={async (fd) => { await swapTire(fd); showToast('Gumi felszerelve!', 'success'); router.refresh(); }} className="flex-1">
                                           <input type="hidden" name="car_id" value={car.id} />
                                           <input type="hidden" name="tire_id" value={tire.id} />
                                           <button type="submit" className="w-full px-4 py-3 md:py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity">
                                               Felszerel
                                           </button>
                                       </form>
                                   )}
                                   <form action={async (fd) => { await deleteTire(fd); showToast('Gumi törölve.', 'error'); router.refresh(); }} className={`${!tire.is_mounted ? 'flex-shrink-0' : 'w-full'}`}>
                                       <input type="hidden" name="car_id" value={car.id} />
                                       <input type="hidden" name="tire_id" value={tire.id} />
                                       <button type="submit" className={`h-full flex items-center justify-center px-4 md:px-2 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${tire.is_mounted ? 'w-full py-3' : 'py-2'}`} title="Törlés">
                                           <span className="md:hidden mr-2 font-bold text-xs uppercase">Törlés</span>
                                           <Trash2 className="w-4 h-4" />
                                       </button>
                                   </form>
                               </div>
                           </div>
                       ))
                   ) : (
                       <p className="text-center text-slate-400 text-sm italic py-4">Még nincs rögzített gumiabroncs.</p>
                   )}
               </div>

               <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-slate-700">
                   <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-4 uppercase tracking-wide">Új szett hozzáadása</h4>
                   <form action={async (fd) => { await addTire(fd); showToast('Gumi hozzáadva!', 'success'); router.refresh(); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <input type="hidden" name="car_id" value={car.id} />
                       <SelectGroup label="Típus" name="type">
                           <option value="summer">Nyári ☀️</option>
                           <option value="winter">Téli ❄️</option>
                           <option value="all_season">Négyévszakos 🌤️</option>
                       </SelectGroup>
                       <InputGroup label="Márka" name="brand" placeholder="pl. Michelin" required />
                       <InputGroup label="Modell" name="model" placeholder="pl. Alpin 6" />
                       <InputGroup label="Méret" name="size" placeholder="pl. 205/55 R16" required />
                       <InputGroup label="DOT" name="dot" placeholder="HHÉÉ" />
                       <InputGroup label="Eddigi futás (km)" name="total_distance" type="number" defaultValue={0} />
                       <div className="md:col-span-2 pt-2">
                           <button type="submit" className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition-opacity">
                               Szett Mentése
                           </button>
                       </div>
                   </form>
               </div>
          </div>

          {/* --- 4. VESZÉLYZÓNA --- */}
          <div className="bg-red-50/50 dark:bg-red-900/10 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border border-red-200 dark:border-red-900/30 mb-8 backdrop-blur-sm">
              <h3 className="text-red-800 dark:text-red-400 font-bold text-lg mb-2">Veszélyzóna</h3>
              <p className="text-red-600/80 dark:text-red-400/80 text-sm mb-6 leading-relaxed">
                  A jármű törlése végleges. Minden hozzá tartozó tankolás, szerviz és emlékeztető is törlődik.
              </p>
              <form action={deleteCar}>
                  <input type="hidden" name="car_id" value={car.id} />
                  <button type="submit" className="w-full py-4 rounded-xl border-2 border-red-500/50 text-red-600 dark:text-red-400 font-bold hover:bg-red-500 hover:text-white dark:hover:text-white transition-all uppercase text-sm tracking-wider">
                      Jármű Végleges Törlése
                  </button>
              </form>
          </div>

        </div>
      </div>
    </div>
  )
}

// --- REUSABLE COMPONENTS ---

function FormSection({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="space-y-4 md:space-y-6">
            <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3 uppercase text-xs tracking-widest flex items-center gap-2">
                {icon} {title}
            </h3>
            {children}
        </div>
    )
}

function InputGroup({ label, name, type = "text", placeholder, defaultValue, required = false, uppercase, suffix }: any) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="space-y-1.5 group">
      <label htmlFor={name} className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
        <span>{label}</span>
        {required && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></span>}
      </label>
      
      <div className={`
        relative flex items-center bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-md border rounded-xl overflow-hidden transition-all duration-300
        ${focused 
            ? 'border-amber-500 ring-2 ring-amber-500/10 shadow-lg shadow-amber-500/5' 
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        }
      `}>
        <input 
            type={type} 
            name={name} 
            id={name} 
            defaultValue={defaultValue}
            required={required} 
            placeholder={placeholder} 
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`
                w-full bg-transparent border-none py-3 md:py-3.5 px-4 text-base md:text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 focus:outline-none
                ${uppercase ? 'uppercase' : ''}
            `} 
            // Megjegyzés: a text-base mobilon megakadályozza az iOS zoomolást (16px), md:text-sm visszaállítja asztalon.
        />
        {suffix && (
            <div className="pr-4 pl-2 text-xs font-bold text-slate-400 bg-slate-200/50 dark:bg-slate-700/50 py-1.5 rounded-lg mr-2 shrink-0">
                {suffix}
            </div>
        )}
      </div>
    </div>
  )
}

function SelectGroup({ label, name, defaultValue, children }: any) {
    const [focused, setFocused] = useState(false)
  
    return (
      <div className="space-y-1.5 group">
        <label htmlFor={name} className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <div className={`
          relative flex items-center bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-md border rounded-xl overflow-hidden transition-all duration-300
          ${focused 
              ? 'border-amber-500 ring-2 ring-amber-500/10 shadow-lg shadow-amber-500/5' 
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          }
        `}>
          <select
            name={name}
            id={name}
            defaultValue={defaultValue}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`
                w-full bg-transparent border-none py-3 md:py-3.5 px-4 text-base md:text-sm font-bold text-slate-900 dark:text-white cursor-pointer appearance-none focus:ring-0 focus:outline-none
                [&>option]:bg-white [&>option]:text-slate-900 
                dark:[&>option]:bg-slate-900 dark:[&>option]:text-white
            `}
          >
            {children}
          </select>
          <div className="absolute right-4 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>
    )
}