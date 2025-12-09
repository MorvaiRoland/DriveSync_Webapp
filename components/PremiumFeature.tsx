'use client'

import Link from 'next/link'

type PremiumFeatureProps = {
  isPro: boolean
  children: React.ReactNode
  fallbackTitle?: string
  fallbackDesc?: string
}

export default function PremiumFeature({ 
  isPro, 
  children, 
  fallbackTitle = "Ez egy Prémium funkció", 
  fallbackDesc = "Az eléréshez válts Pro csomagra!" 
}: PremiumFeatureProps) {
  
  // Ha van előfizetése, megmutatjuk a tartalmat
  if (isPro) {
    return <>{children}</>
  }

  // Ha NINCS, akkor homályosítunk és lakatot teszünk rá
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 group">
      {/* Tartalom elhomályosítva */}
      <div className="blur-sm opacity-50 pointer-events-none select-none grayscale transition-all duration-500">
        {children}
      </div>

      {/* Lakat és üzenet */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-slate-50/60 dark:bg-slate-900/60 backdrop-blur-[2px]">
        <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mb-4 shadow-lg animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{fallbackTitle}</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-xs mx-auto text-sm">{fallbackDesc}</p>
        
        {/* Ideiglenes gomb, amíg nincs Stripe */}
        <button className="bg-slate-400 cursor-not-allowed text-white font-bold py-2 px-6 rounded-xl text-sm">
           Előfizetés hamarosan...
        </button>
      </div>
    </div>
  )
}