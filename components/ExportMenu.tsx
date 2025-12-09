'use client'

import { useState } from 'react'
import DealerModal from './DealerModal'
import { generatePersonalPDF } from '@/utils/pdfGenerator' // Ezt majd kiszervezzük, vagy maradhat a korábbi logikád inline

export default function ExportMenu({ car, events }: { car: any, events: any[] }) {
  const [showDealerModal, setShowDealerModal] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Személyes PDF generálása (A korábbi SaleSheetButton logikája egyszerűsítve)
  const handlePersonalExport = async () => {
     // Ide jön a korábbi PDF generáló kódod, ami mindent (szerviz, tankolás) kilistáz
     // Most csak szimuláljuk a hívást, de ide másolhatod a korábbi SaleSheetButton tartalmát
     // csak tankolás szűréssel ha kell.
     alert("Személyes teljes export indítása...") 
  }

  return (
    <>
      <div className="relative">
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl font-bold hover:bg-white/20 transition-all"
        >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span>Export</span>
            <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>

        {isOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                <button 
                    onClick={() => { setIsOpen(false); handlePersonalExport(); }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100"
                >
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Személyes</p>
                        <p className="text-[10px] text-slate-500">Teljes előzmény, tankolások</p>
                    </div>
                </button>

                <button 
                    onClick={() => { setIsOpen(false); setShowDealerModal(true); }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3"
                >
                    <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Kereskedő</p>
                        <p className="text-[10px] text-slate-500">Adatlap, Ár, QR kód</p>
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