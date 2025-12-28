'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Search, ShieldCheck, Calendar, Gauge, Wrench, AlertCircle, CheckCircle2, Info, Fuel, Zap, Settings, Tag, History, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// ÁTNEVEZVE: VinCheckClient
export default function VinCheckClient() {
  const [vin, setVin] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (vin.length < 17) {
        setError('Az alvázszám minimum 17 karakter!')
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
      setError('Nincs találat, vagy a tulajdonos nem tette nyilvánossá az adatokat.')
      return
    }

    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('car_id', car.id)
      .order('event_date', { ascending: false })

    setResult({ car, events })
    setLoading(false)
  }

  const DataItem = ({ icon, label, value, sub }: any) => (
      <div className="flex items-start gap-3 p-3 md:p-4 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors group shadow-sm dark:shadow-none">
          <div className="p-2 md:p-3 rounded-xl bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shadow-sm dark:shadow-inner flex-shrink-0">
              {icon}
          </div>
          <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5 md:mb-1 truncate">{label}</div>
              <div className="text-sm md:text-base font-bold text-slate-900 dark:text-white leading-tight truncate">{value || '-'}</div>
              {sub && <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{sub}</div>}
          </div>
      </div>
  )

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden pb-20 pt-[env(safe-area-inset-top)] transition-colors duration-300">
        
      {/* Background FX - Finomított színek világos módhoz */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-20%] left-[-10%] w-[100vw] h-[100vw] md:w-[80vw] md:h-[80vw] bg-indigo-500/5 dark:bg-indigo-600/5 rounded-full blur-[100px] md:blur-[150px]"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] bg-emerald-500/5 dark:bg-emerald-600/5 rounded-full blur-[100px] md:blur-[150px]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.02]"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* VISSZA GOMB */}
        <div className="pt-4 md:pt-0 md:absolute md:top-12 md:left-6 z-50">
            <Link href="/" className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all backdrop-blur-md shadow-sm dark:shadow-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">Vissza</span>
            </Link>
        </div>

        {/* Header */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 md:mb-20 pt-6 md:pt-24"
        >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 text-emerald-600 dark:text-emerald-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" /> Hitelesített Adatlap
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 tracking-tighter text-slate-900 dark:text-white leading-tight">
                Alvázszám <br className="xs:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-600 dark:from-emerald-400 dark:to-cyan-500">Lekérdezés</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-xl max-w-2xl mx-auto font-light leading-relaxed px-4">
                A DynamicSense rendszerében vezetett valós előélet. Nincs több zsákbamacska, csak tiszta adatok.
            </p>
        </motion.div>

        {/* Search Bar */}
        <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSearch} 
            className="relative max-w-2xl mx-auto mb-16 md:mb-24 z-20"
        >
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-10 dark:opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white dark:bg-[#131722] rounded-2xl p-2 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl gap-2">
                    <div className="flex items-center flex-1 min-w-0">
                        <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 ml-3 mr-2 flex-shrink-0" />
                        <input 
                            type="text" 
                            value={vin}
                            onChange={(e) => setVin(e.target.value.toUpperCase())}
                            placeholder="17 jegyű alvázszám..."
                            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 font-mono text-base md:text-lg py-3 md:py-4 focus:outline-none uppercase tracking-widest min-w-0"
                            maxLength={17}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold px-6 py-3 md:py-4 rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 flex-shrink-0"
                    >
                        {loading ? '...' : 'Keresés'}
                    </button>
                </div>
            </div>
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-3 bg-red-500/5 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center justify-center gap-3 text-red-600 dark:text-red-400 text-sm"
                    >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.form>

        {/* Result Area */}
        <AnimatePresence>
            {result && (
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12 md:space-y-24"
                >
                    {/* --- CAR HEADER --- */}
                    <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-slate-50 dark:bg-gradient-to-b dark:from-slate-900 dark:to-[#0F131F] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl">
                        
                        {result.car.image_url && (
                            <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none">
                                <img src={result.car.image_url} alt="" className="w-full h-full object-cover blur-3xl scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-[#0F131F] via-slate-50/80 dark:via-[#0F131F]/80 to-transparent"></div>
                            </div>
                        )}

                        <div className="relative z-10 p-6 md:p-12 lg:p-16">
                            <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-start">
                                <div className="w-full lg:w-5/12">
                                    <div className="relative aspect-[4/3] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl group">
                                        {result.car.image_url ? (
                                            <img src={result.car.image_url} alt={result.car.model} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-4">
                                                <Search className="w-10 h-10" />
                                                <span className="font-medium">Nincs kép</span>
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-emerald-500 dark:bg-emerald-500/90 backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                            <CheckCircle2 className="w-3 h-3" /> Ellenőrzött VIN
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 w-full">
                                    <div className="mb-8 md:mb-10">
                                        <div className="text-slate-500 dark:text-slate-400 font-mono text-xs md:text-sm tracking-widest mb-2 uppercase">
                                            {result.car.make}
                                        </div>
                                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1] md:leading-[0.9] mb-6">
                                            {result.car.model}
                                        </h2>
                                        
                                        <div className="flex flex-wrap gap-2 md:gap-3">
                                            <div className="flex items-center gap-2 bg-white dark:bg-slate-800/80 px-3 py-2 md:px-4 md:py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none">
                                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">VIN</span>
                                                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs md:text-sm font-bold tracking-wider">{result.car.vin}</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-white dark:bg-slate-800/80 px-3 py-2 md:px-4 md:py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none">
                                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Rendszám</span>
                                                <span className="font-mono text-slate-900 dark:text-white text-xs md:text-sm font-bold tracking-wider">{result.car.plate}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                                        <DataItem icon={<Calendar className="w-4 h-4 md:w-5 md:h-5" />} label="Évjárat" value={result.car.year} />
                                        <DataItem icon={<Gauge className="w-4 h-4 md:w-5 md:h-5" />} label="Km óra állás" value={`${result.car.mileage?.toLocaleString()} km`} />
                                        <DataItem icon={<Fuel className="w-4 h-4 md:w-5 md:h-5" />} label="Üzemanyag" value={result.car.fuel_type} />
                                        <DataItem icon={<Settings className="w-4 h-4 md:w-5 md:h-5" />} label="Váltó" value={result.car.transmission} />
                                        <DataItem icon={<Zap className="w-4 h-4 md:w-5 md:h-5" />} label="Teljesítmény" value={result.car.power_hp ? `${result.car.power_hp} LE` : null} sub={result.car.engine_size ? `${result.car.engine_size} cm³` : null} />
                                        <DataItem icon={<Tag className="w-4 h-4 md:w-5 md:h-5" />} label="Kivitel" value={result.car.body_type} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- SZERVIZTÖRTÉNET --- */}
                    <div className="max-w-4xl mx-auto px-2">
                        <div className="flex items-center gap-4 md:gap-6 mb-12 md:mb-16 justify-center text-center">
                            <div className="h-px flex-1 max-w-[100px] bg-slate-200 dark:bg-slate-800"></div>
                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <History className="w-6 h-6 md:w-8 md:h-8 text-slate-400 dark:text-slate-600" /> 
                                Szerviztörténet
                            </h3>
                            <div className="h-px flex-1 max-w-[100px] bg-slate-200 dark:bg-slate-800"></div>
                        </div>

                        <div className="relative">
                            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 md:-translate-x-1/2"></div>
                            <div className="space-y-8 md:space-y-12">
                                {result.events?.map((event: any, i: number) => {
                                    const isLeft = i % 2 === 0;
                                    const date = new Date(event.event_date);
                                    return (
                                        <motion.div 
                                            key={i}
                                            initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true, margin: "-50px" }}
                                            className={`relative flex flex-col md:flex-row items-start md:items-center w-full ${isLeft ? 'md:flex-row-reverse' : ''}`}
                                        >
                                            <div className="hidden md:block w-1/2"></div>
                                            <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-3 h-3 md:w-4 md:h-4 rounded-full border-[2px] md:border-[3px] border-white dark:border-[#0B0F19] z-10 shadow-md dark:shadow-lg mt-6 md:mt-0 bg-slate-900 dark:bg-white flex-shrink-0"></div>
                                            <div className={`w-full md:w-1/2 pl-10 md:pl-0 ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}>
                                                <div className="bg-white dark:bg-[#131722] border border-slate-200 dark:border-slate-800 p-5 md:p-6 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm dark:shadow-xl group relative overflow-hidden">
                                                    
                                                    <div className={`absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br opacity-5 rounded-bl-[3rem] md:rounded-bl-[4rem] transition-opacity group-hover:opacity-10
                                                        ${event.type === 'service' ? 'from-emerald-600 dark:from-emerald-400 to-transparent' : 'from-blue-600 dark:from-blue-400 to-transparent'}`}></div>

                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
                                                        <div>
                                                            <div className="font-mono text-[10px] text-slate-500 mb-1 uppercase tracking-tighter">
                                                                {date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                            </div>
                                                            <div className="text-lg md:text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                                                                {event.title}
                                                            </div>
                                                        </div>
                                                        <div className="self-start bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] md:text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                                                            {event.mileage?.toLocaleString()} km
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {event.description && (
                                                            <div className="flex gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                                                                <Wrench className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                                                                <p className="leading-relaxed">{event.description}</p>
                                                            </div>
                                                        )}
                                                        {event.notes && (
                                                            <div className="flex gap-3 text-xs md:text-sm text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800/50">
                                                                <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 mt-0.5 flex-shrink-0" />
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
                                     <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-10 w-3 h-3 rounded-full bg-emerald-500 shadow-md dark:shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10"></div>
                                     <div className="pl-10 md:pl-0 w-full md:w-auto text-left md:text-center">
                                        <div className="inline-block bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                            Rendszerbe regisztrálva
                                        </div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  )
}