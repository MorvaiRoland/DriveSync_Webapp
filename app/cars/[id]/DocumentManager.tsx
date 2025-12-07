'use client'

import { useState, useRef } from 'react'
import { uploadDocument, deleteDocument, getDocumentUrl } from './actions'
import Link from 'next/link'

type Doc = {
  id: string
  name: string
  file_path: string
  file_type: string
}

export default function DocumentManager({ carId, documents }: { carId: string, documents: Doc[] }) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [docLabel, setDocLabel] = useState("")
  const [consentGiven, setConsentGiven] = useState(false)

  // 1. Fájl kiválasztása -> Modal megnyitása
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setDocLabel(file.name.split('.')[0]) // Alapértelmezett név a fájl neve
    setConsentGiven(false) // Minden új fájlnál újra kell pipálni
    setIsModalOpen(true)
    
    // Input resetelése, hogy ugyanazt a fájlt újra ki lehessen választani ha megszakítják
    e.target.value = ''
  }

  // 2. Mégse gomb
  const handleCancel = () => {
    setIsModalOpen(false)
    setSelectedFile(null)
    setDocLabel("")
    setConsentGiven(false)
  }

  // 3. Feltöltés indítása (csak ha pipálva van)
  const handleUploadConfirm = async () => {
    if (!selectedFile || !consentGiven) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('car_id', carId)
    formData.append('label', docLabel || selectedFile.name)

    try {
      await uploadDocument(formData)
      setIsModalOpen(false) // Modal bezárása siker esetén
    } catch (error) {
      alert('Hiba történt a feltöltéskor')
    } finally {
      setUploading(false)
      setSelectedFile(null)
    }
  }

  const openDocument = async (filePath: string) => {
      const url = await getDocumentUrl(filePath)
      if (url) window.open(url, '_blank')
      else alert("Nem sikerült megnyitni a dokumentumot.")
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
            <div key={doc.id} className="group relative border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 md:p-3 flex flex-col justify-between h-20 md:h-24 bg-slate-50 dark:bg-slate-900/50 hover:border-amber-400 dark:hover:border-amber-500 transition-all">
              
              <form action={deleteDocument} className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <input type="hidden" name="doc_id" value={doc.id} />
                  <input type="hidden" name="file_path" value={doc.file_path} />
                  <input type="hidden" name="car_id" value={carId} />
                  <button className="bg-white dark:bg-slate-800 text-red-500 p-1 rounded-full shadow-md hover:scale-110 transition-transform" title="Törlés">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
              </form>

              <div onClick={() => openDocument(doc.file_path)} className="cursor-pointer h-full flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                      <svg className="w-10 md:w-12 h-10 md:h-12 dark:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2a2 2 0 00-2 2v1h10V4a2 2 0 00-2-2H7zm12 4h-2V4a4 4 0 00-4-4H7a4 4 0 00-4 4v1H1a1 1 0 00-1 1v12a1 1 0 001 1h18a1 1 0 001-1V7a1 1 0 00-1-1zM3 8h14v10H3V8zm2 2v2h10v-2H5zm0 4v2h8v-2H5z"/></svg>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate pr-4">{doc.name}</span>
                  <span className="text-[10px] md:text-xs font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Megnyitás <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </span>
              </div>
            </div>
          ))}

          {/* Feltöltés Gomb (Trigger) */}
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

      {/* --- HIVATALOS ADATVÉDELMI MODAL --- */}
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
              {/* 1. Név megadása */}
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

              {/* 2. Jogi Nyilatkozat (GDPR) */}
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

            {/* Gombok */}
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