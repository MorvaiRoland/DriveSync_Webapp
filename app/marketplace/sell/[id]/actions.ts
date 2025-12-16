'use server'

import { createClient } from 'supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function publishListing(formData: FormData) {
    const supabase = await createClient()
    
    // 1. Adatok kinyerése
    const carId = formData.get('car_id') as string
    
    const priceRaw = formData.get('price') as string
    const price = priceRaw ? parseInt(priceRaw) : null

    const description = formData.get('description') as string
    const contactPhone = formData.get('contact_phone') as string
    const location = formData.get('location') as string
    
    const isPublic = formData.get('is_public') === 'on'
    const hideServiceCosts = formData.get('hide_service_costs') === 'on'
    const hidePrices = formData.get('hide_prices') === 'on'
    
    const featuresJson = formData.get('features') as string
    let features: string[] = []
    try { features = JSON.parse(featuresJson) } catch (e) { features = [] }

    // 2. Felhasználó ellenőrzése
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    // --- 3. KÉPEK KEZELÉSE (Már URL-ként jönnek a klienstől) ---
    // Itt a változás: Nem fájlokat, hanem JSON szöveget várunk az URL-ekkel
    const uploadedUrlsJson = formData.get('uploaded_image_urls') as string
    let newImageUrls: string[] = []
    
    try {
        if (uploadedUrlsJson) {
            newImageUrls = JSON.parse(uploadedUrlsJson)
        }
    } catch (e) {
        console.error('Hiba az URL-ek feldolgozásakor', e)
    }

    // Adatbázis update előkészítése (Meglévő képek + Újak összefűzése)
    // Alapértelmezésben csak az újakat vesszük
    let finalImages: string[] = [...newImageUrls]
    let finalMainImage: string | undefined = undefined

    // Ha töltöttek fel új képet, akkor le kell kérnünk a régieket, hogy ne töröljük ki őket
    if (newImageUrls.length > 0) {
        const { data: currentCar } = await supabase
            .from('cars')
            .select('images, image_url')
            .eq('id', carId)
            .single()
        
        if (currentCar) {
            const existingImages = currentCar.images || []
            // Összefűzzük a régieket az újakkal
            finalImages = [...existingImages, ...newImageUrls]
            
            // Ha eddig nem volt profilkép (image_url), akkor az első új kép legyen az
            if (!currentCar.image_url && newImageUrls.length > 0) {
                finalMainImage = newImageUrls[0]
            } else {
                // Ha már volt, nem bántjuk (undefined marad, így az update nem írja felül)
                finalMainImage = undefined 
            }
        } else {
            // Ha ez az első feltöltés és még nincs image_url
            finalMainImage = newImageUrls[0]
        }
    }

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
        updated_at: new Date().toISOString()
    }

    // Csak akkor frissítjük a képmezőket, ha érkezett új kép
    if (newImageUrls.length > 0) {
        updateData.images = finalImages // A teljes lista (régi + új)
        
        if (finalMainImage) {
            updateData.image_url = finalMainImage // Fő kép beállítása
        }
    }

    // 4. Adatbázis frissítése
    const { error } = await supabase
        .from('cars')
        .update(updateData)
        .eq('id', carId)
        .eq('user_id', user.id) // Biztonság: Csak a saját autót

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
        return redirect('/marketplace/sell')
    }
}