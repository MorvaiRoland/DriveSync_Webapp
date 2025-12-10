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

  let expires_at = null
  if (durationMinutes) {
      const now = new Date()
      expires_at = new Date(now.getTime() + durationMinutes * 60000).toISOString()
  }

  // 1. Fotó feltöltés (ha van)
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

  // 2. Mentés az adatbázisba
  // Előtte töröljük az előző aktív parkolást ehhez az autóhoz (hogy ne legyen duplikáció)
  await supabase.from('parking_sessions').delete().eq('car_id', car_id)

  const { error } = await supabase.from('parking_sessions').insert({
      user_id: user.id,
      car_id,
      latitude,
      longitude,
      note,
      photo_url,
      expires_at
  })

  if (error) console.error('Parking save error:', error)

  revalidatePath('/') // Frissítjük a dashboardot
}

export async function stopParkingAction(formData: FormData) {
    const supabase = await createClient()
    const id = String(formData.get('id'))
    
    await supabase.from('parking_sessions').delete().eq('id', id)
    revalidatePath('/')
}