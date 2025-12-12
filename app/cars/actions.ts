'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Segédfüggvény: Üres string kezelése (számoknál és dátumoknál fontos)
const parseNullableInt = (val: FormDataEntryValue | null) => {
  const str = String(val);
  return str && str !== '' ? parseInt(str) : null;
}

const parseNullableString = (val: FormDataEntryValue | null) => {
  const str = String(val);
  return str && str !== '' ? str : null;
}

// --- ÚJ AUTÓ LÉTREHOZÁSA ---
export async function addCar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const imageFile = formData.get('image') as File;
  let image_url = null;

  // Képfeltöltés
  if (imageFile && imageFile.size > 0) {
    const fileName = `${user.id}/${Date.now()}_${imageFile.name.replace(/\s/g, '_')}`;
    const { error: uploadError } = await supabase.storage.from('car-images').upload(fileName, imageFile);
    if (!uploadError) {
      const { data } = supabase.storage.from('car-images').getPublicUrl(fileName);
      image_url = data.publicUrl;
    }
  }

  const { error } = await supabase.from('cars').insert({
    user_id: user.id,
    // Alapadatok
    make: String(formData.get('make')),
    model: String(formData.get('model')),
    plate: String(formData.get('plate')).toUpperCase().replace(/\s/g, ''), // Formázás
    vin: String(formData.get('vin')) || null,
    year: parseInt(String(formData.get('year'))),
    color: String(formData.get('color')),
    status: String(formData.get('status')),
    image_url: image_url,
    
    // Műszaki adatok (ÚJ)
    mileage: parseInt(String(formData.get('mileage'))),
    fuel_type: String(formData.get('fuel_type')), // Most már magyarul jön
    transmission: String(formData.get('transmission')),
    power_hp: parseNullableInt(formData.get('power_hp')),
    engine_size: parseNullableInt(formData.get('engine_size')),

    // Dátumok (ÚJ)
    mot_expiry: parseNullableString(formData.get('mot_expiry')),
    insurance_expiry: parseNullableString(formData.get('insurance_expiry')),
  })

  if (error) {
    console.error('Hiba a mentéskor:', error)
    return redirect('/cars/new?error=Sikertelen mentés. Ellenőrizd az adatokat.')
  }
  
  revalidatePath('/')
  redirect('/')
}

// --- AUTÓ MÓDOSÍTÁSA ---
export async function updateCar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const carId = String(formData.get('car_id'))
  const imageFile = formData.get('image') as File;
  
  const updateData: any = {
    make: String(formData.get('make')),
    model: String(formData.get('model')),
    plate: String(formData.get('plate')).toUpperCase().replace(/\s/g, ''),
    year: parseInt(String(formData.get('year'))),
    mileage: parseInt(String(formData.get('mileage'))),
    vin: String(formData.get('vin')) || null,
    color: String(formData.get('color')),
    fuel_type: String(formData.get('fuel_type')),
    status: String(formData.get('status')),
    
    // Új mezők frissítése
    transmission: String(formData.get('transmission')),
    power_hp: parseNullableInt(formData.get('power_hp')),
    engine_size: parseNullableInt(formData.get('engine_size')),
    mot_expiry: parseNullableString(formData.get('mot_expiry')),
    insurance_expiry: parseNullableString(formData.get('insurance_expiry')),
  }

  // Képcsere logika
  if (imageFile && imageFile.size > 0) {
    const fileName = `${user.id}/${Date.now()}_${imageFile.name.replace(/\s/g, '_')}`;
    const { error: uploadError } = await supabase.storage.from('car-images').upload(fileName, imageFile);
    if (!uploadError) {
      const { data } = supabase.storage.from('car-images').getPublicUrl(fileName);
      updateData.image_url = data.publicUrl;
    }
  }

  const { error } = await supabase
    .from('cars')
    .update(updateData)
    .eq('id', carId)
    .eq('user_id', user.id)

  if (error) {
    return redirect(`/cars/${carId}/edit?error=Hiba a frissítéskor`)
  }

  revalidatePath('/')
  revalidatePath(`/cars/${carId}`)
  redirect(`/cars/${carId}`)
}

// --- TÖRLÉS ---
export async function deleteCar(formData: FormData) {
  const supabase = await createClient()
  const carId = String(formData.get('id') || formData.get('car_id'))
  
  // Kapcsolódó adatok törlése (Cascade helyett manuálisan biztonságosabb)
  await supabase.from('events').delete().eq('car_id', carId)
  await supabase.from('service_reminders').delete().eq('car_id', carId)
  await supabase.from('trips').delete().eq('car_id', carId)

  const { error } = await supabase.from('cars').delete().eq('id', carId)

  if (error) console.error('Delete error:', error)

  revalidatePath('/')
  redirect('/') 
}