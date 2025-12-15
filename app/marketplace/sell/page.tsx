// app/marketplace/sell/page.tsx
import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CarFront, CheckCircle2, AlertCircle } from 'lucide-react'

export default async function SellCarPage() {
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                Melyik autót szeretnéd <span className="text-amber-500">eladni?</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                Válaszd ki a garázsodból a járművet. Mi automatikusan generálunk egy hitelesített szervizmúlt jelentést hozzá, hogy többet érjen!
            </p>
        </div>

        {/* AUTÓ LISTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCars && myCars.length > 0 ? (
                myCars.map((car) => {
                    const isListed = car.is_listed_on_marketplace
                    return (
                        <div key={car.id} className={`group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border transition-all duration-300 ${isListed ? 'border-emerald-500/50 opacity-80' : 'border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:shadow-xl hover:-translate-y-1'}`}>
                            
                            {/* Kép */}
                            <div className="relative h-48 bg-slate-800">
                                {car.image_url ? (
                                    <Image src={car.image_url} alt={car.model} fill className="object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                                        <CarFront className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 text-white">
                                    <h3 className="font-bold text-xl">{car.make} {car.model}</h3>
                                    <p className="text-sm opacity-80 font-mono">{car.plate}</p>
                                </div>
                            </div>

                            {/* Státusz & Action */}
                            <div className="p-6">
                                {isListed ? (
                                    <div className="flex flex-col items-center justify-center gap-2 py-4 text-emerald-500">
                                        <CheckCircle2 className="w-8 h-8" />
                                        <span className="font-bold">Már hirdetve</span>
                                        <Link href={`/marketplace/sell/${car.id}`} className="text-xs underline text-slate-400 hover:text-white mt-1">Szerkesztés</Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <span>Szervizmúlt elérhető</span>
                                        </div>
                                        <Link 
                                            href={`/marketplace/sell/${car.id}`}
                                            className="block w-full text-center bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20"
                                        >
                                            Hirdetés Feladása →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })
            ) : (
                <div className="col-span-full text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Üres a garázsod</h3>
                    <p className="text-slate-500 mb-6">Először adj hozzá egy autót a profilodhoz.</p>
                    <Link href="/cars/new" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold">
                        Autó Hozzáadása
                    </Link>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}