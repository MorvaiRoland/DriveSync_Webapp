'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, CarFront, ShieldCheck } from 'lucide-react'

interface ImageGalleryProps {
  mainImage: string | null
  additionalImages?: string[] // Ha később lesz több kép
  alt: string
}

export default function ImageGallery({ mainImage, additionalImages = [], alt }: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Összes kép egy tömbben (egyelőre csak a mainImage van a DB-ben, de felkészítjük többre)
  const images = [mainImage, ...additionalImages].filter(Boolean) as string[]

  if (images.length === 0) {
    return (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 flex-col gap-3 bg-slate-100 dark:bg-slate-900">
            <CarFront className="w-16 h-16 opacity-20" />
            <span className="font-bold text-sm opacity-50">Nincs feltöltött kép</span>
        </div>
    )
  }

  return (
    <>
      {/* FŐ KÉP (Kattintható) */}
      <div 
        className="relative w-full h-full cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        <Image 
            src={images[0]} 
            alt={alt} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
        />
        
        {/* Nagyító ikon hoverre */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-white/90 text-slate-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                Kép megnyitása
            </span>
        </div>

        {/* Badge */}
        <div className="absolute top-4 left-4 pointer-events-none">
            <div className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-white/10 shadow-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Ellenőrzött hirdetés
            </div>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
            
            {/* Bezárás gomb */}
            <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-50"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Kép */}
            <div className="relative w-full h-full max-w-7xl max-h-[85vh]">
                <Image 
                    src={images[0]} 
                    alt={alt} 
                    fill 
                    className="object-contain"
                    priority
                />
            </div>

            {/* (Opcionális) Lapozó gombok, ha több kép lenne */}
            {/* <button className="..."> <ChevronLeft /> </button> */}
            {/* <button className="..."> <ChevronRight /> </button> */}
        </div>
      )}
    </>
  )
}