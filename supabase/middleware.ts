import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // --- JAVÍTÁS KEZDETE ---
  // FONTOS: Ha a callback útvonalon vagyunk (jelszó reset vagy email megerősítés),
  // akkor NE futtassuk le a Supabase logikát a middleware-ben!
  // Hagyjuk, hogy a route handler (app/auth/callback/route.ts) végezze a dolgát.
  if (path.startsWith('/auth/callback')) {
    return NextResponse.next()
  }
  // --- JAVÍTÁS VÉGE ---

  // 1. Kezdeti válasz létrehozása
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseKey) {
    return response 
  }

  // 2. Supabase kliens inicializálása
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
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

  // 3. Felhasználó lekérése
  const { data: { user }, error } = await supabase.auth.getUser()

  // --- LOGIKA ---

  // A. Ha a felhasználó BE VAN JELENTKEZVE, és "auth" oldalakon van -> Irány a vezérlőpult
  if (user && !error) {
      if (path.startsWith('/login') || path.startsWith('/register')) {
        const url = request.nextUrl.clone()
        url.pathname = '/' 
        const redirectResponse = NextResponse.redirect(url)
        copyCookies(response, redirectResponse)
        return redirectResponse
      }
  }

  // B. Ha a felhasználó NINCS BEJELENTKEZVE
  if (!user || error) {
    if (
        !path.startsWith('/login') && 
        !path.startsWith('/register') && 
        !path.startsWith('/auth') && 
        !path.startsWith('/update-password') && 
        !path.startsWith('/hirdetes') && 
        path !== '/' 
    ) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        const redirectResponse = NextResponse.redirect(url)
        copyCookies(response, redirectResponse)
        return redirectResponse
    }
  }

  return response
}

// Segédfüggvény
function copyCookies(sourceResponse: NextResponse, targetResponse: NextResponse) {
    sourceResponse.cookies.getAll().forEach((cookie) => {
        targetResponse.cookies.set(cookie.name, cookie.value, {
            ...cookie
        })
    })
}