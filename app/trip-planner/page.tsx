import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TripPlannerClient from './TripPlannerClient'
import { ChevronLeft } from 'lucide-react'
import { getSubscriptionStatus, PLAN_LIMITS } from '@/utils/subscription' // <--- FONTOS IMPORT

export const metadata = {
  title: 'Úttervező | DynamicSense',
  description: 'Költségkalkulátor és útvonaltervezés.'
}

export default async function TripPlannerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Auth ellenőrzés
  if (!user) return redirect('/login')

  // 2. JOGOSULTSÁG ELLENŐRZÉS (SERVER SIDE GATEKEEPING)
  // Ez védi ki, hogy URL beírással ne lehessen betölteni
  const { plan } = await getSubscriptionStatus(supabase, user.id)
  const limits = PLAN_LIMITS[plan]

  if (!limits.tripPlanner) {
     return redirect('/pricing')
  }

  // 3. Adatok lekérése (csak ha van joga)
  const { data: cars } = await supabase
    .from('cars')
    .select('id, make, model, plate, fuel_type')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-500 overflow-hidden">
      
      {/* Fejléc - Safe Area (Notch) kezeléssel */}
      <nav className="shrink-0 z-50 flex h-auto w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 shadow-sm">
         <div className="flex items-center gap-3">
            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
               <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
               <h1 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Úttervező</h1>
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tervezz okosan.</p>
            </div>
         </div>
         
         <div className="hidden rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 border border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800 sm:block">
            Pro Funkció
         </div>
      </nav>

      {/* A Kliens oldali logika (Térkép, State-ek) */}
      <div className="flex-1 relative w-full h-full">
         <TripPlannerClient cars={cars || []} />
      </div>
    </div>
  )
}