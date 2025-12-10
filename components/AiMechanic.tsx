'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AiMechanic({ isPro = false }: { isPro?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Automatikus görgetés az üzenetek aljára
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isThinking, isOpen])

  const sendMessage = async (content: string) => {
    if (!isPro) return;
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
      setMessages(prev => [...prev, { id: 'error', role: 'assistant', content: 'Sajnos hiba történt. Kérlek próbáld újra!' }])
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
        className={`fixed z-[60] flex items-center justify-center transition-all duration-500 shadow-2xl border border-white/20 backdrop-blur-md
        ${isOpen
            ? 'bottom-6 right-6 w-12 h-12 rounded-full bg-slate-900/80 text-white rotate-90 hover:bg-slate-800'
            : 'bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white hover:scale-105 hover:shadow-indigo-500/50 hover:-translate-y-1'
          }`}
        title={isOpen ? "Bezárás" : "AI Szerelő megnyitása"}
      >
        <div className="relative flex items-center justify-center w-full h-full">
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <>
              {/* Pulzáló gyűrű effekt a figyelemfelkeltéshez */}
              <span className="absolute inline-flex h-full w-full rounded-2xl bg-indigo-400 opacity-20 animate-ping"></span>
              {/* Robot/AI Ikon */}
              <svg className="w-7 h-7 md:w-8 md:h-8 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </>
          )}
        </div>
      </button>

      {/* --- SÖTÉTÍTETT HÁTTÉR (csak mobilon) --- */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* --- CHAT ABLAK --- */}
      {isOpen && (
        <div className={`
            fixed z-50 flex flex-col overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
            animate-in slide-in-from-bottom-12 fade-in zoom-in-95 duration-300 ease-out
            
            /* Mobil: Alsó panel (Bottom Sheet) */
            bottom-0 left-0 right-0 w-full h-[85vh] rounded-t-[2.5rem]
            
            /* Desktop: Lebegő kártya */
            md:bottom-28 md:right-8 md:w-[420px] md:h-[650px] md:rounded-[2rem]
        `}>

          {/* --- FEJLÉC --- */}
          <div className="relative bg-gradient-to-r from-indigo-600 to-blue-600 p-0.5 shrink-0">
            {/* Vékony gradiens keret alul */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/10"></div>
            
            <div className="bg-slate-900/10 backdrop-blur-md p-4 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner border border-white/20">
                    <span className="text-2xl">🤖</span>
                  </div>
                  {/* Online státusz pötty */}
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-indigo-600 rounded-full"></div>
                </div>
                
                <div>
                  <h3 className="text-white font-bold text-base flex items-center gap-2">
                    AI Szerelő
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                      Béta
                    </span>
                  </h3>
                  <p className="text-indigo-100/80 text-xs font-medium">Mindig elérhető • Azonnali válasz</p>
                </div>
              </div>

              {!isPro && (
                 <div className="flex items-center gap-1.5 bg-slate-900/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    <span className="text-[10px] font-bold text-white tracking-wide">CSAK PRO</span>
                 </div>
              )}
            </div>
          </div>

          {/* --- ÜZENETEK TERÜLET --- */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth bg-slate-50/50 dark:bg-slate-950/50" ref={scrollRef}>
            
            {isPro ? (
              <>
                {/* Üdvözlő képernyő (Ha nincs üzenet) */}
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-white dark:from-slate-800 dark:to-slate-700 rounded-3xl shadow-xl flex items-center justify-center mb-6 rotate-3">
                       <span className="text-4xl filter drop-shadow-sm">👋</span>
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-2">Szia, Sofőr!</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 max-w-[260px] leading-relaxed">
                      Én vagyok az AI autós asszisztensed. Kérdezz bátran karbantartásról, költségekről vagy furcsa hangokról!
                    </p>
                    
                    {/* Javasolt kérdések */}
                    <div className="grid gap-2.5 w-full">
                       {[
                         { icon: '🔧', text: 'Mikor esedékes a következő szerviz?' },
                         { icon: '💰', text: 'Mennyit költöttem idén üzemanyagra?' },
                         { icon: '🚗', text: 'Mit jelent a check engine lámpa?' }
                       ].map((suggestion, idx) => (
                         <button 
                           key={idx}
                           onClick={() => sendMessage(suggestion.text)}
                           className="flex items-center gap-3 p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-left text-sm text-slate-600 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all group"
                         >
                            <span className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded-lg text-lg group-hover:scale-110 transition-transform">{suggestion.icon}</span>
                            <span className="font-medium">{suggestion.text}</span>
                         </button>
                       ))}
                    </div>
                  </div>
                )}

                {/* Üzenetlista */}
                {messages.map((m, index) => (
                  <div key={index} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    
                    {m.role === 'assistant' && (
                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs shadow-md mr-2 mt-auto shrink-0">
                          AI
                       </div>
                    )}

                    <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm shadow-sm leading-relaxed relative ${
                      m.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                    }`}>
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>
                  </div>
                ))}

                {/* Gondolkodás indikátor */}
                {isThinking && (
                  <div className="flex justify-start items-end animate-in fade-in duration-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs shadow-md mr-2">
                       <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    </div>
                    <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-700 shadow-sm flex gap-1.5 items-center">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* PRO ZÁROLT ÁLLAPOT */
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                 <div className="relative mb-8">
                    <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full"></div>
                    <div className="relative w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xl rotate-3">
                       <span className="text-5xl grayscale opacity-50">🔒</span>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg border border-white/20">
                       PRO
                    </div>
                 </div>
                 
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">AI Szerelő Feloldása</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 max-w-xs leading-relaxed">
                    Azonnali diagnosztika, költségelemzés és személyre szabott tippek a fejlett AI segítségével.
                 </p>
                 
                 <Link
                    href="/pricing"
                    className="w-full bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 font-bold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2"
                 >
                    <span>Váltás Pro Csomagra</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                 </Link>
              </div>
            )}
          </div>

          {/* --- BEVITELI MEZŐ --- */}
          {isPro && (
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
               <form 
                  onSubmit={handleSubmit}
                  className="relative flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all shadow-inner"
               >
                  <input
                    className="flex-1 bg-transparent text-slate-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none placeholder:text-slate-400 font-medium"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Írd ide a kérdésed..."
                    disabled={isThinking}
                    autoFocus
                  />
                  <button 
                     type="submit" 
                     disabled={isThinking || !inputValue.trim()} 
                     className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all active:scale-90"
                  >
                     <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                     </svg>
                  </button>
               </form>
               <div className="text-center mt-2">
                 <p className="text-[10px] text-slate-400 font-medium">Az AI tévedhet. Ellenőrizd a fontos infókat.</p>
               </div>
            </div>
          )}

        </div>
      )}
    </>
  )
}