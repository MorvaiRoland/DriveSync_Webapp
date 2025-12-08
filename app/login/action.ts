'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from 'supabase/server' // Vagy 'supabase/server', ahogy nálad működik

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
    return redirect('/login?message=Helytelen email vagy jelszó')
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
    return redirect('/login?message=Sikertelen regisztráció')
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Ellenőrizd az email fiókodat a megerősítéshez')
}

// --- 3. GOOGLE LOGIN (PROFI VERZIÓ) ---
export async function signInWithGoogle() {
  const supabase = await createClient()
  
  // 1. Dinamikus URL meghatározása
  // - Ha van NEXT_PUBLIC_SITE_URL (pl. custom domain), azt használja.
  // - Ha nincs, de van VERCEL_URL (pl. drivesync.vercel.app), azt használja.
  // - Ha egyik sincs, marad a localhost.
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  // Biztonsági tisztítás: a végéről levágjuk a / jelet, ha van
  siteUrl = siteUrl.replace(/\/$/, '');

  const callbackUrl = `${siteUrl}/auth/callback`;

  console.log("🔗 Google Redirect ide fog történni:", callbackUrl);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        // Ez kritikus a "Refresh Token Not Found" hiba elkerüléséhez!
        access_type: 'offline', 
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error("Google Auth Hiba:", error);
    return redirect('/login?message=Google bejelentkezés sikertelen')
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