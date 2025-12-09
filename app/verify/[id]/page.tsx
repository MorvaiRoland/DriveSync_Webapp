// FILE: app/verify/[id]/page.tsx

import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import ServiceHistoryList from '@/components/ServiceHistoryList' // <--- ÚJ IMPORT

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Props = {
  params: Promise<{ id: string }>
}

export default async function VerifyPage(props: Props) {
  const params = await props.params
  const { id } = params

  // 1. Autó lekérése
  const { data: car } = await supabaseAdmin
    .from('cars')
    .select('*')
    .eq('id', id)
    .single()

  if (!car) return notFound()

  // 2. Szervizek lekérése
  const { data: events } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('car_id', car.id)
    .in('type', ['service', 'repair', 'maintenance'])
    .order('event_date', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 font-sans text-slate-900">
      
      {/* Hitelesítés Badge */}
      <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 mb-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        DriveSync Hitelesített Jármű
      </div>

      <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Fejléc */}
        <div className="h-40 bg-slate-900 relative flex items-center justify-center">
            {car.image_url && <Image src={car.image_url} alt="Car" fill className="object-cover opacity-40" />}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90"></div>
            <div className="relative z-10 text-center p-4">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">{car.make} <span className="text-amber-500">{car.model}</span></h1>
                <p className="text-slate-300 font-mono font-bold mt-1 text-lg bg-white/10 inline-block px-3 py-1 rounded-lg border border-white/10 backdrop-blur-sm">{car.plate}</p>
            </div>
        </div>

        <div className="p-6 md:p-8">
            {/* Statisztika Sáv */}
            <div className="grid grid-cols-2 gap-4 mb-8 text-center">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Futásteljesítmény</p>
                    <p className="text-xl md:text-2xl font-black text-slate-800">{car.mileage.toLocaleString()} km</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Évjárat</p>
                    <p className="text-xl md:text-2xl font-black text-slate-800">{car.year}</p>
                </div>
            </div>

            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <h2 className="text-lg font-bold text-slate-900">Rögzített Szerviztörténet</h2>
            </div>
            
            {/* ITT HASZNÁLJUK AZ ÚJ LISTA KOMPONENST */}
            <ServiceHistoryList events={events || []} />

        </div>
        
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-2">Ez az oldal a DriveSync rendszeréből generálódott valós idejű adatok alapján.</p>
            <p className="text-[10px] text-slate-300 font-mono">{new Date().getFullYear()} © DriveSync Technologies</p>
        </div>
      </div>
    </div>
  )
}