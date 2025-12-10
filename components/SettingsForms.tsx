'use client'

import { updatePreferences } from '@/app/settings/actions'
import { useFormStatus } from 'react-dom'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 px-6 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 ml-auto flex items-center gap-2">
      {pending ? 'Mentés...' : 'Mentés'}
    </button>
  )
}

export function PreferencesForm({ settings }: { settings: any }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return (
      <form action={updatePreferences} className="space-y-8">
        
        {/* TÉMA */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block">Téma</label>
          <div className="grid grid-cols-2 gap-4">
            {['light', 'dark'].map((t) => (
               <label key={t} className="relative cursor-pointer group">
               <input 
                 type="radio" name="theme" value={t} 
                 checked={theme === t} onChange={() => setTheme(t)}
                 className="peer sr-only" 
               />
               <div className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-amber-500 peer-checked:border-amber-500 peer-checked:bg-amber-50 dark:peer-checked:bg-amber-900/10 transition-all text-center">
                 <div className="mb-2 text-2xl">{t === 'light' ? '☀️' : '🌙'}</div>
                 <span className="block font-medium text-slate-700 dark:text-slate-300 capitalize">
                    {t === 'light' ? 'Világos' : 'Sötét'}
                 </span>
               </div>
             </label>
            ))}
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-700" />

        {/* ÉRTESÍTÉSEK */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block">Értesítések</label>
          
          {['notify_email', 'notify_push'].map((key) => (
             <div key={key} className="flex items-center justify-between">
                <label htmlFor={key} className="text-slate-600 dark:text-slate-300 cursor-pointer">
                    {key === 'notify_email' ? 'Email értesítések' : 'Push értesítések'}
                </label>
                <div className="relative inline-block w-12 align-middle select-none">
                <input 
                    type="checkbox" name={key} id={key} 
                    defaultChecked={settings?.[key]}
                    className="peer absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-6 checked:border-amber-500"
                />
                <label htmlFor={key} className="block overflow-hidden h-6 rounded-full bg-slate-300 dark:bg-slate-600 peer-checked:bg-amber-500 transition-colors cursor-pointer"></label>
                </div>
            </div>
          ))}
        </div>

        <div className="pt-4 flex justify-end">
          <SubmitButton />
        </div>
      </form>
  )
}