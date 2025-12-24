'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Segédfüggvények
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

  const vinRaw = formData.get('vin');
  const vin = vinRaw ? String(vinRaw).trim().toUpperCase() : '';

  if (!vin) {
    return redirect(`/cars/new?error=${encodeURIComponent('Az alvázszám (VIN) megadása kötelező!')}`);
  }

  const yearVal = formData.get('year');
  const mileageVal = formData.get('mileage');
  const year = yearVal ? parseInt(String(yearVal)) : 0;
  const mileage = mileageVal ? parseInt(String(mileageVal)) : 0;

  if (!year || !mileage) {
     return redirect(`/cars/new?error=${encodeURIComponent('Az évjárat és a kilométeróra állás kötelező!')}`);
  }

  // Insert logika
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
    mileage: mileage,
    fuel_type: parseNullableString(formData.get('fuel_type')), 
    transmission: parseNullableString(formData.get('transmission')),
    power_hp: parseNullableInt(formData.get('power_hp')),
    engine_size: parseNullableInt(formData.get('engine_size')),
  })

  // --- DUPLIKÁCIÓ KEZELÉSE ---
  if (error) {
    console.error('Adatbázis hiba:', error)

    // HA MÁR LÉTEZIK AZ ALVÁZSZÁM (Unique Violation)
    if (error.code === '23505') {
      const { data: existingCar } = await supabase
        .from('cars')
        .select('id')
        .eq('vin', vin)
        .single();
      
      if (existingCar) {
        // Visszairányítunk, és az URL-be tesszük a megtalált ID-t
        return redirect(`/cars/new?found_car_id=${existingCar.id}`);
      }
    }

    return redirect(`/cars/new?error=${encodeURIComponent('Sikertelen mentés: ' + error.message)}`)
  }
  
  revalidatePath('/')
  redirect('/')
}

// --- AUTÓ ÁTVÉTELE (CLAIM) ---
export async function claimCar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const carId = String(formData.get('car_id'));

  // Átírjuk a tulajdonost a jelenlegi userre
  const { error } = await supabase
    .from('cars')
    .update({ user_id: user.id })
    .eq('id', carId);

  if (error) {
    return redirect(`/cars/new?error=${encodeURIComponent('Hiba az autó hozzáadásakor: ' + error.message)}`);
  }

  revalidatePath('/')
  redirect(`/cars/${carId}`)
}