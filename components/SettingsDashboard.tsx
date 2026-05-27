'use client'

import { useState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { updateProfile, updatePreferences, deleteAccountAction } from '@/app/settings/actions'
import Image from 'next/image'
import Link from 'next/link'
import {
  User, Bell, CreditCard, Loader2, LogOut, Moon, Sun,
  CheckCircle, Camera, AlertTriangle, Trash2,
  ShieldCheck, Zap, Sparkles, Smartphone, Crown,
  ArrowLeft, X, Settings
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import imageCompression from 'browser-image-compression'

// ──────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────
interface SettingsDashboardProps {
  user: any
  meta: any
  settings: any
  subscription: any
  earlyAccessConfig: any
}

// ──────────────────────────────────────────
// GLASS WRAPPER
// ──────────────────────────────────────────
function Glass({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`
      bg-white/60 dark:bg-white/[0.04]
      border border-white/70 dark:border-white/[0.08]
      backdrop-blur-xl shadow-sm
      ${className}
    `}>
      {children}
    </div>
  )
}

// ──────────────────────────────────────────
// SUBMIT BUTTON
// ──────────────────────────────────────────
function SubmitButton({ label = 'Mentés', disabled }: { label?: string; disabled?: boolean }) {
  const { pending } = useFormStatus()
  const busy = pending || disabled
  return (
    <button
      type="submit"
      disabled={busy}
      className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        bg-slate-900 dark:bg-white text-white dark:text-slate-900
        hover:bg-slate-800 dark:hover:bg-slate-100
        shadow-sm"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
      {busy ? 'Feldolgozás...' : label}
    </button>
  )
}

// ──────────────────────────────────────────
// TOGGLE SWITCH
// ──────────────────────────────────────────
function Toggle({ name, checked, onChange }: { name: string; checked: boolean; onChange?: () => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={checked}
        className="sr-only peer"
        onChange={onChange}
      />
      <div className="w-11 h-6 bg-slate-200 dark:bg-white/10 rounded-full peer
        peer-checked:bg-indigo-500 dark:peer-checked:bg-indigo-500
        after:content-[''] after:absolute after:top-[2px] after:left-[2px]
        after:bg-white after:rounded-full after:h-5 after:w-5
        after:transition-all peer-checked:after:translate-x-full
        transition-all"
      />
    </label>
  )
}

// ──────────────────────────────────────────
// SECTION HEADER
// ──────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center
        bg-slate-100 dark:bg-white/10
        border border-slate-200 dark:border-white/10">
        {icon}
      </div>
      <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">{title}</h2>
    </div>
  )
}

