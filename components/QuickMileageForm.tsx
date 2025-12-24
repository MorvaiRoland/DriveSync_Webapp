'use client'

import { useState } from 'react'
import { CheckCircle2, AlertCircle, Gauge, Check } from 'lucide-react'
import { logCurrentMileage } from '@/app/actions'

// JAVÍTÁS: Rugalmasabb típus, hogy kezelje a szám és string ID-kat is
interface Car {
  id: string | number
  make: string
  model: string
  mileage: number
}

export default function QuickMileageForm({ cars, latestCarId }: { cars: Car[], latestCarId: string | null }) {
  // Biztosítjuk, hogy az ID-t stringként kezeljük a state-ben
  const [selectedCarId, setSelectedCarId] = useState<string>(String(latestCarId || (cars[0]?.id ?? '')))
  const [mileageInput, setMileageInput] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  // JAVÍTÁS: String konverzió az összehasonlításnál (ez volt a hiba oka!)
  // Így akkor is megtalálja az autót, ha az adatbázisban szám az ID
  const selectedCar = cars.find(c => String(c.id) === String(selectedCarId))

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    setSuccess(null)
    setLoading(true)

    const newMileage = parseInt(formData.get('current_mileage') as string)
    
    // 1. KLIENS OLDALI VALIDÁCIÓ
    // Most már megtalálja a selectedCar-t, így működni fog az ellenőrzés
    if (selectedCar && newMileage < selectedCar.mileage) {
      setError(`A km nem lehet kevesebb, mint a jelenlegi (${selectedCar.mileage.toLocaleString()} km)!`)
      setLoading(false)
      return // Megállítjuk, nem küldjük tovább
    }

    try {
        // 2. SZERVER HÍVÁS ÉS VÁLASZ KEZELÉSE
        const result = await logCurrentMileage(formData)

        // Ellenőrizzük, mit válaszolt a szerver
        if (result?.error) {
            setError(result.error)
        } else if (result?.success) {
            setSuccess(result.message || "Sikeres mentés!")
            setMileageInput('') // Mező ürítése
        }
    } catch (e) {
        setError("Váratlan hiba történt.")
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl p-6 sm:p-8 group border border-slate-200 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-colors duration-700"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner shrink-0">
                    <Gauge className="w-7 h-7 text-amber-500" />
                </div>
                <div>
                    <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Gyors Km Rögzítés</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {/* Itt most már biztosan megjelenik az adat */}
                        Jelenlegi: <span className="font-bold font-mono text-amber-600 dark:text-amber-500">
                            {selectedCar ? `${selectedCar.mileage.toLocaleString()} km` : 'Válassz autót'}
                        </span>
                    </p>
                </div>
            </div>

            <form action={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-start sm:items-center">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <select 
                        name="car_id" 
                        value={selectedCarId}
                        onChange={(e) => { setSelectedCarId(e.target.value); setError(null); setSuccess(null); }}
                        className="w-full sm:w-48 pl-4 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none appearance-none cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
                    >
                        {cars.map((car) => (
                            <option key={car.id} value={car.id}>{car.make} {car.model}</option>
                        ))}
                    </select>

                    <div className="relative flex-1 sm:flex-none">
                        <input 
                            type="number" 
                            name="current_mileage" 
                            value={mileageInput}
                            onChange={(e) => { setMileageInput(e.target.value); setError(null); setSuccess(null); }}
                            placeholder="Új állás..." 
                            className={`w-full sm:w-36 pl-4 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-bold font-mono focus:ring-2 focus:outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white ${error ? 'border-red-500 ring-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500'}`} 
                            required 
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">KM</span>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <span className="animate-spin">⏳</span> : <CheckCircle2 className="w-5 h-5" />}
                        <span className="hidden sm:inline">{loading ? 'Mentés...' : 'Mentés'}</span>
                    </button>
                </div>
            </form>
        </div>
        
        {/* Üzenetek megjelenítése */}
        {error && (
            <div className="mt-3 text-red-500 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2 fade-in">
                <AlertCircle className="w-4 h-4" /> {error}
            </div>
        )}
        {success && (
            <div className="mt-3 text-emerald-500 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2 fade-in">
                <Check className="w-4 h-4" /> {success}
            </div>
        )}
    </div>
  )
}