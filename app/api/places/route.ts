import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const category = searchParams.get('category'); // 'mechanic', 'towing', etc.

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const radius = 5000; // 5km-es körzet

  // Kategória fordítása Google típusokra
  let googleType = 'car_repair';
  if (category === 'towing') googleType = 'towing_service'; // Autómentő
  else if (category === 'wash') googleType = 'car_wash';
  else if (category === 'tire') googleType = 'car_repair'; // Google nem mindig különbözteti meg

  // Google Places Text Search (vagy Nearby Search) használata
  // Fontos: Ez pénzbe kerülhet nagyobb forgalom esetén!
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${googleType}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    // Átalakítjuk az adatokat a mi formátumunkra
    const formattedPlaces = data.results.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      category: category === 'towing' ? 'towing' : 'mechanic', // Egyszerűsítés
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      open_now: place.opening_hours?.open_now
    }));

    return NextResponse.json({ partners: formattedPlaces });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 });
  }
}