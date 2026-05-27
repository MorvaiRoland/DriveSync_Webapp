'use client'

import { useState, useEffect } from 'react'
import { login, signup, signInWithGoogle, resetPassword } from '@/app/login/action'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, Store, Eye, EyeOff } from 'lucide-react'

type AuthFormProps = {
  isLogin: boolean
  message: string | null
  lang?: 'hu' | 'en'
}

export default function AuthForm({ isLogin, message, lang = 'hu' }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [role, setRole] = useState<'user' | 'dealer'>('user')
  const [passwordInput, setPasswordInput] = useState('')
  const [isPasswordValid, setIsPasswordValid] = useState(false)

  const handleSubmit = () => setLoading(true)
  const showResetMessage = message && (message.toLowerCase().includes('visszaállító') || message.toLowerCase().includes('küldtük'))

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

  const t = {
    resetTitle: lang === 'en' ? 'Reset Password' : 'Jelszó visszaállítása',
    resetDesc: lang === 'en' ? 'Enter the email address associated with your account.' : 'Add meg a fiókodhoz tartozó email címet.',
    emailPlaceholder: lang === 'en' ? 'Email address' : 'Email cím',
    passwordPlaceholder: lang === 'en' ? 'Password' : 'Jelszó',
    sendLink: lang === 'en' ? 'Send Link' : 'Link küldése',
    sending: lang === 'en' ? 'Sending...' : 'Küldés...',
    backToLogin: lang === 'en' ? 'Back to login' : 'Vissza a belépéshez',
    individual: lang === 'en' ? 'Individual' : 'Magánszemély',
    dealer: lang === 'en' ? 'Dealer' : 'Kereskedő',
    googleAuth: lang === 'en' ? 'Continue with Google' : 'Google fiókkal',
    or: lang === 'en' ? 'or' : 'vagy',
    pwdReqs: lang === 'en' ? 'Password requirements:' : 'Jelszó követelmények:',
    minChars: lang === 'en' ? 'Min. 6 chars' : 'Min. 6 karakter',
    uppercase: lang === 'en' ? 'Uppercase' : 'Nagybetű',
    lowercase: lang === 'en' ? 'Lowercase' : 'Kisbetű',
    number: lang === 'en' ? 'Number' : 'Szám',
    special: lang === 'en' ? 'Special char' : 'Speciális jel',
    forgotPwd: lang === 'en' ? 'Forgot password?' : 'Elfelejtett jelszó?',
    acceptTermsPrefix: lang === 'en' ? 'I accept the ' : 'Elfogadom az ',
    terms: lang === 'en' ? 'Terms' : 'ÁSZF',
    and: lang === 'en' ? ' and ' : '-et és az ',
    privacy: lang === 'en' ? 'Privacy Policy' : 'Adatvédelmet',
    processing: lang === 'en' ? 'Processing...' : 'Feldolgozás...',
    loginBtn: lang === 'en' ? 'Sign in' : 'Belépés a rendszerbe',
    registerBtn: lang === 'en' ? 'Create account' : 'Fiók létrehozása',
    noAccount: lang === 'en' ? "Don't have an account?" : 'Még nincs hozzáférésed?',
    hasAccount: lang === 'en' ? 'Already have an account?' : 'Már van fiókod?',
    registerLink: lang === 'en' ? 'Sign up' : 'Regisztráció',
    loginLink: lang === 'en' ? 'Sign in' : 'Belépés',
  }

  // --- Shared input/button class helpers ---
  const inputClass = [
    'block w-full rounded-xl py-3 px-4 text-sm outline-none transition-all',
    'bg-white/80 dark:bg-black/30',
    'border border-slate-200 dark:border-white/10',
    'text-slate-900 dark:text-white',
    'placeholder:text-slate-400 dark:placeholder:text-slate-500',
    'focus:border-indigo-500 dark:focus:border-indigo-400',
    'focus:ring-1 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/30',
    'backdrop-blur-sm',
  ].join(' ')

  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-[10px] transition-colors duration-300 ${met ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${met ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
      <span>{text}</span>
    </div>
  )

  if (resetMode || showResetMessage) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
        <div className="text-center mb-6">
          <h3 className="text-xl font-light tracking-tight text-slate-900 dark:text-white uppercase">
            <span className="font-bold">{t.resetTitle}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.resetDesc}</p>
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 border mb-4 backdrop-blur-sm ${
            showResetMessage
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
              : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50'
          }`}>
            <span>{message}</span>
          </div>
        )}

        <form action={resetPassword} onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            required
            placeholder={t.emailPlaceholder}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={loading || !!showResetMessage}
            className="w-full rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 py-3 text-sm font-bold text-white dark:text-slate-900 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t.sending : t.sendLink}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setResetMode(false); setLoading(false); }}
            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-wider"
          >
            {t.backToLogin}
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="w-full">

      {/* --- SZEREPKÖR VÁLASZTÓ (CSAK REGISZTRÁCIÓNÁL) --- */}
      {!isLogin && (
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => setRole('user')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
              role === 'user'
                ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/10'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <User size={14} /> {t.individual}
          </button>
          <button
            type="button"
            onClick={() => setRole('dealer')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
              role === 'dealer'
                ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/10'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <Store size={14} /> {t.dealer}
          </button>
        </div>
      )}

      {/* Google Login */}
      <form action={signInWithGoogle} className="mb-5">
        <input type="hidden" name="role" value={isLogin ? 'user' : role} />
        <button
          type="submit"
          className="relative flex w-full items-center justify-center gap-3 rounded-xl py-2.5 px-3 transition-all active:scale-[0.98] group
            bg-white/80 dark:bg-white/5
            border border-slate-200 dark:border-white/10
            hover:bg-white dark:hover:bg-white/10
            backdrop-blur-sm"
        >
          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            {t.googleAuth}
          </span>
        </button>
      </form>

      {/* Divider */}
      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-white/10" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
          <span className="px-3 text-slate-400 dark:text-slate-500 font-bold bg-white/60 dark:bg-transparent backdrop-blur-sm rounded-full">
            {t.or}
          </span>
        </div>
      </div>

      <form action={isLogin ? login : signup} onSubmit={handleSubmit} className="space-y-4">

        {!isLogin && <input type="hidden" name="role" value={role} />}

        <div className="space-y-3">
          <input
            name="email"
            type="email"
            required
            placeholder={t.emailPlaceholder}
            className={inputClass}
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder={t.passwordPlaceholder}
              onChange={(e) => setPasswordInput(e.target.value)}
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {!isLogin && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="px-1 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-1.5 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 mt-1 backdrop-blur-sm">
                <div className="col-span-2 mb-1 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  {t.pwdReqs}
                </div>
                <RequirementItem met={passwordInput.length >= 6} text={t.minChars} />
                <RequirementItem met={/[A-Z]/.test(passwordInput)} text={t.uppercase} />
                <RequirementItem met={/[a-z]/.test(passwordInput)} text={t.lowercase} />
                <RequirementItem met={/[0-9]/.test(passwordInput)} text={t.number} />
                <RequirementItem met={/[^a-zA-Z0-9]/.test(passwordInput)} text={t.special} />
              </div>
            </motion.div>
          )}
        </div>

        {isLogin && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setResetMode(true)}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors uppercase tracking-wide"
            >
              {t.forgotPwd}
            </button>
          </div>
        )}

        {!isLogin && (
          <div className="flex items-start gap-3 pt-1">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="mt-1 w-3.5 h-3.5 rounded border-slate-300 dark:border-white/20 bg-white dark:bg-white/10 text-indigo-500 focus:ring-indigo-500 accent-indigo-500"
            />
            <label htmlFor="terms" className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
              {t.acceptTermsPrefix}{' '}
              <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">{t.terms}</Link>
              {t.and}
              <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">{t.privacy}</Link>.
            </label>
          </div>
        )}

        {message && !showResetMessage && (
          <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 border backdrop-blur-sm ${
            message.toLowerCase().includes('siker')
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
              : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (!isLogin && !isPasswordValid)}
          className="w-full rounded-xl py-3.5 text-sm font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed
            bg-slate-900 dark:bg-white
            hover:bg-slate-800 dark:hover:bg-slate-100
            text-white dark:text-slate-900"
        >
          {loading ? t.processing : (isLogin ? t.loginBtn : t.registerBtn)}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
          {isLogin ? t.noAccount : t.hasAccount}{' '}
          <Link
            href={isLogin ? '/login?mode=signup' : '/login?mode=signin'}
            onClick={() => setLoading(false)}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
          >
            {isLogin ? t.registerLink : t.loginLink}
          </Link>
        </p>
      </div>
    </div>
  )
}