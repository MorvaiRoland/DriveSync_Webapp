import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { createClient } from 'supabase/server'; // Vagy ahol a tied van

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

  // Adatok lekérése a kontextushoz
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
  // Fontos: Itt instruáljuk, hogy képes képeket is nézni.
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

  // A messages tömb már tartalmazhatja a képet base64 formátumban a frontendről.
  // A Vercel AI SDK Google provider ezt automatikusan kezeli, ha a struktúra:
  // { role: 'user', content: [ { type: 'text', text: '...' }, { type: 'image', image: 'base64...' } ] }
  
  const result = streamText({
    model: google('gemini-2.5-flash'), // A flash modell gyors és jó képekkel
    system: contextText,
    messages, // A frontend által küldött teljes tömböt átadjuk
  });

  return result.toTextStreamResponse();
}