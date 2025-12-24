import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 font-sans selection:bg-amber-500/30 transition-colors duration-500 flex flex-col">
      
      {/* --- Dekoratív Háttér --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px]" />
         <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* --- Fejléc (Sticky) --- */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 transition-colors duration-500">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
           
           {/* Logo */}
           <Link href="/" className="flex items-center gap-2.5 group transition-transform hover:scale-105 duration-300">
              <div className="relative w-8 h-8">
                 <Image src="/DynamicSense-logo.png" alt="DynamicSense Logo" fill className="object-contain" />
              </div>
              <span className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">
                Dynamic<span className="text-amber-500">Sense</span>
              </span>
           </Link>

           {/* Vissza gomb */}
           <Link 
             href="/" 
             className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors py-2 px-4 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
           >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Vissza az appba</span>
           </Link>
        </div>
      </nav>

      {/* --- Tartalom (Children) --- */}
      <main className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Typography beállítások a children tartalomra */}
        <div className="
            prose prose-lg max-w-none 
            prose-slate dark:prose-invert 
            prose-headings:font-bold prose-headings:tracking-tight 
            prose-a:text-amber-600 dark:prose-a:text-amber-500 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-slate-900 dark:prose-strong:text-white
            prose-img:rounded-2xl
        ">
            {children}
        </div>
      </main>

      {/* --- Lábléc --- */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800 py-12 text-center bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm">
         <div className="max-w-4xl mx-auto px-6">
            <p className="text-slate-500 dark:text-slate-500 text-sm font-medium">
               © {new Date().getFullYear()} DynamicSense Technologies. Minden jog fenntartva.
            </p>
            <div className="mt-2 text-xs text-slate-400 dark:text-slate-600 font-mono">
               Designed in Hungary
            </div>
         </div>
      </footer>

    </div>
  )
}