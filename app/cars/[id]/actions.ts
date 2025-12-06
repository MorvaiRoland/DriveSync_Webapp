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

// --- ÚJ EMLÉKEZTETŐ LÉTREHOZÁSA ---
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

  const { error } = await supabase.from('service_reminders').insert(reminderData)

  if (error) {
    console.error('Reminder Hiba:', error)
    return redirect(`/cars/${car_id}?error=Emlékeztető mentése sikertelen`)
  }

  revalidatePath(`/cars/${car_id}`)
  redirect(`/cars/${car_id}`)
}

// --- EMLÉKEZTETŐ TÖRLÉSE ---
export async function deleteReminder(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id')
  const carId = formData.get('car_id')

  await supabase.from('service_reminders').delete().eq('id', id)
  
  revalidatePath(`/cars/${carId}`)
}

// --- AUTÓ ADATOK FRISSÍTÉSE (KÉPPEL EGYÜTT) ---
export async function updateCar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return redirect('/login')

  const carId = String(formData.get('car_id'))
  
  // Adatok összegyűjtése
  const updates: any = {
    make: String(formData.get('make')),
    model: String(formData.get('model')),
    plate: String(formData.get('plate')).toUpperCase().replace(/\s/g, ''),
    year: parseInt(String(formData.get('year'))),
    mileage: parseInt(String(formData.get('mileage'))),
    fuel_type: String(formData.get('fuel_type')),
    color: String(formData.get('color')),
    vin: String(formData.get('vin')),
    status: String(formData.get('status')),
  }

  // Kép kezelése (csak ha töltöttek fel újat)
  const imageFile = formData.get('image') as File;
  
  if (imageFile && imageFile.size > 0) {
    // Egyedi fájlnév
    const fileName = `${user.id}/${Date.now()}_${imageFile.name.replace(/\s/g, '_')}`;
    
    // Feltöltés a 'car-images' bucket-be (Ezt létre kell hozni a Supabase Storage-ban!)
    const { error: uploadError } = await supabase.storage
      .from('car-images')
      .upload(fileName, imageFile);

    if (!uploadError) {
      // Ha sikerült, lekérjük az URL-t
      const { data: { publicUrl } } = supabase.storage
        .from('car-images')
        .getPublicUrl(fileName);
      
      updates.image_url = publicUrl; // Hozzáadjuk a frissítendő adatokhoz
    }
  }

  // Adatbázis frissítése
  const { error } = await supabase
    .from('cars')
    .update(updates)
    .eq('id', carId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Autó frissítési hiba:', error)
    return redirect(`/cars/${carId}/edit?error=Nem sikerült a mentés`)
  }

  revalidatePath(`/cars/${carId}`)
  revalidatePath('/') // Főoldal frissítése is
  redirect(`/cars/${carId}`)
}

// --- AUTÓ TÖRLÉSE ---
export async function deleteCar(formData: FormData) {
  const supabase = await createClient()
  const carId = String(formData.get('car_id'))

  // 1. Először töröljük a kapcsolódó eseményeket és emlékeztetőket
  await supabase.from('events').delete().eq('car_id', carId)
  await supabase.from('service_reminders').delete().eq('car_id', carId)

  // 2. Magát az autót töröljük
  const { error } = await supabase
    .from('cars')
    .delete()
    .eq('id', carId)

  if (error) {
    console.error('Törlési hiba:', error)
    return redirect(`/cars/${carId}?error=Nem sikerült törölni`)
  }

  revalidatePath('/')
  redirect('/')
}