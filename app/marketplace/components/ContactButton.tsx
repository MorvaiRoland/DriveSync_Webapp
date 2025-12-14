'use client'

import { useState } from 'react'
import { Phone, Mail, Eye } from 'lucide-react'

export default function ContactButton({ email, phone }: { email?: string, phone?: string }) {
  const [revealed, setRevealed] = useState(false)

  if (revealed) {
    return (
      <div className="space-y-3 animate-in fade-in zoom-in duration-300">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase mb-1">Telefonszám</p>
            <a href={`tel:${phone || ''}`} className="text-lg font-black text-emerald-700 dark:text-emerald-300 block hover:underline">
                {phone || '+36 30 123 4567'}
            </a>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">Email cím</p>
            <a href={`mailto:${email || ''}`} className="text-sm font-bold text-blue-700 dark:text-blue-300 block hover:underline">
                {email || 'elado@email.com'}
            </a>
        </div>
      </div>
    )
  }

  return (
    <button 
        onClick={() => setRevealed(true)}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
    >
        <Phone size={20} /> 
        <span>Elérhetőségek megjelenítése</span>
    </button>
  )
}