import { createClient } from 'supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { addPart, deletePart } from '../actions'

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      
      {/* Fejléc */}
      <div className="bg-slate-900 py-12 px-4 text-center shadow-lg">
         <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-2">
                <Link href={`/cars/${car.id}`} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white text-left">Alkatrész Lista</h1>
                    <p className="text-slate-400 text-sm text-left">{car.make} {car.model} ({car.plate})</p>
                </div>
            </div>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10 space-y-8">
         
         {/* Új Alkatrész Rögzítése */}
         <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700 transition-colors">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Új alkatrész mentése
            </h3>
            <form action={addPart} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <input type="hidden" name="car_id" value={car.id} />
                
                <div className="md:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">Megnevezés *</label>
                    <input type="text" name="name" placeholder="pl. Motorolaj, Olajszűrő" className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm py-2 px-3 shadow-sm focus:border-amber-500 focus:ring-amber-500 transition-colors" required />
                </div>
                <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">Cikkszám / Típus</label>
                    <input type="text" name="part_number" placeholder="pl. 5W-30 / W712" className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm py-2 px-3 shadow-sm focus:border-amber-500 focus:ring-amber-500 transition-colors" />
                </div>
                <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">Márka / Gyártó</label>
                    <input type="text" name="brand" placeholder="pl. Castrol, Mann" className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm py-2 px-3 shadow-sm focus:border-amber-500 focus:ring-amber-500 transition-colors" />
                </div>
                <div className="md:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">Webshop Link (Opcionális)</label>
                    <input type="url" name="shop_url" placeholder="https://..." className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm py-2 px-3 shadow-sm focus:border-amber-500 focus:ring-amber-500 transition-colors" />
                </div>
                <div className="md:col-span-2 pt-2">
                    <button type="submit" className="w-full bg-slate-900 dark:bg-slate-700 text-white font-bold py-2.5 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-md active:scale-[0.99]">Mentés a listára</button>
                </div>
            </form>
         </div>

         {/* Mentett Alkatrészek */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {safeParts.length > 0 ? (
                safeParts.map((part: any) => (
                    <div key={part.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all relative group">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{part.name}</h4>
                                <p className="text-amber-600 dark:text-amber-500 font-medium text-sm">{part.brand}</p>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                {part.part_number || 'N/A'}
                            </div>
                        </div>
                        
                        <div className="mt-4 flex gap-2">
                            {part.shop_url ? (
                                <a href={part.shop_url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 border border-amber-100 dark:border-amber-800/50 text-xs font-bold py-2 rounded-lg text-center hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors flex items-center justify-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    Vásárlás
                                </a>
                            ) : (
                                <div className="flex-1 bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 text-xs font-bold py-2 rounded-lg text-center cursor-not-allowed border border-slate-100 dark:border-slate-600">Nincs link</div>
                            )}
                            
                            <form action={deletePart}>
                                <input type="hidden" name="part_id" value={part.id} />
                                <input type="hidden" name="car_id" value={car.id} />
                                <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 rounded-lg transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </form>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 italic">
                    Még nincs mentett alkatrész.
                </div>
            )}
         </div>

      </div>
    </div>
  )
}