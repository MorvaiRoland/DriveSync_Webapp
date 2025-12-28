import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { createClient } from '@/supabase/server'; // Használd a helyes import utat!

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

  // --- 1. RATE LIMIT & ELŐFIZETÉS ELLENŐRZÉS ---
  
  // A. Megnézzük, van-e aktív Pro előfizetése (Opcionális, ha a DB-ben van subscriptions tábla)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .eq('status', 'active') // Vagy ami a te logikád (pl. 'pro', 'trial')
    .single();

  const isPro = !!subscription; // True, ha van találat

  // B. Ha NEM Pro, ellenőrizzük a napi limitet
  if (!isPro) {
    const today = new Date().toISOString().split('T')[0];
    const LIMIT = 5;

    // Lekérjük a mai használatot
    const { data: usage } = await supabase
      .from('user_daily_usage')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let currentCount = 0;

    if (usage) {
      // Ha a dátum nem a mai, akkor nullázódik (virtuálisan)
      if (usage.last_reset_date !== today) {
        currentCount = 0;
      } else {
        currentCount = usage.message_count;
      }
    }

    // Ha elérte a limitet, ERROR-t küldünk vissza
    if (currentCount >= LIMIT) {
      return new Response(JSON.stringify({ 
        error: 'LIMIT_REACHED', 
        message: 'Elérted a napi limitet (5 üzenet).' 
      }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Ha még nem érte el, növeljük a számlálót
    // (Nem várjuk meg a 'await'-et, hogy gyorsabb legyen a válasz, de hibakezelés miatt érdemes lehet)
    await supabase.from('user_daily_usage').upsert({
      user_id: user.id,
      message_count: currentCount + 1,
      last_reset_date: today
    });
  }

  // --- 2. ADATGYŰJTÉS KONTEXTUSHOZ ---
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

  // --- 3. SYSTEM PROMPT ---
  const contextText = `
    TE VAGY A DRIVESYNC AI SZERELŐ.
    
    A felhasználó autói: ${JSON.stringify(cars)}
    Szerviznapló: ${JSON.stringify(events)}
    
    KÉPESSÉGEK:
    - Képes vagy elemezni a felhasználó által feltöltött képeket (pl. műszerfal hibajelzések, motortér, sérülések).
    - Ha képet kapsz, elemezd a látható problémát, és adj tanácsot.
    - Ha hibakódot látsz, magyarázd el.
    - Mindig a felhasználó konkrét autójára hivatkozz, ha felismered az adatokból.
    
    Válaszolj magyarul, szakmailag, de érthetően, röviden és tömören.
  `;

  // --- 4. AI VÁLASZ GENERÁLÁSA ---
  const result = streamText({
    model: google('gemini-2.5-flash'), // Jelenleg a 1.5 Flash a stabil és gyors verzió
    system: contextText,
    messages, // A képet a frontend base64-ben küldi a messages tömbben, a Vercel AI SDK ezt kezeli
  });

  return result.toTextStreamResponse();
}