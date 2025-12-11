'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createGroupAction(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Hitelesítés ellenőrzése
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nem vagy bejelentkezve.' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const type = formData.get('type') as string // 'public' vagy 'private'
  
  if (!name) return { error: 'A csoport név kötelező.' }

  // 2. Csoport létrehozása
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({
      name,
      description,
      type,
      created_by: user.id
    })
    .select()
    .single()

  if (groupError) {
    console.error('Hiba a csoport létrehozásakor:', groupError)
    return { error: 'Hiba történt a létrehozáskor.' }
  }

  // 3. A létrehozó automatikusan ADMIN lesz
  const { error: memberError } = await supabase
    .from('group_members')
    .insert({
      group_id: group.id,
      user_id: user.id,
      role: 'admin'
    })

  if (memberError) {
    console.error('Hiba a tagság hozzáadásakor:', memberError)
    // Opcionális: Itt törölni kéne a csoportot, ha ez nem sikerül, de most hagyjuk
  }

  // 4. Frissítés és átirányítás az új csoportba
  revalidatePath('/community')
  return { success: true, groupId: group.id }
}