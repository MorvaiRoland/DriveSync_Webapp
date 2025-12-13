'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, X, Paperclip } from 'lucide-react' // Új ikonok

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  // Opcionális: megjelenítéshez, ha a user küldött képet
  attachment?: string; 
}

// Segédfüggvény: Kép átalakítása Base64-be
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default function AiMechanic({ isPro = false }: { isPro?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null) // Tárolja a kiválasztott képet
  const [isThinking, setIsThinking] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null) // Referencia a rejtett inputhoz

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isThinking, isOpen, selectedImage])

  // Fájl kiválasztás kezelése
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await convertToBase64(file);
        setSelectedImage(base64);
      } catch (error) {
        console.error("Hiba a kép beolvasásakor:", error);
        alert("Nem sikerült beolvasni a képet.");
      }
    }
  };

  const sendMessage = async (content: string) => {
    if (!isPro) return;
    if (!content.trim() && !selectedImage) return // Ha se szöveg, se kép, ne küldjön semmit

    // Lokális üzenet megjelenítése
    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content,
      attachment: selectedImage || undefined
    }
    
    setMessages(prev => [...prev, userMsg])
    setIsThinking(true)
    setInputValue('')
    
    // Elmentjük a képet egy változóba és töröljük a state-ből, hogy a következő üzenetnél ne ragadjon be
    const imageToSend = selectedImage;
    setSelectedImage(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Itt küldjük el a szöveget ÉS a képet is
          messages: [...messages, userMsg].map(m => {
             // Ha ez az aktuális üzenet és van kép, akkor specifikus formátumban küldjük
             if (m.id === userMsg.id && imageToSend) {
                return {
                    role: 'user',
                    content: [
                        { type: 'text', text: m.content },
                        { type: 'image', image: imageToSend } // Base64 string
                    ]
                };
             }
             // Régebbi üzenetek vagy csak szöveges üzenet
             return { role: m.role, content: m.content };
          })
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
      {/* ... (A LEBEGŐ GOMB RÉSZE VÁLTOZATLAN) ... */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-[60] flex items-center justify-center transition-all duration-500 shadow-2xl border border-white/20 backdrop-blur-md
        ${isOpen
            ? 'bottom-6 right-6 w-12 h-12 rounded-full bg-slate-900/80 text-white rotate-90 hover:bg-slate-800'
            : 'bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white hover:scale-105 hover:shadow-indigo-500/50 hover:-translate-y-1'
          }`}
      >
        <div className="relative flex items-center justify-center w-full h-full">
          {isOpen ? (
             <X className="w-6 h-6" />
          ) : (
            <>
              <span className="absolute inline-flex h-full w-full rounded-2xl bg-indigo-400 opacity-20 animate-ping"></span>
              <svg className="w-7 h-7 md:w-8 md:h-8 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </>
          )}
        </div>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <div className={`
            fixed z-50 flex flex-col overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
            animate-in slide-in-from-bottom-12 fade-in zoom-in-95 duration-300 ease-out
            bottom-0 left-0 right-0 w-full h-[85vh] rounded-t-[2.5rem]
            md:bottom-28 md:right-8 md:w-[420px] md:h-[650px] md:rounded-[2rem]
        `}>

          {/* ... (FEJLÉC VÁLTOZATLAN) ... */}
           <div className="relative bg-gradient-to-r from-indigo-600 to-blue-600 p-0.5 shrink-0">
             <div className="bg-slate-900/10 backdrop-blur-md p-4 flex items-center justify-between">
                 <div className="flex items-center gap-3.5">
                    <span className="text-2xl">🤖</span>
                    <h3 className="text-white font-bold">AI Szerelő</h3>
                 </div>
             </div>
           </div>

          {/* --- ÜZENETEK --- */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth bg-slate-50/50 dark:bg-slate-950/50" ref={scrollRef}>
            {messages.map((m, index) => (
              <div key={index} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                
                {/* HA VAN CSATOLT KÉP, MEGJELENÍTJÜK */}
                {m.attachment && (
                    <div className="mb-2 max-w-[80%] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                        <img src={m.attachment} alt="Feltöltött kép" className="w-full h-auto max-h-48 object-cover" />
                    </div>
                )}

                <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm shadow-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                }`}>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            ))}
            {isThinking && (
                 <div className="flex items-center gap-2 text-slate-400 text-xs ml-4">
                    <span className="animate-spin">⚙️</span> Az AI elemzi az adatokat...
                 </div>
            )}
          </div>

          {/* --- BEVITELI MEZŐ (KÉP FELTÖLTÉSSEL) --- */}
          {isPro && (
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
              
              {/* Kép előnézet a küldés előtt */}
              {selectedImage && (
                  <div className="relative mb-2 inline-block">
                      <img src={selectedImage} alt="Preview" className="h-20 w-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm" />
                      <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                      >
                          <X className="w-3 h-3" />
                      </button>
                  </div>
              )}

              <form onSubmit={handleSubmit} className="relative flex items-end gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all shadow-inner">
                
                {/* REJTETT INPUT A KAMERÁHOZ/FÁJLHOZ */}
                <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" // Ez nyitja meg a hátsó kamerát mobilon
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                />

                {/* KAMERA GOMB */}
                <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                    title="Fotó készítése vagy feltöltése"
                >
                    <Camera className="w-5 h-5" />
                </button>

                <input
                  className="flex-1 bg-transparent text-slate-900 dark:text-white px-2 py-2.5 text-sm focus:outline-none placeholder:text-slate-400 font-medium self-center"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={selectedImage ? "Írj valamit a képről..." : "Írj ide..."}
                  disabled={isThinking}
                />
                
                <button 
                  type="submit" 
                  disabled={isThinking || (!inputValue.trim() && !selectedImage)} 
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90 mb-0.5"
                >
                   <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                   </svg>
                </button>
              </form>
            </div>
          )}

        </div>
      )}
    </>
  )
}