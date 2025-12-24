import { Mail, MapPin, Server, FileText } from 'lucide-react';

export default function ImpressumPage() {
   // A Layoutot a Next.js automatikusan ráteszi, nem kell importálni!
   return (
      <>
         {/* Címsor */}
         <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-4 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-2xl mb-6">
               <FileText size={32} />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Impresszum</h1>
            <p className="text-slate-500 dark:text-slate-400 font-mono text-xs uppercase tracking-widest">
               Hatályos: 2025. december 13.
            </p>
         </div>

         {/* Intro Box */}
         <div className="bg-white dark:bg-slate-900 border-l-4 border-amber-500 p-6 md:p-8 rounded-r-2xl shadow-sm border-y border-r border-slate-200 dark:border-slate-800 mb-12">
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
               A DynamicSense szolgáltatás üzemeltetőjének és a weboldal tartalmáért felelős szolgáltatónak a hivatalos közzététele az elektronikus kereskedelmi szolgáltatásokról szóló 2001. évi CVIII. törvény (Eker. tv.) alapján.
            </p>
         </div>

         <div className="grid gap-8">
            {/* Szolgáltató Adatai */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
               <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <MapPin className="text-amber-500" size={24} /> Szolgáltató Adatai
               </h2>
               <div className="grid md:grid-cols-2 gap-6">
                  <div>
                     <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">Cégnév</span>
                     <span className="text-lg font-bold text-slate-900 dark:text-white block">DynamicSense Technologies</span>
                     <span className="text-sm text-slate-500">Morvai Roland E.V.</span>
                  </div>
                  <div>
                     <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">Székhely</span>
                     <span className="text-slate-700 dark:text-slate-300">4251 Hajdúsámson, Sima utca 5/4.</span>
                  </div>
                  <div>
                     <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">Adószám</span>
                     <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-800 dark:text-slate-200 inline-block">Kérjük érdeklődjön</span>
                  </div>
                  <div>
                     <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">Kapcsolat</span>
                     <a href="mailto:info.dynamicsense@gmail.com" className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-bold hover:underline">
                        <Mail size={16} /> info.dynamicsense@gmail.com
                     </a>
                  </div>
               </div>
            </section>

            {/* Infrastruktúra */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
               <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <Server className="text-blue-500" size={24} /> Tárhely- és Infrastruktúra
               </h2>
               <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                     <strong className="block text-slate-900 dark:text-white mb-1">Vercel Inc.</strong>
                     <span className="text-[10px] uppercase font-bold text-slate-400 mb-2 block">Frontend & Hosting</span>
                     <p className="text-xs text-slate-500 font-mono">USA, Walnut, CA</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                     <strong className="block text-slate-900 dark:text-white mb-1">Supabase Inc.</strong>
                     <span className="text-[10px] uppercase font-bold text-slate-400 mb-2 block">Adatbázis</span>
                     <p className="text-xs text-slate-500 font-mono">Singapore</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 md:col-span-2">
                     <strong className="block text-slate-900 dark:text-white mb-1">Google Cloud EMEA</strong>
                     <span className="text-[10px] uppercase font-bold text-slate-400 mb-2 block">AI API & Cloud Functions</span>
                     <p className="text-xs text-slate-500 font-mono">Írország, Dublin</p>
                  </div>
               </div>
            </section>
         </div>
      </>
   );
}