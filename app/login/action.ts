'use server'

import { headers } from 'next/headers'
import { createClient } from 'supabase/server'
import { redirect } from 'next/navigation'

// Segédfüggvény a kód tisztábbá tételéhez
function encodedRedirect(path: string, message: string) {
  return redirect(`${path}?message=${encodeURIComponent(message)}`)
}

// --- 1. BELÉPÉS EMAIL CÍMMEL ---
export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return encodedRedirect('/login', 'Helytelen email vagy jelszó')
  }

  return redirect('/')
}

// --- 2. REGISZTRÁCIÓ ---
export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  const requestHeaders = await headers()
  const origin = requestHeaders.get('origin')
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error(error)
    return encodedRedirect('/login', 'Hiba történt a regisztráció során')
  }

  return encodedRedirect('/login', 'Sikeres regisztráció! Kérjük, erősítsd meg az email címedet.')
}

// --- 3. GOOGLE BELÉPÉS ---
export async function signInWithGoogle() {
  const supabase = await createClient()
  
  const requestHeaders = await headers()
  const origin = requestHeaders.get('origin')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error(error)
    return encodedRedirect('/login', 'Hiba a Google bejelentkezésnél')
  }

  if (data.url) {
    redirect(data.url)
  }
}

// --- 4. JELSZÓ VISSZAÁLLÍTÁS KÉRÉSE ---
export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  
  const requestHeaders = await headers()
  const origin = requestHeaders.get('origin')
  
  // Fontos: Élesben a 'origin' a https://dynamicsense.hu lesz.
  // Ha valamiért null, akkor fallback a környezeti változóra.
  const siteUrl = origin || process.env.NEXT_PUBLIC_SITE_URL || 'https://dynamicsense.hu'

  if (!email) {
    return encodedRedirect('/login', 'Email megadása kötelező')
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Dinamikusan az aktuális oldalra irányít vissza
    redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
  })

  if (error) {
    console.error('Reset error:', error.message)
    return encodedRedirect('/login', 'Hiba történt a kérés során')
  }

  return encodedRedirect('/login', 'Ha létezik a fiók, elküldtük a visszaállító linket.')
}
// --- 5. ÚJ JELSZÓ MENTÉSE ---
export async function updateNewPassword(formData: FormData) {
  const supabase = await createClient()
  
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return encodedRedirect('/update-password', 'Minden mező kitöltése kötelező')
  }

  if (password !== confirmPassword) {
    return encodedRedirect('/update-password', 'A két jelszó nem egyezik')
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    console.error('Update password error:', error)
    return encodedRedirect('/update-password', 'Nem sikerült módosítani a jelszót')
  }

  return encodedRedirect('/login', 'Jelszó sikeresen módosítva! Jelentkezz be.')
}

// --- 6. KIJELENTKEZÉS ---
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}