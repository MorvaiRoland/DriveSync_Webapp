import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// --- SUPABASE CLIENT ---
const getAdminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ==========================================
// SERVER ACTIONS (Adatbázis műveletek)
// ==========================================

// 1. Felhasználó Csomag Módosítása
async function updateSubscriptionPlan(formData: FormData) {
  'use server'
  const userId = formData.get('userId') as string
  const newPlan = formData.get('plan') as string
  const adminKey = formData.get('adminKey') as string

  if (adminKey !== process.env.ADMIN_ACCESS_KEY) return;

  const supabase = getAdminClient()
  await supabase.from('subscriptions').upsert({ 
        user_id: userId, 
        plan_type: newPlan,
        status: 'active',
    }, { onConflict: 'user_id' })

  revalidatePath(`/admin?key=${adminKey}`) 
}

// 2. Új Promóció Létrehozása
async function createPromotion(formData: FormData) {
    'use server'
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const cta_text = formData.get('cta_text') as string
    const adminKey = formData.get('adminKey') as string

    if (adminKey !== process.env.ADMIN_ACCESS_KEY) return;
    if (!title) return;

    const supabase = getAdminClient()
    await supabase.from('promotions').insert({
        title,
        description,
        cta_text,
        is_active: false // Alapból inaktív, majd te bekapcsolod
    })

    revalidatePath(`/admin?key=${adminKey}`)
}

// 3. Promóció Státusz Váltása (Aktív/Inaktív)
async function togglePromotion(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const currentStatus = formData.get('currentStatus') === 'true'
    const adminKey = formData.get('adminKey') as string

    if (adminKey !== process.env.ADMIN_ACCESS_KEY) return;

    const supabase = getAdminClient()
    
    // Ha bekapcsoljuk ezt, érdemes lehet az összes többit kikapcsolni, 
    // hogy egyszerre csak 1 promó fusson (opcionális, most nem tettem bele)
    await supabase.from('promotions').update({ is_active: !currentStatus }).eq('id', id)

    revalidatePath(`/admin?key=${adminKey}`)
}

// 4. Promóció Törlése
async function deletePromotion(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const adminKey = formData.get('adminKey') as string

    if (adminKey !== process.env.ADMIN_ACCESS_KEY) return;

    const supabase = getAdminClient()
    await supabase.from('promotions').delete().eq('id', id)

    revalidatePath(`/admin?key=${adminKey}`)
}


