// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Kezeljük a 'next' paramétert, ha jelszóvisszaállításból jön
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    
    // PKCE kód beváltása sessionre
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // SIKER: Átirányítás a kért oldalra (pl. /update-password)
      // Biztonsági ellenőrzés: csak relatív URL-re vagy a saját domainre irányítsunk
      const forwardedHost = request.headers.get('x-forwarded-host') // Vercel esetén fontos
      const isLocal = origin.includes('localhost')
      
      // Ha Vercelen vagyunk, biztosítjuk, hogy a HTTPS és a helyes domain legyen
      const baseUrl = isLocal ? origin : `https://${forwardedHost || 'www.drivesync-hungary.hu'}`
      
      console.log(`[Auth Callback] Siker. Redirect ide: ${baseUrl}${next}`)
      return NextResponse.redirect(`${baseUrl}${next}`)
    } else {
       console.error("[Auth Callback] Hiba:", error.message)
       // Részletesebb hibaüzenet a login oldalon
       return NextResponse.redirect(`${origin}/login?message=Auth Error: ${error.message}`)
    }
  }

  // Ha nincs kód
  return NextResponse.redirect(`${origin}/login?message=Hiányzó hitelesítési kód.`)
}