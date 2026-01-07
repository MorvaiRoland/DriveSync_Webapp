import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  
  // ITT OLVASSUK KI A ROLE-T (amit az action.ts-ben küldtünk)
  const roleParam = searchParams.get('role')

  if (code) {
    const cookieStore = await cookies()

    // 1. Supabase kliens létrehozása
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
              // Server Component contextben ez néha hibát dobhat, de a Route Handlerben oké
            }
          },
        },
      }
    )

    // 2. Kód beváltása munkamenetre (login)
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      
      // 3. SZEREPKÖR KEZELÉSE GOOGLE LOGIN ESETÉN
      // Ha a URL-ben ott van, hogy role=dealer, akkor beállítjuk a usernek.
      if (roleParam === 'dealer') {
        const userId = data.user.id

        // A. Beírjuk a metaadatokba (hogy a Supabase Auth is tudja)
        await supabase.auth.updateUser({
          data: { role: 'dealer' }
        });

        // B. Beírjuk a public.users táblába (hogy az alkalmazásunk tudja)
        await supabase
          .from('users')
          .update({ role: 'dealer' })
          .eq('id', userId);
      }

      // 4. Átirányítás a megfelelő helyre (Dev vs Prod)
      const forwardedHost = request.headers.get('x-forwarded-host') 
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

  // Hiba esetén
  return NextResponse.redirect(`${origin}/login?message=Auth hiba`)
}