import { createClient } from '@/supabase/server'
import { getActiveBattleEntries } from '@/app/actions/showroom'
import SwipeGame from '@/components/showroom/SwipeGame'
import MyEntryStats from '@/components/showroom/MyEntryStats'
import BattleEntry from '@/components/showroom/BattleEntry'
import Link from 'next/link'
import { ArrowLeft, Layers } from 'lucide-react'

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
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
            <h2 className="text-3xl font-black text-white mb-2">Jelenleg nincs aktív verseny</h2>
             <Link href="/" className="px-6 py-3 bg-slate-100 text-slate-900 rounded-xl font-bold hover:bg-white transition-colors">
                Vissza a kezdőlapra
            </Link>
        </div>
    )
  }

  // 2. Összes nevezés lekérése (Ezt az action-t használjuk, mert az már szépen formázza az adatot)
  const entries = await getActiveBattleEntries(activeBattle.id)

  // 3. Saját adatok előkészítése
  let myCars: any[] = []
  let hasEntered = false
  let myEntryData = null

  if (user) {
      // Saját garázs lekérése (hogy tudjunk miből választani nevezésnél)
      const { data: cars } = await supabase.from('cars').select('id, make, model').eq('user_id', user.id)
      if (cars) myCars = cars

      // Külön lekérjük a saját nevezést, hogy biztosak legyünk a státuszban
      // Itt a TypeScript hibák elkerülése végett biztonságosan kezeljük a választ
      const { data: entryData } = await supabase
        .from('battle_entries')
        .select(`
            id, 
            car_id, 
            battle_votes(count),
            cars(make, model, image_url)
        `)
        .eq('battle_id', activeBattle.id)
        .eq('user_id', user.id)
        .maybeSingle() // maybeSingle jobb, mint a single, mert nem dob hibát ha nincs találat
      
      if (entryData) {
          hasEntered = true
          
          // Biztonságos adatkinyerés (TypeScript barát módon)
          // A Supabase válaszban a 'cars' lehet objektum vagy tömb, attól függően hogy egy vagy több találat lehetséges-e.
          // Mivel battle_entries.car_id -> cars.id kapcsolat 1:1, ez elvileg objektum.
          // De a biztonság kedvéért 'any'-re kényszerítjük vagy ellenőrizzük.
          const carData = entryData.cars as any; 
          const votesData = entryData.battle_votes as any;

          // Ellenőrizzük, hogy a carData létezik-e (ne szálljon el, ha törölték a kocsit)
          if (carData) {
              // Ha esetleg tömbként jönne vissza (ritka, de előfordulhat rossz definíciónál)
              const car = Array.isArray(carData) ? carData[0] : carData;
              const voteCount = Array.isArray(votesData) ? votesData[0]?.count : votesData?.count;

              myEntryData = {
                  voteCount: voteCount || 0,
                  carName: `${car.make} ${car.model}`,
                  imageUrl: car.image_url
              }
          }
      }
  }

  // Szűrés: A Tinder-játékban NE lássuk a saját autónkat, és ne lássuk azokat, amikre MÁR szavaztunk.
  // A `getActiveBattleEntries` függvénynek vissza kéne adnia, hogy szavaztunk-e már rá (`userHasVoted`).
  // Feltételezve, hogy az előző lépésben ezt már megcsináltad az action-ben:
  const playableEntries = entries.filter((e: any) => {
      // 1. Saját magunkra ne szavazzunk
      if (user && hasEntered && myEntryData && e.carName === myEntryData.carName) return false;
      
      // 2. Amire már szavaztunk, azt vegyük ki a pakliból (hogy fogyjanak a kártyák)
      // Ha az action visszaadja a 'userHasVoted' mezőt (az előző utasítás alapján):
      if (e.userHasVoted) return false;

      return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20 dark:bg-slate-950 transition-colors">
      
      {/* FEJLÉC */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
             <div className="flex items-center gap-4 mb-4">
                <Link href="/" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </Link>
                <span className="text-xs font-bold bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 px-2 py-1 rounded uppercase tracking-wider">
                    Showroom Battle
                </span>
            </div>
             <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white">
                 {activeBattle.title} <span className="text-orange-500">🔥</span>
             </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 max-w-4xl">
        
        {/* 1. SAJÁT NEVEZÉS STATISZTIKA (Ha van) */}
        {hasEntered && myEntryData && (
            <MyEntryStats myEntry={myEntryData} />
        )}

        {/* 2. NEVEZÉS / VISSZAVONÁS PANEL */}
        {user && (
            <BattleEntry 
                battleId={activeBattle.id} 
                myCars={myCars} 
                hasEntered={hasEntered} 
            />
        )}

        {/* 3. TINDER SWIPE GAME */}
        <div className="mt-12">
            <div className="flex items-center justify-center gap-2 mb-8">
                <Layers className="text-orange-500 w-5 h-5" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Szavazz a kedvencekre!</h2>
            </div>
            
            {playableEntries.length > 0 ? (
                <div className="pb-20"> 
                    <SwipeGame entries={playableEntries} />
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-100 dark:bg-slate-900 rounded-3xl">
                    <p className="text-slate-500">Nincs több autó, amire szavazhatnál (vagy már mindegyikre szavaztál).</p>
                </div>
            )}
        </div>

      </div>
    </div>
  )
}