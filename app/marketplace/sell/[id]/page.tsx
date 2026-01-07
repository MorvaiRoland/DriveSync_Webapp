// app/marketplace/sell/[id]/page.tsx
import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Car, ShieldCheck } from 'lucide-react'
import SalesForm from './SalesForm'

export const runtime = 'edge';
export const preferredRegion = 'lhr1'; // Kényszerítjük a Londoni régiót

export default async function SellCarEditorPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return redirect('/login')

  const { data: car } = await supabase
    .from('cars')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!car) return redirect('/marketplace/sell')

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-500 overflow-x-hidden relative">
      
      {/* SAFE AREA PADDING - Notch és Home Bar kezelése */}
      <div className="pt-[calc(env(safe-area-inset-top)+2rem)] pb-[calc(1.5rem+env(safe-area-inset-bottom))] px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-6xl mx-auto">
            
            {/* Navigáció */}
            <div className="mb-6 md:mb-8">
                <Link href="/marketplace/sell" className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                    <ArrowLeft className="w-4 h-4" /> Vissza a választóhoz
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
                
                {/* BAL OLDAL: Autó Info Kártya */}
                {/* Mobilon simán görgethető, LG képernyőn sticky */}
                <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">
                    <div className="relative rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div className="relative h-56 md:h-72">
                             {car.image_url ? (
                                 <Image src={car.image_url} alt={car.model} fill className="object-cover" />
                             ) : (
                                 <div className="bg-slate-800 w-full h-full flex items-center justify-center text-slate-500">
                                     <Car className="w-16 h-16 md:w-20 md:h-20" />
                                 </div>
                             )}
                             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                             <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full">
                                 ID: {car.id.toString()}
                             </div>
                        </div>
                        <div className="p-6 md:p-8">
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 leading-none">{car.make} <span className="text-slate-500 font-medium block text-lg md:text-xl mt-1">{car.model}</span></h2>
                            
                            <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
                                <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">{car.year}</span>
                                <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">{car.mileage.toLocaleString()} km</span>
                                <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700 uppercase">{car.fuel_type || 'N/A'}</span>
                            </div>
                            
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 p-4 md:p-5 rounded-2xl flex items-start gap-3 md:gap-4">
                                <div className="p-2 bg-white dark:bg-amber-900/30 rounded-xl shadow-sm border border-amber-100 dark:border-amber-700/50 shrink-0">
                                    <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Hitelesített Előélet</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                        A hirdetéshez automatikusan csatoljuk az appban vezetett szerviztörténetet (a bizalmas adatok elrejtésével).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* JOBB OLDAL: Kliens oldali Form */}
                <div className="lg:col-span-7">
                    <div className="bg-white dark:bg-slate-900 p-5 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl">
                        <div className="mb-6 md:mb-8 pb-6 md:pb-8 border-b border-slate-100 dark:border-slate-800">
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">Hirdetés Adatlap</h1>
                            <p className="text-sm md:text-base text-slate-500">Töltsd ki a részleteket a publikáláshoz.</p>
                        </div>

                        {/* Itt hívjuk meg a kliens komponenst */}
                        <SalesForm car={car} />
                        
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  )
}