// app/settings/page.tsx
import { createClient } from '@/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { signOutAction } from './actions'
import ProfileForm from '@/components/ProfileForm'         // <--- Kliens komponens
import { PreferencesForm } from '@/components/SettingsForms' // <--- Kliens komponens
import DeleteAccountSection from '@/components/DeleteAccountSection' // <--- Kliens komponens

export default async function SettingsPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const meta = user.user_metadata || {}
  
  // Alapértelmezett beállítások
  const settings = meta.settings || { 
      notify_email: true, 
      notify_push: false, 
      theme: 'light' 
  }
  
  const message = searchParams.success || searchParams.error
  const isError = !!searchParams.error

  return (
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

            {/* Értesítések (Success/Error) */}
            {message && (
                <div className={`p-4 rounded-xl shadow-sm border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                    <span className="text-xl">{isError ? '⚠️' : '✅'}</span>
                    <span className="font-medium text-sm">{message}</span>
                </div>
            )}

            {/* 1. Profil Űrlap (Kliens komponens) */}
            <ProfileForm userEmail={user.email || ''} meta={meta} />

            {/* 2. Preferenciák Űrlap (Kliens komponens) */}
            <PreferencesForm settings={settings} />

            {/* 3. Kijelentkezés Gomb */}
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

            {/* 4. Fiók Törlése (Kliens komponens) */}
            <DeleteAccountSection />

            <div className="text-center text-xs text-slate-400 py-4">DriveSync v1.8.0</div>
        </div>
    </div>
  )
}