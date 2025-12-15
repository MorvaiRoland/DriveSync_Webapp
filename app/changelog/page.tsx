import { createClient } from '@/supabase/server' // Figyelj az importra!
import Link from 'next/link'
import { ArrowLeft, Calendar, Zap, Sparkles } from 'lucide-react'

export const revalidate = 0;

export default async function ChangelogPage() {
  const supabase = await createClient()

  // MÓDOSÍTÁS: Ha a verziószámok (pl. 2.3.0) konzisztensek, 
  // akkor a legegyszerűbb továbbra is a dátumot használni, mert az a legbiztosabb.
  // De ha a kérésed szerint verzió alapján kell:
  
  const { data: releases } = await supabase
    .from('release_notes')
    .select('*')
    // Itt a 'version' mezőre cseréltem a rendezést
    // FONTOS: Ez csak akkor működik jól, ha a verziók pl. 2.3.0 formátumúak,
    // és nem "v2.3.0", vagy ha a Supabase tudja kezelni a verziókat.
    // Ha nem, akkor javasolt maradni a 'release_date'-nél, ami logikailag ugyanazt adja.
    .order('release_date', { ascending: false }) 

  // Ha a verzió string (pl "v2.3.0") és a kliens oldalon akarod pontosan rendezni (semver szerint):
  const sortedReleases = releases?.sort((a: any, b: any) => {
      // Eltávolítjuk a 'v' betűt és pontok mentén szétvágjuk
      const vA = a.version.replace('v', '').split('.').map(Number);
      const vB = b.version.replace('v', '').split('.').map(Number);
      
      // Összehasonlítás (Major, Minor, Patch)
      for (let i = 0; i < 3; i++) {
          if (vA[i] > vB[i]) return -1; // Csökkenő sorrend
          if (vA[i] < vB[i]) return 1;
      }
      return 0;
  }) || [];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* ... (Háttér effektek maradnak) ... */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12 md:py-20">
        
        {/* HEADER */}
        <div className="mb-16">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Vissza a főoldalra
            </Link>
            
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
                Újdonságok
            </h1>
            <p className="text-lg text-slate-400">
                Kövesd nyomon a DynamicSense fejlődését. Itt találod a legfrissebb funkciókat és javításokat.
            </p>
        </div>

        {/* TIMELINE */}
        <div className="space-y-12 relative">
            {/* Függőleges vonal */}
            <div className="absolute left-[19px] top-4 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500/50 via-slate-800 to-transparent"></div>

            {/* ITT HASZNÁLJUK A RENDEZETT LISTÁT (sortedReleases) */}
            {sortedReleases.length > 0 ? (
                sortedReleases.map((item: any, index: number) => (
                    <div key={item.id} className="relative pl-12 group">
                        
                        {/* Timeline Ikon */}
                        <div className={`absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center border-4 border-[#0B0F19] z-10 shadow-lg
                            ${index === 0 ? 'bg-indigo-600 text-white shadow-indigo-500/30' : 'bg-slate-800 text-slate-400'}`}>
                            {index === 0 ? <Sparkles className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                        </div>

                        {/* Kártya */}
                        <div className={`rounded-2xl border p-6 md:p-8 transition-all duration-300
                            ${index === 0 
                                ? 'bg-gradient-to-br from-indigo-900/20 to-slate-900/50 border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.1)]' 
                                : 'bg-slate-900/30 border-white/5 hover:bg-slate-900/50 hover:border-white/10'
                            }`}>
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <span className={`text-lg font-black tracking-wide ${index === 0 ? 'text-indigo-400' : 'text-slate-200'}`}>
                                        {item.version}
                                    </span>
                                    {index === 0 && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                            Legújabb
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-black/20 px-3 py-1 rounded-full w-fit">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(item.release_date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-4">
                                {item.title}
                            </h2>

                            <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
                                <p>{item.description}</p>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="pl-12 text-slate-500 italic">
                    Még nincsenek publikus frissítési jegyzékek.
                </div>
            )}
        </div>

        {/* FOOTER */}
        <div className="mt-20 pt-10 border-t border-white/5 text-center text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} DynamicSense. Folyamatosan fejlődünk.</p>
        </div>

      </div>
    </div>
  )
}