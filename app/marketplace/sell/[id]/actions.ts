// app/marketplace/sell/[id]/actions.ts
'use server'

import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function publishListing(formData: FormData) {
    const supabase = await createClient()
    
    const carId = formData.get('car_id') as string
    const price = parseInt(formData.get('price') as string)
    const description = formData.get('description') as string
    const contactPhone = formData.get('contact_phone') as string
    const isPublic = formData.get('is_public') === 'on' // Checkbox

    // Biztonsági ellenőrzés: Useré az autó?
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { error } = await supabase
        .from('cars')
        .update({
            price: price,
            description: description, // Feltételezve, hogy van ilyen mező a 'cars' táblában. Ha nincs, add hozzá!
            // Ha nincs 'description' meződ, akkor csinálj egy 'marketplace_listings' táblát, de egyszerűbb a 'cars'-ba tenni.
            is_listed_on_marketplace: isPublic,
            contact_phone: contactPhone // Ezt is add hozzá a táblához ha nincs
        })
        .eq('id', carId)
        .eq('user_id', user.id) // Fontos! Csak a sajátját szerkesztheti

    if (error) {
        console.error('Hiba:', error)
        return redirect(`/marketplace/sell/${carId}?error=Hiba történt`)
    }

    revalidatePath('/marketplace')
    revalidatePath('/marketplace/sell')
    
    // Ha publikáltuk, vigyük a piactérre, hogy lássa
    if (isPublic) {
        return redirect('/marketplace')
    } else {
        return redirect('/marketplace/sell')
    }
}