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

  // 1. ADATOK LEKÉRÉSE
  const [carsRes, eventsRes] = await Promise.all([
    supabase.from('cars').select('*').eq('user_id', user.id),
    supabase.from('events').select('*, cars(make, model)').eq('user_id', user.id).order('event_date', { ascending: false }).limit(30)
  ]);

  const cars = carsRes.data || [];
  const events = eventsRes.data || [];

  // 2. ADATOK OLVASHATÓVÁ TÉTELE (Ez kritikus, hogy ne keverje össze)
  const carsText = cars.length > 0 
    ? cars.map(c => `- ${c.make} ${c.model} (Évjárat: ${c.year}, Rendszám: ${c.license_plate}, Motor/Adatok: ${JSON.stringify(c)})`).join('\n')
    : "A felhasználónak nincs rögzített autója.";

  const eventsText = events.length > 0
    ? events.map(e => `- ${e.event_date}: ${e.event_type} (${e.description}) - Autó: ${e.cars?.make} ${e.cars?.model}`).join('\n')
    : "Nincs szervizelőzmény.";

  // 3. SYSTEM PROMPT - SZIGORÚ KARAKTER UTASÍTÁS
  const systemPrompt = `
    SZEREP: Te a DriveSync alkalmazás VEZETŐ SZERELŐJE vagy.
    
    FONTOS SZABÁLYOK (Szigorúan tartsd be!):
    1. NYELV: KIZÁRÓLAG MAGYARUL beszélj!
    2. STÍLUS: Tömör, szakmai, lényegretörő. Nem vagy költő, nem vagy filozófus.
    3. TILTÁS: SOHA ne értelmezz autós kifejezéseket átvitt értelemben!
       - Példa: Ha a user azt írja "füstöl", az AZT JELENTI, hogy égéstermék távozik a kipufogóból vagy a motortérből. NEM azt jelenti, hogy "hidegen hagy".
       - Példa: Ha a user azt írja "nem húz", az teljesítményvesztést jelent.
    4. ADATBÁZIS HASZNÁLATA: A lenti "ADATOK" részből dolgozz. Ha a user kérdez (pl. "Milyen autóm van?"), pontosan ezeket sorold fel.
    
    ADATOK A FELHASZNÁLÓRÓL:
    Autók:
    ${carsText}
    
    Szerviznapló:
    ${eventsText}
  `;

  // 4. MODELL VÁLASZTÁS ÉS ÜZENET TISZTÍTÁS
  // Megnézzük az utolsó üzenetet.
  const lastMessage = messages[messages.length - 1];
  
  // Ellenőrizzük, hogy van-e benne kép
  let hasImage = false;
  if (Array.isArray(lastMessage.content)) {
    hasImage = lastMessage.content.some((c: any) => c.type === 'image');
  }

  // DÖNTÉS:
  // Ha van kép -> Vision modell (90B)
  // Ha nincs kép -> Text modell (70B) - EZ A KULCS! A 70B Versatile sokkal okosabb, mint a Vision modell szöveges feladatokban.
  const modelToUse = hasImage ? 'llama-3.2-90b-vision-preview' : 'llama-3.3-70b-versatile';

  // ÜZENETEK TISZTÍTÁSA (Groq kompatibilitás)
  const formattedMessages = messages.map((m: any, index: number) => {
    const isLast = index === messages.length - 1;
    let content = m.content;

    // Ha tömb a tartalom
    if (Array.isArray(content)) {
      if (isLast && hasImage) {
        // Ha ez az aktuális képes üzenet, és a Vision modellt használjuk, hagyjuk meg a struktúrát
        return {
          role: m.role,
          content: content.map((c: any) => {
             if(c.type === 'text') return { type: 'text', text: c.text };
             if(c.type === 'image') return { type: 'image', image: c.image };
             return null;
          }).filter(Boolean)
        };
      } 
      
      // Minden más esetben (history, vagy szöveges mód) -> Stringgé alakítjuk
      // KIVESSZÜK A KÉPET A HISTORYBÓL, hogy ne zavarja a 70B modellt
      const textOnly = content
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('\n');
      
      content = textOnly || "[Kép csatolva volt]";
    }

    return { role: m.role, content: content };
  });

  // 5. KÜLDÉS
  const result = streamText({
    model: groq(modelToUse),
    system: systemPrompt,
    messages: formattedMessages,
    temperature: 0.2, // ALACSONY HŐMÉRSÉKLET = Tények, nulla kreativitás
  });

  return result.toTextStreamResponse();
}