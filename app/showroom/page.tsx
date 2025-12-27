import { createClient } from '@/supabase/server'
import { getActiveBattleEntries } from '@/app/actions/showroom'
import SwipeGame from '@/components/showroom/SwipeGame'
import MyEntryStats from '@/components/showroom/MyEntryStats'
import BattleEntry from '@/components/showroom/BattleEntry'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Layers, Sparkles, Trophy, Flame } from 'lucide-react'

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
      <div className="min-h-screen bg-background flex items-center justify-center p-6 pt-[env(safe-area-inset-top)]">
        <div className="glass p-12 rounded-[3rem] border-neon-glow max-w-md text-center shadow-2xl">
          <Trophy size={48} className="mx-auto mb-6 text-muted-foreground opacity-20" />
          <h2 className="text-3xl font-black text-foreground mb-4 uppercase italic tracking-tighter">Nincs aktív futam</h2>
          <p className="text-muted-foreground mb-8 font-medium italic">A Showroom aréna jelenleg üres. Gyere vissza később!</p>
          <Link href="/" className="bg-ocean-electric px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20">
            Vissza a vezérlőpulthoz
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] overflow-x-hidden selection:bg-primary/30 font-sans">
      
      {/* --- PRÉMIUM ANIMÁLT HÁTTÉR --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        
        {/* --- FEJLÉC --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-4 w-full">
            <Link href="/" className="group inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-all text-[10px] font-black uppercase tracking-[0.2em]">
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Dashboard
            </Link>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
                  <Flame size={12} className="fill-current" /> Live Showroom Battle
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gradient-ocean uppercase italic leading-none">
                  {activeBattle.title}
                </h1>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl">
                 <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                 <span className="text-[10px] font-black uppercase text-primary tracking-widest">{playableEntries.length} Autó a sorban</span>
              </div>
            </div>
          </div>
        </header>

        {/* --- GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* BAL OLDAL: STÁTUSZ ÉS NEVEZÉS (4 Oszlop) */}
          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              {hasEntered && myEntryData ? (
                <MyEntryStats key="stats" myEntry={myEntryData} />
              ) : user ? (
                <BattleEntry 
                  key="entry"
                  battleId={activeBattle.id} 
                  myCars={myCars} 
                  hasEntered={hasEntered} 
                />
              ) : null}
            </AnimatePresence>

            {/* Battle Info Card */}
            <div className="glass p-8 rounded-[2.5rem] border-neon-glow shadow-xl">
               <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                 <Sparkles size={14} /> Szabályzat
               </h3>
               <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                 {activeBattle.description || "Szavazz a kedvenc autóidra! A legtöbb voksot kapott építések a szezon végén egyedi digitális trófeát kapnak a profiljukra."}
               </p>
            </div>
          </div>

          {/* JOBB OLDAL: A JÁTÉK SZÍNPAD (7 Oszlop) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full relative min-h-[600px] flex flex-col items-center">
              <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="mb-8 text-center space-y-2">
                  <div className="inline-flex items-center gap-2 bg-accent/50 p-1.5 px-4 rounded-full border border-border/50 shadow-inner">
                    <Layers className="text-primary w-4 h-4" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Voksolási Aréna</h2>
                  </div>
                </div>
                
                {playableEntries.length > 0 ? (
                  <div className="w-full max-w-[400px]">
                    <SwipeGame entries={playableEntries} />
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass rounded-[3rem] p-12 border-neon-glow text-center w-full max-w-[400px] shadow-2xl mt-10"
                  >
                    <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary">
                      <Trophy size={40} />
                    </div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground mb-2">Vége a körnek!</h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Mindenkire szavaztál ebben a futamban.</p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}