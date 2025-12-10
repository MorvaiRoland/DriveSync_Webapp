'use server'

import { createClient } from '@/supabase/server' // Vagy a te helpered
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
    return redirect('/settings?error=Nem sikerült a profil frissítése')
  }

  revalidatePath('/settings')
  revalidatePath('/', 'layout')
  return redirect('/settings?success=Profil sikeresen frissítve')
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
    return redirect('/settings?error=Beállítások mentése sikertelen')
  }

  revalidatePath('/settings')
  return redirect('/settings?success=Beállítások elmentve')
}

// --- 3. KIJELENTKEZÉS ---
export async function signOutAction() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return redirect('/login')
}

// --- 4. FIÓK TÖRLÉSE (JAVÍTOTT) ---
export async function deleteAccountAction() {
  console.log("🔴 [DELETE] Fiók törlés indítása...")
  
  const supabase = await createClient()

  // 1. User azonosítása
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
      console.log("🔴 [DELETE] Nincs bejelentkezett user.")
      return redirect('/login')
  }

  // 2. Admin kulcs ellenőrzése
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
      console.error("🔴 [DELETE] HIBA: Nincs SUPABASE_SERVICE_ROLE_KEY!")
      return redirect('/settings?error=Szerver konfigurációs hiba.')
  }

  // 3. Admin kliens
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  )

  let deleteError = null;

  try {
    // 4. Törlés végrehajtása
    console.log(`🟡 [DELETE] Törlés folyamatban: ${user.id}`)
    
    // Először töröljük az auth user-t. 
    // Ha az SQL CASCADE be van állítva, ez viszi a többi adatot is.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    
    if (error) {
        deleteError = error;
        console.error("🔴 [DELETE] Hiba a deleteUser hívásnál:", error)
    } else {
        console.log("🟢 [DELETE] User sikeresen törölve az adatbázisból.")
    }

  } catch (err) {
      console.error("🔴 [DELETE] Váratlan hiba:", err)
      return redirect('/settings?error=Váratlan rendszerhiba.')
  }

  // 5. Hiba ellenőrzés a try-catch után
  if (deleteError) {
      return redirect(`/settings?error=Törlési hiba: ${deleteError.message}`)
  }

  // 6. Kijelentkeztetés és Átirányítás (Ha minden sikerült)
  // Fontos: Itt már töröltük a usert, a signOut csak a sütiket takarítja
  await supabase.auth.signOut()
  
  console.log("🟢 [DELETE] Kész. Átirányítás...")
  return redirect('/login?message=Fiók sikeresen törölve.')
}