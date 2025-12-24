import LegalLayout from '@/components/LegalLayout';
import { ShieldAlert } from 'lucide-react';

export default function TermsPage() {
  return (
    <LegalLayout title="Általános Szerződési Feltételek" icon="scale" lastUpdated="2025. december 13.">
      
      <blockquote>
        <p>
            A DynamicSense regisztrációjával és használatával Ön jogilag kötelező érvényű szerződést köt a Szolgáltatóval. Kérjük, olvassa el figyelmesen.
        </p>
      </blockquote>

      <h2>1. A Szolgáltatás Tárgya</h2>
      <p>
        A DynamicSense egy szoftver-szolgáltatás (SaaS), amely gépjármű-nyilvántartási eszközöket biztosít. A szolgáltatást "adott állapotban" (as-is) nyújtjuk, garanciavállalás nélkül a hibamentes működésre.
      </p>

      <h2>2. Díjazás ("Early Access")</h2>
      <p>
         Jelenleg a rendszer <strong>Nyílt Béta</strong> fázisban van, így minden funkció díjmentes.
      </p>
      <ul>
         <li>A jövőbeni fizetős csomagok bevezetése előtt 30 nappal értesítést küldünk.</li>
         <li>A fizetésre váltás minden esetben önkéntes (opt-in).</li>
         <li>Bármikor jogában áll törölni a fiókját kötelezettségek nélkül.</li>
      </ul>

      {/* Warning Box */}
      <div className="my-10 p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl not-prose">
          <div className="flex items-center gap-3 text-red-800 dark:text-red-400 mb-3">
             <ShieldAlert className="w-6 h-6" />
             <strong className="text-lg uppercase tracking-wide">Kiemelt Figyelmeztetés: AI Diagnosztika</strong>
          </div>
          <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-3">
             <p>
                Az "AI Szerelő" funkció által adott válaszok <strong>KIZÁRÓLAG TÁJÉKOZTATÓ JELLEGŰEK</strong>. Nem minősülnek szakmai autószerelői véleménynek.
             </p>
             <p className="font-bold">
                Soha ne hozzon javítási döntést vagy hagyjon figyelmen kívül szakemberi tanácsot pusztán az AI válasza alapján. A Szolgáltató kizárja a felelősséget az ebből eredő károkért.
             </p>
          </div>
      </div>

      <h2>3. Adatvesztés</h2>
      <p>
        Bár rendszeres biztonsági mentéseket végzünk, nem vállalunk felelősséget a vis maior vagy technikai hiba miatti adatvesztésért. Kérjük, a fontos hivatalos dokumentumokat tartsa meg papír alapon is.
      </p>

      <h2>4. Záró Rendelkezések</h2>
      <p>
        Jelen szerződésre a magyar jog az irányadó. A Szolgáltató fenntartja a jogot az ÁSZF egyoldalú módosítására, melyről a weboldalon tájékoztatást nyújt.
      </p>

    </LegalLayout>
  );
}