import { createClient } from 'supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // LOGOLÁS: Nézzük meg, mi érkezik a szerverre
  const nextParam = searchParams.get('next')
  console.log(`Callback futás. Code: ${code ? 'VAN' : 'NINCS'}, Next paraméter: ${nextParam}`)

  // Ha van next paraméter, azt használjuk, ha nincs, a főoldalt
  const next = nextParam ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // SIKERES BELÉPÉS
      
      const forwardedHost = request.headers.get('x-forwarded-host') 
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      // Összerakjuk a végleges URL-t
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

  // Ha hiba volt
  return NextResponse.redirect(`${origin}/login?message=Lejárt vagy érvénytelen link`)
}