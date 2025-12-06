import { createClient } from 'supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { updateProfile, updatePreferences, signOutAction } from './actions'

export default async function SettingsPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Adatok kinyerése a metaadatokból
  const meta = user.user_metadata || {}
  const settings = meta.settings || { notify_email: true, notify_push: false, theme: 'light' }
  const message = searchParams.success || searchParams.error
  const isError = searchParams.error ? true : false

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* HEADER */}
      <div className="bg-slate-900 pt-8 pb-20 px-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
            <Link href="/" className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">Fiókbeállítások</h1>
                <p className="text-slate-400 text-sm">Kezeld a profilod és az értesítéseket.</p>
            </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-10 space-y-6">

        {/* ÜZENET SÁV */}
        {message && (
            <div className={`p-4 rounded-xl shadow-sm border flex items-center gap-3 ${isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                {isError ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                )}
                <span className="font-medium text-sm">{message}</span>
            </div>
        )}

        {/* 1. KÁRTYA: PROFIL ADATOK */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Személyes Adatok
                </h2>
            </div>
            <form action={updateProfile} className="p-6 space-y-4">
                <div className="flex items-center gap-6 mb-4">
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-2xl font-bold text-slate-500 border-4 border-white shadow-sm">
                        {meta.full_name ? meta.full_name[0].toUpperCase() : user.email?.[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">{user.email}</p>
                        <p className="text-xs text-slate-500">Bejelentkezve Google fiókkal</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Teljes Név</label>
                        <input 
                            name="fullName" 
                            defaultValue={meta.full_name || ''} 
                            placeholder="Pl. Kovács János"
                            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 px-4 bg-slate-50 border text-slate-900"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Telefonszám (Opcionális)</label>
                        <input 
                            name="phone" 
                            defaultValue={meta.phone || ''} 
                            placeholder="+36 30 123 4567"
                            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 px-4 bg-slate-50 border text-slate-900"
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button type="submit" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md active:scale-95">
                        Mentés
                    </button>
                </div>
            </form>
        </div>

        {/* 2. KÁRTYA: ÉRTESÍTÉSEK ÉS PREFERENCIÁK */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    Értesítések & Megjelenés
                </h2>
            </div>
            <form action={updatePreferences} className="p-6 space-y-6">
                
                {/* Értesítés kapcsolók */}
                <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                                <span className="block font-bold text-slate-800 text-sm">Email Értesítések</span>
                                <span className="block text-xs text-slate-500">Havi összesítő és szerviz emlékeztetők</span>
                            </div>
                        </div>
                        <input type="checkbox" name="notify_email" defaultChecked={settings.notify_email} className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500 border-gray-300" />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                                <span className="block font-bold text-slate-800 text-sm">Push Értesítések</span>
                                <span className="block text-xs text-slate-500">Azonnali jelzés telefonra</span>
                            </div>
                        </div>
                        <input type="checkbox" name="notify_push" defaultChecked={settings.notify_push} className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500 border-gray-300" />
                    </label>
                </div>

                <div className="border-t border-slate-100 pt-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Téma (Hamarosan)</label>
                    <select name="theme" defaultValue={settings.theme} className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 px-4 bg-slate-50 border text-slate-900">
                        <option value="light">Világos (Alapértelmezett)</option>
                        <option value="dark">Sötét mód</option>
                        <option value="system">Rendszer beállítás</option>
                    </select>
                </div>

                <div className="pt-2 flex justify-end">
                    <button type="submit" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md active:scale-95">
                        Beállítások Mentése
                    </button>
                </div>
            </form>
        </div>

        {/* 3. KÁRTYA: FIÓK KEZELÉS (Kijelentkezés) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">Fiók műveletek</h3>
                <form action={signOutAction}>
                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Kijelentkezés
                    </button>
                </form>
             </div>
        </div>

        <div className="text-center text-xs text-slate-400 py-4">
            DriveSync v1.2.0 • Build 2025
        </div>

      </div>
    </div>
  )
}