// ==========================================
// FŐ KOMPONENS
// ==========================================
export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { key?: string };
}) {
  
  // --- BIZTONSÁG ---
  const secretKey = searchParams?.key;
  if (!secretKey || secretKey !== process.env.ADMIN_ACCESS_KEY) {
    return notFound();
  }

  const supabaseAdmin = getAdminClient()

  // --- ADATLEKÉRÉS (Most már a promóciókat is lekérjük) ---
  const [carsRes, eventsRes, subsRes, usersRes, promosRes] = await Promise.all([
    supabaseAdmin.from('cars').select('id'),
    supabaseAdmin.from('events').select('id, type, cost, car_id'),
    supabaseAdmin.from('subscriptions').select('user_id, status, plan_type'),
    supabaseAdmin.auth.admin.listUsers(),
    supabaseAdmin.from('promotions').select('*').order('created_at', { ascending: false })
  ])

  const cars = carsRes.data || []
  const events = eventsRes.data || []
  const subscriptions = subsRes.data || []
  const allUsers = usersRes.data.users || []
  const promotions = promosRes.data || []

  // --- STATISZTIKÁK SZÁMOLÁSA ---
  const userList = allUsers.map(u => {
      const sub = subscriptions.find(s => s.user_id === u.id);
      return {
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          plan: sub?.plan_type || 'free',
          status: sub?.status || 'inactive'
      }
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalRegisteredUsers = userList.length
  const totalCost = events.reduce((sum, e) => sum + (e.cost || 0), 0)
  const lifetimeCount = userList.filter(u => u.plan === 'lifetime').length
  const proCount = userList.filter(u => u.plan === 'pro').length
  const proRate = totalRegisteredUsers > 0 ? Math.round(((lifetimeCount + proCount) / totalRegisteredUsers) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-slate-800 pb-6">
        <div>
            <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                <h1 className="text-3xl font-black text-white tracking-tight">ADMIN PARANCSNOKI HÍD</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">DriveSync Hungary • <span className="text-amber-500 font-mono text-xs">MAGIC LINK ACCESS</span></p>
        </div>
        <Link href="/" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors hover:text-white">
            Vissza az Appba
        </Link>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         {/* ... (KPI kártyák változatlanok, csak a helytakarékosság miatt rövidítem itt) ... */}
         <KPICard title="Összes Tag" value={totalRegisteredUsers} subtitle={`${proRate}% Prémium`} color="blue" icon={<span className="text-2xl">👥</span>} />
         <KPICard title="Autók száma" value={cars.length} subtitle="Rögzített jármű" color="amber" icon={<span className="text-2xl">🚗</span>} />
         <KPICard title="Adatok" value={events.length} subtitle="Esemény sor" color="purple" icon={<span className="text-2xl">📊</span>} />
         <KPICard title="Forgalom" value={`${(totalCost / 1000000).toFixed(1)}M`} subtitle="Költség (HUF)" color="emerald" icon={<span className="text-2xl">💰</span>} />
      </div>

      {/* ===================================================================================== */}
      {/* ÚJ SZEKCIÓ: PROMÓCIÓ KEZELŐ */}
      {/* ===================================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
        {/* 1. BAL OLDAL: ÚJ HOZZÁADÁSA */}
        <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                <span className="bg-purple-500/20 text-purple-400 p-1.5 rounded-lg">🎁</span>
                Új Promóció Indítása
            </h3>
            
            <form action={createPromotion} className="space-y-4 relative z-10">
                <input type="hidden" name="adminKey" value={secretKey} />
                
                <div>
                    <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Főcím (Pl. Karácsonyi Akció)</label>
                    <input type="text" name="title" required placeholder="Nagy Cím" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all" />
                </div>
                
                <div>
                    <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Leírás (Mit kap a user?)</label>
                    <textarea name="description" rows={3} placeholder="Regisztrálj és..." className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all" />
                </div>

                <div>
                    <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">Gomb Szöveg</label>
                    <input type="text" name="cta_text" placeholder="Kérem az ajándékot!" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white outline-none" />
                </div>

                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-900/20 active:scale-95">
                    Hozzáadás +
                </button>
            </form>
        </div>

        {/* 2. JOBB OLDAL: LISTA */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
                <h3 className="font-bold text-white">Létrehozott Kampányok</h3>
                <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">{promotions.length} db</span>
            </div>
            
            <div className="overflow-y-auto max-h-[400px] flex-1">
                {promotions.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">Még nincs promóció. Hozz létre egyet bal oldalt! 👈</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-950 text-slate-400 text-xs uppercase sticky top-0">
                            <tr>
                                <th className="px-5 py-3">Kampány</th>
                                <th className="px-5 py-3 text-center">Státusz</th>
                                <th className="px-5 py-3 text-right">Művelet</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {promotions.map((promo: any) => (
                                <tr key={promo.id} className="hover:bg-slate-800/40 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="font-bold text-white text-base">{promo.title}</div>
                                        <div className="text-slate-400 text-xs mt-1">{promo.description}</div>
                                        <div className="text-purple-400 text-[10px] mt-1 font-mono bg-purple-900/20 inline-block px-1.5 rounded">CTA: {promo.cta_text || '-'}</div>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        {promo.is_active ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs animate-pulse">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> LIVE
                                            </span>
                                        ) : (
                                            <span className="inline-flex px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-bold text-xs">
                                                INAKTÍV
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            {/* KAPCSOLÓ (Toggle) */}
                                            <form action={togglePromotion}>
                                                <input type="hidden" name="id" value={promo.id} />
                                                <input type="hidden" name="currentStatus" value={String(promo.is_active)} />
                                                <input type="hidden" name="adminKey" value={secretKey} />
                                                <button type="submit" className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                    promo.is_active 
                                                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                                                    : 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500'
                                                }`}>
                                                    {promo.is_active ? 'Leállítás' : 'Indítás 🚀'}
                                                </button>
                                            </form>

                                            {/* TÖRLÉS */}
                                            <form action={deletePromotion}>
                                                <input type="hidden" name="id" value={promo.id} />
                                                <input type="hidden" name="adminKey" value={secretKey} />
                                                <button type="submit" className="text-slate-500 hover:text-red-400 p-2 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
      </div>
      {/* ===================================================================================== */}

      {/* --- FELHASZNÁLÓK TÁBLÁZAT --- */}
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
                          <th className="px-6 py-4 text-center">Jelenlegi Csomag</th>
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
                                      u.plan === 'lifetime' ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' :
                                      u.plan === 'pro' ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' :
                                      'bg-slate-800 border-slate-700 text-slate-400'
                                  }`}>
                                      {u.plan === 'lifetime' && '🚀 '}
                                      {u.plan.toUpperCase()}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <form action={updateSubscriptionPlan} className="flex items-center justify-end gap-2">
                                      <input type="hidden" name="userId" value={u.id} />
                                      <input type="hidden" name="adminKey" value={secretKey} />
                                      <select name="plan" className="bg-slate-950 border border-slate-700 text-white text-xs rounded-lg focus:ring-amber-500 focus:border-amber-500 p-1.5" defaultValue={u.plan}>
                                          <option value="free">Free</option>
                                          <option value="pro">Pro</option>
                                          <option value="lifetime">Lifetime</option>
                                      </select>
                                      <button type="submit" className="bg-white text-slate-900 hover:bg-amber-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Mentés</button>
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