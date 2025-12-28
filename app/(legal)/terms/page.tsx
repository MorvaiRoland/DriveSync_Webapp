import { Scale, ShieldAlert, CheckCircle, Zap, Crown } from 'lucide-react';

export default function TermsPage() {
  return (
    <>
       {/* Címsor */}
       <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-2xl mb-6">
             <Scale size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Felhasználási Feltételek</h1>
          <p className="text-slate-500 dark:text-slate-400 font-mono text-xs uppercase tracking-widest">
             Hatályos: 2025. december 28.
          </p>
       </div>

       {/* Intro */}
       <div className="bg-white dark:bg-slate-900 border-l-4 border-amber-500 p-6 md:p-8 rounded-r-2xl shadow-sm border-y border-r border-slate-200 dark:border-slate-800 mb-12">
          <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
            A DynamicSense regisztrációjával és használatával Ön jogilag kötelező érvényű szerződést köt a Szolgáltatóval. Kérjük, olvassa el figyelmesen.
          </p>
       </div>

       <div className="space-y-8">
          
          {/* 1. Szolgáltatás & Díjazás - FRISSÍTVE */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
             <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">1. Szolgáltatás és Díjazás</h2>
             <div className="space-y-6 text-slate-600 dark:text-slate-300">
                <p>A DynamicSense egy SaaS (Software as a Service) alapú járműnyilvántartó szoftver. A szolgáltatás "Freemium" modellben működik.</p>
                
                <div className="grid md:grid-cols-3 gap-4">
                    {/* Starter */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <strong className="block text-slate-900 dark:text-white mb-1">Starter (Ingyenes)</strong>
                        <p className="text-xs">Korlátlan ideig ingyenes, 1 autó kezelésére és alapfunkciókra korlátozva.</p>
                    </div>
                    {/* Pro */}
                    <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/10">
                        <strong className="block text-indigo-700 dark:text-indigo-400 mb-1 flex items-center gap-1"><Zap size={14}/> Pro Előfizetés</strong>
                        <p className="text-xs">Havi vagy éves díj ellenében bővített funkciók (AI, több autó). Automatikusan megújul, amíg le nem mondja.</p>
                    </div>
                    {/* Founder */}
                    <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10">
                        <strong className="block text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1"><Crown size={14}/> Founder (Lifetime)</strong>
                        <p className="text-xs">Egyszeri díj ellenében örökös hozzáférés a Pro funkciókhoz. Nem minősül előfizetésnek.</p>
                    </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm">
                   <strong className="block text-slate-900 dark:text-white mb-2">Early Access Időszak</strong>
                   <p>
                       A béta időszak alatt regisztráló felhasználók promóciós jelleggel, meghatározott ideig ingyenesen kaphatják meg a Pro funkciókat ("Early Access Pro"). 
                       A promóciós időszak lejárta után a fiók automatikusan a Starter (Ingyenes) csomagba kerül, hacsak a felhasználó nem fizet elő.
                   </p>
                </div>
             </div>
          </section>
          
          {/* 2. Lemondás és Visszatérítés */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
             <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">2. Lemondás és Visszatérítés</h2>
             <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300 list-disc pl-5">
                 <li><strong>Előfizetés lemondása:</strong> A Pro előfizetés bármikor lemondható a Profil / Beállítások menüben. A hozzáférés a kifizetett időszak végéig megmarad.</li>
                 <li><strong>Pénzvisszafizetés:</strong> Digitális szolgáltatás lévén a már kifizetett időszakra visszatérítést nem áll módunkban adni, kivéve törvényi kötelezettség esetén.</li>
                 <li><strong>Lifetime csomag:</strong> Az egyszeri díjas Founder csomag nem visszatéríthető a vásárlás után.</li>
             </ul>
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