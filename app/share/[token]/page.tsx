import { createClient } from '@/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle2, Calendar, Gauge, Fuel, Wrench, ShieldCheck, FileText } from 'lucide-react'

// Layout nélküli oldal, hogy teljesen egyedi legyen a design
export default async function SharedCarPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const supabase = await createClient()

    // 1. Autó lekérése token alapján (RLS policy engedi public-nak)
    const { data: car } = await supabase
        .from('cars')
        .select('*')
        .eq('share_token', token)
        .eq('is_for_sale', true) // Csak ha be van kapcsolva
        .single()

    if (!car) return notFound()

    // 2. Események lekérése
    const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('car_id', car.id)
        .order('event_date', { ascending: false })

    // Adatvédelem: Érzékeny adatok maszkolása
    const displayPlate = car.hide_sensitive ? '******' : car.plate
    const displayVin = car.hide_sensitive ? '*****************' : car.vin

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
            {/* --- HEADER IMAGE --- */}
            <div className="relative h-[40vh] bg-slate-900 overflow-hidden">
                {car.image_url ? (
                    <Image src={car.image_url} alt="Car" fill className="object-cover" priority />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/20 text-6xl font-black">DRIVESYNC</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-black/30"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-lg shadow-indigo-600/30">
                            <CheckCircle2 className="w-3 h-3" /> Ellenőrzött előélet
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-2 drop-shadow-sm">
                            {car.make} <span className="text-indigo-600">{car.model}</span>
                        </h1>
                        <p className="text-xl text-slate-600 font-mono font-bold">{displayPlate}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12 -mt-10 relative z-10">
                
                {/* --- FŐ ADATOK KÁRTYA --- */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <StatBox label="Évjárat" value={car.year} icon={Calendar} />
                    <StatBox label="Futásteljesítmény" value={`${car.mileage.toLocaleString()} km`} icon={Gauge} highlight />
                    <StatBox label="Üzemanyag" value={car.fuel_type} icon={Fuel} capitalize />
                    <StatBox label="Műszaki" value={car.mot_expiry ? new Date(car.mot_expiry).getFullYear() : '-'} icon={ShieldCheck} />
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    
                    {/* --- BAL: LEÍRÁS & EXTRA --- */}
                    <div className="md:col-span-1 space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-slate-400" /> Jármű adatok
                            </h3>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-sm space-y-3">
                                <Row label="Szín" value={car.color || '-'} />
                                <Row label="Alvázszám" value={displayVin} mono />
                                <Row label="Hengerűrtartalom" value={car.engine_size ? `${car.engine_size} cm³` : '-'} />
                                <Row label="Teljesítmény" value={car.power_hp ? `${car.power_hp} LE` : '-'} />
                            </div>
                        </div>

                        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                            <p className="text-indigo-900 font-bold text-sm mb-2">Miért DriveSync?</p>
                            <p className="text-indigo-700/80 text-xs leading-relaxed">
                                Ennek az autónak a tulajdonosa digitálisan vezette a szervizkönyvet a DriveSync rendszerében. Ez garantálja az átláthatóságot és a gondos karbantartást.
                            </p>
                        </div>
                    </div>

                    {/* --- JOBB: IDŐVONAL --- */}
                    <div className="md:col-span-2">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Wrench className="w-5 h-5 text-slate-400" /> Szerviztörténet & Események
                        </h3>

                        <div className="space-y-0 relative border-l-2 border-slate-100 ml-3">
                            {events && events.length > 0 ? (
                                events.map((ev: any) => (
                                    <div key={ev.id} className="relative pl-8 pb-8 group">
                                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm ${ev.type === 'service' ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                                        
                                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
                                            <span className="font-mono text-xs font-bold text-slate-400">
                                                {new Date(ev.event_date).toLocaleDateString('hu-HU')}
                                            </span>
                                            <h4 className="font-bold text-slate-800 text-lg">{ev.title}</h4>
                                        </div>

                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 inline-block w-full">
                                            <div className="flex items-center gap-4 text-sm mb-2">
                                                <span className="font-bold text-slate-700">{ev.mileage.toLocaleString()} km</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${ev.type === 'service' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {ev.type === 'fuel' ? 'Tankolás' : ev.type === 'service' ? 'Szerviz' : 'Egyéb'}
                                                </span>
                                            </div>
                                            
                                            {ev.notes && <p className="text-slate-500 text-sm mb-2">{ev.notes}</p>}

                                            {!car.hide_prices && ev.cost > 0 && (
                                                <div className="text-xs font-bold text-slate-400">
                                                    Költség: {ev.cost.toLocaleString()} Ft
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 italic pl-8">Nincs rögzített esemény.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-20 text-center border-t border-slate-200 pt-8">
                    <p className="text-slate-400 text-xs font-mono mb-2">Generálva a DriveSync által • {new Date().toLocaleDateString()}</p>
                    <a href="https://drivesync-hungary.hu" className="text-indigo-600 font-bold text-sm hover:underline">
                        Saját autód kezeléséhez kattints ide
                    </a>
                </div>
            </div>
        </div>
    )
}

// Kis segédkomponensek a tiszta kódért
function StatBox({ label, value, icon: Icon, highlight, capitalize }: any) {
    return (
        <div className="flex flex-col items-center text-center gap-2">
            <div className={`p-3 rounded-full ${highlight ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">{label}</p>
                <p className={`text-lg font-black ${capitalize ? 'capitalize' : ''} ${highlight ? 'text-indigo-900' : 'text-slate-900'}`}>{value}</p>
            </div>
        </div>
    )
}

function Row({ label, value, mono }: any) {
    return (
        <div className="flex justify-between items-center pb-2 border-b border-slate-50 last:border-0 last:pb-0">
            <span className="text-slate-500">{label}</span>
            <span className={`font-bold text-slate-900 ${mono ? 'font-mono' : ''}`}>{value}</span>
        </div>
    )
}