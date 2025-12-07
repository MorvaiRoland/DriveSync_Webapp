'use client'

import { useState } from 'react'
import { shareCar, removeShare } from '@/app/cars/share-actions'

export default function ShareManager({ carId, shares = [] }: { carId: string, shares: any[] }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null)

  // Új megosztás hozzáadása
  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('car_id', carId)

    const res = await shareCar(formData)
    
    if (res?.error) {
        setMessage({ text: res.error, type: 'error' })
    } else {
        setMessage({ text: 'Sikeres meghívás!', type: 'success' })
        setEmail('')
    }
    setLoading(false)
  }

  // Megosztás visszavonása (ÚJ HANDLER)
  const handleRemove = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Ha már tölt valami, ne engedjük újra kattintani
    if (loading) return 
    
    // Optimista visszajelzés vagy loading
    if (!confirm('Biztosan visszavonod a hozzáférést?')) return

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await removeShare(formData)

    if (res?.error) {
        setMessage({ text: res.error, type: 'error' })
    } else {
        setMessage({ text: 'Hozzáférés visszavonva.', type: 'success' })
    }
    setLoading(false)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 mb-8 transition-colors">
      <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2 flex items-center gap-2">
        <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        Közös Garázs
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
        Hívd meg családtagjaidat, hogy ők is lássák és kezelhessék ezt az autót.
      </p>

      {/* Meghívó Űrlap */}
      <form onSubmit={handleShare} className="flex gap-3 mb-8 items-start">
        <div className="flex-1">
            <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="felhasznalo@email.com" 
                required
                disabled={loading}
                className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 px-4 bg-slate-50 dark:bg-slate-900 border text-slate-900 dark:text-white transition-colors disabled:opacity-50"
            />
            {message && (
                <p className={`text-xs mt-2 font-bold animate-pulse ${message.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                    {message.text}
                </p>
            )}
        </div>
        <button 
            type="submit" 
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition-colors"
        >
            {loading ? '...' : 'Meghívás'}
        </button>
      </form>

      {/* Megosztások listája */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Jelenlegi hozzáférések</h4>
        {shares.length > 0 ? (
            shares.map((share) => (
                <div key={share.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                            {share.email[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{share.email}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{share.role === 'editor' ? 'Szerkesztő' : 'Megtekintő'}</p>
                        </div>
                    </div>
                    {/* ITT A JAVÍTOTT TÖRLÉS FORM */}
                    <form onSubmit={handleRemove}>
                        <input type="hidden" name="share_id" value={share.id} />
                        <input type="hidden" name="car_id" value={carId} />
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="text-xs text-red-500 hover:text-red-600 font-bold hover:underline px-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Visszavonás
                        </button>
                    </form>
                </div>
            ))
        ) : (
            <p className="text-sm text-slate-400 italic">Még senkivel nincs megosztva ez az autó.</p>
        )}
      </div>
    </div>
  )
}