import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ChatWindow from '@/components/community/ChatWindow'
import Marketplace from '@/components/community/Marketplace'
import CreateGroupModal from '@/components/community/CreateGroupModal'
import InviteMemberModal from '@/components/community/InviteMemberModal'
import StartDMModal from '@/components/community/StartDMModal'
import { Users, Search, Lock, Globe, MessageCircle, ShoppingBag, ArrowLeft, Mail, Menu, PlusCircle, LogOut } from 'lucide-react'
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

  // --- 1. ADATOK LEKÉRÉSE ---
  const [myGroupsRes, publicGroupsRes, myDmsRes] = await Promise.all([
    // Saját csoportok
    supabase.from('group_members').select('group_id, groups(id, name, type, image_url)').eq('user_id', user.id),
    // Publikus csoportok
    supabase.from('groups').select('*').eq('type', 'public').limit(10),
    // DM partnerek (utolsó 20 üzenetváltás alapján)
    supabase.from('direct_messages')
      .select('sender_id, receiver_id, created_at')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(20)
  ])

  const myGroups = myGroupsRes.data || []
  const publicGroups = publicGroupsRes.data || []
  
  // DM partnerek egyedi ID-jának kinyerése
  const dmPartnerIds = new Set<string>()
  // Biztonságos ellenőrzés: csak akkor iterálunk, ha van adat
  if (myDmsRes.data) {
      myDmsRes.data.forEach(msg => {
          const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
          dmPartnerIds.add(partnerId)
      })
  }
  
  // Partnerek adatainak lekérése
  let dmPartners: any[] = []
  if (dmPartnerIds.size > 0) {
      // Megpróbáljuk lekérni az email címeket. 
      // Ha nincs 'public_profiles' view, akkor ez a lekérdezés hibát dobhat vagy üreset ad.
      // Ebben az esetben a UI-n 'Ismeretlen' jelenik majd meg, de az oldal működik.
      const { data: profiles } = await supabase.from('public_profiles').select('id, email').in('id', Array.from(dmPartnerIds))
      
      // Ha nem sikerült lekérni (pl. nincs view), akkor generálunk egy listát az ID-kból
      if (!profiles) {
          dmPartners = Array.from(dmPartnerIds).map(id => ({ id, email: 'Ismeretlen Felhasználó' }))
      } else {
          dmPartners = profiles
      }
  }

  // --- 2. AKTÍV TARTALOM ADATAI ---
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

  // Tag vagyok-e az aktív csoportban?
  const isMember = activeGroupId ? myGroups.some((g: any) => g.group_id === activeGroupId) : false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex pt-16 overflow-hidden">
      
      {/* ==================== BAL OLDALSÁV (LISTÁK) ==================== */}
      <div className={`
        w-full lg:w-80 border-r border-slate-800 flex-col bg-slate-900/50 backdrop-blur-sm h-[calc(100vh-64px)] fixed lg:static z-20 transition-transform duration-300
        ${(activeGroupId || activeDmId) ? 'hidden lg:flex' : 'flex'}
      `}>
        
        {/* Fejléc */}
        <div className="p-4 border-b border-slate-800 space-y-4 shrink-0">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Users className="text-blue-500 w-6 h-6" /> Közösség
                </h2>
                <button className="lg:hidden text-slate-400"><Menu className="w-6 h-6" /></button>
            </div>
            
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Keresés..." className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
            
            <CreateGroupModal />
        </div>

        {/* Listák (Görgethető) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-700">
            
            {/* 1. Privát Üzenetek */}
            <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2 flex justify-between items-center">
                    Privát Üzenetek
                    <StartDMModal />
                </h3>
                <div className="space-y-1">
                    {dmPartners.length > 0 ? dmPartners.map((partner) => (
                        <Link 
                            key={partner.id}
                            href={`/community?dm=${partner.id}`}
                            className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors group ${activeDmId === partner.id ? 'bg-purple-600/20 border border-purple-500/50' : 'hover:bg-slate-800/50'}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white border border-white/10 shrink-0">
                                {partner.email ? partner.email.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className={`font-bold text-sm truncate block ${activeDmId === partner.id ? 'text-white' : 'text-slate-300'}`}>
                                    {partner.email ? partner.email.split('@')[0] : 'Ismeretlen'}
                                </span>
                            </div>
                        </Link>
                    )) : (
                        <p className="text-xs text-slate-600 px-2 italic">Nincs aktív beszélgetés.</p>
                    )}
                </div>
            </div>

            {/* 2. Saját Csoportok */}
            <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Csoportjaim</h3>
                <div className="space-y-1">
                    {myGroups.length > 0 ? myGroups.map((item: any) => (
                        <Link 
                            key={item.group_id} 
                            href={`/community?group=${item.group_id}`} 
                            className={`block px-3 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${activeGroupId === item.group_id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="truncate">{item.groups.name}</span>
                            </div>
                            {item.groups.type === 'private' && <Lock className={`w-3 h-3 ${activeGroupId === item.group_id ? 'text-blue-200' : 'text-slate-500'}`} />}
                        </Link>
                    )) : (
                        <p className="text-xs text-slate-600 italic px-2">Még nem vagy tagja egy csoportnak sem.</p>
                    )}
                </div>
            </div>

            {/* 3. Felfedezés */}
            <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Ajánlott Közösségek</h3>
                <div className="space-y-2">
                    {publicGroups.filter((g:any) => !myGroups.some((mg:any) => mg.group_id === g.id)).map((group) => (
                        <div key={group.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center group hover:border-slate-600 transition-colors">
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
                    {publicGroups.length === 0 && <p className="text-xs text-slate-600 px-2">Nincs új csoport.</p>}
                </div>
            </div>
        </div>
      </div>

      {/* ==================== JOBB OLDAL (CHAT / PIACTÉR) ==================== */}
      <div className={`
        flex-1 flex-col h-[calc(100vh-64px)] relative bg-slate-950 w-full lg:w-auto
        ${(activeGroupId || activeDmId) ? 'flex' : 'hidden lg:flex'}
      `}>
        
        {/* A. CSOPORT NÉZET */}
        {activeGroupId && activeGroupData ? (
            <>
                <div className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 sticky top-0">
                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                        <Link href="/community" className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
                        
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shrink-0">
                            {activeGroupData.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-black text-white text-base sm:text-lg leading-tight truncate">{activeGroupData.name}</h1>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                {activeGroupData.type === 'private' ? <Lock className="w-3 h-3 text-amber-500" /> : <Globe className="w-3 h-3 text-blue-400" />}
                                <span className="truncate">{activeGroupData.type === 'private' ? 'Privát Csoport' : 'Nyilvános'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {isMember && (
                            <form action={leaveGroupAction.bind(null, activeGroupId)}>
                                <button type="submit" className="p-2 text-slate-500 hover:text-red-500 transition-colors" title="Kilépés">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </form>
                        )}
                        
                        <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800 shrink-0">
                            <Link href={`/community?group=${activeGroupId}&tab=chat`} className={`p-2 sm:px-4 sm:py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
                                <MessageCircle className="w-4 h-4" /> <span className="hidden sm:inline">Chat</span>
                            </Link>
                            <Link href={`/community?group=${activeGroupId}&tab=market`} className={`p-2 sm:px-4 sm:py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'market' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}>
                                <ShoppingBag className="w-4 h-4" /> <span className="hidden sm:inline">Piactér</span>
                            </Link>
                        </div>

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
            
            // B. PRIVÁT CHAT (DM) NÉZET
            <>
               <div className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-between px-4 sticky top-0 z-10">
                   <div className="flex items-center gap-3">
                       <Link href="/community" className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-white text-xs shrink-0">DM</div>
                       <div>
                           <h1 className="font-bold text-white text-base">Privát Beszélgetés</h1>
                           <p className="text-[10px] text-slate-500">Titkosítva</p>
                       </div>
                   </div>
               </div>
               <div className="flex-1 p-0 sm:p-4 overflow-hidden bg-slate-950">
                   <ChatWindow type="dm" id={activeDmId} currentUser={user} />
               </div>
            </>
        ) : (
            
            // C. ÜRES ÁLLAPOT (HOME)
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-950">
                <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800 shadow-2xl animate-in zoom-in duration-500">
                    <Users className="w-12 h-12 text-slate-700" />
                </div>
                <h2 className="text-3xl font-black text-white mb-3">Üdv a Közösségben! 👋</h2>
                <p className="max-w-md mb-10 text-slate-400 leading-relaxed">
                    Válassz egy csoportot a bal oldali menüből, indíts privát beszélgetést, vagy hozz létre saját klubot.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl w-full">
                    <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl hover:border-blue-500/30 transition-colors group cursor-default">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3 text-blue-400 group-hover:scale-110 transition-transform">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-white mb-1 text-base">Nyilvános Csoportok</h4>
                        <p className="text-xs text-slate-400">Csatlakozz autómárkák (BMW, Audi, Suzuki) rajongói klubjaihoz.</p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl hover:border-purple-500/30 transition-colors group cursor-default">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3 text-purple-400 group-hover:scale-110 transition-transform">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-white mb-1 text-base">Privát Üzenetek</h4>
                        <p className="text-xs text-slate-400">Írj rá az eladókra vagy a szerelődre közvetlenül.</p>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}