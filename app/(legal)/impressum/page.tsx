
import { Mail, MapPin, Server, FileText } from 'lucide-react';

export default function ImpressumPage() {
   return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 transition-colors duration-500 py-12 px-2">
         {/* Main Card */}
         <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 relative overflow-hidden">
            {/* Decorative Icon */}
            <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none select-none">
               <FileText size={160} className="text-amber-400 dark:text-amber-600" />
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
               <span className="inline-block w-2 h-8 bg-amber-500 rounded-full"></span>
               Impresszum
            </h1>
            <div className="text-xs font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-8">Utolsó frissítés: 2025. december 13.</div>

            {/* Intro */}
            <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-slate-700 dark:text-slate-200 text-sm">
               A DynamicSense szolgáltatás üzemeltetőjének és a weboldal tartalmáért felelős szolgáltatónak a hivatalos közzététele az elektronikus kereskedelmi szolgáltatásokról szóló 2001. évi CVIII. törvény (Eker. tv.) alapján.
            </div>

            {/* Szolgáltató Adatai */}
            <section className="mb-10">
               <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <MapPin className="text-amber-500" size={20} /> Szolgáltató Adatai
               </h2>
               <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                     <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Cégnév / Üzemeltető</span>
                     <span className="text-lg font-bold text-slate-900 dark:text-white">DynamicSense Technologies</span>
                     <span className="text-sm text-slate-500">Morvai Roland E.V.</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Székhely</span>
                     <span className="text-slate-700 dark:text-slate-300">4251 Hajdúsámson, Sima utca 5/4.</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Adószám</span>
                     <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-800 dark:text-slate-200">Kérjük érdeklődjön</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Kapcsolat</span>
                     <a href="mailto:info.dynamicsense@gmail.com" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">info.dynamicsense@gmail.com</a>
                  </div>
               </div>
            </section>

            {/* Infrastruktúra */}
            <section>
               <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Server className="text-blue-500" size={20} /> Tárhely- és Infrastruktúra
               </h2>
               <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                     <strong className="block text-base text-slate-900 dark:text-white mb-1">Vercel Inc.</strong>
                     <span className="text-[10px] uppercase font-bold text-slate-400 mb-2 block">Frontend & Hosting</span>
                     <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">340 S Lemon Ave #4133<br/>Walnut, CA 91789, USA</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                     <strong className="block text-base text-slate-900 dark:text-white mb-1">Supabase Inc.</strong>
                     <span className="text-[10px] uppercase font-bold text-slate-400 mb-2 block">Adatbázis</span>
                     <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">970 Toa Payoh North #07-04<br/>Singapore 318992</p>
                  </div>
               </div>
            </section>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500 font-mono">
               &copy; {new Date().getFullYear()} DynamicSense Technologies. Minden jog fenntartva.
            </div>
         </div>
      </div>
   );
}