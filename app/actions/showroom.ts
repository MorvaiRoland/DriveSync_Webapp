'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Adatok lekérése (BŐVÍTVE: userHasVoted mezővel)
export async function getActiveBattleEntries(battleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // A. Lekérjük az összes nevezést és a szavazatok számát
  const { data: entries, error } = await supabase
    .from('battle_entries')
    .select(`
      id,
      car_id,
      cars ( id, make, model, image_url ),
      battle_votes ( count )
    `)
    .eq('battle_id', battleId)

  if (error || !entries) return []

  // B. Lekérjük, hogy a JELENLEGI user kire szavazott már ebben a csatában
  let myVotes: Set<string> = new Set()
  
  if (user) {
    const { data: userVotes } = await supabase
        .from('battle_votes')
        .select('entry_id')
        .eq('voter_id', user.id)
        // Opcionális: szűrhetnénk battle_id-ra is joinnal, de így is gyors
    
    if (userVotes) {
        userVotes.forEach((v: any) => myVotes.add(v.entry_id))
    }
  }

  // C. Összefésüljük az adatokat
  return entries.map((entry: any) => ({
    entryId: entry.id,
    carId: entry.car_id,
    carName: entry.cars ? `${entry.cars.make} ${entry.cars.model}` : 'Ismeretlen autó',
    imageUrl: entry.cars?.image_url || null, 
    voteCount: entry.battle_votes[0]?.count || 0,
    userHasVoted: myVotes.has(entry.id) // <--- EZ AZ ÚJ MEZŐ!
  }))
}

// 2. Szavazás (Változatlan, de a unique constraint miatt most már betonbiztos)
export async function toggleBattleVote(entryId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Must be logged in to vote')

  const { data: existingVote } = await supabase
    .from('battle_votes')
    .select('id')
    .eq('entry_id', entryId)
    .eq('voter_id', user.id)
    .single()

  if (existingVote) {
    await supabase.from('battle_votes').delete().eq('id', existingVote.id)
  } else {
    // Ha a unique constraint miatt hiba lenne (dupla kattintás), a Supabase dobna egy hibát,
    // amit elkaphatunk, vagy hagyhatjuk, hogy a UI ne frissüljön.
    await supabase.from('battle_votes').insert({
        entry_id: entryId,
        voter_id: user.id
    })
  }
  
  revalidatePath('/showroom')
  return { success: true }
}

// 3. Nevezés (Változatlan)
export async function joinBattle(formData: FormData) {
  const battleId = formData.get('battleId') as string
  const carId = formData.get('carId') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Jelentkezéshez be kell lépni!')

  const { data: car } = await supabase.from('cars').select('id').eq('id', carId).eq('user_id', user.id).single()
  if (!car) return { error: 'Ez nem a te autód!' }

  const { error } = await supabase.from('battle_entries').insert({
    battle_id: battleId,
    car_id: Number(carId),
    user_id: user.id
  })

  if (error && error.code === '23505') return { error: 'Már neveztél!' }
  if (error) return { error: 'Hiba történt.' }

  revalidatePath('/showroom')
  return { success: true }
}

// 4. JAVÍTOTT: KILÉPÉS A VERSENYBŐL
export async function leaveBattle(battleId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
  
    if (!user) return { error: 'Nincs bejelentkezve' }

    // 1. Megkeressük a nevezés azonosítóját (szükség van rá a szavazatok törléséhez)
    const { data: entry, error: findError } = await supabase
        .from('battle_entries')
        .select('id')
        .eq('battle_id', battleId)
        .eq('user_id', user.id)
        .single()

    if (findError || !entry) {
        return { error: 'Nem található aktív nevezés ezzel az azonosítóval.' }
    }

    try {
        // 2. Töröljük a nevezéshez tartozó összes szavazatot (manuális cleanup)
        // Megjegyzés: Ha be van állítva az 'ON DELETE CASCADE' a DB-ben, ez a lépés elhagyható
        await supabase
            .from('battle_votes')
            .delete()
            .eq('entry_id', entry.id)

        // 3. Most már törölhető maga a nevezés
        const { error: deleteError } = await supabase
            .from('battle_entries')
            .delete()
            .eq('id', entry.id)

        if (deleteError) {
            console.error('Delete error:', deleteError)
            return { error: 'Hiba történt a törlés során: ' + deleteError.message }
        }

        revalidatePath('/showroom')
        return { success: true }

    } catch (e) {
        return { error: 'Váratlan hiba történt a visszavonás során.' }
    }
}