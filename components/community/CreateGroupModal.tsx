'use client'

import { useState } from 'react'
import { X, Users, Lock, Globe, Loader2, PlusCircle, Hash, AlignLeft } from 'lucide-react'
import { createGroupAction } from '@/app/community/actions' 
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
    formData.append('type', groupType)

    const result = await createGroupAction(formData)

    if (result?.error) {
      alert(result.error)
      setIsLoading(false)
    } else if (result?.success) {
      setIsOpen(false)
      setIsLoading(false)
      router.push(`/community?group=${result.groupId}`)
    }
  }

  return (
    <>
      {/* 1. INDÍTÓ GOMB */}
      <button 
        onClick={handleOpen}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95 group"
      >
        <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> 
        <span>Új Csoport Létrehozása</span>
      </button>

      {/* 2. MODAL OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Háttér homályosítva */}
          <div 
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300"
            onClick={handleClose}
          />

          {/* Modal Doboz */}
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]">
            
            {/* Fejléc */}
            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                  <span className="bg-blue-500/10 p-1.5 rounded-lg text-blue-500 border border-blue-500/20">
                    <Users className="w-5 h-5" />
                  </span>
                  Csoport Létrehozása
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Hozz létre egy új közösséget az autósoknak.</p>
              </div>
              <button 
                onClick={handleClose} 
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Űrlap - Scrollable body mobilon */}
            <div className="overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
              <form id="create-group-form" action={handleSubmit} className="space-y-6">
                
                {/* Név Mező */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Csoport Neve</label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                      <Hash className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      name="name" 
                      required
                      placeholder="pl. BMW E46 Fanok" 
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Leírás Mező */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Leírás</label>
                  <div className="relative group">
                    <div className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                      <AlignLeft className="w-5 h-5" />
                    </div>
                    <textarea 
                      name="description" 
                      rows={3}
                      placeholder="Miről szól ez a csoport? Írj pár szót..." 
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none text-sm leading-relaxed"
                    />
                  </div>
                </div>

                {/* Típus Választó */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Láthatóság</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Nyilvános Kártya */}
                    <div 
                      onClick={() => setGroupType('public')}
                      className={`cursor-pointer relative overflow-hidden border rounded-2xl p-4 flex sm:flex-col items-center sm:text-center gap-4 transition-all duration-300 ${
                        groupType === 'public' 
                        ? 'bg-blue-600/10 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-900'
                      }`}
                    >
                      <div className={`p-3 rounded-full ${groupType === 'public' ? 'bg-blue-500 text-white' : 'bg-slate-800'}`}>
                        <Globe className="w-6 h-6" />
                      </div>
                      <div className="flex-1 sm:flex-auto text-left sm:text-center">
                        <div className="font-bold text-sm">Nyilvános</div>
                        <div className="text-[11px] opacity-70 leading-tight mt-0.5">Bárki láthatja és csatlakozhat.</div>
                      </div>
                      {/* Checkmark indicator for mobile/desktop active state */}
                      {groupType === 'public' && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 sm:hidden"></div>
                      )}
                    </div>

                    {/* Privát Kártya */}
                    <div 
                      onClick={() => setGroupType('private')}
                      className={`cursor-pointer relative overflow-hidden border rounded-2xl p-4 flex sm:flex-col items-center sm:text-center gap-4 transition-all duration-300 ${
                        groupType === 'private' 
                        ? 'bg-purple-600/10 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.15)]' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-900'
                      }`}
                    >
                      <div className={`p-3 rounded-full ${groupType === 'private' ? 'bg-purple-500 text-white' : 'bg-slate-800'}`}>
                        <Lock className="w-6 h-6" />
                      </div>
                      <div className="flex-1 sm:flex-auto text-left sm:text-center">
                        <div className="font-bold text-sm">Privát</div>
                        <div className="text-[11px] opacity-70 leading-tight mt-0.5">Csak meghívóval érhető el.</div>
                      </div>
                      {groupType === 'private' && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 sm:hidden"></div>
                      )}
                    </div>
                  </div>
                </div>

              </form>
            </div>

            {/* Lábléc - Fix gomb */}
            <div className="p-6 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-10">
              <button 
                type="submit"
                form="create-group-form" // Kapcsolódik a form ID-hoz
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Létrehozás'}
              </button>
              <button 
                onClick={handleClose}
                className="w-full mt-3 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors py-2"
              >
                Mégse
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}