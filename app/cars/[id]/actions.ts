'use server'

import { createClient } from 'supabase/server' // Vagy 'supabase/server' - ellenőrizd az importodat!
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { render } from '@react-email/render'
import ServiceReminderEmail from '@/components/emails/ServiceReminderEmail'
import { randomBytes } from 'crypto'
import { v4 as uuidv4 } from 'uuid'

// --- ACCESS CONTROL HELPER ---

async function verifyCarAccess(supabase: any, carId: string, writeRequired: boolean = true) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: car } = await supabase
    .from('cars')
    .select('*, car_shares(email)')
    .eq('id', carId)
    .single()

  if (!car) return null

  const isOwner = car.user_id === user.id
  const isShared = car.car_shares?.some((share: any) => share.email === user.email)

  if (isOwner || isShared) {
    return { user, car }
  }

  if (writeRequired) {
    return null
  }

  const isPublic = car.is_public_history || (car.is_for_sale && car.is_listed_on_marketplace)
  if (isPublic) {
    return { user, car }
  }

  return null
}

// --- 1. ESEMÉNYEK KEZELÉSE ---

export async function addEvent(formData: FormData) {
  const supabase = await createClient()
  const car_id = String(formData.get('car_id'))
  
  const carAccess = await verifyCarAccess(supabase, car_id, true)
  if (!carAccess) return redirect('/login')
  const { user } = carAccess

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
  const carId = String(formData.get('car_id'))
  
  const carAccess = await verifyCarAccess(supabase, carId, true)
  if (!carAccess) return redirect('/login')

  const eventId = String(formData.get('event_id'))
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
  const carId = String(formData.get('car_id'))
  
  const carAccess = await verifyCarAccess(supabase, carId, true)
  if (!carAccess) return redirect('/login')

  const eventId = formData.get('event_id')
  await supabase.from('events').delete().eq('id', eventId)
  revalidatePath(`/cars/${carId}`)
}

// --- 2. EMLÉKEZTETŐK KEZELÉSE ---

export async function addReminder(formData: FormData) {
  const supabase = await createClient()
  const car_id = String(formData.get('car_id'))
  
  const carAccess = await verifyCarAccess(supabase, car_id, true)
  if (!carAccess) return redirect('/login')
  const { user } = carAccess
  
  const reminderData = {
    car_id: car_id,
    user_id: user.id,
    service_type: String(formData.get('service_type')),
    due_date: String(formData.get('due_date')),
    notify_email: formData.get('notify_email') === 'on',
    notify_push: formData.get('notify_push') === 'on',
    note: String(formData.get('note')),
    notification_sent: false,
    status: 'pending'
  }

  const { error } = await supabase.from('service_reminders').insert(reminderData)

  if (error) {
      console.error("Hiba az emlékeztető mentésekor:", error)
      return redirect(`/cars/${car_id}?error=Nem sikerült menteni: ${error.message}`)
  }

  revalidatePath(`/cars/${car_id}`)
  redirect(`/cars/${car_id}`)
}

export async function deleteReminder(formData: FormData) {
  const supabase = await createClient()
  const carId = String(formData.get('car_id'))
  
  const carAccess = await verifyCarAccess(supabase, carId, true)
  if (!carAccess) return redirect('/login')

  const id = formData.get('id')
  await supabase.from('service_reminders').delete().eq('id', id)
  revalidatePath(`/cars/${carId}`)
}

// --- 3. SZERVIZ SZÁMLÁLÓ ---