// ──────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────
export default function SettingsDashboard({
  user, settings, subscription, earlyAccessConfig
}: SettingsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'billing'>('profile')
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.user_metadata?.avatar_url || null)
  const [newAvatarPath, setNewAvatarPath] = useState<string>('')

  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => setMounted(true), [])

  // Avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    setAvatarPreview(URL.createObjectURL(file))
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.2, maxWidthOrHeight: 500, useWebWorker: true, fileType: 'image/jpeg' })
      const fileName = `${user.id}-${Date.now()}.jpg`
      const { error } = await supabase.storage.from('avatars').upload(fileName, compressed, { upsert: true })
      if (error) throw error
      setNewAvatarPath(fileName)
      setTimeout(() => formRef.current?.requestSubmit(), 100)
    } catch {
      alert('Hiba a kép feltöltésekor!')
      setAvatarPreview(user.user_metadata?.avatar_url || null)
    } finally {
      setAvatarUploading(false)
    }
  }

  const manageSubscription = async () => {
    setLoadingPortal(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoadingPortal(false)
    }
  }

  // Plan display
  const dbPlan = subscription?.plan_type
  let planLabel = 'Starter (Ingyenes)'
  let planColor = 'text-slate-500 dark:text-slate-400'
  let planBg = 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'
  let planIcon = <User className="w-6 h-6" />

  if (dbPlan === 'lifetime') {
    planLabel = 'Founder Edition (Örökös)'; planColor = 'text-amber-500'; planBg = 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/40'; planIcon = <Crown className="w-6 h-6 fill-current text-amber-500" />
  } else if (dbPlan === 'pro') {
    planLabel = 'Pro Előfizetés'; planColor = 'text-indigo-500'; planBg = 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-900/40'; planIcon = <Zap className="w-6 h-6 fill-current text-indigo-500" />
  } else if (earlyAccessConfig?.early_access_pro) {
    planLabel = 'Early Access Pro'; planColor = 'text-emerald-500'; planBg = 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/40'; planIcon = <Sparkles className="w-6 h-6 fill-current text-emerald-500" />
  }

  if (!mounted) return null

  const tabs = [
    { id: 'profile', label: 'Profil', icon: <User className="w-4 h-4" /> },
    { id: 'preferences', label: 'Rendszer', icon: <Settings className="w-4 h-4" /> },
    { id: 'billing', label: 'Előfizetés', icon: <CreditCard className="w-4 h-4" /> },
  ]

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start">

      {/* ── SIDEBAR NAV ── */}
      <aside className="w-full lg:w-60 flex-shrink-0 sticky z-30"
        style={{ top: 'calc(max(0.75rem, env(safe-area-inset-top)) + 4rem)' }}>
        <Glass className="rounded-2xl overflow-hidden">
          {/* User chip */}
          <div className="px-4 py-4 border-b border-slate-100/60 dark:border-white/[0.06] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
              {avatarPreview
                ? <Image src={avatarPreview} alt="Avatar" width={36} height={36} className="object-cover w-full h-full" />
                : <User className="w-5 h-5 text-slate-400" />
              }
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </p>
              <p className={`text-[10px] font-bold truncate ${planColor}`}>{planLabel}</p>
            </div>
          </div>

          {/* Nav buttons */}
          <div className="p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-left ${
                  activeTab === tab.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100/60 dark:bg-white/[0.06] mx-3" />

          {/* Logout */}
          <div className="p-2">
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-left"
            >
              <LogOut className="w-4 h-4" /> Kilépés
            </button>
          </div>
        </Glass>

        {/* Back button */}
        <Link
          href="/"
          className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all
            text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white
            bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Garázs
        </Link>
      </aside>

      {/* ── CONTENT AREA ── */}
      <main className="flex-1 w-full min-w-0">

        {/* ─── 1. PROFIL ─── */}
        {activeTab === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Avatar card */}
            <Glass className="rounded-2xl p-6">
              <SectionHeader icon={<Camera className="w-4 h-4 text-slate-500 dark:text-slate-400" />} title="Profilkép" />
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div
                  onClick={() => !avatarUploading && fileInputRef.current?.click()}
                  className={`relative w-24 h-24 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all group
                    border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500
                    ${avatarUploading ? 'opacity-70 pointer-events-none' : ''}`}
                >
                  {avatarUploading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                  {avatarPreview
                    ? <Image src={avatarPreview} alt="Avatar" fill className="object-cover" />
                    : <div className="w-full h-full bg-slate-100 dark:bg-white/10 flex items-center justify-center"><User className="w-8 h-8 text-slate-400 dark:text-slate-500" /></div>
                  }
                  {!avatarUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Profilkép módosítása</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Automatikus tömörítés, max 200KB</p>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  <button
                    type="button"
                    disabled={avatarUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all disabled:opacity-50
                      bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300
                      hover:bg-slate-200 dark:hover:bg-white/15
                      border border-slate-200 dark:border-white/10"
                  >
                    {avatarUploading ? 'Feltöltés...' : 'Kép választása'}
                  </button>
                </div>
              </div>
            </Glass>

            {/* Profile form */}
            <Glass className="rounded-2xl p-6">
              <SectionHeader icon={<User className="w-4 h-4 text-slate-500 dark:text-slate-400" />} title="Személyes Adatok" />
              <form action={updateProfile} ref={formRef} className="space-y-5">
                <input type="hidden" name="avatar_path" value={newAvatarPath} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest pl-1">Teljes Név</label>
                    <input
                      name="full_name"
                      type="text"
                      defaultValue={user.user_metadata?.full_name}
                      placeholder="Minta János"
                      className="w-full rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-all
                        bg-white/80 dark:bg-white/[0.04]
                        border border-slate-200 dark:border-white/10
                        text-slate-900 dark:text-white
                        placeholder:text-slate-400 dark:placeholder:text-slate-600
                        focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Email (Azonosító)</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full rounded-xl px-4 py-2.5 text-sm font-medium opacity-60 cursor-not-allowed
                          bg-slate-50 dark:bg-white/[0.02]
                          border border-slate-200 dark:border-white/10
                          text-slate-900 dark:text-slate-400"
                      />
                      <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2 border-t border-slate-100/60 dark:border-white/[0.06]">
                  <SubmitButton label="Profil mentése" disabled={avatarUploading} />
                </div>
              </form>
            </Glass>

            {/* Danger zone */}
            <div className="rounded-2xl p-5 border border-red-200/60 dark:border-red-900/30 bg-red-50/60 dark:bg-red-950/10 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 border border-red-200 dark:border-red-900/50">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">Fiók megszüntetése</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Végleges törlés – nincs visszaút</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest
                    text-red-600 dark:text-red-400
                    border border-red-200 dark:border-red-900/50
                    hover:bg-red-600 hover:text-white hover:border-red-600 dark:hover:bg-red-600 dark:hover:border-red-600 dark:hover:text-white
                    transition-all"
                >
                  Törlés indítása
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── 2. RENDSZER ─── */}
        {activeTab === 'preferences' && (
          <motion.div key="prefs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Theme */}
            <Glass className="rounded-2xl p-6">
              <SectionHeader icon={<Sun className="w-4 h-4 text-amber-500" />} title="Vizuális Megjelenés" />
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'light', label: 'Világos', icon: <Sun className="w-6 h-6 text-amber-500" />, desc: '☀️' },
                  { key: 'dark', label: 'Sötét', icon: <Moon className="w-6 h-6 text-indigo-400" />, desc: '🌙' },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTheme(t.key)}
                    className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                      theme === t.key
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md shadow-indigo-500/10'
                        : 'border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/40 bg-white/40 dark:bg-white/[0.02]'
                    }`}
                  >
                    <span className="text-2xl">{t.desc}</span>
                    {t.icon}
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === t.key ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </Glass>

            {/* Notifications */}
            <Glass className="rounded-2xl p-6">
              <SectionHeader icon={<Bell className="w-4 h-4 text-indigo-500" />} title="Értesítések" />
              <form action={updatePreferences} className="space-y-3">
                <input type="hidden" name="theme" value={theme || 'light'} />
                {[
                  { name: 'notify_email', label: 'Email értesítések', desc: 'Szerviz és emlékeztető emailek', icon: <Bell className="w-4 h-4 text-indigo-500" />, checked: settings?.notify_email ?? true },
                  { name: 'notify_push', label: 'Push üzenetek', desc: 'Böngésző értesítések', icon: <Smartphone className="w-4 h-4 text-indigo-500" />, checked: settings?.notify_push ?? false },
                ].map((item) => (
                  <label key={item.name}
                    className="flex items-center justify-between p-4 rounded-xl cursor-pointer
                      bg-white/40 dark:bg-white/[0.03]
                      border border-slate-100/60 dark:border-white/[0.06]
                      hover:bg-white/70 dark:hover:bg-white/[0.06]
                      transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                    <Toggle name={item.name} checked={item.checked} onChange={() => { /* auto-submit via form */ }} />
                  </label>
                ))}
              </form>
            </Glass>
          </motion.div>
        )}

        {/* ─── 3. ELŐFIZETÉS ─── */}
        {activeTab === 'billing' && (
          <motion.div key="billing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Current plan */}
            <Glass className={`rounded-2xl p-6 border-2 ${planBg}`}>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-white/60 dark:bg-white/10 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full border border-white/60 dark:border-white/10 mb-3">
                    Aktuális tagság
                  </div>
                  <h2 className={`text-2xl font-bold tracking-tight ${planColor}`}>{planLabel}</h2>
                  {subscription?.current_period_end && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">
                      Megújulás: {new Date(subscription.current_period_end).toLocaleDateString('hu-HU')}
                    </p>
                  )}
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border ${planBg}`}>
                  {planIcon}
                </div>
              </div>

              <button
                onClick={manageSubscription}
                disabled={loadingPortal}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50
                  bg-slate-900 dark:bg-white text-white dark:text-slate-900
                  hover:bg-slate-800 dark:hover:bg-slate-100
                  shadow-sm"
              >
                {loadingPortal ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Számlázási adatok kezelése
              </button>
              <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-3">
                Stripe biztonságos felületére irányítunk
              </p>
            </Glass>

            {/* Upgrade CTA (only on free) */}
            {!dbPlan && (
              <Glass className="rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-indigo-500 fill-current" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Váltás Pro-ra</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Több autó, AI Szerelő, VIN kereső</p>
                    </div>
                  </div>
                  <Link
                    href="/pricing"
                    className="block w-full text-center py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.01]
                      bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-500 dark:hover:bg-indigo-400 shadow-md shadow-indigo-500/20"
                  >
                    Csomagok megtekintése
                  </Link>
                </div>
              </Glass>
            )}

            {/* Features list */}
            <Glass className="rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100/60 dark:border-white/[0.06]">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Funkciók</h3>
              </div>
              <div className="divide-y divide-slate-100/60 dark:divide-white/[0.04]">
                {[
                  { feature: 'Garázs', value: dbPlan === 'pro' || dbPlan === 'lifetime' ? 'Korlátlan' : '1 autó', ok: true },
                  { feature: 'AI Szerelő', value: dbPlan === 'pro' || dbPlan === 'lifetime' ? 'Aktív' : 'Nem elérhető', ok: !!dbPlan },
                  { feature: 'VIN Lekérdezés', value: dbPlan === 'pro' || dbPlan === 'lifetime' ? 'Aktív' : 'Nem elérhető', ok: !!dbPlan },
                  { feature: 'Úttervező', value: dbPlan === 'lifetime' ? 'Aktív' : 'Nem elérhető', ok: dbPlan === 'lifetime' },
                ].map((row) => (
                  <div key={row.feature} className="px-5 py-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{row.feature}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      row.ok
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                        : 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-white/10'
                    }`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </Glass>
          </motion.div>
        )}
      </main>

      {/* ── DELETE MODAL ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 16 }}
              className="relative w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl
                bg-white dark:bg-[#111] border border-red-100 dark:border-red-900/30"
            >
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-200 dark:border-red-900/50">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Végleges törlés?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Minden adatod – autók, szervizmúlt, előzmények – véglegesen törlődnek.</p>

              <div className="space-y-2">
                <form action={deleteAccountAction}>
                  <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.02]">
                    Igen, törlöm a fiókomat
                  </button>
                </form>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all
                    bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300
                    hover:bg-slate-200 dark:hover:bg-white/15"
                >
                  Mégsem
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}