'use client'

import { useState } from 'react'
import { joinBattle, leaveBattle } from '@/app/actions/showroom' // Importáljuk a leaveBattle-t is
import { Trophy, Car, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react'

export default function BattleEntry({ battleId, myCars, hasEntered }: { battleId: string, myCars: any[], hasEntered: boolean }) {
  const [selectedCar, setSelectedCar] = useState(myCars.length > 0 ? myCars[0].id : '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{type: 'success'|'error', msg: string} | null>(null)

  // ÚJ FÜGGVÉNY: Kilépés kezelése
  const handleLeave = async () => {
      if(!confirm("Biztosan vissza akarod vonni a nevezésed? Ezzel elveszíted az eddigi szavazataidat!")) return;
      
      setIsSubmitting(true)
      await leaveBattle(battleId)
      setIsSubmitting(false)
      // A revalidatePath frissíti majd a UI-t, így eltűnik a "Már beneveztél" ablak
  }

  // Ha már nevezett -> Mutatjuk a státuszt ÉS a kilépés gombot
  if (hasEntered) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                <CheckCircle2 className="text-white w-6 h-6" />
            </div>
            <div>
                <h3 className="text-emerald-500 font-bold text-lg">Már beneveztél!</h3>
                <p className="text-emerald-400/80 text-sm">Sok sikert a versenyen! Gyűjtsd a szavazatokat!</p>
            </div>
        </div>
        
        {/* KILÉPÉS GOMB */}
        <button 
            onClick={handleLeave}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 rounded-lg transition-colors"
        >
            <Trash2 className="w-4 h-4" />
            Nevezés visszavonása
        </button>
      </div>
    )
  }

  if (myCars.length === 0) {
    return (
      <div className="bg-slate-800 rounded-2xl p-6 text-center mb-8 border border-slate-700">
         <p className="text-slate-400">Nincs autód a garázsban, amivel nevezhetnél.</p>
         <a href="/cars/new" className="text-blue-400 hover:underline text-sm mt-2 block">Adj hozzá egyet itt!</a>
      </div>
    )
  }

  async function handleSubmit() {
      setIsSubmitting(true)
      setFeedback(null)

      const formData = new FormData()
      formData.append('battleId', battleId)
      formData.append('carId', selectedCar)

      const res = await joinBattle(formData)

      if (res?.error) {
          setFeedback({ type: 'error', msg: res.error })
      } else {
          setFeedback({ type: 'success', msg: 'Sikeres nevezés! 🚀' })
      }
      setIsSubmitting(false)
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-1 shadow-xl mb-10 overflow-hidden">
        <div className="bg-slate-950/50 backdrop-blur-md rounded-[22px] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5">
            
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 rotate-3">
                    <Trophy className="text-white w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Nevezd a Verdát!</h3>
                    <p className="text-slate-400 text-sm max-w-xs">Van egy autód, ami illik a témához? Nevezd be és nyerj XP-t!</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto">
                {feedback ? (
                    <div className={`px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-bold ${feedback.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
                        {feedback.msg}
                    </div>
                ) : (
                    <>
                        <div className="relative">
                            <select 
                                value={selectedCar}
                                onChange={(e) => setSelectedCar(e.target.value)}
                                className="w-full sm:w-48 h-full pl-10 pr-4 py-3 bg-slate-800 text-white rounded-xl border border-slate-700 focus:ring-2 focus:ring-orange-500 outline-none appearance-none cursor-pointer font-medium text-sm"
                            >
                                {myCars.map(car => (
                                    <option key={car.id} value={car.id}>
                                        {car.make} {car.model}
                                    </option>
                                ))}
                            </select>
                            <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        </div>

                        <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-orange-600/20 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            {isSubmitting ? 'Nevezés...' : 'Nevezés Indítása 🔥'}
                        </button>
                    </>
                )}
            </div>
        </div>
    </div>
  )
}