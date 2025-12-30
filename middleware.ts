// middleware.ts fájlban:

import { type NextRequest } from 'next/server'
import { updateSession } from '@/supabase/middleware' // Vagy ahol a fenti kód van

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Ez kizárja a statikus fájlokat, így a fenti logikának kevesebbet kell dolgoznia.
    // De a biztonság kedvéért a fenti kódban is benne hagytuk a védelmet (path.includes('.'), stb).
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}