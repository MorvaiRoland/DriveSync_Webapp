'use client'

import { useState } from 'react'
import { createListing } from './actions'
import { Car, MapPin, Phone, Banknote, FileText, Info, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function SellCarPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Wrapper a szerver action hívásához a loading state miatt
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    const result = await createListing(formData)
    
    // Ha a createListing redirectel, ez a kód nem fut le, ami jó.
    // Ha hibával tér vissza:
    if (result?.error) {
      toast.error(result.error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Fejléc */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-2xl mb-4 border border-amber-500/20">
            <Car className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Hirdetés feladása</h1>
          <p className="text-slate-400">Add el autódat gyorsan és egyszerűen a DynamicSense közösségnek.</p>
        </div>

        <form action={handleSubmit} className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          
          {/* 1. Jármű Alapadatok */}
          <div className="p-8 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-xs text-white">1</span>
              Jármű adatok
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Márka</label>
                <input required name="make" type="text" placeholder="pl. BMW" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Modell</label>
                <input required name="model" type="text" placeholder="pl. 320d" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Évjárat</label>
                <input required name="year" type="number" placeholder="2018" min="1950" max="2025" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Futásteljesítmény (km)</label>
                <input required name="mileage" type="number" placeholder="150000" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Üzemanyag</label>
                <select name="fuel_type" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all">
                  <option value="Benzin">Benzin</option>
                  <option value="Dízel">Dízel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Elektromos">Elektromos</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Rendszám</label>
                <input required name="plate" type="text" placeholder="AA-BB-123" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all uppercase" />
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Info className="w-3 h-3" /> A hirdetésben automatikusan rejtve lesz.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Hirdetés Részletei */}
          <div className="p-8 bg-slate-900/50">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-xs text-slate-900 font-bold">2</span>
              Hirdetés részletei
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-amber-500 uppercase flex items-center gap-2">
                  <Banknote className="w-4 h-4" /> Eladási ár (HUF)
                </label>
                <input required name="price" type="number" placeholder="pl. 4 500 000" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-xl font-bold text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Telefonszám
                </label>
                <input required name="seller_phone" type="tel" placeholder="+36 30 123 4567" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Megtekinthető (Város)
                </label>
                <input required name="location" type="text" placeholder="pl. Budapest" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                <FileText className="w-3 h-3" /> Leírás
              </label>
              <textarea name="description" rows={5} placeholder="Írj le minden fontosat az autóról..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"></textarea>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <input type="checkbox" name="exchange_possible" id="exchange" className="w-5 h-5 rounded border-slate-600 bg-slate-700 accent-amber-500" />
              <label htmlFor="exchange" className="text-sm text-slate-300 font-medium cursor-pointer select-none">Autóbeszámítás / Csere lehetséges</label>
            </div>

          </div>

          {/* Lábléc - Submit */}
          <div className="p-8 bg-slate-900 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 text-center md:text-left">
              A "Hirdetés feladása" gombra kattintva elfogadod a felhasználási feltételeket.
            </p>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full md:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Feldolgozás...
                </>
              ) : (
                <>
                  Hirdetés feladása <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}