'use server'

import { headers } from 'next/headers'
import { createClient } from 'supabase/server'
import { redirect } from 'next/navigation'
import { getEarlyAccessConfig } from '@/utils/earlyAccessConfig'

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
  const role = formData.get('role') as string // Kiolvassuk a rejtett mezőt

  // Validáljuk a role-t biztonsági okból
  const validRole = role === 'dealer' ? 'dealer' : 'user';

  // Szerver oldali validáció a biztonság kedvéért (ha a kliens oldalt megkerülnék)
  if (password.length < 6) {
    return encodedRedirect('/login?mode=signup', 'A jelszónak legalább 6 karakternek kell lennie.')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        role: validRole, // Elmentjük a metaadatokba
      },
    },
  })

  if (error) {
    console.error(error)
    // Ha a Supabase dobja a gyenge jelszó hibát (pl. Weak Password)
    if (error.message.includes("Password") && error.message.includes("weak")) {
        return encodedRedirect('/login?mode=signup', 'A jelszó túl gyenge. Használj kis- és nagybetűt, számot és szimbólumot.')
    }
    return encodedRedirect('/login?mode=signup', 'Hiba történt a regisztráció során. Próbáld újra.')
  }

  // Early Access Pro logic (admin configurable)
  const { early_access_pro } = await getEarlyAccessConfig();
  const userId = data?.user?.id;
  if (early_access_pro && userId) {
    // Insert or upsert into subscriptions table
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      plan_type: 'pro',
      status: 'active',
    }, { onConflict: 'user_id' });
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
  
  const productionUrl = 'https://www.dynamicsense.hu' 
  
  const siteUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : productionUrl

  if (!email) {
    return encodedRedirect('/login', 'Email megadása kötelező')
  }

  const callbackUrl = `${siteUrl}/auth/callback?next=/update-password`
  
  console.log("Küldés erre az URL-re:", callbackUrl) // Debug log

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackUrl,
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
    if (error.message.includes("weak")) {
        return encodedRedirect('/update-password', 'A jelszó túl gyenge. Min. 6 karakter, vegyes karaktertípusok.')
    }
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