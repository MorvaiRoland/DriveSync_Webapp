import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, ShieldCheck, Calendar, Gauge, Fuel, MapPin, ArrowRight, CarFront } from 'lucide-react'
import ServiceHistoryList from '@/components/ServiceHistoryList'

export const revalidate = 0

export default async function VerifyPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const carId = params.id;
  const supabase = await createClient()

  // 1. Adatlekérés (Autó + Szervizek)
  const [carRes, historyRes] = await Promise.all([
    supabase
      .from('cars') // Itt lehet, hogy a cars táblából kérdezel, nem a marketplace_view-ból
      .select('*')
      .eq('id', carId)
      .single(),
    supabase
      .from('events')
      .select('id, event_date, title, mileage, cost, type, notes, location, description')
      .eq('car_id', carId)
      .eq('type', 'service')
      .order('event_date', { ascending: false })
  ])

  const car = carRes.data
  const serviceHistory = historyRes.data || []

  if (!car) return notFound()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* FEJLÉC & STÁTUSZ */}
        <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-bold border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
                DynamicSense Verified
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                Jármű Előélet Jelentés
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
                Lekérdezés ideje: {new Date().toLocaleDateString('hu-HU')}
            </p>
        </div>

        {/* AUTÓ KÁRTYA */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
                {car.image_url ? (
                    <Image src={car.image_url} alt={car.model} fill className="object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 flex-col gap-2">
                        <CarFront className="w-12 h-12 opacity-30" />
                        <span className="text-xs font-bold opacity-50">Nincs kép</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                <div className="absolute bottom-4 left-6">
                    <h2 className="text-2xl font-black text-white">{car.make} {car.model}</h2>
                    <p className="text-slate-300 font-mono text-sm">{car.plate}</p>
                </div>
            </div>
            
            <div className="p-6 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Évjárat</p>
                        <p className="font-bold text-slate-900 dark:text-white">{car.year}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <Gauge className="w-5 h-5 text-amber-500" />
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Futás</p>
                        <p className="font-bold text-slate-900 dark:text-white">{car.mileage?.toLocaleString()} km</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <Fuel className="w-5 h-5 text-emerald-500" />
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Üzemanyag</p>
                        <p className="font-bold text-slate-900 dark:text-white capitalize">{car.fuel_type}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">VIN / Alváz</p>
                        <p className="font-bold text-slate-900 dark:text-white font-mono text-xs truncate w-24 sm:w-auto">
                            {car.hide_sensitive ? '*** REJTETT ***' : car.vin}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* SZERVIZTÖRTÉNET */}
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 px-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                Rögzített Szervizek
            </h3>
            
            {/* ITT A JAVÍTOTT HÍVÁS */}
            <ServiceHistoryList 
                events={serviceHistory} 
                hideCosts={car.hide_service_costs || car.hide_prices || false} 
            />
        </div>

        {/* FOOTER */}
        <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                DynamicSense Főoldal <ArrowRight className="w-4 h-4" />
            </Link>
        </div>

      </div>
    </div>
  )
}