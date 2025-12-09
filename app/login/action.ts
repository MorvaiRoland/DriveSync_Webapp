// app/login/action.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/supabase/server'

// Segédfüggvény az URL meghatározásához
function getSiteUrl() {
  let url = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  if (process.env.VERCEL_URL) {
      url = `https://${process.env.VERCEL_URL}`;
  }
  return url.startsWith('http') ? url : `https://${url}`;
}

// --- 1. LOGIN ---
export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect(`/login?message=${encodeURIComponent('Helytelen email vagy jelszó')}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

// --- 2. SIGNUP ---
export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string

  if (!password || password.length < 6) {
      return redirect(`/login?message=${encodeURIComponent('A jelszónak legalább 6 karakternek kell lennie!')}`)
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
    },
  })

  if (error) {
    return redirect(`/login?message=${encodeURIComponent('Hiba: ' + error.message)}`)
  }

  if (data.session) {
    revalidatePath('/', 'layout')
    redirect('/')
  } 
  
  if (data.user && !data.session) {
    return redirect(`/login?message=${encodeURIComponent('Sikeres regisztráció! Ellenőrizd az email fiókodat a megerősítéshez.')}`)
  }

  return redirect(`/login?message=${encodeURIComponent('Valami hiba történt. Próbáld újra.')}`)
}

// --- 3. GOOGLE LOGIN ---
export async function signInWithGoogle() {
  const supabase = await createClient()
  const callbackUrl = `${getSiteUrl()}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    return redirect(`/login?message=${encodeURIComponent('Google bejelentkezés sikertelen')}`)
  }

  if (data.url) {
    redirect(data.url)
  }
}

// --- 4. SIGN OUT ---
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// --- 5. PASSWORD RESET (Email küldése) ---
export async function resetPassword(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string;

    if (!email) {
        return redirect(`/login?message=${encodeURIComponent('Kérlek, add meg az email címedet a jelszó visszaállításához.')}`);
    }

    const siteUrl = getSiteUrl();

    // Ez a kulcs: a "next" paraméter mondja meg, hova menjen a user a linkre kattintás után
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback?next=/update-password`, 
    });

    if (error) {
        console.error("Jelszó visszaállítási hiba:", error.message);
    }

    // Biztonsági okból mindig sikert jelzünk
    return redirect(`/login?message=${encodeURIComponent('Ha az email cím regisztrálva van, elküldtük a visszaállító linket.')}`);
}

// --- 6. UPDATE PASSWORD (Új jelszó mentése) ---
// Ez ÚJ, ez kell a folyamat végére!
export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
     return redirect(`/update-password?message=${encodeURIComponent('A két jelszó nem egyezik meg.')}`)
  }

  if (password.length < 6) {
    return redirect(`/update-password?message=${encodeURIComponent('A jelszónak legalább 6 karakternek kell lennie.')}`)
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return redirect(`/update-password?message=${encodeURIComponent('Hiba a jelszó frissítésekor: ' + error.message)}`)
  }

  return redirect('/login?message=Sikeres jelszócsere! Jelentkezz be az új jelszavaddal.')
}