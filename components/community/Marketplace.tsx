'use client'
import { Plus, Tag, ShoppingBag } from 'lucide-react'

export default function Marketplace({ groupId, items }: { groupId: string, items: any[] }) {
    return (
        <div className="space-y-6 h-[calc(100vh-140px)] overflow-y-auto pb-10">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Tag className="w-5 h-5 text-amber-500" /> Piactér
                </h3>
                <button className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
                    <Plus className="w-4 h-4" /> Hirdetés feladása
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.length > 0 ? items.map((item) => (
                    <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all group">
                        <div className="h-40 bg-slate-700 relative">
                            {/* Kép helye */}
                            <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-slate-800">
                                {item.image_url ? (
                                    <img src={item.image_url} className="w-full h-full object-cover" />
                                ) : (
                                    <ShoppingBag className="w-10 h-10 opacity-20" />
                                )}
                            </div>
                            <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-amber-400 border border-amber-500/20">
                                {Number(item.price).toLocaleString()} Ft
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-white mb-1 group-hover:text-amber-400 transition-colors truncate">{item.title}</h4>
                            <p className="text-xs text-slate-400 line-clamp-2 mb-3">{item.description || 'Nincs leírás'}</p>
                            <button className="w-full bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-2 rounded-lg transition-colors border border-slate-600">
                                Részletek
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl">
                        <ShoppingBag className="w-12 h-12 mb-3 opacity-50" />
                        <p>Még nincsenek hirdetések ebben a csoportban.</p>
                        <p className="text-xs mt-1">Legyél te az első!</p>
                    </div>
                )}
            </div>
        </div>
    )
}