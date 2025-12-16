import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createClient } from 'supabase/server';

export const maxDuration = 30;

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  // 1. Validáció
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

  // 2. Adatok lekérése (Ellenőrizzük a konzolon, hogy van-e adat!)
  const [carsRes, eventsRes] = await Promise.all([
    supabase.from('cars').select('*').eq('user_id', user.id),
    supabase.from('events').select('*, cars(make, model)').eq('user_id', user.id).order('event_date', { ascending: false }).limit(30)
  ]);

  const cars = carsRes.data || [];
  const events = eventsRes.data || [];

  // Debuggolás: Látod a szerver logban, hogy tényleg megvannak-e az autók?
  console.log(`User: ${user.id} | Cars found: ${cars.length} | Events found: ${events.length}`);

  // 3. Adatbázis szövegesítése (Ezt fogjuk befecskendezni)
  const databaseContext = `
  --- ADATBÁZIS ADATOK (Ezek a felhasználó TÉNYLEGES adatai, használd őket a válaszhoz!): ---
  JÁRMŰVEK LISTÁJA: ${cars.length > 0 ? JSON.stringify(cars) : "Nincs rögzített autó."}
  SZERVIZ TÖRTÉNET: ${events.length > 0 ? JSON.stringify(events) : "Nincs rögzített szerviz."}
  -------------------------------------------------------------------------------------------
  `;

  const systemInstructions = `
    ROLE: Te a DriveSync app profi autószerelő AI asszisztense vagy.
    GOAL: Segíts a felhasználónak a fenti adatbázis alapján.
    LANGUAGE: KIZÁRÓLAG MAGYARUL VÁLASZOLJ!
    TONE: Szakmai, segítőkész.
  `;

  // 4. Üzenetek tisztítása ÉS Adatbázis befecskendezése (INJECTION)
  const processedMessages = messages.map((m: any, index: number) => {
    const isLastMessage = index === messages.length - 1;
    let content = m.content;

    // --- A: TARTALOM NORMALIZÁLÁSA (Hogy a Groq ne akadjon ki) ---
    if (Array.isArray(content)) {
      const hasImage = content.some((part: any) => part.type === 'image');
      
      if (isLastMessage && hasImage) {
        // Ha ez az utolsó és képes üzenet, megőrizzük a struktúrát
        content = content.map((c: any) => {
             if(c.type === 'text') return { type: 'text', text: c.text };
             if(c.type === 'image') return { type: 'image', image: c.image };
             return null;
        }).filter(Boolean);
      } else {
        // Minden más esetben stringesítünk
        const textPart = content
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
          .join('\n');
        content = textPart || (hasImage ? "[Kép csatolva]" : "");
      }
    }

    // --- B: ADATOK BEFECSKENDEZÉSE (CSAK AZ UTOLSÓ ÜZENETBE) ---
    // Ez a trükk: Az AI "orra alá toljuk" az adatokat közvetlenül a kérdés mellé.
    if (isLastMessage) {
      if (typeof content === 'string') {
        // Ha szöveges a kérdés (pl. "Hány autóm van?")
        content = content + "\n\n" + databaseContext;
      } else if (Array.isArray(content)) {
        // Ha képes a kérdés (hozzáadjuk a szöveges részhez)
        content = content.map((c: any) => {
          if (c.type === 'text') {
            return { type: 'text', text: c.text + "\n\n" + databaseContext };
          }
          return c;
        });
      }
    }

    return {
      role: m.role,
      content: content
    };
  });

  // 5. Küldés
  const result = streamText({
    model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
    system: systemInstructions, // Itt csak a viselkedési szabályok maradnak
    messages: processedMessages, // Az adatok itt utaznak, az utolsó üzenetbe rejtve
  });

  return result.toTextStreamResponse();
}