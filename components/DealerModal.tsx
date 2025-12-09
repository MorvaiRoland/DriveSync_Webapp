// components/DealerModal.tsx
'use client'

import { useState } from 'react'
import { updateDealerInfo } from '@/app/cars/[id]/actions'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export default function DealerModal({ car, onClose }: { car: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false)

  const handleSaveAndGenerate = async (formData: FormData) => {
    setLoading(true)
    
    // 1. Mentés
    try {
        await updateDealerInfo(formData)
    } catch (error) {
        console.error("Mentési hiba:", error)
    }

    // 2. PDF Generálás
    try {
        const doc = new jsPDF()
        
        // Font betöltése
        const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
        const fontRes = await fetch(fontUrl);
        const fontBuffer = await fontRes.arrayBuffer();
        doc.addFileToVFS('Roboto-Regular.ttf', arrayBufferToBase64(fontBuffer));
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.setFont('Roboto');

        // --- PDF DESIGN ---
        doc.setFillColor(15, 23, 42) // Slate-900
        doc.rect(0, 0, 210, 60, 'F') // Nagyobb fejléc
        
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(30)
        doc.text(`${car.make} ${car.model}`, 105, 25, { align: 'center' })
        
        const engine = formData.get('engine_details') as string
        if (engine) {
            doc.setFontSize(16)
            doc.setTextColor(245, 158, 11) // Amber
            doc.text(engine, 105, 40, { align: 'center' })
        }

        const priceVal = formData.get('price') as string
        if (priceVal) {
            const price = parseInt(priceVal).toLocaleString()
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(50) 
            doc.text(`${price} Ft`, 105, 90, { align: 'center' })
        }

        doc.setFontSize(14)
        doc.setTextColor(80, 80, 80)
        const yStart = 120
        
        // Bal oszlop adatok
        doc.text(`Évjárat:`, 30, yStart)
        doc.setFontSize(14); doc.setTextColor(0,0,0); 
        doc.text(`${car.year}`, 70, yStart); doc.setTextColor(80,80,80);

        doc.text(`Üzemanyag:`, 30, yStart + 15)
        doc.setFontSize(14); doc.setTextColor(0,0,0);
        doc.text(`${car.fuel_type}`, 70, yStart + 15); doc.setTextColor(80,80,80);

        // Jobb oszlop adatok
        doc.text(`Futásteljesítmény:`, 110, yStart)
        doc.setFontSize(14); doc.setTextColor(0,0,0);
        doc.text(`${car.mileage.toLocaleString()} km`, 160, yStart); doc.setTextColor(80,80,80);

        doc.text(`Váltó:`, 110, yStart + 15)
        doc.setFontSize(14); doc.setTextColor(0,0,0);
        doc.text(`${formData.get('transmission') || '-'}`, 160, yStart + 15); doc.setTextColor(80,80,80);
        
        // Extrák
        const features = (formData.get('features') as string)?.split(',')
        if (features && features.length > 0 && features[0] !== "") {
            doc.setFontSize(16)
            doc.setTextColor(0, 0, 0)
            doc.text("Kiemelt Felszereltség:", 105, yStart + 45, { align: 'center' })
            
            doc.setFontSize(12)
            doc.setTextColor(50, 50, 50)
            let yFeat = yStart + 60
            let xPos = 40
            
            features.forEach((feat, i) => {
                if(feat.trim()) {
                    // Két oszlopba rendezés
                    if (i % 2 === 0) xPos = 40; else xPos = 120;
                    doc.text(`• ${feat.trim()}`, xPos, yFeat)
                    if (i % 2 !== 0) yFeat += 10;
                }
            })
        }

        // QR Kód
        const verifyUrl = `${window.location.origin}/verify/${car.id}`
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 200, margin: 1 })
        
        const pageHeight = doc.internal.pageSize.height;
        doc.addImage(qrDataUrl, 'PNG', 80, pageHeight - 80, 50, 50)
        
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text("Szkennelje be a hitelesített szerviztörténetért!", 105, pageHeight - 20, { align: 'center' })
        
        doc.save(`${car.make}_Kereskedoi_Adatlap.pdf`)
        onClose()

    } catch (err) {
        console.error("PDF Hiba:", err)
        alert('Hiba történt a generáláskor.')
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-8">
        
        {/* MODAL KONTÉNER: Most már max-w-4xl (szélesebb) */}
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[95vh]">
            
            {/* FEJLÉC */}
            <div className="bg-slate-950 px-8 py-6 flex justify-between items-center shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="bg-amber-500 p-2 rounded-lg">
                        <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-2xl tracking-tight">Kereskedői Adatlap</h3>
                        <p className="text-slate-400 text-sm">Állítsd be az eladási paramétereket a nyomtatáshoz.</p>
                    </div>
                </div>
                <button onClick={onClose} className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full p-2 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            
            {/* TARTALOM (Görgethető) */}
            <form action={handleSaveAndGenerate} className="flex-1 overflow-y-auto bg-slate-50/50">
                <input type="hidden" name="id" value={car.id} />
                
                <div className="p-8 space-y-8">
                    
                    {/* 1. SZEKCIÓ: Ár és Teljesítmény */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h4 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            Piaci Adatok
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Eladási Ár</label>
                                <div className="relative group">
                                    <input 
                                        name="price" 
                                        type="number" 
                                        defaultValue={car.price} 
                                        className="w-full rounded-xl border-slate-300 bg-slate-50 py-4 pl-5 pr-16 focus:ring-amber-500 focus:border-amber-500 font-black text-2xl text-slate-900 shadow-sm group-hover:border-amber-400 transition-colors" 
                                        placeholder="0" 
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-slate-400 font-bold uppercase tracking-wider">HUF</div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Motorteljesítmény</label>
                                <div className="relative group">
                                    <input 
                                        name="performance_hp" 
                                        type="number" 
                                        defaultValue={car.performance_hp} 
                                        className="w-full rounded-xl border-slate-300 bg-slate-50 py-4 pl-5 pr-16 focus:ring-amber-500 focus:border-amber-500 font-black text-2xl text-slate-900 shadow-sm group-hover:border-amber-400 transition-colors" 
                                        placeholder="0" 
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-slate-400 font-bold uppercase tracking-wider">LE</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. SZEKCIÓ: Műszaki Adatok */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h4 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            Specifikáció
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Motor pontos megnevezése</label>
                                <input 
                                    name="engine_details" 
                                    type="text" 
                                    defaultValue={car.engine_details} 
                                    className="w-full rounded-xl border-slate-300 bg-slate-50 py-3 px-4 focus:ring-blue-500 focus:border-blue-500 font-medium" 
                                    placeholder="Pl. 2.0 TDI BlueMotion" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sebességváltó</label>
                                <div className="relative">
                                    <select 
                                        name="transmission" 
                                        defaultValue={car.transmission} 
                                        className="w-full rounded-xl border-slate-300 bg-slate-50 py-3 px-4 focus:ring-blue-500 focus:border-blue-500 appearance-none font-medium"
                                    >
                                        <option value="Manuális">Manuális</option>
                                        <option value="Automata">Automata</option>
                                        <option value="Félautomata">Félautomata (DSG/DCT)</option>
                                        <option value="Fokozatmentes">Fokozatmentes (CVT)</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. SZEKCIÓ: Extrák */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h4 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L17 21l-5-5.714L7 21l5.714-5.786L1 12l6.857-3.214L10 3z" /></svg>
                            Felszereltség
                        </h4>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Extrák listája (vesszővel elválasztva)</label>
                            <textarea 
                                name="features" 
                                defaultValue={car.features?.join(', ')} 
                                className="w-full rounded-xl border-slate-300 bg-slate-50 p-4 h-32 text-sm focus:ring-emerald-500 focus:border-emerald-500 leading-relaxed" 
                                placeholder="Pl. Digitklíma, Ülésfűtés, Tolatóradar, LED fényszóró, Tempomat, Sávtartó..."
                            ></textarea>
                            <p className="text-[11px] text-slate-400 mt-2 ml-1">Ezek jelennek meg felsorolásként a nyomtatott adatlapon.</p>
                        </div>
                    </div>

                </div>

                {/* FOOTER - Rögzített az alján mobilon is */}
                <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex justify-between items-center z-10">
                    <button type="button" onClick={onClose} className="text-slate-500 font-bold hover:text-slate-800 px-4 py-2 transition-colors">
                        Mégsem
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xl shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-3 transition-all transform active:scale-95"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Feldolgozás...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                Mentés és PDF Nyomtatás
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    </div>
  )
}