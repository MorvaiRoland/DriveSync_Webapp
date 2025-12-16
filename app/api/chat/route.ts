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

  const contextText = `
    SYSTEM ROLE:
    Te a DriveSync alkalmazás profi autószerelő AI asszisztense vagy.
    
    CONTEXT:
    A felhasználó autói: ${JSON.stringify(cars)}
    Szerviznapló: ${JSON.stringify(events)}
    
    INSTRUCTIONS:
    1. **LANGUAGE: ONLY HUNGARIAN.** Mindenre MAGYARUL válaszolj!
    2. Ha képet látsz, elemezd szakmailag.
    3. Légy tömör, szakmai.
  `;

  // --- AGRESSZÍV ÜZENET TISZTÍTÁS (A megoldás kulcsa) ---
  const processedMessages = messages.map((m: any, index: number) => {
    const isLastMessage = index === messages.length - 1;
    
    // 1. lépés: Tartalom normalizálása
    let content = m.content;

    // Ha a tartalom tömb (akár szöveg, akár kép van benne)
    if (Array.isArray(content)) {
      // Megnézzük, van-e benne kép
      const hasImage = content.some((part: any) => part.type === 'image');

      if (isLastMessage && hasImage) {
        // HA ez az utolsó üzenet ÉS van benne kép: Hagyjuk meg tömbnek (ez kell a Vision-nek)
        // De biztosítjuk, hogy csak a támogatott mezők maradjanak
        return {
          role: m.role,
          content: content.map((c: any) => {
             if(c.type === 'text') return { type: 'text', text: c.text };
             if(c.type === 'image') return { type: 'image', image: c.image };
             return null;
          }).filter(Boolean)
        };
      } else {
        // MINDEN MÁS ESETBEN (History, vagy kép nélküli utolsó üzenet):
        // Lapítsuk ki sima stringgé! A Groq ezt szereti a legjobban.
        const textParts = content
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
          .join('\n');
        
        content = textParts || (hasImage ? "[Kép feltöltve]" : ""); // Fallback, ha üres lenne
      }
    }

    // 2. lépés: Új objektum visszaadása (kiszűrve minden extra "szemetet" amit a frontend küldhet)
    return {
      role: m.role,
      content: content // Itt már vagy string, vagy a kép objektum
    };
  });

  // --- Küldés ---
  const result = streamText({
    model: groq('meta-llama/llama-4-scout-17b-16e-instruct'), 
    system: contextText,
    messages: processedMessages,
  });

  return result.toTextStreamResponse();
}