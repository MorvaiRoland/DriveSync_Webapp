import { createClient } from 'supabase/server'
import { MarketplaceCard } from '@/components/MarketplaceCard'
import { Store, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function MarketplacePage() {
  const supabase = await createClient()

  // Lekérjük az autókat
  const { data: cars, error } = await supabase
    .from('marketplace_view')
    .select('*')
    .eq('is_for_sale', true)
    .eq('is_listed_on_marketplace', true)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error("Hiba a lekérdezésben:", error)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Vissza a főoldalra
                </Link>
                <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                    <Store className="w-8 h-8 text-amber-500" />
                    DynamicSense Piactér
                </h1>
            </div>
        </div>

        {/* Ellenőrizzük, hogy van-e adat */}
        {cars && cars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cars.map((car) => (
                    <MarketplaceCard key={car.id} car={car} />
                ))}
            </div>
        ) : (
            <div className="py-20 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
                <Store className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-300">Jelenleg nincs eladó autó</h3>
            </div>
        )}

      </div>
    </div>
  )
}