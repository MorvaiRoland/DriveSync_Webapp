'use client'

import Link from 'next/link'
import { 
  Store, Banknote, ArrowRight, Edit3, Eye, TrendingUp 
} from 'lucide-react'

export default function SalesWidget({ car }: { car: any }) {
    const isListed = car.is_listed_on_marketplace;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
            {/* FEJLÉC */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Store className="w-5 h-5 text-amber-500" />
                    Értékesítés
                </h3>
                {isListed && (
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                        Aktív Hirdetés
                    </span>
                )}
            </div>

            <div className="p-5 flex-1 flex flex-col justify-center">
                {isListed ? (
                    // --- 1. ÁLLAPOT: MÁR HIRDETVE VAN ---
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Eladási Ár</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">
                                    {car.price ? parseInt(car.price).toLocaleString() : 'Nincs megadva'} <span className="text-sm text-slate-400 font-medium">Ft</span>
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="pt-2 flex flex-col gap-2">
                            <Link 
                                href={`/marketplace/sell/${car.id}`}
                                className="w-full py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                            >
                                <Edit3 className="w-4 h-4" /> Hirdetés Kezelése
                            </Link>
                            
                            <Link 
                                href={`/marketplace`} // Ideális esetben a konkrét hirdetésre: /marketplace/${car.id}
                                className="w-full py-2.5 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                            >
                                <Eye className="w-4 h-4" /> Publikus nézet
                            </Link>
                        </div>
                    </div>
                ) : (
                    // --- 2. ÁLLAPOT: MÉG NINCS HIRDETVE ---
                    <div className="text-center py-2">
                        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/10 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-3">
                            <Banknote className="w-7 h-7" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">Eladnád az autót?</h4>
                        <p className="text-xs text-slate-500 mb-4 px-2">
                            Hozd létre a hirdetést pár kattintással és érd el a közösséget!
                        </p>
                        
                        <Link 
                            href={`/marketplace/sell/${car.id}`}
                            className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            Hirdetés Feladása <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}