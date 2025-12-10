// components/DeleteAccountSection.tsx
'use client'

import { useState } from 'react'
import { deleteAccountAction } from '@/app/settings/actions'

export default function DeleteAccountSection() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    // Server action hívása (form submission helyett közvetlenül is hívható kliensről eseménykezelőben)
    await deleteAccountAction() 
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 overflow-hidden transition-colors mt-8">
      <div className="p-6">
        <h3 className="font-bold text-red-600 dark:text-red-500 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Veszélyzóna
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          A fiókod törlése végleges. Minden adatod (autók, szerviznapló, tankolások) azonnal és visszaállíthatatlanul törlődik.
        </p>

        {!showConfirm ? (
          <button 
            onClick={() => setShowConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-200 dark:border-red-800/50"
          >
            Fiók Törlése
          </button>
        ) : (
          <div className="animate-in fade-in zoom-in duration-200">
            <p className="text-center text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
              Biztosan törlöd a fiókodat? Ez nem vonható vissza!
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Mégse
              </button>
              
              <form action={deleteAccountAction} className="flex-1">
                 <button 
                    type="submit"
                    onClick={() => setIsDeleting(true)}
                    disabled={isDeleting}
                    className="w-full py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                    {isDeleting ? 'Törlés...' : 'Igen, törlöm'}
                 </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}