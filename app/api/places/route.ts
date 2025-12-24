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

  // --- KATEGÓRIA TÉRKÉP (A lényeg itt van!) ---
  // Ez mondja meg a Google-nek, mit keressen pontosan
  let type = 'car_repair'; // Alapértelmezett
  let keyword = '';       // Opcionális kulcsszó szűkítéshez

  switch (category) {
    case 'towing':
      type = 'towing_service';
      break;
    case 'wash':
      type = 'car_wash';
      break;
    case 'gas':
      type = 'gas_station';
      break;
    case 'electric':
      type = 'electric_vehicle_charging_station';
      break;
    case 'parking':
      type = 'parking';
      break;
    case 'parts':
      type = 'car_dealer'; // Vagy store, de autósboltokra nincs külön type, keyword kell
      keyword = 'auto parts';
      break;
    case 'body':
      type = 'car_repair';
      keyword = 'karosszéria';
      break;
    case 'tire':
      type = 'car_repair';
      keyword = 'gumiszerviz';
      break;
    case 'mechanic':
    default:
      type = 'car_repair';
      break;
  }

  // URL összeállítása (Ha van keyword, azt is beletesszük)
  let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;
  
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
      category: category, // Visszaküldjük az eredeti kategóriát
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      open_now: place.opening_hours?.open_now
    })) : [];

    return NextResponse.json({ partners });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 });
  }
}