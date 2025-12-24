import LegalLayout from '@/components/LegalLayout';
import { Shield, User, Car, Mail, Info } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <LegalLayout>
       {/* Címsor */}
       <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-500 rounded-2xl mb-6">
             <Shield size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Adatvédelem</h1>
          <p className="text-slate-500 dark:text-slate-400 font-mono text-xs uppercase tracking-widest">
             Hatályos: 2025. december 13.
          </p>
       </div>

       {/* Intro */}
       <div className="bg-white dark:bg-slate-900 border-l-4 border-emerald-500 p-6 md:p-8 rounded-r-2xl shadow-sm border-y border-r border-slate-200 dark:border-slate-800 mb-12">
          <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
            A DynamicSense Technologies elkötelezett az Ön személyes adatainak védelme mellett. Jelen tájékoztató célja a GDPR rendeletnek megfelelő tájékoztatás.
          </p>
       </div>

       <div className="space-y-8">
          {/* 1. Adatkezelő */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
             <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
               <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-500"><Info size={18} /></div>
               1. Az Adatkezelő
             </h2>
             <div className="pl-12">
               <strong className="block text-slate-900 dark:text-white">DynamicSense Technologies</strong>
               <span className="block text-sm text-slate-500 mb-2">4251 Hajdúsámson, Sima utca 5/4.</span>
               <a href="mailto:info.dynamicsense@gmail.com" className="text-emerald-600 dark:text-emerald-500 font-bold hover:underline">info.dynamicsense@gmail.com</a>
             </div>
          </section>

          {/* 2. Kezelt Adatok */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
             <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
               <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-500"><User size={18} /></div>
               2. Kezelt Adatok Köre
             </h2>
             <div className="grid md:grid-cols-2 gap-4 pl-0 md:pl-12">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                   <strong className="block text-slate-900 dark:text-white mb-2 flex items-center gap-2"><User size={14}/> Fiók Adatok</strong>
                   <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                      <li>Teljes név</li>
                      <li>Email cím</li>
                      <li>Titkosított jelszó</li>
                   </ul>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                   <strong className="block text-slate-900 dark:text-white mb-2 flex items-center gap-2"><Car size={14}/> Jármű Adatok</strong>
                   <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                      <li>Rendszám, VIN</li>
                      <li>Szerviztörténet</li>
                      <li>Fotók</li>
                   </ul>
                </div>
             </div>
          </section>

          {/* 3. AI */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
             <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
               <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-500"><Shield size={18} /></div>
               3. Mesterséges Intelligencia (AI)
             </h2>
             <ul className="list-disc pl-12 text-slate-600 dark:text-slate-300 space-y-2">
                <li><strong>Anonimizálás:</strong> Személyes adatokat szűrünk a kérdésekből.</li>
                <li><strong>Nincs tanulás:</strong> Az Ön adatait nem használjuk nyilvános modellek tanítására.</li>
             </ul>
          </section>

          {/* 4. Jogok */}
          <section className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
             <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
               <Mail size={18} /> Jogorvoslat
             </h2>
             <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
               Kérheti adatai törlését vagy módosítását az <a href="mailto:info.dynamicsense@gmail.com" className="text-emerald-600 hover:underline">info.dynamicsense@gmail.com</a> címen.
             </p>
             <div className="text-xs text-slate-500 dark:text-slate-500 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH)<br/>
                1055 Budapest, Falk Miksa utca 9-11.
             </div>
          </section>
       </div>
    </LegalLayout>
  );
}