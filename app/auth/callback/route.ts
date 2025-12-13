// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Siker! Irány a jelszócsere oldal
      // Biztosítjuk, hogy a www.dynamicsense.hu-ra menjen
      const targetBase = origin.includes('localhost') ? origin : 'https://dynamicsense.hu'
      return NextResponse.redirect(`${targetBase}${next}`)
    } else {
        console.error('Auth error:', error)
    }
  }

  // Ha hiba van, akkor is engedjük rá a jelszócsere oldalra, de üzenettel
  // Ez azért fontos, mert néha a session létrejön, csak a kód beváltás dob hibát
  // De a legbiztosabb, ha újra kérjük a folyamatot
  return NextResponse.redirect(`${origin}/login?message=A biztonsági kód lejárt. Kérlek, kezd újra a folyamatot.`)
}