'use client'

import { useState } from 'react'
import { Plus, Tag, ShoppingBag, Search, MapPin, Clock, ChevronRight, Filter } from 'lucide-react'

// ... formatTimeAgo függvény ...

export default function Marketplace({ groupId, items }: { groupId: string, items: any[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  // Szűrés logika maradhat a régi...
  const filteredItems = items.filter(i => i.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="flex flex-col h-full bg-slate-950">
      
      {/* VEZÉRLŐK - Sticky a tetején */}
      <div className="p-4 space-y-4 bg-slate-900/95 backdrop-blur border-b border-slate-800 sticky top-0 z-10 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Keresés..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-amber-500 outline-none transition-all shadow-inner"
            />
          </div>
          <button className="bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 font-bold px-4 py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform whitespace-nowrap">
            <Plus className="w-4 h-4" /> Hirdetés
          </button>
        </div>
      </div>

      {/* GRID LISTA */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
              <div className="h-48 bg-slate-800 relative overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                   <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-600">
                     <ShoppingBag className="w-10 h-10 opacity-50" />
                   </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-white font-bold text-sm border border-white/10">
                    {Number(item.price).toLocaleString()} Ft
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <h4 className="font-bold text-white mb-1 line-clamp-1">{item.title}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <Clock className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString()}
                    {item.location && <><MapPin className="w-3 h-3 ml-2" /> {item.location}</>}
                </div>
                
                <button className="mt-auto w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white py-2 rounded-lg text-xs font-bold transition-colors border border-slate-700">
                    Megtekintés
                </button>
              </div>
            </div>
          ))}
          
          {filteredItems.length === 0 && (
              <div className="col-span-full text-center py-10 text-slate-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nincs találat a keresési feltételekre.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  )
}