// components/SettingsForms.tsx
'use client'

import { updatePreferences } from '@/app/settings/actions'
import { useFormStatus } from 'react-dom'

type Settings = {
  notify_email: boolean
  notify_push: boolean
  theme: string
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 px-6 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
    >
      {pending ? (
        <>
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Mentés...
        </>
      ) : (
        'Mentés'
      )}
    </button>
  )
}

export function PreferencesForm({ settings }: { settings: Settings }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700">
        <h3 className="font-bold text-slate-900 dark:text-white">Alkalmazás beállítások</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Szabd testre a megjelenést és az értesítéseket.</p>
      </div>

      <form action={updatePreferences} className="p-6 space-y-8">
        
        {/* --- TÉMA VÁLASZTÓ (EZ A RÉSZ HIÁNYZOTT) --- */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block">
            Megjelenés témája
          </label>
          <div className="grid grid-cols-2 gap-4">
            {/* Világos mód */}
            <label className="relative cursor-pointer">
              <input 
                type="radio" 
                name="theme" 
                value="light" 
                defaultChecked={settings.theme === 'light'} 
                className="peer sr-only" 
              />
              <div className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-blue-500 peer-checked:border-blue-600 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 transition-all text-center">
                <div className="mb-2 text-2xl">☀️</div>
                <span className="block font-medium text-slate-700 dark:text-slate-300 peer-checked:text-blue-700 dark:peer-checked:text-blue-400">Világos</span>
              </div>
            </label>

            {/* Sötét mód */}
            <label className="relative cursor-pointer">
              <input 
                type="radio" 
                name="theme" 
                value="dark" 
                defaultChecked={settings.theme === 'dark'} 
                className="peer sr-only" 
              />
              <div className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-blue-500 peer-checked:border-blue-600 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 transition-all text-center">
                <div className="mb-2 text-2xl">🌙</div>
                <span className="block font-medium text-slate-700 dark:text-slate-300 peer-checked:text-blue-700 dark:peer-checked:text-blue-400">Sötét</span>
              </div>
            </label>
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-700" />

        {/* --- ÉRTESÍTÉSEK --- */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block">
            Értesítések kezelése
          </label>
          
          <div className="flex items-center justify-between">
            <label htmlFor="notify_email" className="text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              Email értesítések
            </label>
            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
              <input 
                type="checkbox" 
                name="notify_email" 
                id="notify_email" 
                defaultChecked={settings.notify_email}
                className="peer absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-6 checked:border-blue-600"
              />
              <label htmlFor="notify_email" className="block overflow-hidden h-6 rounded-full bg-slate-300 dark:bg-slate-600 cursor-pointer peer-checked:bg-blue-600 transition-colors"></label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="notify_push" className="text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              Push értesítések
            </label>
            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
              <input 
                type="checkbox" 
                name="notify_push" 
                id="notify_push" 
                defaultChecked={settings.notify_push}
                className="peer absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-6 checked:border-blue-600"
              />
              <label htmlFor="notify_push" className="block overflow-hidden h-6 rounded-full bg-slate-300 dark:bg-slate-600 cursor-pointer peer-checked:bg-blue-600 transition-colors"></label>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}