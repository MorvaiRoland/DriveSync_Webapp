import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createClient } from 'supabase/server';

export const maxDuration = 30;

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  // 1. Biztonságos hibakezelés az elején
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

  // 2. Adatok lekérése
  const [carsRes, eventsRes] = await Promise.all([
    supabase.from('cars').select('*').eq('user_id', user.id),
    supabase.from('events').select('*, cars(make, model)').eq('user_id', user.id).order('event_date', { ascending: false }).limit(30)
  ]);

  const cars = carsRes.data || [];
  const events = eventsRes.data || [];

  // 3. Adatok formázása szöveges listává (hogy az AI biztosan megértse)
  const carDetails = cars.map((c: any) => 
    `- ${c.make} ${c.model} (${c.year || '?'}. évjárat). Rendszám: ${c.license_plate || '-'}, Motor: ${c.engine || c.horsepower || 'Nincs adat'}, Alvázszám: ${c.vin || '-'}`
  ).join('\n');

  const eventDetails = events.map((e: any) => 
    `- Dátum: ${e.event_date}, Típus: ${e.event_type}, Leírás: ${e.description || '-'}, Autó: ${e.cars?.make || ''} ${e.cars?.model || ''}`
  ).join('\n');

  // 4. DINAMIKUS MODELL VÁLASZTÁS ÉS TARTALOM KEZELÉS
  // Megnézzük az utolsó üzenetet: Van benne kép?
  const lastMessage = messages[messages.length - 1];
  const hasImage = Array.isArray(lastMessage.content) && lastMessage.content.some((c: any) => c.type === 'image');

  // HA VAN KÉP -> Vision modell (90B Vision)
  // HA NINCS KÉP -> A legerősebb Text modell (70B Versatile) - Ez sokkal okosabb adatbázis kérdésekben!
  const activeModelId = hasImage 
    ? 'llama-3.2-90b-vision-preview' 
    : 'llama-3.3-70b-versatile'; 

  console.log(`Using Model: ${activeModelId} | Has Image: ${hasImage}`);

  // 5. System Prompt (Az adatokkal)
  const systemPrompt = `
    SZEREP: DriveSync profi magyar autószerelő AI.
    
    TÉNYEK A FELHASZNÁLÓRÓL (ADATBÁZIS):
    JÁRMŰVEK:
    ${carDetails || "Nincs rögzített jármű."}
    
    SZERVIZNAPLÓ:
    ${eventDetails || "Nincs rögzített esemény."}
    
    SZABÁLYOK:
    1. **CSAK MAGYARUL** válaszolj.
    2. Ha a felhasználó a saját autójáról kérdez (pl. "Milyen autóm van?", "Mikor volt szervizben?"), a fenti "TÉNYEK" alapján válaszolj pontosan.
    3. Ha hiányzik adat (pl. lóerő), jelezd udvariasan, és adj becslést a típus alapján.
    4. Legyél tömör és segítőkész.
  `;

  // 6. Üzenetek tisztítása (History Flattening)
  // Ez elengedhetetlen, hogy a Groq ne akadjon ki a korábbi képektől vagy formátumoktól.
  const processedMessages = messages.map((m: any, index: number) => {
    const isLast = index === messages.length - 1;
    let content = m.content;

    if (Array.isArray(content)) {
      // Ha ez az utolsó üzenet és VAN benne kép -> Hagyjuk meg a struktúrát a Vision modellnek
      if (isLast && hasImage) {
        return {
          role: m.role,
          content: content.map((c: any) => {
             if(c.type === 'text') return { type: 'text', text: c.text };
             if(c.type === 'image') return { type: 'image', image: c.image }; // Base64 átengedése
             return null;
          }).filter(Boolean)
        };
      } 
      
      // Minden más esetben (History vagy sima szöveges üzenet) -> Sima stringgé alakítjuk
      const textPart = content
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('\n');
        
      content = textPart || (content.some((c: any) => c.type === 'image') ? "[Kép feltöltve]" : "");
    }

    return { role: m.role, content: content };
  });

  // 7. API Hívás
  try {
    const result = streamText({
      model: groq(activeModelId), // Itt váltunk a 70B (okos) és 90B (látó) között
      system: systemPrompt,
      messages: processedMessages,
      onFinish: (ev) => {
         // Opcionális: Logolhatod a használatot
      }
    });

    return result.toTextStreamResponse();
    
  } catch (error) {
    console.error("Groq API Error:", error);
    return new Response("Hiba történt a válasz generálása közben.", { status: 500 });
  }
}