import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import CostAnalyticsDashboard from '@/components/CostAnalyticsDashboard' // A korábbi "Ultimate" komponenst importáljuk ide
import { Wallet, TrendingUp, Car, AlertCircle, ArrowUpRight, CalendarRange } from 'lucide-react'

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

  // Párhuzamos adatlekérés a maximális sebességért
  const [carsRes, eventsRes] = await Promise.all([
    supabase.from('cars').select('*').eq('user_id', user.id).eq('status', 'active'), // Csak az aktív autókat nézzük a fejlécben
    supabase.from('events').select('*').eq('user_id', user.id).order('event_date', { ascending: false })
  ])

  const cars = carsRes.data || []
  const events = eventsRes.data || []

  if (cars.length === 0) return redirect('/')

  // --- SZERVER OLDALI "INSTANT" ELEMZÉS ---
  // Ezeket kiszámoljuk itt, hogy a user azonnal lásson adatot (SSR), ne kelljen várni a kliens oldali JS-re.
  
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  
  // 1. Éves költés (YTD)
  const thisYearEvents = events.filter(e => new Date(e.event_date).getFullYear() === currentYear)
  const ytdSpend = thisYearEvents.reduce((acc, e) => acc + Number(e.cost), 0)
  
  // 2. Múlt havi költés összehasonlítás
  const lastMonthEvents = events.filter(e => {
    const d = new Date(e.event_date)
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth - 1
  })
  const lastMonthSpend = lastMonthEvents.reduce((acc, e) => acc + Number(e.cost), 0)
  
  // 3. Legdrágább autó idén
  const spendByCar: Record<string, number> = {}
  thisYearEvents.forEach(e => {
    spendByCar[e.car_id] = (spendByCar[e.car_id] || 0) + Number(e.cost)
  })
  const mostExpensiveCarId = Object.keys(spendByCar).reduce((a, b) => spendByCar[a] > spendByCar[b] ? a : b, Object.keys(spendByCar)[0])
  const expensiveCar = cars.find(c => c.id.toString() === mostExpensiveCarId)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 pt-[env(safe-area-inset-top)] pb-20">
      
      {/* --- HÁTTÉR EFFEKTEK (Finomítva) --- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
         <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px] opacity-60 mix-blend-multiply dark:mix-blend-screen" />
         <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[100px] opacity-50 mix-blend-multiply dark:mix-blend-screen" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] dark:opacity-[0.04]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- NAVIGÁCIÓS SÁV --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <a
            href="/"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm"
          >
            <span className="group-hover:-translate-x-1 transition-transform text-blue-600 dark:text-blue-400">←</span> 
            <span className="text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">Dashboard</span>
          </a>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
             <CalendarRange size={14} />
             Pénzügyi év: {currentYear}
          </div>
        </div>

        {/* --- FEJLÉC ÉS KÖSZÖNTÉS --- */}
        <div className="mb-12">
           <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
             Pénzügyi Jelentés.
           </h1>
           <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
             Itt láthatod a flotta teljes költségszerkezetét. A lenti adatok alapján optimalizálhatod a kiadásokat és előre jelezheted a szerviz igényeket.
           </p>
        </div>

        {/* --- VEZETŐI ÖSSZEFOGLALÓ (SERVER RENDERED) --- */}
        {/* Ez azért jó, mert azonnal látszik, amíg a nagy grafikonok betöltődnek */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           
           {/* 1. Kártya: YTD Költés */}
           <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Wallet size={120} className="transform rotate-12" />
              </div>
              <div className="relative z-10">
                 <p className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Idei költés (YTD)</p>
                 <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">
                    {formatCurrency(ytdSpend)}
                 </h2>
                 <div className="flex items-center gap-2 text-sm font-bold">
                    {lastMonthSpend > 0 ? (
                       <span className="text-slate-400">Múlt hónap: {formatCurrency(lastMonthSpend)}</span>
                    ) : (
                       <span className="text-emerald-500 flex items-center gap-1"><TrendingUp size={14} /> Költséghatékony évkezdés</span>
                    )}
                 </div>
              </div>
           </div>

           {/* 2. Kártya: Legköltségesebb Autó */}
           <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <AlertCircle size={120} className="transform -rotate-12 text-amber-500" />
              </div>
              <div className="relative z-10">
                 <p className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-2">Költségvezető Jármű</p>
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1 truncate">
                    {expensiveCar ? `${expensiveCar.plate}` : "Nincs adat"}
                 </h2>
                 <p className="text-sm font-bold text-slate-500 mb-4">{expensiveCar?.model}</p>
                 
                 {expensiveCar && spendByCar[expensiveCar.id] > 0 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold">
                       <ArrowUpRight size={14} />
                       {((spendByCar[expensiveCar.id] / ytdSpend) * 100).toFixed(0)}% a teljes költésből
                    </div>
                 )}
              </div>
           </div>

           {/* 3. Kártya: Flotta Státusz */}
           <div className="relative overflow-hidden bg-slate-900 dark:bg-blue-600 rounded-3xl p-8 shadow-xl group text-white">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Car size={120} />
              </div>
              <div className="relative z-10">
                 <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-blue-200 mb-2">Flotta Áttekintés</p>
                 <div className="flex items-baseline gap-2 mb-4">
                    <h2 className="text-4xl font-black tracking-tighter">{cars.length}</h2>
                    <span className="text-lg font-bold opacity-70">aktív jármű</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <p className="text-[10px] uppercase font-bold opacity-60">Rögzített Esemény</p>
                       <p className="text-xl font-bold">{events.length}</p>
                    </div>
                    <div>
                       <p className="text-[10px] uppercase font-bold opacity-60">Átlag km/autó</p>
                       <p className="text-xl font-bold">~{Math.round(events.reduce((acc, e) => Math.max(acc, e.mileage || 0), 0) / (cars.length || 1)).toLocaleString()}</p>
                    </div>
                 </div>
              </div>
           </div>

        </div>

        {/* --- CLIENT SIDE INTERACTIVE DASHBOARD --- */}
        <div className="relative">
           {/* Dekoratív elválasztó */}
           <div className="flex items-center gap-4 mb-8">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Részletes Elemzés</span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
           </div>
           
           {/* Itt hívjuk meg az "UltimateDashboard" komponenst, amit az előző körben írtunk. 
               Feltételezem, hogy CostAnalyticsDashboard néven mentetted el. */}
           <CostAnalyticsDashboard events={events} cars={cars} />
        </div>

      </div>
    </div>
  )
}