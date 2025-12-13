// app/impressum/page.tsx
import LegalLayout from '@/components/LegalLayout';
import { Mail, MapPin, Globe, Server, FileText } from 'lucide-react';

export default function ImpressumPage() {
  return (
    <LegalLayout title="Impresszum" icon="building" lastUpdated="2025.12.13.">
      
      <p className="text-xl text-slate-400 mb-10 leading-relaxed">
        A DriveSync szolgáltatás üzemeltetőjének és a weboldal tartalmáért felelős szolgáltatónak a hivatalos adatai az elektronikus kereskedelmi szolgáltatásokról szóló 2001. évi CVIII. törvény alapján.
      </p>

      <div className="grid gap-6 not-prose">
        
        {/* Cégadatok Kártya */}
        <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <FileText size={120} />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-1 h-8 bg-amber-500 rounded-full"></span>
                Szolgáltató Adatai
            </h2>

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                    <span className="text-slate-500 font-medium">Cégnév / Üzemeltető</span>
                    <span className="text-white font-bold text-lg">DriveSync Technologies</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                    <span className="text-slate-500 font-medium flex items-center gap-2"><MapPin size={16} /> Székhely</span>
                    <span className="text-white text-right">4251 Hajdúsámson,<br />Sima utca 5/4</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                    <span className="text-slate-500 font-medium">Adószám</span>
                    <span className="text-white font-mono bg-slate-800 px-2 py-1 rounded">-</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                    <span className="text-slate-500 font-medium flex items-center gap-2"><Mail size={16} /> Kapcsolat</span>
                    <a href="mailto:info.drivesync.mail@gmail.com" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
                        info.drivesync.mail@gmail.com
                    </a>
                </div>
            </div>
        </div>

        {/* Tárhelyszolgáltató Kártya */}
        <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800">
             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Server size={20} className="text-blue-500" />
                Tárhelyszolgáltatók
             </h3>
             <div className="grid md:grid-cols-2 gap-4">
                 <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                     <strong className="block text-white mb-1">Vercel Inc.</strong>
                     <span className="text-sm text-slate-500">Frontend & Hosting<br/>340 S Lemon Ave #4133<br/>Walnut, CA 91789, USA</span>
                 </div>
                 <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                     <strong className="block text-white mb-1">Supabase Inc.</strong>
                     <span className="text-sm text-slate-500">Adatbázis & Auth<br/>Singapore / EU (Frankfurt)</span>
                 </div>
             </div>
        </div>

      </div>

      <div className="mt-12 p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-sm text-slate-400 italic text-center">
        Jelen weboldal tartalmának, arculati elemeinek és forráskódjának másolása, átdolgozása a tulajdonos írásos engedélye nélkül szigorúan tilos és jogi következményeket von maga után.
      </div>

    </LegalLayout>
  );
}