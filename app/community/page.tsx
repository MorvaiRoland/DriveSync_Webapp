import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ChatWindow from '@/components/community/ChatWindow'
import Marketplace from '@/components/community/Marketplace'
import CreateGroupModal from '@/components/community/CreateGroupModal'
import { Users, Search, Lock, Globe, MessageCircle, ShoppingBag } from 'lucide-react'

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
  const activeTab = params.tab || 'chat' // 'chat' vagy 'market'

  // 1. Saját csoportok lekérése (ahol tag vagyok)
  const { data: myGroups } = await supabase
    .from('group_members')
    .select('group_id, groups(id, name, type)')
    .eq('user_id', user.id)

  // 2. Publikus csoportok lekérése (Felfedezés)
  const { data: publicGroups } = await supabase
    .from('groups')
    .select('*')
    .eq('type', 'public')
    .limit(5)

  // 3. Aktív csoport adatainak lekérése (ha ki van választva)
  let activeGroupData = null
  let marketItems: any[] = []
  
  if (activeGroupId) {
    const { data } = await supabase.from('groups').select('*').eq('id', activeGroupId).single()
    activeGroupData = data
    
    if (activeTab === 'market') {
        const { data: items } = await supabase.from('group_listings').select('*').eq('group_id', activeGroupId)
        marketItems = items || []
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex pt-16 overflow-hidden">
      
      {/* BAL OLDALSÁV (Csoport lista) */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/50 backdrop-blur-sm h-[calc(100vh-64px)] fixed lg:static z-20">
        
        {/* Kereső & Új csoport */}
        <div className="p-4 border-b border-slate-800 space-y-4">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Users className="text-blue-500 w-6 h-6" /> Közösség
            </h2>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Csoport keresése..." className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-blue-500 outline-none transition-colors" />
            </div>
            
            {/* ITT A MODAL GOMBJA */}
            <CreateGroupModal />
        </div>

        {/* Saját Csoportok */}
        <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Saját Csoportjaim</h3>
            <div className="space-y-1">
                {myGroups && myGroups.length > 0 ? myGroups.map((item: any) => (
                    <Link 
                        key={item.group_id} 
                        href={`/community?group=${item.group_id}`}
                        className={`block px-3 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-between ${activeGroupId === item.group_id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <span className="truncate">{item.groups.name}</span>
                        {item.groups.type === 'private' && <Lock className="w-3 h-3 opacity-50" />}
                    </Link>
                )) : (
                    <p className="text-xs text-slate-600 italic px-2">Még nem vagy tagja egy csoportnak sem.</p>
                )}
            </div>

            {/* Felfedezés (Csak demo lista egyelőre) */}
            <div className="mt-8 pt-6 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Ajánlott Közösségek</h3>
                <div className="space-y-3">
                    {publicGroups?.map((group) => (
                        <div key={group.id} className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex justify-between items-center group hover:border-slate-600 transition-colors">
                            <div>
                                <div className="font-bold text-white text-sm">{group.name}</div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> Nyilvános
                                </div>
                            </div>
                            {/* Itt kellene még logika: ha nem vagyok tag, akkor Join gomb */}
                            <Link href={`/community?group=${group.id}`} className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md text-white font-bold transition-colors">
                                Megnéz
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* JOBB OLDAL (Tartalom) */}
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)] relative bg-slate-950">
        {activeGroupId && activeGroupData ? (
            <>
                {/* Csoport Fejléc */}
                <div className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                            {activeGroupData.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="font-black text-white text-lg leading-tight">{activeGroupData.name}</h1>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                {activeGroupData.type === 'private' ? <Lock className="w-3 h-3 text-amber-500" /> : <Globe className="w-3 h-3 text-blue-400" />}
                                <span>{activeGroupData.type === 'private' ? 'Privát Csoport' : 'Nyilvános Közösség'}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Tabok */}
                    <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                        <Link 
                            href={`/community?group=${activeGroupId}&tab=chat`} 
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                        >
                            <MessageCircle className="w-4 h-4" /> Chat
                        </Link>
                        <Link 
                            href={`/community?group=${activeGroupId}&tab=market`} 
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'market' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                        >
                            <ShoppingBag className="w-4 h-4" /> Piactér
                        </Link>
                    </div>
                </div>

                {/* TARTALOM TERÜLET */}
                <div className="flex-1 p-6 overflow-hidden">
                    {activeTab === 'chat' ? (
                        <ChatWindow groupId={activeGroupId} currentUser={user} />
                    ) : (
                        <Marketplace groupId={activeGroupId} items={marketItems} />
                    )}
                </div>
            </>
        ) : (
            // ÜRES ÁLLAPOT (Ha nincs kiválasztva csoport)
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-950">
                <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800 shadow-2xl animate-in zoom-in duration-500">
                    <Users className="w-12 h-12 text-slate-700" />
                </div>
                <h2 className="text-3xl font-black text-white mb-3">Üdv a Közösségben! 👋</h2>
                <p className="max-w-md mb-10 text-slate-400">Válassz egy csoportot a bal oldali menüből, vagy hozz létre egy újat a barátaidnak és az autós klubodnak.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-2xl w-full">
                    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl hover:border-blue-500/30 transition-colors group">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3 text-blue-400 group-hover:scale-110 transition-transform">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-white mb-1 text-lg">Nyilvános Csoportok</h4>
                        <p className="text-sm text-slate-400">Csatlakozz autómárkák (BMW, Audi, Suzuki) rajongói klubjaihoz, ossz meg tippeket.</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl hover:border-purple-500/30 transition-colors group">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3 text-purple-400 group-hover:scale-110 transition-transform">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-white mb-1 text-lg">Privát Garázsok</h4>
                        <p className="text-sm text-slate-400">Hívd meg a szerelődet vagy a családot egy zárt beszélgetésre az autóitokról.</p>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}