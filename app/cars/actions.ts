'use server'

import { createClient } from '@/supabase/server' // Ez a sima user kliens
import { createClient as createAdminClient } from '@supabase/supabase-js' // Ez kell az adminhoz
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





// --- 1. ÚJ AUTÓ LÉTREHOZÁSA (JAVÍTOTT) ---
export async function addCar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const vinRaw = formData.get('vin');
  const vin = vinRaw ? String(vinRaw).trim().toUpperCase() : '';

  if (!vin) {
    return redirect(`/cars/new?error=${encodeURIComponent('Az alvázszám (VIN) megadása kötelező!')}`);
  }

  const carData = {
    user_id: user.id,
    make: String(formData.get('make')),
    model: String(formData.get('model')),
    plate: String(formData.get('plate')).toUpperCase().replace(/\s/g, ''),
    vin: vin,
    year: parseNullableInt(formData.get('year')),
    mileage: parseNullableInt(formData.get('mileage')),
    
    // Specifikációk
    fuel_type: parseNullableString(formData.get('fuel_type')),
    transmission: parseNullableString(formData.get('transmission')),
    body_type: parseNullableString(formData.get('body_type')),
    color: parseNullableString(formData.get('color')),
    
    // Technikai adatok
    engine_size: parseNullableInt(formData.get('engine_size')),
    power_hp: parseNullableInt(formData.get('power_hp')),

    // --- ITT VOLT A HIÁNYZÓ RÉSZ: ---
    mot_expiry: parseNullableString(formData.get('mot_expiry')),       // Műszaki vizsga
    insurance_expiry: parseNullableString(formData.get('insurance_expiry')), // Biztosítás
    // -------------------------------
    
    // Egyéb alapértékek
    is_public_history: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('cars').insert(carData)

  if (error) {
    console.error('Adatbázis hiba:', error)

    if (error.code === '23505') {
      const { data: existingCar } = await supabase
        .from('cars')
        .select('id')
        .eq('vin', vin)
        .single();
      
      if (existingCar) {
        return redirect(`/cars/new?found_car_id=${existingCar.id}`);
      }
    }
    return redirect(`/cars/new?error=${encodeURIComponent('Sikertelen mentés: ' + error.message)}`)
  }
  
  revalidatePath('/')
  redirect('/')
}

// --- 2. AUTÓ ÁTVÉTELE (CLAIM) - JAVÍTOTT ---
export async function claimCar(formData: FormData) {
  // 1. Ellenőrizzük, hogy be van-e lépve a user (Standard kliens)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const carId = String(formData.get('car_id'));

  // 2. Létrehozunk egy ADMIN klienst a Service Role kulccsal
  // Ez MEGKERÜLI az RLS szabályokat, így átírhatjuk a tulajdonost
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // 3. Frissítés az ADMIN klienssel
  const { error } = await supabaseAdmin
    .from('cars')
    .update({ 
        user_id: user.id, // Az új tulajdonos ID-ja
        updated_at: new Date().toISOString()
    }) 
    .eq('id', carId);

  if (error) {
    console.error("Claim error:", error);
    return redirect(`/cars/new?found_car_id=${carId}&error=${encodeURIComponent('Hiba az átvételkor: ' + error.message)}`);
  }

  // Siker! Cache törlése és átirányítás
  revalidatePath('/', 'layout') 
  redirect(`/cars/${carId}`)
}

// --- 3. FRISSÍTÉS (Marad a régi, mert itt már a sajátodat szerkeszted) ---
export async function updateCar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const carId = String(formData.get('car_id'))
  // ... a többi kód változatlan ...
  
  // Csak a releváns részt másolom ide a rövidség kedvéért, a te kódod itt jó volt
  const updateData: any = {
    make: String(formData.get('make')),
    // ...
  }
  // ...
  
  const { error } = await supabase
    .from('cars')
    .update(updateData)
    .eq('id', carId)
    .eq('user_id', user.id) // Itt fontos az RLS, csak a sajátodat szerkesztheted

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