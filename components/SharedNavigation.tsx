'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Gauge, Map, Lock, Search, Crown, Settings, LogOut, CarFront, BarChart3
} from 'lucide-react'

// ──────────────────────────────────────────
// AURORA BACKGROUND
// ──────────────────────────────────────────
export function AuroraBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
      <div className="absolute top-[-10%] right-[-5%] w-[min(500px,90vw)] h-[min(500px,90vw)] bg-indigo-400/15 dark:bg-indigo-600/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[min(500px,90vw)] h-[min(500px,90vw)] bg-violet-400/15 dark:bg-purple-600/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute top-[40%] left-[20%] w-[min(400px,80vw)] h-[min(400px,80vw)] bg-cyan-300/10 dark:bg-cyan-600/15 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
    </div>
  )
}

// ──────────────────────────────────────────
// TOP NAV (floating pill – matches landing)
// ──────────────────────────────────────────
interface DashboardNavProps {
  userName: string
  plan: string
  isTrial: boolean
  isPro: boolean
  isDealer?: boolean
  signOutAction: () => Promise<void>
}

export function DashboardNav({ userName, plan, isTrial, isPro, isDealer, signOutAction }: DashboardNavProps) {
  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 px-3 sm:px-4"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      <div className="max-w-5xl mx-auto flex items-center gap-2
        h-14 px-4
        bg-white/70 dark:bg-black/70
        backdrop-blur-2xl
        border border-white/50 dark:border-white/10
        rounded-2xl
        shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]
        transition-all duration-500"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="relative w-7 h-7 group-hover:rotate-12 transition-transform duration-500">
            <Image src="/DynamicSense-logo.png" alt="DS" fill className="object-contain" priority />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white hidden sm:block">
            Dynamic<span className="text-slate-400 dark:text-slate-500">Sense</span>
          </span>
          {isDealer && (
            <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              Dealer
            </span>
          )}
        </Link>

        {/* Centre links – desktop only */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {[
            { href: '/analytics', icon: <Gauge className="w-3.5 h-3.5 text-indigo-500" />, label: 'Elemzés' },
            { href: '/showroom', icon: <span className="text-base leading-none">🔥</span>, label: 'Showroom' },
            isPro
              ? { href: '/services', icon: <Map className="w-3.5 h-3.5 text-blue-500" />, label: 'Térkép' }
              : { href: '/pricing', icon: <Lock className="w-3 h-3 text-slate-400" />, label: 'Térkép', locked: true },
            isPro
              ? { href: '/check', icon: <Search className="w-3.5 h-3.5 text-emerald-500" />, label: 'VIN' }
              : { href: '/pricing', icon: <Lock className="w-3 h-3 text-slate-400" />, label: 'VIN', locked: true },
          ].map((item: any) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                item.locked
                  ? 'text-slate-400 dark:text-slate-600 hover:text-amber-500'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
          {/* Plan badge */}
          <Link href="/pricing" className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
            plan === 'lifetime'
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
              : plan !== 'free'
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10'
          }`}>
            {plan === 'lifetime' ? <><Crown className="w-3 h-3" /> Lifetime</> : isTrial ? 'Early Access' : plan === 'free' ? 'Starter' : 'Pro'}
          </Link>

          <Link href="/settings" className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all">
            <Settings className="w-4 h-4" />
          </Link>
          <form action={signOutAction}>
            <button className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}

// ──────────────────────────────────────────
// BOTTOM TAB BAR (mobile)
// ──────────────────────────────────────────
export function BottomNav({ isPro }: { isPro: boolean }) {
  const tabs = [
    { href: '/', icon: <CarFront className="w-5 h-5" />, label: 'Garázs' },
    { href: '/analytics', icon: <BarChart3 className="w-5 h-5" />, label: 'Elemzés' },
    { href: isPro ? '/services' : '/pricing', icon: <Map className="w-5 h-5" />, label: 'Térkép' },
    { href: '/showroom', icon: <span className="text-lg leading-none">🔥</span>, label: 'Show' },
    { href: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Beáll.' },
  ]

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 md:hidden"
      style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-3 mb-3 flex items-center justify-around
        bg-white/80 dark:bg-black/80
        backdrop-blur-2xl
        border border-white/60 dark:border-white/10
        rounded-2xl shadow-xl
        py-2"
      >
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center gap-1 px-4 py-1 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            {tab.icon}
            <span className="text-[9px] font-bold uppercase tracking-widest">{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
