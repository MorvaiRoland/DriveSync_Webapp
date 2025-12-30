import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import CostAnalyticsDashboard from '@/components/CostAnalyticsDashboard' 
import { Wallet, TrendingUp, Car, AlertCircle, ArrowUpRight, CalendarRange, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Pénzügyi Intelligencia | DynamicSense',
  description: 'Flotta szintű költségelemzés, trendek és előrejelzések.'
}

// Segédfüggvény a szerver oldali formázáshoz
const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(amount)

export default async function CostAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  // Adatlekérés
  const [carsRes, eventsRes] = await Promise.all([
    supabase.from('cars').select('*').eq('user_id', user.id).eq('status', 'active'),
    supabase.from('events').select('*').eq('user_id', user.id).order('event_date', { ascending: false })
  ])

  const cars = carsRes.data || []
  const events = eventsRes.data || []

  if (cars.length === 0) return redirect('/')

  // --- SZERVER OLDALI STATISZTIKÁK ---
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  
  // 1. Éves költés (YTD)
  const thisYearEvents = events.filter(e => new Date(e.event_date).getFullYear() === currentYear)
  const ytdSpend = thisYearEvents.reduce((acc, e) => acc + Number(e.cost), 0)
  
  // 2. Múlt havi költés
  const lastMonthEvents = events.filter(e => {
    const d = new Date(e.event_date)
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth - 1
  })
  const lastMonthSpend = lastMonthEvents.reduce((acc, e) => acc + Number(e.cost), 0)
  
  // 3. Legdrágább autó
  const spendByCar: Record<string, number> = {}
  thisYearEvents.forEach(e => {
    spendByCar[e.car_id] = (spendByCar[e.car_id] || 0) + Number(e.cost)
  })
  const mostExpensiveCarId = Object.keys(spendByCar).reduce((a, b) => spendByCar[a] > spendByCar[b] ? a : b, Object.keys(spendByCar)[0])
  const expensiveCar = cars.find(c => c.id.toString() === mostExpensiveCarId)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 pt-[env(safe-area-inset-top)] pb-20">
      
      {/* --- HÁTTÉR EFFEKTEK --- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
         <div className="absolute top-[-20%] right-[-10%] w-[500px] sm:w-[800px] h-[500px] sm:h-[800px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[80px] sm:blur-[120px] opacity-60 mix-blend-multiply dark:mix-blend-screen" />
         <div className="absolute top-[20%] left-[-10%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[60px] sm:blur-[100px] opacity-50 mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* --- NAVIGÁCIÓS SÁV --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4">
          <a
            href="/"
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all text-sm font-bold shadow-sm backdrop-blur-md"
          >
            <ArrowLeft size={16} className="text-blue-600 dark:text-blue-400 group-hover:-translate-x-1 transition-transform" />
            <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">Vissza a főoldalra</span>
          </a>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
             <CalendarRange size={14} />
             Pénzügyi év: {currentYear}
          </div>
        </div>

        {/* --- CÍMSOR --- */}
        <div className="mb-8 sm:mb-12">
           <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 text-slate-900 dark:text-white">
             Pénzügyi Jelentés<span className="text-blue-600 dark:text-blue-500">.</span>
           </h1>
           <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
             Átfogó kép a flotta költségszerkezetéről. Elemezd a kiadásokat és optimalizáld a működést valós adatok alapján.
           </p>
        </div>

        {/* --- SZERVER OLDALI STATISZTIKÁK (Kártyák) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
           
           {/* 1. Kártya: YTD Költés */}
           <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 group transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity dark:opacity-[0.03]">
                 <Wallet size={100} className="transform rotate-12 text-slate-900 dark:text-white" />
              </div>
              <div className="relative z-10">
                 <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Idei összes költés</p>
                 <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter truncate">
                    {formatCurrency(ytdSpend)}
                 </h2>
                 <div className="flex items-center gap-2 text-sm font-bold">
                    {lastMonthSpend > 0 ? (
                       <span className="text-slate-500 dark:text-slate-500">Múlt hónap: <span className="text-slate-700 dark:text-slate-300">{formatCurrency(lastMonthSpend)}</span></span>
                    ) : (
                       <span className="text-emerald-500 flex items-center gap-1"><TrendingUp size={14} /> Költséghatékony időszak</span>
                    )}
                 </div>
              </div>
           </div>

           {/* 2. Kártya: Legköltségesebb Autó */}
           <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 group transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity dark:opacity-[0.03]">
                 <AlertCircle size={100} className="transform -rotate-12 text-amber-500" />
              </div>
              <div className="relative z-10">
                 <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-2">Legtöbb kiadás</p>
                 <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1 truncate">
                    {expensiveCar ? `${expensiveCar.plate}` : "Nincs adat"}
                 </h2>
                 <p className="text-sm font-bold text-slate-500 dark:text-slate-500 mb-4 truncate">{expensiveCar?.model}</p>
                 
                 {expensiveCar && spendByCar[expensiveCar.id] > 0 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold">
                       <ArrowUpRight size={14} />
                       {((spendByCar[expensiveCar.id] / ytdSpend) * 100).toFixed(0)}% a teljes büdzséből
                    </div>
                 )}
              </div>
           </div>

           {/* 3. Kártya: Flotta Státusz (Kiemelt sötét/színes kártya) */}
           <div className="relative overflow-hidden bg-slate-900 dark:bg-blue-600 rounded-[2rem] p-6 sm:p-8 shadow-xl group text-white sm:col-span-2 lg:col-span-1 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Car size={100} />
              </div>
              <div className="relative z-10">
                 <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-blue-200 mb-2">Flotta Áttekintés</p>
                 <div className="flex items-baseline gap-2 mb-4">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tighter">{cars.length}</h2>
                    <span className="text-base sm:text-lg font-bold opacity-70">aktív jármű</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mt-auto">
                    <div>
                       <p className="text-[10px] uppercase font-bold opacity-60">Rögzített Tétel</p>
                       <p className="text-lg sm:text-xl font-bold">{events.length} db</p>
                    </div>
                    <div>
                       <p className="text-[10px] uppercase font-bold opacity-60">Átlagos futás</p>
                       <p className="text-lg sm:text-xl font-bold">~{Math.round(events.reduce((acc, e) => Math.max(acc, e.mileage || 0), 0) / (cars.length || 1)).toLocaleString()} km</p>
                    </div>
                 </div>
              </div>
           </div>

        </div>

        {/* --- CLIENT SIDE DASHBOARD --- */}
        <div className="relative">
           {/* Dekoratív elválasztó */}
           <div className="flex items-center gap-4 mb-8">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 whitespace-nowrap">Részletes Elemzés</span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
           </div>
           
           {/* A korábban megírt kliens komponens */}
           <CostAnalyticsDashboard events={events} cars={cars} />
        </div>

      </div>
    </div>
  )
}