import { createClient } from '@/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Gauge, Fuel, Info, ShieldCheck, Share2, CheckCircle2 } from 'lucide-react'
import ContactButton from '../components/ContactButton' // Importáljuk a gombot amit az előbb csináltunk
import { Metadata } from 'next'

// Dinamikus renderelés
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>
}

// SEO METADATA GENERÁLÁS (Hogy szép legyen Facebookon/Discordon)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: car } = await supabase
    .from('marketplace_view')
    .select('brand, model, description, main_image')
    .eq('car_id', id)
    .single()

  if (!car) return { title: 'Hirdetés nem található' }

  return {
    title: `Eladó ${car.brand} ${car.model} | DriveSync Piactér`,
    description: car.description?.substring(0, 150) || 'Nézd meg ezt az autót a DriveSync piacterén!',
    openGraph: {
      images: car.main_image ? [car.main_image] : [],
    },
  }
}

export default async function PublicCarAdPage(props: Props) {
  const params = await props.params
  const supabase = await createClient()

  console.log("--- DEBUG START ---")
  console.log("Keresett ID:", params.id)

  // Lekérdezés
  const { data: car, error } = await supabase
    .from('marketplace_view')
    .select('*')
    // FONTOS: Itt feltételezzük, hogy 'car_id' a neve az oszlopnak.
    // Ha nem találja, próbáld meg átírni .eq('id', params.id)-ra!
    .eq('car_id', params.id) 
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)
    .single()

  if (error) console.error("Supabase Error:", error.message)
  console.log("Találat:", car ? "Van autó" : "Nincs autó (null)")
  console.log("--- DEBUG END ---")

  // --- HA NINCS TALÁLAT ---
  if (!car) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 text-center">
            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <Info className="w-10 h-10 text-slate-400" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">A hirdetés nem elérhető</h1>
            <p className="text-slate-500 mb-8 max-w-md">
                Lehet, hogy az autót időközben eladták, az eladó levette a piactérről, vagy érvénytelen a link.
            </p>
            <Link href="/marketplace" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20">
                Vissza a piactérre
            </Link>
        </div>
    )
  }

  // --- HA VAN TALÁLAT ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] pb-20">
        
        {/* FELSŐ SÁV (Sticky) */}
        <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
                <Link href="/marketplace" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-500 font-bold text-sm transition-colors group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> Vissza
                </Link>
                <div className="flex items-center gap-3">
                    <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors" title="Megosztás">
                        <Share2 size={20} />
                    </button>
                    <div className="hidden md:flex items-center gap-1.5 text-xs font-bold bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 size={14} /> Ellenőrzött hirdetés
                    </div>
                </div>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* BAL OSZLOP: TARTALOM (8 col) */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* Kép Doboz */}
                <div className="relative h-80 md:h-[500px] w-full bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 group">
                    {car.main_image ? (
                        <Image 
                            src={car.main_image} 
                            alt={`${car.brand} ${car.model}`} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-700" 
                            priority 
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 flex-col gap-3 bg-slate-100 dark:bg-slate-800">
                             <ShieldCheck size={48} className="opacity-20"/>
                             <span className="font-medium opacity-50">Nincs feltöltött kép</span>
                        </div>
                    )}
                    {/* Ár címke mobilon (képen) */}
                    <div className="absolute bottom-4 left-4 lg:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
                        <span className="text-xl font-black text-slate-900 dark:text-white">
                             {car.price ? `${Number(car.price).toLocaleString()} Ft` : 'Megegyezés szerint'}
                        </span>
                    </div>
                </div>

                {/* Autó Adatai (Grid) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center gap-2">
                        <Calendar className="text-blue-500" size={24} />
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Évjárat</p>
                            <p className="font-bold text-slate-900 dark:text-white">{car.year}</p>
                        </div>
                     </div>
                     <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center gap-2">
                        <Gauge className="text-purple-500" size={24} />
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Futás</p>
                            <p className="font-bold text-slate-900 dark:text-white">{car.mileage ? `${(car.mileage/1000).toFixed(0)}k km` : '-'}</p>
                        </div>
                     </div>
                     <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center gap-2">
                        <Fuel className="text-amber-500" size={24} />
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Üzemanyag</p>
                            <p className="font-bold text-slate-900 dark:text-white">{car.fuel_type || '-'}</p>
                        </div>
                     </div>
                     <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center gap-2">
                        <MapPin className="text-emerald-500" size={24} />
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Helyszín</p>
                            <p className="font-bold text-slate-900 dark:text-white truncate max-w-[100px]">{car.location || '-'}</p>
                        </div>
                     </div>
                </div>

                {/* Leírás */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Info size={24} className="text-blue-500"/> Részletes leírás
                    </h2>
                    <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                        {car.description || 'Az eladó nem fűzött részletes leírást a hirdetéshez.'}
                    </div>
                </div>
            </div>

            {/* JOBB OSZLOP: STICKY SIDEBAR (4 col) */}
            <div className="lg:col-span-4">
                <div className="sticky top-24 space-y-6">
                    
                    {/* Ár és Cím Kártya */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
                        <div className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-6">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
                                {car.brand} <span className="font-normal text-slate-500">{car.model}</span>
                            </h1>
                            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                <MapPin size={16} className="text-slate-400"/> {car.location || 'Helyszín nincs megadva'}
                            </div>
                        </div>

                        <div className="mb-8">
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Vételár</p>
                             <p className="text-4xl font-black text-emerald-600 dark:text-emerald-500 tracking-tight">
                                {car.price ? `${Number(car.price).toLocaleString()} Ft` : 'Megegyezés'}
                             </p>
                        </div>

                        {/* KLIENS KOMPONENS A KAPCSOLATHOZ */}
                        <ContactButton 
                            email={car.contact_email} // Feltételezve, hogy van ilyen mező, vagy user email
                            phone={car.contact_phone} // Feltételezve, hogy van ilyen mező
                        />
                    </div>

                    {/* Biztonsági Tipp */}
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                        <h4 className="font-bold text-amber-800 dark:text-amber-500 text-sm mb-2 flex items-center gap-2">
                            <ShieldCheck size={18}/> Biztonságos vásárlás
                        </h4>
                        <ul className="space-y-2 text-xs text-amber-700/80 dark:text-amber-500/70">
                            <li className="flex gap-2">• Soha ne utalj előre pénzt ismeretlennek.</li>
                            <li className="flex gap-2">• Próbáld ki az autót személyesen.</li>
                            <li className="flex gap-2">• Ellenőrizd az alvázszámot vásárlás előtt.</li>
                        </ul>
                    </div>

                </div>
            </div>

        </div>
    </div>
  )
}