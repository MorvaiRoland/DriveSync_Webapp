import { createClient } from '@/supabase/server'
import { getActiveBattleEntries } from '@/app/actions/showroom'
import Link from 'next/link'
import { Trophy } from 'lucide-react'
import ShowroomView from '@/components/showroom/ShowroomView'

export default async function ShowroomPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Aktív verseny lekérése
  const { data: activeBattle } = await supabase
    .from('battles')
    .select('*')
    .eq('status', 'active')
    .single()

  if (!activeBattle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
        <div className="glass p-12 rounded-[3rem] border-neon-glow max-w-md shadow-2xl">
          <Trophy size={48} className="mx-auto mb-6 text-muted-foreground opacity-20" />
          <h2 className="text-3xl font-black text-foreground mb-4 uppercase italic tracking-tighter">Nincs aktív futam</h2>
          <Link href="/" className="bg-ocean-electric px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest inline-block transition-all hover:scale-105">
            Vissza a Dashboardra
          </Link>
        </div>
      </div>
    )
  }

  // 2. Adatok lekérése a kliens számára
  const entries = await getActiveBattleEntries(activeBattle.id)
  let myCars: any[] = []
  let myEntryData = null

  if (user) {
    const { data: cars } = await supabase.from('cars').select('id, make, model').eq('user_id', user.id)
    if (cars) myCars = cars

    const { data: entryData } = await supabase
      .from('battle_entries')
      .select(`id, car_id, battle_votes(count), cars(make, model, image_url)`)
      .eq('battle_id', activeBattle.id)
      .eq('user_id', user.id)
      .maybeSingle()
      
    if (entryData) {
      const car = entryData.cars as any
      const votes = entryData.battle_votes as any
      myEntryData = {
        voteCount: (Array.isArray(votes) ? votes[0]?.count : votes?.count) || 0,
        carName: `${car.make} ${car.model}`,
        imageUrl: car.image_url
      }
    }
  }

  // 3. Minden adatot átadunk a Kliens nézetnek
  return (
    <ShowroomView 
      user={user}
      activeBattle={activeBattle}
      entries={entries}
      myCars={myCars}
      myEntryData={myEntryData}
    />
  )
}