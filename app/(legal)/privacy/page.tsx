export default function PrivacyPage() {
  return (
    <>
      <h1>Adatvédelmi Tájékoztató</h1>
      <p className="lead">Hatályos: 2025. december 10-től</p>

      <h2>1. Az Adatkezelő</h2>
      <p>
        Az Ön adatainak kezelője a DriveSync Technologies (Impresszum szerinti adatok). 
        Elkötelezettek vagyunk a személyes adatok védelme mellett a GDPR rendeletnek megfelelően.
      </p>

      <h2>2. Kezelt Adatok Köre</h2>
      <ul>
        <li><strong>Fiók adatok:</strong> Email cím, név (a bejelentkezéshez).</li>
        <li><strong>Jármű adatok:</strong> Rendszám, típus, alvázszám (opcionális), szerviztörténet.</li>
        <li><strong>Technikai adatok:</strong> IP cím, böngésző típusa (a biztonságos működéshez).</li>
      </ul>

      <h2>3. Az Adatkezelés Célja</h2>
      <p>
        Az adatokat kizárólag a Szolgáltatás nyújtása (autók nyilvántartása, emlékeztetők küldése) 
        céljából kezeljük. Adatait harmadik félnek marketing célból nem adjuk át.
      </p>

      <h2>4. Adattárolás</h2>
      <p>
        Adatait az Európai Unión belül, a Supabase (PostgreSQL) biztonságos szerverein tároljuk. 
        A fájlok (pl. feltöltött dokumentumok) titkosított tárolóban helyezkednek el.
      </p>

      <h2>5. Az Ön Jogai</h2>
      <p>
        Önnek joga van:
      </p>
      <ul>
        <li>Kérni adataihoz való hozzáférést (Exportálás funkció).</li>
        <li>Kérni adatai helyesbítését.</li>
        <li>Kérni adatai törlését ("Elfeledtetés joga") a Fiók beállításokban.</li>
      </ul>
    </>
  )
}