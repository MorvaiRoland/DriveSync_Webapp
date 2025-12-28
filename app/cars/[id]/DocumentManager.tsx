'use client'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { uploadDocument, deleteDocument, getDocumentUrl } from './actions'
import { createBrowserClient } from '@supabase/ssr' // <--- FONTOS IMPORT

// --- ÚJ IMPORTOK A TÖMÖRÍTÉSHEZ ---
import imageCompression from 'browser-image-compression'
import { v4 as uuidv4 } from 'uuid'

type Doc = {
  id: string
  name: string
  file_path: string
  file_type: string
}

export default function DocumentManager({ carId, documents }: { carId: string, documents: Doc[] }) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // KELL A USER ID A MAPPASZERKEZETHEZ
  const [userId, setUserId] = useState<string | null>(null)

  // Supabase kliens a feltöltéshez
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [docLabel, setDocLabel] = useState("")
  const [consentGiven, setConsentGiven] = useState(false)

  // User lekérése mountoláskor
  useEffect(() => {
    async function getUser() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setUserId(user.id)
    }
    getUser()
  }, [supabase])

  // --- LOGIKA ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    // Fájlnév kiterjesztés nélkül alapértelmezett névnek
    setDocLabel(file.name.replace(/\.[^/.]+$/, ""))
    setConsentGiven(false)
    setIsModalOpen(true)
    e.target.value = ''
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setSelectedFile(null)
    setDocLabel("")
    setConsentGiven(false)
  }

  // --- MÓDOSÍTOTT FELTÖLTÉS ---
  const handleUploadConfirm = async () => {
    if (!selectedFile || !consentGiven || !userId) return
    
    setUploading(true)

    try {
      let fileToUpload = selectedFile;

      // 1. TÖMÖRÍTÉS (Csak ha kép!)
      if (selectedFile.type.startsWith('image/')) {
          console.log(`Eredeti méret: ${selectedFile.size / 1024 / 1024} MB`);
          
          const options = {
            maxSizeMB: 1,           // Max 1 MB dokumentumoknál (jobb olvashatóság miatt nagyobb mint az avatar)
            maxWidthOrHeight: 2048, // Nagyobb felbontás a szöveg olvashatósága miatt
            useWebWorker: true
          }
          
          try {
            fileToUpload = await imageCompression(selectedFile, options);
            console.log(`Tömörített méret: ${fileToUpload.size / 1024 / 1024} MB`);
          } catch (err) {
            console.error("Tömörítési hiba, eredeti fájl használata:", err);
          }
      }

      // 2. FELTÖLTÉS SUPABASE STORAGE-BA (Kliens oldalról)
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      // Mappaszerkezet: user_id/car_id/fájlnév
      const filePath = `${userId}/${carId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('car-documents')
        .upload(filePath, fileToUpload);

      if (uploadError) throw uploadError;

      // 3. ADATOK MENTÉSE AZ ADATBÁZISBA (Server Action hívása)
      const formData = new FormData()
      formData.append('car_id', carId)
      formData.append('name', docLabel || selectedFile.name)
      formData.append('file_path', filePath) // A feltöltött útvonalat küldjük
      formData.append('file_type', selectedFile.type)

      await uploadDocument(formData)
      
      setIsModalOpen(false)
      setSelectedFile(null)
      setDocLabel("")

    } catch (error) {
      console.error(error)
      alert('Hiba történt a feltöltéskor')
    } finally {
      setUploading(false)
    }
  }

  // --- JAVÍTOTT MEGNYITÁS (View) ---
  const openDocument = async (filePath: string) => {
      const newWindow = window.open('', '_blank')
      if (newWindow) {
          newWindow.document.write('<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">Betöltés... Kérlek várj.</div>');
      }

      const url = await getDocumentUrl(filePath, false)

      if (url && newWindow) {
          newWindow.location.href = url
      } else {
          newWindow?.close()
          alert("Nem sikerült betölteni a dokumentumot.")
      }
  }

  // --- JAVÍTOTT LETÖLTÉS (Download) ---
  const downloadDocument = async (e: React.MouseEvent, filePath: string, fileName: string) => {
      e.stopPropagation() 
      
      const url = await getDocumentUrl(filePath, true)

      if (url) {
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', fileName)
          link.setAttribute('target', '_blank')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
      } else {
          alert("Hiba a letöltési link generálásakor.")
      }
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm md:text-base">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            Digitális Kesztyűtartó
          </h3>
          {uploading && <span className="text-xs text-amber-500 animate-pulse font-bold">Feltöltés...</span>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {/* Dokumentumok listázása */}
          {documents.map((doc) => (
            <div key={doc.id} className="group relative border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 md:p-3 flex flex-col justify-between h-20 md:h-24 bg-slate-50 dark:bg-slate-900/50 hover:border-amber-400 dark:hover:border-amber-500 transition-all cursor-pointer" onClick={() => openDocument(doc.file_path)}>
              
              {/* --- AKCIÓ GOMBOK (Jobb felül) --- */}
              <div className="absolute top-1 right-1 z-20 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  
                  {/* Letöltés Gomb */}
                  <button 
                    onClick={(e) => downloadDocument(e, doc.file_path, doc.name)}
                    className="bg-white dark:bg-slate-800 text-slate-500 hover:text-amber-500 p-1.5 rounded-full shadow-md hover:scale-110 transition-transform border border-slate-100 dark:border-slate-700" 
                    title="Letöltés"
                  >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </button>

                  {/* Törlés Gomb */}
                  <form action={deleteDocument} onClick={(e) => e.stopPropagation()}>
                      <input type="hidden" name="doc_id" value={doc.id} />
                      <input type="hidden" name="file_path" value={doc.file_path} />
                      <input type="hidden" name="car_id" value={carId} />
                      <button className="bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 p-1.5 rounded-full shadow-md hover:scale-110 transition-transform border border-slate-100 dark:border-slate-700" title="Törlés">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                  </form>
              </div>

              {/* Dokumentum Ikon és Név */}
              <div className="h-full flex flex-col justify-between pr-6 md:pr-0">
                  <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                      {/* Ikon típus alapján (PDF/Kép) */}
                      {doc.file_type.includes('pdf') ? (
                         <svg className="w-10 md:w-12 h-10 md:h-12 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      ) : (
                         <svg className="w-10 md:w-12 h-10 md:h-12 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate w-full">{doc.name}</span>
                  <span className="text-[10px] md:text-xs font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1">
                      Megnyitás <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </span>
              </div>
            </div>
          ))}

          {/* Feltöltés Gomb */}
          <label className={`border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-amber-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors h-20 md:h-24 bg-slate-50 dark:bg-slate-900/50 cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input 
              type="file" 
              accept="image/*,application/pdf" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {uploading ? (
               <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            ) : (
               <svg className="w-5 md:w-6 h-5 md:h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            )}
            <span className="text-[10px] md:text-xs font-bold">{uploading ? 'Feldolgozás...' : 'Feltöltés'}</span>
          </label>
        </div>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-500">
               <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dokumentum Feltöltése</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dokumentum típusa</label>
                <input 
                  type="text" 
                  value={docLabel}
                  onChange={(e) => setDocLabel(e.target.value)}
                  placeholder="pl. Forgalmi, Biztosítás"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 dark:border-slate-600 transition-all checked:border-amber-500 checked:bg-amber-500 hover:border-amber-400"
                    />
                    <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Hozzájárulok az adatkezeléshez.</span>
                    <br />
                    Elfogadom, hogy a feltöltött dokumentum személyes adatokat tartalmazhat, amelyet a rendszer a <Link href="/privacy-policy" target="_blank" className="text-amber-600 dark:text-amber-500 underline hover:text-amber-700">Adatkezelési Tájékoztató</Link> szerint tárol.
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={handleCancel}
                disabled={uploading}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
              >
                Mégse
              </button>
              <button 
                onClick={handleUploadConfirm}
                disabled={!consentGiven || uploading || !docLabel}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-amber-500/20 text-sm flex items-center justify-center gap-2"
              >
                {uploading ? 'Mentés...' : 'Feltöltés'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}