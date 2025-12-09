// app/admin/page.tsx
import { createClient } from '@supabase/supabase-js'
import { createClient as createAuthClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

// --- KONFIGURÁCIÓ ---
// Ide írd be a SAJÁT email címeidet, akik hozzáférhetnek
const ADMIN_EMAILS = ['morvairoland@gmail.com', 'info@drivesync-hungary.hu']; 

export default async function AdminDashboard() {
  // 1. Biztonsági ellenőrzés (Auth)
  const authSupabase = await createAuthClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  // Ellenőrizzük, hogy a user admin-e (környezeti változó vagy lista alapján)
  const adminEmailEnv = process.env.ADMIN_EMAIL;
  const isEnvAdmin = adminEmailEnv && user?.email === adminEmailEnv;
  const isListAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  if (!user || (!isListAdmin && !isEnvAdmin)) {
    return notFound() // Ha nem admin, 404-et kap (biztonságos)
  }

  // 2. Admin Kliens létrehozása (Service Role - lát mindent)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 3. Adatok lekérése (JAVÍTVA: 'plate' hozzáadva!)
  const [carsRes, eventsRes] = await Promise.all([
    supabaseAdmin
      .from('cars')
      .select('id, make, model, year, plate, created_at, user_id, mileage, fuel_type'),
    supabaseAdmin
      .from('events')
      .select('id, type, cost, created_at, title, car_id')
  ])

  const cars = carsRes.data || []
  const events = eventsRes.data || []

  // --- ÜZLETI LOGIKA ÉS ELEMZÉS ---

  // 1. Felhasználói bázis (egyedi user_id-k száma)
  const uniqueUsers = new Set(cars.map((c: any) => c.user_id)).size

  // 2. Pénzügyi adatok
  const totalCost = events.reduce((sum, e) => sum + (e.cost || 0), 0)
  const avgCostPerEvent = events.length > 0 ? Math.round(totalCost / events.length) : 0;

  // 3. Esemény típusok
  const serviceCount = events.filter(e => e.type === 'service' || e.type === 'repair').length
  const fuelCount = events.filter(e => e.type === 'fuel').length

  // 4. TOPLISTA: Legtöbbet futott autók
  const topMileageCars = [...cars]
    .sort((a, b) => b.mileage - a.mileage)
    .slice(0, 5);

  // 5. TOPLISTA: Legdrágább fenntartású autók (Összegzés)
  const carCosts: Record<string, number> = {};
  events.forEach(e => {
      if (!carCosts[e.car_id]) carCosts[e.car_id] = 0;
      carCosts[e.car_id] += (e.cost || 0);
  });
  
  const topCostCars = Object.entries(carCosts)
    .map(([carId, cost]) => {
        const car = cars.find(c => c.id === carId);
        // Csak akkor adjuk vissza, ha az autó még létezik az adatbázisban
        return car ? { ...car, totalSpent: cost } : null;
    })
    .filter((c): c is NonNullable<typeof c> => c !== null) // Null-ok kiszűrése
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  // 6. Legutóbbi aktivitás (Live Feed)
  const recentActivity = [...events]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 7);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-slate-800 pb-6">
        <div>
            <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                <h1 className="text-3xl font-black text-white tracking-tight">ADMIN PARANCSNOKI HÍD</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">DriveSync Hungary • Rendszerállapot: <span className="text-emerald-400 font-bold">ONLINE</span></p>
        </div>
        <div className="flex gap-3">
            <Link href="/" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 hover:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Vissza az Appba
            </Link>
        </div>
      </div>

      {/* KPI GRID (Fő számok) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard 
            title="Felhasználók" 
            value={uniqueUsers} 
            subtitle="Aktív fiókok" 
            icon={<svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            color="blue"
        />
        <KPICard 
            title="Flotta Méret" 
            value={cars.length} 
            subtitle="Rögzített jármű" 
            icon={<svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
            color="amber"
        />
        <KPICard 
            title="Forgalom (Költség)" 
            value={`${(totalCost / 1000000).toFixed(2)}M`} 
            subtitle="Összesített HUF" 
            icon={<svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            color="emerald"
        />
        <KPICard 
            title="Adatbázis Bejegyzés" 
            value={events.length} 
            subtitle="Esemény sor" 
            icon={<svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>}
            color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* BAL OSZLOP: LIVE FEED és TOPLISTÁK */}
          <div className="lg:col-span-2 space-y-8">
              
              {/* Esemény eloszlás (Vizuális sáv - Chart helyett) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Adat Eloszlás
                  </h3>
                  {events.length > 0 ? (
                    <>
                        <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden flex">
                            <div style={{width: `${(fuelCount / events.length) * 100}%`}} className="bg-amber-500 h-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" title="Tankolás"></div>
                            <div style={{width: `${(serviceCount / events.length) * 100}%`}} className="bg-blue-600 h-full shadow-[0_0_10px_rgba(37,99,235,0.5)] z-10" title="Szerviz"></div>
                            <div style={{width: 'auto', flex: 1}} className="bg-slate-700 h-full" title="Egyéb"></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mt-3 font-mono">
                            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Tankolás ({Math.round((fuelCount / events.length) * 100)}%)</span>
                            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Szerviz ({Math.round((serviceCount / events.length) * 100)}%)</span>
                            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-700"></div> Egyéb</span>
                        </div>
                    </>
                  ) : (
                    <p className="text-slate-500 text-sm">Nincs elég adat a statisztikához.</p>
                  )}
              </div>

              {/* Legdrágább Autók (High Rollers) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                      <h3 className="font-bold text-white flex items-center gap-2">
                          <span>💰</span> Legtöbbet költő autók
                      </h3>
                      <span className="text-[10px] font-bold bg-slate-800 px-2 py-1 rounded text-slate-400 border border-slate-700">TOP 5</span>
                  </div>
                  <div className="divide-y divide-slate-800/50">
                      {topCostCars.map((car, i) => (
                          <div key={car.id} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                              <div className="flex items-center gap-4">
                                  <div className={`text-lg font-black w-8 h-8 flex items-center justify-center rounded-lg ${i===0 ? 'bg-yellow-500/20 text-yellow-500' : 'text-slate-600 bg-slate-800'}`}>#{i+1}</div>
                                  <div>
                                      <p className="font-bold text-white text-sm">{car.make} {car.model}</p>
                                      <p className="text-xs text-slate-500 font-mono">{car.plate} • {car.year}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <p className="font-black text-emerald-400">{car.totalSpent.toLocaleString()} Ft</p>
                                  <p className="text-[10px] text-slate-500">Összes ráfordítás</p>
                              </div>
                          </div>
                      ))}
                      {topCostCars.length === 0 && <div className="p-4 text-center text-slate-500 text-sm">Nincs adat.</div>}
                  </div>
              </div>

              {/* Legtöbbet futott autók (Iron Horses) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                      <h3 className="font-bold text-white flex items-center gap-2">
                          <span>🏎️</span> Legtöbbet futott autók
                      </h3>
                      <span className="text-[10px] font-bold bg-slate-800 px-2 py-1 rounded text-slate-400 border border-slate-700">TOP 5</span>
                  </div>
                  <div className="divide-y divide-slate-800/50">
                      {topMileageCars.map((car, i) => (
                          <div key={car.id} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                              <div className="flex items-center gap-4">
                                  <div className={`text-lg font-black w-8 h-8 flex items-center justify-center rounded-lg ${i===0 ? 'bg-blue-500/20 text-blue-500' : 'text-slate-600 bg-slate-800'}`}>#{i+1}</div>
                                  <div>
                                      <p className="font-bold text-white text-sm">{car.make} {car.model}</p>
                                      <p className="text-xs text-slate-500 capitalize">{car.fuel_type || 'Ismeretlen üzemanyag'}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <p className="font-black text-blue-400">{car.mileage.toLocaleString()} km</p>
                              </div>
                          </div>
                      ))}
                      {topMileageCars.length === 0 && <div className="p-4 text-center text-slate-500 text-sm">Nincs adat.</div>}
                  </div>
              </div>

          </div>

          {/* JOBB OSZLOP: Live Feed és Technikai Info */}
          <div className="space-y-8">
              
              {/* LIVE FEED */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit relative overflow-hidden">
                  {/* Háttér effekt */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <h3 className="font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                      Élő Eseménynapló
                  </h3>
                  
                  <div className="space-y-0 relative border-l border-slate-800 ml-2 pl-6 pb-2">
                      {recentActivity.map((event) => (
                          <div key={event.id} className="relative pb-6 last:pb-0 group">
                              <div className={`absolute -left-[29px] top-1.5 w-3 h-3 rounded-full border-2 border-slate-900 transition-all group-hover:scale-125 ${
                                  event.type === 'fuel' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 
                                  event.type === 'service' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-500'
                              }`}></div>
                              
                              <p className="text-[10px] text-slate-500 mb-0.5 font-mono uppercase tracking-wide">
                                {new Date(event.created_at).toLocaleString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                                {event.title || (event.type === 'fuel' ? 'Tankolás' : 'Szerviz')}
                              </p>
                              <p className="text-xs font-mono text-emerald-400 mt-1 bg-emerald-500/10 inline-block px-2 py-0.5 rounded border border-emerald-500/20">
                                {event.cost ? `-${event.cost.toLocaleString()} Ft` : '0 Ft'}
                              </p>
                          </div>
                      ))}
                      {recentActivity.length === 0 && <p className="text-slate-500 text-sm italic">Nincs friss aktivitás.</p>}
                  </div>
              </div>

              {/* Rendszer Info */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-xs text-slate-500 space-y-3">
                  <p className="uppercase font-bold text-slate-400 mb-2 border-b border-slate-800 pb-2">Rendszer Környezet</p>
                  <div className="flex justify-between">
                      <span>Node.js Environment:</span>
                      <span className="text-slate-300 font-mono">v20.x (Vercel)</span>
                  </div>
                  <div className="flex justify-between">
                      <span>Adatbázis:</span>
                      <span className="text-slate-300 font-mono">Supabase (Postgres)</span>
                  </div>
                  <div className="flex justify-between">
                      <span>Adatközpont:</span>
                      <span className="text-slate-300 font-mono">eu-central-1</span>
                  </div>
                  <div className="pt-3 border-t border-slate-800 mt-2 text-center text-[10px] text-slate-600">
                      DriveSync Admin v2.1 • {new Date().getFullYear()}
                  </div>
              </div>

          </div>

      </div>
    </div>
  )
}

function KPICard({ title, value, subtitle, icon, color }: any) {
    const colorClasses = {
        blue: "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:border-blue-500/40",
        amber: "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:border-amber-500/40",
        emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:border-emerald-500/40",
        purple: "bg-purple-500/10 border-purple-500/20 text-purple-400 hover:border-purple-500/40",
    }

    return (
        <div className={`p-6 rounded-2xl border bg-slate-900 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${colorClasses[color as keyof typeof colorClasses] || "border-slate-800"}`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-xs uppercase font-bold text-slate-400 mb-1 tracking-wider">{title}</p>
                    <h2 className="text-3xl font-black text-white tracking-tight">{value}</h2>
                </div>
                <div className={`p-2.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner`}>{icon}</div>
            </div>
            <div className="flex justify-between items-end">
                <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
            </div>
        </div>
    )
}