'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, ArrowLeft } from 'lucide-react';
import AuthForm from '@/components/AuthForm';

export default function LoginContent({ isLogin, message }: { isLogin: boolean; message: string | null }) {
  const [lang, setLang] = useState<'hu' | 'en'>('hu');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang');
    if (savedLang === 'en') {
      setLang('en');
    }
  }, []);

  const t = {
    back: lang === 'en' ? 'Back to home' : 'Vissza a főoldalra',
    secureLogin: lang === 'en' ? 'Secure Login' : 'Biztonságos Belépés',
    welcomeBack: lang === 'en' ? 'Welcome back' : 'Üdvözlünk újra',
    createAccount: lang === 'en' ? 'Create an account' : 'Fiók létrehozása',
    subtitle: lang === 'en' ? 'Enter the digital nerve center of your vehicle.' : 'Lépj be a járműved digitális idegközpontjába.',
  };

  return (
    <div className="w-full h-[100dvh] flex flex-col items-center justify-center p-4 relative z-10 font-sans">

      {/* Back link */}
      <div
        className="absolute left-4 md:left-8 z-20"
        style={{ top: 'calc(max(1.5rem, env(safe-area-inset-top) + 1rem))' }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold tracking-wide uppercase
            text-slate-500 dark:text-slate-400
            hover:text-slate-900 dark:hover:text-white
            transition-colors
            bg-white/50 dark:bg-white/5
            px-4 py-2 rounded-full
            border border-white/60 dark:border-white/10
            backdrop-blur-md
            shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.back}
        </Link>
      </div>

      {/* Card container */}
      <div className="w-full max-w-md relative group mt-12 md:mt-0">
        {/* Outer glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2.5rem] blur-2xl opacity-60 group-hover:opacity-100 transition duration-1000 pointer-events-none" />

        {/* Glass Card */}
        <div className="relative bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-3xl shadow-2xl backdrop-blur-3xl p-8 sm:p-10 overflow-hidden">

          {/* Subtle top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative w-16 h-16 group-hover:scale-105 transition-transform duration-500">
              <Image
                src="/DynamicSense-logo.png"
                alt="DynamicSense"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Header */}
          <div className="mb-8 text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-[0.2em] bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/20">
              <Lock size={10} className="fill-current" /> {t.secureLogin}
            </div>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-slate-900 dark:text-white uppercase">
              <span className="font-bold">{isLogin ? t.welcomeBack : t.createAccount}</span>
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t.subtitle}
            </p>
          </div>

          <AuthForm isLogin={isLogin} message={message} lang={lang} />
        </div>
      </div>
    </div>
  );
}
