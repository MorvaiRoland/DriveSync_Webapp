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

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return redirect('/login')

  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName, phone: phone }
  })

  if (error) {
    // JAVÍTVA: encodeURIComponent
    return redirect(`/settings?error=${encodeURIComponent('Nem sikerült a profil frissítése')}`)
  }

  revalidatePath('/settings')
  revalidatePath('/', 'layout')
  
  // JAVÍTVA: encodeURIComponent
  return redirect(`/settings?success=${encodeURIComponent('Profil sikeresen frissítve')}`)
}

// --- 2. BEÁLLÍTÁSOK FRISSÍTÉSE ---
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
    // JAVÍTVA: encodeURIComponent
    return redirect(`/settings?error=${encodeURIComponent('Beállítások mentése sikertelen')}`)
  }

  revalidatePath('/settings')
  
  // JAVÍTVA: encodeURIComponent
  return redirect(`/settings?success=${encodeURIComponent('Beállítások elmentve')}`)
}

// --- 3. KIJELENTKEZÉS ---
export async function signOutAction() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return redirect('/login')
}

// --- 4. FIÓK TÖRLÉSE ---
export async function deleteAccountAction() {
  console.log("🔴 [DELETE] Fiók törlés indítása...")
  
  const supabase = await createClient()

  // 1. User azonosítása
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
      return redirect('/login')
  }

  const userId = user.id

  // 2. Admin kulcs ellenőrzése
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
      // JAVÍTVA: encodeURIComponent
      return redirect(`/settings?error=${encodeURIComponent('Szerver konfigurációs hiba')}`)
  }

  // 3. Admin kliens
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  )

  // 4. Kijelentkeztetés
  await supabase.auth.signOut()

  let deleteError = null;

  try {
    // 5. Törlés végrehajtása
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (error) {
        deleteError = error;
        console.error("🔴 [DELETE] Hiba:", error)
    }

  } catch (err) {
      console.error("🔴 [DELETE] Váratlan hiba:", err)
      // JAVÍTVA: encodeURIComponent
      return redirect(`/login?message=${encodeURIComponent('Hiba történt a törlés közben.')}`)
  }

  // 6. Hibakezelés
  if (deleteError) {
      // JAVÍTVA: encodeURIComponent
      return redirect(`/login?message=${encodeURIComponent('Fiók kijelentkeztetve, de a törlés sikertelen. Írj a supportnak.')}`)
  }

  // 7. Siker
  // JAVÍTVA: encodeURIComponent
  return redirect(`/login?message=${encodeURIComponent('A fiókod és minden adatod véglegesen törölve.')}`)
}