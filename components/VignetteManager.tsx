'use client'

import { useState } from 'react'
import { Ticket, Calendar, MapPin, Plus, Trash2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { addVignette, deleteVignette } from '@/app/cars/[id]/actions' // Ellenőrizd az elérési utat!

// Segédfüggvény: Érvényesség kiszámítása
function getStatus(validTo: string) {
    const now = new Date()
    const expiry = new Date(validTo)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { label: 'Lejárt', color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700', icon: XCircle }
    if (diffDays < 7) return { label: 'Lejáróban!', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', icon: AlertTriangle }
    return { label: `${diffDays} nap`, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', icon: CheckCircle }
}

export default function VignetteManager({ carId, vignettes }: { carId: string, vignettes: any[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [vignetteType, setVignetteType] = useState('weekly')

    // Csak az aktív vagy a jövőbeni matricákat mutatjuk kiemelten, a régieket alul
    const sortedVignettes = [...vignettes].sort((a, b) => new Date(b.valid_to).getTime() - new Date(a.valid_to).getTime())

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Fejléc */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-purple-500" />
                    E-Matricák
                </h3>
                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${isOpen ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-purple-600 text-white hover:bg-purple-500'}`}
                >
                   {isOpen ? 'Bezárás' : <><Plus className="w-3 h-3" /> Új hozzáadása</>}
                </button>
            </div>

            {/* Új hozzáadása Űrlap (Lenyíló) */}
            {isOpen && (
                <div className="p-5 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-2">
                    <form action={async (formData) => {
                        await addVignette(formData);
                        setIsOpen(false);
                    }} className="space-y-4">
                        <input type="hidden" name="car_id" value={carId} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Típus</label>
                                <select 
                                    name="type" 
                                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={vignetteType}
                                    onChange={(e) => setVignetteType(e.target.value)}
                                >
                                    <option value="weekly">Heti (10 napos)</option>
                                    <option value="monthly">Havi</option>
                                    <option value="annual">Éves Országos</option>
                                    <option value="county">Éves Megyei</option>
                                </select>
                            </div>
                            
                            {vignetteType === 'county' && (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Megye</label>
                                    <select name="region" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                                        <option value="Bács-Kiskun">Bács-Kiskun</option>
<option value="Baranya">Baranya</option>
<option value="Békés">Békés</option>
<option value="Borsod-Abaúj-Zemplén">Borsod-Abaúj-Zemplén</option>
<option value="Csongrád-Csanád">Csongrád-Csanád</option>
<option value="Fejér">Fejér</option>
<option value="Győr-Moson-Sopron">Győr-Moson-Sopron</option>
<option value="Hajdú-Bihar">Hajdú-Bihar</option>
<option value="Heves">Heves</option>
<option value="Jász-Nagykun-Szolnok">Jász-Nagykun-Szolnok</option>
<option value="Komárom-Esztergom">Komárom-Esztergom</option>
<option value="Nógrád">Nógrád</option>
<option value="Pest">Pest</option>
<option value="Somogy">Somogy</option>
<option value="Szabolcs-Szatmár-Bereg">Szabolcs-Szatmár-Bereg</option>
<option value="Tolna">Tolna</option>
<option value="Vas">Vas</option>
<option value="Veszprém">Veszprém</option>
<option value="Zala">Zala</option>
                                    </select>
                                </div>
                            )}

                             <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Érvényesség Kezdete</label>
                                <input type="date" name="valid_from" required className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Érvényesség Vége</label>
                                <input type="date" name="valid_to" required className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                             <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-xl text-sm transition-colors shadow-lg shadow-purple-500/20">
                                 Mentés
                             </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lista */}
            <div className="p-4 space-y-3">
                {sortedVignettes.length > 0 ? (
                    sortedVignettes.map((v) => {
                        const status = getStatus(v.valid_to)
                        const StatusIcon = status.icon
                        
                        return (
                            <div key={v.id} className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all group ${status.bg} ${status.border}`}>
                                
                                <div className="flex items-center gap-4 mb-2 sm:mb-0">
                                    {/* Ikon doboz */}
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm border ${v.type === 'annual' ? 'bg-amber-400 text-slate-900 border-amber-500' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'}`}>
                                        {v.type === 'county' ? 'M' : v.type === 'annual' ? 'É' : v.type === 'monthly' ? 'H' : '10'}
                                    </div>

                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                                            {v.type === 'county' ? `${v.region} megye` : v.type === 'annual' ? 'Éves Országos' : v.type === 'monthly' ? 'Havi Országos' : 'Heti (10 napos)'}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(v.valid_to).toLocaleDateString('hu-HU')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-14 sm:pl-0">
                                    <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-600 ${status.color}`}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {status.label}
                                    </div>

                                    <form action={deleteVignette}>
                                        <input type="hidden" name="id" value={v.id} />
                                        <input type="hidden" name="car_id" value={carId} />
                                        <button className="p-2 text-slate-400 hover:text-red-500 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100" title="Törlés">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-6">
                        <p className="text-sm text-slate-400 italic">Nincs rögzített matrica.</p>
                    </div>
                )}
            </div>
        </div>
    )
}