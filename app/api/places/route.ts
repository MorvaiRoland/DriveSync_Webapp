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
  const radius = 5000; // 5km

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

  // 1. Lépés: Keresés (Nearby Search)
  let searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&language=hu&key=${apiKey}`;
  
  if (keyword) {
    searchUrl += `&keyword=${encodeURIComponent(keyword)}`;
  }

  try {
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
       console.error('Google Search API Error:', searchData);
    }

    const results = searchData.results || [];

    // 2. Lépés: Részletek lekérése (Details) a telefonszámért
    // Limitáljuk 12 találatra a sebesség és API költségek miatt
    const limitedResults = results.slice(0, 12);

    const partners = await Promise.all(limitedResults.map(async (place: any) => {
        let phoneNumber = null;
        let openingText = null;

        try {
            // Itt kérjük le a telefonszámot (formatted_phone_number) és a nyitvatartást
            const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,opening_hours&language=hu&key=${apiKey}`;
            const detailRes = await fetch(detailUrl);
            const detailData = await detailRes.json();

            if (detailData.result) {
                phoneNumber = detailData.result.formatted_phone_number;
                
                // Ha van nyitvatartás szöveg, pl. "Jelenleg nyitva" vagy a mai nap
                if (detailData.result.opening_hours?.weekday_text) {
                    const todayIndex = (new Date().getDay() + 6) % 7; // Hétfő = 0 korrekció
                    openingText = detailData.result.opening_hours.weekday_text[todayIndex];
                }
            }
        } catch (err) {
            console.error('Detail fetch error:', err);
        }

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
            phone_number: phoneNumber, // MOST MÁR ITT LESZ A SZÁM!
            opening_text: openingText
        };
    }));

    return NextResponse.json({ partners });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 });
  }
}