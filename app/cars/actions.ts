'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- SEGÉDFÜGGVÉNYEK ---
const parseNullableInt = (val: FormDataEntryValue | null) => {
  const str = String(val);
  return str && str !== '' && str !== 'null' ? parseInt(str) : null;
}

const parseNullableString = (val: FormDataEntryValue | null) => {
  const str = String(val);
  return str && str !== '' && str !== 'null' ? str : null;
}

// --- 1. ÚJ AUTÓ LÉTREHOZÁSA ---
export async function addCar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const vinRaw = formData.get('vin');
  const vin = vinRaw ? String(vinRaw).trim().toUpperCase() : '';

  // Validáció
  if (!vin) {
    return redirect(`/cars/new?error=${encodeURIComponent('Az alvázszám (VIN) megadása kötelező!')}`);
  }

  // Adatok összekészítése
  const carData = {
    user_id: user.id,
    make: String(formData.get('make')),
    model: String(formData.get('model')),
    plate: String(formData.get('plate')).toUpperCase().replace(/\s/g, ''),
    vin: vin,
    year: parseInt(String(formData.get('year')) || '0'),
    mileage: parseInt(String(formData.get('mileage')) || '0'),
    // ... egyéb mezők (color, engine, stb.)
  }

  const { error } = await supabase.from('cars').insert(carData)

  // --- HIBAKEZELÉS ÉS DUPLIKÁCIÓ ---
  if (error) {
    console.error('Adatbázis hiba:', error)

    // HA MÁR LÉTEZIK AZ ALVÁZSZÁM (Unique Violation - 23505)
    if (error.code === '23505') {
      // Lekérjük a létező autó ID-ját a VIN alapján
      const { data: existingCar } = await supabase
        .from('cars')
        .select('id')
        .eq('vin', vin)
        .single();
      
      if (existingCar) {
        // Visszairányítunk a formra a megtalált ID-vel
        return redirect(`/cars/new?found_car_id=${existingCar.id}`);
      }
    }

    return redirect(`/cars/new?error=${encodeURIComponent('Sikertelen mentés: ' + error.message)}`)
  }
  
  revalidatePath('/')
  redirect('/')
}

// --- AUTÓ ÁTVÉTELE (CLAIM) ---
// Ez az új action, amit a kártya gombja hív meg
export async function claimCar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const carId = String(formData.get('car_id'));

  // Átírjuk a tulajdonost a jelenlegi userre
  // Opcionális: Itt törölheted a korábbi tulaj adatait, ha szükséges, vagy naplózhatod a váltást.
  const { error } = await supabase
    .from('cars')
    .update({ user_id: user.id }) 
    .eq('id', carId);

  if (error) {
    return redirect(`/cars/new?found_car_id=${carId}&error=${encodeURIComponent('Hiba az átvételkor: ' + error.message)}`);
  }

  revalidatePath('/')
  redirect(`/cars/${carId}`) // Irány az autó adatlapja
}

// --- 3. FRISSÍTÉS ---
export async function updateCar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const carId = String(formData.get('car_id'))
  const imageFile = formData.get('image') as File;

  const vinRaw = formData.get('vin');
  const vin = vinRaw ? String(vinRaw).trim().toUpperCase() : '';

  if (!vin) {
    return redirect(`/cars/${carId}/edit?error=${encodeURIComponent('Az alvázszám (VIN) megadása kötelező!')}`);
  }

  const yearVal = parseNullableInt(formData.get('year'));
  const mileageVal = parseNullableInt(formData.get('mileage'));

  const updateData: any = {
    make: String(formData.get('make')),
    model: String(formData.get('model')),
    plate: String(formData.get('plate')).toUpperCase().replace(/\s/g, ''),
    year: yearVal,
    mileage: mileageVal,
    vin: vin,
    color: String(formData.get('color')),
    fuel_type: String(formData.get('fuel_type')),
    status: String(formData.get('status')),
    transmission: String(formData.get('transmission')),
    body_type: parseNullableString(formData.get('body_type')),
    power_hp: parseNullableInt(formData.get('power_hp')),
    engine_size: parseNullableInt(formData.get('engine_size')),
    mot_expiry: parseNullableString(formData.get('mot_expiry')),
    insurance_expiry: parseNullableString(formData.get('insurance_expiry')),
  }

  if (imageFile && imageFile.size > 0) {
    const fileName = `${user.id}/${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
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
    return redirect(`/cars/${carId}/edit?error=${encodeURIComponent('Hiba a frissítéskor: ' + error.message)}`)
  }

  revalidatePath('/')
  revalidatePath(`/cars/${carId}`)
  redirect(`/cars/${carId}`)
}

// --- 4. TÖRLÉS ---
export async function deleteCar(formData: FormData) {
  const supabase = await createClient()
  const carId = String(formData.get('id') || formData.get('car_id'))
  
  await supabase.from('events').delete().eq('car_id', carId)
  await supabase.from('service_reminders').delete().eq('car_id', carId)
  await supabase.from('trips').delete().eq('car_id', carId)

  const { error } = await supabase.from('cars').delete().eq('id', carId)

  if (error) console.error('Delete error:', error)

  revalidatePath('/')
  redirect('/')
}

// --- 5. LÁTHATÓSÁG ---
export async function toggleCarVisibility(carId: string, isPublic: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('cars')
    .update({ is_public_history: isPublic })
    .eq('id', carId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/cars/${carId}`)
  return { success: true }
}