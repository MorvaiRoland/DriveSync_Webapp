import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ChatWindow from '@/components/community/ChatWindow'
import Marketplace from '@/components/community/Marketplace'
import CreateGroupModal from '@/components/community/CreateGroupModal'
import InviteMemberModal from '@/components/community/InviteMemberModal'
import StartDMModal from '@/components/community/StartDMModal'
// !!! ÚJ IMPORT ITT:
import DeleteDMButton from '@/components/community/DeleteDMButton' 

import { Users, Search, Lock, Globe, MessageCircle, ShoppingBag, ArrowLeft, Menu, LogOut, Phone, Video, MoreVertical } from 'lucide-react'
import { joinGroupAction, leaveGroupAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; tab?: string; dm?: string }>
}) {
  const supabase = await createClient()
  
  // 1. Hitelesítés ellenőrzése
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 2. URL paraméterek feloldása
  const params = await searchParams
  const activeGroupId = params.group
  const activeDmId = params.dm 
  const activeTab = params.tab || 'chat'
  
  // Mobilon vagyunk-e aktív chat nézetben?
  const isMobileViewActive = !!(activeGroupId || activeDmId)

  // 3. Párhuzamos adatlekérés
  const [myGroupsRes, publicGroupsRes, myDmsRes] = await Promise.all([
    supabase.from('group_members').select('group_id, groups(id, name, type, image_url)').eq('user_id', user.id),
    supabase.from('groups').select('*').eq('type', 'public').limit(10),
    supabase.from('direct_messages')
      .select('sender_id, receiver_id, created_at, content')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(50) 
  ])

  const myGroups = myGroupsRes.data || []
  const publicGroups = publicGroupsRes.data || []
  const messages = myDmsRes.data || []

  // 4. DM Partnerek feldolgozása
  const dmPartnerIds = new Set<string>()
  messages.forEach(msg => {
     const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
     dmPartnerIds.add(partnerId)
  })

  if (activeDmId) dmPartnerIds.add(activeDmId)

  let dmPartners: any[] = []
  
  if (dmPartnerIds.size > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email, last_seen')
        .in('id', Array.from(dmPartnerIds))
      
      dmPartners = Array.from(dmPartnerIds).map(id => {
          const profile = profiles?.find((p: any) => p.id === id)
          return profile || { 
            id, 
            email: 'Ismeretlen', 
            full_name: 'Ismeretlen Felhasználó', 
            avatar_url: null 
          }
      })
  }

  const activeDmPartner = activeDmId ? dmPartners.find(p => p.id === activeDmId) : null

  // 5. Aktív csoport adatok
  let activeGroupData = null
  let marketItems: any[] = []
  
  if (activeGroupId) {
    const { data } = await supabase.from('groups').select('*').eq('id', activeGroupId).single()
    activeGroupData = data
    
    if (activeTab === 'market') {
        const { data: items } = await supabase
            .from('group_listings')
            .select('*')
            .eq('group_id', activeGroupId)
            .order('created_at', { ascending: false })
        marketItems = items || []
    }
  }

  const isMember = activeGroupId ? myGroups.some((g: any) => g.group_id === activeGroupId) : false;

  return (
    <div className="h-[100dvh] bg-slate-950 text-slate-200 font-sans flex overflow-hidden pt-0 sm:pt-0">
      
      {/* ==================== BAL OLDALSÁV ==================== */}
      <div className={`
        w-full lg:w-80 flex-col bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 transition-all duration-300
        ${isMobileViewActive ? 'hidden lg:flex' : 'flex'}
      `}>
        
        {/* Sidebar Header */}
        <div className="p-4 pt-16 lg:pt-4 border-b border-slate-800/50 shrink-0 sticky top-0 bg-slate-900 z-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <Users className="text-white w-5 h-5" />
                    </div>
                    Közösség
                </h2>
                <div className="flex gap-2">
                    <CreateGroupModal />
                </div>
            </div>
            
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input type="text" placeholder="Keresés..." className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600" />
            </div>
        </div>

        {/* Listák */}
        <div className="flex-1 overflow-y-auto p-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 hover:scrollbar-thumb-slate-700">
            {/* DM Lista */}
            <div>
                <div className="flex items-center justify-between px-3 mb-2 mt-2">
                     <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Beszélgetések</h3>
                     <StartDMModal />
                </div>
                <div className="space-y-1">
                    {dmPartners.length > 0 ? dmPartners.map((partner) => (
                        <Link 
                            key={partner.id}
                            href={`/community?dm=${partner.id}`}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group relative overflow-hidden
                                ${activeDmId === partner.id 
                                    ? 'bg-blue-600/10 border border-blue-500/20 shadow-lg shadow-blue-900/10' 
                                    : 'hover:bg-slate-800/50 border border-transparent hover:border-slate-800'
                                }`}
                        >
                            {activeDmId === partner.id && <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-blue-500"></div>}
                            <div className="relative shrink-0">
                                {partner.avatar_url ? (
                                    <img src={partner.avatar_url} className="w-11 h-11 rounded-full object-cover border-2 border-slate-800 bg-slate-800" alt={partner.full_name} />
                                ) : (
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-sm text-white border-2 border-slate-800 shadow-inner">
                                        {(partner.full_name || partner.email)?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <span className={`font-semibold text-sm truncate ${activeDmId === partner.id ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                                        {partner.full_name || partner.email?.split('@')[0]}
                                    </span>
                                </div>
                                <span className="text-xs text-slate-500 truncate block group-hover:text-slate-400">
                                    {activeDmId === partner.id ? 'Éppen írsz...' : 'Kattints a megnyitáshoz'}
                                </span>
                            </div>
                        </Link>
                    )) : (
                        <div className="text-center py-8 opacity-50">
                            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                            <p className="text-xs text-slate-500">Nincs még üzeneted.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Csoportok Lista */}
            <div>
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Csoportjaim</h3>
                <div className="space-y-1">
                    {myGroups.map((item: any) => (
                        <Link 
                            key={item.group_id} 
                            href={`/community?group=${item.group_id}`} 
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group 
                                ${activeGroupId === item.group_id 
                                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700' 
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3 truncate">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${activeGroupId === item.group_id ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'}`}></span>
                                <span className="truncate">{item.groups.name}</span>
                            </div>
                            {item.groups.type === 'private' && <Lock className="w-3 h-3 opacity-40" />}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Felfedezés */}
            <div className="pt-4 border-t border-slate-800/50">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-3">Ajánlott Csoportok</h3>
                <div className="space-y-3 px-1">
                    {publicGroups.filter((g:any) => !myGroups.some((mg:any) => mg.group_id === g.id)).map((group) => (
                        <div key={group.id} className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl hover:border-slate-600 transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-bold text-white text-sm truncate pr-2">{group.name}</div>
                                <Globe className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition-colors shrink-0 mt-1" />
                            </div>
                            <form action={joinGroupAction.bind(null, group.id)}>
                                <button type="submit" className="w-full text-xs bg-slate-900 hover:bg-blue-600 hover:text-white py-1.5 rounded-lg text-slate-400 font-semibold transition-all border border-slate-800 hover:border-blue-500">
                                    Csatlakozás
                                </button>
                            </form>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* ==================== JOBB OLDAL (CONTENT) ==================== */}
      <div className={`
        flex-1 flex-col h-[100dvh] relative bg-slate-950 w-full lg:w-auto overflow-hidden
        ${isMobileViewActive ? 'flex fixed inset-0 z-50 lg:static' : 'hidden lg:flex'}
      `}>
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"></div>

        {activeGroupId && activeGroupData ? (
            // A. CSOPORT NÉZET
            <>
                <div className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-20 shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <Link href="/community" className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-full active:bg-slate-800 transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shrink-0">
                            {activeGroupData.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-bold text-white text-base leading-tight truncate">{activeGroupData.name}</h1>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                {activeGroupData.type === 'private' ? 
                                    <span className="flex items-center gap-1 text-amber-500"><Lock className="w-3 h-3" /> Zárt közösség</span> : 
                                    <span className="flex items-center gap-1 text-emerald-400"><Globe className="w-3 h-3" /> Nyilvános</span>
                                }
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800/50">
                            <Link href={`/community?group=${activeGroupId}&tab=chat`} className={`p-1.5 rounded-md transition-all ${activeTab === 'chat' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}>
                                <MessageCircle className="w-5 h-5" />
                            </Link>
                            <Link href={`/community?group=${activeGroupId}&tab=market`} className={`p-1.5 rounded-md transition-all ${activeTab === 'market' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}>
                                <ShoppingBag className="w-5 h-5" />
                            </Link>
                        </div>
                        <div className="flex items-center">
                            {activeGroupData.type === 'private' && (
                                <div className="hidden sm:block"><InviteMemberModal groupId={activeGroupId} /></div>
                            )}
                             {isMember && (
                                <form action={leaveGroupAction.bind(null, activeGroupId)}>
                                    <button type="submit" className="p-2 text-slate-500 hover:text-red-500 transition-colors" title="Kilépés">
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    {activeTab === 'chat' ? (
                        <ChatWindow type="group" id={activeGroupId} currentUser={user} />
                    ) : (
                        <Marketplace groupId={activeGroupId} items={marketItems} currentUser={user} />
                    )}
                </div>
            </>
        ) : activeDmId ? (
            // B. DM NÉZET
            <>
               <div className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-20">
                    <div className="flex items-center gap-3">
                        <Link href="/community" className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-full active:bg-slate-800">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        
                        <div className="relative">
                            {activeDmPartner?.avatar_url ? (
                                <img src={activeDmPartner.avatar_url} className="w-10 h-10 rounded-full object-cover border border-slate-700" alt="" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-white shrink-0">
                                    {(activeDmPartner?.full_name || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                        </div>

                        <div>
                            <h1 className="font-bold text-white text-base leading-tight">
                                {activeDmPartner?.full_name || 'Ismeretlen Felhasználó'}
                            </h1>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                {activeDmPartner?.email ? 'Elérhető' : 'Offline'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400">
                         {/* --- ITT JELENIK MEG A TÖRLÉS GOMB --- */}
                         <DeleteDMButton partnerId={activeDmId} />
                         
                         <div className="w-px h-6 bg-slate-800 mx-1 hidden sm:block"></div>

                         <button className="p-2 hover:bg-slate-800 rounded-full transition-colors hidden sm:block"><Phone className="w-5 h-5" /></button>
                         <button className="p-2 hover:bg-slate-800 rounded-full transition-colors hidden sm:block"><Video className="w-5 h-5" /></button>
                         <button className="p-2 hover:bg-slate-800 rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
                    </div>
               </div>

               <div className="flex-1 overflow-hidden relative bg-slate-950">
                   <ChatWindow type="dm" id={activeDmId} currentUser={user} />
               </div>
            </>
        ) : (
            // C. ÜRES NÉZET
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 bg-slate-950">
                <div className="relative">
                    <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="w-24 h-24 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-slate-800 shadow-2xl relative z-10 rotate-3 transform transition-transform hover:rotate-0">
                        <MessageCircle className="w-10 h-10 text-blue-500" />
                    </div>
                </div>
                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Üdv a Közösségben! 👋</h2>
                <p className="text-slate-400 text-center max-w-sm mb-8 leading-relaxed">
                    Válassz egy beszélgetést a bal oldali menüből, vagy indíts új csevegést a barátaiddal.
                </p>
                <div className="flex gap-4">
                     <CreateGroupModal />
                </div>
            </div>
        )}
      </div>
    </div>
  )
}