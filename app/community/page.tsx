import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ChatWindow from '@/components/community/ChatWindow'
import Marketplace from '@/components/community/Marketplace'
import CreateGroupModal from '@/components/community/CreateGroupModal'
import InviteMemberModal from '@/components/community/InviteMemberModal'
import { Users, Search, Lock, Globe, MessageCircle, ShoppingBag, ArrowLeft, Mail, Menu, PlusCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; tab?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const params = await searchParams
  const activeGroupId = params.group
  const activeTab = params.tab || 'chat' 

  // 1. Adatok lekérése
  const [myGroupsRes, publicGroupsRes] = await Promise.all([
    supabase.from('group_members').select('group_id, groups(id, name, type, image_url)').eq('user_id', user.id),
    supabase.from('groups').select('*').eq('type', 'public').limit(5)
  ])

  const myGroups = myGroupsRes.data || []
  const publicGroups = publicGroupsRes.data || []

  // 2. Aktív csoport adatok
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex pt-16 overflow-hidden">
      
      {/* ==================== BAL OLDALSÁV (Lista) ==================== */}
      {/* Mobilon eltűnik, ha van aktív csoport */}
      <div className={`
        w-full lg:w-80 border-r border-slate-800 flex-col bg-slate-900/50 backdrop-blur-sm h-[calc(100vh-64px)] fixed lg:static z-20 transition-transform duration-300
        ${activeGroupId ? 'hidden lg:flex' : 'flex'}
      `}>
        
        {/* Fejléc: Kereső & Új csoport */}
        <div className="p-4 border-b border-slate-800 space-y-4 shrink-0">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Users className="text-blue-500 w-6 h-6" /> Közösség
                </h2>
                {/* Mobilon menü gomb (opcionális) */}
                <button className="lg:hidden text-slate-400"><Menu className="w-6 h-6" /></button>
            </div>
            
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Keresés..." className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
            
            <CreateGroupModal />
        </div>

        {/* Listák (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-700">
            
            {/* 1. Privát Üzenetek (Fake Demo Data - Ide jönne a DB query) */}
            <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2 flex justify-between items-center">
                    Privát Üzenetek
                    <button className="text-blue-500 hover:text-blue-400"><PlusCircle className="w-4 h-4" /></button>
                </h3>
                <div className="space-y-1">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                            SJ
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                                <span className="font-bold text-sm text-white truncate">Szerelő Józsi</span>
                                <span className="text-[10px] text-slate-500">12:30</span>
                            </div>
                            <p className="text-xs text-slate-400 truncate group-hover:text-slate-300">Mikor tudnád hozni az autót?</p>
                        </div>
                    </div>
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
                                <div className={`w-2 h-2 rounded-full shrink-0 ${activeGroupId === item.group_id ? 'bg-white' : 'bg-slate-600 group-hover:bg-blue-500'}`}></div>
                                <span className="truncate">{item.groups.name}</span>
                            </div>
                            {item.groups.type === 'private' && <Lock className={`w-3 h-3 ${activeGroupId === item.group_id ? 'text-blue-200' : 'text-slate-600'}`} />}
                        </Link>
                    )) : (
                        <p className="text-xs text-slate-600 italic px-4 py-2 bg-slate-900/50 rounded-lg">Még nem vagy tagja egy csoportnak sem.</p>
                    )}
                </div>
            </div>

            {/* 3. Felfedezés */}
            <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Ajánlott Közösségek</h3>
                <div className="space-y-2">
                    {publicGroups.map((group) => (
                        <div key={group.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center group hover:border-slate-600 transition-colors">
                            <div className="min-w-0 flex-1 pr-2">
                                <div className="font-bold text-white text-sm truncate">{group.name}</div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                    <Globe className="w-3 h-3" /> {group.members_count || 12} tag
                                </div>
                            </div>
                            <Link href={`/community?group=${group.id}`} className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-white font-bold transition-colors whitespace-nowrap">
                                Megnéz
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* ==================== JOBB OLDAL (Tartalom) ==================== */}
      {/* Mobilon csak akkor látszik, ha van aktív csoport */}
      <div className={`
        flex-1 flex-col h-[calc(100vh-64px)] relative bg-slate-950 w-full lg:w-auto
        ${activeGroupId ? 'flex' : 'hidden lg:flex'}
      `}>
        {activeGroupId && activeGroupData ? (
            <>
                {/* Csoport Fejléc (Sticky) */}
                <div className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 sticky top-0">
                    <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                        {/* Mobil Vissza Gomb */}
                        <Link href="/community" className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>

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
                        {/* Tabok */}
                        <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800 shrink-0">
                            <Link 
                                href={`/community?group=${activeGroupId}&tab=chat`} 
                                className={`p-2 sm:px-4 sm:py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                title="Chat"
                            >
                                <MessageCircle className="w-4 h-4" /> <span className="hidden sm:inline">Chat</span>
                            </Link>
                            <Link 
                                href={`/community?group=${activeGroupId}&tab=market`} 
                                className={`p-2 sm:px-4 sm:py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'market' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                title="Piactér"
                            >
                                <ShoppingBag className="w-4 h-4" /> <span className="hidden sm:inline">Piactér</span>
                            </Link>
                        </div>

                        {/* Invite Gomb (Csak ha privát) */}
                        {activeGroupData.type === 'private' && (
                            <div className="hidden sm:block">
                                <InviteMemberModal groupId={activeGroupId} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Tartalom Terület */}
                <div className="flex-1 p-0 sm:p-4 overflow-hidden bg-slate-950">
                    {activeTab === 'chat' ? (
                        <ChatWindow groupId={activeGroupId} currentUser={user} />
                    ) : (
                        <div className="p-4 h-full overflow-y-auto">
                            <Marketplace groupId={activeGroupId} items={marketItems} />
                        </div>
                    )}
                </div>
            </>
        ) : (
            // ÜRES ÁLLAPOT (Desktopon látszik, ha nincs választva semmi)
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-950">
                <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800 shadow-2xl animate-in zoom-in duration-500">
                    <Users className="w-12 h-12 text-slate-700" />
                </div>
                <h2 className="text-3xl font-black text-white mb-3">Üdv a Közösségben! 👋</h2>
                <p className="max-w-md mb-10 text-slate-400 leading-relaxed">
                    Itt beszélgethetsz más autósokkal, alkatrészeket adhatsz-vehetsz, és csatlakozhatsz márkaklubokhoz.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl w-full">
                    <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl hover:border-blue-500/30 transition-colors group cursor-default">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3 text-blue-400 group-hover:scale-110 transition-transform">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-white mb-1 text-base">Nyilvános Csoportok</h4>
                        <p className="text-xs text-slate-400">Csatlakozz a kedvenc márkád (BMW, Audi, Toyota) rajongóihoz.</p>
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