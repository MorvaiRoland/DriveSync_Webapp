'use client'

import { useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'

// Fontos: Mivel a jsPDF alapból nem tud minden ékezetet tökéletesen, 
// élesben érdemes lehet majd egy custom fontot betölteni, de kezdetnek ez is jó lesz.

export default function SaleSheetButton({ car, events }: { car: any, events: any[] }) {
  const [loading, setLoading] = useState(false)

  const generatePDF = async () => {
    setLoading(true)
    const doc = new jsPDF()

    // --- 1. HEADER & BRANDING ---
    doc.setFillColor(15, 23, 42) // Slate-900 szín
    doc.rect(0, 0, 210, 40, 'F') // Fejléc háttér
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text("DynamicSense", 14, 20)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(245, 158, 11) // Amber-500
    doc.text("HITIELESITETT SZERVIZ TORTENET", 14, 28)

    // --- 2. AUTÓ ADATOK ---
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.text(`${car.make} ${car.model}`, 14, 55)
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Rendszam: ${car.plate}`, 14, 62)
    doc.text(`Evjarat: ${car.year}`, 14, 67)
    doc.text(`Aktualis km: ${car.mileage.toLocaleString()} km`, 14, 72)
    
    // Alvázszám (ha van mező)
    if (car.vin) {
       doc.text(`Alvazszam (VIN): ${car.vin}`, 14, 77)
    }

    doc.text(`Generalas datuma: ${new Date().toLocaleDateString('hu-HU')}`, 14, 85)

    // --- 3. QR KÓD GENERÁLÁS ---
    // Ez a link a publikus (vagy bejelentkezést igénylő) ellenőrző oldalra mutat
    // Fontos: A window.location.origin megadja a domain-t (pl. https://DynamicSense.vercel.app)
    const verifyUrl = `${window.location.origin}/verify/${car.id}`
    
    try {
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 100, margin: 1 })
      // QR Kód kirajzolása a jobb felső sarokba (a sötét fejléc alá)
      doc.addImage(qrDataUrl, 'PNG', 150, 45, 40, 40)
      
      doc.setFontSize(8)
      doc.text("Olvassa be az eredetiseg", 150, 88)
      doc.text("ellenorzesehez", 150, 92)
    } catch (err) {
      console.error("QR Hiba", err)
    }

    // --- 4. TÁBLÁZAT (Szervizek) ---
    // Csak a szerviz típusú eseményeket listázzuk (tankolást nem feltétlenül kell)
    const serviceHistory = events
        .filter(e => e.type === 'service' || e.type === 'repair' || e.type === 'maintenance')
        .map(e => [
            new Date(e.event_date).toLocaleDateString('hu-HU'), 
            e.title || e.service_type || 'Szerviz', 
            e.mileage ? `${e.mileage} km` : '-',
            e.cost ? `${e.cost.toLocaleString()} Ft` : '-'
        ])

    autoTable(doc, {
      startY: 100,
      head: [['Datum', 'Beavatkozas', 'Km Allas', 'Koltseg']],
      body: serviceHistory,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11] }, // Amber fejléc
      styles: { fontSize: 9 },
    })

    // --- 5. LÁBLÉC ---
    const pageCount = doc.getNumberOfPages()
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text('A dokumentum a DynamicSense rendszerével keszult. A papir alapu adatok tajekoztato jelleguek.', 14, 285)
        doc.text(`Oldal ${i} / ${pageCount}`, 190, 285)
    }

    // --- 6. MENTÉS ---
    doc.save(`${car.make}_${car.model}_Eladasi_Adatlap.pdf`)
    setLoading(false)
  }

  return (
    <button 
        onClick={generatePDF}
        disabled={loading}
        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
    >
        {loading ? (
             <span>Generálás...</span>
        ) : (
            <>
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Eladási Adatlap (PDF)</span>
            </>
        )}
    </button>
  )
}