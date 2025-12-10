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

// --- 4. FIÓK TÖRLÉSE (JAVÍTOTT & STABIL) ---
export async function deleteAccountAction() {
  console.log("🔴 [DELETE] Fiók törlés indítása...")
  
  const supabase = await createClient()

  // 1. User azonosítása (Még bejelentkezve)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
      console.log("🔴 [DELETE] Nincs bejelentkezett user.")
      return redirect('/login')
  }

  const userId = user.id // Elmentjük az ID-t, mert mindjárt kilépünk
  console.log(`🟡 [DELETE] User ID mentve: ${userId}`)

  // 2. Admin kulcs ellenőrzése
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
      console.error("🔴 [DELETE] KRITIKUS HIBA: Nincs SUPABASE_SERVICE_ROLE_KEY!")
      return redirect('/settings?error=Szerver konfigurációs hiba.')
  }

  // 3. Admin kliens létrehozása (ez független a usertől)
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  )

  // 4. KRITIKUS LÉPÉS: Kijelentkeztetés
  // Előbb töröljük a sütiket, hogy a kliens oldal ne dobjon hibát (Application Error),
  // amikor a user törlése után próbálna revalidálni.
  await supabase.auth.signOut()
  console.log("🟢 [DELETE] Kliens sikeresen kijelentkeztetve.")

  let deleteError = null;

  try {
    // 5. Törlés végrehajtása az Admin API-val
    // Mivel az ID-t elmentettük (userId), tudjuk törölni session nélkül is.
    console.log(`🟡 [DELETE] Adatbázis törlés indítása (Admin)...`)
    
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (error) {
        deleteError = error;
        console.error("🔴 [DELETE] Hiba a deleteUser hívásnál:", error)
    } else {
        console.log("🟢 [DELETE] User és adatok sikeresen törölve.")
    }

  } catch (err) {
      console.error("🔴 [DELETE] Váratlan hiba:", err)
      // Itt már nem tudunk visszamenni a settings-be, mert ki vagyunk lépve
      return redirect('/login?message=Hiba történt a törlés közben, de ki lettél léptetve.')
  }

  // 6. Hibakezelés (ha az adatbázis törlés nem sikerült)
  if (deleteError) {
      // Mivel már ki van jelentkezve, a login oldalra küldjük a hibával
      return redirect(`/login?message=Fiók kijelentkeztetve, de a törlés nem sikerült (SQL hiba). Kérlek írj a supportnak.`)
  }

  // 7. Siker
  console.log("🟢 [DELETE] Folyamat kész. Átirányítás...")
  return redirect('/login?message=A fiókod és minden adatod véglegesen törölve.')
}