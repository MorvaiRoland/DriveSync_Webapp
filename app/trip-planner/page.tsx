import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TripPlannerClient from './TripPlannerClient'
import { Warehouse } from 'lucide-react'

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Egyszerű fejléc visszalépéshez */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 h-16 flex items-center justify-between sticky top-0 z-50">
         <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
               <Warehouse className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </Link>
            <h1 className="font-bold text-lg text-slate-900 dark:text-white">Pro Úttervező</h1>
         </div>
         <div className="text-xs font-medium text-slate-500 hidden sm:block">
            Tervezz okosan, spórolj többet.
         </div>
      </nav>

      {/* A Kliens oldali logika (Térkép, State-ek) */}
      <div className="flex-1 overflow-hidden">
         <TripPlannerClient cars={cars || []} />
      </div>
    </div>
  )
}