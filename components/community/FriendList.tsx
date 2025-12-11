'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/supabase/client'
import { UserPlus, User, MoreVertical, MessageSquare, Check, X, Loader2 } from 'lucide-react'
import { addFriendAction, acceptFriendAction, removeFriendAction } from '@/app/community/friend-actions'
import { useRouter } from 'next/navigation'

export default function FriendList({ currentUser, initialFriends }: { currentUser: any, initialFriends: any[] }) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [isAddMode, setIsAddMode] = useState(false)
  const [friendEmail, setFriendEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // --- 1. ONLINE STÁTUSZ FIGYELÉSE (PRESENCE) ---
  useEffect(() => {
    const channel = supabase.channel('global_tracking')
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState()
        const onlineIds = new Set<string>()
        
        // Kigyűjtjük az online user ID-kat
        for (const id in newState) {
            onlineIds.add(id)
        }
        setOnlineUsers(onlineIds)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
            // Bejelentkezünk, hogy MI is online vagyunk
            await channel.track({ online_at: new Date().toISOString(), user_id: currentUser.id })
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [currentUser.id, supabase])

  // --- 2. BARÁT HOZZÁADÁSA ---
  const handleAddFriend = async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      const formData = new FormData()
      formData.append('email', friendEmail)
      
      const res = await addFriendAction(formData)
      if (res?.error) alert(res.error)
      else {
          setIsAddMode(false)
          setFriendEmail('')
      }
      setLoading(false)
  }

  // Barátok rendezése: Online előre, aztán név szerint
  const sortedFriends = [...initialFriends].sort((a, b) => {
      // Itt a friend objektumot kell kinyerni (mivel kétirányú a kapcsolat)
      const friendAId = a.user_id === currentUser.id ? a.friend_id : a.user_id
      const friendBId = b.user_id === currentUser.id ? b.friend_id : b.user_id
      
      const isAOnline = onlineUsers.has(friendAId)
      const isBOnline = onlineUsers.has(friendBId)

      if (isAOnline && !isBOnline) return -1
      if (!isAOnline && isBOnline) return 1
      return 0
  })

  return (
    <div className="flex flex-col gap-4">
        
        {/* FEJLÉC + ADD GOMB */}
        <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Barátok</h3>
            <button 
                onClick={() => setIsAddMode(!isAddMode)}
                className={`p-1.5 rounded-lg transition-colors ${isAddMode ? 'bg-slate-700 text-white' : 'text-blue-500 hover:bg-blue-500/10'}`}
                title="Barát hozzáadása"
            >
                <UserPlus className="w-4 h-4" />
            </button>
        </div>

        {/* HOZZÁADÁS FORM (Lenyíló) */}
        {isAddMode && (
            <form onSubmit={handleAddFriend} className="px-2 animate-in slide-in-from-top-2">
                <div className="flex gap-2">
                    <input 
                        type="email" 
                        placeholder="Email cím..." 
                        value={friendEmail}
                        onChange={(e) => setFriendEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:border-blue-500 outline-none"
                    />
                    <button disabled={loading} className="bg-blue-600 px-2 rounded-lg text-white">
                        {loading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Check className="w-3 h-3"/>}
                    </button>
                </div>
            </form>
        )}

        {/* LISTA */}
        <div className="space-y-1">
            {sortedFriends.length > 0 ? sortedFriends.map((friendship) => {
                // Kiszámoljuk, ki a másik fél (mert én lehetek a user_id és a friend_id is)
                const isRequester = friendship.user_id === currentUser.id
                const friendData = isRequester ? friendship.friend : friendship.initiator // A joinolt adatok
                // Ha nincs joinolt adat (mert egyszerű query volt), akkor csak ID van
                const friendId = isRequester ? friendship.friend_id : friendship.user_id
                
                // Mivel a Supabase query-ben "friend:users!friend_id(...)" formában jön az adat, 
                // a page.tsx-ben kell majd jól lekérni. 
                // Feltételezzük, hogy átadtuk a "friend_email" mezőt valahogy.
                // EGYSZERŰSÍTÉS: Most feltételezzük, hogy az "email" mező megvan a joinból.
                
                const friendEmail = friendData?.email || 'Ismeretlen'
                const isOnline = onlineUsers.has(friendId)
                const isPending = friendship.status === 'pending'

                // Ha függőben lévő kérés és ÉN kaptam (nem én küldtem)
                if (isPending && !isRequester) {
                    return (
                        <div key={friendship.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 mx-1">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">?</div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white truncate max-w-[100px]">{friendEmail.split('@')[0]}</span>
                                    <span className="text-[9px] text-slate-400">Jelölés</span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => acceptFriendAction(friendship.id)} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30"><Check className="w-3 h-3" /></button>
                                <button onClick={() => removeFriendAction(friendship.id)} className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"><X className="w-3 h-3" /></button>
                            </div>
                        </div>
                    )
                }

                // Ha függőben és ÉN küldtem -> ne mutassuk itt, vagy mutassuk halványan
                if (isPending && isRequester) return null;

                // ELFOGADOTT BARÁT
                return (
                    <div 
                        key={friendship.id} 
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-colors group mx-1"
                        onClick={() => router.push(`/community?dm=${friendId}`)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                                    {friendEmail.charAt(0).toUpperCase()}
                                </div>
                                {/* ONLINE PÖTTY */}
                                {isOnline && (
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse"></div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{friendEmail.split('@')[0]}</span>
                                <span className={`text-[10px] ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    {isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                        <button className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <MessageSquare className="w-4 h-4" />
                        </button>
                    </div>
                )
            }) : (
                <p className="text-xs text-slate-600 italic px-4 py-2">Még nincsenek barátaid.</p>
            )}
        </div>
    </div>
  )
}