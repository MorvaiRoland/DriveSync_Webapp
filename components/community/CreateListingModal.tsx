'use client'

import { useState } from 'react'
import { Plus, X, Image as ImageIcon, Tag } from 'lucide-react'
import { createListingAction } from '@/app/community/actions'

export default function CreateListingModal({ groupId }: { groupId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    formData.append('groupId', groupId)
    await createListingAction(formData)
    setLoading(false)
    setIsOpen(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all"
      >
        <Plus className="w-4 h-4" /> Hirdetés feladása
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setIsOpen(false)} className="absolute right-4 top-4 text-slate-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Tag className="text-emerald-500" /> Új hirdetés
            </h2>

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Termék neve</label>
                <input name="title" required placeholder="Pl. iPhone 13 Pro" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ár (Ft)</label>
                    <input name="price" type="number" required placeholder="0" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Kép URL (Opcionális)</label>
                <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input name="imageUrl" placeholder="https://..." className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-3 py-3 text-white focus:border-emerald-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Leírás</label>
                <textarea name="description" rows={3} placeholder="Állapot, átvételi hely, stb..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none resize-none" />
              </div>

              <button disabled={loading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                {loading ? 'Feltöltés...' : 'Hirdetés közzététele'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}