import { createClient } from '@/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { addPart, deletePart } from '../actions'
import { Package, ArrowLeft, Plus, ExternalLink, Trash2, ShoppingCart, Info } from 'lucide-react'

export default async function PartsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  const { data: car } = await supabase.from('cars').select('*').eq('id', params.id).single()
  
  if (!car) return notFound()

  const { data: parts } = await supabase
    .from('parts')
    .select('*')
    .eq('car_id', params.id)
    .order('name', { ascending: true })

  const safeParts = parts || []

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500 selection:bg-amber-500/30 selection:text-amber-600 relative overflow-x-hidden">
      
      {/* SAFE AREA BOTTOM PADDING - Home Bar kezelése */}
      <div className="pb-[calc(5rem+env(safe-area-inset-bottom))]">

        {/* HÁTTÉR EFFEKTEK */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[80px] md:blur-[120px] animate-pulse-slow"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
        </div>

        {/* --- HERO HEADER --- */}
        {/* SAFE AREA TOP PADDING - Notch kezelése */}
        <div className="relative pt-[calc(env(safe-area-inset-top)+2rem)] pb-8 md:pb-12 px-4">
          <div className="max-w-4xl mx-auto text-center relative z-10">
              <Link href={`/cars/${car.id}`} className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 text-xs md:text-sm font-bold bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-800/80 shadow-sm">
                  <ArrowLeft className="w-4 h-4" /> Vissza az autóhoz
              </Link>
              
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                  Alkatrész <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 block md:inline">Lista</span>
              </h1>
              
              <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {car.make} {car.model} ({car.plate})
              </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-4 relative z-20 space-y-6 md:space-y-8">
            
            {/* ÚJ ALKATRÉSZ RÖGZÍTÉSE (LIQUID CARD) */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl md:rounded-[2.5rem] shadow-2xl p-5 md:p-10 border border-white/20 dark:border-slate-700 relative overflow-hidden group">
              
              {/* Dekoráció */}
              <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 md:-mr-16 md:-mt-16 pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-700"></div>

              <h3 className="font-bold text-lg md:text-xl mb-6 md:mb-8 flex items-center gap-3 text-slate-900 dark:text-white relative z-10">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-sm shrink-0">
                      <Package className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  Új alkatrész mentése
              </h3>

              <form action={addPart} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative z-10">
                  <input type="hidden" name="car_id" value={car.id} />
                  
                  <div className="md:col-span-2">
                      <InputGroup label="Megnevezés" name="name" placeholder="pl. Motorolaj, Olajszűrő" required />
                  </div>
                  <InputGroup label="Cikkszám / Típus" name="part_number" placeholder="pl. 5W-30 / W712" />
                  <InputGroup label="Márka / Gyártó" name="brand" placeholder="pl. Castrol, Mann" />
                  
                  <div className="md:col-span-2">
                      <InputGroup label="Webshop Link (Opcionális)" name="shop_url" type="url" placeholder="https://..." icon={<ShoppingCart className="w-4 h-4" />} />
                  </div>
                  
                  <div className="md:col-span-2 pt-2 md:pt-4">
                      <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 md:py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group/btn">
                          <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-300" />
                          Mentés a listára
                      </button>
                  </div>
              </form>
            </div>

            {/* MENTETT ALKATRÉSZEK LISTÁJA */}
            <div className="space-y-4">
              <h3 className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">Mentett Tételek ({safeParts.length})</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {safeParts.length > 0 ? (
                      safeParts.map((part: any) => (
                          <div key={part.id} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-5 md:p-6 rounded-3xl md:rounded-[2rem] border border-white/40 dark:border-slate-700/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group flex flex-col h-full">
                              
                              <div className="flex justify-between items-start mb-4">
                                  <div className="flex-1 min-w-0 pr-4">
                                      <h4 className="font-bold text-slate-900 dark:text-white text-base md:text-lg truncate mb-1" title={part.name}>{part.name}</h4>
                                      <div className="flex items-center gap-2 text-sm">
                                          <span className="font-medium text-xs md:text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                                              {part.brand || 'Márka N/A'}
                                          </span>
                                      </div>
                                  </div>
                                  <div className="bg-slate-100 dark:bg-slate-800 px-2 md:px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0">
                                      {part.part_number || 'N/A'}
                                  </div>
                              </div>
                              
                              <div className="mt-auto pt-4 flex gap-2 md:gap-3 border-t border-slate-100 dark:border-slate-800/50">
                                  {part.shop_url ? (
                                      <a href={part.shop_url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold py-2.5 rounded-xl text-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all flex items-center justify-center gap-2 group/link shadow-sm">
                                          <ExternalLink className="w-3.5 h-3.5 group-hover/link:scale-110 transition-transform" />
                                          Vásárlás
                                      </a>
                                  ) : (
                                      <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 text-xs font-bold py-2.5 rounded-xl text-center cursor-not-allowed border border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2">
                                          <Info className="w-3.5 h-3.5" />
                                          Nincs link
                                      </div>
                                  )}
                                  
                                  <form action={deletePart}>
                                      <input type="hidden" name="part_id" value={part.id} />
                                      <input type="hidden" name="car_id" value={car.id} />
                                      <button className="h-full px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 rounded-xl transition-all shadow-sm group/trash hover:bg-red-50 dark:hover:bg-red-900/20" title="Törlés">
                                          <Trash2 className="w-4 h-4 group-hover/trash:scale-110 transition-transform" />
                                      </button>
                                  </form>
                              </div>
                          </div>
                      ))
                  ) : (
                      <div className="col-span-full py-12 md:py-16 text-center rounded-3xl md:rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
                          <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                              <Package className="w-7 h-7 md:w-8 md:h-8 opacity-50" />
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">Még nincs mentett alkatrész.</p>
                          <p className="text-slate-400 dark:text-slate-500 text-xs md:text-sm mt-1">Adj hozzá egyet fentről!</p>
                      </div>
                  )}
              </div>
            </div>

        </div>
      </div>
    </div>
  )
}

// --- REUSABLE COMPONENTS ---

function InputGroup({ label, name, type = "text", placeholder, required = false, icon }: any) {
    return (
      <div className="space-y-1.5 md:space-y-2 group">
        <label htmlFor={name} className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
          {label} {required && <span className="text-emerald-500">*</span>}
        </label>
        
        <div className="relative flex items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 focus-within:shadow-lg focus-within:shadow-emerald-500/5 hover:border-slate-300 dark:hover:border-slate-600">
          {icon && (
            <div className="pl-4 pr-2 text-slate-400 group-focus-within:text-emerald-500 transition-colors shrink-0">
              {icon}
            </div>
          )}
          
          <input 
              type={type} 
              name={name} 
              id={name} 
              required={required} 
              placeholder={placeholder} 
              className={`
                  w-full bg-transparent border-none py-3 md:py-3.5 text-base md:text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 focus:outline-none
                  ${!icon && 'pl-4'}
              `} 
              // FONTOS: 'text-base' mobilon (megakadályozza a zoomolást), 'md:text-sm' asztali gépen.
          />
        </div>
      </div>
    )
}