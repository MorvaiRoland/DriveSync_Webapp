'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, X, Send, Sparkles, Image as ImageIcon, Bot, Car, Wrench, BarChart3, Trash2, Minimize2, ChevronRight, Lock } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

// --- TÍPUSOK ---
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachment?: string; 
}

// --- KÉP TÖMÖRÍTŐ SEGÉDFÜGGVÉNY ---
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function AiMechanic({ isPro = false }: { isPro?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  // --- RATE LIMIT STATEK ---
  const [dailyCount, setDailyCount] = useState(0)
  const [limitReached, setLimitReached] = useState(false)
  const DAILY_LIMIT = 5

  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // --- AUTOMATIKUS GÖRGETÉS ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isThinking, isOpen, selectedImage])

  // --- NAPI HASZNÁLAT LEKÉRÉSE ---
  useEffect(() => {
    if (isPro) return; // Pro usernek nem kell

    const fetchUsage = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('user_daily_usage')
        .select('message_count, last_reset_date')
        .eq('user_id', user.id)
        .single()

      if (data) {
        const today = new Date().toISOString().split('T')[0]
        if (data.last_reset_date === today) {
          setDailyCount(data.message_count)
          if (data.message_count >= DAILY_LIMIT) setLimitReached(true)
        } else {
          // Új nap van, resetelünk
          setDailyCount(0)
          setLimitReached(false)
        }
      }
    }
    
    if (isOpen) fetchUsage() // Csak akkor kérdezzük le, ha kinyitja
  }, [isOpen, isPro, supabase])

  // --- FÁJLKEZELÉS ---
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Csak képet tölthetsz fel!');
        return;
      }
      try {
        const compressedBase64 = await compressImage(file);
        setSelectedImage(compressedBase64);
      } catch (error) {
        console.error("Hiba:", error);
      }
    }
  };

  // --- ÜZENET KÜLDÉSE ---
  const sendMessage = async (content: string) => {
    // Kliens oldali védelem
    if (!isPro && limitReached) {
        return; 
    }

    if (!content.trim() && !selectedImage) return

    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content,
      attachment: selectedImage || undefined
    }
    
    setMessages(prev => [...prev, userMsg])
    setIsThinking(true)
    setInputValue('')
    
    // Optimista számláló növelés
    if (!isPro) {
        const newCount = dailyCount + 1
        setDailyCount(newCount)
        if (newCount >= DAILY_LIMIT) setLimitReached(true)
    }
    
    const imageToSend = selectedImage;
    setSelectedImage(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => {
             if (m.id === userMsg.id && imageToSend) {
                return {
                    role: 'user',
                    content: [
                        { type: 'text', text: m.content },
                        { type: 'image', image: imageToSend } // Base64
                    ]
                };
             }
             return { role: m.role, content: m.content };
          })
        }),
      })

      // Limit hiba kezelése a szerverről
      if (response.status === 429) {
         setLimitReached(true)
         setDailyCount(DAILY_LIMIT) // Biztos ami biztos
         throw new Error('LIMIT_REACHED')
      }

      if (!response.ok) throw new Error('Hiba a válaszban')
      
      const aiMsgId = (Date.now() + 1).toString()
      setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '' }])

      const reader = response.body!.getReader()
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
    } catch (error: any) {
      let errorMessage = 'Hiba történt a kommunikációban.';
      if (error.message === 'LIMIT_REACHED') {
          errorMessage = '🛑 Elérted a napi limitet (5 üzenet). Gyere vissza holnap, vagy válts Pro csomagra!';
      }
      
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: errorMessage }])
    } finally {
      setIsThinking(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  // --- JAVASLATOK ---
  const suggestions = [
    { icon: <Wrench className="w-4 h-4 text-amber-500" />, text: "Mit jelent a P0300 hibakód?", category: "Hiba" },
    { icon: <BarChart3 className="w-4 h-4 text-emerald-500" />, text: "Mennyit költöttem idén tankolásra?", category: "Garázs" },
    { icon: <Car className="w-4 h-4 text-blue-500" />, text: "Mikor volt utoljára szervizelve az Audi?", category: "Garázs" },
    { icon: <ImageIcon className="w-4 h-4 text-purple-500" />, text: "Feltöltök egy képet a műszerfalról", category: "Fotó", action: () => fileInputRef.current?.click() },
  ];

  return (
    <>
      {/* --- LEBEGŐ NYITÓ GOMB --- */}
          {!isOpen && (
             <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-[60] group"
                style={{
                   paddingBottom: 'env(safe-area-inset-bottom, 0px)'
                }}
             >
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-105 group-hover:-translate-y-1 active:scale-95 border border-white/20">
                   <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 fill-white/20" />
                   {/* Piros pötty, ha még nem érte el a limitet és nem pro */}
                   {!isPro && !limitReached && (
                       <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                       </span>
                   )}
                </div>
             </button>
          )}

      {/* --- CHAT ABLAK --- */}
          {isOpen && (
             <div
                className="fixed inset-0 z-[100] flex flex-col shadow-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 animate-in slide-in-from-bottom-10 fade-in duration-300 md:inset-auto md:bottom-6 md:right-6 md:w-[95vw] md:max-w-[450px] md:h-[90vh] md:max-h-[750px] md:rounded-[2rem] border-0 md:border md:border-slate-200/50 dark:md:border-slate-700/50"
                style={{
                   maxHeight: '100dvh',
                   paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                   paddingTop: 'env(safe-area-inset-top, 0px)',
                }}
             >
                {/* 1. FEJLÉC */}
                <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-0.5 shrink-0">
                   <div className="bg-slate-900/10 backdrop-blur-md px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                               <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-indigo-600 rounded-full"></div>
                         </div>
                         <div>
                            <h3 className="text-white font-bold text-base leading-tight">AI Szerelő</h3>
                            <p className="text-indigo-100/80 text-xs font-medium flex items-center gap-1">
                               <Sparkles className="w-3 h-3" /> Saját flotta hozzáféréssel
                            </p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         {!isPro && (
                            <span className="hidden sm:inline-block px-2 py-0.5 rounded-lg bg-white/10 border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                               Demo
                            </span>
                         )}
                         <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                         >
                            <Minimize2 className="w-5 h-5 md:hidden" />
                            <X className="w-5 h-5 hidden md:block" />
                         </button>
                      </div>
                   </div>
                </div>

                {/* 1.5 LIMIT SÁV (CSAK FREE USEREKNEK) */}
                {!isPro && (
                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-center border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-sm z-10">
                        <span className="text-slate-500">Napi limit</span>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                                {[...Array(DAILY_LIMIT)].map((_, i) => (
                                    <div key={i} className={`h-1.5 w-4 rounded-full transition-all ${i < dailyCount ? (limitReached ? 'bg-red-500' : 'bg-indigo-500') : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                ))}
                            </div>
                            <span className={`${limitReached ? 'text-red-500' : 'text-indigo-500'}`}>
                                {dailyCount}/{DAILY_LIMIT}
                            </span>
                        </div>
                    </div>
                )}

                {/* 2. ÜZENETEK LISTÁJA */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-6 scroll-smooth bg-[#f8fafc] dark:bg-[#0f172a]" ref={scrollRef}>
                   {/* --- START KÉPERNYŐ (HA NINCS ÜZENET) --- */}
                   {messages.length === 0 && (
                      <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                         <div className="flex-1 flex flex-col items-center justify-center text-center mt-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-white dark:from-slate-800 dark:to-slate-700 rounded-3xl shadow-lg flex items-center justify-center mb-6 rotate-3 border border-indigo-50 dark:border-slate-600">
                               <Bot className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Miben segíthetek?</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[320px] sm:max-w-[280px] leading-relaxed">
                               Ismerem a garázsodban lévő autókat, szervizeket és költségeket. De diagnosztikában is profi vagyok.
                            </p>
                         </div>
                         {/* Javaslatok kategóriák szerint */}
                         <div className="mt-auto space-y-2 pb-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Javasolt kérdések</p>
                            <div className="grid gap-2">
                               {suggestions.map((s, i) => (
                                  <button
                                     key={i}
                                     onClick={() => s.action ? s.action() : sendMessage(s.text)}
                                     disabled={!isPro && limitReached}
                                     className={`flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all group text-left w-full active:scale-98 ${!isPro && limitReached ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md'}`}
                                  >
                                     <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        {s.icon}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                        <div className="text-xs text-slate-400 font-bold mb-0.5 uppercase tracking-wide">{s.category}</div>
                                        <div className="text-sm text-slate-700 dark:text-slate-200 font-medium truncate">{s.text}</div>
                                     </div>
                                     <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                  </button>
                               ))}
                            </div>
                         </div>
                      </div>
                   )}

                   {messages.map((m, index) => (
                      <div key={index} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                         <div className={`flex max-w-[90vw] sm:max-w-[85%] flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                            {m.attachment && (
                               <div className="mb-1 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm w-40 sm:w-48">
                                  <img src={m.attachment} alt="Feltöltés" className="w-full h-auto object-cover" />
                               </div>
                            )}
                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm relative ${m.role === 'user' ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'}`}>
                               <div className="whitespace-pre-wrap">{m.content}</div>
                            </div>
                         </div>
                      </div>
                   ))}

                   {isThinking && (
                      <div className="flex justify-start animate-in fade-in duration-300">
                         <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-sm flex gap-1.5 items-center">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200"></span>
                         </div>
                      </div>
                   )}
                </div>

                {/* 3. LÁBLÉC (INPUT VAGY LIMIT MESSAGE) */}
                <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 safe-area-bottom">
                    
                    {/* HA ELÉRTE A LIMITET ÉS NEM PRO */}
                    {!isPro && limitReached ? (
                        <div className="p-6 text-center animate-in slide-in-from-bottom-4">
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Lock className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Napi keret kimerült</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                A mai napra elhasználtad az 5 ingyenes üzenetet. <br/>
                                Válts Pro csomagra a korlátlan hozzáférésért!
                            </p>
                            <a href="/pricing" className="block w-full py-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                                🚀 Pro csomag aktiválása
                            </a>
                        </div>
                    ) : (
                        /* NORMÁL INPUT MEZŐ */
                        <div className="p-3">
                            {selectedImage && (
                                <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50 mx-1 animate-in slide-in-from-bottom-2">
                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative">
                                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">Kép csatolva</p>
                                    <p className="text-[10px] text-slate-500">Kész a küldésre</p>
                                </div>
                                <button onClick={() => setSelectedImage(null)} className="p-1.5 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="flex items-end gap-2">
                                <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="h-11 w-11 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors flex-shrink-0">
                                {selectedImage ? <ImageIcon className="w-5 h-5 text-indigo-500" /> : <Camera className="w-5 h-5" />}
                                </button>
                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center border border-transparent focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                                <input className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400" placeholder="Írj üzenetet..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} disabled={isThinking} />
                                </div>
                                <button type="submit" disabled={isThinking || (!inputValue.trim() && !selectedImage)} className={`h-11 w-11 flex items-center justify-center rounded-xl transition-all shadow-md flex-shrink-0 ${(isThinking || (!inputValue.trim() && !selectedImage)) ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 shadow-indigo-500/30'}`}>
                                <Send className="w-5 h-5 ml-0.5" />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
             </div>
          )}
    </>
  )
}