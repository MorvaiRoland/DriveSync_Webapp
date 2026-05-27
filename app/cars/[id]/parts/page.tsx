import { createClient } from '@/supabase/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { addPart, deletePart } from '../actions'
import { Package, ArrowLeft, Plus, ExternalLink, Trash2, ShoppingCart, Info } from 'lucide-react'
import { getSubscriptionStatus, PLAN_LIMITS } from '@/utils/subscription'
import { AuroraBackground, DashboardNav, BottomNav } from '@/components/SharedNavigation'
import { signOut } from '@/app/login/action'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata(props: Props) {
  const params = await props.params
  const supabase = await createClient()
  const { data: car } = await supabase.from('cars').select('make, model').eq('id', params.id).single()
  return {
    title: car ? `${car.make} ${car.model} | Alkatrészek` : 'Alkatrészek | DynamicSense',
    description: 'Jármű alkatrész katalógus és cikkszámok.'
  }
}

function Glass({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`
      bg-white/60 dark:bg-white/[0.04]
      border border-white/70 dark:border-white/[0.08]
      backdrop-blur-xl shadow-sm
      ${className}
    `}>
      {children}
    </div>
  )
}

export default async function PartsPage(props: Props) {
  const params = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const { data: carData, error: carError } = await supabase
    .from('cars')
    .select('*, car_shares(email)')
    .eq('id', params.id)
    .single()
  
  if (carError || !carData) return notFound()

  const isOwner = carData.user_id === user.id
  const isShared = carData.car_shares?.some((share: any) => share.email === user.email)
  if (!isOwner && !isShared) return notFound()

  const car = carData

  const { data: parts } = await supabase
    .from('parts')
    .select('*')
    .eq('car_id', params.id)
    .order('name', { ascending: true })

  const safeParts = parts || []

  // Fetch subscription details for navbar
  const subscriptionResult = await getSubscriptionStatus(supabase, user.id)
  const { plan, isTrial } = subscriptionResult
  const limits = PLAN_LIMITS[plan]
  const isPro = limits.aiMechanic

  const displayName = user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0]

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-700 relative overflow-x-hidden">
      <AuroraBackground />

      {/* Navigation Pill */}
      <DashboardNav userName={displayName} plan={plan} isTrial={isTrial} isPro={isPro} signOutAction={signOut} />
      <BottomNav isPro={isPro} />

      {/* Main Page Area */}
      <main
        className="relative z-10 max-w-5xl mx-auto px-3 sm:px-4 pb-28 md:pb-10"
        style={{ paddingTop: 'calc(max(0.75rem, env(safe-area-inset-top)) + 5rem)' }}
      >
        
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-8">
          <Link href={`/cars/${car.id}`} className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 text-xs font-bold bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-200 dark:border-slate-700/50">
            <ArrowLeft className="w-4 h-4" /> Vissza az autóhoz
          </Link>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight mb-2">
            Alkatrész <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Katalógus</span>
          </h1>
          
          <div className="inline-flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50 mt-1 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {car.make} {car.model} <span className="opacity-50">|</span> {car.plate}
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Add Part Form */}
          <Glass className="rounded-3xl p-6 shadow-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-700"></div>

            <h3 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-4 text-slate-900 dark:text-white relative z-10">
              <Package className="w-4 h-4 text-emerald-500" /> Új tétel rögzítése
            </h3>

            <form action={addPart} className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              <input type="hidden" name="car_id" value={car.id} />
              
              <div className="sm:col-span-2">
                <InputGroup label="Megnevezés" name="name" placeholder="pl. Motorolaj, Olajszűrő" required />
              </div>
              <InputGroup label="Cikkszám / Típus" name="part_number" placeholder="pl. 5W-30 / W712" />
              <InputGroup label="Márka / Gyártó" name="brand" placeholder="pl. Castrol, Mann" />
              
              <div className="sm:col-span-2">
                <InputGroup label="Webshop Link (Opcionális)" name="shop_url" type="url" placeholder="https://..." icon={<ShoppingCart className="w-3.5 h-3.5" />} />
              </div>
              
              <div className="sm:col-span-2 pt-2">
                <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-emerald-500/20 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
                  <Plus className="w-4 h-4" />
                  Hozzáadás a listához
                </button>
              </div>
            </form>
          </Glass>

          {/* Saved Parts List */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Mentett Tételek ({safeParts.length} db)</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {safeParts.length > 0 ? (
                safeParts.map((part: any) => (
                  <Glass key={part.id} className="p-5 rounded-2xl flex flex-col justify-between h-full relative group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate mb-1.5" title={part.name}>{part.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/40">
                            {part.brand || 'Márka N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-white/5 shadow-inner flex-shrink-0">
                        {part.part_number || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 flex gap-3 border-t border-slate-100 dark:border-white/[0.04]">
                      {part.shop_url ? (
                        <a href={part.shop_url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white dark:bg-white/10 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-white/10 hover:border-emerald-200 dark:hover:border-emerald-900/40 text-[10px] font-bold py-2.5 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 shadow-sm">
                          <ExternalLink className="w-3.5 h-3.5" />
                          Vásárlás
                        </a>
                      ) : (
                        <div className="flex-1 bg-slate-50 dark:bg-white/[0.01] text-slate-400 dark:text-slate-600 text-[10px] font-bold py-2.5 rounded-xl text-center border border-slate-100 dark:border-white/5 flex items-center justify-center gap-1.5 cursor-not-allowed">
                          <Info className="w-3.5 h-3.5" />
                          Nincs link
                        </div>
                      )}
                      
                      <form action={deletePart}>
                        <input type="hidden" name="part_id" value={part.id} />
                        <input type="hidden" name="car_id" value={car.id} />
                        <button className="h-full px-3.5 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all shadow-sm" title="Törlés">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </Glass>
                ))
              ) : (
                <div className="col-span-full py-16 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-white/20 dark:bg-white/[0.01] backdrop-blur-sm">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Package className="w-6 h-6 opacity-45" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-xs">Még nincs rögzített alkatrész.</p>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">Mentsd el az alkatrészt a fenti űrlap segítségével.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

// --- SUB-COMPONENTS ---

function InputGroup({ label, name, type = "text", placeholder, required = false, icon }: any) {
  return (
    <div className="space-y-1.5 group w-full">
      <label htmlFor={name} className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
        {label} {required && <span className="text-emerald-500">*</span>}
      </label>
      
      <div className="relative flex items-center bg-white/50 dark:bg-white/[0.02] backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden transition-all duration-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 hover:border-slate-300 dark:hover:border-white/25">
        {icon && (
          <div className="pl-4 pr-2 text-slate-400 group-focus-within:text-emerald-500 transition-colors shrink-0">
            {icon}
          </div>
        )}
        
        <input 
          type={type} 
          name={name} 
          id={name} 
          required={required} 
          placeholder={placeholder} 
          className={`
            w-full bg-transparent border-none py-3 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 focus:outline-none
            ${!icon && 'pl-4'}
          `} 
        />
      </div>
    </div>
  )
}