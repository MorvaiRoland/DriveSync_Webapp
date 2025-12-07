'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function scanReceipt(formData: FormData) {
  const API_KEY = process.env.GOOGLE_API_KEY;

  if (!API_KEY) {
    console.error("❌ HIBA: Hiányzik a GOOGLE_API_KEY a .env.local fájlból!");
    return { error: 'Szerver konfigurációs hiba: Hiányzó API kulcs.' }
  }

  const file = formData.get('receipt') as File
  if (!file) return { error: 'Nincs kép feltöltve.' }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = buffer.toString('base64')

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a data extraction assistant. Analyze this receipt/invoice image.
      Extract fields into a JSON object.
      
      Fields needed:
      - title: 
          * If Fuel: Company name (Shell, OMV). 
          * If Service: Try to categorize the MAIN service type (e.g. "Olajcsere", "Műszaki Vizsga", "Gumiszerelés"). If unsure, use "Egyéb".
      - date: YYYY-MM-DD.
      - cost: Total amount (number).
      - liters: Number (if fuel), null (if service).
      - mileage: Odometer reading/Km count if visible on the invoice (number). Look for "Km", "Kilométer", "Odometer". If not found, return null.
      - location: City/Address.
      - type: 'fuel' or 'service'.
      - description: 
         * If fuel: fuel type (e.g. "95 Benzin").
         * If service: list main items.
      
      RETURN ONLY RAW JSON.
    `;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: file.type,
      },
    };
    
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    let jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
    }

    const data = JSON.parse(jsonString);
    console.log("✅ AI Adatok:", data);

    return { success: true, data }

  } catch (error: any) {
    console.error("❌ AI Hiba:", error.message);
    return { error: 'Nem sikerült beolvasni a számlát.' }
  }
}