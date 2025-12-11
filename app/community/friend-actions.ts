'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'

// --- BARÁTNEK JELÖLÉS (Email alapján) ---
export async function addFriendAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Jelentkezz be!' }

  const email = formData.get('email') as string

  // 1. User megkeresése email alapján
  const { data: foundUsers } = await supabase.rpc('get_user_id_by_email', { email_input: email })
  
  if (!foundUsers || foundUsers.length === 0) return { error: 'Nincs ilyen felhasználó.' }
  
  const friendId = foundUsers[0].id

  if (friendId === user.id) return { error: 'Magadat nem jelölheted be.' }

  // 2. Jelölés beszúrása
  const { error } = await supabase.from('friendships').insert({
    user_id: user.id,
    friend_id: friendId,
    status: 'pending'
  })

  if (error) {
      if (error.code === '23505') return { error: 'Már bejelöltétek egymást.' }
      return { error: 'Hiba történt.' }
  }

  revalidatePath('/community')
  return { success: 'Jelölés elküldve!' }
}

// --- JELÖLÉS ELFOGADÁSA ---
export async function acceptFriendAction(friendshipId: string) {
    const supabase = await createClient()
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
    revalidatePath('/community')
}

// --- JELÖLÉS ELUTASÍTÁSA / TÖRLÉS ---
export async function removeFriendAction(friendshipId: string) {
    const supabase = await createClient()
    await supabase.from('friendships').delete().eq('id', friendshipId)
    revalidatePath('/community')
}