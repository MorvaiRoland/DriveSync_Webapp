'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/supabase/client'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import StartDMModal from './StartDMModal'

export default function DmList({ currentUser, initialPartners, activeDmId }: { currentUser: any, initialPartners: any[], activeDmId?: string }) {
  const [partners, setPartners] = useState<any[]>(initialPartners)
  const supabase = createClient()

  useEffect(() => {
    // Ha az initialPartners változik (pl. navigáció), frissítjük a state-et
    setPartners(initialPartners)
  }, [initialPartners])

  useEffect(() => {
    // REALTIME FIGYELÉS: Ha valaki ír nekem (aki még nincs a listán)
    const channel = supabase.channel('dm_list_updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'direct_messages',
          // Csak azt figyeljük, ha ÉN kapok üzenetet (receiver_id = én)
          filter: `receiver_id=eq.${currentUser.id}` 
        }, 
        async (payload) => {
          const newMsg = payload.new
          const senderId = newMsg.sender_id

          // Megnézzük, hogy ez a küldő már benne van-e a listában
          const exists = partners.some(p => p.id === senderId)

          if (!exists) {
            // Ha nincs, lekérjük az adatait (email)
            // Feltételezzük, hogy van public_profiles vagy auth.users olvasási jog (RPC)
            // Itt most egy egyszerű trükköt használunk RPC-vel vagy public_view-val
            const { data: userData } = await supabase
                .from('public_profiles') // Vagy auth.users ha van jog
                .select('id, email')
                .eq('id', senderId)
                .single()

            if (userData) {
                // Hozzáadjuk a lista ELEJÉRE
                setPartners(prev => [userData, ...prev])
            }
          } else {
             // Ha már benne van, akkor is érdemes lenne előre sorolni (opcionális)
             // setPartners(prev => [prev.find(p => p.id === senderId), ...prev.filter(p => p.id !== senderId)])
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentUser.id, partners, supabase])

  return (
    <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2 flex justify-between items-center">
            Privát Üzenetek
            <StartDMModal />
        </h3>
        <div className="space-y-1">
            {partners.length > 0 ? partners.map((partner) => (
                <Link 
                    key={partner.id}
                    href={`/community?dm=${partner.id}`}
                    className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors group ${activeDmId === partner.id ? 'bg-purple-600/20 border border-purple-500/50' : 'hover:bg-slate-800/50'}`}
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white border border-white/10 shrink-0">
                        {partner.email?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className={`font-bold text-sm truncate block ${activeDmId === partner.id ? 'text-white' : 'text-slate-300'}`}>
                            {partner.email?.split('@')[0] || 'Felhasználó'}
                        </span>
                    </div>
                    {/* Opcionális: Olvasatlan jelző (ha tárolnánk) */}
                    {/* <div className="w-2 h-2 bg-purple-500 rounded-full"></div> */}
                </Link>
            )) : (
                <p className="text-xs text-slate-600 px-2 italic">Nincs aktív beszélgetés.</p>
            )}
        </div>
    </div>
  )
}