'use server'

import { createClient } from '@/supabase/server'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

// A válasz séma változatlan
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
  
  // 1. Lekérjük az autó adatait (Bővítve transmission-nel, ha van az adatbázisban)
  const { data: car } = await supabase
    .from('cars')
    .select('*')
    .eq('id', carId)
    .single()
    
  if (!car) throw new Error("Autó nem található")

  // 2. ÚJ: Lekérjük az eddigi SZERVIZ eseményeket, hogy az AI lássa, mi volt már cserélve
  const { data: events } = await supabase
    .from('events')
    .select('event_date, title, mileage, notes, type')
    .eq('car_id', carId)
    .eq('type', 'service') // Csak a szervizek érdekelnek minket
    .order('event_date', { ascending: false }) // Legfrissebbek elöl
    .limit(20) // Elég az utolsó 20 bejegyzés a kontextushoz

  // 3. Formázzuk a szerviztörténetet olvasható szöveggé az AI számára
  const historySummary = events && events.length > 0
    ? events.map(e => `- ${e.event_date}: ${e.title} (${e.mileage} km) - Megjegyzés: ${e.notes || ''}`).join('\n')
    : "Nincs rögzített szerviztörténet.";

  // 4. Megnézzük, van-e friss elemzés (cache)
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

  // 5. A kibővített Prompt az AI számára
  const prompt = `
    Te egy tapasztalt autószerelő szakértő és diagnoszta vagy.
    
    FELADAT:
    Elemezd a járművet és sorold fel a várható kritikus típushibákat a motor/üzemanyag és a futásteljesítmény alapján.
    
    JÁRMŰ ADATOK:
    - Márka/Típus: ${car.make} ${car.model}
    - Évjárat: ${car.year}
    - Motor: ${car.engine_size ? car.engine_size + ' ccm' : 'Ismeretlen ccm'}
    - Üzemanyag: ${car.fuel_type} (FONTOS: Ha dízel, figyelj a DPF, kettőstömegű, injektor hibákra! Ha benzin, akkor a gyújtás, trafó, láncnyúlás stb.)
    - Jelenlegi óraállás: ${car.mileage} km

    ELVÉGZETT KARBANTARTÁSOK (TÖRTÉNET):
    ${historySummary}

    SZIGORÚ SZABÁLYOK:
    1. Nézd át alaposan az "ELVÉGZETT KARBANTARTÁSOK" listát!
    2. HA egy alkatrész (pl. kuplung, vezérműlánc, fék) cseréje megtörtént a közelmúltban (az elmúlt 50-80.000 km-en belül), AKKOR AZT NE JAVASOLD hibaként!
    3. Csak olyan hibákat írj, amik ennél a konkrét motornál és futásnál esedékesek, és még NEM voltak javítva a napló szerint.
    4. Becsülj reális magyarországi javítási költségeket.

    Kimenet nyelve: Magyar.
  `

  const { object } = await generateObject({
    model: google('gemini-2.5-flash'), // A legfrissebb stabil modell
    schema: IssueSchema,
    prompt: prompt,
  })

  // 6. Elmentjük az adatbázisba
  await supabase.from('car_predictions').insert({
    car_id: carId,
    mileage_at_prediction: car.mileage,
    issues: object.issues,
    summary: object.summary
  })

  return { issues: object.issues, summary: object.summary, cached: false }
}