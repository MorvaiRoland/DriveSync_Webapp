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
  const x = useMotionValue(0)
  
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0, 1, 1, 1, 0])

  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100 
    if (info.offset.x > threshold) {
      onSwipe(data.entryId, 'right')
    } else if (info.offset.x < -threshold) {
      onSwipe(data.entryId, 'left')
    }
  }

  // HÁTTÉR KÁRTYA
  if (!isFront) {
    return (
      <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-[2rem] md:rounded-[3rem] border border-slate-200 dark:border-slate-700 scale-[0.9] opacity-40 translate-y-6 md:translate-y-8 blur-[1px] pointer-events-none z-0">
        <div className="h-full w-full relative overflow-hidden rounded-[2rem] md:rounded-[3rem]">
          <Image src={data.imageUrl || '/placeholder-car.jpg'} alt="" fill className="object-cover opacity-50" />
        </div>
      </div>
    )
  }

  // ELŐTÉR KÁRTYA
  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      className="absolute inset-0 bg-white dark:bg-slate-900 rounded-[2.5rem] md:rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl cursor-grab z-20 touch-none overflow-hidden flex flex-col"
    >
      {/* LIKE / NOPE JELZÉSEK */}
      <motion.div 
        style={{ opacity: likeOpacity }} 
        className="absolute top-8 left-8 z-30 border-4 border-emerald-500 rounded-xl px-3 py-1 -rotate-12 bg-emerald-500/10 backdrop-blur-md"
      >
        <span className="text-emerald-500 font-black text-2xl md:text-3xl uppercase italic tracking-tighter">ADOM 🔥</span>
      </motion.div>

      <motion.div 
        style={{ opacity: nopeOpacity }} 
        className="absolute top-8 right-8 z-30 border-4 border-red-500 rounded-xl px-3 py-1 rotate-12 bg-red-500/10 backdrop-blur-md"
      >
        <span className="text-red-500 font-black text-2xl md:text-3xl uppercase italic tracking-tighter">ÁHH ✖</span>
      </motion.div>

      {/* AUTÓ KÉPE (Flex-grow kitölti a helyet) */}
      <div className="flex-1 relative bg-slate-200 dark:bg-slate-800 w-full">
        <Image 
          src={data.imageUrl || '/placeholder-car.jpg'} 
          alt={data.carName} 
          fill 
          className="object-cover pointer-events-none" 
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
      </div>

      {/* ALSÓ INFORMÁCIÓS SÁV (Fix magasság helyett paddinggal igazítva) */}
      <div className="px-5 py-4 md:p-8 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0 min-h-[90px] md:min-h-[120px]">
        <div className="space-y-1 min-w-0 pr-4">
          <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none truncate">
            {data.carName}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 shrink-0">
              <Zap size={10} className="fill-current" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{data.voteCount} voks</span>
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest italic truncate">
              DynamicSense Verified
            </span>
          </div>
        </div>

        {/* Ikon háttérrel - Mobilon kisebb padding */}
        <div className="bg-slate-100 dark:bg-accent/50 p-3 md:p-4 rounded-2xl border border-slate-200 dark:border-white/5 text-slate-400 dark:text-muted-foreground shrink-0">
          <Heart size={20} className="md:w-6 md:h-6" />
        </div>
      </div>
    </motion.div>
  )
}