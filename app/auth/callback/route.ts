import { createClient } from 'supabase/server' // Vagy ahol a server cliented van
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Ha sikeres a csere, a felhasználó be van lépve.
      // Továbbítjuk a 'next' paraméterre (esetedben: /update-password)
      const forwardedHost = request.headers.get('x-forwarded-host') // Load balancer támogatás
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Ha hiba volt, visszaküldjük a login oldalra hibaüzenettel
  return NextResponse.redirect(`${origin}/login?message=Lejárt vagy érvénytelen link`)
}