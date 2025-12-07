'use server'

import OpenAI from 'openai'

export async function scanReceipt(formData: FormData) {
  // 1. JAVÍTÁS: Itt, a függvényen BELÜL hozzuk létre a klienst!
  // Így biztosan látja már a környezeti változókat.
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const file = formData.get('receipt') as File

  if (!file) {
    return { error: 'Nincs kép feltöltve.' }
  }

  // Ellenőrizzük, hogy van-e kulcs, mielőtt pénzt költenénk a hívásra
  if (!process.env.OPENAI_API_KEY) {
      console.error("HIBA: Hiányzik az OPENAI_API_KEY a .env.local fájlból!")
      return { error: 'Szerver konfigurációs hiba (Hiányzó API kulcs).' }
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64Image = buffer.toString('base64')
  const dataUrl = `data:${file.type};base64,${base64Image}`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that extracts data from Hungarian receipts (fuel or service). 
          Extract the following fields and return ONLY a raw JSON object (no markdown formatting, no backticks):
          
          - title: Name of the station or service provider (e.g. Shell, OMV, Bosch Szerviz).
          - date: Date of transaction in YYYY-MM-DD format.
          - cost: Total amount in numbers only (e.g. 15000).
          - liters: If it's a fuel receipt, amount of liters (number). If service, return null.
          - location: City or address if visible.
          - type: Detect if it is 'fuel' (tankolás) or 'service' (szerviz/alkatrész).
          
          - description: 
            * If 'fuel': Write the fuel type if visible (e.g. "95 Benzin", "Diesel").
            * If 'service': Summarize the items/services listed (e.g. "Olajcsere, Féktárcsa, Munkadíj"). Keep it under 100 characters.`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract data from this receipt." },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    })

    const content = response.choices[0].message.content
    const jsonString = content?.replace(/```json/g, '').replace(/```/g, '').trim()
    
    if (!jsonString) throw new Error('Üres válasz az AI-tól')

    const data = JSON.parse(jsonString)
    return { success: true, data }

  } catch (error) {
    console.error("AI Error:", error)
    return { error: 'Nem sikerült beolvasni a számlát. Próbáld újra vagy töltsd ki kézzel.' }
  }
}