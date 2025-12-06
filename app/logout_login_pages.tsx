import { createClient } from 'supabase/server'
import { signOut } from './login/action'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation';

// --- SERVER ACTION: Km Naplózása ---
async function logCurrentMileage(formData: FormData) {
    'use server'
    const car_id = formData.get('car_id');
    const current_mileage = parseInt(String(formData.get('current_mileage')));

    if (!car_id || isNaN(current_mileage) || current_mileage <= 0) {
        return redirect(`/?error=Hibás km állás.`);
    }

    const supabase = await createClient();
    
    // Frissítjük az autó aktuális km állását
    const { error } = await supabase
        .from('cars')
        .update({ mileage: current_mileage })
        .eq('id', car_id);
    
    if (error) console.error("Hiba a km frissítéskor:", error);
    
    return redirect('/');
}

// --- FŐ KOMPONENS ---
export default async function Home() {
  const supabase = await createClient()

  // 1. Felhasználó ellenőrzése
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 2. HA BE VAN LÉPVE: Adatok lekérése a Dashboardhoz
  let cars: any[] = []
  let totalCost = 0;
  let avgMonthlyCost = 0;
  let serviceCost = 0;
  let fuelCost = 0;
  let latestCarId = null; 
  let needsAttention = false;

  if (user) {
    const { data } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      cars = data;
      latestCarId = cars.length > 0 ? cars[0].id : null;
    }
    
    // Költségszámítás
    if (cars.length > 0) {
        // JAVÍTÁS: Hozzáadtuk a 'mileage' mezőt a lekérdezéshez!
        const { data: allEvents } = await supabase.from('events').select('cost, created_at, type, car_id, mileage');
        totalCost = allEvents ? allEvents.reduce((sum, event) => sum + (event.cost || 0), 0) : 0;
        serviceCost = allEvents ? allEvents.filter(e => e.type === 'service').reduce((sum, e) => sum + (e.cost || 0), 0) : 0;
        fuelCost = allEvents ? allEvents.filter(e => e.type === 'fuel').reduce((sum, e) => sum + (e.cost || 0), 0) : 0;

        if (allEvents && allEvents.length > 0) {
            const firstEventDate = new Date(allEvents[allEvents.length - 1].created_at);
            const daysSinceFirstEvent = Math.floor((new Date().getTime() - firstEventDate.getTime()) / (1000 * 3600 * 24));
            const monthsSinceFirstEvent = daysSinceFirstEvent / 30.4375;
            avgMonthlyCost = monthsSinceFirstEvent >= 1 ? Math.round(totalCost / monthsSinceFirstEvent) : totalCost;
        }
        
        // Figyelmeztető ellenőrzése
        needsAttention = cars.some(car => {
            const lastServiceEvent = allEvents?.find((e: any) => e.car_id === car.id && e.type === 'service');
            if (!lastServiceEvent) return false;
            
            // Most már elérhető a lastServiceEvent.mileage
            const kmSinceService = car.mileage - (lastServiceEvent.mileage || 0);
            const daysSinceService = Math.floor((new Date().getTime() - new Date(lastServiceEvent.created_at).getTime()) / (1000 * 3600 * 24));
            return kmSinceService > 15000 || daysSinceService > 365;
        });
    }
  }

  // --- NÉZETEK KIVÁLASZTÁSA ---
  if (user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
        {/* Navigáció */}
        <nav className="bg-slate-900 sticky top-0 z-50 shadow-lg border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8">
                  <Image 
                    src="/drivesync-logo.png" 
                    alt="DriveSync Logo" 
                    fill 
                    className="object-contain" 
                    priority
                  />
                </div>
                <span className="text-xl font-bold tracking-tight text-white uppercase">
                  Drive<span className="text-amber-500">Sync</span>
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/settings" className="rounded-full bg-white/10 text-white p-2 hover:bg-white/20 transition-colors hidden sm:block" title="Beállítások">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </Link>
                <form action={signOut}>
                  <button className="bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-slate-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border border-white/5">
                    Kilépés
                  </button>
                </form>
              </div>
            </div>
          </div>
        </nav>

        {/* Dashboard Tartalom */}
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          
          {/* VÉSZHELYZETI SÁV */}
          {needsAttention && (
             <div className="mb-8 p-4 bg-red-100 border border-red-300 rounded-2xl flex items-center justify-between shadow-lg animate-pulse-fast">
                <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <p className="font-bold text-red-800">
                        FIGYELEM: Egy vagy több jármű szervize/műszakija esedékes!
                    </p>
                </div>
                <Link href="/dashboard/alerts" className="text-red-600 font-bold text-sm hover:text-red-800 underline hidden sm:block">
                    Részletek
                </Link>
             </div>
          )}

          {/* Üdvözlő Fejléc */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                Garázs <span className="text-amber-500">Áttekintés</span>
              </h1>
              <p className="text-slate-500 text-lg">
                {cars.length > 0 
                  ? `Jelenleg ${cars.length} járművet kezelsz a flottádban.` 
                  : 'A garázsod jelenleg üres. Rögzítsd az első autódat!'}
              </p>
            </div>
            <Link href="/cars/new" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-900/20 transform hover:-translate-y-1">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Új jármű rögzítése
            </Link>
          </div>
          
          {/* --- STASZTIKAI SÁV (PÉNZÜGY) --- */}
          {cars.length > 0 && (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard icon="total" label="Összes költés" value={`${totalCost.toLocaleString()} Ft`} />
                <StatCard icon="avg" label="Havi átlagköltség" value={`${avgMonthlyCost.toLocaleString()} Ft`} highlight />
                <StatCard icon="service" label="Szerviz költség" value={`${serviceCost.toLocaleString()} Ft`} />
                <StatCard icon="fuel" label="Üzemanyag költség" value={`${fuelCost.toLocaleString()} Ft`} />
             </div>
          )}

          {/* KM NAPLÓZÁS (EXTRA FUNKCIÓ) */}
          {latestCarId && (
            <div className="mb-10 p-6 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="font-bold text-slate-800 text-sm md:text-base">
                    Jelenlegi Km állás: {cars[0].mileage.toLocaleString()} km
                </p>
                <form action={logCurrentMileage} className="flex gap-2 w-full md:w-auto">
                    <input type="hidden" name="car_id" value={latestCarId} />
                    <input 
                        type="number" 
                        name="current_mileage" 
                        placeholder="Naplózza a mostani km-t"
                        className="px-4 py-2 border rounded-xl w-full md:w-48 focus:border-amber-500 text-slate-900 shadow-inner"
                        min={cars[0].mileage}
                        required
                    />
                    <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 py-2 rounded-xl transition-colors whitespace-nowrap shadow-md">
                        Rögzítés
                    </button>
                </form>
            </div>
          )}
          
          {/* Jármű Lista */}
          {cars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cars.map((car) => (
                <CarCard 
                  key={car.id}
                  id={car.id}
                  make={car.make} 
                  model={car.model} 
                  plate={car.plate} 
                  status={car.status === 'active' ? 'OK' : 'Service'} 
                  year={car.year} 
                  mileage={`${car.mileage.toLocaleString()} km`}
                  fuel={car.fuel_type}
                  image_url={car.image_url} // FONTOS: Átadjuk a kép URL-t!
                />
              ))}
              
              {/* Új hozzáadása kártya */}
              <Link href="/cars/new" className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 hover:bg-white hover:border-amber-400 hover:shadow-xl transition-all group h-full min-h-[300px] cursor-pointer bg-slate-50/50">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-slate-300 group-hover:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-bold text-slate-400 group-hover:text-slate-900 text-lg">Új jármű hozzáadása</span>
              </Link>
            </div>
          ) : (
            <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center shadow-sm">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <Image 
                    src="/drivesync-logo.png" 
                    alt="DriveSync Logo" 
                    fill 
                    className="object-contain p-4" 
                    priority
                  />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-2">A garázsod üres</h3>
               <p className="text-slate-500 max-w-md mx-auto mb-8">
                 Kezdd el használni a DriveSync-et az első autód adatainak rögzítésével.
               </p>
               <Link href="/cars/new" className="inline-flex items-center gap-2 bg-amber-500 text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-amber-400 transition-colors shadow-lg">
                 Első autó felvétele
               </Link>
            </div>
          )}

          {/* Gyorsműveletek */}
          {cars.length > 0 && (
            <div className="mt-16">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-slate-900 rounded-full"></span>
                Gyorsműveletek
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <ActionButton icon="gas" label="Gyors Tankolás" />
                 <ActionButton icon="wrench" label="Szervizkönyv" />
                 <ActionButton icon="doc" label="Dokumentumok" />
                 <ActionButton icon="chart" label="Statisztika" />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- LOGGED OUT LANDING PAGE ---
  return (
    <div className="min-h-screen w-full bg-slate-950 font-sans text-slate-200 flex flex-col lg:flex-row selection:bg-amber-500/30 overflow-x-hidden">
      
      {/* BAL OLDAL */}
      <div className="lg:w-[60%] xl:w-[65%] w-full relative bg-slate-950">
        
        {/* Dekorációk */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
           <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-amber-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
           <div className="absolute bottom-[10%] left-[-10%] w-[30vw] h-[30vw] bg-blue-900/10 rounded-full blur-[100px]"></div>
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
        </div>

        <div className="relative z-10 p-6 sm:p-12 lg:p-16 xl:p-24 flex flex-col gap-16 lg:gap-24">
           
           {/* HERO */}
           <div className="space-y-8 animate-in slide-in-from-left-10 duration-700 fade-in">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 relative overflow-hidden">
                   <Image 
                     src="/drivesync-logo.png" 
                     alt="DriveSync Logo" 
                     fill 
                     className="object-contain p-2" 
                     priority
                   />
                </div>
                <span className="text-xl font-bold tracking-tight text-white uppercase">DriveSync</span>
             </div>
             
             <div>
               <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 drop-shadow-2xl">
                 Az autód <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">
                   digitális garázsa.
                 </span>
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

           {/* STATISZTIKA SÁV */}
           <div className="grid grid-cols-3 gap-4 border-y border-slate-800/50 py-8 bg-slate-900/20 backdrop-blur-sm rounded-2xl animate-in fade-in duration-1000 delay-200">
              <StatCard number="100%" label="Papírmentes" />
              <StatCard number="0 Ft" label="Rejtett költség" />
              <StatCard number="24/7" label="Elérhetőség" />
           </div>

           {/* FUNKCIÓK */}
           <div className="animate-in fade-in duration-1000 delay-300">
             <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-10 flex items-center gap-2">
               <span className="w-8 h-[2px] bg-amber-500"></span>
               Miért a DriveSync?
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FeatureBox 
                  title="Okos Költségkövetés" 
                  desc="Lásd át pontosan, mennyibe kerül az autód fenntartása. Tankolás, szerviz, biztosítás - mind egy helyen, látványos grafikonokon."
                  icon="chart"
                />
                <FeatureBox 
                  title="Szerviz Emlékeztető" 
                  desc="Soha többé nem felejted el a műszaki vizsgát vagy az olajcserét. A rendszer időben szól, mielőtt baj lenne."
                  icon="bell"
                />
                <FeatureBox 
                  title="Digitális Szervizkönyv" 
                  desc="Értéknövelő előny eladáskor. Minden javítás visszakövethető, hiteles és rendezett. Nincs több elveszett munkalap."
                  icon="book"
                />
                <FeatureBox 
                  title="Több Autó Kezelése" 
                  desc="Legyen szó a családi flottáról vagy egy céges parkról, korlátlan számú járművet rögzíthetsz és kezelhetsz egyszerre."
                  icon="car"
                />
             </div>
           </div>

           {/* FOOTER */}
           <div className="pt-10 border-t border-slate-800/50 text-slate-500 text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="italic">"Az egyetlen app, amire az autósoknak szükségük van."</p>
              <div className="text-slate-600 text-xs">
                 © 2025 DriveSync Technologies
              </div>
           </div>

        </div>
      </div>

      {/* JOBB OLDAL: LOGIN NAVIGÁCIÓ */}
      <div className="lg:w-[40%] xl:w-[35%] w-full bg-slate-950 lg:border-l lg:border-white/5 relative flex flex-col justify-center p-6 lg:p-12 shadow-2xl lg:min-h-screen z-20">
        <div className="lg:sticky lg:top-12 w-full max-w-sm mx-auto animate-in slide-in-from-right-10 duration-700 fade-in">
          <div className="text-center mb-10">
            <div className="lg:hidden w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-800 relative overflow-hidden">
               <Image 
                 src="/drivesync-logo.png" 
                 alt="DriveSync Logo" 
                 fill 
                 className="object-contain p-2" 
                 priority
               />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
              Indítsd be a motorokat!
            </h2>
            <p className="text-slate-400 text-sm">
              Lépj be a fiókodba, vagy regisztrálj egyet ingyenesen a folytatáshoz.
            </p>
          </div>

          <div className="space-y-4">
            <Link 
              href="/login" 
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-4 text-sm font-bold text-slate-950 shadow-xl shadow-white/5 hover:bg-slate-200 transition-all transform active:scale-[0.98]"
            >
               <span>Bejelentkezés</span>
               <svg className="w-4 h-4 text-slate-900 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>

            <Link 
              href="/login?mode=signup" 
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 border border-slate-800 px-4 py-4 text-sm font-bold text-white shadow-lg hover:bg-slate-800 hover:border-slate-700 transition-all transform active:scale-[0.98]"
            >
               <span>Fiók létrehozása</span>
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-800/50">
             <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                   <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                   <h4 className="text-white font-bold text-sm">Azonnali hozzáférés</h4>
                   <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                     Regisztráció után azonnal hozzáadhatod autóidat és rögzítheted a tankolásokat. Nincs várakozási idő.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- SEGÉD KOMPONENSEK ---

function CarCard({ id, make, model, plate, status, year, mileage, fuel, image_url }: any) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer h-full flex flex-col">
      <Link href={`/cars/${id}`} className="block h-full flex flex-col">
        <div className="h-48 bg-slate-100 relative flex items-center justify-center overflow-hidden">
           
           {/* HA VAN KÉP: Megjelenítjük */}
           {image_url ? (
             <Image 
               src={image_url} 
               alt={`${make} ${model}`} 
               fill 
               className="object-cover group-hover:scale-105 transition-transform duration-500"
             />
           ) : (
             /* HA NINCS KÉP: Marad a placeholder grafika */
             <>
               <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-white opacity-50 group-hover:scale-105 transition-transform duration-500"></div>
               <svg className="w-24 h-24 text-slate-300 group-hover:text-slate-400 transition-colors relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 17v-6" />
                 <circle cx="7" cy="17" r="2" strokeWidth={1.5} />
                 <circle cx="17" cy="17" r="2" strokeWidth={1.5} />
               </svg>
             </>
           )}

           <div className={`absolute top-4 right-4 px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider shadow-sm z-20 ${status === 'active' ? 'bg-white text-emerald-600' : 'bg-amber-100 text-amber-700'}`}>
              {status === 'active' ? 'Aktív' : 'Szerviz'}
           </div>
        </div>
        
        {/* Adatok */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
               <div>
                 <h3 className="font-black text-slate-900 text-xl uppercase tracking-tight">{make}</h3>
                 <p className="font-medium text-slate-500">{model}</p>
               </div>
               <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">{plate}</span>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-sm">
               <div>
                 <p className="text-slate-400 text-xs uppercase font-bold mb-1">Futás</p>
                 <p className="font-bold text-slate-800">{mileage}</p>
               </div>
               <div>
                 <p className="text-slate-400 text-xs uppercase font-bold mb-1">Évjárat</p>
                 <p className="font-bold text-slate-800">{year}</p>
               </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

function StatCard({ icon, label, value, highlight }: any) {
  return (
    <div className={`bg-white p-4 md:p-5 rounded-2xl border shadow-sm flex flex-col justify-between h-full transition-shadow hover:shadow-md border-slate-100 ${highlight ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}>
      <div className="flex justify-between items-start mb-3">
         <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-600">
            {icon === 'total' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            {icon === 'avg' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>}
            {icon === 'service' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            {icon === 'fuel' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
         </div>
      </div>
      <div>
        <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
        <p className={`text-xl md:text-2xl font-black text-slate-900 tracking-tight`}>{value}</p>
      </div>
    </div>
  )
}

function ActionButton({ icon, label }: { icon: string, label: string }) {
  return (
    <button className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-lg hover:-translate-y-0.5 transition-all group h-32">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-50 transition-colors">
         {icon === 'gas' && <svg className="w-6 h-6 text-slate-400 group-hover:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
         {icon === 'wrench' && <svg className="w-6 h-6 text-slate-400 group-hover:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
         {icon === 'doc' && <svg className="w-6 h-6 text-slate-400 group-hover:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
         {icon === 'chart' && <svg className="w-6 h-6 text-slate-400 group-hover:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>}
      </div>
      <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 uppercase tracking-wide">{label}</span>
    </button>
  )
}

function FeatureBox({ title, desc, icon }: { title: string, desc: string, icon: 'chart' | 'bell' | 'book' | 'car' }) {
  return (
    <div className="flex gap-5 group">
      <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-500 shadow-sm group-hover:border-amber-500/30 group-hover:bg-amber-500/10 transition-all duration-300">
         {icon === 'chart' && <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
         {icon === 'bell' && <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
         {icon === 'book' && <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
         {icon === 'car' && <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>}
      </div>
      <div>
        <h4 className="font-bold text-white text-lg mb-2">{title}</h4>
        <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function Badge({ text }: { text: string }) {
  return (
    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800">
      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      {text}
    </span>
  )
}

function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <path d="M12 17v-6" />
      <path d="M8.5 14.5 12 11l3.5 3.5" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M14.7 9a3 3 0 0 0-4.2 0L5 14.5a2.12 2.12 0 0 0 3 3l5.5-5.5" opacity="0.5" />
    </svg>
  )
}