import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createClient } from 'supabase/server';

export const maxDuration = 30;

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

  // Adatok lekérése
  const [carsRes, eventsRes] = await Promise.all([
    supabase.from('cars').select('*').eq('user_id', user.id),
    supabase.from('events').select('*, cars(make, model)').eq('user_id', user.id).order('event_date', { ascending: false }).limit(30)
  ]);

  const cars = carsRes.data || [];
  const events = eventsRes.data || [];

  // --- 1. Rendszer üzenet (Szigorúbb magyar nyelvvel) ---
  const contextText = `
    SYSTEM ROLE:
    Te a DriveSync alkalmazás profi autószerelő AI asszisztense vagy.
    
    CONTEXT:
    A felhasználó autói: ${JSON.stringify(cars)}
    Szerviznapló: ${JSON.stringify(events)}
    
    INSTRUCTIONS:
    1. **LANGUAGE: ONLY HUNGARIAN.** Mindenre MAGYARUL válaszolj! Még ha angolul is kapsz bemenetet, te akkor is MAGYARUL válaszolj.
    2. IMAGE ANALYSIS: Ha képet látsz, elemezd szakmailag.
    3. TONE: Segítőkész, szakmai, de közérthető.
  `;

  // --- 2. Üzenetek tisztítása (A HIBA JAVÍTÁSA) ---
  // A Groq API elutasítja a kérést, ha a korábbi üzenetekben (history) benne marad a base64 kép.
  // Ezért végigmegyünk a tömbön, és a régebbi üzenetekből kivesszük a képet, csak a szöveget hagyjuk meg.
  
  const processedMessages = messages.map((m: any, index: number) => {
    // Megnézzük, hogy ez az utolsó üzenet-e?
    const isLastMessage = index === messages.length - 1;

    // Ha ez egy KORÁBBI üzenet, és van benne tartalom tömb (tehát kép is)...
    if (!isLastMessage && Array.isArray(m.content)) {
      // ...akkor kiválogatjuk belőle CSAK a szöveget.
      // Így a history-ban megmarad, hogy mit kérdeztél ("Mi ez?"), de a hatalmas képfájl nem.
      const textOnlyContent = m.content
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('\n');
        
      return {
        role: m.role,
        content: textOnlyContent || "Kép feltöltve", // Ha nem volt mellette szöveg
      };
    }

    // Az utolsó üzenetet (amit most küldtél) békén hagyjuk, abban maradhat a kép.
    return m;
  });

  // --- 3. Küldés a Groq-nak ---
  const result = streamText({
    // Jelenleg ez a stabil Vision modell a Groq-nál:
    model: groq('meta-llama/llama-4-scout-17b-16e-instruct'), 
    system: contextText,
    messages: processedMessages, // A tisztított listát küldjük!
  });

  return result.toTextStreamResponse();
}