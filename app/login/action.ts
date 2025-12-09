'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/supabase/server'

// Segédfüggvény az URL meghatározásához (Localhost vs Production)
function getSiteUrl() {
  let url = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  // Vercel preview URL kezelés, ha szükséges
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
    console.error("Login hiba:", error.message)
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

  // Validáció
  if (!password || password.length < 6) {
      return redirect(`/login?message=${encodeURIComponent('A jelszónak legalább 6 karakternek kell lennie!')}`)
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      // Fontos: Callback URL beállítása
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
    },
  })

  if (error) {
    console.error("Signup hiba:", error.message)
    // Ha már létezik a user, a Supabase biztonsági okból nem mindig dob hibát, 
    // de ha igen, akkor kiírjuk.
    return redirect(`/login?message=${encodeURIComponent('Hiba: ' + error.message)}`)
  }

  // Siker ellenőrzése
  // Ha van session, akkor a "Confirm Email" ki van kapcsolva -> Azonnal belép
  if (data.session) {
    revalidatePath('/', 'layout')
    redirect('/')
  } 
  
  // Ha nincs session, de van user, akkor "Confirm Email" be van kapcsolva
  if (data.user && !data.session) {
    return redirect(`/login?message=${encodeURIComponent('Sikeres regisztráció! Ellenőrizd az email fiókodat a megerősítéshez.')}`)
  }

  // Fallback
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
    console.error("Google Auth hiba:", error.message)
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