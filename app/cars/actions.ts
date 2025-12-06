'use server'

import { createClient } from 'supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- ÚJ AUTÓ LÉTREHOZÁSA (MEGLÉVŐ) ---
export async function addCar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const imageFile = formData.get('image') as File;
  let image_url = null;

  // Képfeltöltés logika
  if (imageFile && imageFile.size > 0) {
    const fileName = `${user.id}/${Date.now()}_${imageFile.name.replace(/\s/g, '_')}`;
    const { error: uploadError } = await supabase.storage.from('car-images').upload(fileName, imageFile);
    if (!uploadError) {
      const { data } = supabase.storage.from('car-images').getPublicUrl(fileName);
      image_url = data.publicUrl;
    }
  }

  const { error } = await supabase.from('cars').insert({
    user_id: user.id,
    make: String(formData.get('make')),
    model: String(formData.get('model')),
    plate: String(formData.get('plate')).toUpperCase().replace(/\s/g, ''),
    year: parseInt(String(formData.get('year'))),
    mileage: parseInt(String(formData.get('mileage'))),
    vin: String(formData.get('vin')),
    color: String(formData.get('color')),
    fuel_type: String(formData.get('fuel_type')),
    status: String(formData.get('status')),
    image_url: image_url
  })

  if (error) return redirect('/cars/new?error=Hiba történt')
  
  revalidatePath('/')
  redirect('/')
}

// --- AUTÓ MÓDOSÍTÁSA & KÉP FELTÖLTÉS (ÚJ) ---
export async function updateCar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const carId = String(formData.get('car_id')) // Figyelem: itt 'car_id'-t várunk a formból
  const imageFile = formData.get('image') as File;
  
  // Alapadatok
  const updateData: any = {
    make: String(formData.get('make')),
    model: String(formData.get('model')),
    plate: String(formData.get('plate')).toUpperCase().replace(/\s/g, ''),
    year: parseInt(String(formData.get('year'))),
    mileage: parseInt(String(formData.get('mileage'))),
    vin: String(formData.get('vin')),
    color: String(formData.get('color')),
    fuel_type: String(formData.get('fuel_type')),
    status: String(formData.get('status')),
  }

  // Ha van új kép, feltöltjük és frissítjük az URL-t
  if (imageFile && imageFile.size > 0) {
    const fileName = `${user.id}/${Date.now()}_${imageFile.name.replace(/\s/g, '_')}`;
    const { error: uploadError } = await supabase.storage.from('car-images').upload(fileName, imageFile);
    
    if (!uploadError) {
      const { data } = supabase.storage.from('car-images').getPublicUrl(fileName);
      updateData.image_url = data.publicUrl;
    }
  }

  const { error } = await supabase
    .from('cars')
    .update(updateData)
    .eq('id', carId)
    .eq('user_id', user.id) // Biztonsági ellenőrzés

  if (error) {
    console.error('Update error:', error)
    return redirect(`/cars/${carId}/edit?error=Sikertelen frissítés`)
  }

  revalidatePath('/')
  revalidatePath(`/cars/${carId}`)
  redirect(`/cars/${carId}`) // Vissza a részletekhez
}

// --- AUTÓ TÖRLÉSE (EZ HIÁNYZOTT NEKED) ---
export async function deleteCar(formData: FormData) {
  const supabase = await createClient()
  // Figyelem: A Főoldalon 'id' néven küldjük, a részletes oldalon 'car_id'-ként. 
  // Itt mindkettőt megpróbáljuk kiolvasni.
  const carId = String(formData.get('id') || formData.get('car_id'))
  
  // Először töröljük a kapcsolódó adatokat
  await supabase.from('events').delete().eq('car_id', carId)
  await supabase.from('service_reminders').delete().eq('car_id', carId)

  const { error } = await supabase
    .from('cars')
    .delete()
    .eq('id', carId)

  if (error) console.error('Delete error:', error)

  revalidatePath('/')
  // Ha a részletes oldalról törlünk, akkor a redirect fontos, ha a listából, akkor nem árt
  redirect('/') 
}