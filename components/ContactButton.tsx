'use client'

import { useState } from 'react'
import { Phone, Mail, Eye, Copy, Check } from 'lucide-react'
import { toast } from 'sonner' // Feltételezve, hogy a sonner-t használod értesítésre

interface ContactButtonProps {
  phone?: string | null
  email?: string | null
}

export default function ContactButton({ phone, email }: ContactButtonProps) {
  const [revealed, setRevealed] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)

  // Másolás funkció
  const handleCopy = (text: string, type: 'phone' | 'email') => {
    navigator.clipboard.writeText(text)
    if (type === 'phone') {
        setCopiedPhone(true)
        setTimeout(() => setCopiedPhone(false), 2000)
    } else {
        setCopiedEmail(true)
        setTimeout(() => setCopiedEmail(false), 2000)
    }
    toast.success(`${type === 'phone' ? 'Telefonszám' : 'Email cím'} másolva!`)
  }

  if (!phone && !email) {
    return (
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-center text-slate-500 text-sm">
            Nincs megadott elérhetőség.
        </div>
    )
  }

  if (revealed) {
    return (
      <div className="space-y-3 animate-in fade-in zoom-in duration-300">
        
        {/* TELEFON KÁRTYA */}
        {phone && (
            <div className="relative group p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-emerald-900/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-800">
                        <Phone className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider mb-0.5">Telefonszám</p>
                        <a href={`tel:${phone}`} className="text-lg font-black text-emerald-800 dark:text-emerald-200 hover:underline">
                            {phone}
                        </a>
                    </div>
                </div>
                <button 
                    onClick={() => handleCopy(phone, 'phone')}
                    className="p-2 hover:bg-white/50 dark:hover:bg-black/20 rounded-lg transition-colors text-emerald-600 dark:text-emerald-400"
                    title="Másolás"
                >
                    {copiedPhone ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
            </div>
        )}

        {/* EMAIL KÁRTYA */}
        {email && (
            <div className="relative group p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800/50 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wider mb-0.5">Email cím</p>
                        <a href={`mailto:${email}`} className="text-sm font-bold text-blue-800 dark:text-blue-200 hover:underline truncate block">
                            {email}
                        </a>
                    </div>
                </div>
                <button 
                    onClick={() => handleCopy(email, 'email')}
                    className="p-2 hover:bg-white/50 dark:hover:bg-black/20 rounded-lg transition-colors text-blue-600 dark:text-blue-400"
                    title="Másolás"
                >
                    {copiedEmail ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
            </div>
        )}
      </div>
    )
  }

  // ALAPÁLLAPOT (REJTETT)
  return (
    <button 
        onClick={() => setRevealed(true)}
        className="group relative w-full py-4 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-2xl transition-all shadow-xl shadow-slate-500/20 dark:shadow-none active:scale-[0.98] overflow-hidden"
    >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        <div className="flex items-center justify-center gap-3 relative z-10">
            <Eye className="w-5 h-5" /> 
            <span>Elérhetőségek Megjelenítése</span>
        </div>
    </button>
  )
}