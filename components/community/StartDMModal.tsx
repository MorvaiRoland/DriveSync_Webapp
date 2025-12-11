'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { MessageSquarePlus, X, Search, Loader2, AlertCircle } from 'lucide-react'
import { startDMAction } from '@/app/community/actions'

export default function StartDMModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleStartDM = async (formData: FormData) => {
    setIsLoading(true)
    setError('')

    const result = await startDMAction(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result?.success) {
      setIsOpen(false)
      setIsLoading(false)
      // Átirányítás a privát chatre (dm paraméterrel)
      router.push(`/community?dm=${result.partnerId}`)
    }
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Sötét háttér */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Doboz */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Fejléc */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
            <h3 className="font-bold text-white flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-purple-500" /> Új Üzenet
            </h3>
            <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
        
        {/* Űrlap */}
        <form action={handleStartDM} className="p-6 space-y-6 bg-slate-900">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Címzett Email Címe</label>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-500 transition-colors" />
                    <input 
                        type="email" 
                        name="email"
                        required
                        placeholder="pelda@email.com" 
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-600"
                    />
                </div>
                <p className="text-xs text-slate-500">Keress rá egy felhasználóra, akivel beszélni szeretnél.</p>
            </div>
            
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/20 active:scale-95"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Beszélgetés Indítása'}
            </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* A Gomb, ami megjelenik a felületen */}
      <button 
        onClick={() => setIsOpen(true)}
        className="text-purple-500 hover:text-purple-400 hover:bg-purple-500/10 p-1.5 rounded-lg transition-colors"
        title="Új privát üzenet"
      >
        <MessageSquarePlus className="w-5 h-5" />
      </button>

      {/* A Modal tartalom */}
      {isOpen && mounted && createPortal(modalContent, document.body)}
    </>
  )
}