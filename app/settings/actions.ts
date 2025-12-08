'use server'

import { createClient } from 'supabase/server' // Vagy 'supabase/server' attól függően hol van a helper
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const fullName = String(formData.get('fullName'))
  const phone = String(formData.get('phone'))

  // Ellenőrizzük, hogy van-e user, mielőtt update-elünk
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return redirect('/login')

  const { error } = await supabase.auth.updateUser({
    data: { 
        full_name: fullName,
        phone: phone 
    }
  })

  if (error) {
    console.error('Profile Update Error:', error)
    return redirect('/settings?error=Nem sikerült a profil frissítése')
  }

  revalidatePath('/settings')
  revalidatePath('/', 'layout') // Mindenhol frissüljön a név
  redirect('/settings?success=Profil sikeresen frissítve')
}

export async function updatePreferences(formData: FormData) {
  const supabase = await createClient()

  // A checkbox csak akkor küld értéket, ha be van pipálva ('on'), egyébként null
  const notifyEmail = formData.get('notify_email') === 'on'
  const notifyPush = formData.get('notify_push') === 'on'
  const theme = String(formData.get('theme'))

  // Lekérjük a jelenlegi metaadatokat, hogy ne írjuk felül a meglévőket (pl. full_name), 
  // hanem csak a settings objektumot update-eljük.
  // A Supabase updateUser 'data' mezője merge-el, de a biztonság kedvéért érdemes tudatosnak lenni.
  
  const { error } = await supabase.auth.updateUser({
    data: { 
        settings: {
            notify_email: notifyEmail,
            notify_push: notifyPush,
            theme: theme
        }
    }
  })

  if (error) {
    console.error('Preferences Error:', error)
    return redirect('/settings?error=Beállítások mentése sikertelen')
  }

  revalidatePath('/settings')
  redirect('/settings?success=Beállítások elmentve')
}

export async function signOutAction() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}