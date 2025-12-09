import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'

export async function GET(request: NextRequest) {
  // Az URL felbontása
  const { searchParams, origin } = new URL(request.url)
  
  const code = searchParams.get('code') // OAuth (Google) és Email link kódja
  const next = searchParams.get('next') ?? '/' // Hova irányítson siker esetén (alap: /)

  // 1. ESET: "Code" alapú beváltás (Ez a leggyakoribb: Google Login és Email Confirm is ezt használja!)
  if (code) {
    const supabase = await createClient()
    
    // Ez a varázslat: A kódot átváltjuk sütire (session cookie)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Ha sikerült, irány a főoldal (vagy ahova indult)
      return NextResponse.redirect(`${origin}${next}`)
    } else {
        console.error("Auth Callback Hiba (Code Exchange):", error)
    }
  }

  // 2. ESET: "Token Hash" alapú beváltás (Ritkább, pl. jelszó visszaállításnál, magic linknél)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    } else {
        console.error("Auth Callback Hiba (Verify OTP):", error)
    }
  }

  // HA MINDEN KÖTÉL SZAKAD: Vissza a login oldalra hibaüzenettel
  return NextResponse.redirect(`${origin}/login?message=Hitelesítési hiba történt. Próbáld újra.`)
}