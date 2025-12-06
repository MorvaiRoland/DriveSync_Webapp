'use client'

import { useState, useEffect } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { CarReportDocument } from './pdf/CarReportDocument'

export default function PdfDownloadButton({ car, events }: { car: any, events: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isClient, setIsClient] = useState(false) // Hydration fix

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null // Csak kliens oldalon renderelünk

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-3 py-2 rounded-full border border-white/10 hover:bg-white/10"
        title="PDF Riport"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        <span className="text-xs font-bold uppercase hidden sm:inline">Export</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm relative">
              <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <h3 className="text-xl font-black text-slate-900 mb-2">Riport Generálása</h3>
              <p className="text-sm text-slate-500 mb-6">Válaszd ki, milyen adatokat szeretnél a PDF-ben látni.</p>

              <div className="space-y-3">
                 <DownloadOption type="full" label="Teljes Történet" desc="Minden adat, szerviz és tankolás" car={car} events={events} />
                 <DownloadOption type="service" label="Csak Szervizek" desc="Javítások és karbantartások listája" car={car} events={events} />
                 <DownloadOption type="fuel" label="Csak Tankolás" desc="Üzemanyag költségek listája" car={car} events={events} />
              </div>
           </div>
        </div>
      )}
    </>
  )
}

function DownloadOption({ type, label, desc, car, events }: any) {
  return (
    <PDFDownloadLink
        document={<CarReportDocument car={car} events={events} type={type} />}
        fileName={`DriveSync_${type}_${car.plate}.pdf`}
        className="block w-full"
    >
        {({ loading }) => (
            <div className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${loading ? 'border-slate-100 bg-slate-50 cursor-wait' : 'border-slate-100 hover:border-amber-500 hover:bg-amber-50 cursor-pointer'}`}>
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </div>
                <div className="text-left">
                    <p className="font-bold text-slate-900 text-sm">{loading ? 'Generálás...' : label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                </div>
            </div>
        )}
    </PDFDownloadLink>
  )
}