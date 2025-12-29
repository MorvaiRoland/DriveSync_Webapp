'use server'

import { createClient } from '@/supabase/server' // Vagy 'supabase/server', ellenőrizd az útvonalat!
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

    // --- JAVÍTÁS KEZDETE ---
    // Kiolvassuk, hogy a kliens küldött-e 'is_for_sale' jelet
    const isForSaleInput = formData.get('is_for_sale') === 'on'

    // A végső logikai döntés:
    // Ha publikus a piactéren (isPublic), akkor AUTOMATIKUSAN eladó is.
    // Ha nem publikus, akkor az input dönt (pl. piszkozatban eladó-e).
    const isForSale = isPublic || isForSaleInput
    // --- JAVÍTÁS VÉGE ---
    
    // Extrák
    const featuresJson = formData.get('features') as string
    let features: string[] = []
    try { features = JSON.parse(featuresJson) } catch (e) { features = [] }

    // 2. Felhasználó ellenőrzése
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    // --- 3. KÉPEK KEZELÉSE ---
    const finalImagesJson = formData.get('final_images_json') as string
    let finalImages: string[] = []
    
    try {
        if (finalImagesJson) {
            finalImages = JSON.parse(finalImagesJson)
        }
    } catch (e) {
        console.error('Hiba a képek feldolgozásakor', e)
    }

    // Fő kép kiválasztása
    const mainImageUrl = finalImages.length > 0 ? finalImages[0] : null

    // Update objektum összeállítása
    const updateData: any = {
        price,
        description,
        is_listed_on_marketplace: isPublic,
        is_for_sale: isForSale, // <--- EZ HIÁNYZOTT! Most már frissül az adatbázisban.
        contact_phone: contactPhone,
        location,
        features,
        hide_service_costs: hideServiceCosts,
        hide_prices: hidePrices,
        updated_at: new Date().toISOString(),
        
        images: finalImages,
        image_url: mainImageUrl 
    }

    // 4. Adatbázis frissítése
    const { error } = await supabase
        .from('cars')
        .update(updateData)
        .eq('id', carId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Hiba a mentés során:', error)
        return redirect(`/marketplace/sell/${carId}?error=Hiba történt a mentéskor`)
    }

    // 5. Cache frissítése és átirányítás
    revalidatePath('/marketplace')
    revalidatePath(`/marketplace/${carId}`)
    revalidatePath(`/marketplace/sell/${carId}`)
    
    if (isPublic) {
        return redirect('/marketplace')
    } else {
        // Ha csak piszkozat, visszavisszük a szerkesztőbe vagy a főoldalra
        return redirect('/cars/' + carId) 
    }
}