export async function resetServiceCounter(formData: FormData) {
    const supabase = await createClient()
    const carId = String(formData.get('car_id'))
    
    const carAccess = await verifyCarAccess(supabase, carId, true)
    if (!carAccess) return redirect('/login')
    
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
  const carId = String(formData.get('car_id'))
  
  const carAccess = await verifyCarAccess(supabase, carId, true)
  if (!carAccess) return redirect('/login')
  const { user } = carAccess
  
  // Segédfüggvény: Üres string esetén null-t ad vissza, egyébként számot
  const parseNullableInt = (key: string) => {
      const val = formData.get(key)
      if (!val || String(val).trim() === '') return null
      const num = parseInt(String(val))
      return isNaN(num) ? null : num
  }

  // Segédfüggvény: Üres string esetén null-t ad vissza (dátumokhoz, opcionális szövegekhez)
  const parseNullableString = (key: string) => {
      const val = formData.get(key)
      return (val && String(val).trim() !== '') ? String(val) : null
  }

  const status = String(formData.get('status') || formData.get('status_radio') || 'active');

  const updates: any = {
    // 1. Alapadatok
    make: String(formData.get('make')),
    model: String(formData.get('model')),
    plate: String(formData.get('plate')).toUpperCase().replace(/\s/g, ''),
    year: parseInt(String(formData.get('year'))),
    mileage: parseInt(String(formData.get('mileage'))),
    color: parseNullableString('color'),
    vin: parseNullableString('vin'),
    
    // 2. Technikai adatok (ÚJ MEZŐK)
    fuel_type: String(formData.get('fuel_type')),
    body_type: parseNullableString('body_type'),     // Kivitel
    transmission: String(formData.get('transmission')), // Váltó
    engine_size: parseNullableInt('engine_size'),    // cm3
    power_hp: parseNullableInt('power_hp'),          // LE

    // 3. Státusz és Beállítások
    status: status,
    service_interval_km: parseInt(String(formData.get('service_interval_km'))) || 15000,
    service_interval_days: parseInt(String(formData.get('service_interval_days'))) || 365,
    
    // 4. Okmányok
    mot_expiry: parseNullableString('mot_expiry'),
    insurance_expiry: parseNullableString('insurance_expiry'),
    
    // Frissítés ideje
    updated_at: new Date().toISOString()
  }

  // 5. Képfeltöltés (csak ha új kép lett kiválasztva)
  const imageFile = formData.get('image') as File;
  if (imageFile && imageFile.size > 0) {
    // Fájlnév tisztítás
    const cleanName = imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `${user.id}/${Date.now()}_${cleanName}`;
    
    const { error: uploadError } = await supabase.storage.from('car-images').upload(fileName, imageFile);
    
    if (uploadError) {
        console.error('Képfeltöltési hiba:', uploadError)
    } else {
        const { data } = supabase.storage.from('car-images').getPublicUrl(fileName);
        updates.image_url = data.publicUrl;
    }
  }

  const { error } = await supabase
    .from('cars')
    .update(updates)
    .eq('id', carId)

  if (error) {
    console.error('Autó frissítési hiba:', error)
    throw new Error('Nem sikerült menteni az adatbázisba')
  }

  revalidatePath(`/cars/${carId}`)
  revalidatePath('/') 
}

export async function deleteCar(formData: FormData) {
  const supabase = await createClient()
  const carId = String(formData.get('car_id'))
  
  const carAccess = await verifyCarAccess(supabase, carId, true)
  if (!carAccess) return redirect('/login')
  
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
  const carId = String(formData.get('car_id'))
  
  const carAccess = await verifyCarAccess(supabase, carId, true)
  if (!carAccess) return redirect('/login')
  const { user } = carAccess

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
  const carId = String(formData.get('car_id'))
  
  const carAccess = await verifyCarAccess(supabase, carId, true)
  if (!carAccess) return redirect('/login')

  const tireId = String(formData.get('tire_id'))
  await supabase.from('tires').delete().eq('id', tireId)
  revalidatePath(`/cars/${carId}`)
}

