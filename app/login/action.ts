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
    // FONTOS: encodeURIComponent használata az ékezetes karakterek miatt!
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

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    // FONTOS: encodeURIComponent használata!
    return redirect(`/login?message=${encodeURIComponent('Sikertelen regisztráció')}`)
  }

  revalidatePath('/', 'layout')
  // FONTOS: encodeURIComponent használata!
  redirect(`/login?message=${encodeURIComponent('Ellenőrizd az email fiókodat a megerősítéshez')}`)
}

// --- 3. GOOGLE LOGIN ---
export async function signInWithGoogle() {
  const supabase = await createClient()
  
  const isLocal = process.env.NODE_ENV === 'development';
  const siteUrl = isLocal ? 'http://localhost:3000' : 'https://www.drivesync-hungary.hu';

  const callbackUrl = `${siteUrl}/auth/callback`;

  console.log("🔗 Google Redirect ide fog történni:", callbackUrl);

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
    console.error("Google Auth Hiba:", error);
    // FONTOS: encodeURIComponent használata!
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