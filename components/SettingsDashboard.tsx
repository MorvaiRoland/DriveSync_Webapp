'use client'

import { useState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { updateProfile, updatePreferences, deleteAccountAction } from '@/app/settings/actions'
import Image from 'next/image'
import {
  User, Bell, CreditCard, Loader2, LogOut, Moon, Sun, 
  CheckCircle, Upload, Camera, AlertTriangle, Trash2, 
  ChevronRight, ShieldCheck, Zap, Sparkles, Smartphone, X, Crown
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { createBrowserClient } from '@supabase/ssr' 
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

import imageCompression from 'browser-image-compression'

// --- TÍPUSOK ---
interface SettingsDashboardProps {
  user: any
  meta: any
  settings: any
  subscription: any // A DB-ből jövő raw subscription data
  earlyAccessConfig: any // Az admin configból jövő adat (ezt át kell adni a page.tsx-ből!)
}

// --- SEGÉDKOMPONENSEK ---

function SubmitButton({ label = 'Mentés', disabled }: { label?: string, disabled?: boolean }) {
  const { pending } = useFormStatus()
  const isDisabled = pending || disabled
  
  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center gap-2 rounded-2xl px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
    >
      {pending || disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
      {pending || disabled ? 'Feldolgozás...' : label}
    </button>
  )
}

// --- FŐ KOMPONENS ---

export default function SettingsDashboard({
  user,
  settings,
  subscription,
  earlyAccessConfig // Ezt a propot add hozzá a page.tsx-ben is!
}: SettingsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'billing'>('profile')
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  // AVATAR STATEK
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.user_metadata?.avatar_url || null)
  const [newAvatarPath, setNewAvatarPath] = useState<string>('')
  
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => setMounted(true), [])

  // --- KÉP TÖMÖRÍTÉS ÉS FELTÖLTÉS ---
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarUploading(true)
    setAvatarPreview(URL.createObjectURL(file))

    try {
        const options = {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 500,
            useWebWorker: true,
            fileType: 'image/jpeg'
        }
        
        const compressedFile = await imageCompression(file, options)

        const fileExt = 'jpg'
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, compressedFile, { upsert: true })

        if (uploadError) throw uploadError

        setNewAvatarPath(filePath)
        
        setTimeout(() => {
            formRef.current?.requestSubmit()
        }, 100)

    } catch (error) {
        console.error('Avatar upload error:', error)
        alert('Hiba a kép feltöltésekor!')
        setAvatarPreview(user.user_metadata?.avatar_url || null)
    } finally {
        setAvatarUploading(false)
    }
  }

  const manageSubscription = async () => {
    setLoadingPortal(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (error) {
      console.error('Portal hiba');
    } finally {
      setLoadingPortal(false)
    }
  }

  // --- PLAN LOGIKA KIOLVASÁSA ---
  let planDisplay = 'Starter (Ingyenes)';
  let planColor = 'text-slate-500';
  let planIcon = <User className="w-10 h-10" />;

  // 1. Megnézzük a konkrét előfizetést
  const dbPlan = subscription?.plan_type;

  if (dbPlan === 'lifetime') {
      planDisplay = 'Founder Edition (Örökös)';
      planColor = 'text-amber-500';
      planIcon = <Crown className="w-10 h-10 fill-current" />;
  } else if (dbPlan === 'pro') {
      planDisplay = 'Pro Előfizetés';
      planColor = 'text-indigo-500';
      planIcon = <Zap className="w-10 h-10 fill-current" />;
  } else if (earlyAccessConfig?.early_access_pro) {
      // Ha nincs előfizetés, de az Early Access aktív
      planDisplay = 'Early Access Pro';
      planColor = 'text-emerald-500';
      planIcon = <Sparkles className="w-10 h-10 fill-current" />;
  }


  if (!mounted) return null

  const navItems = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'preferences', label: 'Rendszer', icon: Bell },
    { id: 'billing', label: 'Előfizetés', icon: CreditCard },
  ]

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start pb-[env(safe-area-inset-bottom)]">
      
      {/* --- OLDALSÁV / MOBIL NAVIGÁCIÓ --- */}
      <nav className="w-full lg:w-72 flex lg:flex-col gap-2 p-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-slate-800 overflow-x-auto no-scrollbar sticky top-[env(safe-area-inset-top)] z-30">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 lg:flex-none ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-[1.02]' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <item.icon className="h-4 w-4" /> {item.label}
          </button>
        ))}
        <div className="hidden lg:block my-4 border-t border-slate-200 dark:border-slate-800 mx-4" />
        <button 
          onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
          className="flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all ml-auto lg:ml-0"
        >
          <LogOut className="h-4 w-4" /> Kilépés
        </button>
      </nav>

      {/* --- TARTALOM TERÜLET --- */}
      <main className="flex-1 w-full space-y-8">
        
        {/* 1. PROFIL SZEKCIÓ */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            
            {/* AVATAR BENTO CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden group shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div 
                        onClick={() => !avatarUploading && fileInputRef.current?.click()}
                        className={`group relative w-32 h-32 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30 overflow-hidden cursor-pointer shadow-2xl transition-all hover:scale-105 hover:border-indigo-500 ${avatarUploading ? 'opacity-70 pointer-events-none' : ''}`}
                    >
                        {avatarUploading && (
                             <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                 <Loader2 className="w-8 h-8 text-white animate-spin" />
                             </div>
                        )}

                        {avatarPreview ? (
                            <Image src={avatarPreview} alt="Avatar" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"><User size={48} /></div>
                        )}
                        
                        {!avatarUploading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white h-8 w-8" />
                            </div>
                        )}
                    </div>
                    <div className="text-center md:text-left space-y-4">
                        <h3 className="text-2xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">Profilkép módosítása</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed max-w-xs">
                            Az arcod a DynamicSense rendszerben. <br/>Automatikus tömörítés és optimalizálás.
                        </p>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleAvatarChange} 
                        />
                        
                        <button 
                            type="button"
                            disabled={avatarUploading}
                            onClick={() => fileInputRef.current?.click()} 
                            className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
                        >
                            {avatarUploading ? 'Feltöltés...' : 'Új kép feltöltése'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ADATOK FORM */}
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-sm">
                <form action={updateProfile} ref={formRef} className="space-y-8">
                    
                    <input type="hidden" name="avatar_path" value={newAvatarPath} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 ml-2">Teljes Név</label>
                            <input 
                              name="full_name" 
                              type="text" 
                              defaultValue={user.user_metadata?.full_name} 
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner dark:text-white"
                              placeholder="Minta János" 
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Email (Azonosító)</label>
                            <div className="relative">
                                <input type="email" value={user.email} disabled className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold opacity-70 cursor-not-allowed dark:text-slate-400" />
                                <ShieldCheck className="absolute right-4 top-4 h-5 w-5 text-emerald-500" />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-8">
                        <SubmitButton label="Profil Mentése" disabled={avatarUploading} />
                    </div>
                </form>
            </div>

            {/* VESZÉLYZÓNA */}
            <div className="bg-red-50 dark:bg-red-950/10 rounded-[3rem] p-8 border border-red-100 dark:border-red-900/30 relative overflow-hidden group">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-2xl text-red-600 dark:text-red-400 shadow-lg"><AlertTriangle size={32} /></div>
                        <div>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-red-600 dark:text-red-400">Fiók Megszüntetése</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase mt-1">Végleges törlés. Nincs visszaút.</p>
                        </div>
                    </div>
                    <button onClick={() => setShowDeleteModal(true)} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-600 hover:text-white transition-all">
                        Törlés indítása
                    </button>
                </div>
            </div>
          </motion.div>
        )}

        {/* 2. RENDSZER BEÁLLÍTÁSOK */}
        {activeTab === 'preferences' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* TÉMA VÁLASZTÓ */}
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400"><Sun size={24} /></div>
                    <h3 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Vizuális Megjelenés</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {['light', 'dark'].map((t) => (
                        <button 
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${
                                theme === t ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                            }`}
                        >
                            {t === 'light' ? <Sun className="text-amber-500 h-8 w-8" /> : <Moon className="text-indigo-400 h-8 w-8" />}
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{t === 'light' ? 'Világos' : 'Sötét'}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ÉRTESÍTÉSEK */}
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400"><Bell size={24} /></div>
                    <h3 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Értesítési Központ</h3>
                </div>
                <form action={updatePreferences} className="space-y-4">
                    {['Email értesítések', 'Push üzenetek'].map((label, idx) => (
                        <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all hover:border-indigo-300 group">
                            <div className="flex items-center gap-3">
                                {idx === 0 ? <Bell className="h-4 w-4 text-indigo-500" /> : <Smartphone className="h-4 w-4 text-indigo-500" />}
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{label}</span>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name={idx === 0 ? 'notify_email' : 'notify_push'} defaultChecked={idx === 0 ? settings?.notify_email : settings?.notify_push} className="sr-only peer" onChange={(e) => e.target.form?.requestSubmit()} />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </div>
                        </div>
                    ))}
                    <input type="hidden" name="theme" value={theme || 'light'} />
                </form>
            </div>
            </motion.div>
        )}

        {/* 3. ELŐFIZETÉS PANEL */}
        {activeTab === 'billing' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-12 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm">
                 
                 <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-12 relative z-10">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800">Aktuális tagság</span>
                        <h2 className={`text-4xl md:text-5xl font-black uppercase italic tracking-tighter mt-4 ${planColor}`}>
                            {planDisplay}
                        </h2>
                        {subscription?.current_period_end && (
                            <p className="text-xs text-slate-400 font-mono mt-2">
                                Megújulás: {new Date(subscription.current_period_end).toLocaleDateString('hu-HU')}
                            </p>
                        )}
                    </div>
                    <div className={`h-20 w-20 rounded-3xl flex items-center justify-center shadow-2xl rotate-3 transition-transform ${
                         dbPlan === 'lifetime' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'
                    }`}>
                        {planIcon}
                    </div>
                </div>

                 <div className="relative z-10 border-t border-slate-100 dark:border-slate-800 pt-10">
                    <button 
                        onClick={manageSubscription} 
                        disabled={loadingPortal}
                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:scale-[1.01] flex items-center justify-center gap-3 shadow-xl"
                    >
                        {loadingPortal ? <Loader2 className="animate-spin h-4 w-4" /> : <CreditCard size={16} />}
                        Számlázási Adatok Kezelése
                    </button>
                    <p className="text-center text-[10px] text-slate-400 mt-4">
                        A Stripe biztonságos felületére irányítunk át.
                    </p>
                </div>
             </div>
          </motion.div>
        )}
      </main>

      {/* --- DELETE MODAL --- */}
      <AnimatePresence>
        {showDeleteModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-10 border-2 border-red-100 dark:border-red-900/30 text-center shadow-2xl"
                >
                    <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-8 text-red-600 animate-pulse">
                        <Trash2 size={48} />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 italic text-slate-900 dark:text-white">Végleges törlés?</h3>
                    <div className="space-y-4">
                        <form action={deleteAccountAction}>
                             <button className="w-full py-5 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-lg hover:scale-105 transition-all hover:bg-red-700">
                                Igen, törlöm a fiókomat
                             </button>
                        </form>
                        <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-200 dark:hover:bg-slate-700">
                            Mégsem
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  )
}