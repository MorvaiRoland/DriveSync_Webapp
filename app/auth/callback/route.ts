// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Ha van "next" paraméter (jelszó resetnél "/update-password" lesz), oda irányít
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    
    // A kódot munkamenetre (session) cseréljük -> A user BEJELENTKEZIK
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Hiba esetén
  return NextResponse.redirect(`${origin}/login?message=Auth error`)
}