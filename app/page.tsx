import { createClient } from 'supabase/server'
import { signOut } from './login/action'
import { deleteCar } from './cars/actions'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import PdfDownloadButton from './cars/[id]/PdfDownloadButton' // Ha a főoldalon is kellene, de itt most nem használjuk közvetlenül

// --- SERVER ACTION: Km Naplózása ---
async function logCurrentMileage(formData: FormData) {
    'use server'
    const car_id = formData.get('car_id');
    const current_mileage = parseInt(String(formData.get('current_mileage')));

    if (!car_id || isNaN(current_mileage) || current_mileage <= 0) {
        return redirect(`/?error=Hibás km állás.`);
    }

    const supabase = await createClient();
    const { error } = await supabase.from('cars').update({ mileage: current_mileage }).eq('id', car_id);
    if (error) console.error("Hiba:", error);
    return redirect('/');
}

// --- FŐ KOMPONENS ---
export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Adatok inicializálása
  let cars: any[] = []
  let upcomingReminders: any[] = []
  let recentActivity: any[] = []
  
  let totalSpentAllTime = 0
  let totalSpentThisMonth = 0
  let fleetHealth = 100 // Százalék
  let latestCarId = null

  if (user) {
    // 1. Autók lekérése
    const { data: carsData } = await supabase.from('cars').select('*').order('created_at', { ascending: false })
    if (carsData) {
        cars = carsData
        latestCarId = cars.length > 0 ? cars[0].id : null;
    }

    if (cars.length > 0) {
        // 2. Összes Emlékeztető lekérése (Globális)
        const { data: reminders } = await supabase
            .from('service_reminders')
            .select('*, cars(make, model)')
            .order('due_date', { ascending: true })
            .limit(3)
        if (reminders) upcomingReminders = reminders

        // 3. Legutóbbi aktivitások (Globális)
        const { data: activities } = await supabase
            .from('events')
            .select('*, cars(make, model)')
            .order('event_date', { ascending: false })
            .limit(5)
        if (activities) recentActivity = activities

        // 4. Pénzügyi összesítés
        const { data: allCosts } = await supabase.from('events').select('cost, event_date')
        if (allCosts) {
            const now = new Date()
            totalSpentAllTime = allCosts.reduce((sum, e) => sum + (e.cost || 0), 0)
            totalSpentThisMonth = allCosts
                .filter(e => new Date(e.event_date).getMonth() === now.getMonth() && new Date(e.event_date).getFullYear() === now.getFullYear())
                .reduce((sum, e) => sum + (e.cost || 0), 0)
        }

        // 5. Flotta egészség számítás (Egyszerűsített)
        const sickCars = cars.filter(c => c.status === 'service').length
        fleetHealth = Math.round(((cars.length - sickCars) / cars.length) * 100)
    }
  }

  // Időszaknak megfelelő üdvözlés
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Jó reggelt' : hour < 18 ? 'Szép napot' : 'Szép estét'

  // --- DASHBOARD NÉZET (BEJELENTKEZVE) ---
  if (user) {
    return (
      // JAVÍTÁS: h-screen, overflow-y-auto és overscroll-none a gumiszalag effekt ellen
      <div className="h-screen w-full overflow-y-auto overscroll-none bg-slate-50 text-slate-900 font-sans pb-24">
        {/* Navigáció */}
        <nav className="bg-slate-900 sticky top-0 z-50 shadow-lg border-b border-white/5 backdrop-blur-md bg-opacity-95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8">
                  <Image src="/drivesync-logo.png" alt="DriveSync" fill className="object-contain" priority />
                </div>
                <span className="text-xl font-bold tracking-tight text-white uppercase hidden sm:block">
                  Drive<span className="text-amber-500">Sync</span>
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/settings" className="rounded-full bg-white/10 text-white p-2 hover:bg-white/20 transition-colors" title="Beállítások">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </Link>
                <form action={signOut}>
                  <button className="bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-slate-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border border-white/5">Kilépés</button>
                </form>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          
          {/* Felső Üdvözlő Sáv */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
             <div>
                <h2 className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-1">{greeting},</h2>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900">
                   {user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0]}
                </h1>
             </div>
             {cars.length > 0 && (
                 <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-right">
                       <p className="text-[10px] uppercase font-bold text-slate-400">Flotta Egészség</p>
                       <p className={`text-lg font-black ${fleetHealth === 100 ? 'text-emerald-500' : fleetHealth > 50 ? 'text-amber-500' : 'text-red-500'}`}>{fleetHealth}%</p>
                    </div>
                    <div className="h-10 w-1 bg-slate-100 rounded-full"></div>
                    <div className="text-right">
                       <p className="text-[10px] uppercase font-bold text-slate-400">E havi kiadás</p>
                       <p className="text-lg font-black text-slate-900">{totalSpentThisMonth.toLocaleString()} Ft</p>
                    </div>
                 </div>
             )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* --- BAL OSZLOP: Autók --- */}
             <div className="lg:col-span-2 space-y-8">
                
                {/* KM NAPLÓZÁS */}
                {latestCarId && cars.length > 0 && (
                    <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 text-white border border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-slate-300">Gyors Km Rögzítés</p>
                                <p className="text-xs text-slate-400">{cars[0].make} {cars[0].model} • {cars[0].mileage.toLocaleString()} km</p>
                            </div>
                        </div>
                        <form action={logCurrentMileage} className="flex gap-2 w-full md:w-auto">
                            <input type="hidden" name="car_id" value={latestCarId} />
                            <input 
                                type="number" 
                                name="current_mileage" 
                                placeholder="Új km óra állás..."
                                className="px-4 py-2 border-0 rounded-xl w-full md:w-48 focus:ring-2 focus:ring-amber-500 bg-white/10 text-white placeholder-slate-400"
                                min={cars[0].mileage}
                                required
                            />
                            <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl transition-colors shadow-lg">OK</button>
                        </form>
                    </div>
                )}

                {cars.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {cars.map((car) => (
                            <CarCard key={car.id} car={car} />
                        ))}
                        {/* Add New Car Card */}
                        <Link href="/cars/new" className="border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center p-8 hover:bg-white hover:border-amber-400 hover:shadow-xl transition-all group min-h-[300px] cursor-pointer bg-slate-50/50">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-slate-300 group-hover:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </div>
                            <span className="font-bold text-slate-400 group-hover:text-slate-900 text-lg">Új jármű</span>
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">A garázsod üres</h3>
                        <Link href="/cars/new" className="inline-flex items-center gap-2 bg-amber-500 text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-amber-400 transition-colors shadow-lg mt-4">Első autó felvétele</Link>
                    </div>
                )}

             </div>

             {/* --- JOBB OSZLOP: Értesítési Központ (Sidebar) --- */}
             <div className="lg:col-span-1 space-y-6">
                
                {/* 1. Értesítések Doboz */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                           <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                           Emlékeztetők
                        </h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {upcomingReminders.length > 0 ? (
                            upcomingReminders.map((rem: any) => (
                                <div key={rem.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                    <div className="flex-col flex items-center justify-center w-10 h-10 bg-white rounded-lg border border-amber-200 text-amber-700 font-bold text-xs shadow-sm">
                                        <span>{new Date(rem.due_date).getDate()}</span>
                                        <span className="text-[8px] uppercase">{new Date(rem.due_date).toLocaleString('hu-HU', { month: 'short' }).replace('.', '')}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{rem.service_type}</p>
                                        <p className="text-xs text-slate-500 truncate">{rem.cars?.make} {rem.cars?.model}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-4 italic">Nincs közelgő teendő.</p>
                        )}
                    </div>
                </div>

                {/* 2. Legutóbbi Aktivitás Doboz */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                           <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           Legutóbbiak
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((act: any) => (
                                <div key={act.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${act.type === 'fuel' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                                        {act.type === 'fuel' 
                                            ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> 
                                            : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{act.title}</p>
                                        <p className="text-xs text-slate-500 truncate">{act.cars?.make} {act.cars?.model} • {act.cost.toLocaleString()} Ft</p>
                                    </div>
                                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(act.event_date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-4 italic">Nincs előzmény.</p>
                        )}
                    </div>
                </div>

                {/* Gyorsműveletek Gombcsoport (Jobb oldalon) */}
                <div className="grid grid-cols-2 gap-3">
                    {/* (Itt voltak a gombok, de azokat a fő oszlopba raktam vagy törölhetőek, ha van alul sticky bar) */}
                </div>

             </div>

          </div>

        </div>

      </div>
    )
  }

  // --- LOGGED OUT LANDING PAGE ---
  return (
    // JAVÍTÁS: Itt is alkalmazzuk az overscroll-none osztályt
    <div className="h-screen w-full overflow-y-auto overscroll-none bg-slate-950 font-sans text-slate-200 flex flex-col lg:flex-row selection:bg-amber-500/30">
      
      {/* BAL OLDAL (Landing Page tartalom) */}
      <div className="lg:w-[60%] xl:w-[65%] w-full relative bg-slate-950">
        
        {/* Dekorációk és tartalom... (Ez a rész nem változik, a legutóbbi fullos Landing Page) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
           <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-amber-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
           <div className="absolute bottom-[10%] left-[-10%] w-[30vw] h-[30vw] bg-blue-900/10 rounded-full blur-[100px]"></div>
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
        </div>

        <div className="relative z-10 p-6 sm:p-12 lg:p-16 xl:p-24 flex flex-col gap-16 lg:gap-24">
           <div className="space-y-8 animate-in slide-in-from-left-10 duration-700 fade-in">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 relative overflow-hidden">
                   <Image src="/drivesync-logo.png" alt="DriveSync Logo" fill className="object-contain p-2" priority />
                </div>
                <span className="text-xl font-bold tracking-tight text-white uppercase">DriveSync</span>
             </div>
             <div>
               <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 drop-shadow-2xl">
                 Az autód <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">digitális garázsa.</span>
               </h1>
               <p className="text-lg sm:text-xl text-slate-400 max-w-xl leading-relaxed font-light">
                 Felejtsd el a kesztyűtartóban gyűrődő papírokat. Kezeld a szervizkönyvet, a tankolásokat és a költségeket egyetlen prémium felületen.
               </p>
             </div>
             <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500">
                <Badge text="Ingyenes kezdés" />
                <Badge text="Biztonságos felhő" />
                <Badge text="Minden eszközön" />
             </div>
           </div>
           
           {/* Statisztika Sáv */}
            <div className="grid grid-cols-3 gap-4 border-y border-slate-800/50 py-8 bg-slate-900/20 backdrop-blur-sm rounded-2xl animate-in fade-in duration-1000 delay-200">
                <StatCard number="100%" label="Papírmentes" />
                <StatCard number="0 Ft" label="Rejtett költség" />
                <StatCard number="24/7" label="Elérhetőség" />
            </div>

           <div className="pt-10 border-t border-slate-800/50 text-slate-500 text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="italic">"Az egyetlen app, amire az autósoknak szükségük van."</p>
              <div className="text-slate-600 text-xs">© 2025 DriveSync Technologies</div>
           </div>
        </div>
      </div>

      <div className="lg:w-[40%] xl:w-[35%] w-full bg-slate-950 lg:border-l lg:border-white/5 relative flex flex-col justify-center p-6 lg:p-12 shadow-2xl lg:min-h-screen z-20">
        <div className="lg:sticky lg:top-12 w-full max-w-sm mx-auto animate-in slide-in-from-right-10 duration-700 fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Indítsd be a motorokat!</h2>
            <p className="text-slate-400 text-sm">Lépj be a fiókodba, vagy regisztrálj egyet ingyenesen a folytatáshoz.</p>
          </div>
          <div className="space-y-4">
            <Link href="/login" className="group flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-4 text-sm font-bold text-slate-950 shadow-xl shadow-white/5 hover:bg-slate-200 transition-all transform active:scale-[0.98]">
               <span>Bejelentkezés</span>
            </Link>
            <Link href="/login?mode=signup" className="group flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 border border-slate-800 px-4 py-4 text-sm font-bold text-white shadow-lg hover:bg-slate-800 hover:border-slate-700 transition-all transform active:scale-[0.98]">
               <span>Fiók létrehozása</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- SEGÉD KOMPONENSEK ---

function CarCard({ car }: { car: any }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative flex flex-col h-full">
      <Link href={`/cars/${car.id}`} className="block h-full flex flex-col">
        <div className="h-48 bg-slate-100 relative flex items-center justify-center overflow-hidden">
           {car.image_url ? (
             <Image src={car.image_url} alt={`${car.make} ${car.model}`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
           ) : (
             <div className="text-slate-300 font-bold text-4xl uppercase tracking-widest opacity-20">{car.make}</div>
           )}
           <div className={`absolute top-4 right-4 px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider shadow-sm z-20 ${car.status === 'active' ? 'bg-white text-emerald-600' : 'bg-amber-100 text-amber-700'}`}>
              {car.status === 'active' ? 'Aktív' : 'Szerviz'}
           </div>
        </div>
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
               <div>
                 <h3 className="font-black text-slate-900 text-xl uppercase tracking-tight">{car.make}</h3>
                 <p className="font-medium text-slate-500">{car.model}</p>
               </div>
               <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">{car.plate}</span>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-sm">
               <div><p className="text-slate-400 text-xs uppercase font-bold mb-1">Futás</p><p className="font-bold text-slate-800">{car.mileage.toLocaleString()} km</p></div>
               <div><p className="text-slate-400 text-xs uppercase font-bold mb-1">Évjárat</p><p className="font-bold text-slate-800">{car.year}</p></div>
            </div>
          </div>
        </div>
      </Link>
      <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
        <Link href={`/cars/${car.id}/edit`} className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-slate-600 hover:text-amber-500 shadow-sm transition-all"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></Link>
        <form action={deleteCar}><input type="hidden" name="id" value={car.id} /><button className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-slate-600 hover:text-red-500 shadow-sm transition-all"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></form>
      </div>
    </div>
  )
}

function ActionButton({ icon, label }: { icon: string, label: string }) {
  return (
    <button className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-lg hover:-translate-y-0.5 transition-all group h-24 w-full">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-2 group-hover:bg-amber-50 transition-colors">
         {icon === 'gas' && <svg className="w-6 h-6 text-slate-400 group-hover:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
         {icon === 'wrench' && <svg className="w-6 h-6 text-slate-400 group-hover:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
         {icon === 'doc' && <svg className="w-6 h-6 text-slate-400 group-hover:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
         {icon === 'chart' && <svg className="w-6 h-6 text-slate-400 group-hover:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>}
      </div>
      <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 uppercase tracking-wide">{label}</span>
    </button>
  )
}

function StatCard({ label, value, subValue, icon, customColor, alert, highlight, number }: any) {
  if (number) { // Landing Page verzió
      return (
        <div className={`text-center p-4 rounded-xl hover:bg-white/5 transition-colors cursor-default`}>
           <div className="text-3xl font-black text-white mb-1">{number}</div>
           <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
        </div>
      )
  }
  // Dashboard verzió - biztosítjuk, hogy a value sose legyen undefined
  return (
    <div className={`bg-white p-4 rounded-2xl border shadow-sm flex flex-col justify-between h-full border-slate-100 ${highlight ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}>
       <div className="flex justify-between items-start mb-2">
         <div className="text-slate-400">
            {icon === 'total' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            {icon === 'avg' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>}
            {icon === 'service' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            {icon === 'fuel' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
         </div>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase">{label}</p>
        <p className="text-xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  )
}

function Badge({ text }: { text: string }) {
  return <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800 text-slate-400 text-xs font-bold">{text}</span>
}