// app/actions.ts
'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'

export async function subscribeToWaitlist(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  
  // Egyszerű validáció
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Kérlek adj meg egy érvényes email címet.' }
  }

  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('waiting_list')
      .insert({ email })

    if (error) {
      if (error.code === '23505') { // Unique violation kódja
        return { success: false, message: 'Ez az email cím már feliratkozott!' }
      }
      return { success: false, message: 'Hiba történt. Próbáld újra később.' }
    }

    revalidatePath('/')
    return { success: true, message: 'Sikeresen feliratkoztál! Értesíteni fogunk.' }
    
  } catch (err) {
    return { success: false, message: 'Váratlan hiba történt.' }
  }
}
export async function getUpcomingRemindersForUI() {
  'use server'
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const today = new Date()
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(today.getDate() + 7) // A felületen szóljunk már 7 nappal előre is

  // Lekérjük a teendőket, amik:
  // 1. A felhasználóhoz tartoznak
  // 2. A határidő a következő 7 napban van (vagy már lejárt)
  // 3. MÉG NINCSENEK KÉSZ (nincs archiválva/törölve - ezt az adatbázis sémádtól függően finomíthatod)
  
  // Feltételezzük, hogy van egy 'completed' vagy hasonló státuszod, 
  // de ha nincs, akkor csak a dátumra szűrünk.
  
  const { data: reminders } = await supabase
    .from('service_reminders')
    .select('*, cars(make, model)')
    .eq('cars.user_id', user.id) // Csak a saját autók
    .lte('due_date', sevenDaysFromNow.toISOString().split('T')[0]) // Határidő <= Ma+7 nap
    // .eq('is_completed', false) // Ha van ilyen meződ, vedd ki a kommentet!
    .order('due_date', { ascending: true })

  // Mivel a cars.user_id-re szűrtünk, de a Supabase join-nál (select cars(...)) 
  // ez trükkös lehet RLS nélkül, inkább szűrjük JavaScriptben a biztonság kedvéért,
  // vagy bízzunk az RLS-ben (Row Level Security).
  
  // Ha a fenti .eq('cars.user_id') nem működne közvetlenül joinnal (Supabase verzió függő),
  // akkor az RLS úgyis csak a sajátokat adja vissza.

  return reminders || []
}

export async function logCurrentMileage(formData: FormData) {
  'use server' // Biztos ami biztos, bár a fájl tetején már ott van

  const supabase = await createClient()
  
  // 1. Authentikáció ellenőrzése
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Nincs bejelentkezve felhasználó." }
  }

  // 2. Adatok kinyerése a formból
  const car_id = formData.get('car_id') as string
  const current_mileage = parseInt(formData.get('current_mileage') as string)

  // 3. Alapvető validáció
  if (!car_id || isNaN(current_mileage) || current_mileage <= 0) {
    return { error: "Érvénytelen adatok (hiányzó autó vagy hibás km)." }
  }

  try {
    // 4. Lekérjük az autó jelenlegi adatait (km állás ellenőrzéshez)
    const { data: currentCar, error: fetchError } = await supabase
      .from('cars')
      .select('mileage, user_id') // user_id is kell a jogosultság ellenőrzéshez
      .eq('id', car_id)
      .single()

    if (fetchError || !currentCar) {
      return { error: "Nem található az autó vagy hiba az adatok lekérésekor." }
    }

    // 5. Jogosultság ellenőrzése (RLS általában kezeli, de extra védelem)
    if (currentCar.user_id !== user.id) {
       // Opcionális: Ha megosztott autókat is kezelni akarsz, itt bővíteni kell a logikát
       // De alapesetben csak a sajátját szerkesztheti
       return { error: "Nincs jogosultságod módosítani ezt az autót." }
    }

    // 6. LOGIKAI ELLENŐRZÉS: Nem lehet kevesebb az új érték
    if (current_mileage < currentCar.mileage) {
      return { 
        error: `A megadott érték (${current_mileage} km) nem lehet kevesebb, mint a jelenlegi óraállás (${currentCar.mileage} km)!` 
      }
    }

    // 7. Esemény beszúrása az 'events' táblába
    // Megjegyzés: Ha nincs 'notes' vagy 'description' oszlopod, töröld ki azt a sort!
    const { error: insertError } = await supabase.from('events').insert({
      car_id: car_id, 
      type: 'other', // Vagy 'mileage_log', ha van ilyen típusod
      title: 'Futás rögzítése', 
      event_date: new Date().toISOString(),
      mileage: current_mileage, 
      cost: 0, 
      description: 'Gyors rögzítés a főoldalról' // Ellenőrizd: notes vagy description az oszlop neve?
    })

    if (insertError) throw insertError

    // 8. Autó 'mileage' mezőjének frissítése a 'cars' táblában
    const { error: updateError } = await supabase
      .from('cars')
      .update({ mileage: current_mileage })
      .eq('id', car_id)

    if (updateError) throw updateError

    // 9. Cache frissítése, hogy a Dashboardon azonnal látszódjon
    revalidatePath('/')
    
    return { success: true, message: "Kilométeróra állás sikeresen frissítve!" }

  } catch (error: any) {
    console.error("Hiba a km rögzítésekor:", error)
    return { error: "Váratlan hiba történt a mentés során." }
  }
}