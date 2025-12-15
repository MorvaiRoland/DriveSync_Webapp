'use client'

import { useState } from 'react'
import SwipeCard from './SwipeCard'
import { toggleBattleVote } from '@/app/actions/showroom'
import { RefreshCw , Heart,X} from 'lucide-react'

export default function SwipeGame({ entries }: { entries: any[] }) {
  // A kártyákat állapotban tároljuk, hogy tudjuk őket törölni a húzásnál
  const [cards, setCards] = useState(entries)
  
  // Szavazás logika
  const handleSwipe = async (id: string, direction: 'left' | 'right') => {
    // 1. Azonnal eltávolítjuk a kártyát a UI-ról (Optimista frissítés)
    setCards((current) => current.filter((c) => c.entryId !== id))

    // 2. Ha jobbra húzta, beküldjük a szavazatot
    if (direction === 'right') {
        try {
            await toggleBattleVote(id)
            console.log('Voted for:', id)
        } catch (error) {
            console.error('Szavazási hiba', error)
        }
    }
  }

  // Ha elfogytak a kártyák
  if (cards.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-[500px] bg-slate-100 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center p-6">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 text-4xl">
                🏁
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Végigértél a mezőnyön!</h3>
            <p className="text-slate-500 mb-6">Nincs több autó, amire szavazhatnál.</p>
            <button 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
            >
                <RefreshCw className="w-4 h-4" />
                Újratöltés
            </button>
        </div>
    )
  }

  return (
    <div className="relative w-full max-w-sm mx-auto h-[550px]">
      {/* A tömböt megfordítjuk (reverse) megjelenítésnél, 
         hogy az első elem (index 0) legyen legfelül a DOM-ban? 
         Nem, a 'stack' logika miatt a lista VÉGE van felül a CSS z-indexben alapból, 
         de mi most egyszerűsítünk:
         Mindig a 0. indexűt rendereljük interaktívként, a 1. indexűt háttérként.
      */}
      {cards.map((entry, index) => {
          // Csak a legfelső két kártyát rendereljük ki a teljesítmény miatt
          if (index > 1) return null;
          
          return (
            <SwipeCard 
                key={entry.entryId} 
                data={entry} 
                onSwipe={handleSwipe}
                isFront={index === 0} // Csak a legelső (0.) mozgatható
            />
          )
      })}
      
      {/* Vezérlő gombok alul (opcionális, ha valaki nem akar húzogatni) */}
      <div className="absolute -bottom-20 left-0 right-0 flex justify-center gap-6">
          <button 
            onClick={() => handleSwipe(cards[0].entryId, 'left')}
            className="w-14 h-14 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-red-100 text-red-500 flex items-center justify-center hover:scale-110 transition-transform"
          >
              <X className="w-6 h-6" />
          </button>
          <button 
             onClick={() => handleSwipe(cards[0].entryId, 'right')}
             className="w-14 h-14 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-emerald-100 text-emerald-500 flex items-center justify-center hover:scale-110 transition-transform"
          >
              <Heart className="w-6 h-6 fill-current" />
          </button>
      </div>
    </div>
  )
}