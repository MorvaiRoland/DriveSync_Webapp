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