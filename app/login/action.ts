'use server'

import { headers } from 'next/headers'
import { createClient } from 'supabase/server' // Make sure this path is correct for your setup
import { redirect } from 'next/navigation'
import { getEarlyAccessConfig } from '@/utils/earlyAccessConfig'

// Helper function to cleaner code
function encodedRedirect(path: string, message: string) {
  return redirect(`${path}?message=${encodeURIComponent(message)}`)
}

// --- 1. LOGIN WITH EMAIL ---
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

// --- 2. SIGNUP ---
export async function signup(formData: FormData) {
  const supabase = await createClient()
  const requestHeaders = await headers()
  const origin = requestHeaders.get('origin')
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string // Read hidden field

  // Validate role for security
  const validRole = role === 'dealer' ? 'dealer' : 'user';

  // Server-side validation for password length
  if (password.length < 6) {
    return encodedRedirect('/login?mode=signup', 'A jelszónak legalább 6 karakternek kell lennie.')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        role: validRole, // Save to metadata
      },
    },
  })

  if (error) {
    console.error(error)
    // Handle weak password error from Supabase
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

// --- 3. GOOGLE SIGN-IN (FIXED) ---
// Now accepts formData to read the role
export async function signInWithGoogle(formData: FormData) {
  const supabase = await createClient()
  
  const requestHeaders = await headers()
  const origin = requestHeaders.get('origin')

  // Read role from form
  const role = (formData.get('role') as string) || 'user';
  const validRole = role === 'dealer' ? 'dealer' : 'user';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // FIX: Append role directly to the return URL!
      // This way when returning from Google, route.ts sees ?role=dealer parameter
      redirectTo: `${origin}/auth/callback?role=${validRole}`,
      
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
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

// --- 4. PASSWORD RESET REQUEST ---
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
  
  console.log("Sending to URL:", callbackUrl) // Debug log

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackUrl,
  })

  if (error) {
    console.error('Reset error:', error.message)
    return encodedRedirect('/login', 'Hiba történt a kérés során')
  }

  return encodedRedirect('/login', 'Ha létezik a fiók, elküldtük a visszaállító linket.')
}

// --- 5. SAVE NEW PASSWORD ---
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

// --- 6. SIGN OUT ---
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}