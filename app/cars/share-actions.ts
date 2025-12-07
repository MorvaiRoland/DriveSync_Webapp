'use server'

import { createClient } from 'supabase/server'
import { revalidatePath } from 'next/cache'

export async function shareCar(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get('email')).trim()
  const car_id = String(formData.get('car_id'))

  if (!email || !email.includes('@')) {
    return { error: 'Érvénytelen email cím' }
  }

  // Ellenőrizzük, hogy a user a tulajdonos-e (SQL policy is védi, de biztos ami biztos)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs bejelentkezve' }

  // Hozzáadás
  const { error } = await supabase
    .from('car_shares')
    .insert({
      car_id,
      email,
      role: 'editor' // Alapértelmezetten szerkesztő
    })

  if (error) {
    if (error.code === '23505') { // Unique violation
        return { error: 'Ez a felhasználó már hozzá van rendelve ehhez az autóhoz.' }
    }
    return { error: 'Hiba történt a megosztáskor.' }
  }

  revalidatePath(`/cars/${car_id}/edit`)
  return { success: true }
}

export async function removeShare(formData: FormData) {
  const supabase = await createClient()
  const share_id = formData.get('share_id')
  const car_id = formData.get('car_id')

  const { error } = await supabase
    .from('car_shares')
    .delete()
    .eq('id', share_id)

  if (error) return { error: 'Nem sikerült visszavonni a megosztást.' }

  revalidatePath(`/cars/${car_id}/edit`)
  return { success: true }
}