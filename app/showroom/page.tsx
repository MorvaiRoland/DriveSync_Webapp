// app/showroom/page.tsx
import { createClient } from '@/supabase/server'
import { getActiveBattleEntries } from '@/app/actions/showroom'
import VotingCard from '@/components/showroom/VotingCard'
import BattleEntry from '@/components/showroom/BattleEntry'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Ez egy Server Component (async)
export default async function ShowroomPage() {
  const supabase = await createClient()

  // 1. User ellenőrzése (hogy le tudjuk kérni az autóit)
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Aktív verseny lekérése
  const { data: activeBattle } = await supabase
    .from('battles')
    .select('*')
    .eq('status', 'active')
    .single()

  if (!activeBattle) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
                <span className="text-4xl">🏁</span>
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Jelenleg nincs aktív verseny</h2>
            <p className="text-slate-500 mb-8 max-w-md">Az adminisztrátorok éppen a következő nagy megmérettetést készítik elő. Nézz vissza később!</p>
            <Link href="/" className="px-6 py-3 bg-slate-100 text-slate-900 rounded-xl font-bold hover:bg-white transition-colors">
                Vissza a kezdőlapra
            </Link>
        </div>
    )
  }

  // 3. Verseny adatok lekérése (Nevezések)
  const entries = await getActiveBattleEntries(activeBattle.id)

  // 4. Saját autók és státusz lekérése (Csak ha be van lépve)
  let myCars: any[] = []
  let hasEntered = false

  if (user) {
      // Saját autók
      const { data: cars } = await supabase.from('cars').select('id, make, model').eq('user_id', user.id)
      if (cars) myCars = cars

      // Ellenőrizzük, nevezett-e már ezzel a user ID-val erre a versenyre
      const { data: entry } = await supabase
        .from('battle_entries')
        .select('id')
        .eq('battle_id', activeBattle.id)
        .eq('user_id', user.id)
        .single() // Ha van találat, akkor már nevezett
      
      if (entry) hasEntered = true
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 dark:bg-slate-950 transition-colors">
      
      {/* FEJLÉC */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4 mb-4">
                <Link href="/" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </Link>
                <span className="text-xs font-bold bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 px-2 py-1 rounded uppercase tracking-wider">
                    Showroom Battle
                </span>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">
                        {activeBattle.title} <span className="text-orange-500">🔥</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
                        {activeBattle.description}
                    </p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Lezárás</p>
                    <p className="text-lg font-mono font-bold text-slate-800 dark:text-slate-200">
                        {new Date(activeBattle.end_date).toLocaleDateString('hu-HU')}
                    </p>
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        
        {/* NEVEZÉSI SZEKCIÓ (Csak ha van user) */}
        {user && (
            <BattleEntry 
                battleId={activeBattle.id} 
                myCars={myCars} 
                hasEntered={hasEntered} 
            />
        )}

        {/* VERSENYZŐK LISTÁJA */}
        {entries.length === 0 ? (
            <div className="text-center py-20">
                <div className="inline-block p-6 rounded-full bg-slate-100 dark:bg-slate-900 mb-4">
                    <span className="text-4xl grayscale opacity-50">🏎️</span>
                </div>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Még üres a pálya!</h3>
                <p className="text-slate-500 dark:text-slate-500">Légy te az első, aki benevezi a verdáját.</p>
            </div>
        ) : (
            <>
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nevezések</h2>
                    <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">
                        {entries.length}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {entries.map((entry: any) => (
                        <VotingCard
                            key={entry.entryId}
                            entryId={entry.entryId}
                            carName={entry.carName}
                            imageUrl={entry.imageUrl}
                            initialVotes={entry.voteCount}
                        />
                    ))}
                </div>
            </>
        )}
      </div>
    </div>
  )
}