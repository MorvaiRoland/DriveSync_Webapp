'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AiMechanic() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Automatikus görgetés
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isThinking, isOpen])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setIsThinking(true)
    setInputValue('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) 
        }),
      })

      if (!response.ok) throw new Error('Hiba a válaszban')
      if (!response.body) throw new Error('Nincs válasz adat')

      const aiMsgId = (Date.now() + 1).toString()
      setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '' }])

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let fullText = ''

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value, { stream: true })
        fullText += chunkValue
        
        setMessages(prev => {
            const newMsgs = [...prev]
            const lastMsg = newMsgs[newMsgs.length - 1]
            if (lastMsg.role === 'assistant') {
                lastMsg.content = fullText
            }
            return newMsgs
        })
      }

    } catch (error) {
      console.error("Hiba történt:", error)
      setMessages(prev => [...prev, { id: 'error', role: 'assistant', content: 'Sajnos hiba történt. Próbáld újra!' }])
    } finally {
      setIsThinking(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  return (
    <>
      {/* --- LEBEGŐ GOMB (FAB) --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-[60] flex items-center justify-center transition-all duration-300 shadow-2xl border-2 border-white/20 hover:scale-105 active:scale-95
          ${isOpen 
            ? 'bottom-6 right-6 w-12 h-12 rounded-full bg-slate-800 text-white rotate-90' // Ha nyitva van: kisebb, sötét gomb X-szel
            : 'bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white' // Ha zárva: nagy színes gomb
          }`}
        title={isOpen ? "Bezárás" : "AI Szerelő megnyitása"}
      >
        {isOpen ? (
            // X ikon (bezárás)
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
            // ÚJ IKON: Chat buborék + Csillag (AI)
            <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
        )}
      </button>

      {/* --- SÖTÉTÍTETT HÁTTÉR (csak mobilon, ha nyitva) --- */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
        />
      )}

      {/* --- CHAT ABLAK --- */}
      {isOpen && (
        <div className={`
            fixed z-50 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800
            animate-in slide-in-from-bottom-10 duration-300
            
            /* MOBIL NÉZET: Alulról felcsúszó fiók (Drawer), teljes szélesség, lekerekített tető */
            bottom-0 left-0 right-0 w-full h-[85vh] rounded-t-[2rem] 
            
            /* ASZTALI NÉZET: Jobb alsó sarok, lebegő kártya */
            md:bottom-28 md:right-10 md:w-[400px] md:h-[600px] md:rounded-3xl
        `}>
          
          {/* FEJLÉC */}
          <div className="bg-slate-950 p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
                    {/* Szerelőkulcs ikon a fejlécben */}
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        DriveSync Asszisztens
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono">AI</span>
                    </h3>
                    <p className="text-slate-400 text-xs">A flottád szakértője.</p>
                </div>
             </div>
             {/* Mobilon itt is be lehet zárni egy kis lefelé nyíllal, opcionális */}
             <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-500 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
             </button>
          </div>

          {/* ÜZENETEK */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950 scroll-smooth" ref={scrollRef}>
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm px-4 pb-10">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    </div>
                    <p className="font-medium text-slate-600 dark:text-slate-300 mb-6">Szia! Miben segíthetek ma?</p>
                    <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
                        <button 
                            onClick={() => sendMessage('Mikor volt utoljára olajcsere?')}
                            className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-left hover:border-blue-400 transition shadow-sm flex items-center gap-2 group"
                        >
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">🛢️</span> Mikor volt olajcsere?
                        </button>
                        <button 
                            onClick={() => sendMessage('Mennyit költöttem idén tankolásra?')}
                            className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-left hover:border-blue-400 transition shadow-sm flex items-center gap-2 group"
                        >
                            <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">⛽</span> Mennyit tankoltam idén?
                        </button>
                    </div>
                </div>
            )}
            
            {messages.map((m, index) => (
              <div key={index} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${
                    m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                }`}>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            ))}
            
            {isThinking && (
                <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none text-xs text-slate-400 border border-slate-200 dark:border-slate-700 flex gap-1 items-center">
                        <span className="text-[10px] mr-2 font-bold uppercase tracking-wider">AI</span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                </div>
            )}
          </div>

          {/* INPUT MEZŐ */}
          <form onSubmit={handleSubmit} className="p-3 md:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 shrink-0 pb-6 md:pb-4">
            <input
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Írj ide..."
            />
            <button type="submit" disabled={isThinking || !inputValue} className="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-xl disabled:opacity-50 transition-colors shadow-md disabled:cursor-not-allowed">
                <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}