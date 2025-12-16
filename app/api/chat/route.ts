import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createClient } from 'supabase/server';

export const maxDuration = 30;

// Groq kliens konfigurálása
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY, // Győződj meg róla, hogy ez be van állítva az .env fájlban
});

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

  // A Groq Llama 3.2 Vision modelljét használjuk
  const result = streamText({
    model: groq('llama-3.2-11b-vision-preview'), // Ez a modell támogatja a képeket (Vision)
    system: contextText,
    messages, 
  });

  return result.toTextStreamResponse();
}