'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'

export async function startParkingAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Nem vagy bejelentkezve')

  const car_id = String(formData.get('car_id'))
  const latitude = parseFloat(String(formData.get('latitude')))
  const longitude = parseFloat(String(formData.get('longitude')))
  const note = String(formData.get('note') || '')
  const durationMinutes = formData.get('duration') ? parseInt(String(formData.get('duration'))) : null
  const photoFile = formData.get('photo') as File | null

  const now = new Date()
  const start_time = now.toISOString()

  let expires_at = null
  if (durationMinutes) {
      expires_at = new Date(now.getTime() + durationMinutes * 60000).toISOString()
  }

  // Fotó feltöltés...
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

  // 1. Előző törlése (Biztos ami biztos)
  const { error: deleteError } = await supabase.from('parking_sessions').delete().eq('car_id', car_id)
  if (deleteError) {
      console.error('Törlési hiba:', deleteError)
      // Itt még nem feltétlen kell megállni, de jó tudni róla
  }

  // 2. Új beszúrása
  const { error: insertError } = await supabase.from('parking_sessions').insert({
      user_id: user.id,
      car_id,
      latitude,
      longitude,
      note,
      photo_url,
      start_time,
      expires_at
  })

  // JAVÍTÁS: Ha hiba van, akkor DOBJUNK HIBÁT, hogy a kliens is tudjon róla!
  if (insertError) {
      console.error('Hiba a mentéskor:', insertError)
      throw new Error('Adatbázis hiba: Nem sikerült menteni a parkolást.')
  }

  // Ha idáig eljutottunk, biztosan mentve van az adat.
  revalidatePath('/', 'layout') 
  revalidatePath(`/cars/${car_id}`, 'layout')
}

// ... a stopParkingAction maradhat a régi ...
export async function stopParkingAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nem vagy bejelentkezve')

  const parkingId = formData.get('parking_id') as string
  const carId = formData.get('car_id') as string

  if (parkingId === 'temp-id') return { success: true }

  const { error } = await supabase
    .from('parking_sessions')
    .delete()
    .eq('id', parkingId)
    .eq('user_id', user.id)

  if (error) throw new Error('Nem sikerült leállítani a parkolást')

  revalidatePath('/', 'layout')
  if (carId) revalidatePath(`/cars/${carId}`, 'layout')
  
  return { success: true }
}