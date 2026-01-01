import { createClient } from '@/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import SettingsDashboard from '@/components/SettingsDashboard'
import { 
  ShieldCheck, 
  ArrowLeft, 
  Settings2, 
  Fingerprint, 
  UserCircle,
  Zap,
  ShieldAlert as AlertIcon
} from 'lucide-react'

// Next.js 15+ típusdefiníció
type PageProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export const metadata = {
  title: 'Beállítások | DynamicSense',
  description: 'Fiók és adatkezelés 2025'
}

export default async function SettingsPage({ searchParams }: PageProps) {
  // 1. Adatok await-elése a szerveren (Next.js 15 követelmény)
  const sParams = await searchParams
  const supabase = await createClient()

  // 2. Auth ellenőrzés - Szerver oldali védelem
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 3. Előfizetés és beállítások lekérése
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_type, status, current_period_end')
    .eq('user_id', user.id)
    .single()

  // 4. Early Access Config lekérése (ÚJ!)
  const { data: configData } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'early_access')
    .single();
  
  const earlyAccessConfig = configData?.value || { enabled: false };

  // 5. Metadata és üzenetek kezelése
  const meta = user.user_metadata || {}
  const settings = meta.settings || { notify_email: true, notify_push: false, theme: 'system' }
  const message = sParams.success || sParams.error
  const isError = !!sParams.error

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] overflow-x-hidden selection:bg-primary/30 font-sans">
      
      {/* --- PRÉMIUM ANIMÁLT HÁTTÉR --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] right-[-10%] w-[70vw] h-[70vw] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] left-[-5%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        
        {/* --- NAVIGÁCIÓS SÁV --- */}
        <nav className="flex items-center justify-between mb-12">
          <Link 
            href="/" 
            className="group flex items-center gap-3 px-4 py-2 rounded-2xl glass border-neon-glow hover:bg-primary/10 transition-all shadow-xl shadow-primary/5"
          >
            <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest leading-none text-foreground">Vissza a Garázsba</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden xs:flex flex-col items-end">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter text-foreground">Adatbiztonság</span>
              <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                <ShieldCheck size={12} /> Protokoll Aktív
              </span>
            </div>
            <div className="h-10 w-10 rounded-2xl glass flex items-center justify-center border-neon-glow shadow-lg shadow-primary/5">
              <Fingerprint className="text-primary w-5 h-5" />
            </div>
          </div>
        </nav>

        {/* --- CÍMSOR ÉS RENDSZERÜZENET --- */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
              <Settings2 size={12} /> Rendszerkonfiguráció
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gradient-ocean uppercase italic leading-none">
              Beállítások <span className="text-primary">.</span>
            </h1>
            <p className="text-muted-foreground font-medium text-sm md:text-base max-w-xl leading-relaxed text-foreground">
              Profilkezelés, értesítési beállítások és előfizetési adatok központosított vezérlése a DynamicSense ökoszisztémában.
            </p>
          </div>

          {/* Dinamikus Értesítő Panel */}
          {message && (
            <div className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-4 max-w-sm ${
              isError ? 'bg-destructive/10 border-destructive text-destructive' : 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
            }`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-current/10 shrink-0">
                {isError ? <AlertIcon size={20} /> : <Zap size={20} className="fill-current" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Rendszerüzenet</p>
                <p className="text-xs font-bold leading-tight truncate">{message}</p>
              </div>
            </div>
          )}
        </header>

        {/* --- BEÁLLÍTÁSOK DASHBOARD KONTÉNER --- */}
        <div className="relative">
          <div className="absolute -left-20 top-40 opacity-[0.02] dark:opacity-[0.05] pointer-events-none rotate-90">
             <UserCircle size={400} />
          </div>

          <SettingsDashboard 
            user={user} 
            meta={meta} 
            settings={settings} 
            subscription={subscription}
            earlyAccessConfig={earlyAccessConfig} // ÁTADJUK AZ ÚJ PROPOT
          />
        </div>

        {/* --- LÁBLÉC --- */}
        <footer className="mt-24 border-t border-border/50 pt-12 flex flex-col items-center gap-8 text-center">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
            {[
              { label: 'Felhasználási Feltételek', href: '/terms' },
              { label: 'Adatvédelem', href: '/privacy' },
              { label: 'Ügyfélszolgálat', href: '/support' }
            ].map((link) => (
              <Link 
                key={link.label}
                href={link.href}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 opacity-30 grayscale transition-all hover:grayscale-0">
               <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Powered by DynamicSense</span>
               <div className="h-4 w-12 bg-foreground rounded-sm" />
            </div>
            <p className="text-[9px] font-mono text-slate-500 opacity-50 uppercase tracking-tighter tabular-nums">
              Rendszerverzió: v2.6 Béta • Titkosított munkamenet • 2026 © Minden jog fenntartva.
            </p>
          </div>
        </footer>
      </div>

      {/* --- MOBIL NOTCH SAFE ZONE FILLER --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[env(safe-area-inset-bottom)] bg-background/80 backdrop-blur-md z-[100] border-t border-border/20" />
    </div>
  )
}