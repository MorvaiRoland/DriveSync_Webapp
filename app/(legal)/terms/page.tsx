import LegalLayout from '@/components/LegalLayout'

export default function TermsPage() {
  return (
    <LegalLayout title="ÁSZF">
      <h1>Általános Szerződési Feltételek</h1>
      <p className="lead text-xl text-slate-400">Utolsó frissítés: 2025. december 10.</p>

      <h2>1. Bevezetés</h2>
      <p>
        Üdvözöljük a DriveSync alkalmazásban! A szolgáltatás használatával Ön (a továbbiakban: "Felhasználó") elfogadja az alábbi feltételeket. 
        Kérjük, figyelmesen olvassa el őket a regisztráció előtt.
      </p>

      <h2>2. A Szolgáltatás Leírása</h2>
      <p>
        A DriveSync egy felhőalapú járműnyilvántartó szoftver (SaaS), amely segít az autótulajdonosoknak 
        nyomon követni szervizeléseiket, költségeiket és dokumentumaikat. A szolgáltatás webes felületen érhető el.
      </p>

      <h2>3. Csomagok és Fizetés</h2>
      <h3>"Lifetime" (Örökös) Csomag</h3>
      <ul>
        <li>Egyszeri díjfizetés ellenében örökös hozzáférést biztosít a "Pro" funkciókhoz.</li>
        <li>Az "örökös hozzáférés" a Szolgáltatás élettartamára vonatkozik (amíg a DriveSync üzemel).</li>
      </ul>
      <h3>Előfizetéses Csomagok</h3>
      <p>A havi vagy éves díjakat a Stripe rendszerén keresztül vonjuk le. Az előfizetés bármikor lemondható, a hozzáférés a fizetett időszak végéig megmarad.</p>

      <h2>4. Elállási Jog (Fontos)</h2>
      <p>
        A fogyasztó és a vállalkozás közötti szerződések részletes szabályairól szóló 45/2014. (II. 26.) Korm. rendelet alapján, 
        mivel a DriveSync digitális adattartalmat szolgáltat, amelynek teljesítése a vásárlás után azonnal megkezdődik, 
        a Felhasználó a vásárlással <strong>lemond a 14 napos elállási jogáról</strong>.
      </p>

      <h2>5. Felelősségkizárás</h2>
      <p>
        A Szoftvert "ahogy van" (as-is) alapon nyújtjuk. Bár mindent megteszünk az adatok biztonságáért és a 
        rendszer rendelkezésre állásáért (99.9% uptime), nem vállalunk felelősséget adatvesztésért, vagy a szolgáltatás 
        esetleges kimaradásából eredő károkért. 
      </p>
      <p>
          Az <strong>AI Szerelő</strong> funkció által adott tanácsok kizárólag tájékoztató jellegűek, generatív mesterséges intelligencia hozza létre őket. 
          Nem minősülnek szakmai tanácsadásnak, és nem helyettesítik a szakszerviz diagnosztikáját.
      </p>

      <h2>6. Fiók Törlése</h2>
      <p>
        A Felhasználó bármikor, indoklás nélkül törölheti fiókját a Beállítások menüpontban. 
        A Szolgáltató fenntartja a jogot a fiók felfüggesztésére, amennyiben a Felhasználó súlyosan megsérti a jelen feltételeket (pl. visszaélés, csalás).
      </p>

      <h2>7. Kapcsolat</h2>
      <p>
        Kérdés, panasz vagy észrevétel esetén kérjük, írjon nekünk a <a href="mailto:info.drivesync.mail@gmail.com">info.drivesync.mail@gmail.com</a> címre.
      </p>
    </LegalLayout>
  )
}