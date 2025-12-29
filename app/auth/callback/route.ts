import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // LOGOLÁS
  const nextParam = searchParams.get('next')
  console.log(`Callback futás. Code: ${code ? 'VAN' : 'NINCS'}, Next paraméter: ${nextParam}`)

  const next = nextParam ?? '/'

  if (code) {
    // 1. LÉPÉS: Sütik elérése
    const cookieStore = await cookies()

    // 2. LÉPÉS: Kliens létrehozása manuálisan, hogy lássa a sütiket
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // A Route Handlerben ez néha dobhat hibát, de a működést nem befolyásolja kritikusan
            }
          },
        },
      }
    )

    // 3. LÉPÉS: Kódcsere (Most már látja a verifier sütit!)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') 
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      let finalUrl = ''
      if (isLocalEnv) {
        finalUrl = `${origin}${next}`
      } else if (forwardedHost) {
        finalUrl = `https://${forwardedHost}${next}`
      } else {
        finalUrl = `${origin}${next}`
      }

      console.log(`Sikeres belépés, átirányítás ide: ${finalUrl}`)
      return NextResponse.redirect(finalUrl)
    } else {
      console.error('Auth code exchange error:', error)
    }
  }

  // Hiba esetén
  return NextResponse.redirect(`${origin}/login?message=Lejárt vagy érvénytelen link`)
}