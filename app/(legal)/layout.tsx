import Link from 'next/link'
import Image from 'next/image'

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-amber-500/30">
      {/* Egyszerűsített Fejléc */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8">
                 <Image src="/DynamicSense-logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="font-black text-lg text-white uppercase">Drive<span className="text-amber-500">Sync</span></span>
           </Link>
           <Link href="/" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
              ← Vissza az appba
           </Link>
        </div>
      </nav>

      {/* Tartalom */}
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <div className="prose prose-invert prose-amber max-w-none">
            {children}
        </div>
      </main>

      {/* Lábléc */}
      <footer className="border-t border-slate-900 py-12 text-center text-slate-600 text-sm">
         <p>© {new Date().getFullYear()} DynamicSense Technologies. Minden jog fenntartva.</p>
      </footer>
    </div>
  )
}