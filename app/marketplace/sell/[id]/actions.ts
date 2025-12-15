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
    const location = formData.get('location') as string
    const isPublic = formData.get('is_public') === 'on'
    
    // Extrák parsolása
    const featuresJson = formData.get('features') as string
    let features: string[] = []
    try {
        features = JSON.parse(featuresJson)
    } catch (e) {
        features = []
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    // Adatbázis frissítés
    const { error } = await supabase
        .from('cars')
        .update({
            price,
            description,
            is_listed_on_marketplace: isPublic,
            contact_phone: contactPhone,
            location,
            features // Mentsük az extrákat is!
        })
        .eq('id', carId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Hiba:', error)
        return redirect(`/marketplace/sell/${carId}?error=Hiba történt`)
    }

    revalidatePath('/marketplace')
    revalidatePath(`/marketplace/${carId}`)
    
    if (isPublic) {
        return redirect('/marketplace')
    } else {
        return redirect('/marketplace/sell')
    }
}