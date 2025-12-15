'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import { SlidersHorizontal, X, Search, Check } from 'lucide-react'

// Fogadjuk a márkákat props-ként
export default function FilterSidebar({ availableBrands = [] }: { availableBrands?: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  // State-ek
  const [brand, setBrand] = useState(searchParams.get('brand') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')

  // URL frissítése
  const handleFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (brand) params.set('brand', brand); else params.delete('brand')
    if (minPrice) params.set('minPrice', minPrice); else params.delete('minPrice')
    if (maxPrice) params.set('maxPrice', maxPrice); else params.delete('maxPrice')

    startTransition(() => {
      router.push(`/marketplace?${params.toString()}`)
      setIsOpen(false) // Mobilon bezárjuk szűrés után
    })
  }

  const handleReset = () => {
    setBrand(''); setMinPrice(''); setMaxPrice('');
    router.push('/marketplace')
    setIsOpen(false)
  }

  return (
    <>
      {/* MOBIL GOMB */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden w-full mb-6 flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold shadow-sm text-slate-700 dark:text-white"
      >
        <SlidersHorizontal size={18} /> 
        {isOpen ? 'Szűrők elrejtése' : 'Szűrők megjelenítése'}
      </button>

      {/* SIDEBAR TARTALOM */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 h-fit sticky top-24 shadow-xl shadow-slate-200/50 dark:shadow-none`}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="text-indigo-500" size={20}/> 
                Részletes kereső
            </h2>
            {(brand || minPrice || maxPrice) && (
                <button onClick={handleReset} className="text-xs text-red-500 font-bold hover:underline">
                    Törlés
                </button>
            )}
        </div>
        
        <div className="space-y-6">
          
          {/* MÁRKA VÁLASZTÓ (DINAMIKUS) */}
          <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Márka</label>
              <div className="relative">
                  <select 
                      value={brand} 
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full p-3 pl-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium appearance-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                  >
                      <option value="">Összes márka</option>
                      {availableBrands.map((b) => (
                          <option key={b} value={b}>{b}</option>
                      ))}
                  </select>
                  {/* Custom nyíl ikon */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
              </div>
          </div>

          {/* ÁR SÁV */}
          <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vételár (Ft)</label>
              <div className="flex gap-2">
                  <div className="relative w-1/2">
                      <input 
                          type="number" 
                          placeholder="Min" 
                          value={minPrice} 
                          onChange={e => setMinPrice(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                  </div>
                  <div className="relative w-1/2">
                      <input 
                          type="number" 
                          placeholder="Max" 
                          value={maxPrice} 
                          onChange={e => setMaxPrice(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                  </div>
              </div>
          </div>

          {/* KERESÉS GOMB */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                  onClick={handleFilter}
                  disabled={isPending}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                  {isPending ? 'Frissítés...' : (
                      <>
                          <Search className="w-4 h-4" /> Keresés
                      </>
                  )}
              </button>
          </div>
        </div>
      </div>
    </>
  )
}