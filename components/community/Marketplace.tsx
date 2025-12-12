'use client'

import { ShoppingBag, MessageCircle, Trash2 } from 'lucide-react'
import CreateListingModal from './CreateListingModal'
import { contactSellerAction, deleteListingAction } from '@/app/community/actions'

export default function Marketplace({ groupId, items, currentUser }: { groupId: string, items: any[], currentUser: any }) {
  
  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Marketplace Toolbar */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-2 text-slate-300 text-sm">
           <ShoppingBag className="w-4 h-4 text-emerald-500" />
           <span className="font-bold text-white">{items.length}</span> termék elérhető
        </div>
        <CreateListingModal groupId={groupId} />
      </div>

      {/* Grid View */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-800">
        {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                <ShoppingBag className="w-12 h-12 mb-4 text-slate-700" />
                <p>Még nincsenek hirdetések ebben a csoportban.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 pb-20">
            {items.map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all group flex flex-col">
                    {/* Kép */}
                    <div className="aspect-video w-full bg-slate-800 relative overflow-hidden">
                        <img 
                            src={item.image_url || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2671&auto=format&fit=crop'} 
                            alt={item.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur px-2 py-1 rounded-md text-emerald-400 font-bold text-sm border border-emerald-500/20 shadow-lg">
                            {Number(item.price).toLocaleString('hu-HU')} Ft
                        </div>
                    </div>

                    {/* Tartalom */}
                    <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-white text-lg leading-tight mb-1">{item.title}</h3>
                        <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-1">{item.description}</p>
                        
                        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-800">
                            {currentUser.id === item.user_id ? (
                                <button 
                                    onClick={() => {
                                        if(confirm('Biztosan törlöd a hirdetést?')) deleteListingAction(item.id)
                                    }}
                                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Törlés
                                </button>
                            ) : (
                                <button 
                                    onClick={() => contactSellerAction(item.user_id)}
                                    className="flex-1 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all border border-slate-700 hover:border-blue-500"
                                >
                                    <MessageCircle className="w-3.5 h-3.5" /> Üzenet az eladónak
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  )
}