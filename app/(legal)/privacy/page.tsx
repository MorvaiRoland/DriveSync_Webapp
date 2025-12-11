import LegalLayout from '@/components/LegalLayout'

export default function PrivacyPage() {
  return (
    <LegalLayout title="Adatvédelem">
      <h1>Adatvédelmi Tájékoztató</h1>
      <p className="lead text-xl text-slate-400">Hatályos: 2025. december 10-től</p>

      <h2>1. Az Adatkezelő</h2>
      <p>
        Az Ön adatainak kezelője a <strong>DriveSync Technologies</strong> (részletes adatok az Impresszumban). 
        Elkötelezettek vagyunk a személyes adatok védelme mellett az Európai Unió Általános Adatvédelmi Rendeletének (GDPR) megfelelően.
      </p>

      <h2>2. Kezelt Adatok Köre</h2>
      <ul>
        <li><strong>Fiók adatok:</strong> Email cím, név (a bejelentkezéshez és kapcsolattartáshoz).</li>
        <li><strong>Jármű adatok:</strong> Rendszám, típus, évjárat, alvázszám (opcionális), szerviztörténet, költségek.</li>
        <li><strong>Technikai adatok:</strong> IP cím, böngésző típusa, sütik (a biztonságos működéshez és bejelentkezés fenntartásához).</li>
      </ul>

      <h2>3. Az Adatkezelés Célja</h2>
      <p>
        Az adatokat kizárólag a Szolgáltatás nyújtása érdekében kezeljük:
      </p>
      <ul>
          <li>Autók nyilvántartása és szervizkönyv vezetése.</li>
          <li>Emlékeztetők küldése (pl. műszaki vizsga lejárata).</li>
          <li>Statisztikák készítése a felhasználó számára.</li>
      </ul>
      <p><strong>Fontos:</strong> Adatait harmadik félnek marketing célból soha nem adjuk át.</p>

      <h2>4. Adattárolás és Biztonság</h2>
      <p>
        Adatait az Európai Unión belül, a <strong>Supabase</strong> (PostgreSQL) biztonságos, titkosított szerverein tároljuk. 
        A feltöltött fájlok (pl. dokumentumok fotói) privát, titkosított tárolóban helyezkednek el, amelyekhez csak Ön férhet hozzá.
      </p>
      <p>A fizetési adatokat (bankkártya) nem mi, hanem a <strong>Stripe Inc.</strong> kezeli, PCI-DSS szabványnak megfelelően.</p>

      <h2>5. Az Ön Jogai</h2>
      <p>Önnek bármikor joga van:</p>
      <ul>
        <li><strong>Hozzáférni:</strong> Bármikor letöltheti a rendszerben tárolt adatait (Exportálás funkció).</li>
        <li><strong>Javítani:</strong> Az alkalmazáson belül bármikor módosíthatja adatait.</li>
        <li><strong>Törölni ("Elfeledtetés joga"):</strong> A Fiók beállításokban egy gombnyomással véglegesen törölheti fiókját és minden tárolt adatát.</li>
      </ul>
    </LegalLayout>
  )
}