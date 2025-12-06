'use server'

import { createClient } from 'supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- 1. ESEMÉNYEK KEZELÉSE ---

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
  
  // Ha szerviz esemény volt, automatikusan nullázzuk a számlálót az aktuális km-re
  if (type === 'service') {
     await supabase.from('cars').update({ last_service_mileage: mileage }).eq('id', car_id)
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

// --- 2. EMLÉKEZTETŐK KEZELÉSE ---

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

// --- 3. SZERVIZ SZÁMLÁLÓ ---

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

// --- 4. AUTÓ KEZELÉSE (UPDATE & DELETE) ---

export async function updateCar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return redirect('/login')

  const carId = String(formData.get('car_id'))
  
  // Dátumok kezelése (üres string esetén null)
  const motExpiry = formData.get('mot_expiry');
  const insuranceExpiry = formData.get('insurance_expiry');

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
    service_interval_km: parseInt(String(formData.get('service_interval_km'))) || 15000,
    service_interval_days: parseInt(String(formData.get('service_interval_days'))) || 365,
    mot_expiry: motExpiry && motExpiry !== '' ? String(motExpiry) : null,
    insurance_expiry: insuranceExpiry && insuranceExpiry !== '' ? String(insuranceExpiry) : null,
  }

  // Képfeltöltés
  const imageFile = formData.get('image') as File;
  if (imageFile && imageFile.size > 0) {
    const fileName = `${user.id}/${Date.now()}_${imageFile.name.replace(/\s/g, '_')}`;
    const { error: uploadError } = await supabase.storage.from('car-images').upload(fileName, imageFile);
    
    if (!uploadError) {
      const { data } = supabase.storage.from('car-images').getPublicUrl(fileName);
      updates.image_url = data.publicUrl;
    }
  }

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
  revalidatePath('/') 
  redirect(`/cars/${carId}`)
}

export async function deleteCar(formData: FormData) {
  const supabase = await createClient()
  const carId = String(formData.get('car_id'))
  
  // Biztonsági törlés: Először a kapcsolódó adatokat töröljük
  await supabase.from('events').delete().eq('car_id', carId)
  await supabase.from('service_reminders').delete().eq('car_id', carId)
  
  // Végül magát az autót
  const { error } = await supabase.from('cars').delete().eq('id', carId)

  if (error) {
    console.error('Törlési hiba:', error)
    return redirect(`/cars/${carId}?error=Nem sikerült törölni`)
  }

  revalidatePath('/')
  redirect('/')
}