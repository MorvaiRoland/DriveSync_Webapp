'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/supabase/client'
import { Send, MoreVertical, Image as ImageIcon, Trash2, Smile, Loader2, ArrowLeft, Heart, Reply, Copy, X } from 'lucide-react'
import Link from 'next/link'
import ImageModal from './ImageModal' // Az új komponens

// Dátum formázó
const formatMessageDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatWindow({ type, id, currentUser }: { type: 'group' | 'dm', id: string, currentUser: any }) {
  const [messages, setMessages] = useState<any[]>([])
  const [profiles, setProfiles] = useState<Record<string, any>>({}) // Profilok cache
  const [newMessage, setNewMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [replyTo, setReplyTo] = useState<any>(null) // Válasz állapota
  const [fullImage, setFullImage] = useState<string | null>(null) // Nagyított kép
  const [typingUsers, setTypingUsers] = useState<any[]>([])

  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const channelRef = useRef<any>(null)

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" })
  }

  // --- 1. ADATBETÖLTÉS ---
  useEffect(() => {
    setMessages([])
    setReplyTo(null)

    const fetchData = async () => {
      // A. Üzenetek lekérése
      let query = supabase.from(type === 'group' ? 'group_messages' : 'direct_messages').select('*')
      if (type === 'group') query = query.eq('group_id', id)
      else query = query.or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${currentUser.id})`)
      
      const { data: msgs } = await query.order('created_at', { ascending: true })
      
      // B. Profilok lekérése (hogy tudjuk a neveket)
      const userIds = new Set<string>()
      msgs?.forEach((m: any) => {
          userIds.add(type === 'group' ? m.user_id : m.sender_id)
      })
      // Hozzáadjuk a jelenlegi usert is
      userIds.add(currentUser.id)
      if (type === 'dm') userIds.add(id)

      const { data: profilesData } = await supabase.from('profiles').select('*').in('id', Array.from(userIds))
      const profilesMap: Record<string, any> = {}
      profilesData?.forEach((p: any) => profilesMap[p.id] = p)
      
      setProfiles(profilesMap)
      if (msgs) {
          setMessages(msgs)
          setTimeout(() => scrollToBottom(false), 100)
      }
    }
    fetchData()

    // C. Realtime
    const channel = supabase.channel(`chat_${id}`, { config: { presence: { key: currentUser.id } } })
    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: type === 'group' ? 'group_messages' : 'direct_messages', filter: type === 'group' ? `group_id=eq.${id}` : undefined }, (payload) => {
          if (type === 'dm') {
              const msg = payload.new
              if (!((msg.sender_id === id && msg.receiver_id === currentUser.id) || (msg.sender_id === currentUser.id && msg.receiver_id === id))) return
          }
          setMessages((prev) => [...prev, payload.new])
          scrollToBottom()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: type === 'group' ? 'group_messages' : 'direct_messages', filter: type === 'group' ? `group_id=eq.${id}` : undefined }, (payload) => {
          setMessages((prev) => prev.map(m => m.id === payload.new.id ? payload.new : m))
      })
      .on('presence', { event: 'sync' }, () => {
         const state = channel.presenceState()
         const typing: string[] = []
         for (const key in state) {
             // @ts-ignore
             if (state[key][0]?.isTyping && key !== currentUser.id) typing.push(profiles[key]?.full_name || 'Valaki')
         }
         setTypingUsers(typing)
      })
      .subscribe()
    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [id, type, currentUser.id, supabase]) // profiles függőség kivéve a loop elkerülésére

  // --- MŰVELETEK ---
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    channelRef.current?.track({ isTyping: true })
    setTimeout(() => { channelRef.current?.track({ isTyping: false }) }, 2000)
  }

  const sendMessage = async (e?: React.FormEvent, imageUrl?: string) => {
    if (e) e.preventDefault()
    if (!newMessage.trim() && !imageUrl) return

    const msgContent = newMessage
    setNewMessage('')
    setReplyTo(null)
    scrollToBottom()

    const payload = {
        content: msgContent || (imageUrl ? 'Kép csatolmány' : ''),
        image_url: imageUrl || null,
        reply_to_id: replyTo?.id || null
    }

    if (type === 'group') {
        await supabase.from('group_messages').insert({ group_id: id, user_id: currentUser.id, ...payload })
    } else {
        await supabase.from('direct_messages').insert({ sender_id: currentUser.id, receiver_id: id, ...payload })
    }
    channelRef.current?.track({ isTyping: false })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `chat/${fileName}`
    const { error } = await supabase.storage.from('chat-images').upload(filePath, file)
    if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('chat-images').getPublicUrl(filePath)
        await sendMessage(undefined, publicUrl)
    }
    setIsUploading(false)
  }

  const toggleReaction = async (msgId: string, currentReactions: any) => {
    const reactions = currentReactions || {}
    const userId = currentUser.id
    if (reactions[userId]) delete reactions[userId]
    else reactions[userId] = '❤️'
    const table = type === 'group' ? 'group_messages' : 'direct_messages'
    await supabase.from(table).update({ reactions: reactions }).eq('id', msgId)
  }

  const deleteMessage = async (msgId: string) => {
    if (!confirm('Biztosan törlöd?')) return
    const table = type === 'group' ? 'group_messages' : 'direct_messages'
    await supabase.from(table).update({ is_deleted: true, content: '🚫 Az üzenetet törölték.', image_url: null }).eq('id', msgId)
  }

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text)
      alert('Szöveg másolva!')
  }

  return (
    <>
      {/* Nagy kép modal */}
      <ImageModal src={fullImage || ''} onClose={() => setFullImage(null)} />

      <div className="flex flex-col h-[calc(100dvh-80px)] sm:h-[calc(100vh-140px)] bg-slate-950 sm:bg-slate-900 rounded-none sm:rounded-2xl overflow-hidden border-0 sm:border border-slate-700 shadow-none sm:shadow-2xl relative">
        
        {/* HEADER */}
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/95 backdrop-blur flex justify-between items-center shrink-0 z-10 sticky top-0">
            <div className="flex items-center gap-3">
                <Link href="/community" className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
                <div className="relative">
                    {/* Profilkép a fejlécbe */}
                    {type === 'dm' && profiles[id]?.avatar_url ? (
                         <img src={profiles[id].avatar_url} className="w-8 h-8 rounded-full border border-slate-700" alt="" />
                    ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-slate-900 shadow-[0_0_8px_#10b981]"></div>
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm leading-tight">
                        {type === 'group' ? 'Közösségi Chat' : (profiles[id]?.full_name || 'Privát Beszélgetés')}
                    </h3>
                    {typingUsers.length > 0 ? (
                        <p className="text-[10px] text-blue-400 font-medium animate-pulse">
                            {typingUsers.length > 1 ? 'Többen is írnak...' : `${typingUsers[0]} ír...`}
                        </p>
                    ) : (
                        <p className="text-[10px] text-slate-500">Online</p>
                    )}
                </div>
            </div>
            <button className="text-slate-400 hover:text-white p-2"><MoreVertical className="w-5 h-5" /></button>
        </div>

        {/* ÜZENETEK */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-slate-950 sm:bg-slate-900 scrollbar-thin scrollbar-thumb-slate-700">
            {messages.map((msg, idx) => {
                const senderId = type === 'group' ? msg.user_id : msg.sender_id
                const isMe = senderId === currentUser.id
                const prevMsg = messages[idx - 1]
                // Csoportosítás: ha ugyanaz küldte és 5 percen belül, ne írjuk ki újra a nevet
                const isSequence = prevMsg && (type === 'group' ? prevMsg.user_id : prevMsg.sender_id) === senderId && (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() < 300000)
                
                const profile = profiles[senderId] || {}
                const repliedMsg = msg.reply_to_id ? messages.find((m: any) => m.id === msg.reply_to_id) : null

                if (msg.is_deleted && !isMe) return null;

                return (
                    <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group ${isSequence ? 'mt-0.5' : 'mt-4'}`}>
                        
                        {/* Név kiírása (ha nem szekvencia és nem én vagyok) */}
                        {!isMe && !isSequence && (
                            <span className="text-[11px] text-slate-400 font-bold ml-10 mb-1">
                                {profile.full_name || senderId.split('-')[0]}
                            </span>
                        )}

                        <div className="flex gap-2 max-w-[85%] sm:max-w-[70%]">
                            {/* Avatar (ha nem szekvencia és nem én vagyok) */}
                            {!isMe && (
                                <div className="w-8 h-8 shrink-0 flex items-end">
                                    {!isSequence ? (
                                        profile.avatar_url ? (
                                            <img src={profile.avatar_url} className="w-8 h-8 rounded-full border border-slate-700" alt="" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold">
                                                {profile.full_name ? profile.full_name.charAt(0) : '?'}
                                            </div>
                                        )
                                    ) : <div className="w-8" />}
                                </div>
                            )}

                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} min-w-0`}>
                                {/* Válasz előzmény */}
                                {repliedMsg && (
                                    <div className="mb-1 text-xs bg-slate-800/50 p-2 rounded-lg border-l-2 border-slate-500 opacity-70 truncate max-w-full">
                                        <span className="font-bold mr-1">Válasz:</span> 
                                        {repliedMsg.is_deleted ? 'Törölt üzenet' : (repliedMsg.content || 'Kép')}
                                    </div>
                                )}

                                {/* Buborék */}
                                <div className={`relative px-3.5 py-2 rounded-2xl shadow-sm text-[13px] sm:text-sm leading-relaxed break-words
                                    ${msg.is_deleted ? 'bg-slate-800/50 border border-slate-700 text-slate-500 italic' : 
                                    isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'}
                                `}>
                                    {msg.image_url && !msg.is_deleted && (
                                        <img 
                                            src={msg.image_url} 
                                            alt="Kép" 
                                            className="rounded-lg mb-2 max-h-48 w-full object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                                            onClick={() => setFullImage(msg.image_url)} 
                                        />
                                    )}
                                    {msg.content}
                                    
                                    {/* Időbélyeg */}
                                    <span className="text-[9px] opacity-50 block text-right mt-1 select-none">
                                        {formatMessageDate(msg.created_at)}
                                    </span>
                                </div>

                                {/* Reakciók */}
                                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                    <div className={`flex -mt-2 ${isMe ? 'mr-2' : 'ml-2'} z-10`}>
                                        <div className="bg-slate-800 border border-slate-700 rounded-full px-1.5 py-0.5 text-[10px] shadow-sm flex items-center gap-1">
                                            <span>❤️</span>
                                            <span className="font-bold text-white">{Object.keys(msg.reactions).length}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Akció Menü (Hoverre vagy mobil érintésre) */}
                                {!msg.is_deleted && (
                                    <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'flex-row-reverse' : ''}`}>
                                        <button onClick={() => setReplyTo(msg)} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-colors" title="Válasz">
                                            <Reply className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => toggleReaction(msg.id, msg.reactions)} className={`p-1.5 rounded-full transition-colors ${msg.reactions?.[currentUser.id] ? 'text-red-500 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-400 hover:bg-slate-800'}`} title="Like">
                                            <Heart className={`w-3.5 h-3.5 ${msg.reactions?.[currentUser.id] ? 'fill-current' : ''}`} />
                                        </button>
                                        <button onClick={() => copyToClipboard(msg.content)} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-colors" title="Másolás">
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                        {isMe && (
                                            <button onClick={() => deleteMessage(msg.id)} className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors" title="Törlés">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
            {isUploading && <div className="flex justify-end p-2"><div className="bg-slate-800 rounded-xl p-2 flex items-center gap-2 text-xs text-slate-400"><Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" /> Kép küldése...</div></div>}
            <div ref={messagesEndRef} />
        </div>

        {/* VÁLASZ SÁV (Ha épp válaszolunk valakire) */}
        {replyTo && (
            <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex justify-between items-center animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-xs text-slate-400 overflow-hidden">
                    <Reply className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="font-bold text-blue-400 shrink-0">Válasz neki:</span>
                    <span className="truncate">{replyTo.content || 'Kép'}</span>
                </div>
                <button onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
        )}

        {/* INPUT */}
        <form onSubmit={sendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex items-end gap-2 shrink-0 pb-safe">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-blue-400 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors active:scale-95">
                <ImageIcon className="w-5 h-5" />
            </button>
            <div className="flex-1 bg-slate-800 border border-slate-700 rounded-3xl flex items-center px-4 py-2.5 focus-within:border-blue-500 transition-all">
                <input type="text" value={newMessage} onChange={handleTyping} placeholder={replyTo ? "Válasz írása..." : "Írj üzenetet..."} className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm" style={{ fontSize: '16px' }} />
                <button type="button" className="text-slate-500 hover:text-yellow-400 ml-1 p-1"><Smile className="w-5 h-5" /></button>
            </div>
            <button type="submit" disabled={!newMessage.trim() && !isUploading} className="p-3 rounded-full bg-blue-600 text-white shadow-lg disabled:bg-slate-800 disabled:text-slate-600 transition-all active:scale-95"><Send className="w-5 h-5" /></button>
        </form>
      </div>
    </>
  )
}