// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Megpróbáljuk kinyerni a 'next' paramétert, ha nincs, akkor alapértelmezett a '/'
  let next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    
    // Kód beváltása sessionre
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // TRÜKK: Ha véletlenül elveszett volna a 'next' paraméter, de tudjuk, 
      // hogy a felhasználó épp most állította vissza a jelszavát (mert belépett),
      // akkor érdemes ránézni, hova irányítjuk.
      
      // Ha a next '/' (kezdőlap), de a felhasználó most kattintott a reset linkre,
      // akkor lehet, hogy elnyelődött a paraméter. 
      // A biztonság kedvéért, ha a paraméterezés nem működne, 
      // itt manuálisan is átírhatod '/update-password'-re teszteléshez, 
      // de az alábbi kódnak működnie kell, ha az action.ts jól van beállítva.
      
      console.log(`Sikeres belépés, átirányítás ide: ${next}`)
      return NextResponse.redirect(`${origin}${next}`)
    } else {
        console.error("Auth hiba:", error)
    }
  }

  // Hiba esetén login oldal
  return NextResponse.redirect(`${origin}/login?message=Auth error`)
}