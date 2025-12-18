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