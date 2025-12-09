'use client'

import { useState, useRef, useEffect } from 'react'

// Saját típusdefiníció, hogy a TypeScript boldog legyen
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AiMechanic() {
  // Saját állapotkezelés (független a Vercel SDK-tól)
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
  }, [messages, isThinking])

  // --- A LÉNYEG: Saját üzenetküldő logika ---
  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    // 1. Azonnal megjelenítjük a felhasználó üzenetét
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setIsThinking(true)
    setInputValue('') // Mező törlése

    try {
      // 2. Elküldjük a kérést a szervernek
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            // Elküldjük az eddigi üzeneteket kontextusnak + az újat
            messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) 
        }),
      })

      if (!response.ok) throw new Error('Hiba a válaszban')
      if (!response.body) throw new Error('Nincs válasz adat')

      // 3. Előkészítjük az AI válasz helyét (üresen)
      const aiMsgId = (Date.now() + 1).toString()
      setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '' }])

      // 4. Olvassuk a stream-et (folyamatosan érkező szöveg)
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let fullText = ''

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value, { stream: true })
        fullText += chunkValue
        
        // Frissítjük az utolsó üzenetet az új szöveggel
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
      setMessages(prev => [...prev, { id: 'error', role: 'assistant', content: 'Sajnos hiba történt a kommunikációban. Próbáld újra!' }])
    } finally {
      setIsThinking(false)
    }
  }

  // Form elküldésekor
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  return (
    <>
      {/* LEBEGŐ GOMB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 md:bottom-10 right-5 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 flex items-center justify-center border-2 border-white/20"
        title="AI Szerelő"
      >
        {isOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
            <span className="text-2xl">🤖</span>
        )}
      </button>

      {/* CHAT ABLAK */}
      {isOpen && (
        <div className="fixed bottom-40 md:bottom-28 right-5 z-50 w-[90vw] md:w-[400px] h-[600px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          <div className="bg-slate-950 p-4 flex items-center gap-3 border-b border-slate-800 shrink-0">
             <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-xl">✨</div>
             <div>
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                   Gemini Szerelő
                   <span className="text-[10px] bg-blue-500 px-1.5 py-0.5 rounded text-white">AI</span>
                </h3>
                <p className="text-slate-400 text-xs">Ismerem az autóidat.</p>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950 scroll-smooth" ref={scrollRef}>
            {messages.length === 0 && (
                <div className="text-center text-slate-400 text-sm mt-10 px-4">
                    <div className="text-4xl mb-4">👋</div>
                    <p className="font-medium text-slate-600 dark:text-slate-300">Szia! Miben segíthetek?</p>
                    <div className="mt-4 space-y-2">
                        <button 
                            onClick={() => sendMessage('Mikor volt utoljára olajcsere?')}
                            className="block w-full bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-center hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-sm"
                        >
                            🛢️ "Mikor volt utoljára olajcsere?"
                        </button>
                        <button 
                            onClick={() => sendMessage('Mennyit költöttem idén tankolásra?')}
                            className="block w-full bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-center hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-sm"
                        >
                            ⛽ "Mennyit költöttem idén?"
                        </button>
                    </div>
                </div>
            )}
            
            {messages.map((m, index) => (
              <div key={index} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm leading-relaxed ${
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
                    <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none text-xs text-slate-400 border border-slate-200 dark:border-slate-700 flex gap-1">
                        <span className="animate-bounce">●</span>
                        <span className="animate-bounce delay-100">●</span>
                        <span className="animate-bounce delay-200">●</span>
                    </div>
                </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 shrink-0">
            <input
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Írj egy kérdést..."
            />
            <button type="submit" disabled={isThinking || !inputValue} className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl disabled:opacity-50 transition-colors shadow-md">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}