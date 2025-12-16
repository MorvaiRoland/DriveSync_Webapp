'use server'

import { createClient } from 'supabase/server' // Vagy 'supabase/server', ellenőrizd az útvonalat!
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function publishListing(formData: FormData) {
    const supabase = await createClient()
    
    // 1. Adatok kinyerése
    const carId = formData.get('car_id') as string
    
    // Ár kezelése
    const priceRaw = formData.get('price') as string
    const price = priceRaw ? parseInt(priceRaw) : null

    const description = formData.get('description') as string
    const contactPhone = formData.get('contact_phone') as string
    const location = formData.get('location') as string
    
    // Kapcsolók
    const isPublic = formData.get('is_public') === 'on'
    const hideServiceCosts = formData.get('hide_service_costs') === 'on'
    const hidePrices = formData.get('hide_prices') === 'on'
    
    // Extrák
    const featuresJson = formData.get('features') as string
    let features: string[] = []
    try { features = JSON.parse(featuresJson) } catch (e) { features = [] }

    // 2. Felhasználó ellenőrzése
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    // --- 3. KÉPEK KEZELÉSE ---
    // A kliens elküldte a végleges, szerkesztett listát (régiek + újak vegyesen)
    // Ez a "Single Source of Truth", tehát ezt mentjük el egy-az-egyben.
    const finalImagesJson = formData.get('final_images_json') as string
    let finalImages: string[] = []
    
    try {
        if (finalImagesJson) {
            finalImages = JSON.parse(finalImagesJson)
        }
    } catch (e) {
        console.error('Hiba a képek feldolgozásakor', e)
    }

    // Fő kép kiválasztása (mindig a lista legelső eleme legyen a fő kép)
    const mainImageUrl = finalImages.length > 0 ? finalImages[0] : null

    // Update objektum összeállítása
    const updateData: any = {
        price,
        description,
        is_listed_on_marketplace: isPublic,
        contact_phone: contactPhone,
        location,
        features,
        hide_service_costs: hideServiceCosts,
        hide_prices: hidePrices,
        updated_at: new Date().toISOString(),
        
        // ITT A LÉNYEG:
        // Felülírjuk az 'images' tömböt azzal, amit a kliens küldött.
        // Ha a kliensnél töröltek egy képet, az innen is hiányozni fog, tehát az adatbázisból is törlődik.
        images: finalImages,
        image_url: mainImageUrl 
    }

    // 4. Adatbázis frissítése
    const { error } = await supabase
        .from('cars')
        .update(updateData)
        .eq('id', carId)
        .eq('user_id', user.id) // Biztonság: Csak a saját autót szerkesztheti

    if (error) {
        console.error('Hiba a mentés során:', error)
        return redirect(`/marketplace/sell/${carId}?error=Hiba történt a mentéskor`)
    }

    // 5. Cache frissítése és átirányítás
    revalidatePath('/marketplace')
    revalidatePath(`/marketplace/${carId}`) // Publikus nézet frissítése
    revalidatePath(`/marketplace/sell/${carId}`) // Szerkesztő nézet frissítése
    
    if (isPublic) {
        return redirect('/marketplace')
    } else {
        return redirect('/marketplace/sell')
    }
}