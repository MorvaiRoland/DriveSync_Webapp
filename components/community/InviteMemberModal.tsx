'use client'

import { useState } from 'react'
import { createClient } from '@/supabase/client'
import { UserPlus, Search, X, Loader2, Check } from 'lucide-react'

export default function InviteMemberModal({ groupId }: { groupId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      // 1. Megkeressük a usert email alapján (RPC hívás vagy direct query ha van jogod)
      // Egyszerűsítés: Feltételezzük, hogy a user létezik és tudjuk az ID-t,
      // Élesben itt egy server action kellene a user ID kikeresésére admin joggal.
      // MOST: Csak demonstráció, hogy a UI működjön.
      
      setMessage('A meghívó elküldve! (Demo)')
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

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
      >
        <UserPlus className="w-4 h-4" /> <span className="hidden sm:inline">Tag meghívása</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-500" /> Új tag hozzáadása
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleInvite} className="p-6 space-y-4">
                <p className="text-sm text-slate-400">Írd be a felhasználó email címét, akit szeretnél hozzáadni a csoporthoz.</p>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="pelda@email.com" 
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-blue-500 outline-none"
                    />
                </div>
                
                {message && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
                        <Check className="w-4 h-4" /> {message}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Hozzáadás'}
                </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}