'use client'

import { useState } from 'react'
import { login, signup, signInWithGoogle } from '@/app/login/action' // Importáljuk a szerver akciókat
import Link from 'next/link'

type AuthFormProps = {
  isLogin: boolean
  message: string | null
}

export default function AuthForm({ isLogin, message }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <>
      <div className="text-center lg:text-left mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {isLogin ? 'Üdvözlünk újra!' : 'Fiók létrehozása'}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          {isLogin ? 'Jelentkezz be a folytatáshoz.' : 'Csatlakozz a közösséghez még ma.'}
        </p>
      </div>

      {/* Google Login */}
      <form action={signInWithGoogle} className="mb-6">
        <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-3 py-3 text-sm font-bold text-slate-900 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all active:scale-[0.98]">
           <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
           </svg>
           <span className="text-sm">Folytatás Google fiókkal</span>
        </button>
      </form>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-slate-950 px-2 text-slate-500 uppercase text-xs font-semibold tracking-wider">vagy email</span>
        </div>
      </div>

      {/* Email Űrlap */}
      <form 
        className="space-y-5" 
        onSubmit={() => setLoading(true)} // Töltés jelzés submitkor
      >
        <div>
          <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Email cím</label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="pelda@mail.com"
              className="block w-full rounded-xl border-0 bg-slate-900/50 py-3 px-4 text-white shadow-sm ring-1 ring-inset ring-slate-800 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm sm:leading-6 transition-all"
            />
          </div>
        </div>

        {/* --- MEGJELENÍTHETŐ JELSZÓ MEZŐ --- */}
        <div>
          <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Jelszó</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"} // Itt váltogatjuk a típust
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
              placeholder="••••••••"
              className="block w-full rounded-xl border-0 bg-slate-900/50 py-3 pl-4 pr-10 text-white shadow-sm ring-1 ring-inset ring-slate-800 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm sm:leading-6 transition-all"
            />
            {/* SZEM IKON GOMB */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
              tabIndex={-1} // Tabbal ne lépjen rá, csak klikkre
            >
              {showPassword ? (
                // Nyitott szem (rejtéshez)
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                // Csukott szem (megjelenítéshez)
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Hibaüzenet */}
        {message && (
          <div className={`p-4 rounded-lg text-sm flex items-start gap-3 border ${
            message.toLowerCase().includes('hiba') || message.toLowerCase().includes('error') || message.toLowerCase().includes('sikertelen')
              ? 'bg-red-500/10 border-red-500/20 text-red-200' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
          }`}>
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               {message.toLowerCase().includes('hiba') || message.toLowerCase().includes('error') ? (
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               ) : (
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
               )}
            </svg>
            <span>{message}</span>
          </div>
        )}

        {/* Gomb */}
        <div>
          <button
            type="submit"
            disabled={loading}
            formAction={isLogin ? login : signup}
            className="flex w-full justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 transition-all transform active:scale-[0.98] uppercase tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Folyamatban...' : (isLogin ? 'Belépés' : 'Fiók létrehozása')}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-400">
          {isLogin ? 'Nincs még fiókod?' : 'Már van fiókod?'} {' '}
          <Link 
            href={isLogin ? '/login?mode=signup' : '/login?mode=signin'} 
            className="font-bold text-amber-500 hover:text-amber-400 transition-colors"
          >
            {isLogin ? 'Regisztrálj ingyen' : 'Jelentkezz be'}
          </Link>
        </p>
      </div>
    </>
  )
}