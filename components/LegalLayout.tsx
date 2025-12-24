'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Scale, Building2 } from 'lucide-react';

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  icon?: 'shield' | 'scale' | 'building';
  lastUpdated?: string;
}

export default function LegalLayout({ children, title, icon, lastUpdated }: LegalLayoutProps) {
  
  const getIcon = () => {
    switch (icon) {
      case 'shield': return <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />;
      case 'scale': return <Scale className="w-8 h-8 text-amber-600 dark:text-amber-500" />;
      case 'building': return <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-500" />;
      default: return null;
    }
  };

  return (
    // JAVÍTÁS: Nincs felesleges wrapper, csak a tartalomra fókuszálunk.
    // A transition-colors segít a sima téma váltásban.
    <div className="relative w-full max-w-4xl mx-auto px-6 py-24 md:py-32 transition-colors duration-500">
      
      {/* --- Háttér Effektek (Csak dekoráció, pointer-events-none) --- */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-slate-200/50 dark:bg-slate-900/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-200/30 dark:bg-amber-900/20 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* --- Navigáció --- */}
      <div className="mb-12">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Vissza a főoldalra
        </Link>
      </div>

      {/* --- Fejléc --- */}
      <header className="mb-16 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
              <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
                  {getIcon()}
              </div>
              <div className="flex flex-col gap-2">
                 <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    {title}
                 </h1>
                 {lastUpdated && (
                    <span className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">
                       Utolsó frissítés: {lastUpdated}
                    </span>
                 )}
              </div>
          </div>
      </header>

      {/* --- Tartalom (Typography Plugin Optimalizálva) --- */}
      <article className="
          prose prose-lg max-w-none 
          prose-slate dark:prose-invert
          prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-white
          prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed
          prose-a:text-amber-600 dark:prose-a:text-amber-500 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-bold
          prose-li:text-slate-600 dark:prose-li:text-slate-300
          prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-900/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
      ">
          {children}
      </article>

      {/* --- Footer --- */}
      <footer className="mt-24 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-400 dark:text-slate-500 font-mono">
          &copy; {new Date().getFullYear()} DynamicSense Technologies. Minden jog fenntartva.
      </footer>
    </div>
  );
}