import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createClient } from 'supabase/server';

export const maxDuration = 30;

// Groq kliens inicializálása
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  // 1. Kérés validálása
  let messages;
  try {
    const json = await req.json();
    messages = json.messages;
  } catch (e) {
    return new Response('Invalid JSON', { status: 400 });
  }

  // 2. Felhasználó azonosítása
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return new Response('Unauthorized', { status: 401 });

  // 3. Adatok lekérése a Supabase-ből (Adatbázis kontextus)
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

  // 4. Rendszer üzenet (System Prompt) összeállítása
  // Itt adjuk át az adatbázis tartalmát és a nyelvi beállításokat.
  const systemPrompt = `
    SYSTEM ROLE:
    Te a DriveSync alkalmazás profi, segítőkész autószerelő AI asszisztense vagy.
    
    DATABASE CONTEXT (A felhasználó adatai):
    - Járművek: ${cars.length > 0 ? JSON.stringify(cars) : "Nincs rögzített jármű."}
    - Szerviztörténet: ${events.length > 0 ? JSON.stringify(events) : "Nincs rögzített szerviz."}
    
    INSTRUCTIONS:
    1. **LANGUAGE:** KIZÁRÓLAG MAGYARUL VÁLASZOLJ (Hungarian only)!
    2. **KÉPEK:** Ha a felhasználó képet küld, elemezd vizuálisan (pl. műszerfal hiba, sérülés, alkatrész).
    3. **ADATOK:** Ha a felhasználó a saját autóiról kérdez (pl. "Mikor volt olajcsere?", "Milyen autóm van?"), használd a fenti DATABASE CONTEXT adatait a válaszhoz.
    4. **STÍLUS:** Legyél szakmai, de érthető és rövid.
  `;

  // 5. Üzenetek tisztítása és formázása (CRITICAL FIX)
  // Ez a rész felel azért, hogy se a history, se a sima szöveges kérdések ne akasszák ki a Groq-ot.
  const processedMessages = messages.map((m: any, index: number) => {
    const isLastMessage = index === messages.length - 1;
    let content = m.content;

    // Ha a tartalom tömb formátumú (a Vercel SDK így küldi)
    if (Array.isArray(content)) {
      // Megnézzük, van-e benne kép
      const hasImage = content.some((part: any) => part.type === 'image');
      
      // Kinyerjük a szöveges részt
      const textPart = content
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('\n');

      if (isLastMessage && hasImage) {
        // A: EZ AZ UTOLSÓ ÜZENET ÉS VAN BENNE KÉP
        // Ezt meg kell hagyni objektum tömbnek, hogy a Vision modell lássa a képet.
        // De kiszűrjük a felesleges mezőket.
        return {
          role: m.role,
          content: content.map((c: any) => {
             if(c.type === 'text') return { type: 'text', text: c.text };
             if(c.type === 'image') return { type: 'image', image: c.image };
             return null;
          }).filter(Boolean)
        };
      } else {
        // B: MINDEN MÁS ESET (History VAGY sima szöveges kérdés kép nélkül)
        // Itt a "magic": Átalakítjuk egyszerű stringgé!
        // Ha ezt nem tesszük meg, a Groq 400-as hibát dobhat "text-only" kérdéseknél is,
        // ha azok tömbbe vannak csomagolva.
        const finalString = textPart || (hasImage ? "[Kép feltöltve]" : "");
        
        return {
          role: m.role,
          content: finalString // Stringet adunk vissza, nem tömböt!
        };
      }
    }

    // Ha eleve string volt (ritka, de előfordulhat), visszaadjuk változatlanul
    return {
      role: m.role,
      content: content
    };
  });

  // 6. API hívás
  const result = streamText({
    model: groq('meta-llama/llama-4-scout-17b-16e-instruct'), // Stabil Vision modell
    system: systemPrompt,
    messages: processedMessages,
  });

  return result.toTextStreamResponse();
}