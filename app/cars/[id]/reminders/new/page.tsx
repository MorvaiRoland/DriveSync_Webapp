'use client'

import { createBrowserClient } from '@supabase/ssr'
import { addReminder } from '../../actions'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Bell, Calendar, ChevronDown, CheckCircle2, ArrowLeft, PenLine, Clock } from 'lucide-react'

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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">Betöltés...</div>

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500 selection:bg-amber-500/30 selection:text-amber-600 relative overflow-x-hidden">
      
      {/* SAFE AREA BOTTOM PADDING */}
      <div className="pb-[calc(1.5rem+env(safe-area-inset-bottom))]">

        {/* HÁTTÉR EFFEKTEK */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[80px] md:blur-[120px] animate-pulse-slow"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
        </div>

        {/* --- HERO HEADER --- */}
        {/* SAFE AREA TOP PADDING - Notch kezelése */}
        <div className="relative pt-[calc(env(safe-area-inset-top)+2rem)] pb-10 md:pb-16 px-4 overflow-hidden">
          <div className="max-w-2xl mx-auto text-center relative z-10">
              <Link href={`/cars/${carId}`} className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 text-xs md:text-sm font-bold bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-800/80 shadow-sm">
                  <ArrowLeft className="w-4 h-4" /> Vissza az autóhoz
              </Link>
              
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                  Szerviz <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-600 block md:inline">Tervezése</span>
              </h1>
              
              {car && (
                  <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm mt-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                      {car.make} {car.model} <span className="opacity-50">|</span> {car.plate}
                  </div>
              )}
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 -mt-4 relative z-20">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl md:rounded-[2.5rem] shadow-2xl p-5 md:p-10 border border-white/20 dark:border-slate-700 relative overflow-hidden group">
            
            {/* Dekoráció */}
            <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10 md:-mr-16 md:-mt-16 pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700"></div>

            <form action={addReminder} className="space-y-6 md:space-y-8 relative z-10">
              <input type="hidden" name="car_id" value={carId} />

              <SelectGroup label="Szerviz Típusa" name="service_type" required icon={<PenLine className="w-5 h-5" />}>
                  <option value="" disabled selected>Mit kell csinálni?</option>
                  {serviceTypes.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  <option value="Műszaki Vizsga">Műszaki Vizsga</option>
                  <option value="Egyéb">Egyéb karbantartás</option>
              </SelectGroup>

              <InputGroup label="Esedékesség Dátuma" name="due_date" type="date" required icon={<Calendar className="w-5 h-5" />} />

              {/* ÉRTESÍTÉSI DOBOZ (LIQUID STYLE) */}
              <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl p-4 md:p-5 space-y-3 md:space-y-4 backdrop-blur-md">
                 <h4 className="font-bold text-indigo-800 dark:text-indigo-400 text-xs uppercase tracking-widest flex items-center gap-2">
                   <Bell className="w-4 h-4" /> Értesítések beállítása
                 </h4>
                 
                 <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-white/50 dark:hover:bg-indigo-900/20 rounded-xl transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 group/check">
                    <div className="relative flex items-center shrink-0">
                        <input type="checkbox" name="notify_push" className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 checked:border-indigo-500 checked:bg-indigo-500 transition-all" />
                        <CheckCircle2 className="pointer-events-none absolute h-3.5 w-3.5 left-[3px] top-[3px] text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 group-hover/check:text-indigo-700 dark:group-hover/check:text-indigo-300 transition-colors">Push értesítés</span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">Jelzés a telefonon 1 nappal előtte</span>
                    </div>
                 </label>

                 <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-white/50 dark:hover:bg-indigo-900/20 rounded-xl transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 group/check">
                    <div className="relative flex items-center shrink-0">
                        <input type="checkbox" name="notify_email" className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 checked:border-indigo-500 checked:bg-indigo-500 transition-all" />
                        <CheckCircle2 className="pointer-events-none absolute h-3.5 w-3.5 left-[3px] top-[3px] text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 group-hover/check:text-indigo-700 dark:group-hover/check:text-indigo-300 transition-colors">Email emlékeztető</span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">Levél küldése 3 nappal előtte</span>
                    </div>
                 </label>
              </div>

              <div className="space-y-1.5 md:space-y-2 group">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Megjegyzés (Opcionális)</label>
                  <div className="relative">
                      <textarea 
                        name="note" 
                        rows={3} 
                        className="block w-full rounded-2xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-4 text-base md:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none shadow-sm" 
                        placeholder="pl. Bosch szervizbe vinni, alkatrészt megrendelni..."
                      ></textarea>
                  </div>
              </div>

              <div className="pt-4 md:pt-6 flex gap-3 md:gap-4 border-t border-slate-100 dark:border-slate-800">
                <Link 
                  href={`/cars/${carId}`} 
                  className="w-1/3 py-3.5 md:py-4 rounded-xl text-slate-500 dark:text-slate-400 font-bold text-center border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm uppercase tracking-wide flex items-center justify-center"
                >
                  Mégse
                </Link>
                <button 
                  type="submit" 
                  className="relative w-2/3 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold shadow-lg transition-all transform hover:-translate-y-1 active:scale-[0.98] bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:shadow-indigo-500/30 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl"></div>
                  <span className="relative flex items-center justify-center gap-2">
                      <Clock className="w-5 h-5" />
                      Emlékeztető Mentése
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NewReminderPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium animate-pulse">Betöltés...</p>
        </div>
    }>
      <ReminderForm />
    </Suspense>
  )
}

