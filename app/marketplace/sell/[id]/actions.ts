'use server'

import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function publishListing(formData: FormData) {
    const supabase = await createClient()
    
    // 1. Adatok kinyerése a FormDatából
    const carId = formData.get('car_id') as string
    
    // Ár kezelése: ha üres string jön, akkor null legyen, egyébként szám
    const priceRaw = formData.get('price') as string
    const price = priceRaw ? parseInt(priceRaw) : null

    const description = formData.get('description') as string
    const contactPhone = formData.get('contact_phone') as string
    const location = formData.get('location') as string
    
    // Checkboxok kezelése (HTML form 'on'-t küld, ha be van pipálva)
    const isPublic = formData.get('is_public') === 'on'
    const hideServiceCosts = formData.get('hide_service_costs') === 'on' // ÚJ
    const hidePrices = formData.get('hide_prices') === 'on'             // ÚJ
    
    // Extrák (JSON) parsolása
    const featuresJson = formData.get('features') as string
    let features: string[] = []
    try {
        features = JSON.parse(featuresJson)
    } catch (e) {
        features = []
    }

    // 2. Felhasználó ellenőrzése
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    // 3. Adatbázis frissítés
    // MEGJEGYZÉS: A képek feltöltését (Supabase Storage) itt kellene kezelni,
    // de az egy különálló, nagyobb logikai blokk. Most az adatokat mentjük.
    const { error } = await supabase
        .from('cars')
        .update({
            price: price,
            description: description,
            is_listed_on_marketplace: isPublic,
            contact_phone: contactPhone,
            location: location,
            features: features,               // Felszereltség
            hide_service_costs: hideServiceCosts, // ÚJ: Szervizárak rejtése
            hide_prices: hidePrices           // ÚJ: Vételár rejtése (Megegyezés szerint)
        })
        .eq('id', carId)
        .eq('user_id', user.id) // Biztonsági ellenőrzés: Csak a saját autót

    if (error) {
        console.error('Hiba a mentés során:', error)
        return redirect(`/marketplace/sell/${carId}?error=Hiba történt a mentéskor`)
    }

    // 4. Cache frissítése (hogy a változások azonnal látszódjanak)
    revalidatePath('/marketplace')
    revalidatePath(`/marketplace/${carId}`)     // A publikus nézet
    revalidatePath(`/marketplace/sell/${carId}`) // A szerkesztő nézet
    
    // 5. Átirányítás
    if (isPublic) {
        // Ha publikálta, vigyük a piactérre, hogy lássa az eredményt
        return redirect('/marketplace')
    } else {
        // Ha csak mentette (piszkozat), vigyük vissza a választó oldalra
        return redirect('/marketplace/sell')
    }
}