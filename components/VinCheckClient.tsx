'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Search, ShieldCheck, Calendar, Gauge, Wrench, AlertCircle, CheckCircle2, Info, Fuel, Zap, Settings, Tag, History, ArrowLeft, Menu, X, Sun, Moon, Globe } from 'lucide-react'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'

type Lang = 'hu' | 'en'

const translations = {
  hu: {
    badge: 'HITELESÍTETT ADATLAP',
    title1: 'Alvázszám',
    title2: 'Lekérdezés',
    desc: 'A DynamicSense rendszerében vezetett valós előélet. Nincs több zsákbamacska, csak tiszta adatok.',
    placeholder: '17 jegyű alvázszám...',
    searchBtn: 'Keresés',
    searching: 'Keresés...',
    errorLength: 'Az alvázszám minimum 17 karakter!',
    errorNotFound: 'Nincs találat, vagy a tulajdonos nem tette nyilvánossá az adatokat.',
    vinLabel: 'VIN',
    plateLabel: 'Rendszám',
    year: 'Évjárat',
    mileage: 'Km óra állás',
    fuel: 'Üzemanyag',
    transmission: 'Váltó',
    power: 'Teljesítmény',
    body: 'Kivitel',
    serviceHistory: 'Szerviztörténet',
    registered: 'Rendszerbe regisztrálva',
    verified: 'Ellenőrzött VIN',
    noImage: 'Nincs kép',
    backHome: 'Vissza a főoldalra',
    features: 'Funkciók',
    login: 'Bejelentkezés',
    startFree: 'Kezdés ingyen',
  },
  en: {
    badge: 'VERIFIED DATA SHEET',
    title1: 'VIN',
    title2: 'Lookup',
    desc: 'Real service history tracked in the DynamicSense system. No more surprises, just clean data.',
    placeholder: '17-digit VIN number...',
    searchBtn: 'Search',
    searching: 'Searching...',
    errorLength: 'VIN must be at least 17 characters!',
    errorNotFound: 'No results found, or the owner has not made their data public.',
    vinLabel: 'VIN',
    plateLabel: 'Plate',
    year: 'Year',
    mileage: 'Mileage',
    fuel: 'Fuel Type',
    transmission: 'Transmission',
    power: 'Power',
    body: 'Body Type',
    serviceHistory: 'Service History',
    registered: 'Registered in system',
    verified: 'Verified VIN',
    noImage: 'No image',
    backHome: 'Back to home',
    features: 'Features',
    login: 'Log in',
    startFree: 'Start for free',
  }
}

const ThemeToggle = () => {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div className="w-10 h-10 rounded-full bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/50 dark:bg-black/50 border border-white/40 dark:border-white/10 backdrop-blur-md shadow-sm hover:scale-105 transition-all cursor-pointer"
      aria-label="Toggle Theme"
    >
      <Sun className={`absolute w-5 h-5 transition-all duration-500 ${isDark ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0 text-slate-700'}`} />
      <Moon className={`absolute w-5 h-5 transition-all duration-500 ${isDark ? 'opacity-100 scale-100 rotate-0 text-white' : 'opacity-0 scale-50 -rotate-90'}`} />
    </button>
  )
}

