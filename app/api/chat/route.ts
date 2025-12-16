import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { createClient } from 'supabase/server'; 

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

  // Adatok lekérése
  const [carsRes, eventsRes] = await Promise.all([
    supabase.from('cars').select('*').eq('user_id', user.id),
    supabase.from('events').select('*, cars(make, model)').eq('user_id', user.id).order('event_date', { ascending: false }).limit(30)
  ]);

  const contextText = `
    TE VAGY A DRIVESYNC AI SZERELŐ...
    A felhasználó autói: ${JSON.stringify(carsRes.data)}
    Szerviznapló: ${JSON.stringify(eventsRes.data)}
  `;

  try {
      const result = streamText({
        // JAVÍTÁS: A stabil 1.5-ös modellt használjuk a túlterhelt 2.5 helyett
        // Ez sokkal megbízhatóbb production környezetben.
        model: google('gemini-2.0-flash-001'), 
        
        system: contextText,
        messages,
        onFinish: async ({ usage }) => {
             // Statisztika mentése (opcionális)
             /* if (usage) {
                await supabase.from('ai_usage').insert({
                    user_id: user.id,
                    prompt_tokens: usage.promptTokens,
                    completion_tokens: usage.completionTokens,
                    total_tokens: usage.totalTokens,
                    model: 'gemini-1.5-flash'
                });
             }
             */
        },
      });

      return result.toTextStreamResponse();

  } catch (error: any) {
      console.error("AI Error Detailed:", error);
      
      // Túlterhelés (Overloaded) hiba kezelése (503)
      if (error.message?.includes('overloaded') || error.status === 503) {
          return new Response("A Google AI szerverei jelenleg túlterheltek. Kérlek próbáld újra 1-2 perc múlva!", { status: 503 });
      }

      // Rate Limit hiba (429)
      if (error.message?.includes('429') || error.status === 429) {
          return new Response("Túl sok kérés egyszerre. Kérlek várj egy kicsit!", { status: 429 });
      }

      return new Response("Hiba történt az AI válasz generálása közben.", { status: 500 });
  }
}