// app/actions/car-actions.ts
'use server'

import { createClient } from 'supabase/server'
import { revalidatePath } from 'next/cache'

// --- TÍPUSOK ---
export type CheckCarResult = {
  found: boolean
  car?: {
    id: string
    make: string
    model: string
    plate: string
    year: number
    color: string
    user_id: string // Fontos, hogy lássuk, van-e már tulaja
  }
  message?: string
}

export type ClaimResult = {
  success: boolean
  message: string
}

// 1. Alvázszám ellenőrzése
export async function checkCarByVin(vin: string): Promise<CheckCarResult> {
  const supabase = await createClient()
  
  // Input tisztítása (szóközök levágása, nagybetűsítés)
  const cleanVin = vin.trim().toUpperCase()

  if (cleanVin.length !== 17) {
    return { found: false, message: 'Érvénytelen alvázszám formátum.' }
  }

  try {
    const { data, error } = await supabase
      .from('cars')
      .select('id, make, model, plate, year, color, vin, user_id')
      .eq('vin', cleanVin)
      .single()

    if (error || !data) {
      return { found: false }
    }

    return { found: true, car: data }

  } catch (err) {
    console.error('VIN check error:', err)
    return { found: false, message: 'Hiba történt a keresés közben.' }
  }
}

// 2. Autó átvétele (Tulajdonjog átruházása)
export async function claimCar(carId: string): Promise<ClaimResult> {
  const supabase = await createClient()
  
  try {
    // A. Jogosultság ellenőrzése
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error('Nem vagy bejelentkezve.')
    }

    // B. Autó státuszának lekérése (Biztonsági lépés)
    const { data: car, error: fetchError } = await supabase
        .from('cars')
        .select('user_id')
        .eq('id', carId)
        .single()

    if (fetchError || !car) {
        return { success: false, message: 'Az autó nem található.' }
    }

    // Ha az autó már a miénk, ne csináljunk semmit
    if (car.user_id === user.id) {
        return { success: true, message: 'Ez az autó már a tiéd.' }
    }

    // C. Opcionális: Logolás az ownership_transfers táblába (ha van ilyen)
    /* if (car.user_id) {
       await supabase.from('ownership_transfers').insert({
          car_id: carId,
          previous_owner: car.user_id,
          new_owner: user.id,
          initiated_by: user.id
       })
    }
    */

    // D. Tulajdonos frissítése
    const { error: updateError } = await supabase
      .from('cars')
      .update({ 
          user_id: user.id,
          updated_at: new Date().toISOString() // Jó gyakorlat frissíteni az időbélyeget
      })
      .eq('id', carId)

    if (updateError) {
        console.error('Update error:', updateError)
        return { success: false, message: 'Adatbázis hiba az átvételkor.' }
    }

    // E. Cache frissítése
    revalidatePath('/')
    revalidatePath(`/cars/${carId}`)
    
    return { success: true, message: 'Az autó sikeresen hozzáadva a fiókodhoz!' }

  } catch (error: any) {
    return { success: false, message: error.message || 'Ismeretlen hiba történt.' }
  }
}