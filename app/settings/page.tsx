import { createClient } from '@/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import SettingsDashboard from '@/components/SettingsDashboard'
import { signOutAction } from './actions'

export default async function SettingsPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // Előfizetés lekérdezése
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_type, status, stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  const meta = user.user_metadata || {}
  const settings = meta.settings || { notify_email: true, notify_push: false, theme: 'system' }
  const message = searchParams.success || searchParams.error
  const isError = !!searchParams.error

  const currentPlan = subscription?.plan_type || 'free';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 pb-20">
        
        {/* HEADER */}
        <div className="relative bg-slate-900 pb-32 pt-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-600 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between mb-8">
                      <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                         Vissza a garázsba
                     </Link>
                    <form action={signOutAction}>
                        <button className="text-white/70 hover:text-white text-sm font-bold transition-colors">
                            Kijelentkezés
                        </button>
                    </form>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Fiókbeállítások</h1>
                <p className="text-slate-400 max-w-xl">Kezeld a profilodat, az előfizetést és a biztonsági beállításokat egy helyen.</p>
            </div>
        </div>

        {/* TARTALOM */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 -mt-20">
            {message && (
                <div className={`mb-6 p-4 rounded-xl shadow-lg border flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-500 backdrop-blur-md ${isError ? 'bg-red-500/90 border-red-600 text-white' : 'bg-emerald-500/90 border-emerald-600 text-white'}`}>
                    <span className="text-xl bg-white/20 rounded-full w-8 h-8 flex items-center justify-center">{isError ? '!' : '✓'}</span>
                    <span className="font-bold">{message}</span>
                </div>
            )}

            <SettingsDashboard 
                user={user} 
                meta={meta} 
                settings={settings} 
                subscription={subscription} 
            />

            {/* JOGI LINKEK A LÁBLÉCBEN */}
            <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col items-center gap-4">
                <div className="flex gap-6 text-xs text-slate-500 font-medium">
                    <Link href="/impressum" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Impresszum</Link>
                    <Link href="/terms" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">ÁSZF</Link>
                    <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Adatvédelem</Link>
                </div>
                <div className="text-slate-400 text-[10px] font-mono">
                    DynamicSense ID: {user.id.split('-')[0]}... • Plan: {currentPlan.toUpperCase()}
                </div>
            </div>
        </div>
    </div>
  )
}