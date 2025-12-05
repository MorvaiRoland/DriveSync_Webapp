import { createClient } from 'supabase/server'
import { signOut } from './login/action'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()

  // 1. Felhasználó lekérése
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 2. Autók lekérése az adatbázisból (csak ha be van lépve)
  let cars: any[] = []
  if (user) {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) cars = data
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* --- NAVIGÁCIÓS SÁV --- */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            {/* Logo és Brand */}
            <div className="flex items-center gap-2">
              <Logo className="w-8 h-8 text-amber-500" />
              <span className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                Drive<span className="text-amber-500">Sync</span>
              </span>
            </div>
            
            {/* Jobb oldal (User menu) */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Garázsmester</span>
                    <span className="text-sm text-slate-500 font-medium">{user.email}</span>
                  </div>
                  <form action={signOut}>
                    <button className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors border border-slate-200">
                      Kijelentkezés
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full bg-amber-500 px-5 py-2 text-sm font-bold text-white hover:bg-amber-400 transition-all shadow-md hover:shadow-lg"
                >
                  BELÉPÉS
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        {user ? (
          /* --- DASHBOARD NÉZET (BEJELENTKEZVE) --- */
          <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            
            {/* Fejléc */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Garázs Áttekintés
                </h1>
                <p className="text-slate-500 mt-1">
                  {cars.length > 0 
                    ? `Jelenleg ${cars.length} jármű van a flottádban.` 
                    : 'A garázsod jelenleg üres. Adj hozzá egy autót!'}
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/cars/new" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl group">
                  <svg className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Új jármű rögzítése
                </Link>
              </div>
            </div>

            {/* Jármű Lista */}
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
              Saját Flotta
            </h2>
            
            {cars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Autók renderelése az adatbázisból */}
                {cars.map((car) => (
                  <CarCard 
                    key={car.id}
                    id={car.id} // FONTOS: Átadjuk az ID-t a linkeléshez
                    make={car.make} 
                    model={car.model} 
                    plate={car.plate} 
                    status={car.status === 'active' ? 'OK' : 'Service'} 
                    year={car.year} 
                    mileage={`${car.mileage.toLocaleString()} km`}
                    fuel={car.fuel_type}
                  />
                ))}

                {/* Új Autó Hozzáadása Kártya (mindig megjelenik a lista végén) */}
                <Link href="/cars/new" className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-8 hover:bg-slate-50 hover:border-amber-400 transition-all group h-full min-h-[200px] cursor-pointer">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                    <svg className="w-6 h-6 text-slate-400 group-hover:text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="font-semibold text-slate-600 group-hover:text-amber-700">Új jármű hozzáadása</span>
                </Link>
              </div>
            ) : (
              // Üres állapot (Empty State)
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Logo className="w-10 h-10 text-slate-300" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900">A garázsod üres</h3>
                 <p className="text-slate-500 max-w-md mx-auto mt-2 mb-8">
                   Kezdd el használni a DriveSync-et az első autód adatainak rögzítésével.
                 </p>
                 <Link href="/cars/new" className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-amber-400 transition-colors shadow-lg">
                   Első autó felvétele
                 </Link>
              </div>
            )}

            {/* Gyorsműveletek (Csak akkor, ha van autó) */}
            {cars.length > 0 && (
              <>
                <h2 className="text-lg font-bold text-slate-900 mt-12 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-slate-900 rounded-full"></span>
                  Gyorsműveletek
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <ActionButton icon="gas" label="Tankolás rögzítése" />
                   <ActionButton icon="wrench" label="Szervizkönyv" />
                   <ActionButton icon="doc" label="Dokumentumok" />
                   <ActionButton icon="chart" label="Statisztika" />
                </div>
              </>
            )}

          </div>
        ) : (
          /* --- LANDING PAGE NÉZET (KIJELENTKEZVE) --- */
          <div>
            <div className="relative isolate pt-14 lg:pt-20 overflow-hidden bg-slate-900">
              <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#F59E0B] to-[#1e293b] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
              </div>

              <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
                <div className="mx-auto max-w-2xl text-center">
                  <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl mb-6 uppercase">
                    Drive<span className="text-amber-500">Sync</span>
                  </h1>
                  <p className="text-2xl font-serif italic text-amber-500 mb-6">"Just drive. We Sync."</p>
                  <p className="mt-6 text-lg leading-8 text-slate-300">
                    A modern autótulajdonosok digitális asszisztense. Tartsd karban járműveidet, kövesd a költségeket és kezeld a szervizkönyvet egyetlen prémium felületen.
                  </p>
                  <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link
                      href="/login?mode=signup"
                      className="rounded-md bg-amber-500 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg hover:bg-amber-400 transition-all uppercase tracking-wide"
                    >
                      Regisztráció
                    </Link>
                    <Link href="/login" className="text-sm font-semibold leading-6 text-white hover:text-amber-400 transition-colors">
                      Belépés a garázsba <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// --- Segéd Komponensek ---

function CarCard({ id, make, model, plate, status, year, mileage, fuel }: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="h-32 bg-slate-100 relative flex items-center justify-center group">
         <div className="absolute inset-0 bg-slate-200 opacity-0 group-hover:opacity-10 transition-opacity"></div>
         {/* Placeholder Autó Kép */}
         <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 17v-6" />
           <circle cx="7" cy="17" r="2" strokeWidth={1} />
           <circle cx="17" cy="17" r="2" strokeWidth={1} />
         </svg>
         <div className={`absolute top-3 right-3 px-2 py-1 text-xs font-bold rounded uppercase ${status === 'OK' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {status === 'OK' ? 'Aktív' : 'Szerviz'}
         </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-slate-900 text-lg">{make} <span className="font-normal text-slate-600">{model}</span></h3>
        <p className="text-xs font-mono bg-slate-100 text-slate-600 inline-block px-2 py-0.5 rounded mt-1 border border-slate-200">{plate}</p>
        
        <div className="mt-4 space-y-2 text-sm text-slate-600">
           <div className="flex justify-between border-b border-slate-50 pb-1">
             <span>Km óra állás:</span>
             <span className="font-semibold text-slate-900">{mileage}</span>
           </div>
           <div className="flex justify-between border-b border-slate-50 pb-1">
             <span>Évjárat:</span>
             <span className="font-semibold text-slate-900">{year}</span>
           </div>
           <div className="flex justify-between">
             <span>Üzemanyag:</span>
             <span className="font-semibold text-slate-900 capitalize">{fuel === 'petrol' ? 'Benzin' : fuel === 'diesel' ? 'Dízel' : fuel === 'electric' ? 'Elektromos' : fuel}</span>
           </div>
        </div>

        <Link 
          href={`/cars/${id}`}
          className="block w-full mt-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
           Részletek
        </Link>
      </div>
    </div>
  )
}

function ActionButton({ icon, label }: { icon: string, label: string }) {
  return (
    <button className="flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all group">
      <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mb-2 group-hover:bg-amber-100 transition-colors">
         {icon === 'gas' && <svg className="w-5 h-5 text-slate-600 group-hover:text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
         {icon === 'wrench' && <svg className="w-5 h-5 text-slate-600 group-hover:text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
         {icon === 'doc' && <svg className="w-5 h-5 text-slate-600 group-hover:text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
         {icon === 'chart' && <svg className="w-5 h-5 text-slate-600 group-hover:text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>}
      </div>
      <span className="text-xs font-semibold text-slate-700">{label}</span>
    </button>
  )
}

function Logo({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <path d="M12 17v-6" />
      <path d="M8.5 14.5 12 11l3.5 3.5" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M14.7 9a3 3 0 0 0-4.2 0L5 14.5a2.12 2.12 0 0 0 3 3l5.5-5.5" opacity="0.5" />
    </svg>
  )
}