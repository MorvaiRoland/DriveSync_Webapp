'use server'

import { createClient } from 'supabase/server'
import { redirect } from 'next/navigation'

export async function createListing(formData: FormData) {
  const supabase = await createClient()

  // Ellenőrizzük, hogy be van-e lépve a user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // Ha nincs belépve, visszadobjuk a login oldalra (vagy kezelheted máshogy)
    return { error: 'A hirdetés feladásához be kell jelentkezned.' }
  }

  // 1. Adatok kinyerése
  const make = formData.get('make') as string
  const model = formData.get('model') as string
  const year = parseInt(formData.get('year') as string)
  const mileage = parseInt(formData.get('mileage') as string)
  const fuel_type = formData.get('fuel_type') as string
  const plate = formData.get('plate') as string
  
  // Eladási adatok
  const price = parseInt(formData.get('price') as string)
  const location = formData.get('location') as string
  const seller_phone = formData.get('seller_phone') as string
  const description = formData.get('description') as string
  const exchange_possible = formData.get('exchange_possible') === 'on'

  // Token generálás (publikus linkhez)
  const shareToken = crypto.randomUUID()

  // 2. Mentés az adatbázisba
  // Figyeld meg: EGYSZERRE hozzuk létre az autót és állítjuk be eladónak
  const { data, error } = await supabase
    .from('cars')
    .insert({
      user_id: user.id,
      make,
      model,
      year,
      mileage,
      fuel_type,
      plate, // Rendszám kötelező az adatbázisban, de elrejthető
      
      // ELADÁSI BEÁLLÍTÁSOK (Azonnal aktív)
      is_for_sale: true,
      is_listed_on_marketplace: true,
      share_token: shareToken,
      
      // Részletek
      price,
      location,
      seller_phone,
      description,
      exchange_possible,
      
      // Alapértelmezett biztonsági beállítások
      hide_sensitive: true, // Automatikusan rejtjük a rendszámot biztonsági okból
      hide_prices: false
    })
    .select()
    .single()

  if (error) {
    console.error('Hiba a hirdetés feladásakor:', error)
    return { error: 'Adatbázis hiba történt. Kérlek próbáld újra.' }
  }

  // 3. Sikeres mentés után átirányítás a KÉSZ hirdetésre
  // Így a felhasználó azonnal látja az eredményt
  redirect(`/share/${shareToken}`)
}