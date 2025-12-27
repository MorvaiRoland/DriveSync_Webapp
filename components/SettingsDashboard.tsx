'use client'

import { useState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { updateProfile, updatePreferences, deleteAccountAction } from '@/app/settings/actions'
import Image from 'next/image'
import {
  User, Bell, CreditCard, Loader2, LogOut, Moon, Sun, 
  CheckCircle, Upload, Camera, AlertTriangle, Trash2, 
  ChevronRight, ShieldCheck, Zap, Sparkles, Smartphone
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { createClient } from '@/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// --- TÍPUSOK ---
interface SettingsDashboardProps {
  user: any
  meta: any
  settings: any
  subscription: any
}

// --- SEGÉDKOMPONENSEK ---

function SubmitButton({ label = 'Mentés' }: { label?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-ocean-electric flex items-center justify-center gap-2 rounded-2xl px-8 py-3 text-sm font-black uppercase tracking-[0.2em] transition-all hover:scale-105 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
      {pending ? 'Feldolgozás...' : label}
    </button>
  )
}

// --- FŐ KOMPONENS ---

export default function SettingsDashboard({
  user,
  settings,
  subscription,
}: SettingsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'billing'>('profile')
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => setMounted(true), [])

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

  if (!mounted) return null

  const navItems = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'preferences', label: 'Rendszer', icon: Bell },
    { id: 'billing', label: 'Előfizetés', icon: CreditCard },
  ]

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start pb-[env(safe-area-inset-bottom)]">
      
      {/* --- OLDALSÁV / MOBIL NAVIGÁCIÓ --- */}
      <nav className="w-full lg:w-72 flex lg:flex-col gap-2 p-2 glass rounded-[2.5rem] border-neon-glow overflow-x-auto no-scrollbar sticky top-[env(safe-area-inset-top)] z-30">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 lg:flex-none ${
              activeTab === item.id 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]' 
                : 'text-muted-foreground hover:bg-accent'
            }`}
          >
            <item.icon className="h-4 w-4" /> {item.label}
          </button>
        ))}
        <div className="hidden lg:block my-4 border-t border-border/50 mx-4" />
        <button 
          onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
          className="flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-all ml-auto lg:ml-0"
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
            <div className="glass rounded-[3rem] p-8 border-neon-glow relative overflow-hidden group">
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative w-32 h-32 rounded-full border-4 border-primary/20 overflow-hidden cursor-pointer shadow-2xl transition-all hover:scale-105 hover:border-primary"
                    >
                        {user.user_metadata?.avatar_url ? (
                            <Image src={user.user_metadata.avatar_url} alt="Avatar" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full bg-accent flex items-center justify-center text-primary"><User size={48} /></div>
                        )}
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white h-8 w-8" />
                        </div>
                    </div>
                    <div className="text-center md:text-left space-y-4">
                        <h3 className="text-2xl font-black tracking-tighter uppercase italic">Profilkép módosítása</h3>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest leading-relaxed max-w-xs">Az arcod az Apex rendszerben. <br/>Max 10MB (JPG, PNG).</p>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={() => formRef.current?.requestSubmit()} />
                        <button onClick={() => fileInputRef.current?.click()} className="bg-primary/10 text-primary border border-primary/20 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                            Új kép feltöltése
                        </button>
                    </div>
                </div>
                <div className="absolute -right-10 -bottom-10 opacity-[0.03] dark:opacity-[0.07] group-hover:rotate-12 transition-transform duration-1000">
                    <User size={250} />
                </div>
            </div>

            {/* ADATOK FORM */}
            <div className="glass rounded-[3rem] p-8 sm:p-12 border-neon-glow shadow-2xl">
                <form action={updateProfile} ref={formRef} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-2">Teljes Név</label>
                            <input 
                              name="full_name" 
                              type="text" 
                              defaultValue={user.user_metadata?.full_name} 
                              className="w-full bg-background/50 border border-border rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all shadow-inner"
                              placeholder="Minta János" 
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Email (Azonosító)</label>
                            <div className="relative">
                                <input type="email" value={user.email} disabled className="w-full bg-accent/30 border border-border/50 rounded-2xl px-6 py-4 text-sm font-bold opacity-50 cursor-not-allowed" />
                                <ShieldCheck className="absolute right-4 top-4 h-5 w-5 text-emerald-500" />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end border-t border-border/50 pt-8">
                        <SubmitButton label="Profil Mentése" />
                    </div>
                </form>
            </div>

            {/* VESZÉLYZÓNA BENTO */}
            <div className="bg-destructive/5 rounded-[3rem] p-8 border border-destructive/20 relative overflow-hidden group">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-destructive/10 rounded-2xl text-destructive shadow-lg"><AlertTriangle size={32} /></div>
                        <div>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-destructive">Fiók Megszüntetése</h3>
                            <p className="text-xs text-muted-foreground font-bold uppercase mt-1">Végleges törlés. Nincs visszaút.</p>
                        </div>
                    </div>
                    <button onClick={() => setShowDeleteModal(true)} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-destructive border border-destructive/30 hover:bg-destructive hover:text-white transition-all">
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
            <div className="glass rounded-[3rem] p-8 border-neon-glow space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Sun size={24} /></div>
                    <h3 className="text-lg font-black uppercase italic tracking-tighter">Vizuális Megjelenés</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {['light', 'dark'].map((t) => (
                        <button 
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${
                                theme === t ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border hover:border-primary/50'
                            }`}
                        >
                            {t === 'light' ? <Sun className="text-amber-500 h-8 w-8" /> : <Moon className="text-indigo-400 h-8 w-8" />}
                            <span className="text-[10px] font-black uppercase tracking-widest">{t === 'light' ? 'Világos' : 'Sötét'}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ÉRTESÍTÉSEK */}
            <div className="glass rounded-[3rem] p-8 border-neon-glow space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Bell size={24} /></div>
                    <h3 className="text-lg font-black uppercase italic tracking-tighter">Értesítési Központ</h3>
                </div>
                <div className="space-y-4">
                    {['Email értesítések', 'Push üzenetek'].map((label, idx) => (
                        <div key={idx} className="flex items-center justify-between p-5 bg-accent/30 rounded-2xl border border-border/50 transition-all hover:border-primary/50 group">
                            <div className="flex items-center gap-3">
                                {idx === 0 ? <Bell className="h-4 w-4 text-primary" /> : <Smartphone className="h-4 w-4 text-primary" />}
                                <span className="text-sm font-bold">{label}</span>
                            </div>
                            <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative p-1 cursor-pointer transition-colors peer-checked:bg-primary">
                                <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-all ${idx === 0 ? 'ml-6 bg-primary' : ''}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </motion.div>
        )}

        {/* 3. ELŐFIZETÉS PANEL */}
        {activeTab === 'billing' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
             <div className="glass rounded-[3rem] p-8 sm:p-12 border-neon-glow relative overflow-hidden shadow-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-12 relative z-10">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">Aktuális tagság</span>
                        <h2 className="text-5xl font-black uppercase italic tracking-tighter mt-4 text-gradient-ocean">
                            {subscription?.plan_type === 'founder' ? 'Founder Edition' : 'Pro Tier'}
                        </h2>
                    </div>
                    <div className="h-20 w-20 rounded-3xl bg-ocean-electric flex items-center justify-center text-white shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                        <Zap size={40} className="fill-current" />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative z-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm font-bold text-emerald-500">
                            <CheckCircle size={20} /> Örökös elérés (Lifetime)
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-foreground">
                            <CheckCircle size={20} className="text-primary" /> Korlátlan AI Diagnosztika
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm font-bold text-foreground">
                            <CheckCircle size={20} className="text-primary" /> Flotta kezelés (Max 10 autó)
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-foreground">
                            <CheckCircle size={20} className="text-primary" /> Prioritásos ügyfélszolgálat
                        </div>
                    </div>
                </div>

                <div className="relative z-10 border-t border-border/50 pt-10">
                    <button 
                        onClick={manageSubscription} 
                        disabled={loadingPortal}
                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:scale-[1.01] flex items-center justify-center gap-3 shadow-xl"
                    >
                        {loadingPortal ? <Loader2 className="animate-spin h-4 w-4" /> : <CreditCard size={16} />}
                        Számlázási Adatok Kezelése
                    </button>
                    <p className="text-center text-[10px] text-muted-foreground mt-4 font-bold uppercase tracking-widest">
                        A fizetéseket a <span className="text-primary">Stripe</span> biztonságos rendszere kezeli.
                    </p>
                </div>

                {/* DEKORÁCIÓ */}
                <Sparkles className="absolute top-0 right-0 w-64 h-64 opacity-5 text-primary blur-2xl" />
             </div>
          </motion.div>
        )}
      </main>

      {/* --- DELETE MODAL --- */}
      <AnimatePresence>
        {showDeleteModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80" onClick={() => setShowDeleteModal(false)} />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative w-full max-w-md glass rounded-[3rem] p-10 border-2 border-destructive/20 text-center shadow-[0_0_100px_rgba(239,68,68,0.2)]"
                >
                    <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-8 text-destructive animate-pulse">
                        <Trash2 size={48} />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 italic">Végleges törlés?</h3>
                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mb-10 leading-relaxed">
                        A művelet visszafordíthatatlan. <br/> Minden adatod véglegesen törlődik a DynamicSense szervereiről.
                    </p>
                    <div className="space-y-4">
                        <form action={deleteAccountAction}>
                             <button className="w-full py-5 bg-destructive text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all">
                                Igen, törlöm a fiókomat
                             </button>
                        </form>
                        <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 bg-accent text-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-border">
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