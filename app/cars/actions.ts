'use server'

import { createClient } from 'supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addCar(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const make = String(formData.get('make'))
  const model = String(formData.get('model'))
  const plate = String(formData.get('plate')).toUpperCase().replace(/\s/g, '')
  const year = parseInt(String(formData.get('year')))
  const mileage = parseInt(String(formData.get('mileage')))
  const vin = String(formData.get('vin'))
  const color = String(formData.get('color'))
  const fuel_type = String(formData.get('fuel_type'))
  const status = String(formData.get('status'))
  
  // --- KÉP FELTÖLTÉS LOGIKA ---
  const imageFile = formData.get('image') as File;
  let image_url = null;

  if (imageFile && imageFile.size > 0) {
    // Egyedi fájlnév generálása: timestamp_eredetinev
    const fileName = `${Date.now()}_${imageFile.name.replace(/\s/g, '_')}`;
    const filePath = `${user.id}/${fileName}`; // User mappába rakjuk

    const { error: uploadError } = await supabase.storage
      .from('car-images')
      .upload(filePath, imageFile);

    if (uploadError) {
      console.error('Képfeltöltési hiba:', uploadError);
      // Opcionális: visszatérhetünk hibával, vagy folytathatjuk kép nélkül
    } else {
      // Nyilvános URL lekérése
      const { data: { publicUrl } } = supabase.storage
        .from('car-images')
        .getPublicUrl(filePath);
      
      image_url = publicUrl;
    }
  }
  // -----------------------------

  if (!make || !model || !plate || isNaN(year) || isNaN(mileage)) {
    return redirect('/cars/new?error=Hiányzó kötelező adatok')
  }

  const { error } = await supabase.from('cars').insert({
    user_id: user.id,
    make,
    model,
    plate,
    year,
    mileage,
    vin,
    color,
    fuel_type,
    status,
    image_url // ITT MENTJÜK A KÉP URL-T
  })

  if (error) {
    console.error('Hiba a mentéskor:', error)
    return redirect('/cars/new?error=Adatbázis hiba')
  }

  revalidatePath('/')
  redirect('/')
}