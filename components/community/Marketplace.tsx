'use client'

import { useState } from 'react'
import { Plus, Tag, ShoppingBag, Search, Filter, MapPin, User, Clock, ChevronRight } from 'lucide-react'

// Segédfüggvény az idő formázásához
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Épp most'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} perce`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} órája`
  return `${Math.floor(diffInSeconds / 86400)} napja`
}

export default function Marketplace({ groupId, items }: { groupId: string, items: any[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest') // 'newest', 'price-asc', 'price-desc'

  // Kliens oldali szűrés és rendezés
  const filteredItems = items
    .filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      // Default: newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      
      {/* 1. VEZÉRLŐPULT (Kereső + Gombok) */}
      <div className="mb-6 space-y-4 shrink-0">
        
        {/* Felső sor: Cím és Feladás gomb */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
              <span className="bg-amber-500/10 p-1.5 rounded-lg text-amber-500 border border-amber-500/20">
                <Tag className="w-5 h-5" />
              </span>
              Csoport Piactér
            </h3>
            <p className="text-xs text-slate-400 mt-1 ml-1">Alkatrészek, kiegészítők és autók adás-vétele.</p>
          </div>
          
          <button className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-900/20 active:scale-95">
            <Plus className="w-4 h-4" /> Hirdetés feladása
          </button>
        </div>

        {/* Alsó sor: Kereső és Szűrő */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Keresés a hirdetések között..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-600"
            />
          </div>
          
          <div className="relative min-w-[160px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2.5 text-sm text-slate-300 focus:border-amber-500 outline-none appearance-none cursor-pointer hover:bg-slate-800 transition-colors"
            >
              <option value="newest">Legújabb elöl</option>
              <option value="price-asc">Olcsók elöl</option>
              <option value="price-desc">Drágák elöl</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-t-[4px] border-t-slate-500 border-x-[4px] border-x-transparent border-b-0"></div>
          </div>
        </div>
      </div>

      {/* 2. HIRDETÉS LISTA (Grid) */}
      <div className="flex-1 overflow-y-auto pb-10 pr-1 -mr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.length > 0 ? filteredItems.map((item) => (
            <div key={item.id} className="group bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1 flex flex-col h-full">
              
              {/* Kép Konténer */}
              <div className="h-48 bg-slate-800 relative overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 bg-slate-800/50">
                    <ShoppingBag className="w-10 h-10 mb-2 opacity-50" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Nincs kép</span>
                  </div>
                )}
                
                {/* Ár Badge */}
                <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">
                  <span className="text-sm font-bold text-white tracking-wide">
                    {Number(item.price).toLocaleString()} <span className="text-amber-500">Ft</span>
                  </span>
                </div>

                {/* Új Badge (ha 24 órán belüli) */}
                {(new Date().getTime() - new Date(item.created_at).getTime()) < 86400000 && (
                   <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                     ÚJ
                   </div>
                )}
              </div>

              {/* Tartalom */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className="font-bold text-white text-base leading-snug group-hover:text-amber-400 transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTimeAgo(item.created_at)}</span>
                    {item.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location}</span>}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {item.description || 'Nincs részletes leírás megadva ehhez a termékhez.'}
                  </p>
                </div>

                {/* Eladó & Gomb */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                      <User className="w-3 h-3 text-slate-400" />
                    </div>
                    <span className="text-xs text-slate-300 font-medium truncate max-w-[80px]">Eladó Neve</span>
                  </div>
                  
                  <button className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border border-slate-700 hover:border-slate-500 flex items-center gap-1 group/btn">
                    Részletek <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-800/50 rounded-3xl bg-slate-900/20">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                <ShoppingBag className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Nincs találat</h3>
              <p className="text-sm max-w-xs text-center mx-auto">
                {searchTerm ? 'Próbálj meg más kulcsszót keresni.' : 'Még nincsenek hirdetések ebben a csoportban.'}
              </p>
              {!searchTerm && (
                <button className="mt-4 text-amber-500 hover:text-amber-400 text-sm font-bold flex items-center gap-1">
                  Legyél te az első! <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}