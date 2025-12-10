// app/admin/page.tsx
import { createClient } from '@supabase/supabase-js'
import { createClient as createAuthClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

// --- FONTOS: Ez kapcsolja ki a Cache-t az admin oldalon ---
export const dynamic = 'force-dynamic'
export const revalidate = 0

// --- SERVER ACTION: Csomag Módosítása ---
async function updateSubscriptionPlan(formData: FormData) {
  'use server'
  
  const userId = formData.get('userId') as string
  const newPlan = formData.get('plan') as string

  if (!userId || !newPlan) return;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Frissítés
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert({ 
        user_id: userId, 
        plan_type: newPlan,
        status: 'active',
        // Kivettem az updated_at-et, hogy ne okozzon SQL hibát, ha nincs az oszlop
    }, { onConflict: 'user_id' })

  if (error) {
      console.error("Admin update error:", error)
  }

  // 2. Kényszerített újratöltés
  revalidatePath('/admin', 'page') 
}

// --- FŐ KOMPONENS ---
export default async function AdminDashboard() {
  // 1. Biztonsági ellenőrzés (Auth)
  const authSupabase = await createAuthClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  const allowedEmailsEnv = process.env.ADMIN_EMAILS || '';
  const allowedEmails = allowedEmailsEnv.split(',').map(email => email.trim());

  if (!user || !user.email || !allowedEmails.includes(user.email)) {
    return notFound()
  }

  // 2. Admin Kliens
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 3. Adatok lekérése
  const [carsRes, eventsRes, subsRes, usersRes] = await Promise.all([
    supabaseAdmin.from('cars').select('id, make, model, year, plate, created_at, user_id, mileage, fuel_type'),
    supabaseAdmin.from('events').select('id, type, cost, created_at, title, car_id'),
    supabaseAdmin.from('subscriptions').select('user_id, status, plan_type, created_at'),
    supabaseAdmin.auth.admin.listUsers()
  ])

  const cars = carsRes.data || []
  const events = eventsRes.data || []
  const subscriptions = subsRes.data || []
  const allUsers = usersRes.data.users || []

  // Összefésülés
  const userList = allUsers.map(u => {
      const sub = subscriptions.find(s => s.user_id === u.id);
      return {
          id: u.id,
          email: u.email,
          last_sign_in: u.last_sign_in_at,
          created_at: u.created_at,
          plan: sub?.plan_type || 'free',
          status: sub?.status || 'inactive'
      }
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // --- KPI Számítások ---
  const totalRegisteredUsers = userList.length
  const totalCost = events.reduce((sum, e) => sum + (e.cost || 0), 0)
  
  const founderCount = subscriptions.filter(s => s.plan_type === 'founder' && s.status === 'active').length
  const proCount = subscriptions.filter(s => s.plan_type === 'pro' && s.status === 'active').length
  const proRate = totalRegisteredUsers > 0 ? Math.round(((founderCount + proCount) / totalRegisteredUsers) * 100) : 0

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

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-2xl border bg-slate-900 border-slate-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-xs uppercase font-bold text-slate-400 mb-1 tracking-wider">Összes Tag</p>
                    <h2 className="text-3xl font-black text-white tracking-tight">{totalRegisteredUsers}</h2>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner group-hover:border-blue-500/30 transition-colors">
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
            </div>
            <div className="flex justify-between items-end">
               <div className="flex gap-2">
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold">{founderCount} 🚀</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-bold">{proCount} PRO</span>
               </div>
               <p className="text-xs text-slate-500 font-medium">{proRate}% Prémium</p>
            </div>
        </div>

        <KPICard title="Autók száma" value={cars.length} subtitle="Rögzített jármű" color="amber" />
        <KPICard title="Adatok" value={events.length} subtitle="Esemény sor" color="purple" />
        <KPICard title="Forgalom" value={`${(totalCost / 1000000).toFixed(1)}M`} subtitle="Költség (HUF)" color="emerald" />
      </div>

      {/* --- FELHASZNÁLÓKEZELÉS --- */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <h3 className="font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  Felhasználók
              </h3>
          </div>
          
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                  <thead className="bg-slate-950 text-slate-200 uppercase font-bold text-xs">
                      <tr>
                          <th className="px-6 py-4">User</th>
                          <th className="px-6 py-4 text-center">Csomag</th>
                          <th className="px-6 py-4 text-right">Módosítás</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                      {userList.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                              <td className="px-6 py-4">
                                  <div className="font-bold text-white">{u.email}</div>
                                  <div className="text-[10px] font-mono text-slate-600">{u.id}</div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold border ${
                                      u.plan === 'founder' ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' :
                                      u.plan === 'pro' ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' :
                                      'bg-slate-800 border-slate-700 text-slate-400'
                                  }`}>
                                      {u.plan === 'founder' && '🚀 '}
                                      {u.plan.toUpperCase()}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <form action={updateSubscriptionPlan} className="flex items-center justify-end gap-2">
                                      <input type="hidden" name="userId" value={u.id} />
                                      <select 
                                        name="plan" 
                                        className="bg-slate-950 border border-slate-700 text-white text-xs rounded-lg focus:ring-amber-500 focus:border-amber-500 p-1.5"
                                        defaultValue={u.plan}
                                      >
                                          <option value="free">Free</option>
                                          <option value="pro">Pro</option>
                                          <option value="founder">Founder</option>
                                      </select>
                                      <button type="submit" className="bg-white text-slate-900 hover:bg-amber-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                          Mentés
                                      </button>
                                  </form>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  )
}

function KPICard({ title, value, subtitle, icon, color }: any) {
    const colorClasses = {
        blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
        amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
        emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    }

    return (
        <div className={`p-6 rounded-2xl border bg-slate-900 ${colorClasses[color as keyof typeof colorClasses] || "border-slate-800"}`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-xs uppercase font-bold text-slate-400 mb-1 tracking-wider">{title}</p>
                    <h2 className="text-3xl font-black text-white tracking-tight">{value}</h2>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">{icon}</div>
            </div>
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        </div>
    )
}