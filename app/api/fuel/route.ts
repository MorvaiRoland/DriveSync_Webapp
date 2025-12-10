import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET() {
  try {
    // 1. Letöltjük a weboldal HTML-jét
    // Fontos a User-Agent, hogy böngészőnek higgye a kérésünket
    const response = await fetch('https://holtankoljak.hu/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      next: { revalidate: 3600 } // Gyorsítótárazás 1 órára
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);

    // 2. Adatok kinyerése a képek alapján
    // A képen látható szerkezet: <div class="price ..."> ... Átlag ... <span class="ar">566.5</span> ... </div>
    
    const prices: number[] = [];

    // Megkeressük az összes "price" osztályú dobozt
    $('.price').each((i, elem) => {
      const fullText = $(elem).text();
      
      // Csak azt a dobozt nézzük, amiben benne van, hogy "Átlag" (mert van Minimum és Maximum is)
      if (fullText.includes('Átlag')) {
        // Megkeressük benne a .ar osztályú span-t (ez a konkrét szám a képeden)
        const priceText = $(elem).find('.ar').text().trim();
        const price = parseFloat(priceText); // pl. "566.5" -> 566.5
        
        if (!isNaN(price)) {
          prices.push(price);
        }
      }
    });

    // 3. Hozzárendelés a típusokhoz
    // A holtankoljak.hu sorrendje általában: 1. Benzin 95, 2. Gázolaj, 3. 100-as (Prémium)
    // Ha nem talál adatot, a fallback értékeket használjuk (|| után)
    
    const benzinPrice = prices[0] || 610; 
    const dieselPrice = prices[1] || 620;
    const premiumPrice = prices[2] || (benzinPrice + 50); // Ha nincs 3. adat, becsüljük

    // 4. Adatok formázása a Widget számára
    const data = [
      { 
        type: '95', 
        name: 'Benzin', 
        price: Math.round(benzinPrice), // Kerekítjük egész számra a kijelzéshez
        color: 'text-emerald-600', 
        bg: 'bg-emerald-100 dark:bg-emerald-500/20' 
      },
      { 
        type: 'D', 
        name: 'Gázolaj', 
        price: Math.round(dieselPrice), 
        color: 'text-slate-700 dark:text-slate-300', 
        bg: 'bg-slate-200 dark:bg-slate-700' 
      },
      { 
        type: '100', 
        name: 'Prémium', 
        price: Math.round(premiumPrice), 
        color: 'text-blue-600', 
        bg: 'bg-blue-100 dark:bg-blue-500/20' 
      },
    ];

    return NextResponse.json(data);

  } catch (error) {
    console.error('Scraping error:', error);
    // Hiba esetén visszaadunk egy alapértelmezett listát, hogy ne omoljon össze a widget
    return NextResponse.json([
        { type: '95', name: 'Benzin', price: 0, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
        { type: 'D', name: 'Gázolaj', price: 0, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-200 dark:bg-slate-700' },
        { type: '100', name: 'Prémium', price: 0, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/20' },
    ]);
  }
}