import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Általános Szerződési Feltételek | DynamicSense',
  description: 'A DynamicSense platform igénybevételének feltételei és szabályai.',
}

export default function TermsPage() {
  const lastUpdated = '2026. június 1.'
  const effectiveDate = '2026. január 1.'

  return (
    <article>
      {/* Hero */}
      <div className="not-prose mb-12 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-widest mb-5">
          Jogi dokumentum
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Általános Szerződési<br />
          <span className="text-amber-500">Feltételek</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl">
          Jelen dokumentum szabályozza a DynamicSense digitális járműkövetési platform igénybevételének feltételeit.
        </p>
        <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-400 dark:text-slate-500">
          <span>📅 Hatályba lépés: <strong className="text-slate-600 dark:text-slate-300">{effectiveDate}</strong></span>
          <span>🔄 Utolsó módosítás: <strong className="text-slate-600 dark:text-slate-300">{lastUpdated}</strong></span>
          <span>🏢 DynamicSense Technologies Kft.</span>
        </div>
      </div>

      {/* 1 */}
      <h2>1. Az ÁSZF hatálya és elfogadása</h2>
      <p>
        Jelen Általános Szerződési Feltételek (a továbbiakban: <strong>ÁSZF</strong>) a DynamicSense Technologies Kft. (a továbbiakban: <strong>Szolgáltató</strong>) által üzemeltetett <strong>DynamicSense</strong> digitális járműkövetési és szerviznyilvántartási platform (a továbbiakban: <strong>Platform</strong> vagy <strong>Alkalmazás</strong>) igénybevételének feltételeit szabályozzák.
      </p>
      <p>
        A Platform bármilyen formában történő használatával a Felhasználó maradéktalanul elfogadja jelen ÁSZF rendelkezéseit. Amennyiben a Felhasználó a feltételeket nem fogadja el, köteles tartózkodni a Platform igénybevételétől.
      </p>

      {/* 2 */}
      <h2>2. A Szolgáltató adatai</h2>
      <ul>
        <li><strong>Cégnév:</strong> DynamicSense Technologies Kft.</li>
        <li><strong>Székhely:</strong> Magyarország</li>
        <li><strong>Elérhetőség:</strong> support@dynamicsense.hu</li>
        <li><strong>Weboldal:</strong> dynamicsense.hu</li>
      </ul>

      {/* 3 */}
      <h2>3. A Platform leírása és szolgáltatások</h2>
      <p>A DynamicSense Platform az alábbi főbb funkciókat biztosítja a Felhasználók számára:</p>
      <ul>
        <li><strong>Járműnyilvántartás:</strong> Személygépjárművek digitális szervizkönyvének vezetése, szerviztörténet rögzítése és kezelése.</li>
        <li><strong>Költségkövetés és elemzés:</strong> Üzemanyag- és karbantartási kiadások nyomon követése, vizuális statisztikák és előrejelzések.</li>
        <li><strong>AI Szerelő asszisztens:</strong> Mesterséges intelligencia alapú járműdiagnosztikai tanácsadás (Pro előfizetők számára).</li>
        <li><strong>Kereskedői funkciók:</strong> Járművek hirdetése a beépített piactéren, kereskedői adatlapok generálása.</li>
        <li><strong>PDF riport generálás:</strong> Professzionális járműriportok exportálása PDF formátumban.</li>
        <li><strong>Emlékeztető rendszer:</strong> Szerviz- és kötelező biztosítási emlékeztetők automatikus e-mail értesítéssel.</li>
        <li><strong>Térkép és helyszínkereső:</strong> Közeli szervizek, benzinkutak és parkolók megjelenítése.</li>
      </ul>

      {/* 4 */}
      <h2>4. Regisztráció és fiókkezelés</h2>
      <h3>4.1 Regisztrációs feltételek</h3>
      <p>
        A Platform teljes funkcionalitásának eléréséhez regisztráció szükséges. A regisztrációhoz a Felhasználónak érvényes e-mail-cím megadása és egy biztonságos jelszó beállítása szükséges. A Felhasználó kijelenti, hogy 18 éven felüli, cselekvőképes természetes személy, vagy jogszerűen eljáró szervezet képviselője.
      </p>
      <h3>4.2 Fiókbiztonság</h3>
      <p>
        A Felhasználó felelős fiókja hozzáférési adatainak (e-mail cím, jelszó) biztonságos megőrzéséért. A fiókkal végzett valamennyi tevékenységért a Felhasználó teljes felelősséget vállal. Jogosulatlan hozzáférés gyanúja esetén a Felhasználó köteles haladéktalanul értesíteni a Szolgáltatót a support@dynamicsense.hu e-mail-címen.
      </p>

      {/* 5 */}
      <h2>5. Előfizetési csomagok és díjazás</h2>
      <h3>5.1 Elérhető csomagok</h3>
      <p>A Platform az alábbi előfizetési konstrukciókat kínálja:</p>
      <ul>
        <li><strong>Starter (Ingyenes):</strong> Korlátozott funkcionalitás, 1 jármű, alapvető nyilvántartás.</li>
        <li><strong>Pro (Havidíjas):</strong> Korlátlan járműnyilvántartás, AI Szerelő, VIN-kereső, fejlett statisztikák.</li>
        <li><strong>Founder Edition (Örökös):</strong> Minden Pro funkció, egyszeri vásárlással, korlátlan hozzáférés.</li>
      </ul>
      <h3>5.2 Fizetési feltételek</h3>
      <p>
        A díjköteles csomagok előfizetési díja a Stripe biztonságos fizetési platformon keresztül kerül kiegyenlítésre. A Felhasználó a fizetési adatait közvetlenül a Stripe-nak adja meg; a Szolgáltató bankkártya-adatokat nem tárol. Az előfizetés az időszak végén automatikusan megújul, kivéve, ha a Felhasználó azt a megújulás előtt lemondja.
      </p>
      <h3>5.3 Lemondás és visszatérítés</h3>
      <p>
        A havidíjas előfizetés a számlázási felületen bármikor lemondható. Lemondás esetén az előfizetés a már kifizetett időszak végéig aktív marad. Az Örökös (Founder Edition) csomagra visszatérítés nem igényelhető a vásárlástól számított 14 napon túl, kivéve, ha jogszabály ettől eltérően rendelkezik.
      </p>

      {/* 6 */}
      <h2>6. A Felhasználó kötelezettségei és tiltott tevékenységek</h2>
      <p>A Platform igénybevétele során tilos:</p>
      <ul>
        <li>Valótlan, félrevezető vagy mások személyes adatait tartalmazó tartalom feltöltése.</li>
        <li>A Platform automatizált eszközökkel (bot, scraper, crawler) történő igénybevétele.</li>
        <li>A Platform üzleti célú viszonteladása, licencelése a Szolgáltató előzetes írásbeli engedélye nélkül.</li>
        <li>A Platform biztonsági rendszereinek megkerülésére tett kísérlet.</li>
        <li>Más Felhasználók zavarása, zaklatása vagy jogaiknak sérelme.</li>
        <li>Jogszabályba ütköző, szerzői jogi vagy személyiségi jogokat sértő tartalmak közzététele.</li>
      </ul>

      {/* 7 */}
      <h2>7. Szellemi tulajdon</h2>
      <p>
        A Platform és annak összes eleme – beleértve a szoftvert, felhasználói felületet, grafikákat, logókat, szövegeket, adatbázisstruktúrákat és az AI-algoritmusokat – a Szolgáltató kizárólagos szellemi tulajdonát képezi, és szerzői jogi védelem alatt áll. A Felhasználó a Platform igénybevételével nem szerez szellemi tulajdonjogot a Platform egyetlen elemére sem.
      </p>
      <p>
        A Felhasználó által a Platformra feltöltött adatok (járműadatok, szerviznapló, képek) a Felhasználó tulajdonát képezik. A Felhasználó a feltöltéssel nem kizárólagos, ingyenes licencet ad a Szolgáltatónak az adatok tárolására és a Szolgáltatás nyújtásához szükséges feldolgozására.
      </p>

      {/* 8 */}
      <h2>8. Adatvédelem</h2>
      <p>
        A személyes adatok kezelésére vonatkozó részletes szabályokat az <a href="/privacy">Adatvédelmi Tájékoztató</a> tartalmazza, amely jelen ÁSZF elválaszthatatlan részét képezi. A Szolgáltató az adatkezelés során betartja az Európai Unió Általános Adatvédelmi Rendeletének (GDPR – 2016/679/EU rendelet) és a hatályos magyar adatvédelmi jogszabályok rendelkezéseit.
      </p>

      {/* 9 */}
      <h2>9. Felelősségkorlátozás</h2>
      <p>
        A Platform az AI Szerelő funkció által nyújtott tanácsok tájékoztató jellegűek és nem helyettesítik a képzett gépjárműszakember személyes szakvéleményét. A Szolgáltató nem vállal felelősséget az AI által adott tanácsok alapján hozott döntések következményeiért.
      </p>
      <p>
        A Szolgáltató a Platform elérhetőségét „ahogy van" (as-is) alapon biztosítja, és nem garantál 100%-os rendelkezésre állást. Tervezett karbantartásokról a Szolgáltató előzetesen értesíti a Felhasználókat. A Szolgáltató nem felelős a rajta kívül álló okok (vis major, harmadik fél infrastruktúra-hibája) miatti szolgáltatáskimaradásokért.
      </p>

      {/* 10 */}
      <h2>10. A szerződés módosítása és megszűnése</h2>
      <p>
        A Szolgáltató jogosult jelen ÁSZF-et egyoldalúan módosítani. A módosításokról a Felhasználókat e-mailben és/vagy a Platformon belüli értesítéssel tájékoztatja, legalább 15 nappal a hatálybalépés előtt. A módosítást követő Platform-használat a módosított ÁSZF elfogadását jelenti.
      </p>
      <p>
        A Felhasználó fiókját bármikor törölheti a Beállítások menüben. A Szolgáltató jogosult a Felhasználó hozzáférését azonnali hatállyal korlátozni vagy megszüntetni, ha a Felhasználó jelen ÁSZF-et súlyosan megszegi.
      </p>

      {/* 11 */}
      <h2>11. Irányadó jog és jogvita-rendezés</h2>
      <p>
        Jelen ÁSZF-re a magyar jog az irányadó. A felek közötti jogvitát elsősorban tárgyalásos úton kísérlik meg rendezni. Sikertelen egyeztetés esetén a felek alávetik magukat a hatáskörrel és illetékességgel rendelkező magyar bíróság kizárólagos joghatóságának.
      </p>
      <p>
        Fogyasztói jogvita esetén a Felhasználó a lakóhelye szerinti illetékes Békéltető Testülethez is fordulhat. Az online vitarendezési platform (ODR) elérhető: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>
      </p>

      {/* 12 */}
      <h2>12. Kapcsolat</h2>
      <p>
        Jelen ÁSZF-fel kapcsolatos kérdések, észrevételek esetén kérjük, vegye fel a kapcsolatot ügyfélszolgálatunkkal:
      </p>
      <ul>
        <li><strong>E-mail:</strong> <a href="mailto:support@dynamicsense.hu">support@dynamicsense.hu</a></li>
        <li><strong>Ügyfélszolgálat:</strong> <a href="/support">Támogatás oldal</a></li>
      </ul>

      {/* Footer note */}
      <div className="not-prose mt-12 p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
        📄 Ez a dokumentum {lastUpdated} napján lépett hatályba. A korábbi verziók kérés esetén elérhetők az ügyfélszolgálattól.
      </div>
    </article>
  )
}