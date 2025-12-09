import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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

  const { data: { user }, error } = await supabase.auth.getUser()

  // 1. Ha a felhasználó be van jelentkezve, és a Login oldalon van -> Irány a Dashboard (/)
  if (user && !error && request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    const redirectResponse = NextResponse.redirect(url)
    copyCookies(response, redirectResponse)
    return redirectResponse
  }

  // 2. Ha NINCS bejelentkezve (vagy hiba van a tokennel)
  if (!user || error) {
    // ITT A JAVÍTÁS:
    // Hozzáadtuk a !request.nextUrl.pathname.startsWith('/update-password') feltételt.
    // Így ha a jelszó frissítő oldalon vagyunk, nem dob ki akkor sem, ha a session még nem 100%-os.
    if (
        !request.nextUrl.pathname.startsWith('/login') && 
        !request.nextUrl.pathname.startsWith('/auth') && 
        !request.nextUrl.pathname.startsWith('/update-password') && // <--- EZT ADD HOZZÁ!
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

function copyCookies(sourceResponse: NextResponse, targetResponse: NextResponse) {
    sourceResponse.cookies.getAll().forEach((cookie) => {
        targetResponse.cookies.set(cookie.name, cookie.value, {
            ...cookie
        })
    })
}