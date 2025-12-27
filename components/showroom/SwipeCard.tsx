'use client'

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import Image from 'next/image'
import { Heart, Zap } from 'lucide-react'

interface SwipeCardProps {
  data: any
  onSwipe: (id: string, direction: 'left' | 'right') => void
  isFront: boolean
}

export default function SwipeCard({ data, onSwipe, isFront }: SwipeCardProps) {
  // Mozgás követése
  const x = useMotionValue(0)
  
  // Forgatás: ha 200px-et húzzuk jobbra, 15 fokot dől jobbra (és fordítva)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  
  // Átlátszóság: a szélek felé haladva elhalványul
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0, 1, 1, 1, 0])

  // Overlay színek (Like/Nope jelzés húzáskor)
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100 // Minimum ennyit kell húzni a szavazathoz
    if (info.offset.x > threshold) {
      onSwipe(data.entryId, 'right')
    } else if (info.offset.x < -threshold) {
      onSwipe(data.entryId, 'left')
    }
  }

  // Ha a kártya a háttérben van (nem az első), fixen áll és kisebb
  if (!isFront) {
    return (
      <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-[3rem] border border-slate-200 dark:border-slate-700 scale-[0.9] opacity-40 translate-y-8 blur-[1px] pointer-events-none z-0">
        <div className="h-4/5 relative overflow-hidden rounded-t-[3rem]">
          <Image src={data.imageUrl || '/placeholder-car.jpg'} alt="" fill className="object-cover" />
        </div>
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
      className="absolute inset-0 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl cursor-grab z-20 touch-none overflow-hidden"
    >
      {/* LIKE / NOPE VIZUÁLIS JELEK */}
      <motion.div 
        style={{ opacity: likeOpacity }} 
        className="absolute top-10 left-10 z-30 border-4 border-emerald-500 rounded-xl px-4 py-2 -rotate-12 bg-emerald-500/10 backdrop-blur-md"
      >
        <span className="text-emerald-500 font-black text-3xl uppercase italic tracking-tighter">ADOM 🔥</span>
      </motion.div>

      <motion.div 
        style={{ opacity: nopeOpacity }} 
        className="absolute top-10 right-10 z-30 border-4 border-red-500 rounded-xl px-4 py-2 rotate-12 bg-red-500/10 backdrop-blur-md"
      >
        <span className="text-red-500 font-black text-3xl uppercase italic tracking-tighter">ÁHH ✖</span>
      </motion.div>

      {/* AUTÓ KÉPE (4/5 magasság) */}
      <div className="h-4/5 relative bg-slate-200 dark:bg-slate-800">
        <Image 
          src={data.imageUrl || '/placeholder-car.jpg'} 
          alt={data.carName} 
          fill 
          className="object-cover pointer-events-none" 
          priority
        />
        {/* Árnyékolás a szöveg alá */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
      </div>

      {/* ALSÓ INFORMÁCIÓS SÁV (1/5 magasság) */}
      <div className="h-1/5 p-8 flex items-center justify-between bg-white dark:bg-slate-900">
        <div className="space-y-1">
          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
            {data.carName}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              <Zap size={10} className="fill-current" />
              <span className="text-[10px] font-black uppercase tracking-widest">{data.voteCount} voks</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">
              DynamicSense Verified
            </span>
          </div>
        </div>

        {/* Ikon háttérrel */}
        <div className="bg-slate-100 dark:bg-accent/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5 text-slate-400 dark:text-muted-foreground group-hover:text-primary transition-colors">
          <Heart size={24} className="group-hover:fill-current" />
        </div>
      </div>
    </motion.div>
  )
}