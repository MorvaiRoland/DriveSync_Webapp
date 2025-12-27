'use client'

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import Image from 'next/image'
import { Heart, X, Zap } from 'lucide-react'

export default function SwipeCard({ data, onSwipe, isFront }: any) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-10, 10])
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0, 1, 1, 1, 0])
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])

  if (!isFront) {
    return (
      <div className="absolute inset-0 bg-accent rounded-[3rem] border border-border scale-[0.9] opacity-40 translate-y-8 blur-sm pointer-events-none z-0" />
    )
  }

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, info) => { if (Math.abs(info.offset.x) > 100) onSwipe(data.entryId, info.offset.x > 0 ? 'right' : 'left') }}
      className="absolute inset-0 glass rounded-[3rem] border-neon-glow shadow-2xl cursor-grab active:cursor-grabbing z-20 touch-none overflow-hidden"
    >
      {/* OVERLAYS */}
      <motion.div style={{ opacity: likeOpacity }} className="absolute top-10 left-10 z-30 bg-emerald-500 text-white px-6 py-2 rounded-xl -rotate-12 border-2 border-white shadow-2xl">
        <span className="text-xl font-black uppercase italic tracking-tighter">Adom! 🔥</span>
      </motion.div>
      <motion.div style={{ opacity: nopeOpacity }} className="absolute top-10 right-10 z-30 bg-red-600 text-white px-6 py-2 rounded-xl rotate-12 border-2 border-white shadow-2xl">
        <span className="text-xl font-black uppercase italic tracking-tighter">Áhh.. ✖</span>
      </motion.div>

      {/* TARTALOM */}
      <div className="h-4/5 relative bg-slate-900 group">
        <Image src={data.imageUrl || '/placeholder.jpg'} alt={data.carName} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
      </div>

      <div className="h-1/5 p-8 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-foreground leading-none">{data.carName}</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-2 flex items-center gap-2">
            <Zap size={10} className="fill-current" /> {data.voteCount} szavazat
          </p>
        </div>
        <div className="bg-accent/50 p-4 rounded-2xl text-muted-foreground"><Heart size={24} /></div>
      </div>
    </motion.div>
  )
}