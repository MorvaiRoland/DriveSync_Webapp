import { createClient } from 'supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { updateProfile, signOutAction } from './actions'
import { PreferencesForm } from '@/components/SettingsForms'

export default async function SettingsPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const meta = user.user_metadata || {}
  const settings = meta.settings || { notify_email: true, notify_push: false, theme: 'light' }
  const message = searchParams.success || searchParams.error
  const isError = searchParams.error ? true : false

  return (
    // Itt már nem kell "themeClass" változó, a body-ra kerül a class automatikusan
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
        
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

        <div className="max-w-3xl mx-auto px-4 -mt-10 space-y-6 pb-20">

            {message && (
                <div className={`p-4 rounded-xl shadow-sm border flex items-center gap-3 ${isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                    <span className="font-medium text-sm">{message}</span>
                </div>
            )}

            {/* Profil Adatok */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                    <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        👤 Személyes Adatok
                    </h2>
                </div>
                <form action={updateProfile} className="p-6 space-y-4">
                    <div className="flex items-center gap-6 mb-4">
                        <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-2xl font-bold text-slate-500 dark:text-slate-300 border-4 border-white dark:border-slate-600 shadow-sm">
                            {meta.full_name ? meta.full_name[0].toUpperCase() : user.email?.[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{user.email}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Bejelentkezve</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Teljes Név</label>
                            <input 
                                name="fullName" 
                                defaultValue={meta.full_name || ''} 
                                className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 px-4 bg-slate-50 dark:bg-slate-700 border text-slate-900 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Telefonszám</label>
                            <input 
                                name="phone" 
                                defaultValue={meta.phone || ''} 
                                className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 px-4 bg-slate-50 dark:bg-slate-700 border text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-md active:scale-95">Mentés</button>
                    </div>
                </form>
            </div>

            {/* PREFERENCIÁK FORM */}
            <PreferencesForm settings={settings} />

            {/* Kijelentkezés */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                 <div className="p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Fiók műveletek</h3>
                    <form action={signOutAction}>
                        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors">
                            Kijelentkezés
                        </button>
                    </form>
                 </div>
            </div>

            <div className="text-center text-xs text-slate-400 py-4">DriveSync v1.6.0</div>
        </div>
    </div>
  )
}