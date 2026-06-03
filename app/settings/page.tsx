import { createClient } from '@/supabase/server'
import { signOut } from '@/app/login/action'
import { redirect } from 'next/navigation'
import SettingsDashboard from '@/components/SettingsDashboard'
import { getSubscriptionStatus, PLAN_LIMITS } from '@/utils/subscription'
import { AuroraBackground, DashboardNav, BottomNav } from '@/components/SharedNavigation'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export const metadata = {
  title: 'Beállítások | DynamicSense',
  description: 'Fiók és adatkezelés'
}

export const runtime = 'edge';

export default async function SettingsPage({ searchParams }: PageProps) {
  const sParams = await searchParams
  const supabase = await createClient()

  // Auth protection
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // Get subscription status
  const subscriptionResult = await getSubscriptionStatus(supabase, user.id)
  const { plan, isTrial } = subscriptionResult
  const limits = PLAN_LIMITS[plan]
  const isPro = limits.aiMechanic

  // Get raw subscription data for invoice portal
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_type, status, current_period_end')
    .eq('user_id', user.id)
    .maybeSingle()

  // Get Early Access Config
  const { data: configData } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'early_access')
    .maybeSingle()
  
  const earlyAccessConfig = configData?.value || { enabled: false }

  const meta = user.user_metadata || {}
  const settings = meta.settings || { notify_email: true, notify_push: false, theme: 'system' }
  
  const message = sParams.success || sParams.error
  const isError = !!sParams.error

  const displayName = user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0]

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-700 relative overflow-x-hidden">
      <AuroraBackground />

      {/* Navigation */}
      <DashboardNav userName={displayName} plan={plan} isTrial={isTrial} isPro={isPro} signOutAction={signOut} />
      <BottomNav isPro={isPro} />

      {/* Main Container */}
      <main
        className="relative z-10 max-w-5xl mx-auto px-3 sm:px-4 pb-28 md:pb-10"
        style={{ paddingTop: 'calc(max(0.75rem, env(safe-area-inset-top)) + 5rem)' }}
      >
        
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> Rendszerkonfiguráció
            </p>
            <h1 className="text-2xl sm:text-3xl font-light text-slate-900 dark:text-white tracking-tight">
              Beállítások <span className="font-bold">& Fiók</span>
            </h1>
          </div>

          {/* System Notifications */}
          {message && (
            <div className={`p-3 rounded-2xl border backdrop-blur-xl shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 max-w-xs ${
              isError 
                ? 'bg-red-50/80 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400' 
                : 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400'
            }`}>
              <div className="flex-shrink-0">
                {isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Rendszer</p>
                <p className="text-xs font-medium leading-tight truncate">{message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Settings Dashboard Client Component */}
        <div className="relative">
          <SettingsDashboard 
            user={user} 
            meta={meta} 
            settings={settings} 
            subscription={subscription}
            earlyAccessConfig={earlyAccessConfig}
          />
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-200/60 dark:border-white/10 pt-8 flex flex-col items-center gap-6 text-center pb-8">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {[
              { label: 'Feltételek', href: '/terms' },
              { label: 'Adatvédelem', href: '/privacy' },
              { label: 'Támogatás', href: '/support' }
            ].map((link) => (
              <Link 
                key={link.label}
                href={link.href}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-[9px] font-mono text-slate-400 dark:text-slate-600 uppercase tracking-wider">
              DynamicSense • Biztonságos Kapcsolat • 2026 © Minden jog fenntartva.
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}