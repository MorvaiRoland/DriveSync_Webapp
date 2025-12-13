'use server'

import { createClient } from '@/supabase/server'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

// Definiáljuk, milyen formátumban kérjük a választ az AI-tól
const IssueSchema = z.object({
  issues: z.array(z.object({
    part: z.string().describe("Az alkatrész neve magyarul, pl. Vezérműlánc"),
    probability: z.enum(['low', 'medium', 'high']).describe("A meghibásodás valószínűsége"),
    description: z.string().describe("Rövid leírás, miért fordulhat elő és mik a tünetek"),
    estimated_cost: z.string().describe("Becsült javítási költség Ft-ban (tól-ig)"),
    urgency: z.enum(['warning', 'critical', 'info']).describe("Mennyire sürgős ráfigyelni")
  })),
  summary: z.string().describe("Egy mondatos összefoglaló a tulajdonosnak")
})

export async function generateCarPrediction(carId: number) {
  const supabase = await createClient()
  
  // 1. Lekérjük az autó adatait
  const { data: car } = await supabase.from('cars').select('*').eq('id', carId).single()
  if (!car) throw new Error("Autó nem található")

  // 2. Megnézzük, van-e friss elemzés (pl. az elmúlt 5000 km-en belül)
  const { data: existing } = await supabase
    .from('car_predictions')
    .select('*')
    .eq('car_id', carId)
    .order('prediction_date', { ascending: false })
    .limit(1)
    .single()

  // Ha van friss elemzés (pl. azóta nem ment 5000 km-t), visszaadjuk azt
  if (existing && (car.mileage - existing.mileage_at_prediction < 5000)) {
    return { issues: existing.issues, summary: existing.summary, cached: true }
  }

  // 3. Ha nincs, generálunk újat az AI-val
  const prompt = `
    Te egy tapasztalt autószerelő szakértő vagy.
    Elemezd a következő járművet és sorold fel a várható típushibákat a jelenlegi futásteljesítmény alapján.
    
    Jármű: ${car.make} ${car.model} (${car.year})
    Motor/Típus: ${car.fuel_type}, ${car.engine_size || ''}ccm
    Jelenlegi futás: ${car.mileage} km
    
    Koncentrálj a kritikus, költséges hibákra, amik ennél a kilométernél szoktak előjönni (pl. kettőstömegű, vezérműlánc, turbo, injektor).
    Csak valós, ismert típushibákat írj.
  `

  const { object } = await generateObject({
    model: google('gemini-2.5-flash'), // Gyors és olcsó
    schema: IssueSchema,
    prompt: prompt,
  })

  // 4. Elmentjük az adatbázisba
  await supabase.from('car_predictions').insert({
    car_id: carId,
    mileage_at_prediction: car.mileage,
    issues: object.issues,
    summary: object.summary
  })

  return { issues: object.issues, summary: object.summary, cached: false }
}