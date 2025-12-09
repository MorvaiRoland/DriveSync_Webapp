'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/supabase/server'

// --- 1. LOGIN ---
export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  console.log("🔑 Bejelentkezési kísérlet:", email);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("❌ Login Hiba:", error.message);
    // Hiba esetén visszaadjuk a konkrét hibaüzenetet (angolul jön a Supabase-től)
    return redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  console.log("✅ Sikeres bejelentkezés:", email);
  revalidatePath('/', 'layout')
  redirect('/')
}

// --- 2. SIGNUP (REGISZTRÁCIÓ) ---
export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string

  console.log("📝 Regisztrációs kísérlet:", { email, fullName, passwordLength: password?.length });

  // VALIDÁCIÓ: A Supabase alapból visszadobja, ha 6-nál rövidebb, de jobb előre szólni
  if (!password || password.length < 6) {
      console.log("⚠️ Jelszó túl rövid");
      return redirect(`/login?message=${encodeURIComponent('A jelszónak legalább 6 karakternek kell lennie!')}`)
  }

  // Meghatározzuk a visszatérési URL-t (Email megerősítéshez)
  const isLocal = process.env.NODE_ENV === 'development';
  const siteUrl = isLocal ? 'http://localhost:3000' : 'https://www.drivesync-hungary.hu';
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      // Ez fontos, hogy hova irányítson vissza a klikkelés után
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    console.error("❌ Signup Hiba (Supabase):", error);
    // Itt a trükk: Visszaküldjük a VALÓDI hibaüzenetet a frontendnek
    return redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  // Ha nincs hiba, megnézzük, létrejött-e a session (ha nem, akkor email megerősítés kell)
  if (data.user && !data.session) {
      console.log("✅ Regisztráció elindítva, email megerősítés szükséges.");
      return redirect(`/login?message=${encodeURIComponent('Sikeres regisztráció! Kérlek, erősítsd meg az email címedet a belépéshez.')}`)
  }

  console.log("✅ Sikeres regisztráció és automatikus belépés.");
  revalidatePath('/', 'layout')
  redirect('/')
}

// --- 3. GOOGLE LOGIN ---
export async function signInWithGoogle() {
  const supabase = await createClient()
  
  const isLocal = process.env.NODE_ENV === 'development';
  const siteUrl = isLocal ? 'http://localhost:3000' : 'https://www.drivesync-hungary.hu';

  const callbackUrl = `${siteUrl}/auth/callback`;

  console.log("🔗 Google Redirect indítása ide:", callbackUrl);

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
    console.error("❌ Google Auth Hiba:", error);
    return redirect(`/login?message=${encodeURIComponent('Google bejelentkezés sikertelen: ' + error.message)}`)
  }

  if (data.url) {
    redirect(data.url)
  }
}

// --- 4. SIGN OUT ---
export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    
    console.log("👋 Kijelentkezés");
    revalidatePath('/', 'layout')
    redirect('/login')
}