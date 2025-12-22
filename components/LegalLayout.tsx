// components/LegalLayout.tsx
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
    // FŐ HÁTTÉR: Világosban bg-slate-50, Sötétben bg-slate-950
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-600 dark:text-slate-300 selection:bg-amber-500/30 relative overflow-hidden transition-colors duration-500">
      
      {/* --- Háttér Effektek (Adaptív) --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-slate-200 dark:bg-slate-900/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-200/40 dark:bg-amber-900/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
        
        {/* --- Navigáció --- */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Vissza a főoldalra
          </Link>
        </div>

        {/* --- Fejléc --- */}
        <header className="mb-16 border-b border-slate-200 dark:border-slate-800 pb-8">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
                    {getIcon()}
                </div>
                {lastUpdated && (
                    <span className="text-xs font-mono uppercase tracking-widest text-slate-500 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full bg-white/50 dark:bg-slate-900/50">
                        Hatályos: {lastUpdated}
                    </span>
                )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {title}
            </h1>
        </header>

        {/* --- Tartalom (Prose) --- */}
        {/* Itt a kulcs: prose-slate (világos) és dark:prose-invert (sötét) */}
        <main className="prose prose-lg prose-slate dark:prose-invert max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight 
            prose-a:text-amber-600 dark:prose-a:text-amber-500 prose-a:no-underline hover:prose-a:underline 
            prose-li:text-slate-600 dark:prose-li:text-slate-400 
            prose-p:text-slate-700 dark:prose-p:text-slate-300
            prose-strong:text-slate-900 dark:prose-strong:text-white">
           {children}
        </main>

        {/* --- Footer --- */}
        <footer className="mt-20 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-600 font-mono">
           &copy; {new Date().getFullYear()} DynamicSense Technologies. Minden jog fenntartva.
        </footer>
      </div>
    </div>
  );
}