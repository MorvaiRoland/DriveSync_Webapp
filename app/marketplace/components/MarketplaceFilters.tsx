'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useTransition } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useDebounce } from 'use-debounce' // Opcionális: npm install use-debounce, vagy anélkül is működik lsd alább

export default function MarketplaceFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false) // Mobil nézethez

  // Helyi state-ek az inputokhoz
  const [text, setText] = useState(searchParams.get('q') || '')
  const [brand, setBrand] = useState(searchParams.get('brand') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [fuel, setFuel] = useState(searchParams.get('fuel') || '')

  // Debounce a keresőmezőhöz (hogy ne frissüljön minden betűnél)
  const [debouncedText] = useDebounce(text, 500)

  // URL frissítő függvény
  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== '') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Vissza az első oldalra szűréskor
    params.delete('page')
    
    startTransition(() => {
      router.push(`/marketplace?${params.toString()}`, { scroll: false })
    })
  }

  // Kereső szöveg figyelése
  useEffect(() => {
    updateFilters('q', debouncedText)
  }, [debouncedText])

  const brands = ["Összes márka", "BMW", "Audi", "Mercedes", "Volkswagen", "Toyota", "Ford", "Opel", "Suzuki"]
  const fuels = ["Összes üzemanyag", "Benzin", "Dízel", "Hybrid", "Elektromos"]

  return (
    <>
      {/* Mobil Filter Gomb */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden w-full mb-4 flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold shadow-sm"
      >
        <SlidersHorizontal size={18} /> Szűrők megjelenítése
      </button>

      {/* Filter Sidebar */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 h-fit sticky top-24 shadow-sm transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <SlidersHorizontal className="text-amber-500" size={20}/> Szűrés
          </h2>
          {/* Reset gomb */}
          {(brand || text || minPrice || maxPrice || fuel) && (
            <button 
              onClick={() => router.push('/marketplace')}
              className="text-xs text-red-500 hover:text-red-600 font-bold flex items-center gap-1"
            >
              <X size={12} /> Törlés
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Kereső */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Keresés</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Modell, leírás..." 
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Márka */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Márka</label>
            <select 
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value === "Összes márka" ? "" : e.target.value)
                updateFilters('brand', e.target.value === "Összes márka" ? null : e.target.value)
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            >
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Ár Sáv */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Ár (Ft)</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Min" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onBlur={() => updateFilters('minPrice', minPrice)}
                className="w-1/2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:border-amber-500"
              />
              <input 
                type="number" 
                placeholder="Max" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onBlur={() => updateFilters('maxPrice', maxPrice)}
                className="w-1/2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:border-amber-500"
              />
            </div>
          </div>

           {/* Üzemanyag */}
           <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Üzemanyag</label>
            <div className="flex flex-wrap gap-2">
              {fuels.map(f => {
                const isActive = (f === "Összes üzemanyag" && !fuel) || fuel === f;
                const value = f === "Összes üzemanyag" ? "" : f;
                return (
                  <button
                    key={f}
                    onClick={() => {
                        setFuel(value);
                        updateFilters('fuel', value || null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${isActive ? 'bg-amber-500 text-white border-amber-500 shadow-md' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    {f}
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}