'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { 
  Bug, Lightbulb, CreditCard, HelpCircle, 
  UploadCloud, Send, CheckCircle2, 
  Monitor, Loader2, Sparkles, Image as ImageIcon, X
} from 'lucide-react';
import { submitTicket } from './actions';
import { toast } from 'sonner';

// --- 3D KÁRTYA KOMPONENS (Téma-adaptív) ---
const TiltCard = ({ children, isSelected, onClick, className }: any) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  return (
    <motion.div
      style={{ x, y, rotateX, rotateY, z: 100 }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      whileHover={{ cursor: 'pointer', scale: 1.05 }}
      onClick={onClick}
      className={`relative overflow-hidden transition-all duration-500 ${className} ${isSelected ? 'shadow-lg shadow-amber-500/20' : ''}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-500 ${isSelected ? 'opacity-100' : ''}`} />
      {children}
    </motion.div>
  );
};

const categories = [
  { id: 'bug', label: 'Hiba', desc: 'Valami elromlott', icon: Bug, color: 'text-red-500', activeBg: 'bg-red-500/10 dark:bg-red-500/20', activeBorder: 'border-red-500/50' },
  { id: 'feature', label: 'Ötlet', desc: 'Új funkció kérése', icon: Lightbulb, color: 'text-amber-500', activeBg: 'bg-amber-500/10 dark:bg-amber-500/20', activeBorder: 'border-amber-500/50' },
  { id: 'billing', label: 'Számla', desc: 'Előfizetési gond', icon: CreditCard, color: 'text-blue-500', activeBg: 'bg-blue-500/10 dark:bg-blue-500/20', activeBorder: 'border-blue-500/50' },
  { id: 'other', label: 'Egyéb', desc: 'Általános kérdés', icon: HelpCircle, color: 'text-slate-500 dark:text-slate-400', activeBg: 'bg-slate-200 dark:bg-slate-800', activeBorder: 'border-slate-300 dark:border-slate-600' },
];

