'use server'

import { createClient } from '@/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- 1. PROFIL FRISSÍTÉSE ---
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
  revalidatePath('/', 'layout') // Mindenhol frissüljön a név a fejlécben is
  redirect('/settings?success=Profil sikeresen frissítve')
}

// --- 2. BEÁLLÍTÁSOK FRISSÍTÉSE ---
export async function updatePreferences(formData: FormData) {
  const supabase = await createClient()

  // A checkbox csak akkor küld értéket, ha be van pipálva ('on'), egyébként null
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
    console.error('Preferences Error:', error)
    return redirect('/settings?error=Beállítások mentése sikertelen')
  }

  revalidatePath('/settings')
  redirect('/settings?success=Beállítások elmentve')
}

// --- 3. KIJELENTKEZÉS ---
export async function signOutAction() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

// --- 4. FIÓK TÖRLÉSE (ÚJ) ---
export async function deleteAccountAction() {
  const supabase = await createClient()

  // 1. Lekérjük a jelenlegi felhasználót az ID miatt
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
      return redirect('/login')
  }

  // 2. Admin kliens a törléshez
  // FONTOS: Az .env fájlban legyen ott a SUPABASE_SERVICE_ROLE_KEY!
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 3. Először kijelentkeztetjük a klienst (hogy a sütik törlődjenek)
  await supabase.auth.signOut()

  // 4. Utána töröljük az adatbázisból (Admin joggal)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)

  if (error) {
    console.error('Delete Account Error:', error)
    // Ha hiba van, visszaküldjük a logint (mert már kijelentkeztettük), de hibaüzenettel
    return redirect('/login?message=Hiba a törlésnél. Kérlek írj a supportnak.')
  }

  // 5. Siker
  return redirect('/login?message=Fiók sikeresen törölve.')
}