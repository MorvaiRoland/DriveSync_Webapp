'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

export default function FilterSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // State-ek a mezőkhöz
  const [brand, setBrand] = useState(searchParams.get('brand') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')

  // Szűrés alkalmazása gombnyomásra
  const handleFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (brand) params.set('brand', brand); else params.delete('brand')
    if (minPrice) params.set('minPrice', minPrice); else params.delete('minPrice')
    if (maxPrice) params.set('maxPrice', maxPrice); else params.delete('maxPrice')

    startTransition(() => {
      router.push(`/marketplace?${params.toString()}`)
    })
  }

  const handleReset = () => {
    setBrand(''); setMinPrice(''); setMaxPrice('');
    router.push('/marketplace')
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 h-fit sticky top-24">
      <h2 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Szűrők</h2>
      
      <div className="space-y-4">
        <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Márka</label>
            <select 
                value={brand} 
                onChange={(e) => setBrand(e.target.value)}
                className="w-full mt-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
                <option value="">Összes</option>
                <option value="BMW">BMW</option>
                <option value="Audi">Audi</option>
                <option value="Mercedes">Mercedes</option>
                <option value="Volkswagen">Volkswagen</option>
                <option value="Ford">Ford</option>
                <option value="Suzuki">Suzuki</option>
            </select>
        </div>

        <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Ár (Ft)</label>
            <div className="flex gap-2 mt-1">
                <input 
                    type="number" placeholder="Min" 
                    value={minPrice} onChange={e => setMinPrice(e.target.value)}
                    className="w-1/2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
                <input 
                    type="number" placeholder="Max" 
                    value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                    className="w-1/2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
            </div>
        </div>

        <div className="pt-2 flex flex-col gap-2">
            <button 
                onClick={handleFilter}
                disabled={isPending}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
            >
                {isPending ? 'Frissítés...' : 'Szűrés'}
            </button>
            <button 
                onClick={handleReset}
                className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm font-medium"
            >
                Törlés
            </button>
        </div>
      </div>
    </div>
  )
}