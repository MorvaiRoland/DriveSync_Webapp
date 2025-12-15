'use client'

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import Image from 'next/image'
import { Heart, X } from 'lucide-react'

interface SwipeCardProps {
  data: any
  onSwipe: (id: string, direction: 'left' | 'right') => void
  isFront: boolean
}

export default function SwipeCard({ data, onSwipe, isFront }: SwipeCardProps) {
  // Mozgás koordináták
  const x = useMotionValue(0)
  
  // Forgatás: minél jobban húzzuk oldalra, annál jobban dől (max 15 fok)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  
  // Átlátszóság: ha nagyon kihúzzuk, eltűnik
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])

  // Szín effektek (Overlay): Jobbra zöld, Balra piros
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100 // Mennyire kell elhúzni, hogy érzékelje
    if (info.offset.x > threshold) {
      onSwipe(data.entryId, 'right')
    } else if (info.offset.x < -threshold) {
      onSwipe(data.entryId, 'left')
    }
  }

  // Ha nem ez az első kártya, akkor nem mozgatható, csak ott van a háttérben
  if (!isFront) {
    return (
      <div className="absolute top-0 left-0 w-full h-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 scale-95 opacity-50 translate-y-4 pointer-events-none z-0">
         <ImageContent data={data} />
      </div>
    )
  }

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      className="absolute top-0 left-0 w-full h-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 cursor-grab z-10 touch-none"
    >
      {/* LIKE OVERLAY (Zöld) */}
      <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 z-20 border-4 border-emerald-500 rounded-lg px-4 py-2 -rotate-12 bg-black/20 backdrop-blur-sm">
        <span className="text-emerald-500 font-black text-4xl uppercase tracking-widest">LIKE</span>
      </motion.div>

      {/* NOPE OVERLAY (Piros) */}
      <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-8 z-20 border-4 border-red-500 rounded-lg px-4 py-2 rotate-12 bg-black/20 backdrop-blur-sm">
        <span className="text-red-500 font-black text-4xl uppercase tracking-widest">NEM</span>
      </motion.div>

      <ImageContent data={data} />
    </motion.div>
  )
}

// Segédkomponens a tartalomhoz
function ImageContent({ data }: { data: any }) {
    return (
        <>
            <div className="relative h-4/5 w-full bg-slate-200">
                <Image 
                    src={data.imageUrl || '/placeholder-car.jpg'} 
                    alt={data.carName}
                    fill
                    className="object-cover pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
            <div className="h-1/5 p-6 flex items-center justify-between bg-white dark:bg-slate-800">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white pointer-events-none">{data.carName}</h3>
                    <p className="text-sm text-slate-500 pointer-events-none">{data.voteCount} eddigi szavazat</p>
                </div>
                <div className="text-slate-300 pointer-events-none">
                    <Heart className="w-8 h-8" />
                </div>
            </div>
        </>
    )
}