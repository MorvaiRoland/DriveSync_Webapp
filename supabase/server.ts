// utils/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
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
              cookieStore.set(name, value, {
                ...options,
                 // FONTOS: Ez segít, ha a www és a sima domain keveredik
                 // Ha localhoston vagy, ezt a domain sort vedd ki!
                 // Élesben: domain: '.drivesync-hungary.hu'
              })
            )
          } catch {
            // Server Actions környezetben a setAll néha hibát dobhat, de a művelet sikerül
          }
        },
      },
    }
  )
}