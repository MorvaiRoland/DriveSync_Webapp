'use client'

import { useState } from 'react'
import { CheckCircle2, AlertCircle, Gauge, ChevronDown } from 'lucide-react'
import { logCurrentMileage } from '@/app/actions'

interface Car {
  id: string | number
  make: string
  model: string
  mileage: number
}

export default function QuickMileageForm({ cars, latestCarId }: { cars: Car[], latestCarId: string | null }) {
  const [selectedCarId, setSelectedCarId] = useState<string>(String(latestCarId || (cars[0]?.id ?? '')))
  const [mileageInput, setMileageInput] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const selectedCar = cars.find(c => String(c.id) === String(selectedCarId))

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    setSuccess(null)
    setLoading(true)
    const newMileage = parseInt(formData.get('current_mileage') as string)
    if (selectedCar && newMileage < selectedCar.mileage) {
      setError(`A km nem lehet kevesebb, mint a jelenlegi (${selectedCar.mileage.toLocaleString()} km)!`)
      setLoading(false)
      return
    }
    try {
      const result = await logCurrentMileage(formData)
      if (result?.error) setError(result.error)
      else if (result?.success) { setSuccess(result.message || 'Sikeres mentés!'); setMileageInput('') }
    } catch {
      setError('Váratlan hiba történt.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl
      bg-white/60 dark:bg-white/5
      border border-white/60 dark:border-white/10
      backdrop-blur-xl shadow-sm p-5">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-100 dark:border-amber-500/30 flex-shrink-0">
          <Gauge className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Gyors Km Rögzítés</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {selectedCar ? `Jelenlegi: ${selectedCar.mileage.toLocaleString()} km` : 'Válassz autót'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form action={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        {/* Car selector */}
        <div className="relative flex-1">
          <select
            name="car_id"
            value={selectedCarId}
            onChange={(e) => { setSelectedCarId(e.target.value); setError(null); setSuccess(null) }}
            className="w-full pl-3 pr-8 py-2.5 rounded-xl text-sm font-medium outline-none appearance-none cursor-pointer transition-colors
              bg-white/80 dark:bg-white/5
              border border-slate-200 dark:border-white/10
              text-slate-900 dark:text-white
              focus:border-indigo-400 dark:focus:border-indigo-500"
          >
            {cars.map((car) => (
              <option key={car.id} value={car.id} className="bg-white dark:bg-slate-900">
                {car.make} {car.model}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Mileage input */}
        <div className="relative">
          <input
            type="number"
            name="current_mileage"
            value={mileageInput}
            onChange={(e) => { setMileageInput(e.target.value); setError(null); setSuccess(null) }}
            placeholder="Új km..."
            required
            className={`w-full sm:w-32 pl-3 pr-8 py-2.5 rounded-xl text-sm font-bold font-mono outline-none transition-colors
              bg-white/80 dark:bg-white/5
              text-slate-900 dark:text-white
              placeholder:text-slate-400 dark:placeholder:text-slate-600
              ${error ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-indigo-400 dark:focus:border-indigo-500'}
              border`}
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 uppercase">KM</span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex-shrink-0
            bg-slate-900 dark:bg-white
            text-white dark:text-slate-900
            hover:bg-slate-800 dark:hover:bg-slate-100"
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : <CheckCircle2 className="w-4 h-4" />
          }
          <span>{loading ? 'Mentés...' : 'Mentés'}</span>
        </button>
      </form>

      {/* Messages */}
      {error && (
        <div className="mt-3 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl border border-red-200 dark:border-red-900/50">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="mt-3 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {success}
        </div>
      )}
    </div>
  )
}