export async function swapTire(formData: FormData) {
  const supabase = await createClient()
  const carId = String(formData.get('car_id'))
  
  const carAccess = await verifyCarAccess(supabase, carId, true)
  if (!carAccess) return redirect('/login')
  const { car } = carAccess

  const newTireId = String(formData.get('tire_id')) 

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

// --- 6. ÚTNYILVÁNTARTÁS (TRIP LOGGER) - JAVÍTVA ÉS EGYESÍTVE ---

export async function addTrip(formData: FormData) {
  const supabase = await createClient()
  const car_id = String(formData.get('car_id'))
  
  const carAccess = await verifyCarAccess(supabase, car_id, true)
  if (!carAccess) return redirect('/login')
  const { user } = carAccess

  // Koordináták kinyerése
  const start_lat = formData.get('start_lat')
  const start_lng = formData.get('start_lng')
  const end_lat = formData.get('end_lat')
  const end_lng = formData.get('end_lng')

  // Segédfüggvény a null kezelésre
  const parseCoord = (val: any) => (val && val !== '' ? parseFloat(val) : null)

  const tripData = {
    user_id: user.id,
    car_id: car_id,
    start_location: String(formData.get('start_location')),
    end_location: String(formData.get('end_location')),
    distance: parseInt(String(formData.get('distance'))),
    purpose: String(formData.get('purpose')),
    trip_date: String(formData.get('trip_date')),
    notes: String(formData.get('notes') || ''),
    // ÚJ: Koordináták mentése
    start_lat: parseCoord(start_lat),
    start_lng: parseCoord(start_lng),
    end_lat: parseCoord(end_lat),
    end_lng: parseCoord(end_lng),
  }

  const { error } = await supabase.from('trips').insert(tripData)

  if (error) {
    console.error('Út mentési hiba:', error)
  }
  
  revalidatePath(`/cars/${car_id}/trips`)
}

export async function deleteTrip(formData: FormData) {
  const supabase = await createClient()
  const carId = String(formData.get('car_id'))
  
  const carAccess = await verifyCarAccess(supabase, carId, true)
  if (!carAccess) return redirect('/login')

  const tripId = String(formData.get('trip_id'))
  await supabase.from('trips').delete().eq('id', tripId)
  
  revalidatePath(`/cars/${carId}/trips`)
}

// --- 7. ALKATRÉSZEK & DOKUMENTUMOK ---

export async function addPart(formData: FormData) {
  const supabase = await createClient()
  const car_id = String(formData.get('car_id'))
  
  const carAccess = await verifyCarAccess(supabase, car_id, true)
  if (!carAccess) return redirect('/login')
  const { user } = carAccess
  
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
  const carId = String(formData.get('car_id'))
  
  const carAccess = await verifyCarAccess(supabase, carId, true)
  if (!carAccess) return redirect('/login')

  const partId = String(formData.get('part_id'))
  await supabase.from('parts').delete().eq('id', partId)
  
  revalidatePath(`/cars/${carId}/parts`)
}

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient()
  const carId = String(formData.get('car_id'))
  
  const carAccess = await verifyCarAccess(supabase, carId, true)
  if (!carAccess) throw new Error('Hozzáférés megtagadva')
  const { user } = carAccess

  // MÁR NEM FÁJLT VÁRUNK, HANEM ADATOKAT
  const name = formData.get('name') as string
  const filePath = formData.get('file_path') as string
  const fileType = formData.get('file_type') as string

  if (!filePath || !carId) {
    throw new Error('Hiányzó adatok')
  }

  // CSAK ADATBÁZIS MENTÉS TÖRTÉNIK
  const { error: dbError } = await supabase
    .from('car_documents')
    .insert({
      car_id: carId,
      user_id: user.id,
      name: name,
      file_path: filePath, // A kliens által megadott útvonal
      file_type: fileType
    })

  if (dbError) {
    console.error('Database error:', dbError)
    throw new Error('Hiba az adatbázis mentésekor')
  }

  revalidatePath(`/cars/${carId}`)
  return { success: true }
}

export async function deleteDocument(formData: FormData) {
  const supabase = await createClient()
  const carId = String(formData.get('car_id'))
  
  const carAccess = await verifyCarAccess(supabase, carId, true)
  if (!carAccess) throw new Error('Hozzáférés megtagadva')

  const docId = formData.get('doc_id') as string
  const filePath = formData.get('file_path') as string

  const { error: storageError } = await supabase.storage
    .from('car-documents')
    .remove([filePath])

  if (storageError) {
    console.error('Storage delete error:', storageError)
  }

  const { error: dbError } = await supabase
    .from('car_documents')
    .delete()
    .eq('id', docId)

  if (dbError) throw new Error('Hiba a törléskor')

  revalidatePath(`/cars/${carId}`)
}

export async function getDocumentUrl(filePath: string, shouldDownload: boolean = false) {
    const supabase = await createClient()
    
    const { data, error } = await supabase.storage
        .from('car-documents')
        .createSignedUrl(filePath, 3600, {
            download: shouldDownload ? true : undefined
        })

    if (error) {
        console.error("Hiba a link generálásakor:", error)
        return null
    }
    
    return data.signedUrl
}

// --- 8. ÉRTESÍTÉSEK KÜLDÉSE (CRON JOB) ---

