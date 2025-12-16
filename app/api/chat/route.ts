import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { createClient } from 'supabase/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  let messages;

  try {
    const json = await req.json();
    messages = json.messages;
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const [carsRes, eventsRes] = await Promise.all([
    supabase.from('cars').select('*').eq('user_id', user.id),
    supabase
      .from('events')
      .select('*, cars(make, model)')
      .eq('user_id', user.id)
      .order('event_date', { ascending: false })
      .limit(30),
  ]);

  const contextText = `
TE VAGY A DRIVESYNC AI SZERELŐ.
Adj pontos, szakmailag helyes, érthető válaszokat.

Felhasználó autói:
${JSON.stringify(carsRes.data, null, 2)}

Szerviznapló:
${JSON.stringify(eventsRes.data, null, 2)}
`;

  try {
    const result = await generateText({
      model: google('gemini-2.0-flash'), // ✅ NAGY KVÓTA

      system: contextText,
      messages,

      maxOutputTokens: 1024,

      temperature: 0.4,
    });

    return Response.json({
      text: result.text,
    });

  } catch (error: any) {
    console.error('AI Error:', error);

    if (error.status === 429) {
      return new Response('Túl sok kérés – próbáld újra később.', { status: 429 });
    }

    return new Response('AI hiba', { status: 500 });
  }
}
