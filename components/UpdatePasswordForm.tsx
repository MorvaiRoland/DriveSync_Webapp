// components/UpdatePasswordForm.tsx
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

  // Itt egy kis trükk: kliens oldalon ellenőrizzük, hogy be van-e töltve
  // Ez segít elkerülni a hydration hibákat
  const [isMounted, setIsMounted] = useState(false);
  
  // useEffect(() => { setIsMounted(true) }, []); // Opcionális, ha nagyon makacs a hiba

  const handleSubmit = () => {
      setLoading(true);
  }

  return (
    <>
      <div className="text-center lg:text-left mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-white">Új jelszó megadása</h2>
        <p className="mt-2 text-sm text-slate-400">
          Kérjük, adj meg egy új, biztonságos jelszót.
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
              suppressHydrationWarning={true} // <--- EZT ADJUK HOZZÁ
              className="block w-full rounded-xl border-0 bg-slate-900/50 py-3 pl-4 pr-10 text-white shadow-sm ring-1 ring-inset ring-slate-800 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 focus:outline-none"
            >
               {/* SVG ikonok... */}
               <span className="text-xs text-slate-500">{showPassword ? 'Hide' : 'Show'}</span>
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
            suppressHydrationWarning={true} // <--- EZT ADJUK HOZZÁ
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
    </>
  )
}