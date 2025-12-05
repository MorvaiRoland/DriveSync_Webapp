'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from 'supabase/server'
import { headers } from 'next/headers'

// Segédfüggvény: email tisztítás
function sanitizeEmail(email: FormDataEntryValue | null): string {
  if (!email) return ''
  return String(email).toLowerCase().replace(/\s/g, '')
}

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = sanitizeEmail(formData.get('email'))
  const password = String(formData.get('password')).trim()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect(`/login?message=${encodeURIComponent('Hiba: ' + error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = sanitizeEmail(formData.get('email'))
  const password = String(formData.get('password')).trim()
  
  const origin = (await headers()).get('origin')

  if (!email || !email.includes('@')) {
    return redirect(`/login?message=${encodeURIComponent('Hiba: Érvénytelen email formátum')}`)
  }
  if (password.length < 6) {
    return redirect(`/login?message=${encodeURIComponent('Hiba: A jelszó túl rövid (min. 6 karakter)')}`)
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return redirect(`/login?message=${encodeURIComponent('Hiba: ' + error.message)}`)
  }

  return redirect('/login?message=Sikeres regisztráció! Jelentkezz be.')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
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

// --- EZ A FÜGGVÉNY HIÁNYZOTT EDDIG ---
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}