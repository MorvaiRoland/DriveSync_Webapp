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