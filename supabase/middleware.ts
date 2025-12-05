import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 1. Válasz inicializálása
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Supabase kliens létrehozása a sütik kezelésével
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Felhasználó lekérése (Ez frissíti a tokent is, ha szükséges)
  const { data: { user } } = await supabase.auth.getUser()

  // 4. VÉDELMI LOGIKA (Átirányítások)

  // A) Ha NINCS bejelentkezve, és védett oldalt próbál megnyitni
  // (Nem a loginon van és nem auth api hívás)
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // B) Ha BE VAN jelentkezve, és a Login oldalt próbálja megnyitni
  // (Felesleges újra belépni, irány a főoldal)
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return response
}