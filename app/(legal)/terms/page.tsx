import LegalLayout from '@/components/LegalLayout';
import { ShieldAlert } from 'lucide-react';

export default function TermsPage() {
  return (
    <LegalLayout title="Általános Szerződési Feltételek" icon="scale" lastUpdated="2025. december 13.">
      
      <p className="text-xl text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-transparent py-2 px-4 rounded-lg">
        Kérjük, figyelmesen olvassa el az alábbi feltételeket. A DynamicSense regisztrációjával és használatával Ön (a továbbiakban: "Felhasználó") jogilag kötelező érvényű szerződést köt a Szolgáltatóval.
      </p>

      <h2 className="text-2xl text-slate-900 dark:text-white mt-12 mb-4 border-l-4 border-amber-500 pl-4 font-bold">1. A Szolgáltatás Tárgya</h2>
      <p className="text-slate-700 dark:text-slate-300">
        A DynamicSense egy szoftver-szolgáltatás (SaaS), amely gépjármű-nyilvántartási, költségkövetési és diagnosztikai támogató eszközöket biztosít. A Szolgáltatás "adott állapotban" (as-is) érhető el, a Szolgáltató nem vállal garanciát arra, hogy a szoftver minden felhasználói igényt kielégít, vagy megszakítás nélkül működik.
      </p>

      <h2 className="text-2xl text-slate-900 dark:text-white mt-12 mb-4 border-l-4 border-amber-500 pl-4 font-bold">2. Díjazás és Csomagváltás</h2>
      
      <div className="bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 p-6 rounded-2xl not-prose mb-6 shadow-sm">
          <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">Ingyenes Időszak ("Early Access")</h3>
          <p className="text-slate-700 dark:text-slate-400 text-sm font-medium">
            Jelenleg a Szolgáltatás "Nyílt Béta" fázisban van, és minden funkciója díjmentesen elérhető. A Szolgáltató kifejezetten fenntartja a jogot, hogy a jövőben a Szolgáltatás egészét vagy egyes részeit fizetőssé tegye.
          </p>
      </div>

      <p className="text-slate-700 dark:text-slate-300">
        <strong>2.1. Bevezetés a fizetős modellbe:</strong> A Szolgáltató vállalja, hogy bármilyen díjfizetési kötelezettség bevezetése előtt legalább 30 nappal e-mailben értesíti a Felhasználókat.
      </p>
      <p className="text-slate-700 dark:text-slate-300 mt-2">
        <strong>2.2. Önkéntesség:</strong> A fizetős csomagra való áttérés minden esetben a Felhasználó kifejezett hozzájárulásával (opt-in) történik. Amennyiben a Felhasználó nem kíván előfizetni, jogában áll fiókját törölni, vagy – amennyiben elérhető – a csökkentett funkcionalitású ingyenes csomagban maradni.
      </p>

      <h2 className="text-2xl text-slate-900 dark:text-white mt-12 mb-4 border-l-4 border-amber-500 pl-4 font-bold">3. Felelősség Kizárása (AI Diagnosztika)</h2>
      
      <div className="flex flex-col gap-4 p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/30 rounded-xl mt-4 not-prose shadow-sm">
          <div className="flex items-center gap-3 text-red-700 dark:text-red-500">
             <ShieldAlert className="w-8 h-8 shrink-0" />
             <h3 className="text-lg font-bold uppercase tracking-wide m-0">Kiemelt Figyelmeztetés</h3>
          </div>
          <div className="text-sm text-slate-800 dark:text-slate-300 leading-relaxed font-medium">
              <p className="mb-2">
                A szoftverbe integrált "AI Szerelő" funkció mesterséges intelligencia alapú algoritmusokat használ. Az általa generált válaszok, diagnosztikai javaslatok és hibakód-elemzések <strong>KIZÁRÓLAG TÁJÉKOZTATÓ JELLEGŰEK</strong>.
              </p>
              <p>
                <strong>A szoftver által adott tanácsok nem minősülnek szakmai autószerelői véleménynek, és nem helyettesítik a gépjármű szakszervizben történő fizikai átvizsgálását.</strong>
              </p>
              <p className="mt-2 font-bold text-red-800 dark:text-white">
                A Szolgáltató kizár minden felelősséget a szoftver javaslatai alapján elvégzett vagy el nem végzett javításokból eredő közvetlen vagy közvetett károkért (ideértve a gépjármű meghibásodását, balesetet, vagy anyagi kárt). A Felhasználó a szoftvert kizárólag saját felelősségére használja.
              </p>
          </div>
      </div>

      <h2 className="text-2xl text-slate-900 dark:text-white mt-12 mb-4 border-l-4 border-amber-500 pl-4 font-bold">4. Adatvesztés és Rendelkezésre Állás</h2>
      <p className="text-slate-700 dark:text-slate-300">
        Bár a Szolgáltató rendszeres biztonsági mentéseket készít, nem vállal felelősséget az adatvesztésért, amely technikai hiba, vis maior, vagy harmadik fél (pl. tárhelyszolgáltató) hibájából következik be. A Felhasználó tudomásul veszi, hogy a felhőalapú szolgáltatás nem helyettesíti a hivatalos okmányok fizikai megőrzését.
      </p>

      <h2 className="text-2xl text-slate-900 dark:text-white mt-12 mb-4 border-l-4 border-amber-500 pl-4 font-bold">5. Felhasználói Magatartás</h2>
      <p className="text-slate-700 dark:text-slate-300">
        Tilos a szoftver forráskódjának visszafejtése, a rendszer terhelése (DDoS), vagy valótlan adatok tömeges feltöltése. A Szolgáltató jogosult a szabályszegő felhasználók fiókját előzetes értesítés nélkül, azonnali hatállyal törölni.
      </p>

      <h2 className="text-2xl text-slate-900 dark:text-white mt-12 mb-4 border-l-4 border-amber-500 pl-4 font-bold">6. Záró Rendelkezések</h2>
      <p className="text-slate-700 dark:text-slate-300">
        Jelen Szerződésre Magyarország jogszabályai az irányadók. Jogvita esetén a felek alávetik magukat a Szolgáltató székhelye szerint illetékes bíróság kizárólagos illetékességének.
      </p>

      <div className="mt-16 pt-8 border-t border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-500 text-sm italic">
        A Szolgáltató fenntartja a jogot az ÁSZF egyoldalú módosítására. A módosítások a weboldalon való közzététellel lépnek hatályba.
      </div>

    </LegalLayout>
  );
}