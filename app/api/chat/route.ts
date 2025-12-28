import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { createClient } from '@/supabase/server'; // Standard kliens (User adatokhoz)
import { createClient as createAdminClient } from '@supabase/supabase-js'; // Admin kliens (Számlálóhoz)

export const maxDuration = 30;

export async function POST(req: Request) {
  let messages;
  try {
     const json = await req.json();
     messages = json.messages;
  } catch (e) {
     return new Response('Invalid JSON', { status: 400 });
  }

  // 1. Standard kliens a felhasználó azonosításához és az autók lekéréséhez
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return new Response('Unauthorized', { status: 401 });

  // 2. Admin kliens létrehozása a limit kezeléséhez (RLS megkerülése)
  // Fontos: A SUPABASE_SERVICE_ROLE_KEY-nek benne kell lennie az .env fájlban!
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // --- 3. RATE LIMIT & ELŐFIZETÉS ELLENŐRZÉS ---
  
  // A. Pro státusz lekérése (Ez mehet a sima klienssel)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .eq('status', 'active') 
    .single();

  const isPro = !!subscription;

  // B. Napi limit ellenőrzés és írás (ADMIN KLIENSSEL)
  if (!isPro) {
    const today = new Date().toISOString().split('T')[0];
    const LIMIT = 5;

    // Használat lekérése ADMIN klienssel
    const { data: usage } = await supabaseAdmin
      .from('user_daily_usage')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let currentCount = 0;

    if (usage) {
      if (usage.last_reset_date !== today) {
        currentCount = 0; // Új nap, nullázunk
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

    // Használat növelése ADMIN klienssel (Így biztosan beírja, RLS-től függetlenül)
    const { error: upsertError } = await supabaseAdmin.from('user_daily_usage').upsert({
      user_id: user.id,
      message_count: currentCount + 1,
      last_reset_date: today
    });

    if (upsertError) {
        console.error("Hiba a napi limit mentésekor:", upsertError);
    }
  }

  // --- 4. ADATGYŰJTÉS KONTEXTUSHOZ (Standard klienssel, hogy csak a sajátját lássa) ---
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

  // --- 5. SYSTEM PROMPT ---
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

  // --- 6. AI VÁLASZ GENERÁLÁSA ---
  // Javítva: gemini-1.5-flash a stabil verzió (a 2.5 valószínűleg elírás volt)
  const result = streamText({
    model: google('gemini-2.5-flash'), 
    system: contextText,
    messages, 
  });

  return result.toTextStreamResponse();
}