import { createClient } from '@/supabase/server'
import { getActiveBattleEntries } from '@/app/actions/showroom'
import SwipeGame from '@/components/showroom/SwipeGame'
import MyEntryStats from '@/components/showroom/MyEntryStats'
import BattleEntry from '@/components/showroom/BattleEntry'
import Link from 'next/link'
import { ArrowLeft, Layers, Sparkles, Trophy } from 'lucide-react'

export default async function ShowroomPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: activeBattle } = await supabase
    .from('battles')
    .select('*')
    .eq('status', 'active')
    .single()

  if (!activeBattle) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center pt-[env(safe-area-inset-top)]">
        <div className="glass p-12 rounded-[3rem] border-neon-glow max-w-md">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 opacity-20">
             <Trophy size={40} />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4 italic uppercase tracking-tighter">Nincs aktív futam</h2>
          <p className="text-muted-foreground mb-8 font-medium">Jelenleg nem zajlik Showroom Battle. Gyere vissza később!</p>
          <Link href="/" className="bg-ocean-electric px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 inline-block">
            Vissza a Dashboardra
          </Link>
        </div>
      </div>
    )
  }

  const entries = await getActiveBattleEntries(activeBattle.id)
  let myCars: any[] = []
  let hasEntered = false
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
      hasEntered = true
      const car = entryData.cars as any
      const votes = entryData.battle_votes as any
      myEntryData = {
        voteCount: (Array.isArray(votes) ? votes[0]?.count : votes?.count) || 0,
        carName: `${car.make} ${car.model}`,
        imageUrl: car.image_url
      }
    }
  }

  const playableEntries = entries.filter((e: any) => {
    if (user && hasEntered && myEntryData && e.carName === myEntryData.carName) return false;
    if (e.userHasVoted) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] overflow-x-hidden">
      
      {/* DINAMIKUS HÁTTÉR */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        
        {/* NAVIGÁCIÓ */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="space-y-2">
            <Link href="/" className="group flex items-center gap-3 text-muted-foreground hover:text-primary transition-all text-xs font-black uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Vissza a Garázsba
            </Link>
            <div className="flex items-center gap-3">
               <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-gradient-ocean uppercase italic leading-none">
                 {activeBattle.title}
               </h1>
               <div className="bg-primary/20 p-2 rounded-xl animate-pulse"><Sparkles className="text-primary w-5 h-5" /></div>
            </div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] ml-1">Közösségi Showroom • Live Battle</p>
          </div>
        </header>

        {/* BENTO LAYOUT */}
        <div className="space-y-8">
          {hasEntered && myEntryData && (
            <MyEntryStats myEntry={myEntryData} />
          )}

          {user && (
            <BattleEntry 
              battleId={activeBattle.id} 
              myCars={myCars} 
              hasEntered={hasEntered} 
            />
          )}

          <section className="space-y-8 pt-10">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="bg-accent/50 p-3 rounded-2xl border border-border/50 mb-2">
                <Layers className="text-primary w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-foreground">Voksolás</h2>
              <p className="text-muted-foreground text-sm font-medium">Húzd jobbra, ha bejön a setup! 🔥</p>
            </div>
            
            <div className="flex justify-center pb-20">
              {playableEntries.length > 0 ? (
                <SwipeGame entries={playableEntries} />
              ) : (
                <div className="glass rounded-[3rem] p-16 border-neon-glow text-center max-w-sm w-full">
                  <div className="text-4xl mb-4">🏁</div>
                  <p className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Mindenkire szavaztál!</p>
                </div>
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  )
}