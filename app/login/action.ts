'use server'

import { headers } from 'next/headers'
import { createClient } from 'supabase/server'
import { redirect } from 'next/navigation'

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
    return redirect('/login?message=Helytelen email vagy jelszó')
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
    return redirect('/login?message=Hiba történt a regisztráció során')
  }

  return redirect('/login?message=Sikeres regisztráció! Kérjük, erősítsd meg az email címedet.')
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
    return redirect('/login?message=Hiba a Google bejelentkezésnél')
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
  
  const siteUrl = origin || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  if (!email) {
    return redirect('/login?message=Email megadása kötelező')
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
  })

  if (error) {
    console.error('Reset error:', error.message)
    return redirect('/login?message=Hiba történt a kérés során')
  }

  return redirect('/login?message=Ha létezik a fiók, elküldtük a visszaállító linket.')
}

// --- 5. ÚJ JELSZÓ MENTÉSE ---
export async function updateNewPassword(formData: FormData) {
  const supabase = await createClient()
  
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return redirect('/update-password?message=Minden mező kitöltése kötelező')
  }

  if (password !== confirmPassword) {
    return redirect('/update-password?message=A két jelszó nem egyezik')
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    console.error('Update password error:', error)
    return redirect('/update-password?message=Nem sikerült módosítani a jelszót')
  }

  return redirect('/login?message=Jelszó sikeresen módosítva! Jelentkezz be.')
}

// --- 6. KIJELENTKEZÉS (EZ HIÁNYZOTT) ---
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}