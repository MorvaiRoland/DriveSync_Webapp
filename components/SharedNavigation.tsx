'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Gauge, Map, Lock, Search, Crown, Settings, LogOut, CarFront, BarChart3, Flame
} from 'lucide-react'

// ──────────────────────────────────────────
// AURORA BACKGROUND – Carbon Noir edition
// ──────────────────────────────────────────
export function AuroraBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
      {/* Primary orange glow – top right */}
      <div className="absolute top-[-15%] right-[-10%] w-[min(600px,80vw)] h-[min(600px,80vw)] rounded-full opacity-30 dark:opacity-20 animate-aurora"
        style={{ background: 'radial-gradient(circle, #FF6B00 0%, transparent 70%)', filter: 'blur(80px)' }} />
      {/* Secondary amber – bottom left */}
      <div className="absolute bottom-[-20%] left-[-10%] w-[min(500px,70vw)] h-[min(500px,70vw)] rounded-full opacity-20 dark:opacity-15"
        style={{ background: 'radial-gradient(circle, #FF9500 0%, transparent 70%)', filter: 'blur(100px)', animationDelay: '4s' }} />
      {/* Neutral dark mid */}
      <div className="absolute top-[35%] left-[25%] w-[min(400px,60vw)] h-[min(400px,60vw)] rounded-full opacity-10 dark:opacity-10"
        style={{ background: 'radial-gradient(circle, rgba(120,80,255,0.4) 0%, transparent 70%)', filter: 'blur(100px)' }} />
    </div>
  )
}

// ──────────────────────────────────────────
// NAV LINK ITEM
// ──────────────────────────────────────────
function NavLink({ href, icon, label, locked }: { href: string; icon: React.ReactNode; label: string; locked?: boolean }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
        locked
          ? 'text-white/20 hover:text-orange-400/70'
          : isActive
          ? 'text-orange-400 bg-orange-500/10 border border-orange-500/20'
          : 'text-white/50 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}

// ──────────────────────────────────────────
// DASHBOARD NAV – Carbon Noir floating bar
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
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const planLabel = plan === 'lifetime' ? 'Lifetime' : isTrial ? 'Early Access' : plan === 'free' ? 'Starter' : 'Pro'

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 px-3 sm:px-4"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      <div className={`max-w-5xl mx-auto flex items-center gap-2 h-14 px-4 rounded-2xl transition-all duration-500 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-2xl border border-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.6)]'
          : 'bg-black/50 backdrop-blur-xl border border-white/[0.05] shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
      }`}>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="relative w-7 h-7 group-hover:scale-110 transition-transform duration-300">
            <Image src="/DynamicSense-logo.png" alt="DS" fill className="object-contain" priority />
          </div>
          <span className="font-black text-sm tracking-tight text-white hidden sm:block">
            Dynamic<span className="text-orange-400">Sense</span>
          </span>
          {isDealer && (
            <span className="text-[9px] font-black uppercase tracking-widest bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30">
              Dealer
            </span>
          )}
        </Link>

        {/* Centre links */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          <NavLink href="/analytics" icon={<Gauge className="w-3.5 h-3.5" />} label="Elemzés" />
          <NavLink href="/showroom" icon={<Flame className="w-3.5 h-3.5" />} label="Showroom" />
          {isPro
            ? <NavLink href="/services" icon={<Map className="w-3.5 h-3.5" />} label="Térkép" />
            : <NavLink href="/pricing" icon={<Lock className="w-3 h-3" />} label="Térkép" locked />
          }
          {isPro
            ? <NavLink href="/check" icon={<Search className="w-3.5 h-3.5" />} label="VIN" />
            : <NavLink href="/pricing" icon={<Lock className="w-3 h-3" />} label="VIN" locked />
          }
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
          {/* Plan badge */}
          <Link href="/pricing" className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
            plan === 'lifetime'
              ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
              : plan !== 'free'
              ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
              : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
          }`}>
            {plan === 'lifetime' ? <><Crown className="w-3 h-3" />{planLabel}</> : planLabel}
          </Link>

          <Link href="/settings" className="p-2 rounded-xl text-white/40 hover:text-orange-400 hover:bg-orange-500/10 transition-all">
            <Settings className="w-4 h-4" />
          </Link>

          <form action={signOutAction}>
            <button className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}

// ──────────────────────────────────────────
// BOTTOM TAB BAR – Carbon Noir mobile
// ──────────────────────────────────────────
export function BottomNav({ isPro }: { isPro: boolean }) {
  const pathname = usePathname()

  const tabs = [
    { href: '/', icon: <CarFront className="w-5 h-5" />, label: 'Garázs' },
    { href: '/analytics', icon: <BarChart3 className="w-5 h-5" />, label: 'Elemzés' },
    { href: isPro ? '/services' : '/pricing', icon: <Map className="w-5 h-5" />, label: 'Térkép' },
    { href: '/showroom', icon: <Flame className="w-5 h-5" />, label: 'Show' },
    { href: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Beáll.' },
  ]

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 md:hidden"
      style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-3 mb-3 flex items-center justify-around
        bg-black/85 backdrop-blur-2xl
        border border-white/[0.07]
        rounded-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.6)]
        py-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 px-4 py-1 transition-all duration-200 ${
                isActive ? 'text-orange-400' : 'text-white/30 hover:text-white/60'
              }`}
            >
              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute mt-[-6px] w-1 h-1 rounded-full bg-orange-500 shadow-[0_0_6px_2px_rgba(255,107,0,0.6)]" />
              )}
              <span className={`transition-all duration-200 ${isActive ? 'scale-110' : ''}`}>
                {tab.icon}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
