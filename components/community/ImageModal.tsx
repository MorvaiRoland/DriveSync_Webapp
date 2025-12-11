'use client'
import { X } from 'lucide-react'

export default function ImageModal({ src, onClose }: { src: string, onClose: () => void }) {
  if (!src) return null
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
        <X className="w-6 h-6" />
      </button>
      <img src={src} alt="Nagyított kép" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" />
    </div>
  )
}