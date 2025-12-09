'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/supabase/server'

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
    return redirect(`/login?message=${encodeURIComponent('Helytelen email vagy jelszó: ' + error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

// --- 2. SIGNUP ---
export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string // Ha van ilyen meződ

  // Validáció
  if (!password || password.length < 6) {
      return redirect(`/login?message=${encodeURIComponent('A jelszónak legalább 6 karakternek kell lennie!')}`)
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName, // Opcionális
      },
      // Ha localhoston tesztelsz, ez localhost, élesben a domain
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return redirect(`/login?message=${encodeURIComponent('Hiba a regisztráció során: ' + error.message)}`)
  }

  // Ha a Supabase email megerősítést kér (alapértelmezett), akkor nem kapunk session-t.
  if (data.user && !data.session) {
      return redirect(`/login?message=${encodeURIComponent('Sikeres regisztráció! Ellenőrizd az email fiókodat a megerősítéshez.')}`)
  }

  // Ha nincs email megerősítés (kikapcsoltad a Supabase-en), akkor belépünk.
  revalidatePath('/', 'layout')
  redirect('/')
}

// --- 3. GOOGLE LOGIN ---
export async function signInWithGoogle() {
  const supabase = await createClient()
  
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const callbackUrl = `${siteUrl}/auth/callback`;

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
    return redirect(`/login?message=${encodeURIComponent('Google hiba: ' + error.message)}`)
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