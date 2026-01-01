'use server'

import { createClient } from '@/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- SEGÉDFÜGGVÉNYEK ---
const parseNullableInt = (val: FormDataEntryValue | null) => {
  const str = String(val);
  return str && str !== '' && str !== 'null' ? parseInt(str) : null;
}

const parseNullableString = (val: FormDataEntryValue | null) => {
  const str = String(val);
  return str && str !== '' && str !== 'null' ? str : null;
}

// --- VALIDÁCIÓS FÜGGVÉNY ---
function validateCarData(formData: FormData) {
    const currentYear = new Date().getFullYear();
    
    // *** MODIFIED: Set minimum year to 1900 ***
    const minYear = 1900; 
    
    // 1. Évjárat ellenőrzése (Year check)
    const year = parseNullableInt(formData.get('year'));
    if (year) {
        if (year < minYear || year > currentYear + 1) { // +1 year allowed for model years
            return `Az évjáratnak ${minYear} és ${currentYear + 1} között kell lennie!`;
        }
    }

    // 2. Futásteljesítmény ellenőrzése (Mileage check)
    const mileage = parseNullableInt(formData.get('mileage'));
    if (mileage !== null && mileage < 0) {
        return 'A kilométeróra állás nem lehet negatív!';
    }

    // 3. Motor adatok ellenőrzése (Engine data check)
    const engineSize = parseNullableInt(formData.get('engine_size'));
    if (engineSize !== null && engineSize < 0) {
        return 'A hengerűrtartalom nem lehet negatív!';
    }

    const powerInput = parseNullableInt(formData.get('power'));
    if (powerInput !== null && powerInput < 0) {
        return 'A teljesítmény nem lehet negatív!';
    }

    // 4. Dátumok ellenőrzése (Date check)
    // Here we can keep 1980 or change it to 1900 as well if you want really old MOT records,
    // but typically MOT/Insurance applies to current/recent times. 
    // I'll set this to 1980 as a reasonable cutoff for *validity* dates, but let me know if this needs to be 1900 too.
    const validateDate = (dateStr: string | null, fieldName: string) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null; 
        
        if (date.getFullYear() < 1980) {
            return `A ${fieldName} dátuma irreálisan régi (1980 előtti)!`;
        }
        return null;
    };

    const motError = validateDate(parseNullableString(formData.get('mot_expiry')), 'műszaki vizsga');
    if (motError) return motError;

    const insError = validateDate(parseNullableString(formData.get('insurance_expiry')), 'biztosítás');
    if (insError) return insError;

    return null; // No error
}


// --- 1. ÚJ AUTÓ LÉTREHOZÁSA ---
export async function addCar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // --- VALIDÁCIÓ FUTTATÁSA ---
  const validationError = validateCarData(formData);
  if (validationError) {
      return redirect(`/cars/new?error=${encodeURIComponent(validationError)}`);
  }

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
  const powerInput = parseNullableInt(formData.get('power')); 
  const powerUnit = formData.get('power_unit') as string;    
  
  let finalHp = powerInput;

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
    
    fuel_type: parseNullableString(formData.get('fuel_type')),
    transmission: parseNullableString(formData.get('transmission')),
    body_type: parseNullableString(formData.get('body_type')),
    color: parseNullableString(formData.get('color')),
    
    engine_size: parseNullableInt(formData.get('engine_size')),
    power_hp: finalHp, 

    mot_expiry: parseNullableString(formData.get('mot_expiry')),       
    insurance_expiry: parseNullableString(formData.get('insurance_expiry')), 
    image_url: parseNullableString(formData.get('image_url')), 
    
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

  // --- VALIDÁCIÓ FUTTATÁSA FRISSÍTÉSKOR IS ---
  const validationError = validateCarData(formData);
  if (validationError) {
      return redirect(`/cars/${carId}/edit?error=${encodeURIComponent(validationError)}`);
  }
  
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

export async function scanRegistrationDocument(formData: FormData) {
  const API_KEY = process.env.GOOGLE_API_KEY;

  if (!API_KEY) {
    return { error: 'Szerver konfigurációs hiba: Hiányzó API kulcs.' }
  }

  const file = formData.get('document') as File
  if (!file) return { error: 'Nincs kép feltöltve.' }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = buffer.toString('base64')

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // FRISSÍTETT PROMPT A VÁLTÓ KÓDHOZ
    const prompt = `
      Analyze this Hungarian Vehicle Registration Certificate (Forgalmi engedély).
      Extract the data based on the standard codes.
      
      Look specifically for "SEBESSÉGVÁLTÓ FAJTÁJA (KÓDSZÁMA)" usually found on the back side or near section 11/12.
      The code is a single digit: 0=mechanical, 1=semiautomatic, 2=automatic, 3=sequential.

      Return a JSON object with these exact keys (use null if not found):
      - plate: Field 'A' (Rendszám) - Remove hyphens/spaces.
      - make: Field 'D.1' (Gyártmány).
      - model: Field 'D.2' or 'D.3' (Típus/Kereskedelmi név).
      - vin: Field 'E' (Alvázszám).
      - year: Extract the Year part from Field 'B' or 'I'.
      - power_kw: Field 'P.2' (Teljesítmény kW-ban) - Number only.
      - engine_size: Field 'P.1' (Hengerűrtartalom) - Number only.
      - fuel_type: Field 'P.3' (Hajtóanyag). Map to: "Benzin", "Dízel", "Hibrid", "Elektromos", "LPG / Gáz".
      - color: Field 'R' (Szín).
      - transmission_code: The number (0, 1, 2, or 3) for the transmission type.

      IMPORTANT: Return ONLY valid JSON, no markdown formatting.
    `;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: file.type,
      },
    };
    
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    let jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
    }

    const data = JSON.parse(jsonString);
    console.log("🚗 Forgalmi AI Adatok:", data);

    return { success: true, data }

  } catch (error: any) {
    console.error("❌ AI Hiba:", error.message);
    return { error: 'Nem sikerült beolvasni a dokumentumot.' }
  }
}