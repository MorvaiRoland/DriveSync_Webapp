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

// --- 1. ESEMÉNYEK KEZELÉSE ---

export async function addEvent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const car_id = formData.get('car_id')
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
  
  const eventId = String(formData.get('event_id'))
  const carId = String(formData.get('car_id'))
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
  const eventId = formData.get('event_id')
  const carId = formData.get('car_id')
  await supabase.from('events').delete().eq('id', eventId)
  revalidatePath(`/cars/${carId}`)
}

// --- 2. EMLÉKEZTETŐK KEZELÉSE ---

export async function addReminder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const car_id = formData.get('car_id')
  
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
  const id = formData.get('id')
  const carId = formData.get('car_id')
  await supabase.from('service_reminders').delete().eq('id', id)
  revalidatePath(`/cars/${carId}`)
}

// --- 3. SZERVIZ SZÁMLÁLÓ ---

export async function resetServiceCounter(formData: FormData) {
    const supabase = await createClient()
    const carId = String(formData.get('car_id'))
    
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
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return redirect('/login')

  const carId = String(formData.get('car_id'))
  
  const motExpiry = formData.get('mot_expiry');
  const insuranceExpiry = formData.get('insurance_expiry');
  const status = String(formData.get('status') || formData.get('status_radio') || 'active');

  const updates: any = {
    make: String(formData.get('make')),
    model: String(formData.get('model')),
    plate: String(formData.get('plate')).toUpperCase().replace(/\s/g, ''),
    year: parseInt(String(formData.get('year'))),
    mileage: parseInt(String(formData.get('mileage'))),
    fuel_type: String(formData.get('fuel_type')),
    color: String(formData.get('color')),
    vin: String(formData.get('vin')),
    status: status,
    service_interval_km: parseInt(String(formData.get('service_interval_km'))) || 15000,
    service_interval_days: parseInt(String(formData.get('service_interval_days'))) || 365,
    mot_expiry: motExpiry && motExpiry !== '' ? String(motExpiry) : null,
    insurance_expiry: insuranceExpiry && insuranceExpiry !== '' ? String(insuranceExpiry) : null,
  }

  const imageFile = formData.get('image') as File;
  if (imageFile && imageFile.size > 0) {
    const fileName = `${user.id}/${Date.now()}_${imageFile.name.replace(/\s/g, '_')}`;
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const carId = String(formData.get('car_id'))
  
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
  const tireId = String(formData.get('tire_id'))
  const carId = String(formData.get('car_id'))
  
  await supabase.from('tires').delete().eq('id', tireId)
  revalidatePath(`/cars/${carId}`)
}

export async function swapTire(formData: FormData) {
  const supabase = await createClient()
  const carId = String(formData.get('car_id'))
  const newTireId = String(formData.get('tire_id')) 
  
  const { data: car } = await supabase.from('cars').select('mileage').eq('id', carId).single()
  if (!car) return;

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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const car_id = String(formData.get('car_id'))
  
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
  const tripId = String(formData.get('trip_id'))
  const carId = String(formData.get('car_id'))
  
  await supabase.from('trips').delete().eq('id', tripId)
  
  revalidatePath(`/cars/${carId}/trips`)
}

// --- 7. ALKATRÉSZEK & DOKUMENTUMOK ---

export async function addPart(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const car_id = formData.get('car_id')
  
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
  const partId = String(formData.get('part_id'))
  const carId = String(formData.get('car_id'))
  
  await supabase.from('parts').delete().eq('id', partId)
  
  revalidatePath(`/cars/${carId}/parts`)
}

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient()

  const file = formData.get('file') as File
  const carId = formData.get('car_id') as string
  const label = formData.get('label') as string

  if (!file || !carId) {
    throw new Error('Hiányzó adatok')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nem vagy bejelentkezve')

  const fileExt = file.name.split('.').pop()
  const fileName = `${carId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
  
  const { error: uploadError } = await supabase.storage
    .from('car-documents')
    .upload(fileName, file)

  if (uploadError) {
    console.error('Upload error:', uploadError)
    throw new Error('Hiba a fájl feltöltésekor')
  }

  const { error: dbError } = await supabase
    .from('car_documents')
    .insert({
      car_id: carId,
      user_id: user.id,
      name: label || file.name,
      file_path: fileName,
      file_type: file.type
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
  const docId = formData.get('doc_id') as string
  const filePath = formData.get('file_path') as string
  const carId = formData.get('car_id') as string

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
  
  const id = formData.get('id') as string
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
    // Itt kezelheted a hibát (pl. throw)
  }

  revalidatePath(`/cars/${car_id}`)
}

// Matrica törlése
export async function deleteVignette(formData: FormData) {
  const supabase = await createClient()
  const id = String(formData.get('id'))
  const car_id = String(formData.get('car_id'))

  await supabase.from('vignettes').delete().eq('id', id)
  
  revalidatePath(`/cars/${car_id}`)
}

export async function toggleSaleMode(formData: FormData) {
  const carId = formData.get('car_id') as string
  const enable = formData.get('enable') === 'true'
  
  const hidePrices = formData.get('hide_prices') === 'on'
  const hideSensitive = formData.get('hide_sensitive') === 'on'
  const listedOnMarketplace = formData.get('listed_on_marketplace') === 'on'

  // Supabase kliens létrehozása
  const supabase = await createClient()

  try {
    // 1. Lekérjük a jelenlegi autót a token miatt
    const { data: currentCar } = await supabase
      .from('cars')
      .select('share_token')
      .eq('id', carId)
      .single()
    
    // 2. Token generálás, ha nincs
    let shareToken = currentCar?.share_token
    if (enable && !shareToken) {
      shareToken = uuidv4()
    }

    // 3. Adatbázis frissítés (Supabase update)
    const { error } = await supabase
      .from('cars')
      .update({
        is_for_sale: enable,
        share_token: shareToken,
        hide_prices: hidePrices,
        hide_sensitive: hideSensitive,
        // Ha kikapcsoljuk az eladást, levesszük a marketplace-ről is
        is_listed_on_marketplace: enable ? listedOnMarketplace : false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', carId)

    if (error) throw error

    // 4. Cache frissítés
    revalidatePath(`/cars/${carId}`)
    revalidatePath('/') 
    revalidatePath('/marketplace')

    return { success: true }
  } catch (error) {
    console.error('Supabase hiba:', error)
    return { success: false, error: 'Adatbázis hiba történt' }
  }
}