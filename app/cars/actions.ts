'use server'

import { createClient } from '@/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
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
  const vin = vinRaw ? String(vinRaw).trim().toUpperCase().replace(/\s/g, '') : '';

  // 1. Üresség ellenőrzése
  if (!vin) {
    return redirect(`/cars/new?error=${encodeURIComponent('Az alvázszám (VIN) megadása kötelező!')}`);
  }

  // 2. HOSSZ ELLENŐRZÉSE
  if (vin.length !== 17) {
    return redirect(`/cars/new?error=${encodeURIComponent(`Az alvázszámnak pontosan 17 karakternek kell lennie! (Jelenleg: ${vin.length})`)}`);
  }

  // 3. Érvénytelen karakterek ellenőrzése
  const invalidVinChars = /[^A-HJ-NPR-Z0-9]/;
  if (invalidVinChars.test(vin)) {
     return redirect(`/cars/new?error=${encodeURIComponent('Az alvázszám érvénytelen karaktereket tartalmaz (pl. I, O, Q nem megengedett)!')}`);
  }

  // --- TELJESÍTMÉNY ÁTVÁLTÁS LOGIKA ---
  const powerInput = parseNullableInt(formData.get('power')); // A beírt szám
  const powerUnit = formData.get('power_unit') as string;    // 'hp' vagy 'kw'
  
  let finalHp = powerInput;

  // Ha van érték és a mértékegység kW, átváltjuk LE-re (1 kW ~= 1.36 LE)
  if (powerInput && powerUnit === 'kw') {
      finalHp = Math.round(powerInput * 1.35962);
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
    power_hp: finalHp, // A már átváltott vagy eredeti LE érték

    // Dátumok és Kép
    mot_expiry: parseNullableString(formData.get('mot_expiry')),       
    insurance_expiry: parseNullableString(formData.get('insurance_expiry')), 
    image_url: parseNullableString(formData.get('image_url')), 
    
    // Egyéb alapértékek
    is_public_history: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('cars').insert(carData)

  if (error) {
    console.error('Adatbázis hiba:', error)

    // Ha a VIN már létezik
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

// --- 2. AUTÓ ÁTVÉTELE (CLAIM) ---
export async function claimCar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const carId = String(formData.get('car_id'));

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

  const { error } = await supabaseAdmin
    .from('cars')
    .update({ 
        user_id: user.id,
        updated_at: new Date().toISOString()
    }) 
    .eq('id', carId);

  if (error) {
    console.error("Claim error:", error);
    return redirect(`/cars/new?found_car_id=${carId}&error=${encodeURIComponent('Hiba az átvételkor: ' + error.message)}`);
  }

  revalidatePath('/', 'layout') 
  redirect(`/cars/${carId}`)
}

// --- 3. FRISSÍTÉS ---
export async function updateCar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const carId = String(formData.get('car_id'))
  
  const updateData: any = {
    make: String(formData.get('make')),
    model: String(formData.get('model')),
    plate: String(formData.get('plate')).toUpperCase().replace(/\s/g, ''),
    year: parseNullableInt(formData.get('year')),
    mileage: parseNullableInt(formData.get('mileage')),
    updated_at: new Date().toISOString(),
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