'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { CarReportDocument } from './pdf/CarReportDocument'

export default function PdfDownloadButton({ car, events }: { car: any, events: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // A Modal tartalma
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Sötét háttér (kattintásra bezár) */}
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      ></div>
      
      {/* Ablak */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm relative z-10 animate-in fade-in zoom-in duration-200">
        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-1 rounded-full">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="mb-6 text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3 text-amber-600 mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-xl font-black text-slate-900">Riport Exportálása</h3>
          <p className="text-sm text-slate-500 mt-1">Válassz formátumot a letöltéshez.</p>
        </div>

        <div className="space-y-3">
            <DownloadOption type="full" label="Teljes Történet" desc="Minden adat, szerviz és tankolás" car={car} events={events} />
            <DownloadOption type="service" label="Csak Szervizek" desc="Javítások és karbantartások listája" car={car} events={events} />
            <DownloadOption type="fuel" label="Csak Tankolás" desc="Üzemanyag költségek listája" car={car} events={events} />
        </div>
        
        <button onClick={() => setIsOpen(false)} className="w-full mt-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
            Mégse
        </button>
      </div>
    </div>
  )

  if (!mounted) return null

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-3 py-2 rounded-full border border-white/10 hover:bg-white/10"
        title="PDF Exportálás"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        <span className="text-xs font-bold uppercase hidden sm:inline">Export</span>
      </button>

      {/* A Portallal "kicsempésszük" a modalt a body végére */}
      {isOpen && createPortal(modalContent, document.body)}
    </>
  )
}

function DownloadOption({ type, label, desc, car, events }: any) {
  return (
    <PDFDownloadLink
        document={<CarReportDocument car={car} events={events} type={type} />}
        fileName={`DriveSync_${type}_${car.plate}.pdf`}
        className="block w-full no-underline"
    >
        {({ loading }) => (
            <div className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 group ${loading ? 'border-slate-100 bg-slate-50 cursor-wait' : 'border-slate-100 hover:border-amber-500 hover:bg-amber-50 cursor-pointer'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${loading ? 'bg-slate-200' : 'bg-slate-100 group-hover:bg-white group-hover:text-amber-500'} text-slate-500 transition-colors`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </div>
                <div className="text-left">
                    <p className="font-bold text-slate-900 text-sm group-hover:text-amber-700">{loading ? 'Generálás...' : label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                </div>
            </div>
        )}
    </PDFDownloadLink>
  )
}