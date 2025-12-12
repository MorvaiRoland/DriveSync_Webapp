import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ChatWindow from '@/components/community/ChatWindow'
import Marketplace from '@/components/community/Marketplace'
import CreateGroupModal from '@/components/community/CreateGroupModal'
import InviteMemberModal from '@/components/community/InviteMemberModal'
import StartDMModal from '@/components/community/StartDMModal'
import { Users, Search, Lock, Globe, MessageCircle, ShoppingBag, ArrowLeft, Mail, Menu, LogOut, ChevronRight } from 'lucide-react'
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
  const activeDmId = params.dm 
  const activeTab = params.tab || 'chat'
  
  // Mobilon vagyunk-e aktív nézetben?
  const isMobileViewActive = !!(activeGroupId || activeDmId)

  // --- ADATLEKÉRÉS (Párhuzamosan a gyorsaságért) ---
  const [myGroupsRes, publicGroupsRes, myDmsRes] = await Promise.all([
    supabase.from('group_members').select('group_id, groups(id, name, type, image_url)').eq('user_id', user.id),
    supabase.from('groups').select('*').eq('type', 'public').limit(15),
    supabase.from('direct_messages')
      .select('sender_id, receiver_id, created_at')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(30)
  ])

  const myGroups = myGroupsRes.data || []
  const publicGroups = publicGroupsRes.data || []
  
  // DM partnerek deduplikálása és adatlekérés
  const dmPartnerIds = new Set<string>()
  myDmsRes.data?.forEach(msg => {
     const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
     dmPartnerIds.add(partnerId)
  })
  
  let dmPartners: any[] = []
  if (dmPartnerIds.size > 0) {
      // Itt feltételezzük, hogy van 'profiles' tábla vagy 'public_profiles' view
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, email, avatar_url').in('id', Array.from(dmPartnerIds))
      
      dmPartners = Array.from(dmPartnerIds).map(id => {
          const profile = profiles?.find((p: any) => p.id === id)
          return profile || { id, email: 'Ismeretlen', full_name: 'Ismeretlen Felhasználó' }
      })
  }

  // Aktív csoport adatok
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

  const isMember = activeGroupId ? myGroups.some((g: any) => g.group_id === activeGroupId) : false;

  return (
    // 100dvh: Dynamic Viewport Height - Mobilon a címsor mozgását is kezeli
    <div className="h-[100dvh] bg-slate-950 text-slate-200 font-sans flex overflow-hidden pt-16 sm:pt-0">
      
      {/* ==================== BAL OLDALSÁV (LISTÁK) ==================== */}
      <div className={`
        w-full lg:w-80 flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300
        ${isMobileViewActive ? 'hidden lg:flex' : 'flex'}
      `}>
        
        {/* Sidebar Fejléc */}
        <div className="p-4 border-b border-slate-800 shrink-0 bg-slate-900/95 backdrop-blur z-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Users className="text-blue-500 w-6 h-6" /> Közösség
                </h2>
                {/* Mobilon menü gomb (opcionális) */}
                <button className="lg:hidden p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"><Menu className="w-5 h-5" /></button>
            </div>
            
            <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Keresés..." className="w-full bg-slate-950 border border-slate-700/50 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors shadow-inner" />
            </div>
            
            <CreateGroupModal />
        </div>

        {/* Görgethető Lista */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            
            {/* 1. Privát Üzenetek */}
            <div>
                <div className="flex items-center justify-between px-2 mb-2">
                     <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Üzenetek</h3>
                     <StartDMModal />
                </div>
                
                <div className="space-y-0.5">
                    {dmPartners.length > 0 ? dmPartners.map((partner) => (
                        <Link 
                            key={partner.id}
                            href={`/community?dm=${partner.id}`}
                            className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all group ${activeDmId === partner.id ? 'bg-blue-600/10 border border-blue-500/20' : 'hover:bg-slate-800 border border-transparent'}`}
                        >
                            <div className="relative">
                                {partner.avatar_url ? (
                                    <img src={partner.avatar_url} className="w-10 h-10 rounded-full object-cover border border-slate-700" alt="" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white border border-slate-700 shadow-lg">
                                        {partner.email?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {/* Online indicator place (opcionális) */}
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className={`font-bold text-sm truncate block ${activeDmId === partner.id ? 'text-blue-400' : 'text-slate-200 group-hover:text-white'}`}>
                                    {partner.full_name || partner.email?.split('@')[0]}
                                </span>
                                <span className="text-xs text-slate-500 truncate block">Kattints a megnyitáshoz</span>
                            </div>
                        </Link>
                    )) : (
                        <p className="text-xs text-slate-600 px-3 py-2 italic text-center">Nincs még üzeneted.</p>
                    )}
                </div>
            </div>

            {/* 2. Saját Csoportok */}
            <div>
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 mb-2">Csoportjaim</h3>
                <div className="space-y-1">
                    {myGroups.map((item: any) => (
                        <Link 
                            key={item.group_id} 
                            href={`/community?group=${item.group_id}`} 
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${activeGroupId === item.group_id ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <div className="flex items-center gap-3 truncate">
                                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                                <span className="truncate">{item.groups.name}</span>
                            </div>
                            {item.groups.type === 'private' && <Lock className="w-3 h-3 opacity-50" />}
                        </Link>
                    ))}
                    {myGroups.length === 0 && <p className="text-xs text-slate-600 px-3 italic">Nem vagy tagja csoportnak.</p>}
                </div>
            </div>

            {/* 3. Felfedezés */}
            <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 mb-3">Ajánlott</h3>
                <div className="space-y-3">
                    {publicGroups.filter((g:any) => !myGroups.some((mg:any) => mg.group_id === g.id)).map((group) => (
                        <div key={group.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl hover:border-slate-600 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-bold text-white text-sm truncate pr-2">{group.name}</div>
                                <Globe className="w-3 h-3 text-slate-500 shrink-0 mt-1" />
                            </div>
                            <form action={joinGroupAction.bind(null, group.id)}>
                                <button type="submit" className="w-full text-xs bg-slate-800 hover:bg-emerald-600 hover:text-white py-1.5 rounded-lg text-slate-400 font-bold transition-colors border border-slate-700">
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
        
        {/* A. CSOPORT NÉZET */}
        {activeGroupId && activeGroupData ? (
            <>
                <div className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-between px-4 shrink-0 z-20">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <Link href="/community" className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-full active:bg-slate-800 transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shrink-0">
                            {activeGroupData.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-bold text-white text-base leading-tight truncate">{activeGroupData.name}</h1>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                {activeGroupData.type === 'private' ? 
                                    <span className="flex items-center gap-1 text-amber-500"><Lock className="w-3 h-3" /> Privát</span> : 
                                    <span className="flex items-center gap-1 text-blue-400"><Globe className="w-3 h-3" /> Nyilvános</span>
                                }
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-2">
                        {isMember && (
                            <form action={leaveGroupAction.bind(null, activeGroupId)}>
                                <button type="submit" className="p-2 text-slate-500 hover:text-red-500 transition-colors" title="Kilépés">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </form>
                        )}
                        
                        <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                            <Link href={`/community?group=${activeGroupId}&tab=chat`} className={`p-2 rounded-md transition-all ${activeTab === 'chat' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}>
                                <MessageCircle className="w-5 h-5" />
                            </Link>
                            <Link href={`/community?group=${activeGroupId}&tab=market`} className={`p-2 rounded-md transition-all ${activeTab === 'market' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-white'}`}>
                                <ShoppingBag className="w-5 h-5" />
                            </Link>
                        </div>
                        
                        {activeGroupData.type === 'private' && (
                             <div className="hidden sm:block"><InviteMemberModal groupId={activeGroupId} /></div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative bg-slate-950">
                    {activeTab === 'chat' ? (
                        <ChatWindow type="group" id={activeGroupId} currentUser={user} />
                    ) : (
                        <Marketplace groupId={activeGroupId} items={marketItems} />
                    )}
                </div>
            </>
        ) : activeDmId ? (
            // B. DM NÉZET
            <>
               <div className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur flex items-center gap-3 px-4 shrink-0 z-20">
                    <Link href="/community" className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-full active:bg-slate-800">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-white shrink-0">
                        DM
                    </div>
                    <div>
                        <h1 className="font-bold text-white text-base">Beszélgetés</h1>
                        <p className="text-xs text-slate-500 flex items-center gap-1"><Lock className="w-3 h-3" /> Végpontok között titkosítva</p>
                    </div>
               </div>
               <div className="flex-1 overflow-hidden relative bg-slate-950">
                   <ChatWindow type="dm" id={activeDmId} currentUser={user} />
               </div>
            </>
        ) : (
            // C. ÜRES NÉZET (Desktop only)
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
                <div className="w-24 h-24 bg-slate-900/50 rounded-full flex items-center justify-center mb-6 border border-slate-800 shadow-2xl">
                    <MessageCircle className="w-10 h-10 text-slate-600" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Üdv a Közösségben! 👋</h2>
                <p className="text-slate-400 text-center max-w-sm mb-8">
                    Válassz egy beszélgetést a bal oldali menüből, vagy indíts újat.
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