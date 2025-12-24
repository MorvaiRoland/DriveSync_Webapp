
import { Scale, ShieldAlert } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 transition-colors duration-500 py-12 px-2">
      {/* Main Card */}
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 relative overflow-hidden">
        {/* Decorative Icon */}
        <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none select-none">
          <Scale size={160} className="text-amber-400 dark:text-amber-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <span className="inline-block w-2 h-8 bg-amber-500 rounded-full"></span>
          Általános Szerződési Feltételek
        </h1>
        <div className="text-xs font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-8">Utolsó frissítés: 2025. december 13.</div>

        {/* Intro */}
        <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-slate-700 dark:text-slate-200 text-sm">
          A DynamicSense regisztrációjával és használatával Ön jogilag kötelező érvényű szerződést köt a Szolgáltatóval. Kérjük, olvassa el figyelmesen.
        </div>

        {/* 1. A Szolgáltatás Tárgya */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">1. A Szolgáltatás Tárgya</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            A DynamicSense egy szoftver-szolgáltatás (SaaS), amely gépjármű-nyilvántartási eszközöket biztosít. A szolgáltatást "adott állapotban" (as-is) nyújtjuk, garanciavállalás nélkül a hibamentes működésre.
          </p>
        </section>

        {/* 2. Díjazás ("Early Access") */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2. Díjazás ("Early Access")</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Jelenleg a rendszer <strong>Nyílt Béta</strong> fázisban van, így minden funkció díjmentes.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 dark:text-slate-300 mt-2">
            <li>A jövőbeni fizetős csomagok bevezetése előtt 30 nappal értesítést küldünk.</li>
            <li>A fizetésre váltás minden esetben önkéntes (opt-in).</li>
            <li>Bármikor jogában áll törölni a fiókját kötelezettségek nélkül.</li>
          </ul>
        </section>

        {/* Warning Box */}
        <div className="my-10 p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl">
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

        {/* 3. Adatvesztés */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3. Adatvesztés</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Bár rendszeres biztonsági mentéseket végzünk, nem vállalunk felelősséget a vis maior vagy technikai hiba miatti adatvesztésért. Kérjük, a fontos hivatalos dokumentumokat tartsa meg papír alapon is.
          </p>
        </section>

        {/* 4. Záró Rendelkezések */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4. Záró Rendelkezések</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Jelen szerződésre a magyar jog az irányadó. A Szolgáltató fenntartja a jogot az ÁSZF egyoldalú módosítására, melyről a weboldalon tájékoztatást nyújt.
          </p>
        </section>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500 font-mono">
          &copy; {new Date().getFullYear()} DynamicSense Technologies. Minden jog fenntartva.
        </div>
      </div>
    </div>
  );
}