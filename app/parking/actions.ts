'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'

export async function startParkingAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Nem vagy bejelentkezve')

  const car_id = formData.get('car_id')
  const latitude = parseFloat(String(formData.get('latitude')))
  const longitude = parseFloat(String(formData.get('longitude')))
  const note = String(formData.get('note') || '')
  const durationMinutes = formData.get('duration') ? parseInt(String(formData.get('duration'))) : null
  const photoFile = formData.get('photo') as File | null

  // --- JAVÍTÁS ITT: Start idő definiálása ---
  const now = new Date()
  const start_time = now.toISOString() // Ezt fogjuk elmenteni

  let expires_at = null
  if (durationMinutes) {
      expires_at = new Date(now.getTime() + durationMinutes * 60000).toISOString()
  }

  // 1. Fotó feltöltés
  let photo_url = null
  if (photoFile && photoFile.size > 0) {
      const fileExt = photoFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
          .from('parking-photos')
          .upload(fileName, photoFile)
      
      if (!uploadError) {
          const { data } = supabase.storage.from('parking-photos').getPublicUrl(fileName)
          photo_url = data.publicUrl
      }
  }

  // 2. Előző törlése és Új mentése
  await supabase.from('parking_sessions').delete().eq('car_id', car_id)

  const { error } = await supabase.from('parking_sessions').insert({
      user_id: user.id,
      car_id,
      latitude,
      longitude,
      note,
      photo_url,
      start_time, // <--- FONTOS: Itt mentjük el a kezdési időt!
      expires_at
  })

  if (error) console.error('Hiba a mentéskor:', error)

  revalidatePath('/') 
}

export async function stopParkingAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nem vagy bejelentkezve')

  const parkingId = formData.get('parking_id') as string
  
  if (!parkingId) throw new Error('Hiányzó parkolás ID')
  
  const { error } = await supabase
    .from('parking_sessions')
    .delete()
    .eq('id', parkingId)
    .eq('user_id', user.id)

  if (error) console.error('Hiba a leállításkor:', error)

  revalidatePath('/')
  return { success: true }
}