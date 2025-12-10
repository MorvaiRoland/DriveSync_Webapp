'use client'

import { useState } from 'react'
import { updatePassword } from '@/app/login/action'
import Link from 'next/link'

type Props = {
  message: string | null
}

export default function UpdatePasswordForm({ message }: Props) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = () => {
      setLoading(true);
  }

  return (
    <>
      <div className="text-center lg:text-left mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-white">Új jelszó megadása</h2>
        <p className="mt-2 text-sm text-slate-400">
          Kérjük, adj meg egy új, biztonságos jelszót a fiókodhoz.
        </p>
      </div>

      <form action={updatePassword} onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Új jelszó</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              minLength={6}
              className="block w-full rounded-xl border-0 bg-slate-900/50 py-3 pl-4 pr-10 text-white shadow-sm ring-1 ring-inset ring-slate-800 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 focus:outline-none"
            >
               {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Jelszó megerősítése</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            placeholder="••••••••"
            minLength={6}
            className="block w-full rounded-xl border-0 bg-slate-900/50 py-3 px-4 text-white shadow-sm ring-1 ring-inset ring-slate-800 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm transition-all"
          />
        </div>

        {message && (
          <div className="p-4 rounded-lg text-sm flex items-start gap-3 border bg-red-500/10 border-red-500/20 text-red-200">
            <span>{message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all transform active:scale-[0.98] uppercase tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Mentés folyamatban...' : 'Jelszó mentése'}
        </button>
      </form>

       <div className="mt-8 text-center">
        <Link 
            href="/login" 
            className="font-bold text-slate-500 hover:text-amber-400 transition-colors"
        >
            Mégse, vissza a belépéshez
        </Link>
        </div>
    </>
  )
}