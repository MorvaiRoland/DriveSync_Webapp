"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Gauge, Map, Search, Lock, Sparkles } from 'lucide-react';

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
            <Image src="/DynamicSense-logo.png" alt="DynamicSense" fill className="object-contain" priority />
          </div>
          <span className="text-xl font-bold tracking-widest text-white uppercase hidden sm:block">
            Dynamic<span className="text-zinc-500">Sense</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-bold tracking-wide uppercase text-zinc-500">
          <Link href="/analytics" prefetch className="flex items-center gap-2 hover:text-white transition-colors">
            <Gauge className="w-4 h-4 text-indigo-500" /> Költség
          </Link>
          
          <Link href="/showroom" prefetch className="flex items-center gap-2 hover:text-white transition-colors">
            <span className="text-lg">🔥</span> Showroom
          </Link>

          {/* Szerviz Térkép - ID HOZZÁADVA */}
          {isPro ? (
              <Link 
                href="/services" 
                id="tour-service-map" // <--- ITT AZ ID
                prefetch 
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Map className="w-4 h-4 text-blue-500" /> Szerviz Térkép
              </Link>
          ) : (
              <Link 
                href="/pricing" 
                id="tour-service-map" // <--- ITT IS, HOGY MINDIG MEGLEGYEN
                className="flex items-center gap-2 text-zinc-600 hover:text-amber-500 transition-colors group"
              >
                <Lock className="w-3 h-3 group-hover:hidden" />
                <Map className="w-4 h-4 hidden group-hover:block text-amber-500" /> 
                Szerviz Térkép
              </Link>
          )}

          {/* VIN Kereső */}
          {isPro ? (
              <Link href="/check" prefetch className="flex items-center gap-2 hover:text-white transition-colors">
                <Search className="w-4 h-4 text-emerald-500" /> VIN Kereső
              </Link>
          ) : (
              <Link href="/pricing" className="flex items-center gap-2 text-zinc-600 hover:text-amber-500 transition-colors group">
                <Lock className="w-3 h-3 group-hover:hidden" />
                <Search className="w-4 h-4 hidden group-hover:block text-amber-500" /> 
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
          className="ml-3 inline-flex items-center justify-center p-2 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl text-zinc-300"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile sheet */}
      <div className={`fixed inset-0 z-[100] transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />

        <div className={`absolute top-16 left-0 right-0 mx-4 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl transform transition-all origin-top ${open ? 'scale-y-100 opacity-100' : 'scale-y-95 opacity-0 pointer-events-none'} max-h-[calc(100vh-100px)] overflow-auto`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 relative">
                  <Image src="/DynamicSense-logo.png" alt="Logo" fill className="object-contain" />
                </div>
                <div>
                  <div className="text-lg font-bold tracking-widest text-white uppercase">Dynamic<span className="text-zinc-500">Sense</span></div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-600">Gyors hozzáférés</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors">
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            <nav className="grid gap-2">
              <Link href="/analytics" prefetch onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-500">
                    <Gauge className="w-4 h-4" />
                </div>
                <span className="font-bold uppercase tracking-wider text-sm text-zinc-300">Költség Elemző</span>
              </Link>

              <Link href="/showroom" prefetch onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-orange-500">
                    <span className="text-lg">🔥</span>
                </div>
                <span className="font-bold uppercase tracking-wider text-sm text-zinc-300">Showroom</span>
              </Link>

              {isPro ? (
                  <>
                    <Link href="/check" prefetch onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-500">
                            <Search className="w-4 h-4" />
                        </div>
                        <span className="font-bold uppercase tracking-wider text-sm text-zinc-300">VIN Kereső</span>
                    </Link>
                    <Link href="/services" prefetch onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-500">
                            <Map className="w-4 h-4" />
                        </div>
                        <span className="font-bold uppercase tracking-wider text-sm text-zinc-300">Szerviz Térkép</span>
                    </Link>
                  </>
              ) : (
                  <>
                    <Link href="/pricing" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 opacity-75">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                            <Lock className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <span className="font-bold uppercase tracking-wider text-sm text-zinc-500 block">VIN Kereső</span>
                            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Prémium</span>
                        </div>
                    </Link>
                    <Link href="/pricing" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 opacity-75">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                            <Lock className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <span className="font-bold uppercase tracking-wider text-sm text-zinc-500 block">Szerviz Térkép</span>
                            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Prémium</span>
                        </div>
                    </Link>
                  </>
              )}

              <Link href="/pricing" prefetch onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 transition-colors mt-2 border-t border-zinc-800 pt-5">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-500">
                    <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-bold uppercase tracking-wider text-sm text-zinc-300">Csomagok & Árazás</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}