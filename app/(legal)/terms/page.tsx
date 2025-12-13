// app/terms/page.tsx
import LegalLayout from '@/components/LegalLayout';
import { AlertTriangle, Info } from 'lucide-react';

export default function TermsPage() {
  return (
    <LegalLayout title="Általános Szerződési Feltételek" icon="scale" lastUpdated="2025. december 10.">
      
      <p className="text-xl text-slate-400">
        Üdvözöljük a DynamicSense alkalmazásban! A szolgáltatás használatával (regisztráció, böngészés) Ön (a továbbiakban: "Felhasználó") automatikusan elfogadja az alábbi feltételeket.
      </p>

      <h2 className="text-2xl text-white mt-12 mb-4 border-l-4 border-amber-500 pl-4">1. A Szolgáltatás Leírása</h2>
      <p>
        A DynamicSense egy felhőalapú járműnyilvántartó szoftver (SaaS), amely digitális eszköztárat biztosít autótulajdonosok számára a karbantartások, költségek és dokumentumok menedzselésére. A szolgáltatás "as-is" (megtekintett állapotban) alapon működik.
      </p>

      <h2 className="text-2xl text-white mt-12 mb-4 border-l-4 border-amber-500 pl-4">2. Csomagok és Fizetési Feltételek</h2>
      <h3 className="text-white font-bold text-lg">"Lifetime" (Örökös) Csomag</h3>
      <p>
        Az egyszeri díjfizetés örökös hozzáférést biztosít a "Pro" funkciókhoz a fiók élettartama alatt. Az "örökös hozzáférés" a Szolgáltatás technikai élettartamára vonatkozik. Amennyiben a Szolgáltatás üzemeltetése megszűnik, a Szolgáltató nem köteles a befizetett összeg visszatérítésére.
      </p>
      
      <h3 className="text-white font-bold text-lg mt-6">Előfizetéses Csomagok</h3>
      <p>
        A havi vagy éves díjakat a Stripe biztonságos rendszerén keresztül vonjuk le. Az előfizetés bármikor lemondható a fordulónap előtt.
      </p>

      {/* KIEMELT JOGI RÉSZ - ELÁLLÁS */}
      <div className="my-10 p-6 rounded-2xl bg-amber-950/30 border border-amber-500/30 not-prose">
          <div className="flex items-center gap-3 mb-3 text-amber-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold uppercase tracking-wide m-0">3. Elállási Jog (Lemondó Nyilatkozat)</h3>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            A fogyasztó és a vállalkozás közötti szerződések részletes szabályairól szóló <strong>45/2014. (II. 26.) Korm. rendelet 29. §</strong> alapján, mivel a DynamicSense digitális adattartalmat szolgáltat, amelynek teljesítése a vásárlás után azonnal megkezdődik, a Felhasználó a vásárlás véglegesítésével kifejezetten tudomásul veszi, hogy <strong>elveszíti a 14 napos indoklás nélküli elállási jogát</strong>.
          </p>
      </div>

      <h2 className="text-2xl text-white mt-12 mb-4 border-l-4 border-amber-500 pl-4">4. Felelősségkizárás</h2>
      <p>
        A Szolgáltató mindent megtesz a rendszer 99.9%-os rendelkezésre állásáért, azonban nem vállal felelősséget az internetkapcsolat hibájából, vis maior eseményből vagy technikai karbantartásból eredő szolgáltatáskiesésért.
      </p>
      
      <div className="flex gap-4 p-4 bg-blue-900/20 border border-blue-500/20 rounded-xl mt-4 not-prose">
          <Info className="w-6 h-6 text-blue-400 shrink-0" />
          <div className="text-sm text-slate-300">
              <strong>AI Szerelő Funkció:</strong> Az mesterséges intelligencia által generált diagnosztikai tanácsok kizárólag tájékoztató jellegűek. Nem minősülnek szakmai tanácsadásnak, és nem helyettesítik a szakszerviz fizikai vizsgálatát. A Szolgáltató nem vállal felelősséget a javaslatok alapján végzett szerelésekből eredő károkért.
          </div>
      </div>

      <h2 className="text-2xl text-white mt-12 mb-4 border-l-4 border-amber-500 pl-4">5. Fiók Megszüntetése</h2>
      <p>
        A Felhasználó bármikor jogosult fiókjának törlésére. A Szolgáltató fenntartja a jogot a hozzáférés azonnali felfüggesztésére vagy a fiók törlésére, amennyiben a Felhasználó:
      </p>
      <ul className="list-disc pl-6 space-y-1">
          <li>Súlyosan megsérti a jelen ÁSZF rendelkezéseit.</li>
          <li>Csalást követ el vagy visszaél a rendszerrel.</li>
          <li>Késedelembe esik a díjfizetéssel.</li>
      </ul>

      <div className="mt-16 pt-8 border-t border-slate-800 text-slate-500 text-sm">
        <p>A Szolgáltató fenntartja a jogot az ÁSZF egyoldalú módosítására, amelyről a Felhasználókat emailben értesíti.</p>
      </div>

    </LegalLayout>
  );
}