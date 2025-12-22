"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Gauge, Map, Search, Users, FileText } from 'lucide-react';

export default function HeaderNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 group-hover:rotate-12 transition-transform duration-500">
            <Image src="/DynamicSense-logo.png" alt="DynamicSense" fill className="object-contain drop-shadow-md" priority />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase hidden sm:block">
            Dynamic<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Sense</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
          <Link href="/analytics" className="flex items-center gap-1 hover:text-blue-500 transition-colors">
            <Gauge className="w-4 h-4" /> Költség
          </Link>
          <Link href="/showroom" className="flex items-center gap-1 hover:text-orange-500 transition-colors">
            <span className="text-lg">🔥</span> Showroom
          </Link>
          <Link href="/services" className="flex items-center gap-1 hover:text-blue-500 transition-colors">
            <Map className="w-4 h-4" /> Szerviz Térkép
          </Link>
          <Link href="/check" className="flex items-center gap-1 hover:text-emerald-500 transition-colors">
            <Search className="w-4 h-4" /> VIN Kereső
          </Link>
        </div>
      </div>

      {/* Mobile hamburger */}
      <div className="md:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Menü megnyitása"
          className="ml-3 inline-flex items-center justify-center p-2 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md"
        >
          <Menu className="w-5 h-5 text-slate-700 dark:text-slate-100" />
        </button>
      </div>

      {/* Mobile sheet */}
      <div className={`fixed inset-0 z-50 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />

        <div className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-950 rounded-t-3xl border border-slate-200 dark:border-slate-800 shadow-2xl transform transition-transform ${open ? 'translate-y-0' : 'translate-y-1/2'} max-h-[80vh] overflow-auto`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 relative">
                  <Image src="/DynamicSense-logo.png" alt="Logo" fill className="object-contain" />
                </div>
                <div>
                  <div className="text-lg font-black">DynamicSense</div>
                  <div className="text-xs text-slate-400">Gyors hozzáférés</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="grid gap-3">
              <Link href="/check" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <Search className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold">Alvázszám kereső</span>
              </Link>

              <Link href="/showroom" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <span className="text-lg">🔥</span>
                <span className="font-semibold">Showroom</span>
              </Link>

              <Link href="/services" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <Map className="w-5 h-5 text-slate-600" />
                <span className="font-semibold">Szerviz Térkép</span>
              </Link>

              <Link href="/analytics" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <Gauge className="w-5 h-5 text-amber-500" />
                <span className="font-semibold">Költség</span>
              </Link>

              <Link href="/pricing" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <FileText className="w-5 h-5 text-amber-500" />
                <span className="font-semibold">Árazás</span>
              </Link>

              <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <Users className="w-5 h-5 text-slate-700" />
                <span className="font-semibold">Fiók</span>
              </Link>

              <div className="pt-4">
                <Link href="/login" onClick={() => setOpen(false)} className="block text-center bg-amber-500 text-white py-3 rounded-2xl font-bold shadow-md">Ingyenes Regisztráció</Link>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
