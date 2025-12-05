'use server'

import { createClient } from 'supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addCar(formData: FormData) {
  const supabase = await createClient()

  // Ellenőrizzük, hogy be van-e jelentkezve a felhasználó
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  // Adatok kinyerése az űrlapból
  const make = String(formData.get('make'))
  const model = String(formData.get('model'))
  const plate = String(formData.get('plate')).toUpperCase().replace(/\s/g, '') // Nagybetűsítés, szóköz nélkül
  const year = parseInt(String(formData.get('year')))
  const mileage = parseInt(String(formData.get('mileage')))
  const vin = String(formData.get('vin'))
  const color = String(formData.get('color'))
  const fuel_type = String(formData.get('fuel_type'))
  const status = String(formData.get('status'))

  // Validáció (egyszerű)
  if (!make || !model || !plate || isNaN(year) || isNaN(mileage)) {
    // Itt a jövőben visszaküldhetnénk a hibaüzenetet, most redirectelünk
    return redirect('/cars/new?error=Hiányzó kötelező adatok')
  }

  // Mentés az adatbázisba
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
    status
  })

  if (error) {
    console.error('Hiba a mentéskor:', error)
    return redirect('/cars/new?error=Adatbázis hiba')
  }

  // Frissítjük a főoldalt és visszairányítunk
  revalidatePath('/')
  redirect('/')
}