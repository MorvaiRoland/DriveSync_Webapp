// app/actions/showroom.ts
'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Adatok lekérése egy aktív versenyhez
export async function getActiveBattleEntries(battleId: string) {
  // JAVÍTÁS: Itt hiányzott az 'await'. Most megvárjuk, amíg a kliens létrejön.
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('battle_entries')
    .select(`
      id,
      car_id,
      cars ( id, make, model, image_url ),
      battle_votes ( count )
    `)
    .eq('battle_id', battleId)

  if (error) {
    console.error('Error fetching entries:', error)
    return []
  }

  // Formázzuk az adatot
  return data.map((entry: any) => ({
    entryId: entry.id,
    carId: entry.car_id,
    // Ellenőrizzük, hogy a cars objektum létezik-e (biztonsági okból)
    carName: entry.cars ? `${entry.cars.make} ${entry.cars.model}` : 'Ismeretlen autó',
    imageUrl: entry.cars?.image_url || null, 
    voteCount: entry.battle_votes[0]?.count || 0
  }))
}

// 2. Szavazás leadása (Like/Unlike)
export async function toggleBattleVote(entryId: string) {
  // JAVÍTÁS: Itt is hozzáadtuk az 'await'-et
  const supabase = await createClient()
  
  // Most már működni fog az auth.getUser(), mert a supabase változó a kliens, nem egy Promise
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Must be logged in to vote')

  // Megnézzük, szavazott-e már
  const { data: existingVote } = await supabase
    .from('battle_votes')
    .select('id')
    .eq('entry_id', entryId)
    .eq('voter_id', user.id)
    .single()

  if (existingVote) {
    // Ha már szavazott, visszavonjuk (Unlike)
    await supabase.from('battle_votes').delete().eq('id', existingVote.id)
  } else {
    // Ha még nem, beszúrjuk a szavazatot (Like)
    await supabase.from('battle_votes').insert({
        entry_id: entryId,
        voter_id: user.id
    })
  }
  
  revalidatePath('/showroom') // Frissítjük az oldalt, hogy látszódjon az új szavazat
  return { success: true }
}
// 3. ÚJ: Nevezés a versenyre
export async function joinBattle(formData: FormData) {
  const battleId = formData.get('battleId') as string
  const carId = formData.get('carId') as string
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Jelentkezéshez be kell lépni!')

  // Ellenőrizzük, hogy ez a user tényleg a tulajdonosa-e az autónak (Biztonság)
  const { data: car } = await supabase
    .from('cars')
    .select('id')
    .eq('id', carId)
    .eq('user_id', user.id)
    .single()

  if (!car) {
      return { error: 'Ez nem a te autód, vagy nem létezik!' }
  }

  // Beszúrjuk a nevezést
  const { error } = await supabase.from('battle_entries').insert({
    battle_id: battleId,
    car_id: Number(carId), // Figyelj a típusra (bigint vs string)
    user_id: user.id
  })

  if (error) {
    console.error('Nevezési hiba:', error)
    // Supabase error code 23505 = unique_violation (már nevezett ezzel)
    if (error.code === '23505') {
        return { error: 'Ezzel az autóval (vagy erre a versenyre) már neveztél!' }
    }
    return { error: 'Hiba történt a nevezéskor.' }
  }

  revalidatePath('/showroom')
  return { success: true }
}