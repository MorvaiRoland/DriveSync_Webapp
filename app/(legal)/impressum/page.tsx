import LegalLayout from '@/components/LegalLayout';
import { Mail, MapPin, Server, FileText, Smartphone } from 'lucide-react';

export default function ImpressumPage() {
  return (
    <LegalLayout title="Impresszum" icon="building" lastUpdated="2025. december 13.">
      
      {/* Intro - Kiemelt blokk */}
      <blockquote>
        <p className="mb-0">
          A DynamicSense szolgáltatás üzemeltetőjének és a weboldal tartalmáért felelős szolgáltatónak a hivatalos közzététele az elektronikus kereskedelmi szolgáltatásokról szóló 2001. évi CVIII. törvény (Eker. tv.) alapján.
        </p>
      </blockquote>

      <div className="grid gap-12 mt-12 not-prose">
        
        {/* Szolgáltató Adatai */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
               <FileText size={200} />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
               <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
               Szolgáltató Adatai
            </h2>

            <dl className="grid gap-6">
               <div className="flex flex-col sm:flex-row justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <dt className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-1 sm:mb-0">Cégnév / Üzemeltető</dt>
                  <dd className="text-lg font-bold text-slate-900 dark:text-white text-right">DynamicSense Technologies<br/><span className="text-sm font-normal text-slate-500">Morvai Roland E.V.</span></dd>
               </div>

               <div className="flex flex-col sm:flex-row justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <dt className="text-xs uppercase tracking-wider text-slate-500 font-medium flex items-center gap-2"><MapPin size={14}/> Székhely</dt>
                  <dd className="text-right text-slate-700 dark:text-slate-300">4251 Hajdúsámson,<br/>Sima utca 5/4.</dd>
               </div>

               <div className="flex flex-col sm:flex-row justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <dt className="text-xs uppercase tracking-wider text-slate-500 font-medium">Adószám</dt>
                  <dd className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-800 dark:text-slate-200">Kérjük érdeklődjön</dd>
               </div>

               <div className="flex flex-col sm:flex-row justify-between pt-2">
                  <dt className="text-xs uppercase tracking-wider text-slate-500 font-medium flex items-center gap-2"><Mail size={14}/> Kapcsolat</dt>
                  <dd>
                     <a href="mailto:info.dynamicsense@gmail.com" className="text-amber-600 dark:text-amber-500 font-bold hover:underline">
                        info.dynamicsense@gmail.com
                     </a>
                  </dd>
               </div>
            </dl>
        </div>

        {/* Infrastruktúra */}
        <div>
           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Server className="text-blue-500" size={24} />
              Tárhely- és Infrastruktúra
           </h3>
           <div className="grid md:grid-cols-2 gap-4">
               <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <strong className="block text-lg text-slate-900 dark:text-white mb-1">Vercel Inc.</strong>
                  <span className="text-[10px] uppercase font-bold text-slate-400 mb-3 block">Frontend & Hosting</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">340 S Lemon Ave #4133<br/>Walnut, CA 91789, USA</p>
               </div>
               <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <strong className="block text-lg text-slate-900 dark:text-white mb-1">Supabase Inc.</strong>
                  <span className="text-[10px] uppercase font-bold text-slate-400 mb-3 block">Adatbázis</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">970 Toa Payoh North #07-04<br/>Singapore 318992</p>
               </div>
           </div>
        </div>

      </div>
    </LegalLayout>
  );
}