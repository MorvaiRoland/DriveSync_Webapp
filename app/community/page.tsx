import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ChatWindow from '@/components/community/ChatWindow'
import Marketplace from '@/components/community/Marketplace'
import CreateGroupModal from '@/components/community/CreateGroupModal'
import InviteMemberModal from '@/components/community/InviteMemberModal'
import StartDMModal from '@/components/community/StartDMModal' // KÉSŐBB HOZZUK LÉTRE, MOST KIHAGYHATOD VAGY KOMMENTELD KI
import { Users, Search, Lock, Globe, MessageCircle, ShoppingBag, ArrowLeft, Mail, Menu, PlusCircle, LogOut, UserPlus, Trash2 } from 'lucide-react'
import { joinGroupAction, leaveGroupAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; tab?: string; dm?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const params = await searchParams
  const activeGroupId = params.group
  const activeDmId = params.dm // Ha privát chat van nyitva
  const activeTab = params.tab || 'chat'

  // 1. Adatok lekérése (Csoportok + DM partnerek)
  // DM partnerek trükkös: lekérjük azokat az üzeneteket, ahol én vagyok a küldő VAGY fogadó, és kiszedjük az egyedi ID-kat.
  // Egyszerűsítés: Most csak lekérjük a csoportokat.
  
  const [myGroupsRes, publicGroupsRes] = await Promise.all([
    supabase.from('group_members').select('group_id, groups(id, name, type, image_url)').eq('user_id', user.id),
    supabase.from('groups').select('*').eq('type', 'public').limit(10)
  ])

  const myGroups = myGroupsRes.data || []
  const publicGroups = publicGroupsRes.data || []

  // DM lista (Demo logika, élesben összetettebb query kell)
  const dmPartners = [
      { id: 'demo_user', email: 'Szerelő Józsi' } // Ide kell majd a valós query
  ]

  // 2. Aktív tartalom betöltése
  let activeGroupData = null
  let marketItems: any[] = []
  
  if (activeGroupId) {
    const { data } = await supabase.from('groups').select('*').eq('id', activeGroupId).single()
    activeGroupData = data
    
    if (activeTab === 'market') {
        const { data: items } = await supabase.from('group_listings').select('*').eq('group_id', activeGroupId).order('created_at', { ascending: false })
        marketItems = items || []
    }
  }

  // Megnézzük, hogy tag vagyok-e a kiválasztott publikus csoportban
  const isMember = activeGroupId ? myGroups.some((g: any) => g.group_id === activeGroupId) : false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex pt-16 overflow-hidden">
      
      {/* BAL SÁV (Lista) - Mobilon eltűnik ha van aktív chat */}
      <div className={`w-full lg:w-80 border-r border-slate-800 flex-col bg-slate-900/50 backdrop-blur-sm h-[calc(100vh-64px)] fixed lg:static z-20 transition-transform duration-300 ${(activeGroupId || activeDmId) ? 'hidden lg:flex' : 'flex'}`}>
        
        <div className="p-4 border-b border-slate-800 space-y-4 shrink-0">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2"><Users className="text-blue-500 w-6 h-6" /> Közösség</h2>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Keresés..." className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <CreateGroupModal />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-700">
            {/* Privát Üzenetek */}
            <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2 flex justify-between items-center">
                    Privát Üzenetek
                    {/* Itt kellene a StartDMModal */}
                    <button className="text-blue-500 hover:text-blue-400"><PlusCircle className="w-4 h-4" /></button>
                </h3>
                {/* DM Lista helye */}
                <p className="text-xs text-slate-600 px-2 italic">Nincs aktív beszélgetés.</p>
            </div>

            {/* Saját Csoportok */}
            <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Csoportjaim</h3>
                <div className="space-y-1">
                    {myGroups.map((item: any) => (
                        <Link key={item.group_id} href={`/community?group=${item.group_id}`} className={`block px-3 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${activeGroupId === item.group_id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="truncate">{item.groups.name}</span>
                            </div>
                            {item.groups.type === 'private' && <Lock className="w-3 h-3 opacity-50" />}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Felfedezés */}
            <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Ajánlott Közösségek</h3>
                <div className="space-y-2">
                    {publicGroups.filter((g:any) => !myGroups.some((mg:any) => mg.group_id === g.id)).map((group) => (
                        <div key={group.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center group hover:border-slate-600">
                            <div className="min-w-0 flex-1 pr-2">
                                <div className="font-bold text-white text-sm truncate">{group.name}</div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5"><Globe className="w-3 h-3" /> Nyilvános</div>
                            </div>
                            {/* CSATLAKOZÁS GOMB */}
                            <form action={joinGroupAction.bind(null, group.id)}>
                                <button type="submit" className="text-xs bg-slate-800 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg text-slate-300 font-bold transition-colors">
                                    Csatlakozás
                                </button>
                            </form>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* JOBB OLDAL (Tartalom) */}
      <div className={`flex-1 flex-col h-[calc(100vh-64px)] relative bg-slate-950 w-full lg:w-auto ${(activeGroupId || activeDmId) ? 'flex' : 'hidden lg:flex'}`}>
        
        {/* Ha van kiválasztva CSOPORT */}
        {activeGroupId && activeGroupData ? (
            <>
                <div className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 sticky top-0">
                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                        <Link href="/community" className="lg:hidden p-2 -ml-2 text-slate-400"><ArrowLeft className="w-5 h-5" /></Link>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shrink-0">
                            {activeGroupData.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-black text-white text-base sm:text-lg leading-tight truncate">{activeGroupData.name}</h1>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                {activeGroupData.type === 'private' ? <Lock className="w-3 h-3 text-amber-500" /> : <Globe className="w-3 h-3 text-blue-400" />}
                                <span className="truncate">{activeGroupData.type === 'private' ? 'Privát' : 'Nyilvános'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Kilépés Gomb (Csak ha tag) */}
                        {isMember && (
                            <form action={leaveGroupAction.bind(null, activeGroupId)}>
                                <button type="submit" className="p-2 text-slate-500 hover:text-red-500 transition-colors" title="Kilépés a csoportból">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </form>
                        )}
                        
                        {/* Tabok */}
                        <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800 shrink-0">
                            <Link href={`/community?group=${activeGroupId}&tab=chat`} className={`p-2 sm:px-4 sm:py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>
                                <MessageCircle className="w-4 h-4" /> <span className="hidden sm:inline">Chat</span>
                            </Link>
                            <Link href={`/community?group=${activeGroupId}&tab=market`} className={`p-2 sm:px-4 sm:py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'market' ? 'bg-amber-500 text-slate-900' : 'text-slate-400'}`}>
                                <ShoppingBag className="w-4 h-4" /> <span className="hidden sm:inline">Piactér</span>
                            </Link>
                        </div>

                        {/* Invite Gomb */}
                        {activeGroupData.type === 'private' && (
                            <div className="hidden sm:block">
                                <InviteMemberModal groupId={activeGroupId} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 p-0 sm:p-4 overflow-hidden bg-slate-950">
                    {activeTab === 'chat' ? (
                        <ChatWindow type="group" id={activeGroupId} currentUser={user} />
                    ) : (
                        <Marketplace groupId={activeGroupId} items={marketItems} />
                    )}
                </div>
            </>
        ) : activeDmId ? (
            // Ha van kiválasztva PRIVÁT CHAT (DM)
            <>
               <div className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-between px-4 sticky top-0 z-10">
                   <div className="flex items-center gap-3">
                       <Link href="/community" className="lg:hidden p-2 -ml-2 text-slate-400"><ArrowLeft className="w-5 h-5" /></Link>
                       <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white">DM</div>
                       <h1 className="font-bold text-white">Privát Beszélgetés</h1>
                   </div>
               </div>
               <div className="flex-1 p-0 sm:p-4 overflow-hidden bg-slate-950">
                   <ChatWindow type="dm" id={activeDmId} currentUser={user} />
               </div>
            </>
        ) : (
            // ÜRES ÁLLAPOT
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-950">
                <Users className="w-16 h-16 mb-4 text-slate-700" />
                <h2 className="text-2xl font-black text-white mb-2">Üdv a Közösségben!</h2>
                <p className="text-sm text-slate-400 max-w-md">Csatlakozz egy csoporthoz bal oldalt, vagy keress rá az autód márkájára.</p>
            </div>
        )}
      </div>
    </div>
  )
}