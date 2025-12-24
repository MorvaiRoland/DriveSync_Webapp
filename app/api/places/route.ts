import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const category = searchParams.get('category'); 

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const radius = 5000; // 5km-es körzet

  // --- KATEGÓRIA KONFIGURÁCIÓ (Magyarítva és pontosítva) ---
  let type = 'car_repair'; // Alapértelmezett Google típus
  let keyword = '';       // Kulcsszó a szűkítéshez

  switch (category) {
    case 'towing':
      type = 'towing_service';
      keyword = 'autómentés autómentő'; // Két szót is megadhatunk a biztonság kedvéért
      break;
    case 'wash':
      type = 'car_wash';
      keyword = 'autómosó';
      break;
    case 'gas':
      type = 'gas_station';
      keyword = 'benzinkút';
      break;
    case 'electric':
      type = 'electric_vehicle_charging_station';
      keyword = 'elektromos töltő';
      break;
    case 'parking':
      type = 'parking';
      keyword = 'parkoló';
      break;
    case 'parts':
      type = 'store'; // A 'car_dealer' helyett a 'store' jobb alkatrészboltra
      keyword = 'autóalkatrész bárd unix'; // Beírhatsz nagy márkákat is a pontosságért
      break;
    case 'body':
      type = 'car_repair';
      keyword = 'karosszéria lakatos fényezés'; // Specifikus szűrés
      break;
    case 'tire':
      type = 'car_repair';
      keyword = 'gumiszerviz gumis'; // Így nem ad ki sima autószerelőt
      break;
    case 'mechanic':
    default:
      type = 'car_repair';
      keyword = 'autószerelő szerviz'; // Így nem ad ki gumist vagy fényezőt
      break;
  }

  // URL összeállítása
  // FONTOS: Hozzáadtuk a &language=hu paramétert!
  let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&language=hu&key=${apiKey}`;
  
  // Ha van kulcsszó, hozzáfűzzük. Ez a legfontosabb a pontossághoz.
  if (keyword) {
    url += `&keyword=${encodeURIComponent(keyword)}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
       console.error('Google API Error:', data);
    }

    const partners = data.results ? data.results.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      category: category, 
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      open_now: place.opening_hours?.open_now
    })) : [];

    return NextResponse.json({ partners });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 });
  }
}