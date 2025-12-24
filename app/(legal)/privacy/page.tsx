
import { Shield, User, Car, Mail, Info } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 transition-colors duration-500 py-12 px-2">
      {/* Main Card */}
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 relative overflow-hidden">
        {/* Decorative Icon */}
        <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none select-none">
          <Shield size={160} className="text-emerald-400 dark:text-emerald-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <span className="inline-block w-2 h-8 bg-emerald-500 rounded-full"></span>
          Adatvédelmi Tájékoztató
        </h1>
        <div className="text-xs font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-8">Utolsó frissítés: 2025. december 13.</div>

        {/* Intro */}
        <div className="mb-8 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 text-slate-700 dark:text-slate-200 text-sm">
          A DynamicSense Technologies elkötelezett az Ön személyes adatainak védelme mellett. Jelen tájékoztató célja, hogy az Európai Unió Általános Adatvédelmi Rendeletének (GDPR) megfelelően bemutassa adatkezelési gyakorlatunkat.
        </div>

        {/* 1. Az Adatkezelő Adatai */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Info className="text-emerald-500" size={20} /> 1. Az Adatkezelő Adatai
          </h2>
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Adatkezelő</span>
            <span className="text-base font-bold text-slate-900 dark:text-white">DynamicSense Technologies</span>
            <span className="text-xs text-slate-500">Székhely: 4251 Hajdúsámson, Sima utca 5/4.</span>
            <span className="text-xs text-slate-500">E-mail: <a href="mailto:info.dynamicsense@gmail.com" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">info.dynamicsense@gmail.com</a></span>
          </div>
        </section>

        {/* 2. A Kezelt Adatok Köre */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="text-emerald-500" size={20} /> 2. A Kezelt Adatok Köre
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><User size={16} /> Fiók Adatok</h3>
              <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                <li>Teljes név</li>
                <li>Email cím (azonosításhoz)</li>
                <li>Titkosított jelszó hash</li>
                <li className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">Jogalap: Szerződés teljesítése</li>
              </ul>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><Car size={16} /> Jármű Adatok</h3>
              <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                <li>Rendszám és Alvázszám (VIN)</li>
                <li>Szerviztörténet és futásteljesítmény</li>
                <li>Feltöltött dokumentumok</li>
                <li className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">Cél: A szoftver alapfunkciója</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Mesterséges Intelligencia (AI) */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="text-emerald-500" size={20} /> 3. Mesterséges Intelligencia (AI)
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 dark:text-slate-300">
            <li><strong>Anonimizálás:</strong> A kérdéseiből a rendszerünk igyekszik kiszűrni a személyes adatokat továbbítás előtt.</li>
            <li><strong>Nincs tanulás:</strong> Az Ön által megadott specifikus autós adatokat nem használjuk fel nyilvános AI modellek tanítására.</li>
            <li><strong>Képek:</strong> A feltöltött műszerfal fotókat csak az elemzés idejére dolgozzuk fel.</li>
          </ul>
        </section>

        {/* 4. Az Ön Jogai */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Mail className="text-emerald-500" size={20} /> 4. Az Ön Jogai
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Bármikor kérheti adatai törlését, módosítását vagy kikérését az <a href="mailto:info.dynamicsense@gmail.com" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">info.dynamicsense@gmail.com</a> címen. Panaszával a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH) fordulhat.
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