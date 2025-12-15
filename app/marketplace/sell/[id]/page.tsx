// app/marketplace/sell/[id]/page.tsx
import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Car, Banknote, ShieldCheck } from 'lucide-react'
import { publishListing } from './actions'

// JAVÍTÁS: A params típusa mostantól Promise<{ id: string }>
export default async function SellCarForm(props: { params: Promise<{ id: string }> }) {
  // JAVÍTÁS: Itt várjuk be a params-ot
  const params = await props.params;
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return redirect('/login')

  const { data: car } = await supabase
    .from('cars')
    .select('*')
    .eq('id', params.id) // Itt már a feloldott params.id-t használjuk
    .eq('user_id', user.id)
    .single()

  if (!car) return redirect('/marketplace/sell')

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-12 flex justify-center items-start">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* BAL OLDAL: PREVIEW CARD */}
            <div className="space-y-6">
                <Link href="/marketplace/sell" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-4">
                    <ArrowLeft className="w-4 h-4" /> Vissza
                </Link>

                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="relative h-64 md:h-80">
                         {car.image_url ? (
                             <Image src={car.image_url} alt={car.model} fill className="object-cover" />
                         ) : (
                             <div className="bg-slate-800 w-full h-full flex items-center justify-center text-slate-500">
                                 <Car className="w-20 h-20" />
                             </div>
                         )}
                         <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                             VERIFIED OWNER
                         </div>
                    </div>
                    <div className="p-8">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{car.make} {car.model}</h2>
                        <div className="flex flex-wrap gap-2 mb-6">
                            <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs font-mono text-slate-500 font-bold border border-slate-200 dark:border-slate-700">{car.year}</span>
                            <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs font-mono text-slate-500 font-bold border border-slate-200 dark:border-slate-700">{car.mileage.toLocaleString()} km</span>
                            <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs font-mono text-slate-500 font-bold border border-slate-200 dark:border-slate-700">{car.fuel_type || 'Benzin'}</span>
                        </div>
                        
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-start gap-3">
                            <ShieldCheck className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-amber-700 dark:text-amber-500 text-sm">Automata Szervizkönyv</h4>
                                <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-1">
                                    Ez az autó rendelkezik a DynamicSense által hitelesített digitális szerviztörténettel. Ez növeli a bizalmat!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* JOBB OLDAL: ŰRLAP */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl h-fit">
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Hirdetés Beállításai</h1>
                    <p className="text-slate-500 text-sm">A hirdetés azonnal megjelenik a Piactéren.</p>
                </div>

                <form action={publishListing} className="space-y-6">
                    <input type="hidden" name="car_id" value={car.id} />
                    
                    {/* Ár */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Eladási Ár (HUF)</label>
                        <div className="relative">
                            <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input 
                                type="number" 
                                name="price" 
                                placeholder="pl. 3 500 000" 
                                required
                                defaultValue={car.price || ''}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 font-mono text-lg font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Leírás */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Leírás / Megjegyzés</label>
                        <textarea 
                            name="description" 
                            rows={5} 
                            placeholder="Írj pár sort az állapotról, extrákról..."
                            defaultValue={car.description || ''}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"
                        ></textarea>
                    </div>

                    {/* Kapcsolat Infó */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Kapcsolattartó Telefonszám</label>
                        <input 
                            type="tel" 
                            name="contact_phone" 
                            placeholder="+36 30 123 4567" 
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                        />
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" name="is_public" className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500" defaultChecked={car.is_listed_on_marketplace} />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-amber-500 transition-colors">
                                Publikálom a hirdetést a Piactéren
                            </span>
                        </label>
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black py-4 rounded-xl shadow-xl shadow-orange-500/20 transform hover:-translate-y-1 transition-all">
                        {car.is_listed_on_marketplace ? 'Hirdetés Frissítése' : 'Mehet a Piactérre! 🚀'}
                    </button>
                    
                    <p className="text-xs text-center text-slate-400 mt-4">
                        A "Mehet" gombra kattintva elfogadod az ÁSZF-et.
                    </p>
                </form>
            </div>
        </div>
    </div>
  )
}