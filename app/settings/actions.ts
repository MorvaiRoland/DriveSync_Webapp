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



export async function deleteAccountAction() {
    const supabase = await createClient()
    
    // 1. Felhasználó ellenőrzése
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    // 2. Admin kliens inicializálása (Kötelező a törléshez)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) return redirect(`/settings?error=${encodeURIComponent('Szerver konfigurációs hiba')}`)

    const supabaseAdmin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

    let errorMessage: string | null = null;

    try {
        // --- A. AUTÓK LEVÁLASZTÁSA (MENTÉS) ---
        // Átállítjuk a user_id-t NULL-ra.
        // Ha korábban nem futott le az SQL módosítás, itt hiba lenne, de a catch elkapná.
        const { error: carUnlinkError } = await supabaseAdmin
            .from('cars') 
            .update({ user_id: null }) 
            .eq('user_id', user.id)

        if (carUnlinkError) console.warn("Autó leválasztás warning:", carUnlinkError.message)

        // --- B. SZERVÍZEK LEVÁLASZTÁSA ---
        const { error: eventUnlinkError } = await supabaseAdmin
            .from('events')
            .update({ user_id: null })
            .eq('user_id', user.id)
        
        if (eventUnlinkError) console.warn("Events leválasztás warning:", eventUnlinkError.message)

        // --- C. STORAGE FÁJLOK TÖRLÉSE (EZ A HIBA OKA!) ---
        // Mivel SQL-ben nem engedte a CASCADE-ot, itt töröljük ki a metaadatokat.
        // Közvetlenül a storage sémából törlünk, hogy megszűnjön a hivatkozás.
        const { error: storageError } = await supabaseAdmin
            .schema('storage') // Fontos: átváltunk a storage sémára
            .from('objects')
            .delete()
            .eq('owner', user.id) // A fájl tulajdonosa a user

        if (storageError) {
            console.error("Storage tisztítási hiba:", storageError)
            // Nem állunk meg, megpróbáljuk a törlést így is, hátha nem volt fájlja.
        }

        // --- D. EGYÉB TÁBLÁK TAKARÍTÁSA ---
        // Ha az SQL-ben beállítottad a CASCADE-ot a profiles-ra, ez felesleges, de nem árt.
        const tablesToCleanup = ['subscriptions', 'api_keys', 'direct_messages', 'friendships', 'group_members'];
        for (const table of tablesToCleanup) {
            await supabaseAdmin.from(table).delete().eq('user_id', user.id);
        }
        // Profil külön (mert ott 'id' a kulcs, nem 'user_id')
        await supabaseAdmin.from('profiles').delete().eq('id', user.id);

        // --- E. VÉGLEGES TÖRLÉS ---
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
        
        if (deleteError) {
            console.error("Végleges törlési hiba:", deleteError);
            throw new Error(`Nem sikerült törölni a felhasználót. Ok: ${deleteError.message}`)
        }

        // --- F. Kijelentkeztetés ---
        await supabase.auth.signOut()

    } catch (err: any) {
        console.error("Kritikus hiba:", err);
        errorMessage = err.message || 'Váratlan hiba történt.';
    }

    // --- Redirect ---
    if (errorMessage) {
        return redirect(`/settings?error=${encodeURIComponent(errorMessage)}`)
    }

    return redirect(`/login?message=${encodeURIComponent('A fiókod törölve, az autók megmaradtak.')}`)
}