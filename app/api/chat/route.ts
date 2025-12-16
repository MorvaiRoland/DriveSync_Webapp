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

  // Adatok lekérése (változatlan)
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
        model: google('gemini-2.5-flash'), // Válts vissza 1.5-flash-re, az stabilabb ingyen!
        system: contextText,
        messages,
        onFinish: async ({ usage }) => {
            // ... (használat mentése, változatlan)
        },
      });

      return result.toTextStreamResponse();

  } catch (error: any) {
      console.error("AI Error:", error);
      
      // Ha Rate Limit hiba van (429), akkor szépen válaszoljunk
      if (error.message?.includes('429') || error.status === 429) {
          return new Response("A rendszer túlterhelt (Rate Limit). Kérlek várj egy percet!", { status: 429 });
      }
      
      return new Response("Hiba történt az AI válasz generálása közben.", { status: 500 });
  }
}