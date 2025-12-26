'use client'

import { useState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { updateProfile, updatePreferences, deleteAccountAction } from '@/app/settings/actions'
import Image from 'next/image'
import {
  User,
  Bell,
  CreditCard,
  Loader2,
  LogOut,
  Moon,
  Sun,
  CheckCircle,
  Upload,
  Camera,
  AlertTriangle,
  Trash2,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { createClient } from '@/supabase/client'
import { useRouter } from 'next/navigation'

// --- TÍPUSOK ---
interface SettingsDashboardProps {
  user: any
  meta: any
  settings: any
  subscription: any
}

// --- SEGÉDKOMPONENSEK ---

function SubmitButton({ label = 'Mentés', id = 'submit_btn' }: { label?: string, id?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      id={id}
      disabled={pending}
      className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-colors hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? 'Mentés...' : label}
    </button>
  )
}

function DeleteButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
      {pending ? 'Törlés folyamatban...' : 'Igen, törlöm a fiókot'}
    </button>
  )
}

// --- FŐ KOMPONENS ---

export default function SettingsDashboard({
  user,
  meta,
  settings,
  subscription,
}: SettingsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'billing'>('profile')
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => setMounted(true), [])

  const manageSubscription = async () => {
    setLoadingPortal(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Hiba történt.')
    } catch (error) {
      alert('Hálózati hiba.')
    } finally {
      setLoadingPortal(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleFileChangeAndSubmit = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { bubbles: true }))
    }
  }

  const handleDeleteAvatar = () => {
    if (formRef.current) {
      const formData = new FormData(formRef.current)
      formData.set('delete_avatar', 'true')
      updateProfile(formData)
    }
  }

  if (!mounted) return null

  return (
    // JAVÍTÁS: Szélesség korlátozás (max-w-6xl) és overflow kezelés mobilon
    // Mobilon (alapértelmezett) flex-col, és NINCS overflow-hidden, hogy a lap természetesen görgessen.
    // Asztali nézetben (md:) flex-row és overflow-hidden a belső scrollhoz.
    <div className="mx-auto flex w-full max-w-6xl flex-col rounded-3xl border border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 md:min-h-[600px] md:flex-row md:overflow-hidden">
      
      {/* --- BAL OLDALI MENÜ --- */}
      <div className="flex w-full flex-col justify-between border-b border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-800/50 md:w-72 md:border-b-0 md:border-r">
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-amber-500 shadow-sm dark:bg-slate-700'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            <User className="h-4 w-4" /> Profil
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all ${
              activeTab === 'preferences'
                ? 'bg-white text-amber-500 shadow-sm dark:bg-slate-700'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            <Bell className="h-4 w-4" /> Beállítások
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all ${
              activeTab === 'billing'
                ? 'bg-white text-amber-500 shadow-sm dark:bg-slate-700'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            <CreditCard className="h-4 w-4" /> Előfizetés
          </button>
          
          <button
            onClick={() => window.open('/support', '_blank')}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-blue-500 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/10"
          >
            <CheckCircle className="h-4 w-4" /> Hibabejelentés / Support
          </button>
        </div>

        <button
          onClick={handleSignOut}
          className="mt-8 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
        >
          <LogOut className="h-4 w-4" /> Kijelentkezés
        </button>
      </div>

      {/* --- JOBB OLDALI TARTALOM --- */}
      {/* JAVÍTÁS: md:overflow-y-auto csak asztali nézetben. Mobilon hagyjuk a teljes oldalt görgetni. */}
      {/* pb-24: Extra hely az alján mobilon, hogy ne lógjon bele a Home bar-ba */}
      <div className="relative flex-1 p-6 pb-24 md:overflow-y-auto md:p-12 md:pb-12">
        
        {/* 1. PROFIL SZERKESZTÉS */}
        {activeTab === 'profile' && (
          <div className="max-w-lg animate-in slide-in-from-right-4 fade-in duration-500 space-y-8">
            <div>
              <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
                Személyes Adataim
              </h2>
              <p className="text-sm text-slate-500">
                Itt módosíthatod a profilképedet és a nevedet.
              </p>
            </div>

            <form action={updateProfile} ref={formRef} className="space-y-6">
              <input
                type="hidden"
                name="current_avatar_url"
                value={user.user_metadata?.avatar_url || ''}
              />
              <input
                type="hidden"
                name="delete_avatar"
                value="false"
                id="delete_avatar_flag"
              />
              <input
                type="file"
                name="avatar_file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChangeAndSubmit}
              />

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                {/* Avatar */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-lg dark:border-slate-800"
                >
                  {user.user_metadata?.avatar_url ? (
                    <Image
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400 dark:bg-slate-700">
                      <User className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Avatar Gombok */}
                <div className="flex-1 space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-500">
                    Profilkép
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <Upload className="h-4 w-4" /> Kép kiválasztása
                    </button>
                    {user.user_metadata?.avatar_url && (
                      <button
                        type="button"
                        onClick={handleDeleteAvatar}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-red-500 shadow-sm transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
                      >
                        Törlés
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-[10px] text-slate-400">
                    Max 10MB. A kiválasztás után automatikusan mentődik.
                  </p>
                </div>
              </div>

              {/* Inputok */}
              <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                    Teljes Név
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    defaultValue={user.user_metadata?.full_name}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                    Email Cím
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <SubmitButton label="Adatok Mentése" id="profile_submit_btn" />
              </div>
            </form>

            {/* --- VESZÉLYZÓNA (TÖRLÉS) --- */}
            <div className="mt-10 border-t border-slate-200 pt-10 dark:border-slate-800">
              <div className="rounded-2xl border border-red-100 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-900/10">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" /> Veszélyzóna
                </h3>
                <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
                  Ha törlöd a fiókodat, az összes személyes adatod (név, email,
                  beállítások) véglegesen törlődik.
                  <br />
                  <br />
                  <strong className="text-slate-900 dark:text-slate-200">
                    Fontos:
                  </strong>{' '}
                  A garázsban lévő autóid{' '}
                  <span className="underline decoration-slate-400">
                    nem törlődnek
                  </span>
                  , de többé nem fogod tudni elérni őket ezzel a fiókkal.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Fiók Törlése
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. BEÁLLÍTÁSOK */}
        {activeTab === 'preferences' && (
          <div className="max-w-lg animate-in slide-in-from-right-4 fade-in duration-500 space-y-8">
            <div>
              <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
                Testreszabás
              </h2>
              <p className="text-sm text-slate-500">
                Hogyan jelenjen meg az alkalmazás.
              </p>
            </div>

            <form action={updatePreferences} className="space-y-8">
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase text-slate-500">
                  Téma
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {['light', 'dark'].map((t) => (
                    <label key={t} className="group relative cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        value={t}
                        checked={theme === t}
                        onChange={() => setTheme(t)}
                        className="peer sr-only"
                      />
                      <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-100 p-4 transition-all hover:border-amber-500 peer-checked:border-amber-500 peer-checked:bg-amber-50 dark:border-slate-700 dark:peer-checked:bg-amber-900/10">
                        {t === 'light' ? (
                          <Sun className="h-6 w-6 text-amber-500" />
                        ) : (
                          <Moon className="h-6 w-6 text-indigo-400" />
                        )}
                        <span className="text-sm font-bold capitalize text-slate-700 dark:text-slate-300">
                          {t === 'light' ? 'Világos' : 'Sötét'}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase text-slate-500">
                  Értesítések
                </label>
                {['notify_email', 'notify_push'].map((key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <label
                      htmlFor={key}
                      className="cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-200"
                    >
                      {key === 'notify_email'
                        ? 'Email értesítések'
                        : 'Push értesítések'}
                    </label>
                    <div className="relative inline-block w-12 select-none align-middle">
                      <input
                        type="checkbox"
                        name={key}
                        id={key}
                        defaultChecked={settings?.[key]}
                        className="peer absolute right-6 block h-6 w-6 appearance-none rounded-full border-4 bg-white transition-all duration-300 checked:right-0 checked:border-amber-500 cursor-pointer"
                      />
                      <label
                        htmlFor={key}
                        className="block h-6 cursor-pointer overflow-hidden rounded-full bg-slate-300 transition-colors peer-checked:bg-amber-500 dark:bg-slate-600"
                      ></label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <SubmitButton label="Beállítások Mentése" />
              </div>
            </form>
          </div>
        )}

        {/* 3. SZÁMLÁZÁS */}
        {activeTab === 'billing' && (
          <div className="max-w-lg animate-in slide-in-from-right-4 fade-in duration-500 space-y-8">
            <div>
              <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
                Előfizetés
              </h2>
              <p className="text-sm text-slate-500">
                A csomagod állapota és számlázás.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="mb-1 text-xs font-bold uppercase text-slate-400">
                    Jelenlegi Csomag
                  </p>
                  <h3 className="flex items-center gap-2 text-xl font-black text-slate-900 dark:text-white">
                    {subscription?.plan_type === 'founder' ||
                    subscription?.plan_type === 'lifetime'
                      ? 'Lifetime 🚀'
                      : subscription?.plan_type === 'pro' &&
                        subscription?.early_access
                      ? 'Early Access Pro ⚡'
                      : subscription?.plan_type === 'pro'
                      ? 'Pro ⚡'
                      : 'Starter'}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                        subscription?.status === 'active'
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {subscription?.status || 'Active'}
                    </span>
                  </h3>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-700">
                  <CreditCard className="h-6 w-6 text-amber-500" />
                </div>
              </div>

              {subscription?.plan_type === 'pro' ||
              subscription?.plan_type === 'lifetime' ||
              subscription?.plan_type === 'founder' ? (
                <div className="space-y-3">
                  <div className="flex gap-2 text-xs text-slate-500">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Minden funkció elérhető</span>
                  </div>
                  <div className="my-4 border-t border-slate-200 dark:border-slate-700"></div>
                  <button
                    onClick={manageSubscription}
                    disabled={loadingPortal}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-slate-900"
                  >
                    {loadingPortal && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {subscription?.plan_type === 'pro'
                      ? 'Előfizetés Kezelése / Lemondás'
                      : 'Számlák Megtekintése'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">
                    Jelenleg az ingyenes csomagot használod. Válts nagyobbra a
                    több funkcióért!
                  </p>
                  <button
                    onClick={() => router.push('/pricing')}
                    className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-amber-400"
                  >
                    Csomagok Megtekintése
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- MODAL POPUP (FIÓK TÖRLÉS MEGERŐSÍTÉS) --- */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex animate-in fade-in items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
            <div className="w-full max-w-md animate-in zoom-in-95 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl duration-200 dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-center text-xl font-black text-slate-900 dark:text-white">
                Biztosan törlöd a fiókot?
              </h3>
              <p className="mb-6 text-center text-sm text-slate-500">
                Ez a művelet nem vonható vissza. A fiókod megszűnik, de az autók
                adatai megmaradnak az adatbázisban (leválasztva a profilról).
              </p>

              <form action={deleteAccountAction}>
                <div className="space-y-3">
                  <DeleteButton />
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="w-full rounded-xl bg-slate-100 py-3 font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Mégsem
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}