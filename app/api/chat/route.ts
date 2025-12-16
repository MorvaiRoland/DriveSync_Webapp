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

  // --- ADATOK LEKÉRÉSE ---
  const [carsRes, eventsRes] = await Promise.all([
    supabase.from('cars').select('*').eq('user_id', user.id),
    supabase.from('events').select('*, cars(make, model)').eq('user_id', user.id).order('event_date', { ascending: false }).limit(30)
  ]);

  // --- ADATOK FORMÁZÁSA (Hogy az AI értse) ---
  const carList = (carsRes.data || []).map((c: any) => 
    `- ${c.make} ${c.model} (${c.year || '?'}). Motor: ${c.engine || c.horsepower || 'Nincs adat'}. Rendszám: ${c.license_plate}.`
  ).join('\n');

  const eventList = (eventsRes.data || []).map((e: any) => 
    `- ${e.event_date}: ${e.event_type} (${e.description || '-'})`
  ).join('\n');

  // --- MODEL VÁLASZTÁS LOGIKA ---
  // Megnézzük, van-e kép az utolsó üzenetben
  const lastMessage = messages[messages.length - 1];
  const hasImage = Array.isArray(lastMessage.content) && lastMessage.content.some((c: any) => c.type === 'image');

  // HA VAN KÉP -> Vision modell (Lát, de néha "kreatív")
  // HA NINCS KÉP -> Versatile modell (Agytröszt - ez a legokosabb autószerelésben)
  const activeModelId = hasImage 
    ? 'llama-3.2-90b-vision-preview' 
    : 'llama-3.3-70b-versatile';

  // --- SZIGORÚ SYSTEM PROMPT ---
  const systemPrompt = `
    ROLE: Te a DriveSync alkalmazás VEZETŐ AUTÓSZERELŐJE vagy. Nem vagy költő, nem vagy filozófus. Egy gyakorlatias szakember vagy.
    
    TILTOTT DOLGOK (Guardrails):
    - TILOS átvitt értelemben vagy metaforaként értelmezni a bemenetet (pl. "füstöl az autóm" = MOTORHIBA, nem érzelem!).
    - TILOS nem autós témában válaszolni. Ha a felhasználó pizzáról kérdez, utasítsd vissza udvariasan.
    - TILOS regényt írni. Tömör, pontokba szedett műszaki diagnózist adj.

    A FELHASZNÁLÓ SAJÁT ADATAI (Használd ezeket!):
    Járművek:
    ${carList || "Nincs rögzített jármű."}
    
    Szerviztörténet:
    ${eventList || "Üres."}

    UTASÍTÁSOK:
    1. NYELV: KIZÁRÓLAG MAGYAR.
    2. Ha a felhasználó homályosan fogalmaz (pl. "nem megy"), kérdezz vissza szakmailag (önindító teker? akku jó?).
    3. Ha hibajelenséget ír (pl. "füstöl"), sorold fel a lehetséges mechanikai okokat (hengerfej, gyűrű, dús keverék).
  `;

  // --- ÜZENET TISZTÍTÁS (Groq Hiba Elkerülés) ---
  const processedMessages = messages.map((m: any, index: number) => {
    const isLast = index === messages.length - 1;
    let content = m.content;

    if (Array.isArray(content)) {
      if (isLast && hasImage) {
        // Képes üzenet a Vision modellnek
        return {
          role: m.role,
          content: content.map((c: any) => {
             if(c.type === 'text') return { type: 'text', text: c.text };
             if(c.type === 'image') return { type: 'image', image: c.image };
             return null;
          }).filter(Boolean)
        };
      } 
      
      // Szövegesítés a 70B modellnek (vagy history)
      const textPart = content
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('\n');
        
      content = textPart || (content.some((c: any) => c.type === 'image') ? "[Kép csatolva volt]" : "");
    }

    return { role: m.role, content: content };
  });

  // --- KÜLDÉS ---
  const result = streamText({
    model: groq(activeModelId), 
    system: systemPrompt,
    messages: processedMessages,
    temperature: 0.3, // ALACSONYRA VESSZÜK! (0.3 = Tényszerű, nem kreatív)
  });

  return result.toTextStreamResponse();
}