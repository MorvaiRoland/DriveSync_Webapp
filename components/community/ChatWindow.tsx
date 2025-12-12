'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/supabase/client'
import { Send, MoreVertical, Image as ImageIcon, Smile, Loader2, Heart, Reply, Copy, X, Trash2 } from 'lucide-react'
import ImageModal from './ImageModal'

const formatMessageDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatWindow({ type, id, currentUser }: { type: 'group' | 'dm', id: string, currentUser: any }) {
  const [messages, setMessages] = useState<any[]>([])
  const [profiles, setProfiles] = useState<Record<string, any>>({})
  const [newMessage, setNewMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [replyTo, setReplyTo] = useState<any>(null)
  const [fullImage, setFullImage] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<any[]>([])

  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const channelRef = useRef<any>(null)

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  // Automatikus görgetés üzenetváltozáskor
  useEffect(() => {
      scrollToBottom('auto') // Azonnal ugorjon
  }, [messages])

  useEffect(() => {
    setMessages([])
    setReplyTo(null)

    const fetchData = async () => {
      // 1. Üzenetek betöltése
      let query = supabase.from(type === 'group' ? 'group_messages' : 'direct_messages').select('*')
      if (type === 'group') query = query.eq('group_id', id)
      else query = query.or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${currentUser.id})`)
      
      const { data: msgs } = await query.order('created_at', { ascending: true })
      
      // 2. Profilok cache-elése
      const userIds = new Set<string>()
      msgs?.forEach((m: any) => userIds.add(type === 'group' ? m.user_id : m.sender_id))
      userIds.add(currentUser.id)
      if (type === 'dm') userIds.add(id)

      const { data: profilesData } = await supabase.from('profiles').select('*').in('id', Array.from(userIds))
      const profilesMap: Record<string, any> = {}
      profilesData?.forEach((p: any) => profilesMap[p.id] = p)
      
      setProfiles(profilesMap)
      if (msgs) setMessages(msgs)
    }
    fetchData()

    // 3. Realtime feliratkozás
    const channel = supabase.channel(`chat_${id}`, { config: { presence: { key: currentUser.id } } })
    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: type === 'group' ? 'group_messages' : 'direct_messages', filter: type === 'group' ? `group_id=eq.${id}` : undefined }, (payload) => {
          if (type === 'dm') {
              const msg = payload.new
              if (!((msg.sender_id === id && msg.receiver_id === currentUser.id) || (msg.sender_id === currentUser.id && msg.receiver_id === id))) return
          }
          setMessages((prev) => [...prev, payload.new])
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
  }, [id, type, currentUser.id]) // profiles kivéve a loop miatt

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
    
    // Optimista UI frissítés (azonnali megjelenítés) lehetne itt, de most hagyjuk a szerverre

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
    const fileName = `chat/${Date.now()}.${fileExt}`
    
    const { error } = await supabase.storage.from('chat-images').upload(fileName, file)
    if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('chat-images').getPublicUrl(fileName)
        await sendMessage(undefined, publicUrl)
    }
    setIsUploading(false)
  }

  return (
    <>
      <ImageModal src={fullImage || ''} onClose={() => setFullImage(null)} />

      <div className="flex flex-col h-full bg-slate-950 relative">
        
        {/* ÜZENET LISTA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 opacity-50">
                    <Smile className="w-12 h-12 mb-2" />
                    <p className="text-sm">Kezdjetek el beszélgetni!</p>
                </div>
            )}
            
            {messages.map((msg, idx) => {
                const senderId = type === 'group' ? msg.user_id : msg.sender_id
                const isMe = senderId === currentUser.id
                const profile = profiles[senderId] || {}
                const isSequence = idx > 0 && (type === 'group' ? messages[idx-1].user_id : messages[idx-1].sender_id) === senderId

                return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isSequence ? 'mt-1' : 'mt-4'}`}>
                        {!isMe && !isSequence && (
                             <span className="text-[10px] text-slate-400 font-bold ml-10 mb-1">{profile.full_name || 'Felhasználó'}</span>
                        )}
                        
                        <div className="flex gap-2 max-w-[85%] sm:max-w-[70%] group">
                            {!isMe && (
                                <div className="w-8 h-8 shrink-0 flex items-end">
                                    {!isSequence ? (
                                        profile.avatar_url ? <img src={profile.avatar_url} className="w-8 h-8 rounded-full bg-slate-800" /> 
                                        : <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs border border-slate-700">{profile.full_name?.[0] || '?'}</div>
                                    ) : <div className="w-8" />}
                                </div>
                            )}

                            <div className={`relative px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm break-words
                                ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'}
                            `}>
                                {msg.image_url && (
                                    <img 
                                        src={msg.image_url} 
                                        onClick={() => setFullImage(msg.image_url)}
                                        className="max-w-full rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity max-h-60 object-cover" 
                                    />
                                )}
                                {msg.content}
                                <span className="text-[9px] opacity-50 block text-right mt-1 select-none whitespace-nowrap">
                                    {formatMessageDate(msg.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                )
            })}
            
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
                 <div className="flex items-center gap-2 text-xs text-slate-500 ml-10 animate-pulse">
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                    </div>
                    {typingUsers.join(', ')} éppen ír...
                 </div>
            )}
            
            <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* INPUT ZÓNA - FIXÁLVA AZ ALJÁN */}
        <div className="bg-slate-900 border-t border-slate-800 p-3 pb-safe z-20 sticky bottom-0">
             {/* Válasz panel */}
             {replyTo && (
                <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg mb-2 border-l-2 border-blue-500 text-xs">
                    <span className="truncate text-slate-300">Válasz erre: <b>{replyTo.content || 'Kép'}</b></span>
                    <button onClick={() => setReplyTo(null)}><X className="w-4 h-4 text-slate-400" /></button>
                </div>
            )}

            <form onSubmit={sendMessage} className="flex items-end gap-2">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-all active:scale-95">
                    <ImageIcon className="w-5 h-5" />
                </button>
                
                <div className="flex-1 bg-slate-800 border border-slate-700 rounded-3xl flex items-center px-4 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                    <input 
                        type="text" 
                        value={newMessage} 
                        onChange={handleTyping} 
                        placeholder="Üzenet írása..." 
                        className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-base sm:text-sm py-1" // text-base mobilon megakadályozza a zoomolást
                    />
                    <Smile className="w-5 h-5 text-slate-500 hover:text-yellow-400 cursor-pointer transition-colors" />
                </div>
                
                <button type="submit" disabled={!newMessage.trim() && !isUploading} className="p-3 rounded-full bg-blue-600 text-white shadow-lg disabled:opacity-50 disabled:bg-slate-800 transition-all active:scale-95 flex items-center justify-center">
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                </button>
            </form>
        </div>
      </div>
    </>
  )
}