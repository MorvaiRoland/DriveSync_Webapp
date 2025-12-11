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

    // JAVÍTÁS: Explicit típusdeklaráció
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
    // Az avatarUrlToSave most már biztosan string vagy null, ami megfelel a Supabase-nek
    const { error: updateError } = await supabase.auth.updateUser({
        data: { 
            full_name: fullName, 
            avatar_url: avatarUrlToSave // Itt fogadja el a null-t is
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
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return redirect('/login')

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) return redirect(`/settings?error=${encodeURIComponent('Config hiba')}`)

    const supabaseAdmin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

    // Először kijelentkeztetjük a felhasználót
    await supabase.auth.signOut()

    // Majd töröljük az Admin klienssel, ami megkerüli a RLS-t
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    
    if (error) {
        return redirect(`/login?message=${encodeURIComponent('Hiba a törlésnél')}`)
    }

    return redirect(`/login?message=${encodeURIComponent('Fiók törölve')}`)
}