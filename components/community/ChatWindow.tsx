'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/supabase/client' // Ellenőrizd, hogy van-e client oldali supabase konfigurációd!
import { Send, MoreVertical, User } from 'lucide-react'

// Ha nincs @/supabase/client fájlod, hozd létre a "utils/supabase/client.ts"-ben vagy használd a createClientComponentClient-et
// Egyszerűsítés kedvéért itt feltételezem a standard client setupot:

export default function ChatWindow({ groupId, currentUser }: { groupId: string, currentUser: any }) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Görgetés az aljára
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    // 1. Kezdeti üzenetek betöltése
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('group_messages')
        .select('*') // Itt érdemes lenne joinolni a felhasználó nevét is
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
      
      if (data) setMessages(data)
      scrollToBottom()
    }

    fetchMessages()

    // 2. Realtime feliratkozás (Azonnali üzenetek)
    const channel = supabase
      .channel(`chat_room_${groupId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
          setTimeout(scrollToBottom, 100)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId, supabase])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const msgContent = newMessage
    setNewMessage('') // Azonnal töröljük az inputot

    // Optimista UI frissítés (hogy gyorsnak érezze a user)
    // Opcionális, a Realtime úgyis visszadobja, de így azonnal látszik
    
    const { error } = await supabase.from('group_messages').insert({
      group_id: groupId,
      user_id: currentUser.id,
      content: msgContent
    })

    if (error) console.error('Hiba küldéskor:', error)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <h3 className="font-bold text-white">Élő Chat</h3>
        </div>
        <button className="text-slate-400 hover:text-white"><MoreVertical className="w-5 h-5" /></button>
      </div>

      {/* Üzenetek Terület */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
        {messages.map((msg, idx) => {
            const isMe = msg.user_id === currentUser.id
            return (
                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl p-3 ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-[10px] opacity-50 text-right mt-1">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Mező */}
      <form onSubmit={sendMessage} className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2 shrink-0">
        <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Írj valamit..." 
            className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-all"
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-colors">
            <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}