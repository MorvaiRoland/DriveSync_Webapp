
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
      case 'shield': return <ShieldCheck className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />;
      case 'scale': return <Scale className="w-12 h-12 text-amber-500 dark:text-amber-400" />;
      case 'building': return <Building2 className="w-12 h-12 text-blue-500 dark:text-blue-400" />;
      default: return null;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 transition-colors duration-500 py-12 px-2">
      {/* Main Card */}
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 relative overflow-hidden">
        {/* Decorative Icon */}
        <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none select-none">
          {icon === 'shield' && <ShieldCheck size={160} className="text-emerald-400 dark:text-emerald-600" />}
          {icon === 'scale' && <Scale size={160} className="text-amber-400 dark:text-amber-600" />}
          {icon === 'building' && <Building2 size={160} className="text-blue-400 dark:text-blue-600" />}
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Vissza a főoldalra
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            {getIcon()}
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {title}
            </h1>
            {lastUpdated && (
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Utolsó frissítés: {lastUpdated}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-4">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500 font-mono">
          &copy; {new Date().getFullYear()} DynamicSense Technologies. Minden jog fenntartva.
        </div>
      </div>
    </div>
  );
}