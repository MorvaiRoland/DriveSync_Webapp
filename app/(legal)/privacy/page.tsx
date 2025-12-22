import LegalLayout from '@/components/LegalLayout';

export default function PrivacyPage() {
  return (
    <LegalLayout title="Adatvédelmi Tájékoztató" icon="shield" lastUpdated="2025. december 13.">
      
      <p className="lead text-xl text-slate-400 border-l-4 border-emerald-500 pl-6 italic mb-10">
        A DynamicSense Technologies (a továbbiakban: "Adatkezelő") elkötelezett az Ön személyes adatainak védelme mellett. Jelen tájékoztató célja, hogy az Európai Unió Általános Adatvédelmi Rendeletének (GDPR) megfelelően bemutassa adatkezelési gyakorlatunkat.
      </p>

      <h2 className="text-2xl text-white mt-10 font-bold">1. Az Adatkezelő Adatai</h2>
      <p>
        Az Ön adatainak kezelője a <strong>DynamicSense Technologies</strong>.<br/>
        Székhely: 4251 Hajdúsámson, Sima utca 5/4.<br/>
        E-mail: info.dynamicsense@gmail.com
      </p>

      <h2 className="text-2xl text-white mt-10 font-bold">2. A Kezelt Adatok Köre és Célja</h2>
      <p>A Szolgáltatás használata során az alábbi adatokat kezeljük:</p>
      
      <div className="grid md:grid-cols-2 gap-4 not-prose my-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-white font-bold mb-2">Fiók Adatok</h3>
              <ul className="text-sm text-slate-400 list-disc pl-4 space-y-1">
                  <li><strong>Adat:</strong> Név, Email cím, Titkosított jelszó.</li>
                  <li><strong>Cél:</strong> Felhasználó azonosítása, belépés biztosítása, kapcsolattartás.</li>
                  <li><strong>Jogalap:</strong> Szerződés teljesítése (GDPR 6. cikk (1) b)).</li>
              </ul>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-white font-bold mb-2">Jármű Adatok</h3>
              <ul className="text-sm text-slate-400 list-disc pl-4 space-y-1">
                  <li><strong>Adat:</strong> Rendszám, Alvázszám (VIN), Szerviztörténet, Futásteljesítmény.</li>
                  <li><strong>Cél:</strong> A szoftver alapfunkciójának biztosítása (nyilvántartás, AI diagnosztika).</li>
                  <li><strong>Jogalap:</strong> Szerződés teljesítése.</li>
              </ul>
          </div>
      </div>

      <h2 className="text-2xl text-white mt-10 font-bold">3. Mesterséges Intelligencia (AI) Használata</h2>
      <p>
        A szolgáltatás bizonyos funkciói (pl. "AI Szerelő") harmadik fél által biztosított nagy nyelvi modelleket (LLM) használnak (Google Gemini API).
      </p>
      <ul className="list-disc pl-6 space-y-2 marker:text-amber-500">
          <li><strong>Anonimizálás:</strong> Az AI felé továbbított kérdésekből (pl. hibakód leírása) a rendszerünk törekszik a személyes adatok (pl. nevek, pontos címek) kiszűrésére.</li>
          <li><strong>Adatfeldolgozás:</strong> Az AI szolgáltatója az adatokat a szolgáltatás nyújtása céljából dolgozza fel, és saját adatvédelmi szabályzata szerint kezeli.</li>
          <li>A felhasználó által feltöltött fotók (pl. műszerfal hibaüzenet) elemzése során biometrikus adatot nem gyűjtünk.</li>
      </ul>

      <h2 className="text-2xl text-white mt-10 font-bold">4. Adattovábbítás és Adatfeldolgozók</h2>
      <p>
        Az Ön adatait harmadik félnek marketing célból <strong>nem értékesítjük</strong>. A szolgáltatás működtetéséhez az alábbi adatfeldolgozókat vesszük igénybe:
      </p>
      <ul className="list-disc pl-6 space-y-1 mt-4">
          <li><strong>Supabase Inc.</strong> (Szingapúr/USA) – Adatbázis szolgáltatás.</li>
          <li><strong>Vercel Inc.</strong> (USA) – Webhoszting és szerver funkciók.</li>
          <li><strong>Google Cloud EMEA</strong> (Írország) – AI API szolgáltatások.</li>
      </ul>

      <h2 className="text-2xl text-white mt-10 font-bold">5. Az Ön Jogai</h2>
      <p>Önt megilleti a hozzáférés, a helyesbítés, a törlés ("elfeledtetéshez való jog"), az adatkezelés korlátozása és az adathordozhatóság joga. Jogérvényesítési kérelmét az <a href="mailto:info.dynamicsense@gmail.com" className="text-emerald-500">info.dynamicsense@gmail.com</a> címre küldheti.</p>
      
      <div className="bg-slate-800 p-4 rounded-xl mt-6 text-sm text-slate-300">
          Panaszával a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH) fordulhat (1055 Budapest, Falk Miksa utca 9-11., www.naih.hu).
      </div>

    </LegalLayout>
  );
}