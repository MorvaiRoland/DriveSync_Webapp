// app/marketplace/sell/page.tsx
import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CarFront, CheckCircle2, AlertCircle, ArrowRight, PlusCircle, ArrowLeft } from 'lucide-react'

export const runtime = 'edge';
export const preferredRegion = 'lhr1'; // Kényszerítjük a Londoni régiót

export default async function SellCarSelectorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  // Lekérjük a saját autókat
  const { data: myCars } = await supabase
    .from('cars')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-500 overflow-x-hidden relative">
      
      {/* SAFE AREA PADDING - Notch és Home Bar kezelése */}
      <div className="pt-[calc(env(safe-area-inset-top)+2rem)] pb-[calc(1.5rem+env(safe-area-inset-bottom))] px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-5xl mx-auto">
            
            {/* ÚJ: VISSZA GOMB */}
            <div className="mb-6 md:mb-8">
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 rounded-full"
                >
                    <ArrowLeft className="w-4 h-4" /> Vissza a főoldalra
                </Link>
            </div>

            {/* FEJLÉC */}
            <div className="text-center mb-10 md:mb-16">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 md:mb-6 tracking-tight">
                    Melyik autót szeretnéd <span className="text-amber-500">értékesíteni?</span>
                </h1>
                <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed px-2">
                    Válassz a garázsodból! A rendszerünk automatikusan generál egy hitelesített szervizmúlt jelentést, ami növeli a bizalmat és az eladási árat.
                </p>
            </div>

            {/* AUTÓ GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {myCars && myCars.length > 0 ? (
                    myCars.map((car) => {
                        const isListed = car.is_listed_on_marketplace
                        return (
                            <div key={car.id} className={`group relative bg-white dark:bg-slate-900 rounded-3xl md:rounded-[2rem] overflow-hidden border transition-all duration-300 ${isListed ? 'border-emerald-500/30 shadow-emerald-500/10' : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1'}`}>
                                
                                {/* Kép Szekció */}
                                <div className="relative h-48 md:h-56 bg-slate-100 dark:bg-slate-800">
                                    {car.image_url ? (
                                        <Image src={car.image_url} alt={car.model} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                            <CarFront className="w-12 h-12 md:w-16 md:h-16 opacity-50" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent"></div>
                                    
                                    <div className="absolute bottom-4 md:bottom-5 left-5 md:left-6 right-5 md:right-6 text-white">
                                        <h3 className="font-bold text-xl md:text-2xl tracking-tight mb-1">{car.make} {car.model}</h3>
                                        <p className="text-xs md:text-sm font-mono opacity-80 uppercase tracking-wider">{car.plate}</p>
                                    </div>

                                    {isListed && (
                                        <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] md:text-xs font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                            AKTÍV
                                        </div>
                                    )}
                                </div>

                                {/* Tartalom & Action */}
                                <div className="p-5 md:p-6">
                                    {isListed ? (
                                        <div className="space-y-4">
                                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                                                Ez az autó már elérhető a piactéren.
                                            </p>
                                            <Link 
                                                href={`/marketplace/sell/${car.id}`}
                                                className="block w-full text-center py-3 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                Hirdetés Kezelése
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
                                                <div className="mt-0.5 min-w-[1rem]"><CheckCircle2 className="w-4 h-4 text-amber-500" /></div>
                                                <p className="text-xs text-amber-800 dark:text-amber-400 leading-snug">
                                                    A digitális szervizkönyv automatikusan csatolva lesz.
                                                </p>
                                            </div>
                                            <Link 
                                                href={`/marketplace/sell/${car.id}`}
                                                className="flex items-center justify-center gap-2 w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98]"
                                            >
                                                Hirdetés Feladása <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="col-span-full py-16 md:py-24 text-center bg-white dark:bg-slate-900/50 rounded-3xl md:rounded-[2rem] border-2 border-dashed border-slate-300 dark:border-slate-800 px-4">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">Üres a garázsod</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm md:text-base">
                            Ahhoz, hogy el tudj adni egy autót, először hozzá kell adnod a saját profilodhoz.
                        </p>
                        <Link href="/cars/new" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold transition-all shadow-xl shadow-amber-500/20 active:scale-95 text-sm md:text-base">
                            <PlusCircle className="w-5 h-5" /> Autó Hozzáadása
                        </Link>
                    </div>
                )}
            </div>
        </div>
        
      </div>
    </div>
  )
}