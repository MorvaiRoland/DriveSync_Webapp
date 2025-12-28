'use server'

import { createClient } from '@/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- 1. PROFIL FRISSÍTÉSE ---
export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    
    const fullName = String(formData.get('full_name'))
    const avatarPath = formData.get('avatar_path') as string | null
    const deleteAvatar = formData.get('delete_avatar') === 'true'

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return redirect('/login')

    let avatarUrlToSave: string | null = user.user_metadata?.avatar_url || null;

    if (deleteAvatar) {
        avatarUrlToSave = null;
    }

    if (avatarPath && avatarPath.length > 0) {
        const { data: { publicUrl } } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(avatarPath);
        
        avatarUrlToSave = publicUrl;
    }

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

// --- 4. FIÓK TÖRLÉSE (JAVÍTVA) ---
export async function deleteAccountAction() {
    const supabase = await createClient()
    
    // 1. Felhasználó ellenőrzése
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    // 2. Admin kliens inicializálása
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) return redirect(`/settings?error=${encodeURIComponent('Szerver konfigurációs hiba (Service Role)')}`)

    const supabaseAdmin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

    // Hibakezeléshez változó
    let errorMessage: string | null = null;

    try {
        // --- A. Autók leválasztása ---
        const { error: unlinkError } = await supabaseAdmin
            .from('cars') 
            .update({ user_id: null }) 
            .eq('user_id', user.id)

        // Redirect helyett hibát dobunk, hogy a catch elkapja
        if (unlinkError) throw new Error('Nem sikerült az autók leválasztása.')

        // --- B. Avatar kép törlése (Storage) ---
        if (user.user_metadata?.avatar_url) {
            try {
                const urlParts = user.user_metadata.avatar_url.split('/');
                const fileName = urlParts[urlParts.length - 1];
                if (fileName) await supabaseAdmin.storage.from('avatars').remove([fileName]);
            } catch (e) {
                console.warn("Avatar törlése nem sikerült, de folytatjuk.")
            }
        }

        // --- C. KAPCSOLÓDÓ TÁBLÁK TAKARÍTÁSA ---
        const tablesToCleanup = ['profiles', 'subscriptions', 'api_keys', 'direct_messages', 'friendships', 'group_members'];
        for (const table of tablesToCleanup) {
            // A delete hívásokat nem kell feltétlenül awaitelni blokkolóan, ha nem kritikus a hiba,
            // de a biztonság kedvéért itt megvárjuk.
            await supabaseAdmin.from(table).delete().eq('user_id', user.id);
            // Biztonsági ID alapú törlés (ha a tábla szerkezete olyan)
            if (table === 'profiles') {
                 await supabaseAdmin.from(table).delete().eq('id', user.id);
            }
        }

        // --- D. Felhasználó VÉGLEGES törlése ---
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
        if (deleteError) throw new Error(`Sikertelen felhasználó törlés: ${deleteError.message}`)

        // --- E. Kijelentkeztetés ---
        await supabase.auth.signOut()

    } catch (err: any) {
        console.error("Törlési hiba:", err);
        // Itt mentjük el a hibaüzenetet, de NEM redirectelünk még
        errorMessage = err.message || 'Váratlan hiba történt';
    }

    // --- REDIRECT ZÓNA (A try-catch blokkon kívül) ---
    
    // Ha volt hiba, visszaküldjük a settings oldalra
    if (errorMessage) {
        return redirect(`/settings?error=${encodeURIComponent(errorMessage)}`)
    }

    // Ha minden sikeres volt, mehet a login oldalra
    return redirect(`/login?message=${encodeURIComponent('A fiókod sikeresen törölve lett.')}`)
}