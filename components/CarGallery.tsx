'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Grid } from 'lucide-react'

export default function CarGallery({ images, carModel }: { images: string[], carModel: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)

    if (!images || images.length === 0) return null

    const openLightbox = (index: number) => {
        setCurrentIndex(index)
        setIsOpen(true)
    }

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation()
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation()
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    return (
        <>
            {/* --- GRID NÉZET (Desktopon 1 nagy + 4 kicsi, Mobilon 1 nagy) --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[40vh] md:h-[60vh] rounded-2xl overflow-hidden shadow-2xl shadow-slate-200 mb-8 relative">
                
                {/* Fő kép (Bal oldal / Teteje) */}
                <div 
                    className="md:col-span-2 md:row-span-2 relative cursor-pointer group bg-slate-100"
                    onClick={() => openLightbox(0)}
                >
                    <Image 
                        src={images[0]} 
                        alt={`${carModel} main`} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                        priority
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>

                {/* Kisebb képek (Jobb oldal - csak ha van elég kép) */}
                {images.slice(1, 5).map((img, idx) => (
                    <div 
                        key={idx} 
                        className="hidden md:block relative cursor-pointer group bg-slate-100"
                        onClick={() => openLightbox(idx + 1)}
                    >
                        <Image 
                            src={img} 
                            alt={`${carModel} ${idx + 1}`} 
                            fill 
                            className="object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                ))}

                {/* "Összes kép" gomb */}
                <button 
                    onClick={() => openLightbox(0)}
                    className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-slate-900 px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 hover:bg-white transition-colors"
                >
                    <Grid className="w-4 h-4" />
                    Összes ({images.length}) fotó
                </button>
            </div>

            {/* --- LIGHTBOX (Teljes képernyő) --- */}
            {isOpen && (
                <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    
                    {/* Bezárás */}
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 p-2 rounded-full transition-colors z-50"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    {/* Navigáció */}
                    <button onClick={prevImage} className="absolute left-4 md:left-8 text-white p-4 hover:bg-white/10 rounded-full transition-colors z-50">
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <div className="relative w-full h-full max-w-7xl max-h-[85vh] flex items-center justify-center">
                        <Image 
                            src={images[currentIndex]} 
                            alt="Full screen view" 
                            fill 
                            className="object-contain" 
                            quality={100}
                        />
                    </div>

                    <button onClick={nextImage} className="absolute right-4 md:right-8 text-white p-4 hover:bg-white/10 rounded-full transition-colors z-50">
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    {/* Számláló */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 font-mono text-sm bg-black/50 px-4 py-1 rounded-full">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>
            )}
        </>
    )
}