'use server'

import { createClient } from 'supabase/server' // Figyelj az elérési útra!
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
    
    // Checkboxok
    const isPublic = formData.get('is_public') === 'on'
    const hideServiceCosts = formData.get('hide_service_costs') === 'on'
    const hidePrices = formData.get('hide_prices') === 'on'
    
    // Extrák (JSON)
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

    // --- 3. KÉPEK FELTÖLTÉSE (ÚJ RÉSZ) ---
    const imageFiles = formData.getAll('images') as File[]
    const uploadedImageUrls: string[] = []
    const BUCKET_NAME = 'car-images' // Ennek léteznie kell a Supabase Storage-ban!

    // Csak akkor foglalkozunk vele, ha van valódi fájl (nem üres)
    if (imageFiles.length > 0 && imageFiles[0].size > 0) {
        for (const file of imageFiles) {
            // Egyedi fájlnév: carId + időbélyeg + tisztított eredeti név
            const fileExt = file.name.split('.').pop()
            const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '')
            const fileName = `${carId}/${Date.now()}-${cleanName}.${fileExt}`

            // Feltöltés a Storage-ba
            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(fileName, file)

            if (uploadError) {
                console.error('Kép feltöltési hiba:', uploadError)
                continue // Ha egy nem sikerül, a többit még megpróbáljuk
            }

            // Publikus URL lekérése
            const { data: { publicUrl } } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(fileName)

            uploadedImageUrls.push(publicUrl)
        }
    }

    // 4. ADATBÁZIS UPDATE ELŐKÉSZÍTÉSE
    // Először lekérjük a jelenlegi képeket, hogy hozzáfűzzük az újakat (nem felülírjuk)
    let finalImages: string[] = [...uploadedImageUrls]
    let finalMainImage = uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : undefined

    // Ha okosan akarjuk csinálni: lekérjük a régi képeket és összefűzzük
    if (uploadedImageUrls.length > 0) {
        const { data: currentCar } = await supabase
            .from('cars')
            .select('images, image_url')
            .eq('id', carId)
            .single()
        
        if (currentCar) {
            // Meglévő képek + Új képek
            const existingImages = currentCar.images || []
            finalImages = [...existingImages, ...uploadedImageUrls]
            
            // Ha eddig nem volt profilkép, de most töltöttünk fel, legyen az új az első
            if (!currentCar.image_url && uploadedImageUrls.length > 0) {
                finalMainImage = uploadedImageUrls[0]
            } else {
                // Egyébként megtartjuk a régit (vagy undefined, hogy ne írja felül az updateben)
                finalMainImage = undefined 
            }
        }
    }

    // Az update objektum összeállítása
    const updateData: any = {
        price: price,
        description: description,
        is_listed_on_marketplace: isPublic,
        contact_phone: contactPhone,
        location: location,
        features: features,
        hide_service_costs: hideServiceCosts,
        hide_prices: hidePrices,
        updated_at: new Date().toISOString() // Frissítés dátuma
    }

    // Csak akkor frissítjük a képeket az DB-ben, ha történt feltöltés
    if (uploadedImageUrls.length > 0) {
        updateData.images = finalImages
        // Ha nincs még fő kép, beállítjuk az elsőt
        if (finalMainImage) {
            updateData.image_url = finalMainImage
        }
    }

    // 5. Adatbázis frissítése
    const { error } = await supabase
        .from('cars')
        .update(updateData)
        .eq('id', carId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Hiba a mentés során:', error)
        return redirect(`/marketplace/sell/${carId}?error=Hiba történt a mentéskor`)
    }

    // 6. Cache frissítése és átirányítás
    revalidatePath('/marketplace')
    revalidatePath(`/marketplace/${carId}`)
    revalidatePath(`/marketplace/sell/${carId}`)
    
    if (isPublic) {
        return redirect('/marketplace')
    } else {
        return redirect('/marketplace/sell')
    }
}