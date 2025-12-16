import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createClient } from 'supabase/server';

export const maxDuration = 30;

// Groq kliens konfigurálása
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
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

  // --- ADATOK LEKÉRÉSE ---
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

  // --- RENDSZER ÜZENET MEGERŐSÍTÉSE ---
  const contextText = `
    TE EGY PROFI MAGYAR AUTÓSZERELŐ MESTERSÉGES INTELLIGENCIA VAGY (DRIVESYNC AI).
    
    FELADATOD:
    Segíteni a felhasználónak az autóival kapcsolatos problémákban, hibakódokban és karbantartásban.
    
    A FELHASZNÁLÓ AUTÓI: ${JSON.stringify(cars)}
    SZERVIZNAPLÓ: ${JSON.stringify(events)}
    
    FONTOS SZABÁLYOK:
    1. MINDIG ÉS KIZÁRÓLAG MAGYAR NYELVEN VÁLASZOLJ! (Speak only in Hungarian).
    2. Ha képet kapsz, elemezd részletesen a látott hibát vagy alkatrészt.
    3. Légy tömör, szakmai, de segítőkész.
  `;

  // --- ÜZENETEK TISZTÍTÁSA (CRITICAL FIX) ---
  // A Groq Vision modellek gyakran "kiakadnak", ha a history-ban base64 kép van.
  // Ezért csak az UTOLSÓ üzenetben hagyjuk meg a képet, a régiekből kivesszük.
  const processedMessages = messages.map((m: any, index: number) => {
    // Ha nem az utolsó üzenet, és tömb a tartalma (tehát van benne kép)...
    if (index !== messages.length - 1 && Array.isArray(m.content)) {
      return {
        ...m,
        // ...akkor csak a szöveges részt tartjuk meg
        content: m.content
          .filter((c: any) => c.type === 'text')
          .map((c: any) => c.text)
          .join('\n')
      };
    }
    return m;
  });

  // --- HÍVÁS ---
  const result = streamText({
    // A logjaid alapján ez a helyes, támogatott Vision modell most:
    model: groq('meta-llama/llama-4-scout-17b-16e-instruct'), 
    system: contextText,
    messages: processedMessages, // A tisztított listát küldjük
  });

  return result.toTextStreamResponse();
}