import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TripPlannerClient from './TripPlannerClient'
import { Warehouse, ChevronLeft } from 'lucide-react'

export default async function TripPlannerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  // Lekérjük a felhasználó autóit a kalkulátorhoz
  const { data: cars } = await supabase
    .from('cars')
    .select('id, make, model, plate, fuel_type')
    .eq('user_id', user.id)
    .eq('status', 'active') // Csak aktív autókat mutassunk

  return (
    // JAVÍTÁS: h-screen és flex-col a teljes kitöltéshez, overflow-hidden hogy ne legyen dupla scroll
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
      
      {/* Fejléc - JAVÍTÁS: pt-[env(safe-area-inset-top)] a Notch miatt */}
      <nav className="sticky top-0 z-50 flex h-auto w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
         <div className="flex items-center gap-3">
            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
               <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
               <h1 className="text-lg font-black text-slate-900 dark:text-white">Úttervező</h1>
               <p className="text-[10px] font-medium text-slate-500">Tervezz okosan.</p>
            </div>
         </div>
         <div className="hidden rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 sm:block">
            Pro Verzió
         </div>
      </nav>

      {/* A Kliens oldali logika (Térkép, State-ek) */}
      <div className="flex-1 overflow-hidden">
         <TripPlannerClient cars={cars || []} />
      </div>
    </div>
  )
}