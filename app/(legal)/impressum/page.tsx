import LegalLayout from '@/components/LegalLayout';
import { Mail, MapPin, Server, FileText, Phone, ShieldCheck } from 'lucide-react';

export default function ImpressumPage() {
  return (
    <LegalLayout title="Impresszum" icon="building" lastUpdated="2025. december 13.">
      
      <p className="text-xl text-slate-400 mb-10 leading-relaxed border-l-4 border-amber-500 pl-6">
        A DynamicSense szolgáltatás üzemeltetőjének és a weboldal tartalmáért felelős szolgáltatónak a hivatalos közzététele az elektronikus kereskedelmi szolgáltatásokról szóló 2001. évi CVIII. törvény (Eker. tv.) alapján.
      </p>

      <div className="grid gap-8 not-prose">
        
        {/* Szolgáltató Adatai */}
        <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <FileText size={120} />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-1 h-8 bg-amber-500 rounded-full"></span>
                Szolgáltató Adatai
            </h2>

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                    <span className="text-slate-500 font-medium">Cégnév / Üzemeltető</span>
                    <span className="text-white font-bold text-lg">DynamicSense Technologies - Morvai Roland</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                    <span className="text-slate-500 font-medium flex items-center gap-2"><MapPin size={16} /> Székhely</span>
                    <span className="text-white text-right">4251 Hajdúsámson,<br />Sima utca 5/4.</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                    <span className="text-slate-500 font-medium">Adószám</span>
                    {/* IDE ÍRD BE A VALÓDI ADÓSZÁMOT, HA VAN */}
                    <span className="text-white font-mono bg-slate-800 px-2 py-1 rounded">xxxx</span> 
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                    <span className="text-slate-500 font-medium">Cégjegyzékszám / E.V. Nyilvántartási szám</span>
                    <span className="text-white font-mono bg-slate-800 px-2 py-1 rounded">XX-XX-XXXXXX</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                    <span className="text-slate-500 font-medium flex items-center gap-2"><Mail size={16} /> Elektronikus kapcsolat</span>
                    <a href="mailto:info.dynamicsense@gmail.com" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
                        info.dynamicsense@gmail.com
                    </a>
                </div>
            </div>
        </div>

        {/* Tárhelyszolgáltatók - KÖTELEZŐ ELEM */}
        <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800">
             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Server size={20} className="text-blue-500" />
                Tárhely- és Infrastruktúra Szolgáltatók
             </h3>
             <p className="text-slate-400 text-sm mb-6">
                Az adatok fizikai tárolását és a szerverinfrastruktúrát az alábbi partnerek biztosítják, megfelelve a legszigorúbb biztonsági előírásoknak (ISO 27001).
             </p>
             <div className="grid md:grid-cols-2 gap-4">
                 <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
                     <strong className="block text-white mb-1">Vercel Inc.</strong>
                     <span className="text-xs text-slate-500 block mb-2">Frontend & Hosting</span>
                     <span className="text-xs text-slate-400">340 S Lemon Ave #4133<br/>Walnut, CA 91789, USA</span>
                 </div>
                 <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
                     <strong className="block text-white mb-1">Supabase Inc.</strong>
                     <span className="text-xs text-slate-500 block mb-2">Adatbázis & Backend</span>
                     <span className="text-xs text-slate-400">970 Toa Payoh North #07-04<br/>Singapore 318992</span>
                 </div>
             </div>
        </div>

      </div>

      <div className="mt-12 p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-sm text-slate-400 flex gap-4 items-start">
        <ShieldCheck className="w-6 h-6 text-amber-500 shrink-0" />
        <div>
            <strong>Jogi Nyilatkozat:</strong> A weboldalon megjelenő információk, szoftverek és szolgáltatások szerzői jogi védelem alatt állnak. A DynamicSense név és logó a szolgáltató szellemi tulajdona. Bármely tartalom engedély nélküli másolása jogi eljárást von maga után.
        </div>
      </div>

    </LegalLayout>
  );
}