export default function VinCheckClient() {
  const [vin, setVin] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [lang, setLangState] = useState<Lang>('hu')

  const t = translations[lang]

  const setLang = (newLang: Lang) => {
    setLangState(newLang)
    localStorage.setItem('app_lang', newLang)
  }

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    const saved = localStorage.getItem('app_lang') as Lang
    if (saved === 'hu' || saved === 'en') setLangState(saved)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (vin.length < 17) {
      setError(t.errorLength)
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)

    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('*')
      .eq('vin', vin.toUpperCase())
      .eq('is_public_history', true)
      .single()

    if (carError || !car) {
      setLoading(false)
      setError(t.errorNotFound)
      return
    }

    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('car_id', car.id)
      .eq('type', 'service')
      .order('event_date', { ascending: false })

    setResult({ car, events })
    setLoading(false)
  }

  const DataItem = ({ icon, label, value, sub }: any) => (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md hover:bg-white/60 dark:hover:bg-white/10 transition-colors group shadow-sm">
      <div className="p-2.5 rounded-xl bg-white/70 dark:bg-black/30 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shadow-sm flex-shrink-0 border border-white/50 dark:border-white/5">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-0.5">{label}</div>
        <div className="text-sm md:text-base font-semibold text-slate-900 dark:text-white leading-tight truncate tracking-tight">{value || '-'}</div>
        {sub && <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{sub}</div>}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen w-full max-w-[100vw] bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden transition-colors duration-700">

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* Aurora Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[min(400px,80vw)] md:w-[800px] h-[min(400px,80vw)] md:h-[800px] bg-indigo-400/20 dark:bg-indigo-600/20 blur-[80px] md:blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[min(400px,80vw)] md:w-[800px] h-[min(400px,80vw)] md:h-[800px] bg-emerald-400/20 dark:bg-emerald-600/20 blur-[80px] md:blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-[30%] left-[10%] w-[min(300px,70vw)] md:w-[600px] h-[min(300px,70vw)] md:h-[600px] bg-cyan-300/20 dark:bg-cyan-600/20 blur-[80px] md:blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] dark:opacity-[0.06] mix-blend-overlay"></div>
      </div>

      {/* Navbar - with safe-area support for notch */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50 px-4"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <div className={`max-w-5xl mx-auto h-16 flex items-center justify-between px-6 rounded-full transition-all duration-500 ${scrolled ? 'bg-white/60 dark:bg-black/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(255,255,255,0.02)]' : 'bg-transparent'}`}>
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/DynamicSense-logo.png" alt="DynamicSense Logo" width={200} height={50} className="h-8 w-auto object-contain group-hover:scale-105 transition-transform" priority />
            <span className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white">Dynamic<span className="text-slate-500 dark:text-slate-400">Sense</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors">{t.features}</Link>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
            <button
              onClick={() => setLang(lang === 'hu' ? 'en' : 'hu')}
              className="flex items-center gap-2 px-3 h-10 rounded-full bg-white/50 dark:bg-black/50 border border-white/40 dark:border-white/10 backdrop-blur-md shadow-sm hover:scale-105 transition-all text-sm font-semibold text-slate-700 dark:text-white"
            >
              <Globe className="w-4 h-4 opacity-70" />
              <span>{lang.toUpperCase()}</span>
            </button>
            <ThemeToggle />
            <Link href="/login" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors ml-2">{t.login}</Link>
            <Link href="/login?mode=signup" className="px-5 py-2 rounded-full bg-black/90 dark:bg-white/90 text-white dark:text-black text-sm font-medium hover:scale-105 transition-transform shadow-lg backdrop-blur-md">
              {t.startFree}
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-800 dark:text-white">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -20 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -20 }}
              className="md:hidden mt-4 mx-auto max-w-5xl overflow-hidden bg-white/70 dark:bg-black/70 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-3xl shadow-2xl"
            >
              <div className="p-6 flex flex-col gap-4">
                <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-2xl hover:bg-white/50 dark:hover:bg-white/10 font-medium text-slate-800 dark:text-slate-200">{t.features}</Link>
                <div className="h-px bg-slate-200 dark:bg-slate-800 w-full my-2"></div>
                <div className="flex justify-between items-center px-3">
                  <button
                    onClick={() => setLang(lang === 'hu' ? 'en' : 'hu')}
                    className="flex items-center gap-2 px-3 h-10 rounded-full bg-white/50 dark:bg-black/50 border border-white/40 dark:border-white/10 backdrop-blur-md shadow-sm text-sm font-semibold text-slate-700 dark:text-white"
                  >
                    <Globe className="w-4 h-4 opacity-70" />
                    <span>{lang.toUpperCase()}</span>
                  </button>
                  <ThemeToggle />
                </div>
                <Link href="/login" className="w-full p-4 mt-2 text-center rounded-2xl font-medium bg-white/50 dark:bg-white/10 text-slate-900 dark:text-white border border-white/40 dark:border-white/5">{t.login}</Link>
                <Link href="/login?mode=signup" className="w-full p-4 text-center rounded-2xl font-medium bg-black dark:bg-white text-white dark:text-black">{t.startFree}</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-[calc(env(safe-area-inset-top)+6rem)] pb-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 text-slate-800 dark:text-slate-300 text-xs font-semibold tracking-widest backdrop-blur-md shadow-sm uppercase mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            {t.badge}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tighter leading-[1.05] mb-6">
            <span className="text-slate-900 dark:text-white block">{t.title1}</span>
            <span className="text-slate-500 dark:text-slate-400 block pb-2">{t.title2}</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed tracking-tight px-4">
            {t.desc}
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={handleSearch}
          className="relative max-w-2xl mx-auto mb-16 md:mb-24"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white/60 dark:bg-white/5 rounded-2xl p-2 border border-white/60 dark:border-white/10 backdrop-blur-2xl shadow-xl gap-2">
              <div className="flex items-center flex-1 min-w-0">
                <Search className="w-5 h-5 text-slate-400 ml-3 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  placeholder={t.placeholder}
                  className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 font-mono text-base md:text-lg py-3 md:py-4 focus:outline-none uppercase tracking-widest min-w-0"
                  maxLength={17}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-black/90 dark:bg-white/90 text-white dark:text-black font-medium px-6 py-3 md:py-4 rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 flex-shrink-0"
              >
                {loading ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>{t.searching}</span>
                ) : t.searchBtn}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-3 bg-red-500/5 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 backdrop-blur-md rounded-xl flex items-center justify-center gap-3 text-red-600 dark:text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-12 md:space-y-20"
            >
              {/* Car Header Card */}
              <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white/30 dark:bg-white/5 border border-white/50 dark:border-white/10 backdrop-blur-3xl shadow-2xl">
                {result.car.image_url && (
                  <div className="absolute inset-0 z-0 opacity-10 dark:opacity-15 pointer-events-none">
                    <img src={result.car.image_url} alt="" className="w-full h-full object-cover blur-3xl scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 dark:from-black/90 via-white/70 dark:via-black/70 to-transparent"></div>
                  </div>
                )}

                <div className="relative z-10 p-6 md:p-12 lg:p-16">
                  <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-start">
                    <div className="w-full lg:w-5/12">
                      <div className="relative aspect-[4/3] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 shadow-xl group">
                        {result.car.image_url ? (
                          <img src={result.car.image_url} alt={result.car.model} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-4">
                            <Search className="w-10 h-10" />
                            <span className="font-medium">{t.noImage}</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-emerald-500/90 backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" /> {t.verified}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 w-full">
                      <div className="mb-8 md:mb-10">
                        <div className="text-slate-500 dark:text-slate-400 font-mono text-xs md:text-sm tracking-widest mb-2 uppercase">
                          {result.car.make}
                        </div>
                        <h2 className="text-3xl md:text-5xl lg:text-7xl font-semibold text-slate-900 dark:text-white tracking-tighter leading-[1.05] mb-6 break-words">
                          {result.car.model}
                        </h2>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                          <div className="flex items-center gap-2 bg-white/50 dark:bg-white/10 backdrop-blur-md px-3 py-2 md:px-4 md:py-2.5 rounded-xl border border-white/60 dark:border-white/10 shadow-sm">
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{t.vinLabel}</span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs md:text-sm font-bold tracking-wider">{result.car.vin}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/50 dark:bg-white/10 backdrop-blur-md px-3 py-2 md:px-4 md:py-2.5 rounded-xl border border-white/60 dark:border-white/10 shadow-sm">
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{t.plateLabel}</span>
                            <span className="font-mono text-slate-900 dark:text-white text-xs md:text-sm font-bold tracking-wider">{result.car.plate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <DataItem icon={<Calendar className="w-4 h-4 md:w-5 md:h-5" />} label={t.year} value={result.car.year} />
                        <DataItem icon={<Gauge className="w-4 h-4 md:w-5 md:h-5" />} label={t.mileage} value={`${result.car.mileage?.toLocaleString()} km`} />
                        <DataItem icon={<Fuel className="w-4 h-4 md:w-5 md:h-5" />} label={t.fuel} value={result.car.fuel_type} />
                        <DataItem icon={<Settings className="w-4 h-4 md:w-5 md:h-5" />} label={t.transmission} value={result.car.transmission} />
                        <DataItem icon={<Zap className="w-4 h-4 md:w-5 md:h-5" />} label={t.power} value={result.car.power_hp ? `${result.car.power_hp} LE` : null} sub={result.car.engine_size ? `${result.car.engine_size} cm³` : null} />
                        <DataItem icon={<Tag className="w-4 h-4 md:w-5 md:h-5" />} label={t.body} value={result.car.body_type} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service History */}
              <div className="max-w-4xl mx-auto px-2">
                <div className="flex items-center gap-4 md:gap-6 mb-12 md:mb-16 justify-center text-center">
                  <div className="h-px flex-1 max-w-[100px] bg-slate-300/50 dark:bg-white/10"></div>
                  <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white flex items-center gap-3 tracking-tighter">
                    <History className="w-6 h-6 md:w-7 md:h-7 text-slate-400 dark:text-slate-500" />
                    {t.serviceHistory}
                  </h3>
                  <div className="h-px flex-1 max-w-[100px] bg-slate-300/50 dark:bg-white/10"></div>
                </div>

                <div className="relative">
                  <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-slate-300/50 dark:bg-white/10 md:-translate-x-1/2"></div>
                  <div className="space-y-8 md:space-y-12">
                    {result.events?.map((event: any, i: number) => {
                      const isLeft = i % 2 === 0
                      const date = new Date(event.event_date)
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: '-50px' }}
                          transition={{ duration: 0.6 }}
                          className={`relative flex flex-col md:flex-row items-start md:items-center w-full ${isLeft ? 'md:flex-row-reverse' : ''}`}
                        >
                          <div className="hidden md:block w-1/2"></div>
                          <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-[#F5F5F7] dark:border-[#000000] z-10 shadow-md mt-6 md:mt-0 bg-slate-900 dark:bg-white flex-shrink-0"></div>
                          <div className={`w-full md:w-1/2 pl-10 md:pl-0 ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}>
                            <div className="bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-2xl p-5 md:p-6 rounded-2xl hover:bg-white/60 dark:hover:bg-white/10 transition-all shadow-sm group relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-[3rem] md:rounded-bl-[4rem]"></div>
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
                                <div>
                                  <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-tighter">
                                    {date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                                  </div>
                                  <div className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight tracking-tight">
                                    {event.title}
                                  </div>
                                </div>
                                <div className="self-start bg-white/60 dark:bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/60 dark:border-white/10 text-[10px] md:text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                                  {event.mileage?.toLocaleString()} km
                                </div>
                              </div>
                              <div className="space-y-3">
                                {event.description && (
                                  <div className="flex gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                                    <Wrench className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                    <p className="leading-relaxed">{event.description}</p>
                                  </div>
                                )}
                                {event.notes && (
                                  <div className="flex gap-3 text-xs md:text-sm text-slate-500 dark:text-slate-400 italic bg-white/30 dark:bg-white/5 p-3 rounded-lg border border-white/40 dark:border-white/10">
                                    <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                    <p>"{event.notes}"</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                    <div className="relative flex flex-col items-center pt-8">
                      <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-10 w-3 h-3 rounded-full bg-emerald-500 shadow-md z-10"></div>
                      <div className="pl-10 md:pl-0 w-full md:w-auto text-left md:text-center">
                        <div className="inline-block bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md text-emerald-600 dark:text-emerald-400 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                          {t.registered}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back link */}
        {!result && (
          <div className="text-center mt-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> {t.backHome}
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/50 dark:border-white/10 py-8 px-4 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/DynamicSense-logo.png" alt="DynamicSense" width={120} height={30} className="h-6 w-auto object-contain opacity-60" />
          </Link>
          <p>&copy; {new Date().getFullYear()} DynamicSense. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-700 dark:hover:text-white transition-colors">{lang === 'hu' ? 'Adatvédelem' : 'Privacy'}</Link>
            <Link href="/terms" className="hover:text-slate-700 dark:hover:text-white transition-colors">{lang === 'hu' ? 'ÁSZF' : 'Terms'}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}