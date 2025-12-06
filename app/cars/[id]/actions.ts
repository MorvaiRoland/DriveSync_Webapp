'use server'

import { createClient } from 'supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ... (A TÖBBI FÜGGVÉNY: addEvent, deleteEvent stb. MARADJON MEG VÁLTOZATLANUL!) ...
// ... Csak másold be a meglévőket, vagy ha biztosra mész, itt a teljes fájl a régiekkel együtt:

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

  if (error) return redirect(`/cars/${car_id}/events/new?type=${type}&error=Mentési hiba`)

  // Ha a megadott km nagyobb mint a jelenlegi, frissítjük az autót
  const { data: car } = await supabase.from('cars').select('mileage').eq('id', car_id).single()
  if (car && mileage > car.mileage) {
    await supabase.from('cars').update({ mileage: mileage }).eq('id', car_id)
  }

  revalidatePath(`/cars/${car_id}`)
  redirect(`/cars/${car_id}`)
}

export async function deleteEvent(formData: FormData) {
  const supabase = await createClient()
  const eventId = formData.get('event_id')
  const carId = formData.get('car_id')
  await supabase.from('events').delete().eq('id', eventId)
  revalidatePath(`/cars/${carId}`)
}

export async function addReminder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const car_id = formData.get('car_id')
  const reminderData = {
    car_id: car_id,
    user_id: user.id,
    service_type: String(formData.get('service_type')),
    due_date: String(formData.get('due_date')),
    notify_email: formData.get('notify_email') === 'on',
    notify_push: formData.get('notify_push') === 'on',
    note: String(formData.get('note'))
  }

  await supabase.from('service_reminders').insert(reminderData)
  revalidatePath(`/cars/${car_id}`)
  redirect(`/cars/${car_id}`)
}

export async function deleteReminder(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id')
  const carId = formData.get('car_id')
  await supabase.from('service_reminders').delete().eq('id', id)
  revalidatePath(`/cars/${carId}`)
}

// --- ÚJ: SZERVIZ INTERVALLUM NULLÁZÁSA ---
export async function resetServiceCounter(formData: FormData) {
    const supabase = await createClient()
    const carId = String(formData.get('car_id'))
    
    // Lekérjük az autó aktuális kilométerét
    const { data: car } = await supabase.from('cars').select('mileage').eq('id', carId).single()
    
    if (car) {
        // Beállítjuk a 'last_service_mileage'-t a jelenlegi 'mileage'-re
        await supabase
            .from('cars')
            .update({ last_service_mileage: car.mileage })
            .eq('id', carId)
    }

    revalidatePath(`/cars/${carId}`)
}