export async function checkAndSendReminders() {
  // 'use server' // Ez itt felesleges, ha a fájl elején már ott van
  
  console.log("--- 🔍 EMLÉKEZTETŐ ELLENŐRZÉS INDUL ---");

  // 1. Normál kliens
  const supabase = await createClient()
  
  // 2. Admin kliens (user lekéréshez)
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ HIBA: Nincs SUPABASE_SERVICE_ROLE_KEY az .env fájlban!");
      return { count: 0, alerts: [] };
  }
  
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  if (!process.env.RESEND_API_KEY) {
      console.error("❌ HIBA: Nincs RESEND_API_KEY beállítva!");
      return { count: 0, alerts: [] };
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  const today = new Date()
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(today.getDate() + 3)
  
  console.log(`📅 Dátum ablak: ${today.toISOString().split('T')[0]} - ${threeDaysFromNow.toISOString().split('T')[0]}`);

  // Emlékeztetők keresése
  const { data: reminders, error } = await supabase
    .from('service_reminders')
    .select('*, cars(make, model, plate, user_id)')
    .eq('notification_sent', false)
    .lte('due_date', threeDaysFromNow.toISOString().split('T')[0]) 

  if (error) {
      console.error("❌ DB LEKÉRDEZÉSI HIBA:", error);
      return { count: 0, alerts: [] };
  }

  console.log(`✅ Talált emlékeztetők száma: ${reminders?.length || 0}`);

  if (!reminders || reminders.length === 0) {
      console.log("--- 🏁 NINCS TEENDŐ, LEÁLLÁS ---");
      return { count: 0, alerts: [] }
  }

  let emailCount = 0
  let pushAlerts: string[] = [] 

  for (const reminder of reminders) {
    console.log(`👉 Feldolgozás: ${reminder.id} - ${reminder.service_type}`);

    // A. EMAIL KÜLDÉS
    if (reminder.notify_email) {
      const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(reminder.user_id)
      
      if (userError) console.error("❌ Nem sikerült lekérni a usert:", userError);

      if (user?.email) {
        console.log(`📧 Email küldése ide: ${user.email}`);
        try {
            const emailHtml = await render(
              ServiceReminderEmail({
                userName: user.user_metadata?.full_name || 'Felhasználó',
                carMake: reminder.cars.make,
                carModel: reminder.cars.model,
                plate: reminder.cars.plate,
                serviceType: reminder.service_type,
                dueDate: reminder.due_date,
                note: reminder.note
              })
            );

            const { data, error } = await resend.emails.send({
              from: 'DynamicSense <onboarding@resend.dev>',
              to: [user.email], 
              subject: `🔔 Szerviz: ${reminder.cars.make} ${reminder.cars.model}`,
              html: emailHtml 
            })

            if (error) {
                console.error("❌ RESEND HIBA:", error);
            } else {
                console.log("✅ Email sikeresen elküldve!", data);
                emailCount++
            }

        } catch (err) {
            console.error("❌ VÉGZETES HIBA EMAILNÉL:", err);
        }
      } else {
          console.log("⚠️ Nincs user email cím!");
      }
    }

    // B. PUSH ÉRTESÍTÉS
    if (reminder.notify_push) {
      console.log("🔔 Push értesítés hozzáadva");
      pushAlerts.push(`${reminder.cars.make}: ${reminder.service_type}`)
    }

    // C. STÁTUSZ FRISSÍTÉS
    const { error: updateError } = await supabase
      .from('service_reminders')
      .update({ notification_sent: true })
      .eq('id', reminder.id)
    
    if (updateError) console.error("❌ Státusz frissítési hiba:", updateError);
  }

  console.log("--- ✅ KÉSZ ---");
  return { count: emailCount, alerts: pushAlerts }
}
export async function updateDealerInfo(formData: FormData) {
  const supabase = await createClient()
  const id = String(formData.get('id'))
  
  const carAccess = await verifyCarAccess(supabase, id, true)
  if (!carAccess) return { error: 'Hozzáférés megtagadva' }
  
  const price = formData.get('price') ? parseInt(formData.get('price') as string) : null
  const engine_details = formData.get('engine_details') as string
  const performance_hp = formData.get('performance_hp') ? parseInt(formData.get('performance_hp') as string) : null
  const transmission = formData.get('transmission') as string
  // Az extrák vesszővel elválasztva jönnek a formból, tömbbé alakítjuk
  const featuresString = formData.get('features') as string
  const features = featuresString ? featuresString.split(',').map(f => f.trim()).filter(f => f !== '') : []

  const { error } = await supabase
    .from('cars')
    .update({ 
      price, 
      engine_details, 
      performance_hp, 
      features,
      transmission 
    })
    .eq('id', id)

  if (error) {
    console.error('Hiba a mentéskor:', error)
    return { error: 'Sikertelen mentés' }
  }

  revalidatePath(`/cars/${id}`)
  revalidatePath(`/verify/${id}`) // A publikus oldalt is frissítjük
  return { success: true }
}

export async function addVignette(formData: FormData) {
  const supabase = await createClient()
  const car_id = String(formData.get('car_id'))
  
  const carAccess = await verifyCarAccess(supabase, car_id, true)
  if (!carAccess) return redirect('/login')
  
  const type = String(formData.get('type'))
  const region = formData.get('region') ? String(formData.get('region')) : null
  const valid_from = String(formData.get('valid_from'))
  const valid_to = String(formData.get('valid_to'))
  const price = parseInt(String(formData.get('price'))) || 0

  const { error } = await supabase.from('vignettes').insert({
    car_id,
    type,
    region,
    valid_from,
    valid_to,
    price
  })

  if (error) {
    console.error('Hiba a matrica mentésekor:', error)
  }

  revalidatePath(`/cars/${car_id}`)
}

