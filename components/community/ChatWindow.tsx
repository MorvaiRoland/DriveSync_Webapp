'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/supabase/client'
import { Send, MoreVertical, Image as ImageIcon, Smile, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const formatMessageDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) return `Ma, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Props bővítése: lehet groupId VAGY partnerId (DM esetén)
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
  
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" })
  }

  // --- ÜZENETEK BETÖLTÉSE & REALTIME ---
  useEffect(() => {
    setMessages([]) // Reset váltáskor

    const fetchMessages = async () => {
      let query = supabase.from(type === 'group' ? 'group_messages' : 'direct_messages').select('*')
      
      if (type === 'group') {
          query = query.eq('group_id', id)
      } else {
          // DM esetén: (én küldtem NEKI) VAGY (ő küldött NEKEM)
          query = query.or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${currentUser.id})`)
      }

      const { data } = await query.order('created_at', { ascending: true })
      if (data) {
        setMessages(data)
        setTimeout(() => scrollToBottom(false), 100)
      }
    }
    fetchMessages()

    // Realtime Channel
    const channel = supabase.channel(`chat_${id}`)
      .on('postgres_changes', 
        { 
            event: 'INSERT', 
            schema: 'public', 
            table: type === 'group' ? 'group_messages' : 'direct_messages',
            // DM szűrő trükkösebb, egyszerűsítve: minden DM-et figyelünk és kliensen szűrünk
            filter: type === 'group' ? `group_id=eq.${id}` : undefined 
        }, 
        (payload) => {
            // Ha DM, ellenőrizzük, hogy ehhez a beszélgetéshez tartozik-e
            if (type === 'dm') {
                const msg = payload.new
                const isRelevant = (msg.sender_id === id && msg.receiver_id === currentUser.id) || (msg.sender_id === currentUser.id && msg.receiver_id === id)
                if (!isRelevant) return
            }
            setMessages((prev) => [...prev, payload.new])
            scrollToBottom()
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id, type, currentUser.id, supabase])

  // --- KÜLDÉS ---
  const sendMessage = async (e?: React.FormEvent, imageUrl?: string) => {
    if (e) e.preventDefault()
    if (!newMessage.trim() && !imageUrl) return

    const msgContent = newMessage
    setNewMessage('')
    scrollToBottom()

    if (type === 'group') {
        await supabase.from('group_messages').insert({
            group_id: id,
            user_id: currentUser.id,
            content: msgContent || (imageUrl ? 'Kép' : ''),
            image_url: imageUrl || null
        })
    } else {
        await supabase.from('direct_messages').insert({
            sender_id: currentUser.id,
            receiver_id: id, // Itt az ID a partner ID-ja
            content: msgContent || (imageUrl ? 'Kép' : ''),
            image_url: imageUrl || null
        })
    }
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

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] sm:h-[calc(100vh-140px)] bg-slate-950 sm:bg-slate-900 rounded-none sm:rounded-2xl overflow-hidden border-0 sm:border border-slate-700 shadow-none sm:shadow-2xl relative">
      
      {/* HEADER */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/95 backdrop-blur flex justify-between items-center shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
            <Link href="/community" className="sm:hidden p-2 -ml-2 text-slate-400"><ArrowLeft className="w-5 h-5" /></Link>
            <div className="relative"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-slate-900 shadow-[0_0_8px_#10b981]"></div></div>
            <div>
                <h3 className="font-bold text-white text-sm leading-tight">{type === 'group' ? 'Közösségi Chat' : 'Privát Beszélgetés'}</h3>
                <p className="text-[10px] text-slate-500">Online</p>
            </div>
        </div>
        <button className="text-slate-400 hover:text-white p-2"><MoreVertical className="w-5 h-5" /></button>
      </div>

      {/* ÜZENETEK */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950 sm:bg-slate-900 scrollbar-thin scrollbar-thumb-slate-700">
        {messages.map((msg, idx) => {
            const isMe = (type === 'group' ? msg.user_id : msg.sender_id) === currentUser.id
            return (
                <div key={msg.id || idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`relative max-w-[85%] sm:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {msg.image_url && (
                            <div className="mb-1 rounded-2xl overflow-hidden border border-slate-700/50 shadow-md"><img src={msg.image_url} alt="Kép" className="w-full h-auto max-h-64 object-cover" /></div>
                        )}
                        {msg.content && (
                            <div className={`px-3.5 py-2.5 rounded-2xl shadow-sm text-[13px] sm:text-sm leading-relaxed ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-sm'}`}>
                                {msg.content}
                            </div>
                        )}
                        <span className="text-[10px] text-slate-500 mt-1 px-1">{formatMessageDate(msg.created_at)}</span>
                    </div>
                </div>
            )
        })}
        {isUploading && <div className="flex justify-end"><div className="bg-slate-800 p-2 text-xs rounded-xl flex gap-2"><Loader2 className="w-4 h-4 animate-spin text-blue-500"/> Küldés...</div></div>}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={sendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex items-end gap-2 shrink-0 pb-safe">
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-blue-400 bg-slate-800 rounded-full"><ImageIcon className="w-5 h-5" /></button>
        <div className="flex-1 bg-slate-800 border border-slate-700 rounded-3xl flex items-center px-4 py-2.5 focus-within:border-blue-500 transition-all">
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Írj üzenetet..." className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm" style={{ fontSize: '16px' }} />
            <button type="button" className="text-slate-500 hover:text-yellow-400 ml-1"><Smile className="w-5 h-5" /></button>
        </div>
        <button type="submit" disabled={!newMessage.trim() && !isUploading} className="p-3 rounded-full bg-blue-600 text-white shadow-lg disabled:bg-slate-800 disabled:text-slate-600"><Send className="w-5 h-5" /></button>
      </form>
    </div>
  )
}