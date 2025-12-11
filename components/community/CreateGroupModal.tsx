'use client'

import { useState } from 'react'
import { X, Users, Lock, Globe, Loader2, PlusCircle } from 'lucide-react'
import { createGroupAction } from '@/app/community/actions' // Importáljuk az actiont
import { useRouter } from 'next/navigation'

export default function CreateGroupModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [groupType, setGroupType] = useState('public') // 'public' | 'private'
  const router = useRouter()

  const handleOpen = () => setIsOpen(true)
  const handleClose = () => setIsOpen(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    // Hozzáadjuk a típust manuálisan a formhoz, mert state-ből jön
    formData.append('type', groupType)

    const result = await createGroupAction(formData)

    if (result?.error) {
      alert(result.error)
      setIsLoading(false)
    } else if (result?.success) {
      // Sikeres létrehozás
      setIsOpen(false)
      setIsLoading(false)
      // Átirányítás az új csoportba
      router.push(`/community?group=${result.groupId}`)
    }
  }

  return (
    <>
      {/* 1. A GOMB, ami megnyitja a modalt (ezt rakjuk ki az oldalra) */}
      <button 
        onClick={handleOpen}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
      >
        <PlusCircle className="w-4 h-4" /> Új Csoport Létrehozása
      </button>

      {/* 2. MAGA A MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Sötét háttér */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleClose}
          />

          {/* Modal Doboz */}
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Fejléc */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" /> Csoport Létrehozása
              </h3>
              <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Űrlap */}
            <form action={handleSubmit} className="p-6 space-y-6">
              
              {/* Név */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Csoport Neve</label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  placeholder="pl. BMW E46 Fanok vagy Családi Flotta" 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              {/* Leírás */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leírás</label>
                <textarea 
                  name="description" 
                  rows={3}
                  placeholder="Miről szól ez a csoport?" 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                />
              </div>

              {/* Típus Választó (Radio Cards) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Csoport Típusa</label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Nyilvános Opció */}
                  <div 
                    onClick={() => setGroupType('public')}
                    className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center text-center gap-2 transition-all ${groupType === 'public' ? 'bg-blue-600/10 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                  >
                    <Globe className={`w-6 h-6 ${groupType === 'public' ? 'text-blue-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="font-bold text-sm">Nyilvános</div>
                      <div className="text-[10px] opacity-70">Bárki csatlakozhat és láthatja.</div>
                    </div>
                  </div>

                  {/* Privát Opció */}
                  <div 
                    onClick={() => setGroupType('private')}
                    className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center text-center gap-2 transition-all ${groupType === 'private' ? 'bg-purple-600/10 border-purple-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                  >
                    <Lock className={`w-6 h-6 ${groupType === 'private' ? 'text-purple-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="font-bold text-sm">Privát</div>
                      <div className="text-[10px] opacity-70">Csak meghívóval érhető el.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gombok */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Csoport Létrehozása 🚀'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  )
}