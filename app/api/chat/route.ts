import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
// Ellenőrizd: '@/lib/supabase/server' vagy '@/utils/supabase/server'
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

  const contextText = `
    TE VAGY A DRIVESYNC AI SZERELŐ.
    Adatok:
    Járművek: ${JSON.stringify(cars)}
    Napló: ${JSON.stringify(events)}
    
    Válaszolj magyarul, segítőkészen. Használj listákat.
  `;

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: contextText,
    messages,
  });

  // Ez a biztos pont a buildhez:
  return result.toTextStreamResponse();
}