'use client'

import { addReminder } from '../../actions'
import Link from 'next/link'
import { useState } from 'react'
import { Bell, Calendar, ChevronDown, CheckCircle2, ArrowLeft, PenLine, Clock } from 'lucide-react'

// --- TYPES ---
interface Car {
  id: number
  make: string
  model: string
  plate: string
}

interface ServiceType {
  id: number
  name: string
}

interface ReminderFormClientProps {
  car: Car
  serviceTypes: ServiceType[]
}

function Glass({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`
      bg-white/60 dark:bg-white/[0.04]
      border border-white/70 dark:border-white/[0.08]
      backdrop-blur-xl shadow-sm
      ${className}
    `}>
      {children}
    </div>
  )
}

export default function ReminderFormClient({ car, serviceTypes }: ReminderFormClientProps) {
  const carId = car.id.toString()
  const [saving, setSaving] = useState(false)

  return (
    <div className="w-full pb-20">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6 flex flex-col items-center">
        <Link href={`/cars/${carId}`} className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 text-xs font-bold bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-200 dark:border-slate-700/50">
          <ArrowLeft className="w-4 h-4" /> Vissza az autóhoz
        </Link>
        
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight mb-2 text-center">
          Szerviz <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-600">Tervezése</span>
        </h1>
        
        <div className="inline-flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50 mt-1 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          {car.make} {car.model} <span className="opacity-50">|</span> {car.plate}
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        <Glass className="rounded-3xl shadow-xl p-6 md:p-8">
          <form 
            action={addReminder} 
            onSubmit={() => setSaving(true)} 
            className="space-y-6 relative z-10"
          >
            <input type="hidden" name="car_id" value={carId} />

            <SelectGroup label="Szerviz Típusa" name="service_type" required icon={<PenLine className="w-4 h-4" />}>
              <option value="" disabled selected>Mit kell csinálni?</option>
              {serviceTypes.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              <option value="Műszaki Vizsga">Műszaki Vizsga</option>
              <option value="Egyéb">Egyéb karbantartás</option>
            </SelectGroup>

            <InputGroup label="Esedékesség Dátuma" name="due_date" type="date" required icon={<Calendar className="w-4 h-4" />} />

            {/* NOTIFICATION BOX */}
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-4 space-y-3 backdrop-blur-md">
              <h4 className="font-bold text-indigo-800 dark:text-indigo-400 text-[10px] uppercase tracking-widest flex items-center gap-2">
                <Bell className="w-3.5 h-3.5" /> Értesítések beállítása
              </h4>
              
              <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-white/50 dark:hover:bg-white/[0.04] rounded-xl transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-900/50 group/check">
                <div className="relative flex items-center shrink-0">
                  <input type="checkbox" name="notify_push" className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 checked:border-indigo-500 checked:bg-indigo-500 transition-all focus:outline-none" />
                  <CheckCircle2 className="pointer-events-none absolute h-3 w-3 left-[2px] top-[2px] text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 group-hover/check:text-indigo-700 dark:group-hover/check:text-indigo-300 transition-colors">Push értesítés</span>
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500">Jelzés a telefonon 1 nappal előtte</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-white/50 dark:hover:bg-white/[0.04] rounded-xl transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-900/50 group/check">
                <div className="relative flex items-center shrink-0">
                  <input type="checkbox" name="notify_email" className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 checked:border-indigo-500 checked:bg-indigo-500 transition-all focus:outline-none" />
                  <CheckCircle2 className="pointer-events-none absolute h-3 w-3 left-[2px] top-[2px] text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 group-hover/check:text-indigo-700 dark:group-hover/check:text-indigo-300 transition-colors">Email emlékeztető</span>
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500">Levél küldése 3 nappal előtte</span>
                </div>
              </label>
            </div>

            <div className="space-y-1.5 group">
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Megjegyzés (Opcionális)</label>
              <div className="relative">
                <textarea 
                  name="note" 
                  rows={3} 
                  className="block w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] backdrop-blur-md p-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-0 focus:outline-none transition-all resize-none shadow-inner" 
                  placeholder="pl. Bosch szervizbe vinni, alkatrészt megrendelni..."
                ></textarea>
              </div>
            </div>

            <div className="pt-4 flex gap-3 border-t border-slate-100 dark:border-white/[0.06]">
              <Link 
                href={`/cars/${carId}`} 
                className="w-1/3 py-3 rounded-xl text-slate-500 dark:text-slate-400 font-bold text-center border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors text-xs uppercase tracking-wide flex items-center justify-center"
              >
                Mégse
              </Link>
              <button 
                type="submit" 
                disabled={saving}
                className="relative w-2/3 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:shadow-indigo-500/20 text-xs uppercase tracking-wider overflow-hidden"
              >
                <span className="relative flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Clock className="w-4 h-4" />}
                  {saving ? 'Mentés...' : 'Emlékeztető Mentése'}
                </span>
              </button>
            </div>
          </form>
        </Glass>
      </div>
    </div>
  )
}

// --- SUB-COMPONENTS ---

function InputGroup({ label, name, type = "text", placeholder, required = false, icon }: any) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="space-y-1.5 group w-full">
      <label htmlFor={name} className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
        <span>{label}</span>
        {required && <span className="w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>}
      </label>
      
      <div className={`
        relative flex items-center bg-white/50 dark:bg-white/[0.02] backdrop-blur-md border rounded-xl overflow-hidden transition-all duration-300
        ${focused 
          ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-lg shadow-indigo-500/5' 
          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25'
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
            w-full bg-transparent border-none py-3 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 focus:outline-none
            ${!icon && 'pl-4'}
          `} 
        />
      </div>
    </div>
  )
}

function SelectGroup({ label, name, children, required = false, icon }: any) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="space-y-1.5 group w-full">
      <label htmlFor={name} className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
        <span>{label}</span>
        {required && <span className="w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>}
      </label>
      
      <div className={`
        relative flex items-center bg-white/50 dark:bg-white/[0.02] backdrop-blur-md border rounded-xl overflow-hidden transition-all duration-300
        ${focused 
          ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-lg shadow-indigo-500/5' 
          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25'
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
            w-full bg-transparent border-none py-3 text-sm font-bold text-slate-900 dark:text-white cursor-pointer appearance-none focus:ring-0 focus:outline-none
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
