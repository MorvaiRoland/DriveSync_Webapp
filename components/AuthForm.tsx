'use client'

import { useState, useEffect } from 'react'
import { login, signup, signInWithGoogle, resetPassword } from '@/app/login/action'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, Store } from 'lucide-react' // Importing icons

type AuthFormProps = {
  isLogin: boolean
  message: string | null
}

export default function AuthForm({ isLogin, message }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  
  // NEW: Role state ('user' or 'dealer')
  const [role, setRole] = useState<'user' | 'dealer'>('user')

  const [passwordInput, setPasswordInput] = useState('')
  const [isPasswordValid, setIsPasswordValid] = useState(false)

  const handleSubmit = () => setLoading(true)
  const showResetMessage = message && (message.toLowerCase().includes('visszaállító') || message.toLowerCase().includes('küldtük'))

  // Password validation logic
  useEffect(() => {
    if (isLogin) {
      setIsPasswordValid(true) 
      return
    }

    const validations = [
      passwordInput.length >= 6,
      /[a-z]/.test(passwordInput),
      /[A-Z]/.test(passwordInput),
      /[0-9]/.test(passwordInput),
      /[^a-zA-Z0-9]/.test(passwordInput)
    ]

    setIsPasswordValid(validations.every(Boolean))
  }, [passwordInput, isLogin])

  // Header Component
  const HeaderSection = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <div className="text-center mb-6 lg:mb-8">
      <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white drop-shadow-md">
        {title}
      </h2>
      <p className="mt-1 lg:mt-2 text-xs lg:text-sm text-slate-400 font-medium">
        {subtitle}
      </p>
    </div>
  )

  // Password Requirement Item Component
  const RequirementItem = ({ met, text }: { met: boolean, text: string }) => (
    <div className={`flex items-center gap-2 text-[10px] transition-colors duration-300 ${met ? 'text-emerald-400' : 'text-slate-500'}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${met ? 'bg-emerald-400' : 'bg-slate-600'}`} />
      <span>{text}</span>
    </div>
  )

  // --- PASSWORD RESET MODE ---
  if (resetMode || showResetMessage) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
        <HeaderSection 
            title="Jelszó visszaállítása" 
            subtitle="Add meg a fiókodhoz tartozó email címet." 
        />

        {message && (
          <div className={`p-3 rounded-lg text-xs font-medium flex items-start gap-2 border mb-4 ${
            showResetMessage ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <span>{message}</span>
          </div>
        )}

        <form action={resetPassword} onSubmit={handleSubmit} className="space-y-4">
            <div className="group">
              <input
                name="email" type="email" required placeholder="Email cím"
                className="block w-full rounded-xl border border-white/10 bg-slate-950/50 py-3 px-4 text-white shadow-inner placeholder:text-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
              />
            </div>
            
            <button
              type="submit" disabled={loading || !!showResetMessage}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:grayscale"
            >
              {loading ? 'Küldés...' : 'Link küldése'}
            </button>
        </form>

        <div className="mt-6 text-center">
            <button onClick={() => { setResetMode(false); setLoading(false); }} className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-wider">
              Vissza a belépéshez
            </button>
        </div>
      </motion.div>
    )
  }

  // --- NORMAL AUTH MODE ---
  return (
    <div className="w-full">
      <HeaderSection 
        title={isLogin ? 'Üdvözlünk újra.' : 'Fiók létrehozása.'} 
        subtitle={isLogin ? 'Az intelligencia visszavár.' : 'Válassz fiók típust és csatlakozz.'}
      />

      {/* --- ROLE SELECTOR (ALWAYS VISIBLE NOW) --- */}
      {/* This ensures users can select 'Dealer' even if they land on the Login tab and click Google immediately */}
      <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-slate-900/50 rounded-xl border border-white/10">
          <button
              type="button"
              onClick={() => setRole('user')}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${
                  role === 'user' 
                  ? 'bg-amber-500 text-slate-900 shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
              <User size={16} /> Magánszemély
          </button>
          <button
              type="button"
              onClick={() => setRole('dealer')}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${
                  role === 'dealer' 
                  ? 'bg-indigo-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
              <Store size={16} /> Kereskedő
          </button>
      </div>

      {/* Google Login */}
      <form action={signInWithGoogle} className="mb-5">
        {/* Pass selected role to Google sign in as well */}
        <input type="hidden" name="role" value={role} />
        
        <button type="submit" className="relative flex w-full items-center justify-center gap-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 px-3 py-2.5 transition-all active:scale-[0.98] group">
           <svg className="h-5 w-5 opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
           </svg>
           <span className="text-sm font-semibold text-slate-200 group-hover:text-white">Google fiókkal</span>
        </button>
      </form>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest">
          <span className="bg-transparent px-2 text-slate-600 font-bold backdrop-blur-sm">vagy</span>
        </div>
      </div>

      <form action={isLogin ? login : signup} onSubmit={handleSubmit} className="space-y-4">
        
        {/* HIDDEN INPUT FOR ROLE */}
        <input type="hidden" name="role" value={role} />

        <div className="space-y-3">
            <input
                name="email" type="email" required placeholder="Email cím"
                className="block w-full rounded-xl border border-white/10 bg-slate-950/50 py-3 px-4 text-white shadow-inner placeholder:text-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
            />
            
            <div className="relative">
                <input
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  placeholder="Jelszó"
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="block w-full rounded-xl border border-white/10 bg-slate-950/50 py-3 pl-4 pr-10 text-white shadow-inner placeholder:text-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-amber-500 transition-colors">
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
            </div>

            {!isLogin && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                className="px-1 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-1.5 p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="col-span-2 mb-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Jelszó követelmények:
                  </div>
                  <RequirementItem met={passwordInput.length >= 6} text="Min. 6 karakter" />
                  <RequirementItem met={/[A-Z]/.test(passwordInput)} text="Nagybetű" />
                  <RequirementItem met={/[a-z]/.test(passwordInput)} text="Kisbetű" />
                  <RequirementItem met={/[0-9]/.test(passwordInput)} text="Szám" />
                  <RequirementItem met={/[^a-zA-Z0-9]/.test(passwordInput)} text="Speciális jel" />
                </div>
              </motion.div>
            )}
        </div>
          
        {isLogin && (
            <div className="flex justify-end">
                <button type="button" onClick={() => setResetMode(true)} className="text-[11px] font-semibold text-slate-400 hover:text-amber-500 transition-colors uppercase tracking-wide">
                Elfelejtett jelszó?
                </button>
            </div>
        )}

        {!isLogin && (
          <div className="flex items-start gap-3">
            <input id="terms" name="terms" type="checkbox" required className="mt-1 w-3.5 h-3.5 rounded border-slate-700 bg-slate-900/50 text-amber-500 focus:ring-amber-500 accent-amber-500" />
            <label htmlFor="terms" className="text-[10px] text-slate-400 leading-snug">
              Elfogadom az <Link href="/terms" className="text-amber-500 hover:underline">ÁSZF</Link>-et és az <Link href="/privacy" className="text-amber-500 hover:underline">Adatvédelmet</Link>.
            </label>
          </div>
        )}

        {message && (
          <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 border ${
            message.toLowerCase().includes('siker') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit" 
          disabled={loading || (!isLogin && !isPasswordValid)}
          className={`w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed uppercase tracking-wider
            ${!isLogin && role === 'dealer' 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-500/30 hover:shadow-indigo-500/50' 
                : 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/30 hover:shadow-amber-500/50'
            }
          `}
        >
          {loading ? 'Feldolgozás...' : (isLogin ? 'Belépés a rendszerbe' : (role === 'dealer' ? 'Kereskedői Fiók Létrehozása' : 'Fiók létrehozása'))}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-500 font-medium">
          {isLogin ? 'Még nincs hozzáférésed?' : 'Már van fiókod?'} {' '}
          <Link href={isLogin ? '/login?mode=signup' : '/login?mode=signin'} onClick={() => setLoading(false)} className="font-bold text-amber-500 hover:text-amber-400 transition-colors uppercase">
            {isLogin ? 'Regisztráció' : 'Belépés'}
          </Link>
        </p>
      </div>
    </div>
  )
}