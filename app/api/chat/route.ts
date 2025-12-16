import { groq } from '@ai-sdk/groq'; // Google helyett Groq import
import { streamText } from 'ai';
import { createClient } from 'supabase/server'; // Ellenőrizd az útvonalat!

export const maxDuration = 30;

export async function POST(req: Request) {
  let messages;
  try {
     const json = await req.json();
     messages = json.messages;
  } catch (e) {
     return new Response('Invalid JSON', { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return new Response('Unauthorized', { status: 401 });

  // Adatok lekérése a kontextushoz (Változatlan)
  const [carsRes, eventsRes] = await Promise.all([
    supabase.from('cars').select('*').eq('user_id', user.id),
    supabase
      .from('events')
      .select('*, cars(make, model)')
      .eq('user_id', user.id)
      .order('event_date', { ascending: false })
      .limit(30)
  ]);

  const cars = carsRes.data || [];
  const events = eventsRes.data || [];

  // Rendszer üzenet (System Prompt)
  const contextText = `
    TE VAGY A DRIVESYNC AI SZERELŐ.
    
    A felhasználó autói: ${JSON.stringify(cars)}
    Szerviznapló: ${JSON.stringify(events)}
    
    KÉPESSÉGEK:
    - Képes vagy elemezni a felhasználó által feltöltött képeket (pl. műszerfal hibajelzések, motortér, sérülések).
    - Ha képet kapsz, elemezd a látható problémát, és adj tanácsot.
    - Ha hibakódot látsz, magyarázd el.
    
    Válaszolj magyarul, szakmailag, de érthetően.
  `;

  try {
      const result = streamText({
        // FONTOS: A 'llama-3.2-90b-vision-preview' modellt használjuk.
        // Ez az egyetlen a Groq-on, ami látja a képeket (Vision) és elég okos (90b).
        model: groq('openai/gpt-oss-120b'), 
        
        system: contextText,
        messages, // A képeket (base64) a Vercel SDK automatikusan átadja a Groq-nak
      });

      return result.toTextStreamResponse();

  } catch (error: any) {
      console.error("Groq AI Error:", error);
      
      // Hibakezelés
      if (error.status === 429) {
          return new Response("Túl sok kérés a Groq felé. Várj egy picit!", { status: 429 });
      }

      return new Response("AI Hiba történt: " + error.message, { status: 500 });
  }
}