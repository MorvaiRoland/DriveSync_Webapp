"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, Home, FileText, User, Info, Settings, Search } from 'lucide-react';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('click', onClick);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <div className="fixed top-4 right-4 z-60" ref={ref}>
        <button
          aria-label={open ? 'Bezárás' : 'Menü megnyitása'}
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-lg backdrop-blur-md transition-transform hover:scale-105"
        >
          {open ? <X className="w-5 h-5 text-slate-800 dark:text-slate-100" /> : <Menu className="w-5 h-5 text-slate-800 dark:text-slate-100" />}
        </button>

        <div
          className={`mt-3 w-64 origin-top-right rounded-xl overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl transform transition-all ${open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
        >
          <div className="p-4">
            <nav className="flex flex-col gap-2">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                <Home className="w-5 h-5 text-amber-500" />
                <span className="font-medium">Főoldal</span>
              </Link>

              <Link href="/check" onClick={() => setOpen(false)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                <Search className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">Alvázszám kereső</span>
              </Link>

              <a href="#features" onClick={() => setOpen(false)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                <Info className="w-5 h-5 text-slate-500" />
                <span className="font-medium">Funkciók</span>
              </a>

              <Link href="/pricing" onClick={() => setOpen(false)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                <FileText className="w-5 h-5 text-amber-500" />
                <span className="font-medium">Árazás</span>
              </Link>

              <Link href="/login" onClick={() => setOpen(false)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                <User className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                <span className="font-medium">Fiók / Belépés</span>
              </Link>

              <Link href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-3 mt-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:scale-[1.01] transition-all">
                <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <span className="text-sm">Beállítások</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
