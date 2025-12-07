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

export async function updateEvent(formData: FormData) {
  const supabase = await createClient()
  
  const eventId = String(formData.get('event_id'))
  const carId = String(formData.get('car_id'))
  const type = String(formData.get('type'))
  
  const updateData = {
    title: String(formData.get('title')),
    event_date: String(formData.get('event_date')),
    mileage: parseInt(String(formData.get('mileage'))),
    cost: parseInt(String(formData.get('cost'))),
    location: String(formData.get('location')),
    description: String(formData.get('description')),
    liters: type === 'fuel' ? parseFloat(String(formData.get('liters'))) : null
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
    
    const { data: car } = await supabase.from('cars').select('mileage').eq('id', carId).single()
    
    if (car) {
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
  
  // Törlés sorrend: Trip -> Gumi -> Esemény -> Emlékeztető -> Autó
  await supabase.from('trips').delete().eq('car_id', carId)
  await supabase.from('tires').delete().eq('car_id', carId)
  await supabase.from('events').delete().eq('car_id', carId)
  await supabase.from('service_reminders').delete().eq('car_id', carId)
  
  const { error } = await supabase.from('cars').delete().eq('id', carId)

  if (error) {
    console.error('Törlési hiba:', error)
    return redirect(`/cars/${carId}?error=Nem sikerült törölni`)
  }

  revalidatePath('/')
  redirect('/')
}

// --- 5. GUMIABRONCS MENEDZSER ---

export async function addTire(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const carId = String(formData.get('car_id'))
  
  const tireData = {
    user_id: user.id,
    car_id: carId,
    brand: String(formData.get('brand')),
    model: String(formData.get('model')),
    size: String(formData.get('size')),
    type: String(formData.get('type')),
    dot: String(formData.get('dot')),
    total_distance: parseInt(String(formData.get('total_distance') || '0')),
    is_mounted: false 
  }

  await supabase.from('tires').insert(tireData)
  revalidatePath(`/cars/${carId}`)
}

export async function deleteTire(formData: FormData) {
  const supabase = await createClient()
  const tireId = String(formData.get('tire_id'))
  const carId = String(formData.get('car_id'))
  
  await supabase.from('tires').delete().eq('id', tireId)
  revalidatePath(`/cars/${carId}`)
}

export async function swapTire(formData: FormData) {
  const supabase = await createClient()
  const carId = String(formData.get('car_id'))
  const newTireId = String(formData.get('tire_id')) 
  
  const { data: car } = await supabase.from('cars').select('mileage').eq('id', carId).single()
  if (!car) return;

  const { data: currentMounted } = await supabase
    .from('tires')
    .select('*')
    .eq('car_id', carId)
    .eq('is_mounted', true)
    .single()

  if (currentMounted) {
     const distanceDriven = car.mileage - (currentMounted.mounted_at_mileage || car.mileage);
     const validDistance = Math.max(0, distanceDriven);

     await supabase
       .from('tires')
       .update({ 
          is_mounted: false, 
          mounted_at_mileage: null,
          total_distance: (currentMounted.total_distance || 0) + validDistance
       })
       .eq('id', currentMounted.id)
  }

  if (newTireId && newTireId !== 'none') {
    await supabase
      .from('tires')
      .update({ 
         is_mounted: true, 
         mounted_at_mileage: car.mileage 
      })
      .eq('id', newTireId)
  }

  revalidatePath(`/cars/${carId}`)
}

// --- 6. ÚTNYILVÁNTARTÁS (TRIP LOGGER) - ÚJ! ---

export async function addTrip(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const car_id = formData.get('car_id')
  
  const tripData = {
    user_id: user.id,
    car_id: car_id,
    start_location: String(formData.get('start_location')),
    end_location: String(formData.get('end_location')),
    distance: parseInt(String(formData.get('distance'))),
    purpose: String(formData.get('purpose')),
    trip_date: String(formData.get('trip_date')),
    notes: String(formData.get('notes') || '')
  }

  const { error } = await supabase.from('trips').insert(tripData)

  if (error) {
    console.error('Út mentési hiba:', error)
  }
  
  revalidatePath(`/cars/${car_id}/trips`)
}

export async function deleteTrip(formData: FormData) {
  const supabase = await createClient()
  const tripId = String(formData.get('trip_id'))
  const carId = String(formData.get('car_id'))
  
  await supabase.from('trips').delete().eq('id', tripId)
  
  revalidatePath(`/cars/${carId}/trips`)
}

export async function addPart(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const car_id = formData.get('car_id')
  
  const partData = {
    user_id: user.id,
    car_id: car_id,
    name: String(formData.get('name')),
    part_number: String(formData.get('part_number') || ''),
    brand: String(formData.get('brand') || ''),
    shop_url: String(formData.get('shop_url') || ''),
    note: String(formData.get('note') || '')
  }

  await supabase.from('parts').insert(partData)
  
  revalidatePath(`/cars/${car_id}/parts`)
}

export async function deletePart(formData: FormData) {
  const supabase = await createClient()
  const partId = String(formData.get('part_id'))
  const carId = String(formData.get('car_id'))
  
  await supabase.from('parts').delete().eq('id', partId)
  
  revalidatePath(`/cars/${carId}/parts`)
}