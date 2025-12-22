import LegalLayout from '@/components/LegalLayout';

export default function PrivacyPage() {
  return (
    <LegalLayout title="Adatvédelmi Tájékoztató" icon="shield" lastUpdated="2025. december 13.">
      
      <div className="bg-slate-50 dark:bg-slate-900/50 border-l-4 border-emerald-500 p-6 rounded-r-xl mb-10">
        <p className="text-xl text-slate-800 dark:text-slate-200 leading-relaxed font-medium italic">
          A DynamicSense Technologies (a továbbiakban: "Adatkezelő") elkötelezett az Ön személyes adatainak védelme mellett. Jelen tájékoztató célja, hogy az Európai Unió Általános Adatvédelmi Rendeletének (GDPR) megfelelően bemutassa adatkezelési gyakorlatunkat.
        </p>
      </div>

      <h2 className="text-2xl text-slate-900 dark:text-white mt-12 mb-4 font-bold border-b border-slate-200 dark:border-slate-800 pb-2">1. Az Adatkezelő Adatai</h2>
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          Az Ön adatainak kezelője a <strong>DynamicSense Technologies</strong>.<br/>
          Székhely: 4251 Hajdúsámson, Sima utca 5/4.<br/>
          E-mail: <a href="mailto:info.dynamicsense@gmail.com" className="text-emerald-600 dark:text-emerald-500 hover:underline">info.dynamicsense@gmail.com</a>
        </p>
      </div>

      <h2 className="text-2xl text-slate-900 dark:text-white mt-12 mb-4 font-bold border-b border-slate-200 dark:border-slate-800 pb-2">2. A Kezelt Adatok Köre és Célja</h2>
      <p className="text-slate-700 dark:text-slate-300 mb-6">A Szolgáltatás használata során az alábbi adatokat kezeljük:</p>
      
      <div className="grid md:grid-cols-2 gap-6 not-prose">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-slate-900 dark:text-white font-bold mb-4 text-lg border-b border-slate-100 dark:border-slate-800 pb-2">Fiók Adatok</h3>
              <ul className="text-sm text-slate-700 dark:text-slate-300 list-disc pl-4 space-y-2">
                  <li><strong>Adat:</strong> Név, Email cím, Titkosított jelszó.</li>
                  <li><strong>Cél:</strong> Felhasználó azonosítása, belépés biztosítása, kapcsolattartás.</li>
                  <li><strong>Jogalap:</strong> Szerződés teljesítése (GDPR 6. cikk (1) b)).</li>
              </ul>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-slate-900 dark:text-white font-bold mb-4 text-lg border-b border-slate-100 dark:border-slate-800 pb-2">Jármű Adatok</h3>
              <ul className="text-sm text-slate-700 dark:text-slate-300 list-disc pl-4 space-y-2">
                  <li><strong>Adat:</strong> Rendszám, Alvázszám (VIN), Szerviztörténet, Futásteljesítmény.</li>
                  <li><strong>Cél:</strong> A szoftver alapfunkciójának biztosítása (nyilvántartás, AI diagnosztika).</li>
                  <li><strong>Jogalap:</strong> Szerződés teljesítése.</li>
              </ul>
          </div>
      </div>

      <h2 className="text-2xl text-slate-900 dark:text-white mt-12 mb-4 font-bold border-b border-slate-200 dark:border-slate-800 pb-2">3. Mesterséges Intelligencia (AI) Használata</h2>
      <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
        <p>
            A szolgáltatás bizonyos funkciói (pl. "AI Szerelő") harmadik fél által biztosított nagy nyelvi modelleket (LLM) használnak (Google Gemini API).
        </p>
        <ul className="marker:text-amber-500">
            <li><strong>Anonimizálás:</strong> Az AI felé továbbított kérdésekből (pl. hibakód leírása) a rendszerünk törekszik a személyes adatok (pl. nevek, pontos címek) kiszűrésére.</li>
            <li><strong>Adatfeldolgozás:</strong> Az AI szolgáltatója az adatokat a szolgáltatás nyújtása céljából dolgozza fel, és saját adatvédelmi szabályzata szerint kezeli.</li>
            <li>A felhasználó által feltöltött fotók (pl. műszerfal hibaüzenet) elemzése során biometrikus adatot nem gyűjtünk.</li>
        </ul>
      </div>

      <h2 className="text-2xl text-slate-900 dark:text-white mt-12 mb-4 font-bold border-b border-slate-200 dark:border-slate-800 pb-2">4. Adattovábbítás és Adatfeldolgozók</h2>
      <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <p className="text-slate-700 dark:text-slate-300 mb-4">
            Az Ön adatait harmadik félnek marketing célból <strong>nem értékesítjük</strong>. A szolgáltatás működtetéséhez az alábbi adatfeldolgozókat vesszük igénybe:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-slate-700 dark:text-slate-300 font-medium">
            <li><strong>Supabase Inc.</strong> (Szingapúr/USA) – Adatbázis szolgáltatás.</li>
            <li><strong>Vercel Inc.</strong> (USA) – Webhoszting és szerver funkciók.</li>
            <li><strong>Google Cloud EMEA</strong> (Írország) – AI API szolgáltatások.</li>
        </ul>
      </div>

      <h2 className="text-2xl text-slate-900 dark:text-white mt-12 mb-4 font-bold border-b border-slate-200 dark:border-slate-800 pb-2">5. Az Ön Jogai</h2>
      <p className="text-slate-700 dark:text-slate-300 mb-6">Önt megilleti a hozzáférés, a helyesbítés, a törlés ("elfeledtetéshez való jog"), az adatkezelés korlátozása és az adathordozhatóság joga. Jogérvényesítési kérelmét az <a href="mailto:info.dynamicsense@gmail.com" className="text-emerald-700 dark:text-emerald-500 font-bold underline">info.dynamicsense@gmail.com</a> címre küldheti.</p>
      
      <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium shadow-sm">
          Panaszával a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH) fordulhat (1055 Budapest, Falk Miksa utca 9-11., www.naih.hu).
      </div>

    </LegalLayout>
  );
}