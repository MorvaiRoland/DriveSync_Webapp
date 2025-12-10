'use client'

import { useState } from 'react'
import { deleteAccountAction } from '@/app/settings/actions'
import { AlertTriangle } from 'lucide-react'

export default function DeleteAccountSection() {
    const [confirm, setConfirm] = useState(false)

    return (
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 p-6">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Fiók törlése</h3>
                    <p className="text-sm text-red-600/80 dark:text-red-300/70 mt-1">
                        Ez a művelet végleges. Minden adatod (autók, szervizek, költségek) azonnal törlődik.
                    </p>
                </div>
            </div>

            {!confirm ? (
                <button 
                    onClick={() => setConfirm(true)}
                    className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors"
                >
                    Fiók törlésének indítása
                </button>
            ) : (
                <div className="mt-6 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm font-bold text-red-800 dark:text-red-200 mb-3">
                        Biztosan törölni szeretnéd a fiókod?
                    </p>
                    <div className="flex gap-3">
                        <form action={deleteAccountAction}>
                            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors">
                                Igen, törlöm végleg
                            </button>
                        </form>
                        <button 
                            onClick={() => setConfirm(false)}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Mégse
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}