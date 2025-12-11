'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom' // <--- EZ A KULCS
import { createClient } from '@/supabase/client'
import { UserPlus, Search, X, Loader2, Check } from 'lucide-react'

export default function InviteMemberModal({ groupId }: { groupId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false) // Ellenőrzéshez, hogy betöltött-e az oldal
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  // Csak akkor engedjük a Portalt, ha már a böngészőben vagyunk (hidratáció)
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      // Itt lenne az igazi logika (Server Action hívás)
      // Most csak szimuláljuk
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessage('A meghívó elküldve!')
      setTimeout(() => {
          setIsOpen(false)
          setMessage('')
          setEmail('')
      }, 1500)

    } catch (error) {
      setMessage('Hiba történt.')
    } finally {
      setIsLoading(false)
    }
  }

  // Maga a Modal tartalom
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Sötét háttér */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Doboz */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Fejléc */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 sticky top-0 z-10">
            <h3 className="font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-500" /> Új tag hozzáadása
            </h3>
            <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
        
        {/* Űrlap */}
        <form onSubmit={handleInvite} className="p-6 space-y-6 bg-slate-900">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Cím</label>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="pelda@email.com" 
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                    />
                </div>
                <p className="text-xs text-slate-500">A felhasználó értesítést kap a csatlakozáshoz.</p>
            </div>
            
            {message && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                    <Check className="w-4 h-4" /> {message}
                </div>
            )}

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/20 active:scale-95"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Meghívó Küldése'}
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
        className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20 active:scale-95 border border-blue-500"
      >
        <UserPlus className="w-4 h-4" /> <span className="hidden sm:inline">Tag meghívása</span>
      </button>

      {/* A Modal tartalom, ami a BODY végére teleportál */}
      {isOpen && mounted && createPortal(modalContent, document.body)}
    </>
  )
}