'use server'

import { createClient } from '@/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- 1. PROFIL FRISSÍTÉSE (KÉPFELTÖLTÉSSEL) ---
export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    
    const fullName = String(formData.get('full_name'))
    const avatarFile = formData.get('avatar_file') as File | null
    const currentAvatarUrl = formData.get('current_avatar_url') as string | undefined
    const deleteAvatar = formData.get('delete_avatar') === 'true'

    // User lekérése
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return redirect('/login')

    let avatarUrlToSave: string | null = null; 
    
    // Kezdő érték beállítása a rejtett mezőből (ha nem üres)
    if (currentAvatarUrl && currentAvatarUrl !== 'null' && currentAvatarUrl.length > 0) {
        avatarUrlToSave = currentAvatarUrl;
    }

    // --- 1. Kép törlése ---
    if (deleteAvatar) {
        avatarUrlToSave = null;
    }

    // --- 2. Új kép feltöltése (CSAK AKKOR, HA MÉRET > 0) ---
    if (avatarFile && avatarFile.size > 0) { 
        
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase
            .storage
            .from('avatars') 
            .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return redirect(`/settings?error=${encodeURIComponent('Képfeltöltés sikertelen')}`);
        }

        const { data: { publicUrl } } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(filePath);
        
        avatarUrlToSave = publicUrl;
    }

    // --- 3. Profil adatok mentése ---
    const { error: updateError } = await supabase.auth.updateUser({
        data: { 
            full_name: fullName, 
            avatar_url: avatarUrlToSave 
        }
    })

    if (updateError) {
        console.error("Profil update error:", updateError)
        return redirect(`/settings?error=${encodeURIComponent('Nem sikerült a profil frissítése')}`)
    }

    revalidatePath('/settings')
    revalidatePath('/', 'layout') 
    
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
        return redirect(`/settings?error=${encodeURIComponent('Hiba a mentéskor')}`)
    }

    revalidatePath('/settings')
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
    const supabase = await createClient()
    
    // 1. Felhasználó ellenőrzése
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    // 2. Admin kliens inicializálása (szükséges a törléshez és az RLS megkerüléséhez)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) return redirect(`/settings?error=${encodeURIComponent('Szerver konfigurációs hiba (Service Role)')}`)

    const supabaseAdmin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

    try {
        // 3. LÉNYEGES LÉPÉS: Az autók leválasztása a felhasználóról
        // Feltételezve, hogy futtattad az SQL parancsot: ALTER TABLE cars ALTER COLUMN user_id DROP NOT NULL;
        const { error: unlinkError } = await supabaseAdmin
            .from('cars') 
            .update({ user_id: null }) 
            .eq('user_id', user.id)

        if (unlinkError) {
            console.error('Hiba az autók leválasztásakor:', unlinkError)
            return redirect(`/settings?error=${encodeURIComponent('Nem sikerült az autók mentése törlés előtt. Kérjük próbáld újra.')}`)
        }

        // 4. Kijelentkeztetés
        await supabase.auth.signOut()

        // 5. Felhasználó végleges törlése az Auth rendszerből
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
        
        if (deleteError) {
            console.error('User delete error:', deleteError)
            return redirect(`/login?message=${encodeURIComponent('Hiba a törlésnél, kérjük vedd fel a kapcsolatot az ügyfélszolgálattal.')}`)
        }

    } catch (err) {
        console.error('Váratlan hiba:', err)
        return redirect(`/settings?error=${encodeURIComponent('Váratlan hiba történt.')}`)
    }

    // 6. Siker esetén átirányítás
    return redirect(`/login?message=${encodeURIComponent('A fiókod sikeresen törölve lett. Az autóid megmaradtak az adatbázisban.')}`)
}