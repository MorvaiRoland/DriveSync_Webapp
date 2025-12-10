// components/ProfileForm.tsx
'use client'

import { updateProfile } from '@/app/settings/actions'
import { useState } from 'react'

export default function ProfileForm({ userEmail, meta }: { userEmail: string, meta: any }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    await updateProfile(formData) // Server Action hívása
    setLoading(false)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                👤 Személyes Adatok
            </h2>
        </div>
        <form action={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-center gap-6 mb-4">
                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-2xl font-bold text-slate-500 dark:text-slate-300 border-4 border-white dark:border-slate-600 shadow-sm">
                    {meta.full_name ? meta.full_name[0].toUpperCase() : userEmail?.[0].toUpperCase()}
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{userEmail}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Bejelentkezve</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Teljes Név</label>
                    <input 
                        name="fullName" 
                        defaultValue={meta.full_name || ''} 
                        placeholder="Pl. Kiss János"
                        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 px-4 bg-slate-50 dark:bg-slate-700 border text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Telefonszám</label>
                    <input 
                        name="phone" 
                        defaultValue={meta.phone || ''} 
                        placeholder="+36 30 123 4567"
                        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 px-4 bg-slate-50 dark:bg-slate-700 border text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors"
                    />
                </div>
            </div>
            <div className="pt-4 flex justify-end">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Mentés...' : 'Mentés'}
                </button>
            </div>
        </form>
    </div>
  )
}