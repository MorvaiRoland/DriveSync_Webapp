'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from 'supabase/server' // Vagy 'supabase/server' attól függően hol van a helper

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

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string // Ha van ilyen meződ

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

export async function signInWithGoogle() {
  const supabase = await createClient()
  
  // Fontos: A callback URL-t pontosan be kell állítani a Supabase Dashboard-on is!
  // Pl: https://te-projekted.vercel.app/auth/callback vagy http://localhost:3000/auth/callback
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return redirect('/login?message=Google bejelentkezés sikertelen')
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    
    revalidatePath('/', 'layout')
    redirect('/login')
}