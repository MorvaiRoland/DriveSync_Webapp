import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 py-12 px-4 transition-colors duration-300">
      
      <div className="max-w-3xl mx-auto">
        {/* Vissza gomb */}
        <Link href="/" className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-500 font-bold mb-8 hover:underline">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Vissza az alkalmazásba
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 md:p-12 border border-slate-200 dark:border-slate-800">
          
          <h1 className="text-3xl md:text-4xl font-black mb-2 text-slate-900 dark:text-white">Adatkezelési Tájékoztató</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Utolsó frissítés: {new Date().toLocaleDateString('hu-HU')}</p>

          <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Bevezetés</h2>
              <p>
                Jelen tájékoztató célja, hogy világos és érthető információt nyújtson arról, hogyan kezeljük az Ön által a "Garázs" alkalmazás "Digitális Kesztyűtartó" funkciójába feltöltött dokumentumokat és személyes adatokat. Elkötelezettek vagyunk az Ön adatainak védelme mellett.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Kezelt adatok köre</h2>
              <p>
                A rendszer lehetőséget biztosít gépjárművel kapcsolatos dokumentumok digitális tárolására. Az Ön döntése alapján feltöltött fájlok (pl. képek, PDF-ek) tartalmazhatnak:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Gépjármű forgalmi engedélyének másolatát.</li>
                <li>Biztosítási kötvényeket.</li>
                <li>Szervizszámlákat és munkalapokat.</li>
                <li>Egyéb, a járműhöz kapcsolódó iratokat.</li>
              </ul>
              <p className="mt-2">
                Ezen dokumentumok tartalmazhatnak személyes adatokat (pl. név, lakcím, rendszám, alvázszám), melyeket a rendszer kizárólag tárolás céljából kezel.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Az adatkezelés célja</h2>
              <p>
                Az adatkezelés kizárólagos célja a felhasználó kényelmének biztosítása: a gépjármű-nyilvántartás megkönnyítése, a karbantartási előzmények digitalizálása és a papíralapú dokumentumok digitális elérhetőségének biztosítása a felhasználó számára.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                4. Adatbiztonság és Tárolás
              </h2>
              <p>
                Az Ön adatait kiemelt biztonsági intézkedések mellett tároljuk:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>
                  <strong>Titkosított Tárolás:</strong> A fájlok a <a href="https://supabase.com/security" target="_blank" className="text-amber-600 underline">Supabase</a> biztonságos felhőalapú tárhelyén (Storage) kerülnek elhelyezésre. Az adatbázis és a fájltároló közötti kommunikáció SSL/TLS titkosítással történik.
                </li>
                <li>
                  <strong>Privát Hozzáférés:</strong> A tárolt dokumentumok úgynevezett "Private Bucket"-ben helyezkednek el. Ez azt jelenti, hogy a fájlok nem érhetők el nyilvános internetes linkeken keresztül.
                </li>
                <li>
                  <strong>Szigorú Jogosultságkezelés (RLS):</strong> A rendszer sorszintű biztonsági házirendeket (Row Level Security) alkalmaz. Ez garantálja, hogy az Ön által feltöltött dokumentumokhoz <strong>kizárólag Ön férhet hozzá</strong> a saját felhasználói fiókjával. Még más regisztrált felhasználók sem láthatják az Ön adatait.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Az Ön jogai (Törlés és Hozzáférés)</h2>
              <p>
                Ön a saját adataival teljes mértékben rendelkezik:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Bármikor megtekintheti és letöltheti a feltöltött dokumentumokat.</li>
                <li><strong>Azonnali törlés:</strong> A felületen található "Törlés" (kuka ikon) gombbal bármikor véglegesen törölheti a feltöltött fájlokat. A törlés után az adat fizikailag is eltávolításra kerül a szerverről, és nem állítható vissza.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Harmadik fél</h2>
              <p>
                A feltöltött dokumentumokat harmadik félnek nem adjuk át, nem értékesítjük, és nem használjuk fel marketing célokra. Az adatokhoz kizárólag a technikai szolgáltató (Supabase Inc.) férhet hozzá a szolgáltatás biztosítása érdekében, szigorú adatfeldolgozási szerződés keretein belül.
              </p>
            </section>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-sm font-medium">Amennyiben kérdése van az adatkezeléssel kapcsolatban, kérjük lépjen kapcsolatba velünk.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}