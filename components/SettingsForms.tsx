'use client'

import { useTheme } from "next-themes" // Ez kell a globális váltáshoz
import { useEffect, useState } from "react"
import { updatePreferences } from "@/app/settings/actions"

export function PreferencesForm({ settings }: { settings: any }) {
  const { setTheme, theme } = useTheme() // Hook a témához
  const [mounted, setMounted] = useState(false)

  // Megvárjuk, amíg a kliens betölt
  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePushChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert('Az értesítések engedélyezése elutasítva.')
        e.target.checked = false
      }
    }
  }

  // Loading state a villódzás elkerülésére
  if (!mounted) {
    return <div className="p-6 animate-pulse bg-slate-100 dark:bg-slate-800 h-64 rounded-2xl"></div>
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
        <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
           <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
           Értesítések & Megjelenés
        </h2>
      </div>
      
      <form action={updatePreferences} className="p-6 space-y-6">
        
        {/* Értesítés Kapcsolók */}
        <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg border border-transparent hover:border-slate-100 dark:hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">📧</div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Email Értesítések</span>
                </div>
                <input type="checkbox" name="notify_email" defaultChecked={settings.notify_email} className="w-5 h-5 accent-amber-500" />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg border border-transparent hover:border-slate-100 dark:hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">🔔</div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Push Értesítések</span>
                </div>
                <input type="checkbox" name="notify_push" defaultChecked={settings.notify_push} onChange={handlePushChange} className="w-5 h-5 accent-amber-500" />
            </label>
        </div>

        {/* TÉMA VÁLASZTÓ */}
        <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Téma</label>
            <select 
                name="theme" 
                value={theme} // A jelenlegi aktív téma
                onChange={(e) => setTheme(e.target.value)} // Ez váltja át az EGÉSZ appot
                className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 px-4 bg-slate-50 dark:bg-slate-700 border text-slate-900 dark:text-white"
            >
                <option value="light">Világos</option>
                <option value="dark">Sötét</option>
                <option value="system">Rendszer beállítás</option>
            </select>
        </div>

        <div className="pt-2 flex justify-end">
            <button type="submit" className="bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-md active:scale-95">
                Beállítások Mentése
            </button>
        </div>
      </form>
    </div>
  )
}