// --- REUSABLE COMPONENTS ---

function InputGroup({ label, name, type = "text", placeholder, required = false, icon }: any) {
    const [focused, setFocused] = useState(false)
  
    return (
      <div className="space-y-1.5 md:space-y-2 group">
        <label htmlFor={name} className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
          <span>{label}</span>
          {required && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span>}
        </label>
        
        <div className={`
          relative flex items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300
          ${focused 
              ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-lg shadow-indigo-500/5' 
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          }
        `}>
          {icon && (
            <div className={`pl-4 pr-2 transition-colors duration-300 shrink-0 ${focused ? 'text-indigo-500' : 'text-slate-400'}`}>
              {icon}
            </div>
          )}
          
          <input 
              type={type} 
              name={name} 
              id={name} 
              required={required} 
              placeholder={placeholder} 
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={`
                  w-full bg-transparent border-none py-3 md:py-3.5 px-4 text-base md:text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 focus:outline-none
                  ${!icon && 'pl-4'}
              `} 
              // text-base mobilon megakadályozza a zoomolást
          />
        </div>
      </div>
    )
}
  
function SelectGroup({ label, name, children, required = false, icon }: any) {
    const [focused, setFocused] = useState(false)
  
    return (
      <div className="space-y-1.5 md:space-y-2 group">
        <label htmlFor={name} className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
          <span>{label}</span>
          {required && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span>}
        </label>
        
        <div className={`
          relative flex items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300
          ${focused 
              ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-lg shadow-indigo-500/5' 
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          }
        `}>
          {icon && (
            <div className={`pl-4 pr-2 transition-colors duration-300 shrink-0 ${focused ? 'text-indigo-500' : 'text-slate-400'}`}>
              {icon}
            </div>
          )}
          
          <select
            name={name}
            id={name}
            required={required}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`
                w-full bg-transparent border-none py-3 md:py-3.5 px-4 text-base md:text-sm font-bold text-slate-900 dark:text-white cursor-pointer appearance-none focus:ring-0 focus:outline-none
                ${!icon && 'pl-4'}
                [&>option]:bg-white [&>option]:text-slate-900 
                dark:[&>option]:bg-slate-900 dark:[&>option]:text-white
            `}
          >
            {children}
          </select>
          
          <div className="absolute right-4 pointer-events-none text-slate-400">
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${focused ? 'rotate-180 text-indigo-500' : ''}`} />
          </div>
        </div>
      </div>
    )
}