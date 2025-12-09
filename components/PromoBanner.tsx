'use client'

import { useState, useEffect } from 'react'

export default function PromoBanner() {
  // Kezdetben null, hogy elkerüljük a szerver/kliens eltérést betöltéskor
  const [timeLeft, setTimeLeft] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // A határidő: 2025. december 16. éjfél (Ugyanaz, mint az SQL triggerben!)
    const deadline = new Date('2025-12-16T23:59:59').getTime()

    const updateTimer = () => {
      const now = new Date().getTime()
      const diff = deadline - now

      if (diff < 0) {
        setIsVisible(false)
        return
      }

      // Idő kiszámítása
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      // Ha már nagyon közel van (kevesebb mint 1 óra), másodperceket is mutathatunk, de most elég a perc
      setTimeLeft(`${days} nap ${hours} óra ${minutes} perc`)
    }

    // Azonnal futtatjuk egyszer, hogy ne kelljen várni 1 másodpercet a megjelenésre
    updateTimer()

    const timer = setInterval(updateTimer, 60000) // Elég percenként frissíteni (vagy 1000 a másodperchez)

    return () => clearInterval(timer)
  }, [])

  // Ha lejárt az idő, vagy még nem töltött be a kliens oldali kód, ne mutassunk semmit
  if (!isVisible || !timeLeft) return null

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-white shadow-md animate-in slide-in-from-top duration-700 relative z-[100]">
      <div className="max-w-7xl mx-auto py-3 px-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold tracking-wide text-center sm:text-left">
         
         <div className="flex items-center gap-2 justify-center">
            <span className="text-lg">🚀</span>
            <span className="uppercase tracking-widest text-white/90">Indulási Akció:</span>
         </div>
         
         <div className="hidden sm:block opacity-50">|</div>

         <div>
           Regisztrálj most és <span className="underline decoration-white/50 underline-offset-4 decoration-2">ÖRÖKÖS PRO</span> tagságot kapsz ingyen!
         </div>

         <div className="mt-1 sm:mt-0 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full font-mono text-white shadow-sm flex items-center gap-2 whitespace-nowrap">
           <span className="animate-pulse">⏳</span>
           {timeLeft} maradt
         </div>

      </div>
    </div>
  )
}