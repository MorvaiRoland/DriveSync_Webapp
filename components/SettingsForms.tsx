'use client'

import { updatePreferences } from '@/app/settings/actions'
import { useFormStatus } from 'react-dom'
import { useTheme } from 'next-themes' // <--- EZT KELL IMPORTÁLNI
import { useEffect, useState } from 'react'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <div className="pt-4 flex justify-end">
      <button 
        type="submit" 
        disabled={pending}
        className="bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? 'Mentés...' : 'Beállítások mentése'}
      </button>
    </div>
  )
}

type SettingsProps = {
  settings: {
    notify_email: boolean
    notify_push: boolean
    theme: string
  }
}

export function PreferencesForm({ settings }: SettingsProps) {
  // 1. Behúzzuk a setTheme függvényt a contextből
  const { setTheme, theme: currentTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Hydration hiba elkerülése miatt (csak kliensen fusson)
  useEffect(() => {
    setMounted(true)
  }, [])

  // 2. Kezelőfüggvény a rádió gomb váltáshoz
  const handleThemeChange = (value: string) => {
    setTheme(value) // Ez azonnal frissíti a UI-t (CSS classokat)
  }

  if (!mounted) {
    return null // Vagy egy loading skeleton
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
        <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
           ⚙️ Preferenciák
        </h2>
      </div>
      
      <form action={updatePreferences} className="p-6 space-y-8">
        
        {/* Értesítések */}
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Értesítések</h3>
            
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                <span className="text-slate-700 dark:text-slate-200 font-medium">Email értesítések</span>
                <input 
                    type="checkbox" 
                    name="notify_email" 
                    defaultChecked={settings.notify_email}
                    className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                <span className="text-slate-700 dark:text-slate-200 font-medium">Push értesítések</span>
                <input 
                    type="checkbox" 
                    name="notify_push" 
                    defaultChecked={settings.notify_push}
                    className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
            </label>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700"></div>

        {/* Megjelenés / Téma */}
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Megjelenés</h3>
            
            <div className="grid grid-cols-3 gap-3">
                {['light', 'dark', 'system'].map((themeOption) => (
                    <label key={themeOption} className="cursor-pointer group">
                        <input 
                            type="radio" 
                            name="theme" 
                            value={themeOption} 
                            // 3. Itt kötjük össze a Supabase értéket a next-themes értékkel
                            defaultChecked={settings.theme === themeOption}
                            // 4. onChange eseményre hívjuk a setTheme-et
                            onChange={() => handleThemeChange(themeOption)}
                            className="peer sr-only" 
                        />
                        <div className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 peer-checked:border-slate-900 dark:peer-checked:border-amber-500 peer-checked:bg-slate-50 dark:peer-checked:bg-slate-700/50 flex flex-col items-center gap-2 transition-all hover:border-slate-300">
                            <span className="text-2xl">
                                {themeOption === 'light' && '☀️'}
                                {themeOption === 'dark' && '🌙'}
                                {themeOption === 'system' && '💻'}
                            </span>
                            <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">
                                {themeOption === 'light' ? 'Világos' : themeOption === 'dark' ? 'Sötét' : 'Rendszer'}
                            </span>
                        </div>
                    </label>
                ))}
            </div>
        </div>

        <SubmitButton />
      </form>
    </div>
  )
}