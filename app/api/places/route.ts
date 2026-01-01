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
  const radius = 5000; 

  // --- KATEGÓRIA KONFIGURÁCIÓ ---
  let type = 'car_repair';
  let keyword = '';

  switch (category) {
    case 'towing':
      type = 'towing_service';
      keyword = 'autómentés autómentő';
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
      type = 'store';
      keyword = 'autóalkatrész bárd unix';
      break;
    case 'body':
      type = 'car_repair';
      keyword = 'karosszéria lakatos fényezés';
      break;
    case 'tire':
      type = 'car_repair';
      keyword = 'gumiszerviz gumis';
      break;
    case 'mechanic':
    default:
      type = 'car_repair';
      keyword = 'autószerelő szerviz';
      break;
  }

  // URL összeállítása
  let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&language=hu&key=${apiKey}`;
  
  if (keyword) {
    url += `&keyword=${encodeURIComponent(keyword)}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
       console.error('Google API Error:', data);
    }

    // FONTOS: Place Details hívás lenne szükséges a telefonszámhoz minden találatra, 
    // de az drága (sok API hívás). 
    // EHELYETT: A Nearby Search néha visszaadja, ha nem, akkor Place Details-t csak kattintásra kellene hívni (optimalizáció).
    // MOST: Megpróbáljuk kinyerni, ami van, vagy Place Details-t hívni mindenre (LASSÚ LEHET!).
    // Egyelőre marad a Nearby Search, de tudd, hogy a "phone_number" gyakran üres lesz itt.
    // Ha biztosra akarsz menni, akkor a frontend-en a "Hívás" gomb megnyomásakor kellene lekérni a részleteket.

    const partners = await Promise.all(data.results ? data.results.map(async (place: any) => {
        // OPTIONÁLIS: Részletek lekérése telefonszámért (VIGYÁZZ A QUOTÁRA!)
        // Ha ezt bekapcsolod, minden keresés 20x annyi API hívás!
        // Inkább csak a Place ID-t adjuk vissza, és a frontend kérdezze le kattintáskor.
        // De a kérés szerint "működjön", így itt egy egyszerűsített megoldás:
        
        let phoneNumber = null;
        
        // Ha nagyon kell a telefonszám listázáskor, itt lehetne lekérni:
        // const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number&key=${apiKey}`;
        // const detailRes = await fetch(detailUrl);
        // const detailData = await detailRes.json();
        // phoneNumber = detailData.result?.formatted_phone_number;

        return {
            id: place.place_id,
            name: place.name,
            address: place.vicinity,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            category: category, 
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            open_now: place.opening_hours?.open_now,
            phone_number: phoneNumber // Vagy place.formatted_phone_number ha Text Search-öt használnál
        };
    }) : []);

    return NextResponse.json({ partners });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 });
  }
}