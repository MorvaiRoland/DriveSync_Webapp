import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LegalLayout({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-amber-500/30">
      <nav className="p-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
            <Link href="/" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors group">
                <ArrowLeft className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform" />
            </Link>
            <span className="font-bold text-white text-lg">{title}</span>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-12 prose prose-invert prose-amber">
        {children}
      </main>
      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-600">
        &copy; {new Date().getFullYear()} DriveSync Hungary
      </footer>
    </div>
  )
}