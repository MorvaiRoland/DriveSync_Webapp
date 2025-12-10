import Link from 'next/link'

export default function LockedFeature({ label }: { label: string }) {
  return (
    <div className="relative w-full h-full min-h-[150px] bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col items-center justify-center text-center p-6 group">
      
      {/* Homályos háttér minta */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-400 via-slate-900 to-black"></div>
      
      <div className="relative z-10 bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg mb-3 ring-1 ring-slate-200 dark:ring-slate-700">
        <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      
      <h3 className="font-bold text-slate-900 dark:text-white mb-1">Pro Funkció</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-[200px]">
        A(z) {label} eléréséhez válts nagyobb csomagra.
      </p>
      
      <Link href="/pricing" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-amber-500/20 transition-all active:scale-95">
        Csomagok megtekintése
      </Link>
    </div>
  )
}