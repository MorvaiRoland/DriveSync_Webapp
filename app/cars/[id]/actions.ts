'use server'

import { createClient } from 'supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- ESEMÉNY LÉTREHOZÁSA ---
export async function addEvent(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const car_id = formData.get('car_id')
  const type = String(formData.get('type'))
  
  const mileage = parseInt(String(formData.get('mileage')))

  const eventData = {
    car_id: car_id,
    user_id: user.id,
    type: type,
    title: String(formData.get('title')),
    event_date: String(formData.get('event_date')),
    mileage: mileage,
    cost: parseInt(String(formData.get('cost'))),
    location: String(formData.get('location')),
    description: String(formData.get('description')),
    liters: type === 'fuel' ? parseFloat(String(formData.get('liters'))) : null
  }

  const { error } = await supabase.from('events').insert(eventData)

  if (error) {
    console.error('Hiba:', error)
    return redirect(`/cars/${car_id}/events/new?type=${type}&error=Mentési hiba`)
  }

  // Km óra frissítése az autón, ha az új érték nagyobb
  const { data: car } = await supabase.from('cars').select('mileage').eq('id', car_id).single()
  if (car && mileage > car.mileage) {
    await supabase.from('cars').update({ mileage: mileage }).eq('id', car_id)
  }

  revalidatePath(`/cars/${car_id}`)
  redirect(`/cars/${car_id}`)
}

// --- ESEMÉNY TÖRLÉSE ---
export async function deleteEvent(formData: FormData) {
  const supabase = await createClient()
  const eventId = formData.get('event_id')
  const carId = formData.get('car_id')

  const { error } = await supabase.from('events').delete().eq('id', eventId)

  if (error) {
    console.error('Törlési hiba:', error)
  }

  revalidatePath(`/cars/${carId}`)
}

// --- ESEMÉNY MÓDOSÍTÁSA ---
export async function updateEvent(formData: FormData) {
  const supabase = await createClient()
  
  const eventId = formData.get('event_id')
  const carId = formData.get('car_id')
  
  const updateData = {
    title: String(formData.get('title')),
    event_date: String(formData.get('event_date')),
    mileage: parseInt(String(formData.get('mileage'))),
    cost: parseInt(String(formData.get('cost'))),
    location: String(formData.get('location')),
    description: String(formData.get('description')),
    liters: formData.get('type') === 'fuel' ? parseFloat(String(formData.get('liters'))) : null
  }

  const { error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', eventId)

  if (error) {
    console.error('Frissítési hiba:', error)
    return redirect(`/cars/${carId}/events/${eventId}/edit?error=Hiba történt`)
  }

  revalidatePath(`/cars/${carId}`)
  redirect(`/cars/${carId}`)
}