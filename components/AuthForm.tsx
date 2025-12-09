'use client'

import { useState } from 'react'
import { login, signup, signInWithGoogle, resetPassword } from '@/app/login/action'
import Link from 'next/link'

type AuthFormProps = {
  isLogin: boolean
  message: string | null
}

export default function AuthForm({ isLogin, message }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)

  const handleSubmit = () => {
      setLoading(true);
  }

  const showResetMessage = message && (message.toLowerCase().includes('visszaállító linket') || message.toLowerCase().includes('küldtük'));
  
  // --- JELSZÓ VISSZAÁLLÍTÁS KÉPERNYŐ ---
  if (resetMode || showResetMessage) {
    return (
      <>
        <div className="text-center lg:text-left mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-white">Jelszó visszaállítása</h2>
            <p className="mt-2 text-sm text-slate-400">
                Kérjük, add meg a fiókodhoz tartozó email címet.
            </p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg text-sm flex items-start gap-3 border mb-5 ${
            showResetMessage
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' 
              : 'bg-red-500/10 border-red-500/20 text-red-200' 
          }`}>
             <span className="flex-1">{message}</span>
          </div>
        )}

        <form action={resetPassword} onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Email cím</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="pelda@mail.com"
                className="block w-full rounded-xl border-0 bg-slate-900/50 py-3 px-4 text-white shadow-sm ring-1 ring-inset ring-slate-800 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm transition-all"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !!showResetMessage}
              className="flex w-full justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 transition-all transform active:scale-[0.98] uppercase tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Folyamatban...' : 'Link küldése'}
            </button>
        </form>

        <div className="mt-8 text-center">
            <Link 
              href="/login" 
              className="font-bold text-slate-500 hover:text-amber-400 transition-colors"
              onClick={() => { setResetMode(false); setLoading(false); }}
            >
              Vissza a belépéshez
            </Link>
        </div>
      </>
    )
  }

  // --- ALAP BEJELENTKEZÉS / REGISZTRÁCIÓ KÉPERNYŐ ---
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

      <form action={signInWithGoogle} className="mb-6">
        <button type="submit" className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-3 py-3 text-sm font-bold text-slate-900 shadow-sm hover:bg-slate-100 transition-all active:scale-[0.98]">
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
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-slate-950 px-2 text-slate-500 uppercase text-xs font-semibold tracking-wider">vagy email</span>
        </div>
      </div>

      <form 
        action={isLogin ? login : signup}
        onSubmit={handleSubmit}
        className="space-y-5" 
      >
        <div>
          <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Email cím</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="pelda@mail.com"
            className="block w-full rounded-xl border-0 bg-slate-900/50 py-3 px-4 text-white shadow-sm ring-1 ring-inset ring-slate-800 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm transition-all"
          />
        </div>

        <div>
          {/* JAVÍTVA: className a class helyett */}
          <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Jelszó</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
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
          
          {isLogin && (
            <div className="text-right mt-2">
              <button 
                type="button" 
                onClick={() => setResetMode(true)}
                className="text-xs font-medium text-slate-500 hover:text-amber-500 transition-colors"
              >
                Elfelejtetted a jelszavad?
              </button>
            </div>
          )}
        </div>

        {message && (
          <div className={`p-4 rounded-lg text-sm flex items-start gap-3 border ${
            message.toLowerCase().includes('siker') 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
              : 'bg-red-500/10 border-red-500/20 text-red-200' 
          }`}>
            <span>{message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 transition-all transform active:scale-[0.98] uppercase tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Folyamatban...' : (isLogin ? 'Belépés' : 'Fiók létrehozása')}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-400">
          {isLogin ? 'Nincs még fiókod?' : 'Már van fiókod?'} {' '}
          <Link 
            href={isLogin ? '/login?mode=signup' : '/login?mode=signin'} 
            className="font-bold text-amber-500 hover:text-amber-400 transition-colors"
            onClick={() => setLoading(false)}
          >
            {isLogin ? 'Regisztrálj ingyen' : 'Jelentkezz be'}
          </Link>
        </p>
      </div>
    </>
  )
}