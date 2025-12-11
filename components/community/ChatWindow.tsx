'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/supabase/client'
import { Send, MoreVertical, Image as ImageIcon, Trash2, Smile, Loader2, ArrowLeft, Heart } from 'lucide-react'
import Link from 'next/link'

const formatMessageDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) return `Ma, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatWindow({ 
    type, 
    id, 
    currentUser 
}: { 
    type: 'group' | 'dm', 
    id: string, 
    currentUser: any 
}) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [typingUsers, setTypingUsers] = useState<any[]>([])
  
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const channelRef = useRef<any>(null)

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" })
  }

  // --- 1. ÜZENETEK BETÖLTÉSE & REALTIME ---
  useEffect(() => {
    setMessages([]) 

    // A. Régi üzenetek lekérése
    const fetchMessages = async () => {
      let query = supabase.from(type === 'group' ? 'group_messages' : 'direct_messages').select('*')
      
      if (type === 'group') {
          query = query.eq('group_id', id)
      } else {
          query = query.or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${currentUser.id})`)
      }

      const { data } = await query.order('created_at', { ascending: true })
      
      if (data) {
        setMessages(data)
        setTimeout(() => scrollToBottom(false), 100)
      }
    }
    fetchMessages()

    // B. Realtime Beállítás
    // Fontos: DM esetén nem szűrünk ID-ra a szerveren, mert bonyolult az OR logika,
    // helyette minden bejövő DM-et megvizsgálunk kliens oldalon.
    const tableName = type === 'group' ? 'group_messages' : 'direct_messages'
    const filterConfig = type === 'group' ? `group_id=eq.${id}` : undefined

    const channel = supabase.channel(`chat_${type}_${id}`)
    
    channel
      .on('postgres_changes', 
        { 
            event: 'INSERT', 
            schema: 'public', 
            table: tableName,
            filter: filterConfig // Csak csoportnál van szerver oldali szűrő
        }, 
        (payload) => {
            const msg = payload.new
            
            // DM ESETÉN: Kliens oldali szűrés
            // Csak akkor adjuk hozzá, ha ez az üzenet ehhez a beszélgetéshez tartozik
            if (type === 'dm') {
                const isRelevant = 
                    (msg.sender_id === id && msg.receiver_id === currentUser.id) || // Ő küldte nekem
                    (msg.sender_id === currentUser.id && msg.receiver_id === id)    // Én küldtem neki (másik tabon)
                
                if (!isRelevant) return
            }

            console.log("Realtime üzenet érkezett:", msg)
            setMessages((prev) => [...prev, msg])
            scrollToBottom()
        }
      )
      .on('postgres_changes', 
        { 
            event: 'UPDATE', 
            schema: 'public', 
            table: tableName,
            filter: filterConfig 
        }, 
        (payload) => {
            const msg = payload.new
            // Update esetén is szűrni kell DM-nél
            if (type === 'dm') {
                 const isRelevant = (msg.sender_id === id && msg.receiver_id === currentUser.id) || (msg.sender_id === currentUser.id && msg.receiver_id === id)
                 if (!isRelevant) return
            }
            setMessages((prev) => prev.map(m => m.id === msg.id ? msg : m))
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const typing = []
        for (const key in state) {
           // @ts-ignore
           if (state[key][0]?.isTyping && key !== currentUser.id) {
             // @ts-ignore
             typing.push(state[key][0]?.email || 'Valaki')
           }
        }
        // @ts-ignore
        setTypingUsers(typing)
      })
      .subscribe()

    channelRef.current = channel

    return () => { supabase.removeChannel(channel) }
  }, [id, type, currentUser.id, supabase])

  // --- GÉPELÉS INDIKÁTOR ---
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    channelRef.current?.track({ isTyping: true, email: currentUser.email })
    setTimeout(() => { channelRef.current?.track({ isTyping: false }) }, 2000)
  }

  // --- ÜZENET KÜLDÉSE ---
  const sendMessage = async (e?: React.FormEvent, imageUrl?: string) => {
    if (e) e.preventDefault()
    if (!newMessage.trim() && !imageUrl) return

    const msgContent = newMessage
    setNewMessage('')
    scrollToBottom() // Optimista görgetés

    try {
        let error;
        if (type === 'group') {
            const res = await supabase.from('group_messages').insert({
                group_id: id,
                user_id: currentUser.id,
                content: msgContent || (imageUrl ? 'Kép csatolmány' : ''),
                image_url: imageUrl || null
            })
            error = res.error
        } else {
            const res = await supabase.from('direct_messages').insert({
                sender_id: currentUser.id,
                receiver_id: id,
                content: msgContent || (imageUrl ? 'Kép csatolmány' : ''),
                image_url: imageUrl || null
            })
            error = res.error
        }

        if (error) console.error("Hiba küldéskor:", error)
    } catch (err) {
        console.error("Váratlan hiba:", err)
    }
    
    channelRef.current?.track({ isTyping: false })
  }

  // --- KÉPFELTÖLTÉS ---
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

  // --- REAKCIÓK & TÖRLÉS ---
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

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] sm:h-[calc(100vh-140px)] bg-slate-950 sm:bg-slate-900 rounded-none sm:rounded-2xl overflow-hidden border-0 sm:border border-slate-700 shadow-none sm:shadow-2xl relative">
      
      {/* HEADER */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/95 backdrop-blur flex justify-between items-center shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-3">
            <Link href="/community" className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
            </Link>
            
            <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-slate-900 shadow-[0_0_8px_#10b981]"></div>
            </div>
            <div>
                <h3 className="font-bold text-white text-sm leading-tight">
                    {type === 'group' ? 'Közösségi Chat' : 'Privát Beszélgetés'}
                </h3>
                {typingUsers.length > 0 ? (
                    <p className="text-[10px] text-blue-400 font-medium animate-pulse">
                        {typingUsers.length > 1 ? 'Többen is írnak...' : `${typingUsers[0].split('@')[0]} ír...`}
                    </p>
                ) : (
                    <p className="text-[10px] text-slate-500">Online</p>
                )}
            </div>
        </div>
        <button className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors">
            <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* ÜZENETEK */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950 sm:bg-slate-900 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {messages.map((msg, idx) => {
            const senderId = type === 'group' ? msg.user_id : msg.sender_id
            const isMe = senderId === currentUser.id
            const reactionCount = msg.reactions ? Object.keys(msg.reactions).length : 0
            const userReacted = msg.reactions && msg.reactions[currentUser.id]

            if (msg.is_deleted && !isMe) return null;

            return (
                <div key={msg.id || idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`relative max-w-[85%] sm:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {msg.image_url && (
                            <div className="mb-1 rounded-2xl overflow-hidden border border-slate-700/50 shadow-md max-w-full cursor-pointer">
                                <img src={msg.image_url} alt="Feltöltés" className="w-full h-auto object-cover max-h-64" loading="lazy" />
                            </div>
                        )}
                        {(msg.content) && (
                            <div className={`px-3.5 py-2.5 rounded-2xl shadow-sm text-[13px] sm:text-sm leading-relaxed relative break-words ${
                                msg.is_deleted 
                                ? 'bg-slate-800/50 border border-slate-700/50 text-slate-500 italic'
                                : isMe 
                                    ? 'bg-blue-600 text-white rounded-br-sm' 
                                    : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-sm'
                            }`}>
                                {msg.content}
                            </div>
                        )}
                        <div className="flex items-center gap-2 mt-1 px-1 min-h-[20px]">
                            <span className="text-[10px] text-slate-500 font-medium">{formatMessageDate(msg.created_at)}</span>
                            {!msg.is_deleted && (
                                <button onClick={() => toggleReaction(msg.id, msg.reactions)} className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border transition-all active:scale-95 ${userReacted ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800'}`}>
                                    <Heart className={`w-3 h-3 ${userReacted ? 'fill-red-400' : ''}`} />
                                    {reactionCount > 0 && <span className="font-bold">{reactionCount}</span>}
                                </button>
                            )}
                            {isMe && !msg.is_deleted && (
                                <button onClick={() => deleteMessage(msg.id)} className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400 p-1">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )
        })}
        {isUploading && <div className="flex justify-end animate-pulse"><div className="bg-slate-800 rounded-2xl p-2.5 flex items-center gap-2 text-xs text-slate-400"><Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" /> Kép küldése...</div></div>}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={sendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex items-end gap-2 shrink-0 pb-safe">
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-blue-400 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors active:scale-95">
            <ImageIcon className="w-5 h-5" />
        </button>
        <div className="flex-1 bg-slate-800 border border-slate-700 rounded-3xl flex items-center px-4 py-2.5 focus-within:border-blue-500 transition-all">
            <input type="text" value={newMessage} onChange={handleTyping} placeholder="Írj üzenetet..." className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm" style={{ fontSize: '16px' }} />
            <button type="button" className="text-slate-500 hover:text-yellow-400 ml-1 p-1"><Smile className="w-5 h-5" /></button>
        </div>
        <button type="submit" disabled={!newMessage.trim() && !isUploading} className="p-3 rounded-full bg-blue-600 text-white shadow-lg disabled:bg-slate-800 disabled:text-slate-600"><Send className="w-5 h-5" /></button>
      </form>
    </div>
  )
}