export default function SupportPage() {
  const [selectedCategory, setSelectedCategory] = useState('bug');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>({});
  
  // Fájl feltöltés state
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // AI gépelés effekt
  const [descLength, setDescLength] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState('Várakozás...');

  useEffect(() => {
    setDeviceInfo({
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      platform: navigator.platform,
      connection: (navigator as any).connection ? (navigator as any).connection.effectiveType : 'unknown'
    });
  }, []);

  // AI "elemzés" effekt gépeléskor
  useEffect(() => {
    if (descLength > 10 && descLength < 30) setAiAnalysis('Probléma azonosítása...');
    else if (descLength >= 30 && descLength < 60) setAiAnalysis('Kulcsszavak kinyerése...');
    else if (descLength >= 60) setAiAnalysis('Hasonló jegyek keresése...');
    else if (descLength === 0) setAiAnalysis('Várakozás...');
  }, [descLength]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('A fájl túl nagy (max 5MB)');
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // Drag & Drop kezelők
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setPreviewUrl(URL.createObjectURL(e.dataTransfer.files[0]));
    }
  };

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    formData.append('type', selectedCategory);
    formData.append('deviceInfo', JSON.stringify(deviceInfo));
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result = await submitTicket(formData);
    setIsSubmitting(false);

    if (result?.error) toast.error(result.error);
    else setIsSuccess(true);
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative transition-colors duration-500">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="text-center max-w-md relative z-10"
        >
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(16,185,129,0.4)]"
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Vettük az adást!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-lg">
            A jegyedet rögzítettük <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">#T-{Math.floor(Math.random()*10000)}</span> számon.
            <br/>A fejlesztők már kávéznak és vizsgálják.
          </p>
          <button onClick={() => window.location.href = '/'} className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all hover:scale-105 shadow-lg">
            Vissza a Dashboardra
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 p-4 md:p-8 font-sans selection:bg-amber-500/30 overflow-x-hidden transition-colors duration-500">
      
      {/* Background Ambience - Light/Dark adaptív */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/5 rounded-full blur-[150px] animate-pulse mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-amber-600/5 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 pt-10">
        
        {/* Header */}
        <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400 mb-6 backdrop-blur-md shadow-sm dark:shadow-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Support Center Live
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight drop-shadow-sm dark:drop-shadow-2xl">
            Központ <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Vonalban.</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xl max-w-2xl mx-auto font-light">
            Mondd el mi a gond, mi pedig megoldjuk. Az AI rendszerünk segít a kategorizálásban.
          </p>
        </motion.div>

        <form action={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* BAL OLDAL: KATEGÓRIÁK (GRID) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {categories.map((cat, i) => (
                  <TiltCard
                    key={cat.id}
                    isSelected={selectedCategory === cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-5 rounded-2xl border backdrop-blur-md transition-all ${
                      selectedCategory === cat.id 
                        ? `${cat.activeBg} ${cat.activeBorder} ring-1 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-950 ring-${cat.color.split('-')[1]}-500`
                        : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:bg-white/80 dark:hover:bg-slate-800/60 shadow-sm dark:shadow-none'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${selectedCategory === cat.id ? 'bg-white/50 dark:bg-white/20' : 'bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800'} ${cat.color}`}>
                        <cat.icon size={24} />
                      </div>
                      <div>
                        <span className={`block font-bold text-lg ${selectedCategory === cat.id ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{cat.label}</span>
                        <span className="text-xs text-slate-500 font-medium">{cat.desc}</span>
                      </div>
                      {selectedCategory === cat.id && (
                        <motion.div layoutId="active-indicator" className="ml-auto">
                          <div className={`w-3 h-3 rounded-full ${cat.color.replace('text', 'bg')} shadow-[0_0_10px_currentColor]`} />
                        </motion.div>
                      )}
                    </div>
                  </TiltCard>
                ))}
              </div>

              {/* Rendszer Info Panel */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-100 to-white dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800/50 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-slate-900 dark:text-white"><Monitor size={80} /></div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Rendszer Diagnosztika</p>
                <div className="space-y-2 text-xs font-mono text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                    <span>OS Platform:</span> <span className="text-emerald-600 dark:text-emerald-500">{deviceInfo.platform || '...'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                    <span>Kijelző:</span> <span className="text-blue-600 dark:text-blue-500">{deviceInfo.screenSize || '...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nyelv:</span> <span className="text-amber-600 dark:text-amber-500">{deviceInfo.language || '...'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* JOBB OLDAL: ŰRLAP (GLASS PANEL) */}
            <div className="lg:col-span-8">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
              >
                {/* Díszítő fénycsík */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

                <div className="space-y-8">
                  
                  {/* Tárgy */}
                  <div>
                    <label className="text-sm font-bold text-slate-500 dark:text-slate-400 ml-1 mb-2 block uppercase tracking-wider">Téma</label>
                    <input 
                      name="subject" type="text" placeholder="Röviden, miről van szó?" 
                      className="w-full bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-5 py-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-lg font-medium shadow-sm dark:shadow-none"
                      required
                    />
                  </div>

                  {/* Leírás + AI Feedback */}
                  <div className="relative">
                    <div className="flex justify-between items-center mb-2 ml-1">
                      <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Részletek</label>
                      {descLength > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-mono bg-indigo-100 dark:bg-indigo-500/10 px-2 py-1 rounded">
                          <Sparkles size={10} /> {aiAnalysis}
                        </motion.div>
                      )}
                    </div>
                    <textarea 
                      name="description" rows={6}
                      onChange={(e) => setDescLength(e.target.value.length)}
                      placeholder={selectedCategory === 'bug' ? "Kérlek írd le lépésről lépésre, mi történt..." : "Oszd meg velünk az ötletedet..."}
                      className="w-full bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-5 py-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-sans leading-relaxed resize-none shadow-sm dark:shadow-none"
                      required
                    ></textarea>
                  </div>

                  {/* Drag & Drop Fájl Feltöltés */}
                  <div>
                    <label className="text-sm font-bold text-slate-500 dark:text-slate-400 ml-1 mb-2 block uppercase tracking-wider">Melléklet</label>
                    <div 
                      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                        isDragging 
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 scale-[1.02]' 
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-900'
                      }`}
                    >
                      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onChange={handleFileChange} accept="image/*" />
                      
                      {previewUrl ? (
                        <div className="relative z-10 flex items-center justify-center gap-4">
                          <img src={previewUrl} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-slate-200 dark:border-white/20 shadow-lg" />
                          <div className="text-left">
                            <p className="text-slate-900 dark:text-white font-bold text-sm truncate max-w-[200px]">{file?.name}</p>
                            <p className="text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1"><CheckCircle2 size={10} /> Fájl csatolva</p>
                          </div>
                          <button onClick={(e) => { e.preventDefault(); setFile(null); setPreviewUrl(null); }} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-white z-30 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className={`p-4 rounded-full ${isDragging ? 'bg-amber-500 text-white dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'} transition-colors`}>
                            {isDragging ? <UploadCloud size={24} className="animate-bounce" /> : <ImageIcon size={24} />}
                          </div>
                          <div>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">Húzd ide a képet vagy kattints</p>
                            <p className="text-slate-500 dark:text-slate-600 text-xs mt-1">PNG, JPG (max 5MB)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Beküldés Gomb */}
                  <div className="pt-4">
                    <button 
                      type="submit" disabled={isSubmitting}
                      className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 p-[1px] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                    >
                      <div className="relative flex items-center justify-center gap-2 rounded-xl bg-white/10 dark:bg-slate-950/10 px-8 py-4 text-lg font-bold text-white transition-all group-hover:bg-transparent">
                        {isSubmitting ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>Adatok küldése...</span>
                          </>
                        ) : (
                          <>
                            <span>Bejelentés Küldése</span>
                            <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </div>
                    </button>
                    <p className="text-center text-xs text-slate-500 dark:text-slate-600 mt-4">
                      A beküldéssel elfogadod az adatkezelési tájékoztatót. Az adataidat biztonságosan kezeljük.
                    </p>
                  </div>

                </div>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}