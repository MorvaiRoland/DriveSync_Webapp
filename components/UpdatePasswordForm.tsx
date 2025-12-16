'use client'

import { useState } from 'react'
import { updateNewPassword } from '@/app/login/action' // Az új action importálása
import { useRouter } from 'next/navigation'

export default function UpdatePasswordForm({ message }: { message: string | null }) {
  const [loading, setLoading] = useState(false)
  
  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-white">Új jelszó megadása</h2>
        <p className="mt-2 text-sm text-slate-400">
          Kérjük, adj meg egy erős jelszót a fiókod biztonsága érdekében.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-lg text-sm flex items-start gap-3 border mb-5 bg-red-500/10 border-red-500/20 text-red-200">
          <span>{message}</span>
        </div>
      )}

      <form action={updateNewPassword} onSubmit={() => setLoading(true)} className="space-y-5">
        <div>
          <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Új jelszó</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="block w-full rounded-xl border-0 bg-slate-900/50 py-3 px-4 text-white shadow-sm ring-1 ring-inset ring-slate-800 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm transition-all"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Jelszó megerősítése</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            placeholder="••••••••"
            className="block w-full rounded-xl border-0 bg-slate-900/50 py-3 px-4 text-white shadow-sm ring-1 ring-inset ring-slate-800 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm transition-all"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all uppercase tracking-wide disabled:opacity-70"
        >
          {loading ? 'Mentés...' : 'Jelszó frissítése'}
        </button>
      </form>
    </div>
  )
}