// Matrica törlése
export async function deleteVignette(formData: FormData) {
  const supabase = await createClient()
  const car_id = String(formData.get('car_id'))
  
  const carAccess = await verifyCarAccess(supabase, car_id, true)
  if (!carAccess) return redirect('/login')

  const id = String(formData.get('id'))
  await supabase.from('vignettes').delete().eq('id', id)
  
  revalidatePath(`/cars/${car_id}`)
}

export async function toggleSaleMode(formData: FormData) {
  const supabase = await createClient()
  const carId = formData.get('car_id') as string
  
  const carAccess = await verifyCarAccess(supabase, carId, true)
  if (!carAccess) {
      return { success: false, error: 'Hozzáférés megtagadva' }
  }
  const { user } = carAccess
  
  // Boolean konverziók
  const enable = formData.get('enable') === 'true'
  const listedOnMarketplace = formData.get('listed_on_marketplace') === 'on'
  const hidePrices = formData.get('hide_prices') === 'on'
  const hideSensitive = formData.get('hide_sensitive') === 'on'
  const exchangePossible = formData.get('exchange_possible') === 'on'
  // ÚJ: Szervizköltségek elrejtése flag
  const hideServiceCosts = formData.get('hide_service_costs') === 'on'

  // Adatok
  const price = formData.get('price') ? parseInt(formData.get('price') as string) : null
  const sellerPhone = formData.get('seller_phone') as string
  const location = formData.get('location') as string
  const description = formData.get('description') as string

  // --- ÚJ: Képfeltöltés kezelése ---
  const imageFiles = formData.getAll('images') as File[]
  const newImageUrls: string[] = []

  // Ha vannak feltöltendő képek
  if (imageFiles && imageFiles.length > 0) {
    for (const file of imageFiles) {
        // Ellenőrizzük, hogy valódi fájl-e és van-e mérete
        if (file.size > 0 && file.name !== 'undefined') {
            const fileExt = file.name.split('.').pop()
            // Egyedi fájlnév generálás: user_id/car_id/timestamp_random.ext
            const fileName = `${user.id}/${carId}/sale_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
            
            // Feltöltés a 'car-images' bucket-be
            const { error: uploadError } = await supabase.storage
                .from('car-images')
                .upload(fileName, file)

            if (uploadError) {
                console.error('Képfeltöltési hiba:', uploadError)
                // Opcionális: itt megállíthatjuk a folyamatot, vagy csak logolunk
            } else {
                // Publikus URL lekérése
                const { data } = supabase.storage.from('car-images').getPublicUrl(fileName)
                newImageUrls.push(data.publicUrl)
            }
        }
    }
  }

  try {
    // 1. Lekérjük a jelenlegi autót
    const { data: currentCar } = await supabase
      .from('cars')
      .select('share_token, sale_images') // Lekérjük a meglévő képeket is
      .eq('id', carId)
      .single()
    
    // 2. Token generálás, ha nincs, DE eladóvá tesszük
    let shareToken = currentCar?.share_token
    if (enable && !shareToken) {
      shareToken = uuidv4()
    }

    // 3. Képek összefűzése: Meglévő képek + Új képek
    // Feltételezzük, hogy a 'sale_images' egy text[] oszlop az adatbázisban
    const existingImages = currentCar?.sale_images || []
    const updatedImages = [...existingImages, ...newImageUrls]

    // 4. Adatbázis frissítés
    const { error } = await supabase
      .from('cars')
      .update({
        is_for_sale: enable,
        share_token: shareToken,
        is_listed_on_marketplace: enable ? listedOnMarketplace : false,
        hide_prices: hidePrices,
        hide_sensitive: hideSensitive,
        hide_service_costs: hideServiceCosts, // ÚJ MEZŐ MENTÉSE
        exchange_possible: exchangePossible,
        price: price,
        seller_phone: sellerPhone,
        location: location,
        description: description,
        sale_images: updatedImages, // ÚJ: KÉPEK MENTÉSE
        updated_at: new Date().toISOString(),
      })
      .eq('id', carId)

    if (error) throw error

    // 5. Cache frissítés
    revalidatePath(`/cars/${carId}`)
    revalidatePath('/marketplace')
    revalidatePath('/') 

    return { success: true }
  } catch (error: any) {
    console.error('Mentési hiba:', error)
    return { success: false, error: error.message || 'Hiba történt a mentés során' }
  }
}

