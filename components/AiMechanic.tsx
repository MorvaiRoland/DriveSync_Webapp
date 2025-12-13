'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, X, Send, Sparkles, Image as ImageIcon, Bot, User, Trash2, Minimize2 } from 'lucide-react'

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
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Automatikus görgetés
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isThinking, isOpen, selectedImage])

  // Fájlkezelés
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

  // Üzenet küldése
  const sendMessage = async (content: string) => {
    if (!isPro) return;
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
                        { type: 'image', image: imageToSend }
                    ]
                };
             }
             return { role: m.role, content: m.content };
          })
        }),
      })

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
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: 'Hiba történt a kommunikációban.' }])
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
      {/* --- LEBEGŐ NYITÓ GOMB (Csak akkor látszik, ha ZÁRVA van) --- */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[60] group"
        >
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
          <div className="relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-transform transform group-hover:scale-105 group-hover:-translate-y-1 active:scale-95 border border-white/20">
            <Sparkles className="w-7 h-7 md:w-8 md:h-8 fill-white/20" />
            
            {/* Értesítés jelző pötty */}
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
            </span>
          </div>
        </button>
      )}

      {/* --- CHAT ABLAK (Teljes képernyő mobilon, kártya desktopon) --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] md:inset-auto md:bottom-6 md:right-6 md:w-[450px] md:h-[700px] flex flex-col shadow-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 md:rounded-[2rem] border-0 md:border md:border-slate-200/50 dark:md:border-slate-700/50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* 1. FEJLÉC (Ide került a bezáró gomb a beviteli mező helyett) */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-0.5 shrink-0">
             <div className="bg-slate-900/10 backdrop-blur-md px-4 py-3 flex items-center justify-between">
                
                {/* Bal oldal: Cím és Státusz */}
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
                         <Sparkles className="w-3 h-3" /> GPT-4o Powered
                      </p>
                   </div>
                </div>

                {/* Jobb oldal: Műveletek */}
                <div className="flex items-center gap-2">
                   {!isPro && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-lg bg-white/10 border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                         Demo mód
                      </span>
                   )}
                   <button 
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                   >
                      <Minimize2 className="w-5 h-5 md:hidden" /> {/* Mobilon lekicsinyítés ikon */}
                      <X className="w-5 h-5 hidden md:block" />   {/* Desktopon X ikon */}
                   </button>
                </div>
             </div>
          </div>

          {/* 2. ÜZENETEK LISTÁJA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-[#f8fafc] dark:bg-[#0f172a]" ref={scrollRef}>
             {/* Üdvözlő üzenet */}
             {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-60 mt-10">
                   <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-4 rotate-6">
                      <Bot className="w-8 h-8 text-indigo-500" />
                   </div>
                   <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[250px]">
                      Szia! Tölts fel egy fotót a hibáról, vagy írd le mi a gond az autóval.
                   </p>
                </div>
             )}

             {messages.map((m, index) => (
                <div key={index} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                   <div className={`flex max-w-[85%] flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      
                      {/* Csatolt kép megjelenítése */}
                      {m.attachment && (
                         <div className="mb-1 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm w-48">
                            <img src={m.attachment} alt="Feltöltés" className="w-full h-auto object-cover" />
                         </div>
                      )}

                      {/* Szövegbuborék */}
                      <div className={`
                         px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm relative
                         ${m.role === 'user' 
                            ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-br-none' 
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'}
                      `}>
                         <div className="whitespace-pre-wrap">{m.content}</div>
                      </div>
                      
                      {/* Időbélyeg vagy név (opcionális) */}
                      <span className="text-[10px] text-slate-400 font-medium px-1">
                         {m.role === 'user' ? 'Te' : 'AI'}
                      </span>
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

          {/* 3. LÁBLÉC (BEVITELI MEZŐ) */}
          {isPro ? (
             <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 safe-area-bottom">
                
                {/* Kép előnézet (Pici, lebegő, ha ki van választva) */}
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
                   
                   {/* Rejtett fájl input */}
                   <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                   />

                   {/* Kamera / Kép gomb */}
                   <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-11 w-11 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                   >
                      {selectedImage ? <ImageIcon className="w-5 h-5 text-indigo-500" /> : <Camera className="w-5 h-5" />}
                   </button>

                   {/* Szövegmező */}
                   <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center border border-transparent focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                      <input
                         className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                         placeholder="Írj üzenetet..."
                         value={inputValue}
                         onChange={(e) => setInputValue(e.target.value)}
                         disabled={isThinking}
                      />
                   </div>

                   {/* Küldés gomb */}
                   <button 
                      type="submit" 
                      disabled={isThinking || (!inputValue.trim() && !selectedImage)} 
                      className={`h-11 w-11 flex items-center justify-center rounded-xl transition-all shadow-md flex-shrink-0
                         ${(isThinking || (!inputValue.trim() && !selectedImage))
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                            : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 shadow-indigo-500/30'}
                      `}
                   >
                      <Send className="w-5 h-5 ml-0.5" />
                   </button>
                </form>
                
                <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
                   Az AI tévedhet. Fontos kérdésekben egyeztess szakemberrel.
                </p>
             </div>
          ) : (
             /* ZÁROLT ÁLLAPOT (Ha nincs PRO) */
             <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
                <p className="text-sm text-slate-500 mb-4">A funkció használatához Pro csomag szükséges.</p>
                <a href="/pricing" className="block w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-lg hover:opacity-90 transition-opacity">
                   Előfizetés
                </a>
             </div>
          )}

        </div>
      )}
    </>
  )
}