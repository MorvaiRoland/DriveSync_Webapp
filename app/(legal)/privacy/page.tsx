// app/privacy/page.tsx
import LegalLayout from '@/components/LegalLayout';

export default function PrivacyPage() {
  return (
    <LegalLayout title="Adatvédelmi Tájékoztató" icon="shield" lastUpdated="2025. december 10.">
      
      <p className="lead text-xl text-slate-400 border-l-4 border-emerald-500 pl-6 italic">
        A DriveSync Technologies elkötelezett az Ön személyes adatainak védelme mellett. Jelen tájékoztató célja, hogy közérthetően és transzparensen bemutassa, hogyan kezeljük adatait az Európai Unió Általános Adatvédelmi Rendeletének (GDPR) megfelelően.
      </p>

      <div className="my-12 h-px bg-slate-800 w-full" />

      <h2 className="text-2xl text-white mt-10">1. Az Adatkezelő</h2>
      <p>
        Az Ön adatainak kezelője a <strong>DriveSync Technologies</strong>. Részletes cégadatainkat, elérhetőségeinket és a tárhelyszolgáltatóink listáját a <a href="/impressum">Impresszum</a> menüpont alatt találja meg.
      </p>

      <h2 className="text-2xl text-white mt-10">2. Kezelt Adatok Köre</h2>
      <p>A Szolgáltatás használata során az alábbi adatokat rögzítjük:</p>
      
      <div className="grid md:grid-cols-3 gap-4 not-prose my-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-white font-bold mb-2">Fiók Adatok</h3>
              <p className="text-sm text-slate-400">Email cím, név (az azonosításhoz) és titkosított jelszó hash.</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-white font-bold mb-2">Jármű Adatok</h3>
              <p className="text-sm text-slate-400">Rendszám, alvázszám, szerviztörténet, költségek, fotók.</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-white font-bold mb-2">Telemetria</h3>
              <p className="text-sm text-slate-400">IP cím, böngésző típusa, munkamenet sütik (biztonság).</p>
          </div>
      </div>

      <h2 className="text-2xl text-white mt-10">3. Az Adatkezelés Célja és Jogalapja</h2>
      <p>
        Az adatokat kizárólag a Szolgáltatás nyújtása érdekében (szerződés teljesítése) kezeljük.
      </p>
      <ul className="list-disc pl-6 space-y-2 marker:text-emerald-500">
          <li><strong>Autók nyilvántartása:</strong> Szervizkönyv vezetése, digitális okmánytár.</li>
          <li><strong>Automatizáció:</strong> Értesítések küldése (pl. műszaki vizsga lejárata).</li>
          <li><strong>Analitika:</strong> Személyre szabott statisztikák készítése a felhasználó számára.</li>
      </ul>
      <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-xl my-4 text-emerald-200 text-sm">
          <strong>Marketing nyilatkozat:</strong> Adatait harmadik félnek marketing célból soha, semmilyen körülmények között nem adjuk át és nem értékesítjük.
      </div>

      <h2 className="text-2xl text-white mt-10">4. Adattárolás és Biztonság</h2>
      <p>
        Adatait az Európai Unión belül tároljuk. Infrastruktúránk a <strong>Supabase (PostgreSQL)</strong> rendszerére épül, amely ipari szabványú titkosítást (AES-256) alkalmaz mind a tárolás (at rest), mind az átvitel (in transit) során.
      </p>
      <p>
        A bankkártya-adatokat nem a DriveSync, hanem a <strong>Stripe Inc.</strong> kezeli, amely rendelkezik a legmagasabb szintű PCI-DSS tanúsítvánnyal. Rendszerünk sosem látja és nem tárolja a teljes kártyaadatait.
      </p>

      <h2 className="text-2xl text-white mt-10">5. Az Ön Jogai</h2>
      <p>Az Európai Unió polgáraként Önt az alábbi jogok illetik meg:</p>
      <ul className="space-y-4 my-6 not-prose">
          <li className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1">1</div>
              <div><strong className="text-white block">Hozzáférési jog</strong> Bármikor kérheti a tárolt adatainak másolatát vagy letöltheti azokat az "Exportálás" funkcióval.</div>
          </li>
          <li className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1">2</div>
              <div><strong className="text-white block">Helyesbítési jog</strong> Az alkalmazáson belül bármikor módosíthatja pontatlan adatait.</div>
          </li>
          <li className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1">3</div>
              <div><strong className="text-white block">Törléshez való jog ("Elfeledtetés")</strong> A Fiók beállításokban egy gombnyomással véglegesen törölheti profilját. Ekkor rendszereinkből minden adata helyreállíthatatlanul törlődik.</div>
          </li>
      </ul>
    </LegalLayout>
  );
}