'use server'

import { createClient } from 'supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const fullName = String(formData.get('fullName'))
  const phone = String(formData.get('phone'))

  const { error } = await supabase.auth.updateUser({
    data: { 
        full_name: fullName,
        phone: phone 
    }
  })

  if (error) {
    return redirect('/settings?error=Nem sikerült a profil frissítése')
  }

  revalidatePath('/settings')
  revalidatePath('/') // A főoldali üdvözlés miatt
  redirect('/settings?success=Profil sikeresen frissítve')
}

export async function updatePreferences(formData: FormData) {
  const supabase = await createClient()

  const notifyEmail = formData.get('notify_email') === 'on'
  const notifyPush = formData.get('notify_push') === 'on'
  const theme = String(formData.get('theme'))

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