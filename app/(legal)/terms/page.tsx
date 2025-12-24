import { Scale, ShieldAlert, CheckCircle } from 'lucide-react';

export default function TermsPage() {
  // A Layoutot a Next.js automatikusan ráteszi, nem kell importálni!
  return (
    <>
       {/* Címsor */}
       <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-2xl mb-6">
             <Scale size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Felhasználási Feltételek</h1>
          <p className="text-slate-500 dark:text-slate-400 font-mono text-xs uppercase tracking-widest">
             Hatályos: 2025. december 13.
          </p>
       </div>

       {/* Intro */}
       <div className="bg-white dark:bg-slate-900 border-l-4 border-amber-500 p-6 md:p-8 rounded-r-2xl shadow-sm border-y border-r border-slate-200 dark:border-slate-800 mb-12">
          <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
            A DynamicSense regisztrációjával és használatával Ön jogilag kötelező érvényű szerződést köt a Szolgáltatóval. Kérjük, olvassa el figyelmesen.
          </p>
       </div>

       <div className="space-y-8">
          
          {/* 1. Szolgáltatás & Díjazás */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
             <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">1. Szolgáltatás és Díjazás</h2>
             <div className="space-y-4 text-slate-600 dark:text-slate-300">
                <p>A DynamicSense egy SaaS alapú járműnyilvántartó szoftver.</p>
                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
                   <strong className="block text-amber-700 dark:text-amber-400 mb-2">Early Access (Nyílt Béta)</strong>
                   <ul className="space-y-2 text-sm">
                      <li className="flex gap-2"><CheckCircle size={16} className="shrink-0"/> Jelenleg minden funkció ingyenes.</li>
                      <li className="flex gap-2"><CheckCircle size={16} className="shrink-0"/> Fizetős funkciók bevezetése előtt 30 nappal értesítünk.</li>
                      <li className="flex gap-2"><CheckCircle size={16} className="shrink-0"/> Nincs automatikus fizetés, minden váltás önkéntes.</li>
                   </ul>
                </div>
             </div>
          </section>

          {/* FIGYELMEZTETÉS */}
          <section className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-200 dark:border-red-900/30">
             <div className="flex items-center gap-3 text-red-700 dark:text-red-400 mb-4">
                <ShieldAlert className="w-6 h-6" />
                <h2 className="text-lg font-bold uppercase tracking-wide">Kiemelt Figyelmeztetés: AI Diagnosztika</h2>
             </div>
             <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-3 pl-0 md:pl-9">
                <p>
                  Az "AI Szerelő" funkció válaszai <strong>KIZÁRÓLAG TÁJÉKOZTATÓ JELLEGŰEK</strong>.
                </p>
                <p className="font-bold">
                  Soha ne hozzon javítási döntést szakember nélkül! A szoftver nem helyettesíti a szakszervizt. A Szolgáltató kizárja a felelősséget az AI javaslatai alapján keletkezett károkért.
                </p>
             </div>
          </section>

          {/* Adatvesztés & Jog */}
          <div className="grid md:grid-cols-2 gap-6">
             <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Adatbiztonság</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                   Rendszeres biztonsági mentéseket végzünk, de vis maior esetén nem vállalunk felelősséget adatvesztésért. Kérjük, tartsa meg a papír alapú dokumentumokat is.
                </p>
             </section>
             <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Joghatóság</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                   Jelen szerződésre a magyar jog az irányadó. A Szolgáltató fenntartja az ÁSZF egyoldalú módosításának jogát.
                </p>
             </section>
          </div>

       </div>
    </>
  );
}