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

    // 2. Admin kliens inicializálása
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) return redirect(`/settings?error=${encodeURIComponent('Szerver konfigurációs hiba (Service Role)')}`)

    const supabaseAdmin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

    try {
        console.log("--- TÖRLÉSI FOLYAMAT INDÍTÁSA ---", user.id)

        // --- A. Autók leválasztása (user_id NULL-ra állítása) ---
        // Ez azért kell, mert az autók megmaradnak, csak gazdátlanok lesznek
        const { error: unlinkError } = await supabaseAdmin
            .from('cars') 
            .update({ user_id: null }) 
            .eq('user_id', user.id)

        if (unlinkError) {
            console.error('Hiba az autók leválasztásakor:', unlinkError)
            return redirect(`/settings?error=${encodeURIComponent('Nem sikerült az autók mentése. Kérlek próbáld újra.')}`)
        }

        // --- B. Avatar kép törlése (Storage) ---
        if (user.user_metadata?.avatar_url) {
            try {
                const urlParts = user.user_metadata.avatar_url.split('/');
                const fileName = urlParts[urlParts.length - 1];
                if (fileName) await supabaseAdmin.storage.from('avatars').remove([fileName]);
            } catch (e) {
                console.warn("Avatar törlése nem sikerült (nem kritikus).")
            }
        }

        // --- C. KAPCSOLÓDÓ TÁBLÁK TAKARÍTÁSA (CRITICAL FIX) ---
        // A képeid alapján ezek a táblák hivatkozhatnak a userre.
        // Ha ezekből nem törlünk előbb, az auth.users törlése meg fog hiúsulni.
        const tablesToCleanup = [
            'profiles',       // Ez a leggyakoribb blokkoló
            'subscriptions',  // Ez is blokkolhat
            'api_keys',
            'direct_messages',
            'friendships',
            'group_members'
        ];

        for (const table of tablesToCleanup) {
            // Megpróbáljuk törölni 'user_id' alapján
            await supabaseAdmin.from(table).delete().eq('user_id', user.id);
            // Megpróbáljuk törölni 'id' alapján (pl. profiles táblánál gyakran az id = user.id)
            await supabaseAdmin.from(table).delete().eq('id', user.id);
        }

        // --- D. Felhasználó VÉGLEGES törlése az Auth rendszerből ---
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
        
        if (deleteError) {
            console.error('CRITICAL: User delete error:', deleteError)
            // Itt dobjuk vissza a hibát a UI-ra, hogy lásd mi a baj
            return redirect(`/settings?error=${encodeURIComponent(`Sikertelen törlés: ${deleteError.message}`)}`)
        }

        // --- E. Kijelentkeztetés (Csak ha a fentiek sikerültek) ---
        await supabase.auth.signOut()

    } catch (err: any) {
        console.error('Váratlan hiba:', err)
        return redirect(`/settings?error=${encodeURIComponent(`Váratlan hiba: ${err.message}`)}`)
    }

    // 6. Siker
    return redirect(`/login?message=${encodeURIComponent('A fiókod sikeresen törölve lett.')}`)
}