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

  // --- 1. VALIDÁCIÓK ---
  
  // Alvázszám (VIN) tisztítása és ellenőrzése
  const vinRaw = formData.get('vin');
  const vin = vinRaw ? String(vinRaw).trim().toUpperCase() : '';

  if (!vin) {
    // encodeURIComponent védi a headert az ékezetektől!
    return redirect(`/cars/new?error=${encodeURIComponent('Az alvázszám (VIN) megadása kötelező!')}`);
  }

  // Évjárat és km óra biztonságos konvertálása (Hogy ne legyen NaN)
  const yearVal = formData.get('year');
  const mileageVal = formData.get('mileage');
  
  const year = yearVal ? parseInt(String(yearVal)) : 0;
  const mileage = mileageVal ? parseInt(String(mileageVal)) : 0;

  if (!year || !mileage) {
     return redirect(`/cars/new?error=${encodeURIComponent('Az évjárat és a kilométeróra állás kötelező!')}`);
  }

  // --- 2. KÉPFELTÖLTÉS ---
  const imageFile = formData.get('image') as File;
  let image_url = null;

  if (imageFile && imageFile.size > 0) {
    // Fájlnév tisztítása az ékezetektől és szóközöktől a biztonság kedvéért
    const cleanFileName = imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const path = `${user.id}/${Date.now()}_${cleanFileName}`;
    
    const { error: uploadError } = await supabase.storage.from('car-images').upload(path, imageFile);
    
    if (!uploadError) {
      const { data } = supabase.storage.from('car-images').getPublicUrl(path);
      image_url = data.publicUrl;
    }
  }

  // --- 3. ADATBÁZIS MENTÉS ---
  const { error } = await supabase.from('cars').insert({
    user_id: user.id,
    make: String(formData.get('make')),
    model: String(formData.get('model')),
    plate: String(formData.get('plate')).toUpperCase().replace(/\s/g, ''),
    vin: vin,
    year: year,
    color: parseNullableString(formData.get('color')),
    body_type: parseNullableString(formData.get('body_type')),
    status: String(formData.get('status')),
    image_url: image_url,
    
    mileage: mileage,
    fuel_type: String(formData.get('fuel_type')), 
    transmission: String(formData.get('transmission')),
    power_hp: parseNullableInt(formData.get('power_hp')),
    engine_size: parseNullableInt(formData.get('engine_size')),
    mot_expiry: parseNullableString(formData.get('mot_expiry')),
    insurance_expiry: parseNullableString(formData.get('insurance_expiry')),
  })

  // --- 4. HIBAKEZELÉS (SPECIFIKUS) ---
  if (error) {
    console.error('Adatbázis hiba:', error)
    
    let errorMessage = 'Sikertelen mentés: ' + error.message;

    // Ha a hiba oka az, hogy a VIN már létezik (Unique constraint violation)
    if (error.code === '23505') {
        errorMessage = 'Ez az alvázszám (VIN) már szerepel a rendszerben!';
    }

    // FONTOS: encodeURIComponent használata a Vercel hiba elkerülése miatt
    return redirect(`/cars/new?error=${encodeURIComponent(errorMessage)}`)
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