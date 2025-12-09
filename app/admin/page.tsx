// app/admin/page.tsx
import { createClient } from '@supabase/supabase-js'
import { createClient as createAuthClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

// --- KONFIGURÁCIÓ ---
// Ide írd be a SAJÁT email címedet!
const ADMIN_EMAILS = ['morvai1roland@gmail.com', 'info@drivesync-hungary.hu']; 

export default async function AdminDashboard() {
  // 1. Ellenőrizzük, ki van bejelentkezve
  const authSupabase = await createAuthClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
    return notFound() 
  }

  // 2. Admin Kliens létrehozása (Ez lát mindent)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 3. Adatok lekérése (JAVÍTVA: user_id hozzáadva a lekérdezéshez)
  const [carsRes, eventsRes] = await Promise.all([
    // Itt adtam hozzá a 'user_id'-t a listához:
    supabaseAdmin.from('cars').select('id, make, model, year, created_at, user_id'),
    supabaseAdmin.from('events').select('id, type, cost, created_at')
  ])

  const cars = carsRes.data || []
  const events = eventsRes.data || []
  
  // Most már nem fogja aláhúzni, mert lekértük az adatot:
  const uniqueUsers = new Set(cars.map((c: any) => c.user_id)).size

  // Statisztikák számolása
  const totalCost = events.reduce((sum, e) => sum + (e.cost || 0), 0)
  const totalServiceEvents = events.filter(e => e.type === 'service').length
  const totalFuelEvents = events.filter(e => e.type === 'fuel').length

  // Utolsó 5 felvett autó
  const recentCars = [...cars]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
            <h1 className="text-3xl font-black text-white">Admin Vezérlőpult ⚡</h1>
            <p className="text-slate-400">Rendszer áttekintés és statisztikák</p>
        </div>
        <Link href="/" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            Vissza az Appba
        </Link>
      </div>

      {/* KPI Kártyák */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
            label="Összes Felhasználó" 
            value={uniqueUsers} 
            icon="👥" 
            color="bg-blue-500/10 text-blue-400 border-blue-500/20" 
        />
        <StatCard 
            label="Rögzített Járművek" 
            value={cars.length} 
            icon="🚗" 
            color="bg-amber-500/10 text-amber-400 border-amber-500/20" 
        />
        <StatCard 
            label="Összes Bejegyzés" 
            value={events.length} 
            icon="📝" 
            color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
        />
        <StatCard 
            label="Rögzített Költség (Össz)" 
            value={`${(totalCost / 1000000).toFixed(1)}M Ft`} 
            icon="💰" 
            color="bg-purple-500/10 text-purple-400 border-purple-500/20" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Legutóbbi Autók */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 text-white">Legújabb Autók</h3>
              <div className="space-y-4">
                  {recentCars.map((car) => (
                      <div key={car.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-lg">
                                  🚘
                              </div>
                              <div>
                                  <p className="font-bold text-white">{car.make} {car.model}</p>
                                  <p className="text-xs text-slate-500">{car.year} • {new Date(car.created_at).toLocaleDateString('hu-HU')}</p>
                              </div>
                          </div>
                          <Link href={`/verify/${car.id}`} target="_blank" className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors">
                              Adatlap
                          </Link>
                      </div>
                  ))}
                  {recentCars.length === 0 && <p className="text-slate-500 italic">Nincs adat.</p>}
              </div>
          </div>

          {/* Rendszer Állapot */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 text-white">Események Típusa</h3>
              <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                      <span className="text-slate-400">⛽ Tankolások</span>
                      <span className="font-mono font-bold text-white">{totalFuelEvents} db</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                      <span className="text-slate-400">🔧 Szervizek</span>
                      <span className="font-mono font-bold text-white">{totalServiceEvents} db</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                      <span className="text-slate-400">📊 Átlagos bejegyzés / autó</span>
                      <span className="font-mono font-bold text-white">
                        {cars.length > 0 ? (events.length / cars.length).toFixed(1) : 0}
                      </span>
                  </div>
              </div>
          </div>

      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: any) {
    return (
        <div className={`p-6 rounded-2xl border ${color}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="text-3xl">{icon}</div>
            </div>
            <div>
                <p className="text-xs uppercase font-bold opacity-70 mb-1">{label}</p>
                <p className="text-3xl font-black">{value}</p>
            </div>
        </div>
    )
}