'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Search, ShieldCheck, Calendar, Gauge, Wrench, AlertCircle, CheckCircle2, Info, Fuel, Zap, Settings, Tag, FileText, History, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function VinCheckPage() {
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

    // 1. Autó keresése
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

    // 2. Szerviztörténet
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('car_id', car.id)
      .order('event_date', { ascending: false })

    setResult({ car, events })
    setLoading(false)
  }

  // --- UI Components ---
  
  const DataItem = ({ icon, label, value, sub }: any) => (
      <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
          <div className="p-3 rounded-xl bg-slate-900 text-slate-400 group-hover:text-emerald-400 transition-colors shadow-inner">
              {icon}
          </div>
          <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</div>
              <div className="text-base font-bold text-white leading-tight">{value || '-'}</div>
              {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
          </div>
      </div>
  )

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
        
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-indigo-600/5 rounded-full blur-[150px] animate-pulse-slow"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-emerald-600/5 rounded-full blur-[150px]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-24">
        
        {/* Header */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
        >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/50 border border-slate-700/50 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md shadow-lg">
                <ShieldCheck className="w-3.5 h-3.5" /> Hitelesített Adatlap
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-white">
                Alvázszám <br className="md:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Lekérdezés</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                A DynamicSense rendszerében vezetett valós előélet. <br className="hidden md:block"/>
                Nincs több zsákbamacska, csak tiszta adatok.
            </p>
        </motion.div>

        {/* Search Bar */}
        <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSearch} 
            className="relative max-w-2xl mx-auto mb-24 z-20"
        >
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative flex items-center bg-[#131722] rounded-2xl p-2 border border-slate-800 shadow-2xl">
                    <Search className="w-6 h-6 text-slate-500 ml-4 mr-2" />
                    <input 
                        type="text" 
                        value={vin}
                        onChange={(e) => setVin(e.target.value.toUpperCase())}
                        placeholder="Írd be a 17 jegyű alvázszámot..."
                        className="w-full bg-transparent text-white placeholder-slate-600 font-mono text-lg md:text-xl px-2 py-4 focus:outline-none uppercase tracking-widest"
                        maxLength={17}
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-white text-slate-950 font-bold px-8 py-4 rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center gap-3 text-red-400"
                    >
                        <AlertCircle className="w-5 h-5" /> {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.form>

        {/* Result Area */}
        <AnimatePresence>
            {result && (
                <motion.div 
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 50 }}
                    className="space-y-20"
                >
                    {/* --- CAR HEADER --- */}
                    <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-b from-slate-900 to-[#0F131F] border border-slate-800 shadow-2xl">
                        
                        {/* Hero Image Background */}
                        {result.car.image_url && (
                            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                                <img src={result.car.image_url} alt="" className="w-full h-full object-cover blur-3xl scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0F131F] via-[#0F131F]/80 to-transparent"></div>
                            </div>
                        )}

                        <div className="relative z-10 p-8 md:p-12 lg:p-16">
                            
                            <div className="flex flex-col lg:flex-row gap-12 items-start">
                                {/* Car Image Card */}
                                <div className="w-full lg:w-5/12">
                                    <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-slate-800 border border-white/10 shadow-2xl group">
                                        {result.car.image_url ? (
                                            <img src={result.car.image_url} alt={result.car.model} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                                                <div className="p-6 bg-slate-900/50 rounded-full"><Search className="w-10 h-10" /></div>
                                                <span className="font-medium">Nincs kép feltöltve</span>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3 h-3" /> Ellenőrzött VIN
                                        </div>
                                    </div>
                                </div>

                                {/* Car Details */}
                                <div className="flex-1 w-full">
                                    <div className="mb-10">
                                        <div className="text-slate-400 font-mono text-sm tracking-widest mb-2 uppercase">
                                            {result.car.make}
                                        </div>
                                        <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-6">
                                            {result.car.model}
                                        </h2>
                                        
                                        <div className="flex flex-wrap gap-3">
                                            <div className="inline-flex items-center gap-2 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/50">
                                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">VIN</span>
                                                <span className="font-mono text-emerald-400 font-bold tracking-widest">{result.car.vin}</span>
                                            </div>
                                            <div className="inline-flex items-center gap-2 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/50">
                                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Rendszám</span>
                                                <span className="font-mono text-white font-bold tracking-widest">{result.car.plate}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <DataItem icon={<Calendar className="w-5 h-5" />} label="Évjárat" value={result.car.year} />
                                        <DataItem icon={<Gauge className="w-5 h-5" />} label="Futásteljesítmény" value={`${result.car.mileage.toLocaleString()} km`} />
                                        <DataItem icon={<Fuel className="w-5 h-5" />} label="Üzemanyag" value={result.car.fuel_type} />
                                        <DataItem icon={<Settings className="w-5 h-5" />} label="Váltó" value={result.car.transmission} />
                                        <DataItem icon={<Zap className="w-5 h-5" />} label="Teljesítmény" value={result.car.power_hp ? `${result.car.power_hp} LE` : null} sub={result.car.engine_size ? `${result.car.engine_size} cm³` : null} />
                                        <DataItem icon={<Tag className="w-5 h-5" />} label="Kivitel" value={result.car.body_type} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- TIMELINE SECTION --- */}
                    <div className="max-w-4xl mx-auto">
                         <div className="flex items-center gap-6 mb-16 justify-center">
                            <div className="h-px w-24 bg-gradient-to-r from-transparent to-slate-800"></div>
                            <h3 className="text-3xl font-black text-white flex items-center gap-3">
                                <History className="w-8 h-8 text-slate-600" /> 
                                Szerviztörténet
                            </h3>
                            <div className="h-px w-24 bg-gradient-to-l from-transparent to-slate-800"></div>
                        </div>

                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-slate-800 md:-translate-x-1/2"></div>

                            <div className="space-y-12">
                                {result.events?.map((event: any, i: number) => {
                                    const isLeft = i % 2 === 0;
                                    const date = new Date(event.event_date);
                                    
                                    return (
                                        <motion.div 
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: "-100px" }}
                                            transition={{ delay: i * 0.1 }}
                                            className={`relative flex flex-col md:flex-row items-start md:items-center w-full ${isLeft ? 'md:flex-row-reverse' : ''}`}
                                        >
                                            
                                            {/* Üres oldal */}
                                            <div className="hidden md:block w-1/2"></div>

                                            {/* Középső Dot */}
                                            <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full border-[3px] border-[#0B0F19] z-10 shadow-lg mt-6 md:mt-0
                                                bg-white"
                                            ></div>

                                            {/* Kártya */}
                                            <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}>
                                                <div className="bg-[#131722] border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all shadow-xl group relative overflow-hidden">
                                                    
                                                    {/* Kártya dekoráció */}
                                                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br opacity-5 rounded-bl-[4rem] transition-opacity group-hover:opacity-10
                                                        ${event.type === 'service' ? 'from-emerald-400 to-transparent' : 'from-blue-400 to-transparent'}`}></div>

                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <div className="font-mono text-xs text-slate-500 mb-1">
                                                                {date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                            </div>
                                                            <div className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                                {event.title}
                                                            </div>
                                                        </div>
                                                        <div className="bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 text-xs font-mono font-bold text-slate-300">
                                                            {event.mileage.toLocaleString()} km
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {event.description && (
                                                            <div className="flex gap-3 text-sm text-slate-300">
                                                                <Wrench className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                                                <p className="leading-relaxed">{event.description}</p>
                                                            </div>
                                                        )}
                                                        {event.notes && (
                                                            <div className="flex gap-3 text-sm text-slate-400 italic bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                                                                <Info className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                                                                <p>"{event.notes}"</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}

                                {/* Start Pont */}
                                <div className="relative flex flex-col items-center pt-8">
                                     <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-10 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10"></div>
                                     <div className="pl-16 md:pl-0">
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
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