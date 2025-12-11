'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- CSOPORT LÉTREHOZÁSA ---
export async function createGroupAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Jelentkezz be!' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const type = formData.get('type') as string

  // 1. Csoport létrehozása
  const { data: group, error } = await supabase
    .from('groups')
    .insert({ name, description, type, created_by: user.id })
    .select()
    .single()

  if (error) return { error: 'Hiba a létrehozáskor.' }

  // 2. Adminnak berakjuk a készítőt
  await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: user.id,
    role: 'admin'
  })

  return { success: true, groupId: group.id }
}

// --- CSATLAKOZÁS NYILVÁNOS CSOPORTHOZ ---
export async function joinGroupAction(groupId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('group_members').insert({
    group_id: groupId,
    user_id: user.id,
    role: 'member'
  })

  revalidatePath('/community')
}

// --- KILÉPÉS CSOPORTBÓL ---
export async function leaveGroupAction(groupId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('group_members').delete()
    .eq('group_id', groupId)
    .eq('user_id', user.id)

  revalidatePath('/community')
  redirect('/community') // Vissza a főoldalra
}

// --- TAG MEGHÍVÁSA (EMAIL ALAPJÁN) ---
export async function inviteMemberAction(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const groupId = formData.get('groupId') as string

  // 1. User ID megkeresése az RPC függvénnyel
  const { data: users, error } = await supabase.rpc('get_user_id_by_email', { email_input: email })

  if (error || !users || users.length === 0) {
    return { error: 'Nem található felhasználó ezzel az email címmel.' }
  }

  const userId = users[0].id

  // 2. Hozzáadás a csoporthoz
  const { error: insertError } = await supabase.from('group_members').insert({
    group_id: groupId,
    user_id: userId,
    role: 'member'
  })

  if (insertError) {
    // Ha már tag, akkor unique constraint hibát dob, kezeljük le
    if (insertError.code === '23505') return { error: 'Ez a felhasználó már tag.' }
    return { error: 'Hiba a hozzáadáskor.' }
  }

  return { success: 'Felhasználó sikeresen hozzáadva!' }
}

// --- PRIVÁT ÜZENET KÜLDÉSE (ÚJ PARTNERNEK) ---
export async function startDMAction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Jelentkezz be!' }

    const email = formData.get('email') as string
    
    // 1. User keresése az új RPC függvénnyel
    // Ez most már működni fog, mert a szerver oldali SQL függvénynek van joga olvasni
    const { data: foundUsers, error } = await supabase.rpc('get_user_by_email', { 
        email_input: email.trim() 
    })

    if (error) {
        console.error('RPC Hiba:', error)
        return { error: 'Hiba történt a keresés közben.' }
    }

    if (!foundUsers || foundUsers.length === 0) {
        return { error: 'Nem található felhasználó ezzel az email címmel.' }
    }
    
    const partnerId = foundUsers[0].id

    // 2. Ellenőrzés: Ne írhass magadnak
    if (partnerId === user.id) {
        return { error: 'Magadnak nem küldhetsz üzenetet.' }
    }

    // 3. Ellenőrzés: Létezik-e már beszélgetés? (Opcionális, de szép)
    // Megnézzük, váltottatok-e már üzenetet, hogy ne navigáljunk üresre feleslegesen,
    // de a jelenlegi logikánk szerint a chat ablak úgyis betölti az üreset, szóval ez mehet tovább.

    return { success: true, partnerId: partnerId }
}