'use client'

import { useState } from 'react'
import { User, Settings, ShieldAlert, Camera } from 'lucide-react'
import Image from 'next/image'
import { updateProfile } from '@/app/settings/actions'
import { PreferencesForm } from '@/components/SettingsForms'
import DeleteAccountSection from '@/components/DeleteAccountSection'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2">
      {pending ? 'Mentés...' : 'Változtatások mentése'}
    </button>
  )
}

export default function SettingsDashboard({ user, meta, settings }: any) {
  const [activeTab, setActiveTab] = useState('profile')
  const [previewUrl, setPreviewUrl] = useState(meta.avatar_url || null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPreviewUrl(URL.createObjectURL(file))
  }

  const tabs = [
    { id: 'profile', label: 'Profil szerkesztése', icon: User },
    { id: 'preferences', label: 'Megjelenés & Értesítés', icon: Settings },
    { id: 'account', label: 'Fiók biztonság', icon: ShieldAlert },
  ]

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 min-h-[600px] flex flex-col md:flex-row">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-72 bg-slate-50 dark:bg-slate-950/50 border-r border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-3">Beállítások</h2>
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-500 shadow-md ring-1 ring-slate-200 dark:ring-slate-700'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-8 overflow-y-auto">
        
        {/* 1. PROFIL */}
        {activeTab === 'profile' && (
          <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Profil adatok</h2>
            <p className="text-slate-500 mb-8">Itt módosíthatod a nyilvános profilod és a fényképed.</p>

            <form action={updateProfile} className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="relative group w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-lg">
                  {previewUrl ? (
                    <Image src={previewUrl} alt="Avatar" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><User className="w-10 h-10" /></div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <input type="file" name="avatar" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Profilkép</h3>
                  <p className="text-xs text-slate-500">JPG, PNG (max. 2MB)</p>
                  <label className="mt-2 inline-block text-xs font-bold text-amber-600 cursor-pointer hover:underline">
                    Feltöltés <input type="file" name="avatar" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid gap-5">
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email cím</label>
                    <input type="text" value={user.email} disabled className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed" />
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Teljes név</label>
                        <input name="fullName" type="text" defaultValue={meta.full_name || ''} placeholder="Név" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Telefon</label>
                        <input name="phone" type="tel" defaultValue={meta.phone || ''} placeholder="+36..." className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500 outline-none" />
                    </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <SubmitButton />
              </div>
            </form>
          </div>
        )}

        {/* 2. PREFERENCIÁK */}
        {activeTab === 'preferences' && (
          <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Testreszabás</h2>
             <PreferencesForm settings={settings} />
          </div>
        )}

        {/* 3. FIÓK */}
        {activeTab === 'account' && (
          <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Fiók biztonság</h2>
            <DeleteAccountSection />
          </div>
        )}

      </div>
    </div>
  )
}