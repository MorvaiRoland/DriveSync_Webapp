'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Search, ShieldCheck, Calendar, Gauge, Wrench, AlertCircle, CheckCircle2, Info, Fuel, Zap, Settings, Tag, FileText, History } from 'lucide-react'
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

    // 1. Autó keresése (CSAK HA PUBLIKUS!)
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

    // 2. Szerviztörténet lekérése
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('car_id', car.id)
      .order('event_date', { ascending: false })

    setResult({ car, events })
    setLoading(false)
  }

  // Helper komponens a kis adatblokkokhoz
  const DataCard = ({ icon, label, value }: any) => (
      <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-slate-700/50 rounded-lg text-slate-400">
              {icon}
          </div>
          <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{label}</div>
              <div className="text-sm font-bold text-white">{value || '-'}</div>
          </div>
      </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-500/30 pb-20">
        
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-20">
        
        {/* Header */}
        <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                <ShieldCheck className="w-3 h-3" /> Hitelesített DynamicSense Adatlap
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                Alvázszám <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Lekérdezés</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
                Ismerd meg az autó valós történetét. Szervizek, futásteljesítmény és műszaki adatok egy helyen.
            </p>
        </div>

        {/* Kereső */}
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-20">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex bg-slate-900 rounded-xl p-2 border border-slate-800 shadow-2xl">
                    <input 
                        type="text" 
                        value={vin}
                        onChange={(e) => setVin(e.target.value.toUpperCase())}
                        placeholder="Írd be az alvázszámot (VIN)..."
                        className="w-full bg-transparent text-white placeholder-slate-500 font-mono text-lg px-4 py-3 focus:outline-none uppercase tracking-wide"
                        maxLength={17}
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-white text-slate-950 font-bold px-8 py-3 rounded-lg hover:bg-amber-400 transition-all flex items-center gap-2 shadow-lg"
                    >
                        {loading ? 'Keresés...' : <><Search className="w-5 h-5" /> Keresés</>}
                    </button>
                </div>
            </div>
            {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" /> 
                    <span className="font-medium">{error}</span>
                </div>
            )}
        </form>

        {/* Eredmények */}
        <AnimatePresence>
            {result && (
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-12"
                >
                    {/* --- AUTÓ FŐ ADATLAP --- */}
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        
                        {/* Felső sáv: Kép és Címsor */}
                        <div className="flex flex-col lg:flex-row">
                            {/* Kép */}
                            <div className="w-full lg:w-2/5 aspect-video lg:aspect-auto relative bg-slate-800 border-b lg:border-b-0 lg:border-r border-slate-800">
                                {result.car.image_url ? (
                                    <img src={result.car.image_url} alt="Car" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                                        <div className="p-4 bg-slate-800 rounded-full"><Search className="w-8 h-8" /></div>
                                        <span>Nincs feltöltött kép</span>
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                    Ellenőrzött
                                </div>
                            </div>

                            {/* Fő adatok */}
                            <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center">
                                <div className="mb-6">
                                    <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                                        {result.car.make} <span className="text-slate-500">{result.car.model}</span>
                                    </h2>
                                    <div className="inline-flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50">
                                        <span className="text-slate-400 text-xs font-bold uppercase">VIN:</span>
                                        <span className="font-mono text-amber-500 font-bold text-lg tracking-widest">{result.car.vin}</span>
                                    </div>
                                </div>

                                {/* Adatok Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <DataCard icon={<Calendar className="w-4 h-4" />} label="Évjárat" value={result.car.year} />
                                    <DataCard icon={<Gauge className="w-4 h-4" />} label="Futásteljesítmény" value={`${result.car.mileage.toLocaleString()} km`} />
                                    <DataCard icon={<Fuel className="w-4 h-4" />} label="Üzemanyag" value={result.car.fuel_type} />
                                    <DataCard icon={<Settings className="w-4 h-4" />} label="Váltó" value={result.car.transmission} />
                                    <DataCard icon={<Zap className="w-4 h-4" />} label="Teljesítmény" value={result.car.power_hp ? `${result.car.power_hp} LE` : null} />
                                    <DataCard icon={<Tag className="w-4 h-4" />} label="Kivitel" value={result.car.body_type} />
                                    <DataCard icon={<FileText className="w-4 h-4" />} label="Rendszám" value={result.car.plate} />
                                    <DataCard icon={<Calendar className="w-4 h-4" />} label="Műszaki" value={result.car.mot_expiry} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- IDŐVONAL --- */}
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-800"></div>
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                <History className="w-6 h-6 text-slate-400" /> Eseménytörténet
                            </h3>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-800"></div>
                        </div>

                        <div className="relative border-l-2 border-slate-800 ml-4 md:ml-0 md:pl-0 space-y-12">
                            
                            {/* Desktopon középre rendezett timeline trükk */}
                            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-800 -translate-x-1/2"></div>

                            {result.events?.map((event: any, i: number) => {
                                const isService = event.type === 'service';
                                const isLeft = i % 2 === 0;

                                return (
                                    <div key={i} className={`relative md:flex items-center justify-between ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                                        
                                        {/* Középső pötty */}
                                        <div className="absolute left-[-5px] md:left-1/2 md:-translate-x-1/2 top-6 md:top-1/2 md:-translate-y-1/2 w-4 h-4 rounded-full border-4 border-slate-950 z-10 bg-slate-600 shadow-[0_0_10px_rgba(0,0,0,0.5)] data-[type=service]:bg-amber-500" data-type={event.type}></div>

                                        {/* Üres oldal a timeline-on */}
                                        <div className="hidden md:block w-1/2"></div>

                                        {/* Tartalom Kártya */}
                                        <div className={`w-full md:w-[45%] ml-8 md:ml-0 ${isLeft ? 'md:pr-8' : 'md:pl-8'}`}>
                                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all shadow-lg group">
                                                
                                                {/* Fejléc */}
                                                <div className="flex flex-wrap justify-between items-start gap-2 mb-4 border-b border-slate-800/50 pb-4">
                                                    <div>
                                                        <div className="font-bold text-white text-lg group-hover:text-amber-500 transition-colors">{event.title}</div>
                                                        <div className="text-slate-500 text-xs font-mono uppercase tracking-wider">{event.type === 'service' ? 'Karbantartás' : event.type === 'fuel' ? 'Tankolás' : 'Egyéb'}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-white font-bold font-mono">{new Date(event.event_date).toLocaleDateString('hu-HU')}</div>
                                                        <div className="text-slate-500 text-xs font-mono">{event.mileage.toLocaleString()} km</div>
                                                    </div>
                                                </div>

                                                {/* Részletek (Description & Notes) */}
                                                <div className="space-y-3 text-sm text-slate-300">
                                                    {event.description && (
                                                        <div className="flex gap-3">
                                                            <Wrench className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                                                            <p>{event.description}</p>
                                                        </div>
                                                    )}
                                                    
                                                    {event.notes && (
                                                        <div className="flex gap-3">
                                                            <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                                                            <p className="italic text-slate-400">"{event.notes}"</p>
                                                        </div>
                                                    )}

                                                    {/* Ár elrejtve, de helyette jelezhetjük, hogy rögzítve van */}
                                                    {event.cost > 0 && (
                                                        <div className="flex gap-2 items-center mt-2 pt-2 border-t border-slate-800/50">
                                                            <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
                                                                Költség rögzítve
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            {(!result.events || result.events.length === 0) && (
                                <div className="text-center py-10 text-slate-500 italic">
                                    Ehhez az autóhoz még nem rögzítettek eseményt a rendszerben.
                                </div>
                            )}
                            
                            {/* Start pont */}
                            <div className="relative md:flex justify-center pt-8">
                                 <div className="absolute left-[-5px] md:left-1/2 md:-translate-x-1/2 top-10 w-4 h-4 rounded-full border-4 border-slate-950 bg-emerald-500 z-10"></div>
                                 <div className="ml-8 md:ml-0 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest inline-block">
                                    Rendszerbe regisztrálva
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