// app/showroom/page.tsx
import { createClient } from '@/supabase/server'
import { getActiveBattleEntries } from '@/app/actions/showroom'
import VotingCard from '@/components/showroom/VotingCard'

// Ez egy Server Component (async)
export default async function ShowroomPage() {
  // 1. JAVÍTÁS: Itt is ki kell tenni az 'await'-et!
  const supabase = await createClient()

  // 2. Lekérjük az első aktív versenyt
  const { data: activeBattle } = await supabase
    .from('battles')
    .select('*')
    .eq('status', 'active')
    .single()

  if (!activeBattle) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-700">Jelenleg nincs aktív verseny 🏁</h2>
            <p className="text-gray-500 mt-2">Nézz vissza később, vagy nevezd be az autódat a következőre!</p>
        </div>
    )
  }

  // 3. Lekérjük a versenyre nevezett autókat
  const entries = await getActiveBattleEntries(activeBattle.id)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Fejléc - Kicsit szépítettem rajta */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
                        Showroom Battle <span className="text-2xl">🔥</span>
                    </h1>
                    <p className="text-gray-600 mt-1">
                        A hét témája: <span className="font-bold text-blue-600">{activeBattle.title}</span>
                    </p>
                </div>
                
                {/* Ha van leírás, tooltipként vagy kis szövegként megjelenhet */}
                {activeBattle.description && (
                    <div className="bg-blue-50 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                        {activeBattle.description}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Kártyák listája */}
      <div className="container mx-auto px-4 mt-8">
        {entries.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
                Még senki nem nevezett be erre a versenyre. Légy te az első!
            </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}