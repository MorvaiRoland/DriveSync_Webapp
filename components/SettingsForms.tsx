'use client'

import { useState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { updateProfile, updatePreferences } from '@/app/settings/actions'
import Image from 'next/image'
import { User, Bell, Shield, CreditCard, Loader2, LogOut, Moon, Sun, CheckCircle } from 'lucide-react'
import { useTheme } from 'next-themes'
import { createClient } from '@/supabase/client'
import { useRouter } from 'next/navigation'

// --- SEGÉDKOMPONENSEK ---

function SubmitButton({ label = 'Mentés' }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 px-6 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm shadow-lg shadow-slate-900/10">
      {pending && <Loader2 className="w-4 h-4 animate-spin" />}
      {pending ? 'Mentés...' : label}
    </button>
  )
}

// --- FŐ KOMPONENS ---

export default function SettingsDashboard({ user, meta, settings, subscription }: any) {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'billing'>('profile')
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => setMounted(true), [])

  // --- Előfizetés kezelés (Portal) ---
  const manageSubscription = async () => {
    setLoadingPortal(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Hiba történt.')
    } catch (error) {
      alert('Hálózati hiba.')
    } finally {
      setLoadingPortal(false)
    }
  }

  // --- Kijelentkezés ---
  const handleSignOut = async () => {
      await supabase.auth.signOut()
      router.push('/login')
  }

  if (!mounted) return null

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* --- BAL OLDALI MENÜ --- */}
        <div className="w-full md:w-64 bg-slate-50/50 dark:bg-slate-800/50 border-r border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between">
            <div className="space-y-2">
                <button onClick={() => setActiveTab('profile')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'profile' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-500' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}>
                    <User className="w-4 h-4" /> Profil
                </button>
                <button onClick={() => setActiveTab('preferences')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'preferences' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-500' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}>
                    <Bell className="w-4 h-4" /> Beállítások
                </button>
                <button onClick={() => setActiveTab('billing')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'billing' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-500' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}>
                    <CreditCard className="w-4 h-4" /> Előfizetés
                </button>
            </div>

            <button onClick={handleSignOut} className="w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors mt-8">
                <LogOut className="w-4 h-4" /> Kijelentkezés
            </button>
        </div>

        {/* --- JOBB OLDALI TARTALOM --- */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto">
            
            {/* 1. PROFIL SZERKESZTÉS */}
            {activeTab === 'profile' && (
                <div className="max-w-lg space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Személyes Adataim</h2>
                        <p className="text-slate-500 text-sm">Itt módosíthatod a profilképedet és a nevedet.</p>
                    </div>

                    <form action={updateProfile} className="space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg bg-slate-100">
                                {meta.avatar_url ? (
                                    <Image src={meta.avatar_url} alt="Avatar" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-200 dark:bg-slate-700">
                                        <User className="w-10 h-10" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Profilkép URL</label>
                                <input type="url" name="avatar_url" defaultValue={meta.avatar_url} placeholder="https://..." className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Teljes Név</label>
                                <input type="text" name="full_name" defaultValue={meta.full_name} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Cím</label>
                                <input type="email" disabled value={user.email} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-400 text-sm font-medium cursor-not-allowed" />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <SubmitButton label="Profil Mentése" />
                        </div>
                    </form>
                </div>
            )}

            {/* 2. BEÁLLÍTÁSOK (Téma, Értesítés) */}
            {activeTab === 'preferences' && (
                <div className="max-w-lg space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Testreszabás</h2>
                        <p className="text-slate-500 text-sm">Hogyan jelenjen meg az alkalmazás.</p>
                    </div>

                    <form action={updatePreferences} className="space-y-8">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase">Téma</label>
                            <div className="grid grid-cols-2 gap-4">
                                {['light', 'dark'].map((t) => (
                                    <label key={t} className="relative cursor-pointer group">
                                        <input 
                                            type="radio" name="theme" value={t} 
                                            checked={theme === t} onChange={() => setTheme(t)}
                                            className="peer sr-only" 
                                        />
                                        <div className="p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-amber-500 peer-checked:border-amber-500 peer-checked:bg-amber-50 dark:peer-checked:bg-amber-900/10 transition-all text-center flex flex-col items-center gap-2">
                                            {t === 'light' ? <Sun className="w-6 h-6 text-amber-500" /> : <Moon className="w-6 h-6 text-indigo-400" />}
                                            <span className="font-bold text-sm text-slate-700 dark:text-slate-300 capitalize">{t === 'light' ? 'Világos' : 'Sötét'}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                             <label className="text-xs font-bold text-slate-500 uppercase">Értesítések</label>
                             {['notify_email', 'notify_push'].map((key) => (
                                <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <label htmlFor={key} className="text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                                        {key === 'notify_email' ? 'Email értesítések' : 'Push értesítések'}
                                    </label>
                                    <div className="relative inline-block w-12 align-middle select-none">
                                        <input 
                                            type="checkbox" name={key} id={key} 
                                            defaultChecked={settings?.[key]}
                                            className="peer absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-6 checked:border-amber-500 transition-all duration-300"
                                        />
                                        <label htmlFor={key} className="block overflow-hidden h-6 rounded-full bg-slate-300 dark:bg-slate-600 peer-checked:bg-amber-500 transition-colors cursor-pointer"></label>
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

            {/* 3. SZÁMLÁZÁS (ÚJ!) */}
            {activeTab === 'billing' && (
                <div className="max-w-lg space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Előfizetés</h2>
                        <p className="text-slate-500 text-sm">A csomagod állapota és számlázás.</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                         <div className="flex items-center justify-between mb-4">
                             <div>
                                 <p className="text-xs font-bold text-slate-400 uppercase mb-1">Jelenlegi Csomag</p>
                                 <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                     {subscription?.plan_type === 'founder' || subscription?.plan_type === 'lifetime' ? 'Lifetime 🚀' : 
                                      subscription?.plan_type === 'pro' ? 'Pro ⚡' : 'Starter'}
                                     <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${subscription?.status === 'active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-200 text-slate-600'}`}>
                                         {subscription?.status || 'Active'}
                                     </span>
                                 </h3>
                             </div>
                             {/* Ikon a sarokban */}
                             <div className="p-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                                 <CreditCard className="w-6 h-6 text-amber-500" />
                             </div>
                         </div>

                         {/* Ha van előfizetés (Pro vagy Lifetime), mutassuk a kezelés gombot */}
                         {(subscription?.plan_type === 'pro' || subscription?.plan_type === 'lifetime' || subscription?.plan_type === 'founder') ? (
                             <div className="space-y-3">
                                 <div className="flex gap-2 text-xs text-slate-500">
                                     <CheckCircle className="w-4 h-4 text-emerald-500" /> 
                                     <span>Minden funkció elérhető</span>
                                 </div>
                                 <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>
                                 <button 
                                    onClick={manageSubscription}
                                    disabled={loadingPortal}
                                    className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                 >
                                     {loadingPortal && <Loader2 className="w-4 h-4 animate-spin" />}
                                     {subscription?.plan_type === 'pro' ? 'Előfizetés Kezelése / Lemondás' : 'Számlák Megtekintése'}
                                 </button>
                             </div>
                         ) : (
                             <div className="space-y-4">
                                 <p className="text-sm text-slate-500">Jelenleg az ingyenes csomagot használod. Válts nagyobbra a több funkcióért!</p>
                                 <button 
                                    onClick={() => router.push('/pricing')}
                                    className="w-full py-2.5 bg-amber-500 text-slate-900 rounded-xl font-bold text-sm hover:bg-amber-400 transition-colors"
                                 >
                                     Csomagok Megtekintése
                                 </button>
                             </div>
                         )}
                    </div>
                </div>
            )}

        </div>
    </div>
  )
}