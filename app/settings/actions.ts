'use server'

import { createClient } from '@/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- 1. PROFIL FRISSÍTÉSE (MÓDOSÍTVA) ---
export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    
    const fullName = String(formData.get('full_name'))
    // Itt a változás: nem fájlt várunk, hanem egy útvonalat (string)
    const avatarPath = formData.get('avatar_path') as string | null
    const deleteAvatar = formData.get('delete_avatar') === 'true'

    // User lekérése
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return redirect('/login')

    let avatarUrlToSave: string | null = user.user_metadata?.avatar_url || null;

    // --- 1. Kép törlése ---
    if (deleteAvatar) {
        avatarUrlToSave = null;
        // Opcionális: A régi képet törölhetnéd a storage-ból is itt admin klienssel, 
        // de az URL nullázása is elég a UI szempontjából.
    }

    // --- 2. Új kép beállítása (Ha érkezett útvonal a klienstől) ---
    if (avatarPath && avatarPath.length > 0) {
        // Lekérjük a publikus URL-t a feltöltött útvonal alapján
        const { data: { publicUrl } } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(avatarPath);
        
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

// ... (A fájl többi része - updatePreferences, signOutAction, deleteAccountAction - VÁLTOZATLAN marad) ...
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

export async function signOutAction() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return redirect('/login')
}

export async function deleteAccountAction() {
    const supabase = await createClient()
    
    // 1. Felhasználó ellenőrzése
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    // 2. Admin kliens inicializálása
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) return redirect(`/settings?error=${encodeURIComponent('Szerver konfigurációs hiba (Service Role)')}`)

    const supabaseAdmin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

    try {
        // --- A. Autók leválasztása ---
        const { error: unlinkError } = await supabaseAdmin
            .from('cars') 
            .update({ user_id: null }) 
            .eq('user_id', user.id)

        if (unlinkError) return redirect(`/settings?error=${encodeURIComponent('Nem sikerült az autók mentése.')}`)

        // --- B. Avatar kép törlése (Storage) ---
        if (user.user_metadata?.avatar_url) {
            try {
                const urlParts = user.user_metadata.avatar_url.split('/');
                const fileName = urlParts[urlParts.length - 1];
                if (fileName) await supabaseAdmin.storage.from('avatars').remove([fileName]);
            } catch (e) {
                console.warn("Avatar törlése nem sikerült.")
            }
        }

        // --- C. KAPCSOLÓDÓ TÁBLÁK TAKARÍTÁSA ---
        const tablesToCleanup = ['profiles', 'subscriptions', 'api_keys', 'direct_messages', 'friendships', 'group_members'];
        for (const table of tablesToCleanup) {
            await supabaseAdmin.from(table).delete().eq('user_id', user.id);
            await supabaseAdmin.from(table).delete().eq('id', user.id); // profiles esetén gyakran id=user_id
        }

        // --- D. Felhasználó VÉGLEGES törlése ---
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
        if (deleteError) return redirect(`/settings?error=${encodeURIComponent(`Sikertelen törlés: ${deleteError.message}`)}`)

        // --- E. Kijelentkeztetés ---
        await supabase.auth.signOut()

    } catch (err: any) {
        return redirect(`/settings?error=${encodeURIComponent(`Váratlan hiba: ${err.message}`)}`)
    }

    return redirect(`/login?message=${encodeURIComponent('A fiókod sikeresen törölve lett.')}`)
}