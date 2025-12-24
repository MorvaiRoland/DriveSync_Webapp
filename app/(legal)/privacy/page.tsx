import LegalLayout from '@/components/LegalLayout';

export default function PrivacyPage() {
  return (
    <LegalLayout title="Adatvédelmi Tájékoztató" icon="shield" lastUpdated="2025. december 13.">
      
      <blockquote>
        <p>
          A DynamicSense Technologies elkötelezett az Ön személyes adatainak védelme mellett. Jelen tájékoztató célja, hogy az Európai Unió Általános Adatvédelmi Rendeletének (GDPR) megfelelően bemutassa adatkezelési gyakorlatunkat.
        </p>
      </blockquote>

      <h2>1. Az Adatkezelő Adatai</h2>
      <p>
         Az Ön adatainak kezelője a <strong>DynamicSense Technologies</strong>.<br/>
         Székhely: 4251 Hajdúsámson, Sima utca 5/4.<br/>
         E-mail: <a href="mailto:info.dynamicsense@gmail.com">info.dynamicsense@gmail.com</a>
      </p>

      <h2>2. A Kezelt Adatok Köre</h2>
      <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
          <div className="p-6 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3">👤 Fiók Adatok</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>• Teljes név</li>
                  <li>• Email cím (azonosításhoz)</li>
                  <li>• Titkosított jelszó hash</li>
                  <li className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">Jogalap: Szerződés teljesítése</li>
              </ul>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3">🚗 Jármű Adatok</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>• Rendszám és Alvázszám (VIN)</li>
                  <li>• Szerviztörténet és futásteljesítmény</li>
                  <li>• Feltöltött dokumentumok</li>
                  <li className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">Cél: A szoftver alapfunkciója</li>
              </ul>
          </div>
      </div>

      <h2>3. Mesterséges Intelligencia (AI)</h2>
      <p>
         A szolgáltatás "AI Szerelő" funkciója a Google Gemini API-t használja. Fontos tudni:
      </p>
      <ul>
         <li><strong>Anonimizálás:</strong> A kérdéseiből a rendszerünk igyekszik kiszűrni a személyes adatokat továbbítás előtt.</li>
         <li><strong>Nincs tanulás:</strong> Az Ön által megadott specifikus autós adatokat nem használjuk fel nyilvános AI modellek tanítására.</li>
         <li><strong>Képek:</strong> A feltöltött műszerfal fotókat csak az elemzés idejére dolgozzuk fel.</li>
      </ul>

      <h2>4. Az Ön Jogai</h2>
      <p>
         Bármikor kérheti adatai törlését, módosítását vagy kikérését az <a href="mailto:info.dynamicsense@gmail.com">info.dynamicsense@gmail.com</a> címen. Panaszával a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH) fordulhat.
      </p>

    </LegalLayout>
  );
}