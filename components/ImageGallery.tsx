'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { 
  X, ChevronLeft, ChevronRight, CarFront, 
  ShieldCheck, Maximize2, ImageIcon 
} from 'lucide-react'

interface ImageGalleryProps {
  mainImage: string | null
  images?: string[] | null // Ez a tömb a többi képnek
  alt: string
}

export default function ImageGallery({ mainImage, images, alt }: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // 1. Képek összefűzése és tisztítása (null értékek és duplikációk szűrése)
  const allImages = [
    ...(mainImage ? [mainImage] : []),
    ...(images || [])
  ].filter((img, index, self) => img && self.indexOf(img) === index) as string[]

  // Lapozó függvények
  const nextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }, [allImages.length])

  const prevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }, [allImages.length])

  // Billentyűzet kezelés (Lightbox módban)
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, nextImage, prevImage])

  // --- HA NINCS KÉP ---
  if (allImages.length === 0) {
    return (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 flex-col gap-3 bg-slate-100 dark:bg-slate-900">
            <CarFront className="w-16 h-16 opacity-20" />
            <span className="font-bold text-sm opacity-50">Nincs feltöltött kép</span>
        </div>
    )
  }

  return (
    <>
      {/* --- INLINE GALÉRIA (A kártyán megjelenő rész) --- */}
      <div className="relative w-full h-full group bg-slate-900">
        
        {/* Jelenlegi kép */}
        <div 
            className="relative w-full h-full cursor-pointer"
            onClick={() => setIsOpen(true)}
        >
            <Image 
                src={allImages[currentIndex]} 
                alt={`${alt} - ${currentIndex + 1}. kép`} 
                fill 
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority={currentIndex === 0}
            />
            
            {/* Nagyító ikon overlay */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 pointer-events-none">
                <Maximize2 className="text-white w-10 h-10 drop-shadow-lg" />
            </div>
        </div>

        {/* Badge (Bal felül) */}
        <div className="absolute top-4 left-4 pointer-events-none z-10">
            <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-white/10 shadow-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Ellenőrzött
            </div>
        </div>

        {/* Képszámláló (Jobb felül) */}
        {allImages.length > 1 && (
            <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                <ImageIcon className="w-3 h-3" />
                {currentIndex + 1} / {allImages.length}
            </div>
        )}

        {/* Navigációs Nyilak (Csak ha több kép van) */}
        {allImages.length > 1 && (
            <>
                <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20">
                    <ChevronRight className="w-6 h-6" />
                </button>
            </>
        )}

        {/* Bélyegkép sáv (Alul, hoverre jön fel) */}
        {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-[90%] overflow-x-auto z-20">
                {allImages.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                        className={`relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${idx === currentIndex ? 'border-amber-500 scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                        <Image src={img} alt="thumb" fill className="object-cover" />
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* --- LIGHTBOX MODAL (Teljes képernyő) --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-200">
            
            {/* Bezárás gomb */}
            <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-[110] text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Balra nyíl */}
            {allImages.length > 1 && (
                <button onClick={prevImage} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 transition-colors z-[110]">
                    <ChevronLeft className="w-8 h-8 md:w-12 md:h-12" />
                </button>
            )}

            {/* Nagy Kép */}
            <div className="relative w-full h-full max-w-7xl max-h-[85vh] mx-4">
                <Image 
                    src={allImages[currentIndex]} 
                    alt={alt} 
                    fill 
                    className="object-contain"
                    priority
                />
            </div>

            {/* Jobbra nyíl */}
            {allImages.length > 1 && (
                <button onClick={nextImage} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 transition-colors z-[110]">
                    <ChevronRight className="w-8 h-8 md:w-12 md:h-12" />
                </button>
            )}

            {/* Számláló alul */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-sm font-mono">
                {currentIndex + 1} / {allImages.length}
            </div>
        </div>
      )}
    </>
  )
}