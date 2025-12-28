"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Gauge, Map, Search, Users, FileText, Lock, Sparkles } from 'lucide-react';

interface HeaderNavProps {
  isPro?: boolean;
}

export default function HeaderNav({ isPro = false }: HeaderNavProps) {
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
          <Link href="/analytics" prefetch className="flex items-center gap-1 hover:text-blue-500 transition-colors">
            <Gauge className="w-4 h-4" /> Költség
          </Link>
          
          <Link href="/showroom" prefetch className="flex items-center gap-1 hover:text-orange-500 transition-colors">
            <span className="text-lg">🔥</span> Showroom
          </Link>

          {/* Szerviz Térkép - ID HOZZÁADVA */}
          {isPro ? (
              <Link 
                href="/services" 
                id="tour-service-map" // <--- ITT AZ ID
                prefetch 
                className="flex items-center gap-1 hover:text-blue-500 transition-colors"
              >
                <Map className="w-4 h-4" /> Szerviz Térkép
              </Link>
          ) : (
              <Link 
                href="/pricing" 
                id="tour-service-map" // <--- ITT IS, HOGY MINDIG MEGLEGYEN
                className="flex items-center gap-1 text-slate-400 hover:text-amber-500 transition-colors group"
              >
                <Lock className="w-3 h-3 group-hover:hidden" />
                <Map className="w-4 h-4 hidden group-hover:block" /> 
                Szerviz Térkép
              </Link>
          )}

          {/* VIN Kereső */}
          {isPro ? (
              <Link href="/check" prefetch className="flex items-center gap-1 hover:text-emerald-500 transition-colors">
                <Search className="w-4 h-4" /> VIN Kereső
              </Link>
          ) : (
              <Link href="/pricing" className="flex items-center gap-1 text-slate-400 hover:text-amber-500 transition-colors group">
                <Lock className="w-3 h-3 group-hover:hidden" />
                <Search className="w-4 h-4 hidden group-hover:block" /> 
                VIN Kereső
              </Link>
          )}
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

        <div className={`absolute top-16 left-0 right-0 mx-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl transform transition-all origin-top ${open ? 'scale-y-100 opacity-100' : 'scale-y-95 opacity-0 pointer-events-none'} max-h-[calc(100vh-100px)] overflow-auto`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 relative">
                  <Image src="/DynamicSense-logo.png" alt="Logo" fill className="object-contain" />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">DynamicSense</div>
                  <div className="text-xs text-slate-400">Gyors hozzáférés</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <nav className="grid gap-2">
              <Link href="/analytics" prefetch onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500">
                    <Gauge className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Költség Elemző</span>
              </Link>

              <Link href="/showroom" prefetch onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-500">
                    <span className="text-lg">🔥</span>
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Showroom</span>
              </Link>

              {isPro ? (
                  <>
                    <Link href="/check" prefetch onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                            <Search className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">VIN Kereső</span>
                    </Link>
                    <Link href="/services" prefetch onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-500">
                            <Map className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Szerviz Térkép</span>
                    </Link>
                  </>
              ) : (
                  <>
                    <Link href="/pricing" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 opacity-75">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <Lock className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <span className="font-semibold text-slate-500 block">VIN Kereső</span>
                            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Prémium</span>
                        </div>
                    </Link>
                    <Link href="/pricing" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 opacity-75">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <Lock className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <span className="font-semibold text-slate-500 block">Szerviz Térkép</span>
                            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Prémium</span>
                        </div>
                    </Link>
                  </>
              )}

              <Link href="/pricing" prefetch onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors mt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-500">
                    <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Csomagok & Árazás</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}