import { createClient } from 'supabase/server'
import { Car, ArrowRight, Store } from 'lucide-react'
import Link from 'next/link'
import { MarketplaceCard } from '@/components/MarketplaceCard'

export default async function MarketplaceSection() {
  const supabase = await createClient()

  // Csak a legfrissebb 3
  const { data: recentCars } = await supabase
    .from('cars')
    .select('*')
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)
    .order('updated_at', { ascending: false })
    .limit(3)

  // ... A return rész ugyanaz marad, mint az előző válaszomban ...
  // Csak a 'db.car.findMany' helyett a 'recentCars' változót használod
  
  return (
      // ... A korábbi JSX kód ...
      // ahol recentCars-on map-elsz végig
      // Ha kell, bemásolom újra a teljes JSX-et.
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl my-10">
        {/* ... */}
        {recentCars && recentCars.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentCars.map((car) => (
                    <MarketplaceCard key={car.id} car={car} />
                ))}
            </div>
        ) : (
            // Üres állapot...
            <div className="text-center py-10">...</div>
        )}
        {/* ... */}
      </div>
  )
}