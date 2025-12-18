'use client'

import { useState } from 'react'
import { togglePublicHistory } from '@/app/cars/actions'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function PublicToggle({ carId, isPublicInitial }: { carId: string, isPublicInitial: boolean }) {
  const [isPublic, setIsPublic] = useState(isPublicInitial)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    const newState = !isPublic
    setIsPublic(newState)
    await togglePublicHistory(carId, newState)
    setLoading(false)
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isPublic ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                {isPublic ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </div>
            <div>
                <h4 className="text-white font-bold text-sm">Publikus Előélet</h4>
                <p className="text-slate-400 text-xs">
                    {isPublic 
                        ? 'Az autód adatai kereshetőek alvázszám alapján.' 
                        : 'Az autód adatai privátak.'}
                </p>
            </div>
        </div>
        
        <button 
            onClick={handleToggle}
            disabled={loading}
            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900
                ${isPublic ? 'bg-emerald-500' : 'bg-slate-700'}
            `}
        >
            <span
                className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${isPublic ? 'translate-x-6' : 'translate-x-1'}
                `}
            />
        </button>
    </div>
  )
}