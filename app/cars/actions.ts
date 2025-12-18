'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Segédfüggvény: Üres string kezelése (számoknál és dátumoknál fontos)
const parseNullableInt = (val: FormDataEntryValue | null) => {
  const str = String(val);
  return str && str !== '' && str !== 'null' ? parseInt(str) : null;
}

const parseNullableString = (val: FormDataEntryValue | null) => {
  const str = String(val);
  return str && str !== '' && str !== 'null' ? str : null;
}

// --- ÚJ AUTÓ LÉTREHOZÁSA ---
export async function addCar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // --- ALVÁZSZÁM VALIDÁCIÓ ÉS FORMÁZÁS ---
  // Kiszedjük, levágjuk a felesleges szóközöket és nagybetűsítjük
  const vinRaw = formData.get('vin');
  const vin = vinRaw ? String(vinRaw).trim().toUpperCase() : '';

  // Ellenőrizzük, hogy megvan-e
  if (!vin || vin.length === 0) {
    return redirect('/cars/new?error=Az alvázszám (VIN) megadása kötelező!');
  }
  // ---------------------------------------

  const imageFile = formData.get('image') as File;
  let image_url = null;

  // Képfeltöltés logika (ha van fájl)
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
    make: String(formData.get('make')),
    model: String(formData.get('model')),
    plate: String(formData.get('plate')).toUpperCase().replace(/\s/g, ''),
    
    // Itt használjuk a már formázott és validált 'vin' változót
    vin: vin, 
    
    year: parseInt(String(formData.get('year'))),
    color: parseNullableString(formData.get('color')),
    body_type: parseNullableString(formData.get('body_type')),
    status: String(formData.get('status')),
    image_url: image_url,
    
    // Műszaki adatok
    mileage: parseInt(String(formData.get('mileage'))),
    fuel_type: String(formData.get('fuel_type')), 
    transmission: String(formData.get('transmission')),
    power_hp: parseNullableInt(formData.get('power_hp')),
    engine_size: parseNullableInt(formData.get('engine_size')),
    mot_expiry: parseNullableString(formData.get('mot_expiry')),
    insurance_expiry: parseNullableString(formData.get('insurance_expiry')),
  })

  if (error) {
    console.error('Adatbázis hiba:', error)
    return redirect('/cars/new?error=Sikertelen mentés: ' + error.message)
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

  // --- ALVÁZSZÁM VALIDÁCIÓ ÉS FORMÁZÁS (UPDATE-NÉL IS) ---
  const vinRaw = formData.get('vin');
  const vin = vinRaw ? String(vinRaw).trim().toUpperCase() : '';

  if (!vin || vin.length === 0) {
    return redirect(`/cars/${carId}/edit?error=Az alvázszám (VIN) megadása kötelező!`);
  }
  // --------------------------------------------------------
  
  const updateData: any = {
    make: String(formData.get('make')),
    model: String(formData.get('model')),
    plate: String(formData.get('plate')).toUpperCase().replace(/\s/g, ''),
    year: parseInt(String(formData.get('year'))),
    mileage: parseInt(String(formData.get('mileage'))),
    
    // Itt használjuk a formázott 'vin'-t
    vin: vin,
    
    color: String(formData.get('color')),
    fuel_type: String(formData.get('fuel_type')),
    status: String(formData.get('status')),
    
    // Új mezők frissítése
    transmission: String(formData.get('transmission')),
    body_type: parseNullableString(formData.get('body_type')),
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
    return redirect(`/cars/${carId}/edit?error=Hiba a frissítéskor: ${error.message}`)
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
export async function togglePublicHistory(carId: string, isPublic: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('cars')
    .update({ is_public_history: isPublic })
    .eq('id', carId)
    .eq('user_id', user.id) // Biztonsági ellenőrzés: csak a sajátját!

  revalidatePath(`/cars/${carId}`)
}

export async function toggleCarVisibility(carId: string, isPublic: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Ellenőrizzük, hogy a useré-e az autó, és frissítjük
  const { error } = await supabase
    .from('cars')
    .update({ is_public_history: isPublic })
    .eq('id', carId)
    .eq('user_id', user.id) // Fontos biztonsági ellenőrzés!

  if (error) {
    console.error('Error toggling visibility:', error)
    return { error: error.message }
  }

  // Újratöltjük az oldalt, hogy a UI frissüljön
  revalidatePath(`/cars/${carId}`)
  return { success: true }
}