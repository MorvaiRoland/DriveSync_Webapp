// components/SettingsForms.tsx
'use client'

import { updatePreferences } from '@/app/settings/actions'
import { useState } from 'react'

export function PreferencesForm({ settings }: { settings: any }) {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        await updatePreferences(formData)
        setLoading(false)
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    ⚙️ Beállítások
                </h2>
            </div>
            <form action={handleSubmit} className="p-6 space-y-6">
                
                {/* Értesítések */}
                <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Értesítések</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label htmlFor="notify_email" className="text-sm text-slate-600 dark:text-slate-300">Email értesítések</label>
                            <input 
                                type="checkbox" 
                                name="notify_email" 
                                id="notify_email" 
                                defaultChecked={settings.notify_email}
                                className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="notify_push" className="text-sm text-slate-600 dark:text-slate-300">Push értesítések</label>
                            <input 
                                type="checkbox" 
                                name="notify_push" 
                                id="notify_push" 
                                defaultChecked={settings.notify_push}
                                className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Téma (Rejtett vagy Bővíthető) */}
                <input type="hidden" name="theme" value={settings.theme || 'light'} />

                <div className="pt-2 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all active:scale-95 disabled:opacity-50"
                    >
                         {loading ? 'Mentés...' : 'Változtatások mentése'}
                    </button>
                </div>
            </form>
        </div>
    )
}