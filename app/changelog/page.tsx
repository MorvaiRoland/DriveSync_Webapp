import { createClient } from '@/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Calendar, Zap, Sparkles } from 'lucide-react'

export const revalidate = 0;

export default async function ChangelogPage() {
  const supabase = await createClient()

  const { data: releases } = await supabase
    .from('release_notes')
    .select('*')
    .order('release_date', { ascending: false }) 

  // Verzió szerinti rendezés (kliens oldali logika a szerver komponensben)
  const sortedReleases = releases?.sort((a: any, b: any) => {
      const vA = a.version.replace('v', '').split('.').map(Number);
      const vB = b.version.replace('v', '').split('.').map(Number);
      
      for (let i = 0; i < 3; i++) {
          if (vA[i] > vB[i]) return -1;
          if (vA[i] < vB[i]) return 1;
      }
      return 0;
  }) || [];

  return (
    // FŐ KONTÉNER: bg-slate-50 (világos) vs dark:bg-[#0B0F19] (sötét)
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-200 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden transition-colors duration-300">
      
      {/* HÁTTÉR EFFEKTEK */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* A gömbök világos módban halványabbak, sötétben erősebbek */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[100px]"></div>
          {/* Noise textúra (mix-blend-overlay miatt mindkét módban jól néz ki) */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12 md:py-20">
        
        {/* HEADER */}
        <div className="mb-16">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white transition-colors mb-8 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Vissza a főoldalra
            </Link>
            
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                Újdonságok
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
                Kövesd nyomon a DynamicSense fejlődését. Itt találod a legfrissebb funkciókat és javításokat.
            </p>
        </div>

        {/* TIMELINE */}
        <div className="space-y-12 relative">
            {/* Függőleges vonal: Világosban szürke, Sötétben színátmenetes */}
            <div className="absolute left-[19px] top-4 bottom-0 w-0.5 bg-slate-200 dark:bg-gradient-to-b dark:from-indigo-500/50 dark:via-slate-800 dark:to-transparent"></div>

            {sortedReleases.length > 0 ? (
                sortedReleases.map((item: any, index: number) => (
                    <div key={item.id} className="relative pl-12 group">
                        
                        {/* Timeline Ikon */}
                        <div className={`absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center border-4 z-10 shadow-lg transition-colors duration-300
                            ${index === 0 
                                ? 'bg-indigo-600 text-white border-white dark:border-[#0B0F19] shadow-indigo-500/30' // Legújabb
                                : 'bg-white border-slate-100 text-slate-400 dark:bg-slate-800 dark:border-[#0B0F19] dark:text-slate-400' // Régebbi
                            }`}>
                            {index === 0 ? <Sparkles className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                        </div>

                        {/* Kártya */}
                        <div className={`rounded-2xl border p-6 md:p-8 transition-all duration-300
                            ${index === 0 
                                // Legújabb kártya stílusa (Light/Dark)
                                ? 'bg-indigo-50/50 border-indigo-200 dark:bg-gradient-to-br dark:from-indigo-900/20 dark:to-slate-900/50 dark:border-indigo-500/30 shadow-lg shadow-indigo-500/10' 
                                // Régebbi kártyák stílusa (Light/Dark)
                                : 'bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900/30 dark:border-white/5 dark:hover:bg-slate-900/50 dark:hover:border-white/10 shadow-sm'
                            }`}>
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <span className={`text-lg font-black tracking-wide ${index === 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {item.version}
                                    </span>
                                    {index === 0 && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border dark:border-indigo-500/30">
                                            Legújabb
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-100 dark:bg-black/20 px-3 py-1 rounded-full w-fit border border-slate-200 dark:border-transparent">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(item.release_date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                {item.title}
                            </h2>

                            {/* Prose (Szöveg) formázás - Invertálás sötét módban */}
                            <div className="prose prose-slate prose-sm max-w-none dark:prose-invert text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
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
        <div className="mt-20 pt-10 border-t border-slate-200 dark:border-white/5 text-center text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} DynamicSense. Folyamatosan fejlődünk.</p>
        </div>

      </div>
    </div>
  )
}