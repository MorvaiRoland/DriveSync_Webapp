'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Search, ShieldCheck, Calendar, Gauge, Wrench, AlertCircle, CheckCircle2 } from 'lucide-react'
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
      .eq('is_public_history', true) // FONTOS: Csak a publikusat!
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

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-500/30">
        
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-20">
        
        {/* Header */}
        <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                <ShieldCheck className="w-3 h-3" /> Digitális Szervizkönyv
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
                Alvázszám <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Lekérdezés</span>
            </h1>
            <p className="text-slate-400">
                Ellenőrizd a DynamicSense rendszerében vezetett előéletet.
            </p>
        </div>

        {/* Kereső */}
        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-16">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex bg-slate-900 rounded-xl p-2 border border-slate-800">
                    <input 
                        type="text" 
                        value={vin}
                        onChange={(e) => setVin(e.target.value.toUpperCase())}
                        placeholder="Írd be az alvázszámot (VIN)..."
                        className="w-full bg-transparent text-white placeholder-slate-500 font-mono text-lg px-4 py-3 focus:outline-none uppercase"
                        maxLength={17}
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-white text-slate-950 font-bold px-6 py-3 rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-2"
                    >
                        {loading ? 'Keresés...' : <><Search className="w-5 h-5" /> Keresés</>}
                    </button>
                </div>
            </div>
            {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5" /> {error}
                </div>
            )}
        </form>

        {/* Eredmények */}
        <AnimatePresence>
            {result && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Autó Kártya */}
                    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
                        <div className="relative w-full md:w-1/3 aspect-video bg-slate-800 rounded-2xl overflow-hidden border border-white/10">
                            {result.car.image_url ? (
                                <img src={result.car.image_url} alt="Car" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600">Nincs kép</div>
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl font-black text-white mb-2">{result.car.make} {result.car.model}</h2>
                            <div className="font-mono text-amber-500 font-bold tracking-widest text-lg mb-6">{result.car.vin}</div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                                    <div className="text-slate-400 text-xs uppercase font-bold mb-1">Évjárat</div>
                                    <div className="text-white font-bold flex items-center gap-2 justify-center md:justify-start">
                                        <Calendar className="w-4 h-4 text-emerald-500" /> {result.car.year}
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                                    <div className="text-slate-400 text-xs uppercase font-bold mb-1">Futás</div>
                                    <div className="text-white font-bold flex items-center gap-2 justify-center md:justify-start">
                                        <Gauge className="w-4 h-4 text-emerald-500" /> {result.car.mileage.toLocaleString()} km
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="relative border-l-2 border-slate-800 ml-4 md:ml-8 space-y-8 pb-12">
                        <h3 className="text-xl font-bold text-white pl-8 mb-6">Rögzített Történet</h3>
                        
                        {result.events?.map((event: any, i: number) => (
                            <div key={i} className="relative pl-8 group">
                                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-slate-950 ${event.type === 'service' ? 'bg-amber-500' : 'bg-slate-600'}`}></div>
                                
                                <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl hover:border-amber-500/30 transition-colors">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-2">
                                        <span className="font-bold text-white text-lg">{event.title}</span>
                                        <span className="text-slate-400 text-sm font-mono bg-slate-950 px-2 py-1 rounded">
                                            {new Date(event.event_date).toLocaleDateString('hu-HU')}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                                        <span className="flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5" /> {event.mileage.toLocaleString()} km</span>
                                        {event.type === 'service' && <span className="flex items-center gap-1.5 text-amber-500"><Wrench className="w-3.5 h-3.5" /> Szerviz</span>}
                                    </div>

                                    {event.notes && (
                                        <p className="text-slate-300 text-sm mt-3 pt-3 border-t border-slate-800 italic">
                                            "{event.notes}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {(!result.events || result.events.length === 0) && (
                            <div className="pl-8 text-slate-500 italic">Nincs rögzített esemény.</div>
                        )}
                        
                        {/* Start pont */}
                        <div className="relative pl-8">
                             <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-slate-950 bg-emerald-500"></div>
                             <div className="text-emerald-500 font-bold text-sm">Rendszerbe regisztrálva</div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  )
}