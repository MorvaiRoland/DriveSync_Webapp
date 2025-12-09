// FILE: app/verify/[id]/page.tsx

import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Image from 'next/image'

// Ez a kliens a publikus adatok lekéréséhez kell (Service Role)
// Ellenőrizd, hogy a .env.local fájlban benne van-e a SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// --- JAVÍTÁS: A params típusa Promise (Next.js 15 szabvány) ---
type Props = {
  params: Promise<{ id: string }>
}

export default async function VerifyPage(props: Props) {
  // --- JAVÍTÁS: Megvárjuk az adatot (await) ---
  const params = await props.params
  const { id } = params

  // 1. Autó lekérése (Service Role klienssel, hogy ne kelljen bejelentkezni)
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
      <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 mb-8 shadow-sm">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        DriveSync Hitelesített Jármű
      </div>

      <div className="bg-white max-w-2xl w-full rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Fejléc */}
        <div className="h-32 bg-slate-900 relative flex items-center justify-center">
            {car.image_url && <Image src={car.image_url} alt="Car" fill className="object-cover opacity-50" />}
            <div className="relative z-10 text-center">
                <h1 className="text-3xl font-black text-white">{car.make} {car.model}</h1>
                <p className="text-amber-500 font-mono font-bold">{car.plate}</p>
            </div>
        </div>

        <div className="p-8">
            <div className="grid grid-cols-2 gap-4 mb-8 text-center">
                <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-xs text-slate-400 uppercase font-bold">Futásteljesítmény</p>
                    <p className="text-xl font-black text-slate-800">{car.mileage.toLocaleString()} km</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-xs text-slate-400 uppercase font-bold">Évjárat</p>
                    <p className="text-xl font-black text-slate-800">{car.year}</p>
                </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Rögzített Szerviztörténet</h2>
            
            <div className="space-y-4">
                {events && events.length > 0 ? events.map((event: any) => (
                    <div key={event.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                        <div>
                            <p className="font-bold text-slate-800">{event.title || 'Szerviz'}</p>
                            <p className="text-xs text-slate-500">{new Date(event.event_date).toLocaleDateString('hu-HU')}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-sm font-bold text-slate-600">{event.mileage ? `${event.mileage} km` : ''}</p>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-slate-400 italic">Nincs rögzített adat.</p>
                )}
            </div>
        </div>
        
        <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t border-slate-100">
            Ez az oldal a DriveSync rendszeréből generálódott valós idejű adatok alapján.
        </div>
      </div>
    </div>
  )
}