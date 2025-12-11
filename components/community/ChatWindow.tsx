'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/supabase/client'
import { Send, MoreVertical, Image as ImageIcon, Trash2, Smile, Loader2, Heart, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Dátum formázó
const formatMessageDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) return `Ma, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatWindow({ groupId, currentUser }: { groupId: string, currentUser: any }) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [typingUsers, setTypingUsers] = useState<any[]>([])
  
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const channelRef = useRef<any>(null)

  // Görgetés (mobilon is simán)
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" })
  }

  useEffect(() => {
    // 1. Üzenetek betöltése
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
      
      if (data) {
        setMessages(data)
        setTimeout(() => scrollToBottom(false), 100)
      }
    }
    fetchMessages()

    // 2. Realtime Channel
    const channel = supabase.channel(`chat_room_${groupId}`, {
      config: { presence: { key: currentUser.id } }
    })

    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` }, (payload) => {
          setMessages((prev) => [...prev, payload.new])
          scrollToBottom()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` }, (payload) => {
          setMessages((prev) => prev.map(msg => msg.id === payload.new.id ? payload.new : msg))
      })
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

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId, supabase, currentUser.id])

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    channelRef.current?.track({ isTyping: true, email: currentUser.email })
    setTimeout(() => {
        channelRef.current?.track({ isTyping: false })
    }, 2000)
  }

  const sendMessage = async (e?: React.FormEvent, imageUrl?: string) => {
    if (e) e.preventDefault()
    if (!newMessage.trim() && !imageUrl) return

    const msgContent = newMessage
    setNewMessage('')
    
    // Azonnali UI frissítés (hogy ne kelljen várni a szerverre)
    scrollToBottom()

    await supabase.from('group_messages').insert({
      group_id: groupId,
      user_id: currentUser.id,
      content: msgContent || (imageUrl ? 'Kép csatolmány' : ''),
      image_url: imageUrl || null
    })
    
    channelRef.current?.track({ isTyping: false })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${groupId}/${fileName}`

    const { error: uploadError } = await supabase.storage.from('chat-images').upload(filePath, file)

    if (uploadError) {
      alert('Hiba a feltöltéskor')
      setIsUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('chat-images').getPublicUrl(filePath)
    
    await sendMessage(undefined, publicUrl)
    setIsUploading(false)
  }

  const toggleReaction = async (msgId: string, currentReactions: any) => {
    const reactions = currentReactions || {}
    const userId = currentUser.id
    
    if (reactions[userId]) {
        delete reactions[userId]
    } else {
        reactions[userId] = '❤️'
    }

    await supabase.from('group_messages').update({ reactions: reactions }).eq('id', msgId)
  }

  const deleteMessage = async (msgId: string) => {
    if (!confirm('Biztosan törlöd?')) return
    await supabase.from('group_messages').update({ is_deleted: true, content: '🚫 Az üzenetet törölték.' }).eq('id', msgId)
  }

  return (
    // FONTOS: h-[calc(100dvh-120px)] a mobil címsor ugrálás ellen (dvh)
    <div className="flex flex-col h-[calc(100vh-80px)] sm:h-[calc(100vh-140px)] bg-slate-950 sm:bg-slate-900 rounded-none sm:rounded-2xl overflow-hidden border-0 sm:border border-slate-700 shadow-none sm:shadow-2xl relative">
      
      {/* 1. HEADER */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/95 backdrop-blur flex justify-between items-center shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-3">
            {/* Mobil Vissza Gomb */}
            <Link href="/community" className="sm:hidden p-2 -ml-2 text-slate-400">
                <ArrowLeft className="w-5 h-5" />
            </Link>
            
            <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-slate-900 shadow-[0_0_8px_#10b981]"></div>
            </div>
            <div>
                <h3 className="font-bold text-white text-sm leading-tight">Élő Chat</h3>
                {typingUsers.length > 0 ? (
                    <p className="text-[10px] text-blue-400 font-medium animate-pulse">
                        {typingUsers.length > 1 ? 'Többen is írnak...' : `${typingUsers[0].split('@')[0]} ír...`}
                    </p>
                ) : (
                    <p className="text-[10px] text-slate-500">Online</p>
                )}
            </div>
        </div>
        <button className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800/50 transition-colors">
            <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* 2. ÜZENETEK LISTA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950 sm:bg-slate-900 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {messages.map((msg, idx) => {
            const isMe = msg.user_id === currentUser.id
            const reactionCount = msg.reactions ? Object.keys(msg.reactions).length : 0
            const userReacted = msg.reactions && msg.reactions[currentUser.id]

            if (msg.is_deleted && !isMe) return null;

            return (
                <div key={msg.id || idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    
                    {/* Üzenet buborék */}
                    <div className={`relative max-w-[85%] sm:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        
                        {/* Kép */}
                        {msg.image_url && !msg.is_deleted && (
                            <div className="mb-1 rounded-2xl overflow-hidden border border-slate-700/50 shadow-md max-w-full">
                                <img src={msg.image_url} alt="Feltöltés" className="w-full h-auto object-cover max-h-64" loading="lazy" />
                            </div>
                        )}

                        {/* Szöveg */}
                        {(msg.content || msg.is_deleted) && (
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

                        {/* Meta adatok */}
                        <div className="flex items-center gap-2 mt-1 px-1 min-h-[20px]">
                            <span className="text-[10px] text-slate-500 font-medium">{formatMessageDate(msg.created_at)}</span>
                            
                            {/* Reakció */}
                            {!msg.is_deleted && (
                                <button 
                                    onClick={() => toggleReaction(msg.id, msg.reactions)}
                                    className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border transition-all active:scale-95 ${userReacted ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800'}`}
                                >
                                    <Heart className={`w-3 h-3 ${userReacted ? 'fill-red-400' : ''}`} />
                                    {reactionCount > 0 && <span className="font-bold">{reactionCount}</span>}
                                </button>
                            )}

                            {/* Törlés (Mobilon mindig látszik ha a tied, desktopon hoverre) */}
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
        
        {isUploading && (
            <div className="flex justify-end animate-pulse">
                <div className="bg-slate-800 rounded-2xl p-2.5 flex items-center gap-2 text-xs text-slate-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" /> Kép küldése...
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. INPUT MEZŐ (Sticky footer) */}
      <form onSubmit={sendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex items-end gap-2 shrink-0 pb-safe">
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileUpload}
        />
        <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-blue-400 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors active:scale-95"
        >
            <ImageIcon className="w-5 h-5" />
        </button>

        <div className="flex-1 bg-slate-800 border border-slate-700 rounded-3xl flex items-center px-4 py-2.5 focus-within:border-blue-500 transition-all">
            <input 
                type="text" 
                value={newMessage}
                onChange={handleTyping}
                placeholder="Írj üzenetet..." 
                className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm"
                // Mobilon, ha rákattintasz, ne nagyítson bele
                style={{ fontSize: '16px' }} 
            />
            <button type="button" className="text-slate-500 hover:text-yellow-400 ml-1 p-1">
                <Smile className="w-5 h-5" />
            </button>
        </div>

        <button 
            type="submit" 
            disabled={!newMessage.trim() && !isUploading}
            className={`p-3 rounded-full transition-all active:scale-95 ${
                newMessage.trim() 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-slate-800 text-slate-600'
            }`}
        >
            <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}