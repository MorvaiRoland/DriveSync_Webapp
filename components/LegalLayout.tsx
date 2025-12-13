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
      case 'shield': return <ShieldCheck className="w-8 h-8 text-emerald-500" />;
      case 'scale': return <Scale className="w-8 h-8 text-amber-500" />;
      case 'building': return <Building2 className="w-8 h-8 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 selection:bg-amber-500/30 relative overflow-hidden">
      
      {/* --- Háttér Effektek --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-slate-900/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
        
        {/* --- Navigáció --- */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Vissza a főoldalra
          </Link>
        </div>

        {/* --- Fejléc --- */}
        <header className="mb-16 border-b border-slate-800 pb-8">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg">
                    {getIcon()}
                </div>
                {lastUpdated && (
                    <span className="text-xs font-mono uppercase tracking-widest text-slate-500 border border-slate-800 px-3 py-1 rounded-full bg-slate-900/50">
                        Hatályos: {lastUpdated}
                    </span>
                )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {title}
            </h1>
        </header>

        {/* --- Tartalom --- */}
        <main className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-amber-500 prose-a:no-underline hover:prose-a:underline prose-li:text-slate-400 prose-strong:text-white">
           {children}
        </main>

        {/* --- Footer --- */}
        <footer className="mt-20 pt-8 border-t border-slate-800 text-center text-sm text-slate-600 font-mono">
           &copy; {new Date().getFullYear()} DynamicSense Technologies. Minden jog fenntartva.
        </footer>
      </div>
    </div>
  );
}