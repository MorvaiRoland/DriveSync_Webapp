import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Kezdeti válasz létrehozása
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

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 1. Beállítjuk a sütiket a kérésen (hogy a szerver komponensek lássák)
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          
          // 2. Beállítjuk a sütiket a válaszon (hogy a böngésző elmentse)
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

  // Felhasználó lekérése a token frissítéséhez
  const { data: { user }, error } = await supabase.auth.getUser()

  // --- JAVÍTOTT ÁTIRÁNYÍTÁSI LOGIKA ---

  // 1. Ha a felhasználó be van jelentkezve, és a Login oldalon van -> Irány a Dashboard (/)
  if (user && !error && request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    
    // FONTOS JAVÍTÁS: Nem sima redirectet küldünk, hanem átmásoljuk a frissített response sütijeit!
    // Így ha a getUser() frissítette a tokent, az nem vész el az átirányításkor.
    const redirectResponse = NextResponse.redirect(url)
    copyCookies(response, redirectResponse)
    return redirectResponse
  }

  // 2. Ha NINCS bejelentkezve (vagy hiba van a tokennel)
  if (!user || error) {
    // Ha védett oldalt próbál elérni (pl. /cars/...) -> Irány a /login
    // De a főoldalt (/) és a /login-t békén hagyjuk!
    if (
        !request.nextUrl.pathname.startsWith('/login') && 
        !request.nextUrl.pathname.startsWith('/auth') && 
        request.nextUrl.pathname !== '/'
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

// Segédfüggvény a sütik átmásolásához
function copyCookies(sourceResponse: NextResponse, targetResponse: NextResponse) {
    sourceResponse.cookies.getAll().forEach((cookie) => {
        targetResponse.cookies.set(cookie.name, cookie.value, {
            ...cookie
        })
    })
}