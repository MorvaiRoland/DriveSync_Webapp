import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // --- 1. KRITIKUS JAVÍTÁS: STATIKUS ÉS SEO FÁJLOK ÁTENGEDÉSE ---
  // Ha a kérés ezekre irányul, AZONNAL továbbengedjük.
  // Nem hozunk létre Supabase klienst, nem kérdezünk le user-t.
  // Ez oldja meg a Google Indexelési / Redirect hibát.
  if (
    path.startsWith('/_next') ||     // Next.js rendszerfájlok
    path.startsWith('/api') ||       // API hívások (ezeket máshol védjük ha kell)
    path.startsWith('/static') ||    // Statikus mappa
    path.includes('.') ||            // Bármi aminek kiterjesztése van (jpg, css, xml, ico)
    path === '/robots.txt' ||        // SEO
    path === '/sitemap.xml' ||       // SEO
    path === '/manifest.json' ||     // PWA
    path.startsWith('/auth/callback') // Supabase Auth callback
  ) {
    return NextResponse.next();
  }

  // --- 2. ALAP VÁLASZ ELŐKÉSZÍTÉSE ---
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

  // --- 3. SUPABASE KLIENS INICIALIZÁLÁSA ---
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

  // --- 4. FELHASZNÁLÓ LEKÉRÉSE ---
  // Fontos: a getUser biztonságosabb middleware-ben mint a getSession
  const { data: { user }, error } = await supabase.auth.getUser()

  // --- 5. LOGIKA ÉS ÁTIRÁNYÍTÁSOK ---

  // A. Ha a felhasználó BE VAN JELENTKEZVE
  if (user && !error) {
    // Ha bejelentkezve a login/register oldalra téved, visszaküldjük a főoldalra
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
    // Itt soroljuk fel azokat az útvonalakat, amik PUBLIKUSAK (bejelentkezés nélkül elérhetők).
    // Minden más útvonal átirányít a /login-ra.
    const isPublicRoute = 
        path === '/' || 
        path.startsWith('/login') || 
        path.startsWith('/register') || 
        path.startsWith('/auth') ||
        path.startsWith('/impressum') ||
        path.startsWith('/privacy') ||
        path.startsWith('/terms') || 
        path.startsWith('/update-password') || 
        path.startsWith('/hirdetes') ||
        path.startsWith('/szolgaltatasok'); // Ha van ilyen, add hozzá!

    if (!isPublicRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        // Opcionális: elmentheted, honnan jött, hogy login után visszairányítsd:
        // url.searchParams.set('next', path) 
        
        const redirectResponse = NextResponse.redirect(url)
        copyCookies(response, redirectResponse)
        return redirectResponse
    }
  }

  return response
}

// --- SEGÉDFÜGGVÉNY A COOKIE-K MÁSOLÁSÁHOZ ---
function copyCookies(sourceResponse: NextResponse, targetResponse: NextResponse) {
    sourceResponse.cookies.getAll().forEach((cookie) => {
        targetResponse.cookies.set(cookie.name, cookie.value, {
            ...cookie
        })
    })
}