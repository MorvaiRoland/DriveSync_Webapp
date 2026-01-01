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
    // A Gemini 1.5 Pro vagy Flash modell jobb szövegfelismerésben
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Analyze this Hungarian Vehicle Registration Certificate (Forgalmi engedély).
      Extract the data based on the standard codes (A, B, D.1, etc.) visible on the document.
      
      Return a JSON object with these exact keys (use null if not found):
      - plate: Field 'A' (Rendszám) - Remove hyphens/spaces.
      - make: Field 'D.1' (Gyártmány).
      - model: Field 'D.2' or 'D.3' (Típus/Kereskedelmi név).
      - vin: Field 'E' (Alvázszám).
      - year: Extract the Year part from Field 'B' (Első nyilvántartásba vétel) or 'I'.
      - power_kw: Field 'P.2' (Teljesítmény kW-ban) - Number only.
      - engine_size: Field 'P.1' (Hengerűrtartalom) - Number only.
      - fuel_type: Field 'P.3' (Hajtóanyag). Map to: "Benzin", "Dízel", "Hibrid", "Elektromos", "LPG / Gáz".
      - color: Field 'R' (Szín).
      - mass: Field 'G' (Saját tömeg) - optional.

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

    // JSON tisztítása (ha a modell véletlenül markdown-t küldene)
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