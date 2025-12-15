import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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

  // 2. Supabase kliens inicializálása a cookie-k kezelésével
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

  // 3. Felhasználó lekérése (ez frissíti a tokent is ha kell)
  const { data: { user }, error } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname;

  // --- LOGIKA KEZDETE ---

  // A. Ha a felhasználó BE VAN JELENTKEZVE, és "auth" oldalakon van -> Irány a vezérlőpult
  if (user && !error) {
      if (path.startsWith('/login') || path.startsWith('/register')) {
        const url = request.nextUrl.clone()
        url.pathname = '/' // Vagy '/marketplace', attól függ mi a főoldalad
        const redirectResponse = NextResponse.redirect(url)
        copyCookies(response, redirectResponse)
        return redirectResponse
      }
  }

  // B. Ha a felhasználó NINCS BEJELENTKEZVE
  if (!user || error) {
    // Itt soroljuk fel azokat az oldalakat, amiket NEM védünk le.
    // Ha az útvonal NEM ezek valamelyike, akkor átirányítjuk a /login-ra.
    if (
        !path.startsWith('/login') && 
        !path.startsWith('/register') &&          // ÚJ: A regisztráció is nyilvános
        !path.startsWith('/auth') && 
        !path.startsWith('/update-password') && 
        !path.startsWith('/hirdetes') &&          // ÚJ: A publikus hirdetés nézet engedélyezése!
        path !== '/'                              // A főoldal (landing page) is nyilvános
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

// Segédfüggvény a cookie-k másolásához (Supabase SSR-hez szükséges)
function copyCookies(sourceResponse: NextResponse, targetResponse: NextResponse) {
    sourceResponse.cookies.getAll().forEach((cookie) => {
        targetResponse.cookies.set(cookie.name, cookie.value, {
            ...cookie
        })
    })
}