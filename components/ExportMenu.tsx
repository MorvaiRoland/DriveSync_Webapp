'use client'

import { useState } from 'react'
import DealerModal from './DealerModal'
import { generatePersonalPDF } from '@/utils/pdfGenerator'

export default function ExportMenu({ car, events }: { car: any, events: any[] }) {
  const [showDealerModal, setShowDealerModal] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handlePersonalExport = async () => {
     setIsGenerating(true)
     try {
        await generatePersonalPDF(car, events)
     } catch (error) {
        console.error(error)
        alert('Hiba történt a PDF generálása közben.')
     } finally {
        setIsGenerating(false)
        setIsOpen(false)
     }
  }

  return (
    <>
      <div className="relative">
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl font-bold hover:bg-white/20 transition-all h-[40px]"
        >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span>Export</span>
            <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>

        {isOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                
                {/* SZEMÉLYES EXPORT */}
                <button 
                    onClick={handlePersonalExport}
                    disabled={isGenerating}
                    className="w-full text-left px-4 py-4 hover:bg-slate-50 flex items-center gap-4 border-b border-slate-100 transition-colors disabled:opacity-50"
                >
                    <div className="bg-blue-100 text-blue-600 p-2.5 rounded-xl shrink-0">
                        {isGenerating ? (
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Személyes Riport</p>
                        <p className="text-[11px] text-slate-500 leading-tight">Teljes szerviztörténet és tankolási napló saját használatra.</p>
                    </div>
                </button>

                {/* KERESKEDŐI EXPORT */}
                <button 
                    onClick={() => { setIsOpen(false); setShowDealerModal(true); }}
                    className="w-full text-left px-4 py-4 hover:bg-slate-50 flex items-center gap-4 transition-colors"
                >
                    <div className="bg-amber-100 text-amber-600 p-2.5 rounded-xl shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Kereskedői Adatlap</p>
                        <p className="text-[11px] text-slate-500 leading-tight">Eladásra készített adatlap QR kóddal, árral és extrákkal.</p>
                    </div>
                </button>
            </div>
        )}
      </div>

      {showDealerModal && (
        <DealerModal car={car} onClose={() => setShowDealerModal(false)} />
      )}
    </>
  )
}